"""Temporary diagnostic endpoint - dumps the raw PJM response.

Wave-5 frontend agents are blocked on a confusing PJM 404 from V2.
This module hits PJM exactly the way ``intelligence_data._pjm_fetch``
does (same URL pattern, same auth headers, same query params) and
returns the full HTTP envelope as JSON so we can see what PJM is
actually saying it can't find.

Remove this router once the request shape is fixed and committed.
"""

from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import APIRouter, Query

from app.services.intelligence_cache import (
    PJMAuthenticationError,
    pjm_auth_headers,
)
from app.services.intelligence_data import USER_AGENT
from app.services.pjm_zones import ZONES, pnode_name_for

router = APIRouter(prefix="/api/_debug", tags=["_debug"])

# Public knob - set DEBUG_PJM=1 on Railway to enable, otherwise the
# router 404s. Keeps the endpoint inert in case anyone forgets to
# remove it after the fix lands.
def _enabled() -> bool:
    return os.environ.get("DEBUG_PJM", "").strip() == "1"


_DEFAULT_FIELDS = (
    "datetime_beginning_utc,datetime_beginning_ept,pnode_name,"
    "total_lmp_rt,system_energy_price_rt,congestion_price_rt,"
    "marginal_loss_price_rt"
)


@router.get("/pjm-probe")
async def pjm_probe(
    dataset: str = Query("rt_unverified_fivemin_lmps"),
    zone: str | None = Query(None, description="Contract zone id, mapped to pnode_name"),
    pnode_name: str | None = Query(None, description="Override pnode_name verbatim"),
    fields: str = Query(_DEFAULT_FIELDS),
    rowCount: str = Query("12"),
    raw: bool = Query(False, description="If true, do NOT pre-fill any params"),
) -> dict[str, Any]:
    if not _enabled():
        return {"detail": "set DEBUG_PJM=1 on the V2 service to enable", "enabled": False}

    base = "https://api.pjm.com/api/v1"
    url = f"{base}/{dataset}"

    params: dict[str, str] = {}
    if not raw:
        params["rowCount"] = rowCount
        params["fields"] = fields
        if zone:
            try:
                params["pnode_name"] = pnode_name_for(zone)
            except KeyError:
                return {"detail": f"unknown zone id: {zone}"}
        if pnode_name:
            params["pnode_name"] = pnode_name

    auth_summary: dict[str, Any] = {"mode": "unknown"}
    try:
        auth = await pjm_auth_headers()
        if "Ocp-Apim-Subscription-Key" in auth:
            auth_summary = {"mode": "subscription_key", "header_present": True}
        else:
            cookie = auth.get("Cookie", "")
            auth_summary = {
                "mode": "sso_cookie",
                "cookie_name": cookie.split("=", 1)[0] if "=" in cookie else "",
                "cookie_token_length": len(cookie.split("=", 1)[1]) if "=" in cookie else 0,
            }
    except PJMAuthenticationError as e:
        return {
            "step": "auth",
            "error": str(e),
            "url": url,
            "params": params,
        }

    async with httpx.AsyncClient(timeout=45.0) as client:
        request = client.build_request(
            "GET",
            url,
            params=params,
            headers={
                **auth,
                "Accept": "application/json",
                "User-Agent": USER_AGENT,
            },
        )
        sent_url = str(request.url)
        try:
            r = await client.send(request)
        except httpx.RequestError as e:
            return {
                "step": "send",
                "error": type(e).__name__ + ": " + str(e),
                "url": sent_url,
            }

    body_text = r.text
    body_json: Any = None
    try:
        body_json = r.json()
    except (ValueError, TypeError):
        pass

    return {
        "step": "complete",
        "request": {
            "url": sent_url,
            "method": "GET",
            "dataset": dataset,
            "params_sent": dict(request.url.params),
            "auth": auth_summary,
            "user_agent": USER_AGENT,
        },
        "response": {
            "status_code": r.status_code,
            "reason_phrase": r.reason_phrase,
            "headers": dict(r.headers),
            "body_text_first_2000": body_text[:2000],
            "body_text_length": len(body_text),
            "body_json": body_json,
        },
        "zone_catalog": {
            "PSEG_pnode_name": ZONES["PSEG"]["pnode_name"],
            "WEST_HUB_pnode_name": ZONES["WEST_HUB"]["pnode_name"],
        },
    }
