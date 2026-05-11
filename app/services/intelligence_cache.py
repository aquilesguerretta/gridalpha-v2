"""TTL cache for intelligence endpoints + PJM DataMiner auth.

PJM Data Miner 2 has two distinct surfaces:

  * ``dataminer2.pjm.com`` - browser SPA. Hosts a public settings file
    at ``/config/settings.json`` that exposes a shared 32-char Azure
    APIM subscription key. This key authenticates all public PJM
    feeds (Real-Time LMPs, DA LMPs, gen mix, load, outages summary,
    ancillary services, ...) - no user account required.
  * ``api.pjm.com``        - Azure APIM gateway every dataset call
    actually hits. Accepts ONLY the header
    ``Ocp-Apim-Subscription-Key`` - the SSO cookie is rejected.

V1 (gridalpha-production) is the existence proof: it fetches the
public key once on boot from settings.json and uses it as the bearer.
V2 now does the same. The ForgeRock SSO flow this module used to do
authenticated only the dataminer2 SPA, never api.pjm.com, which is
why every V2 PJM call was failing with 401/404 before this change.

Environment (optional overrides):
  ``PJM_SUBSCRIPTION_KEY`` - explicit override; bypasses the
    settings.json bootstrap. Use only if you have a private key.
  ``PJM_SETTINGS_URL`` - override the settings endpoint (default
    ``http://dataminer2.pjm.com/config/settings.json``).

The legacy ``PJM_USERNAME`` / ``PJM_PASSWORD`` / ``PJM_SSO_*`` vars
are still read for backwards compatibility but no longer affect
api.pjm.com auth.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any, Awaitable, Callable, TypeVar

import httpx

LOG = logging.getLogger("gridalpha.pjm-auth")

T = TypeVar("T")

_store: dict[str, tuple[float, Any]] = {}

# ── PJM auth state ──────────────────────────────────────────────────────────

# Public subscription key bootstrapped from dataminer2 settings.json.
# Refreshed periodically; PJM has rotated the key in the past, so we
# don't pin it permanently. The legacy SSO state below is retained for
# diagnostic continuity but no longer drives api.pjm.com auth.
_PJM_LOCK = asyncio.Lock()
_pjm_public_key: str | None = None
_pjm_public_key_ts: float = 0.0
_PJM_PUBLIC_KEY_TTL_SEC = 6 * 3600.0  # 6h - PJM rotates rarely

_pjm_token_id: str | None = None
_pjm_token_ts: float = 0.0
_PJM_TOKEN_TTL_SEC = 1200.0


class PJMAuthenticationError(Exception):
    """Failed PJM SSO login or unexpected challenge stage."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def _env(name: str) -> str:
    return os.environ.get(name, "").strip()


def _pjm_settings_url() -> str:
    return (
        _env("PJM_SETTINGS_URL")
        or "http://dataminer2.pjm.com/config/settings.json"
    )


def _pjm_sso_url() -> str:
    return _env("PJM_SSO_AUTH_URL") or "https://sso.pjm.com/access/authenticate"


def _pjm_session_cookie_name() -> str:
    return _env("PJM_SESSION_COOKIE_NAME") or "iPlanetDirectoryPro"


def _pjm_cookie_header(token_id: str) -> dict[str, str]:
    name = _pjm_session_cookie_name()
    return {"Cookie": f"{name}={token_id}"}


async def _fetch_pjm_public_key() -> str:
    """Fetch the public APIM key PJM ships in its front-end settings.

    PJM bakes a shared subscription key into the ``dataminer2.pjm.com``
    SPA at ``/config/settings.json`` so the public LMP / fuel-mix /
    load / outage / ancillary feeds can be reached without a user
    account. This is the same mechanism V1 (gridalpha-production) uses.
    """
    url = _pjm_settings_url()
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": (
                    "Mozilla/5.0 (compatible; GridAlpha/2.0; "
                    "+https://gridalpha.vercel.app)"
                ),
            },
        )
        r.raise_for_status()
        body = r.json()
    key = str(body.get("subscriptionKey") or "").strip()
    if not key:
        raise PJMAuthenticationError(
            f"PJM settings.json at {url} returned no subscriptionKey"
        )
    LOG.info(
        "PJM public key bootstrapped from settings.json (%d chars)", len(key)
    )
    return key


