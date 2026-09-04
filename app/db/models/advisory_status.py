"""Shared Advisory queue status — one language in the column.

``received`` / ``in_review`` / ``delivered`` is what Postgres stores and
what the operator queue speaks. CLE and Solar customer payloads still
emit ``submitted`` / ``ready`` as a *read alias* so
``src/lib/submissoes/api.ts`` keeps working until the ARCHITECT linking
wave migrates that client. ``in_review`` aliases to ``submitted`` on
that door: the old client has no third literal, and "em análise" is an
operator state.

The alias is temporary. Removing it is an explicit pendency of the
linking wave — not silent debt. See ``docs/operador-wave-2-schema.md``.
"""

from __future__ import annotations

QUEUE_STATUSES: tuple[str, ...] = ("received", "in_review", "delivered")

STATUS_RECEIVED = "received"
STATUS_IN_REVIEW = "in_review"
STATUS_DELIVERED = "delivered"

# Customer-door alias. Do not use these strings as column values.
CUSTOMER_STATUS_ALIAS: dict[str, str] = {
    STATUS_RECEIVED: "submitted",
    STATUS_IN_REVIEW: "submitted",
    STATUS_DELIVERED: "ready",
}


def customer_status_alias(status: str) -> str:
    """Map a stored queue status to the legacy CLE/Solar customer literal."""
    try:
        return CUSTOMER_STATUS_ALIAS[status]
    except KeyError as exc:
        raise ValueError(f"unknown queue status {status!r}") from exc


def is_delivered(status: str) -> bool:
    return status == STATUS_DELIVERED
