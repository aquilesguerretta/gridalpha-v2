"""Per-account learning progress (Cursor Wave 11).

POST /api/progress/events — record a real event (log + derived caches)

Plain JSON response, mirroring Wave 9's ``/api/products/{id}/activate``
shape (it reports what just happened, not a market/reference read).

Every response here returns entity ids exactly as the caller sent them —
never a computed "3 of 9 lessons" or "42% of the level". The backend does
not have a curriculum table and must not fake having one; that join
belongs to the frontend, against what it already knows.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.models.progress import EVENT_TYPES
from app.db.models.user import User
from app.db.session import get_db
from app.services.auth_service import get_current_user
from app.services.progress_service import record_event

router = APIRouter(prefix="/api/progress", tags=["progress"])


class RecordEventRequest(BaseModel):
    event_type: str = Field(alias="eventType")
    entity_id: str = Field(alias="entityId", min_length=1, max_length=500)
    metadata: dict | None = None

    model_config = {"populate_by_name": True}


def _aula_status_payload(aula_status) -> dict | None:
    if aula_status is None:
        return None
    return {
        "status": aula_status.status,
        "startedAt": aula_status.started_at.isoformat() if aula_status.started_at else None,
        "completedAt": aula_status.completed_at.isoformat() if aula_status.completed_at else None,
    }


@router.post("/events", status_code=status.HTTP_201_CREATED)
def post_event(
    body: RecordEventRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.event_type not in EVENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"unknown eventType '{body.event_type}' — must be one of {sorted(EVENT_TYPES)}",
        )

    try:
        recorded = record_event(
            db,
            user_id=user.id,
            event_type=body.event_type,
            entity_id=body.entity_id,
            metadata=body.metadata,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e

    payload = {
        "eventId": str(recorded.event_id),
        "eventType": recorded.event_type,
        "entityId": recorded.entity_id,
        "occurredAt": recorded.occurred_at.isoformat(),
        "streak": {
            "atual": recorded.streak.current_streak_days,
            "maior": recorded.streak.longest_streak_days,
            "ultimoDiaAtivo": recorded.streak.last_active_date.isoformat(),
        },
    }
    if recorded.aula_status is not None:
        payload["aulaStatus"] = _aula_status_payload(recorded.aula_status)
    if recorded.badge_already_awarded is not None:
        payload["badgeAlreadyAwarded"] = recorded.badge_already_awarded

    return payload