async def _pjm_sso_login() -> str:
    user = _env("PJM_USERNAME")
    pwd = _env("PJM_PASSWORD")
    if not user or not pwd:
        raise PJMAuthenticationError(
            "PJM_USERNAME and PJM_PASSWORD must be set for PJM DataMiner API access"
        )

    url = _pjm_sso_url()
    async with httpx.AsyncClient(timeout=45.0) as client:
        r1 = await client.post(url, json={})
        r1.raise_for_status()
        d1 = r1.json()
        auth_id = d1.get("authId")
        callbacks = d1.get("callbacks")
        if not auth_id or not isinstance(callbacks, list):
            raise PJMAuthenticationError("PJM SSO: unexpected first-step response")

        for cb in callbacks:
            if not isinstance(cb, dict):
                continue
            ctype = cb.get("type")
            inputs = cb.get("input")
            if not isinstance(inputs, list) or not inputs:
                continue
            if ctype == "NameCallback":
                inputs[0]["value"] = user
            elif ctype == "PasswordCallback":
                inputs[0]["value"] = pwd

        r2 = await client.post(
            url,
            json={"authId": auth_id, "callbacks": callbacks},
        )

        if r2.status_code == 401:
            raise PJMAuthenticationError(
                "PJM SSO: invalid username or password (or expired account)"
            )

        r2.raise_for_status()
        d2 = r2.json()

        token_id = d2.get("tokenId")
        if token_id:
            return str(token_id)

        if d2.get("callbacks"):
            raise PJMAuthenticationError(
                "PJM SSO: extra authentication step required (e.g. MFA); "
                "not supported in this client"
            )

        raise PJMAuthenticationError(
            f"PJM SSO: login did not return tokenId (keys: {list(d2.keys())})"
        )


async def pjm_auth_headers(*, force_refresh: bool = False) -> dict[str, str]:
    """Headers to authenticate DataMiner HTTP calls to ``api.pjm.com``.

    Resolution order:
      1. ``PJM_SUBSCRIPTION_KEY`` env var if set (manual override)
      2. Bootstrap from ``dataminer2.pjm.com/config/settings.json``
         and cache for 6 hours (V1's pattern)

    ``force_refresh`` re-fetches the public key. Used by ``_pjm_fetch``
    after a 401 in case PJM rotated the key.
    """
    global _pjm_public_key, _pjm_public_key_ts

    explicit = _env("PJM_SUBSCRIPTION_KEY")
    if explicit:
        return {"Ocp-Apim-Subscription-Key": explicit}

    now = time.time()
    async with _PJM_LOCK:
        if (
            not force_refresh
            and _pjm_public_key
            and (now - _pjm_public_key_ts) < _PJM_PUBLIC_KEY_TTL_SEC
        ):
            return {"Ocp-Apim-Subscription-Key": _pjm_public_key}
        try:
            key = await _fetch_pjm_public_key()
        except (httpx.HTTPError, ValueError) as e:
            raise PJMAuthenticationError(
                f"could not bootstrap PJM public key from settings.json: {e}"
            ) from e
        _pjm_public_key = key
        _pjm_public_key_ts = now
        return {"Ocp-Apim-Subscription-Key": key}


async def get_cached(
    key: str,
    ttl_seconds: float,
    factory: Callable[[], Awaitable[T]],
) -> T:
    now = time.time()
    hit = _store.get(key)
    if hit is not None and now - hit[0] < ttl_seconds:
        return hit[1]  # type: ignore[return-value]
    data = await factory()
    _store[key] = (now, data)
    return data
