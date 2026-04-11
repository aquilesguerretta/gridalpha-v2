"""TTL cache for intelligence endpoints + PJM DataMiner session auth (ForgeRock SSO).

PJM Tools credentials authenticate against ``sso.pjm.com`` (OpenAM-style REST).
The returned ``tokenId`` is sent to ``api.pjm.com`` as the session cookie
(``iPlanetDirectoryPro`` by default). Override with ``PJM_SESSION_COOKIE_NAME`` if needed.

Environment (Railway / server):
  ``PJM_USERNAME``, ``PJM_PASSWORD`` — required for PJM API calls.
  ``PJM_SSO_AUTH_URL`` — optional; default ``https://sso.pjm.com/access/authenticate``.
  ``PJM_SESSION_COOKIE_NAME`` — optional; default ``iPlanetDirectoryPro``.
"""

from __future__ import annotations

import asyncio
import os
import time
from typing import Any, Awaitable, Callable, TypeVar

import httpx

T = TypeVar("T")

_store: dict[str, tuple[float, Any]] = {}

# ── PJM SSO session (cached tokenId) ─────────────────────────────────────────

_PJM_LOCK = asyncio.Lock()
_pjm_token_id: str | None = None
_pjm_token_ts: float = 0.0
_PJM_TOKEN_TTL_SEC = 1200.0  # refresh before typical AM session skew


class PJMAuthenticationError(Exception):
    """Failed PJM SSO login or unexpected challenge stage."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def _env(name: str) -> str:
    return os.environ.get(name, "").strip()


def _pjm_sso_url() -> str:
    return _env("PJM_SSO_AUTH_URL") or "https://sso.pjm.com/access/authenticate"


def _pjm_session_cookie_name() -> str:
    return _env("PJM_SESSION_COOKIE_NAME") or "iPlanetDirectoryPro"


def _pjm_cookie_header(token_id: str) -> dict[str, str]:
    name = _pjm_session_cookie_name()
    return {"Cookie": f"{name}={token_id}"}


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
    """Headers to authenticate DataMiner HTTP calls to ``api.pjm.com``."""
    global _pjm_token_id, _pjm_token_ts
    now = time.time()
    async with _PJM_LOCK:
        if (
            not force_refresh
            and _pjm_token_id
            and (now - _pjm_token_ts) < _PJM_TOKEN_TTL_SEC
        ):
            return _pjm_cookie_header(_pjm_token_id)
        token = await _pjm_sso_login()
        _pjm_token_id = token
        _pjm_token_ts = now
        return _pjm_cookie_header(token)


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
