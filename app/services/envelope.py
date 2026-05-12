"""Canonical {meta, data, summary} envelope for Wave-5 endpoints.

Every Wave-5 endpoint returns the shape produced by ``build_envelope``.
Legacy ``/api/atlas/*``, ``/api/energy/*``, ``/api/weather/*``, and
``/api/news/*`` routes do **not** route through this helper - they are
frozen at their pre-existing shapes.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def utc_now_iso() -> str:
    """ISO-8601 string in UTC with second precision and trailing 'Z'."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def build_envelope(
    *,
    meta: dict[str, Any],
    data: Any,
    summary: str,
) -> dict[str, Any]:
    """Wrap a payload in the canonical V2 response envelope.

    ``meta`` is augmented with ``timestamp`` (ISO-8601 UTC) when the caller
    has not provided one, so consumers can always read ``meta.timestamp``
    to render data-freshness affordances.
    """
    if "timestamp" not in meta:
        meta = {"timestamp": utc_now_iso(), **meta}
    return {"meta": meta, "data": data, "summary": summary}


def data_age_seconds(observation_iso: str) -> int:
    """Seconds elapsed between ``observation_iso`` and now (UTC).

    Returns 0 if the input cannot be parsed - callers should treat the
    result as a best-effort freshness signal rather than a guarantee.
    """
    if not observation_iso:
        return 0
    try:
        from dateutil import parser as dateparser  # local to avoid cycles

        dt = dateparser.parse(observation_iso)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        delta = datetime.now(timezone.utc) - dt
        return max(0, int(delta.total_seconds()))
    except (TypeError, ValueError, OverflowError):
        return 0
