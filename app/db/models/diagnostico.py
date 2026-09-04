"""ORM model — Diagnóstico Energético scoping intake and deliverable.

Sibling domain to the file-upload submissions, not an extension of them.
The row is a call-scoping sheet plus, from operator-queue Wave 2, a PDF
deliverable and optional rich-intake fields. Queue status is the shared
``received`` / ``in_review`` / ``delivered`` vocabulary. The ongoing
exchange still lives in ``conversation`` / ``message``; delivering the
PDF does not close the thread.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    LargeBinary,
    Numeric,
    Text,
    desc,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.db.models.advisory_status import QUEUE_STATUSES, STATUS_RECEIVED

DIAGNOSTICO_STATUSES: tuple[str, ...] = QUEUE_STATUSES


class DiagnosticoEnergeticoSubmission(Base):
    __tablename__ = "diagnostico_energetico_submission"
    __table_args__ = (
        Index(
            "diagnostico_energetico_submission_user_created_idx",
            "user_id",
            desc("created_at"),
        ),
        Index(
            "diagnostico_energetico_submission_status_created_idx",
            "status",
            "created_at",
        ),
        CheckConstraint(
            "status IN ('received', 'in_review', 'delivered')",
            name="diagnostico_energetico_submission_status_check",
        ),
        CheckConstraint(
            """
            (
              status IN ('received', 'in_review')
              AND deliverable_data IS NULL
              AND deliverable_filename IS NULL
              AND deliverable_content_type IS NULL
              AND deliverable_size_bytes IS NULL
              AND deliverable_sha256 IS NULL
              AND delivered_at IS NULL
            )
            OR
            (
              status = 'delivered'
              AND deliverable_data IS NOT NULL
              AND deliverable_filename IS NOT NULL
              AND deliverable_content_type = 'application/pdf'
              AND deliverable_size_bytes > 0
              AND deliverable_sha256 IS NOT NULL
              AND delivered_at IS NOT NULL
            )
            """,
            name="diagnostico_energetico_submission_deliverable_state_check",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default=STATUS_RECEIVED,
    )
    sector: Mapped[str] = mapped_column(Text, nullable=False)
    monthly_consumption_band: Mapped[str] = mapped_column(Text, nullable=False)
    tariff_modality: Mapped[str | None] = mapped_column(Text, nullable=True)
    concern: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    installation_size: Mapped[str | None] = mapped_column(Text, nullable=True)
    consuming_equipment: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_monthly_cost_brl: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), nullable=True
    )

    deliverable_filename: Mapped[str | None] = mapped_column(Text, nullable=True)
    deliverable_content_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    deliverable_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    deliverable_sha256: Mapped[str | None] = mapped_column(Text, nullable=True)
    deliverable_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)

    customer_email_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer_notified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    delivered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
