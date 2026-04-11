"""
Sprint 3B/3C data fetchers: PJM, EIA, Tomorrow.io, HIFLD.
Uses httpx async + intelligence_cache.get_cached.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlencode

import httpx

from app.services.intelligence_cache import (
    PJMAuthenticationError,
    get_cached,
    pjm_auth_headers,
)

USER_AGENT = (
    "Mozilla/5.0 (compatible; GridAlpha/2.0; +https://gridalpha.vercel.app)"
)


class ConfigurationError(Exception):
    """Missing env var or upstream misconfiguration."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def _env(name: str) -> str:
    v = os.environ.get(name, "").strip()
    return v


def _eia_key() -> str:
    k = _env("EIA_API_KEY")
    if not k:
        raise ConfigurationError("EIA_API_KEY is not set")
    return k


def _tomorrow_key() -> str:
    k = _env("TOMORROW_API_KEY")
    if not k:
        raise ConfigurationError("TOMORROW_API_KEY is not set")
    return k


def _pjm_items(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        if "items" in data and isinstance(data["items"], list):
            return data["items"]
        for v in data.values():
            if isinstance(v, list) and v and isinstance(v[0], dict):
                return v
    return []


def _fnum(x: Any) -> float:
    try:
        if x is None:
            return 0.0
        return float(x)
    except (TypeError, ValueError):
        return 0.0


async def _pjm_fetch(path: str, params: dict[str, str]) -> list[dict[str, Any]]:
    url = f"https://api.pjm.com/api/v1/{path}"
    for attempt in range(2):
        try:
            auth = await pjm_auth_headers(force_refresh=(attempt > 0))
        except PJMAuthenticationError as e:
            raise ConfigurationError(e.message) from e
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.get(
                url,
                params=params,
                headers={
                    **auth,
                    "Accept": "application/json",
                    "User-Agent": USER_AGENT,
                },
            )
        if r.status_code == 401 and attempt == 0:
            continue
        r.raise_for_status()
        return _pjm_items(r.json())
    raise RuntimeError("PJM fetch: auth retry exhausted unexpectedly")


# ── PJM atlas ────────────────────────────────────────────────────────────────


async def fetch_generation_fuel() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        rows = await _pjm_fetch(
            "gen_by_fuel",
            {
                "rowCount": "100",
                "fields": "datetime_beginning_ept,fuel_type,mw",
            },
        )
        if not rows:
            return {"timestamp": "", "fuels": []}
        latest = max(
            (str(r.get("datetime_beginning_ept") or "") for r in rows),
            default="",
        )
        by_fuel: dict[str, float] = {}
        for r in rows:
            if str(r.get("datetime_beginning_ept") or "") != latest:
                continue
            ft = str(r.get("fuel_type") or "Other").strip() or "Other"
            by_fuel[ft] = by_fuel.get(ft, 0.0) + _fnum(r.get("mw"))
        fuels = [{"type": k, "mw": round(v, 2)} for k, v in sorted(by_fuel.items())]
        return {"timestamp": latest, "fuels": fuels}

    return await get_cached("atlas:generation_fuel", 300, load)


async def fetch_binding_constraints() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        rows = await _pjm_fetch(
            "da_marginal_value",
            {
                "rowCount": "50",
                "fields": "datetime_beginning_ept,constraint_name,shadow_price,contingency_name",
            },
        )
        constraints = []
        for r in rows[:50]:
            constraints.append(
                {
                    "name": str(r.get("constraint_name") or ""),
                    "shadow_price": _fnum(r.get("shadow_price")),
                    "contingency": str(r.get("contingency_name") or ""),
                }
            )
        ts = str(rows[0].get("datetime_beginning_ept") or "") if rows else ""
        return {"timestamp": ts, "constraints": constraints}

    return await get_cached("atlas:binding_constraints", 300, load)


async def fetch_interface_flows() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        rows = await _pjm_fetch(
            "transfer_interfaces",
            {
                "rowCount": "50",
                "fields": "datetime_beginning_ept,interface_name,actual_flow,max_flow",
            },
        )
        flows = []
        for r in rows[:50]:
            actual = _fnum(r.get("actual_flow"))
            mx = _fnum(r.get("max_flow"))
            pct = (abs(actual) / mx) if mx else 0.0
            flows.append(
                {
                    "name": str(r.get("interface_name") or ""),
                    "actual_mw": round(actual, 2),
                    "max_mw": round(mx, 2),
                    "pct_loading": round(pct, 4),
                }
            )
        return {"flows": flows}

    return await get_cached("atlas:interface_flows", 300, load)


async def fetch_outages() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        rows = await _pjm_fetch(
            "gen_outages_by_type",
            {
                "rowCount": "200",
                "fields": "datetime_beginning_ept,fuel_type,outage_mw,reason",
            },
        )
        outages = []
        for r in rows[:200]:
            outages.append(
                {
                    "fuel_type": str(r.get("fuel_type") or ""),
                    "mw": _fnum(r.get("outage_mw")),
                    "reason": str(r.get("reason") or ""),
                    "datetime": str(r.get("datetime_beginning_ept") or ""),
                }
            )
        return {"outages": outages}

    return await get_cached("atlas:outages", 1800, load)


# ── HIFLD GeoJSON ────────────────────────────────────────────────────────────

_SUBSTATIONS_QUERY = {
    "where": "STATE IN ('PA','OH','WV','VA','MD','DE','NJ','IL','IN','KY','MI')",
    "outFields": "NAME,STATE,VOLTAGE,LINES",
    "geometry": "-90,36,-73,43",
    "geometryType": "esriGeometryEnvelope",
    "f": "geojson",
    "outSR": "4326",
}

_PIPELINES_QUERY = {
    "where": "1=1",
    "outFields": "NAME,OPERATOR,CAPACITY",
    "geometry": "-90,36,-73,43",
    "geometryType": "esriGeometryEnvelope",
    "f": "geojson",
    "outSR": "4326",
}

_SUB_BASE = (
    "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/"
    "Electric_Substations/FeatureServer/0/query"
)
_PIPE_BASE = (
    "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/"
    "Natural_Gas_Interstate_and_Intrastate_Pipelines/FeatureServer/0/query"
)


async def fetch_substations_geojson() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        q = urlencode(_SUBSTATIONS_QUERY)
        url = f"{_SUB_BASE}?{q}"
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            return r.json()

    return await get_cached("atlas:substations", 86400, load)


async def fetch_gas_pipelines_geojson() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        q = urlencode(_PIPELINES_QUERY)
        url = f"{_PIPE_BASE}?{q}"
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.get(url, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            return r.json()

    return await get_cached("atlas:gas_pipelines", 86400, load)


# ── EIA ──────────────────────────────────────────────────────────────────────


async def fetch_henry_hub() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        key = _eia_key()
        params = [
            ("api_key", key),
            ("frequency", "daily"),
            ("data[0]", "value"),
            ("facets[series][]", "N9HHNGSPOT"),
            ("sort[0][column]", "period"),
            ("sort[0][direction]", "desc"),
            ("length", "30"),
        ]
        url = "https://api.eia.gov/v2/natural-gas/pri/sum/data/"
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(url, params=params, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            body = r.json()
        data = (body.get("response") or {}).get("data") or []
        prices_30d_desc: list[dict[str, Any]] = []
        for row in data:
            period = str(row.get("period") or "")
            val = _fnum(row.get("value"))
            if period:
                prices_30d_desc.append({"date": period, "price": val})
        current = prices_30d_desc[0]["price"] if prices_30d_desc else 0.0
        change_pct = 0.0
        if len(prices_30d_desc) >= 2:
            prev = prices_30d_desc[1]["price"]
            if prev:
                change_pct = round((current - prev) / prev * 100.0, 2)
        prices_30d = list(reversed(prices_30d_desc))
        return {
            "current_price_mmbtu": round(current, 4),
            "prices_30d": prices_30d,
            "change_pct": change_pct,
        }

    return await get_cached("energy:henry_hub", 3600, load)


async def fetch_electricity_prices() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        key = _eia_key()
        params = [
            ("api_key", key),
            ("frequency", "hourly"),
            ("data[0]", "value"),
            ("facets[respondent][]", "PJM"),
            ("sort[0][column]", "period"),
            ("sort[0][direction]", "desc"),
            ("length", "500"),
        ]
        url = "https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/"
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(url, params=params, headers={"User-Agent": USER_AGENT})
            r.raise_for_status()
            body = r.json()
        rows = (body.get("response") or {}).get("data") or []
        seen: set[tuple[str, str]] = set()
        fuel_mix_24h: list[dict[str, Any]] = []
        for row in rows:
            period = str(row.get("period") or "")
            fuel = str(
                row.get("fueltype")
                or row.get("type-name")
                or row.get("type_name")
                or row.get("fuel_type")
                or "unknown"
            )
            keyp = (period, fuel)
            if keyp in seen:
                continue
            seen.add(keyp)
            fuel_mix_24h.append(
                {
                    "period": period,
                    "fuel_type": fuel,
                    "mw": _fnum(row.get("value")),
                }
            )
            if len(fuel_mix_24h) >= 200:
                break
        return {"fuel_mix_24h": fuel_mix_24h}

    return await get_cached("energy:electricity_prices", 900, load)


# ── Tomorrow.io ─────────────────────────────────────────────────────────────

PJM_WEATHER_POINTS: list[tuple[float, float, str]] = [
    (40.44, -79.99, "Pittsburgh"),
    (39.95, -75.16, "Philadelphia"),
    (39.29, -76.61, "Baltimore"),
    (41.88, -87.63, "Chicago"),
    (41.50, -81.69, "Cleveland"),
    (39.96, -82.99, "Columbus"),
    (37.54, -77.44, "Richmond"),
    (38.35, -81.63, "Charleston WV"),
    (40.27, -76.88, "Harrisburg"),
]


def _realtime_values(payload: dict[str, Any]) -> dict[str, Any]:
    data = payload.get("data") or {}
    return data.get("values") or {}


async def fetch_weather_current() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        apikey = _tomorrow_key()
        points = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for lat, lon, label in PJM_WEATHER_POINTS:
                loc = f"{lat},{lon}"
                r = await client.get(
                    "https://api.tomorrow.io/v4/weather/realtime",
                    params={
                        "location": loc,
                        "units": "metric",
                        "apikey": apikey,
                    },
                    headers={
                        "User-Agent": USER_AGENT,
                        "Accept-Encoding": "deflate, gzip, br",
                    },
                )
                r.raise_for_status()
                vals = _realtime_values(r.json())
                precip = _fnum(
                    vals.get("precipitationIntensity")
                    or vals.get("rainIntensity")
                    or vals.get("snowIntensity")
                )
                points.append(
                    {
                        "lat": lat,
                        "lon": lon,
                        "label": label,
                        "temperature_c": round(_fnum(vals.get("temperature")), 2),
                        "wind_speed_ms": round(_fnum(vals.get("windSpeed")), 2),
                        "wind_direction_deg": round(_fnum(vals.get("windDirection")), 1),
                        "cloud_cover_pct": round(_fnum(vals.get("cloudCover")), 1),
                        "precip_mm": round(precip, 3),
                    }
                )
        return {
            "points": points,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    return await get_cached("weather:current", 1800, load)


async def fetch_weather_forecast() -> dict[str, Any]:
    async def load() -> dict[str, Any]:
        apikey = _tomorrow_key()
        body_base = {
            "timesteps": ["1h"],
            "units": "metric",
            "fields": [
                "temperature",
                "windSpeed",
                "windDirection",
                "cloudCover",
                "precipitationIntensity",
            ],
            "startTime": "now",
            "endTime": "nowPlus24h",
        }
        result_points: list[dict[str, Any]] = []
        async with httpx.AsyncClient(timeout=45.0) as client:
            for lat, lon, label in PJM_WEATHER_POINTS:
                payload = {**body_base, "location": f"{lat},{lon}"}
                r = await client.post(
                    "https://api.tomorrow.io/v4/timelines",
                    params={"apikey": apikey},
                    json=payload,
                    headers={
                        "User-Agent": USER_AGENT,
                        "Accept-Encoding": "deflate, gzip, br",
                    },
                )
                r.raise_for_status()
                data = r.json()
                hourly: list[dict[str, Any]] = []
                timelines = (data.get("data") or {}).get("timelines") or data.get(
                    "timelines"
                ) or []
                for tl in timelines:
                    for it in tl.get("intervals") or []:
                        st = str(it.get("startTime") or "")
                        v = it.get("values") or {}
                        hourly.append(
                            {
                                "hour": st,
                                "temperature_c": round(_fnum(v.get("temperature")), 2),
                                "wind_speed_ms": round(_fnum(v.get("windSpeed")), 2),
                                "wind_direction_deg": round(
                                    _fnum(v.get("windDirection")), 1
                                ),
                                "cloud_cover_pct": round(_fnum(v.get("cloudCover")), 1),
                            }
                        )
                result_points.append(
                    {
                        "lat": lat,
                        "lon": lon,
                        "label": label,
                        "hourly": hourly[:24],
                    }
                )
        return {
            "points": result_points,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    return await get_cached("weather:forecast", 3600, load)
