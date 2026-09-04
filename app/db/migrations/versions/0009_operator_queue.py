"""Operator queue — shared status, Diagnóstico deliverable, rich intake.

Revision ID: 0009_operator_queue
Revises: 0008_diagnostico_energetico
Create Date: 2026-09-03

One additive migration for the three approved designs. Column language
is ``received`` / ``in_review`` / ``delivered``. Legacy ``submitted`` /
``ready`` are not stored; they remain a customer-payload alias until the
linking wave (see docs/operador-wave-2-schema.md).
"""

from typing import Sequence, Union

from alembic import op


revision: str = "0009_operator_queue"
down_revision: Union[str, None] = "0008_diagnostico_energetico"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_DELIVERABLE_STATE_CHECK = """
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
"""

_LEGACY_DELIVERABLE_STATE_CHECK = """
            (
              status = 'submitted'
              AND deliverable_data IS NULL
              AND deliverable_filename IS NULL
              AND deliverable_content_type IS NULL
              AND deliverable_size_bytes IS NULL
              AND deliverable_sha256 IS NULL
              AND delivered_at IS NULL
            )
            OR
            (
              status = 'ready'
              AND deliverable_data IS NOT NULL
              AND deliverable_filename IS NOT NULL
              AND deliverable_content_type = 'application/pdf'
              AND deliverable_size_bytes > 0
              AND deliverable_sha256 IS NOT NULL
              AND delivered_at IS NOT NULL
            )
"""


def _rewrite_file_submission_status(table: str) -> None:
    op.execute(
        f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {table}_status_check;"
    )
    op.execute(
        f"ALTER TABLE {table} "
        f"DROP CONSTRAINT IF EXISTS {table}_deliverable_state_check;"
    )
    op.execute(
        f"UPDATE {table} SET status = 'received' WHERE status = 'submitted';"
    )
    op.execute(
        f"UPDATE {table} SET status = 'delivered' WHERE status = 'ready';"
    )
    op.execute(
        f"ALTER TABLE {table} ALTER COLUMN status SET DEFAULT 'received';"
    )
    op.execute(
        f"ALTER TABLE {table} ADD CONSTRAINT {table}_status_check "
        "CHECK (status IN ('received', 'in_review', 'delivered'));"
    )
    op.execute(
        f"ALTER TABLE {table} ADD CONSTRAINT {table}_deliverable_state_check "
        f"CHECK ({_DELIVERABLE_STATE_CHECK});"
    )


def _restore_file_submission_status(table: str) -> None:
    op.execute(
        f"ALTER TABLE {table} DROP CONSTRAINT IF EXISTS {table}_status_check;"
    )
    op.execute(
        f"ALTER TABLE {table} "
        f"DROP CONSTRAINT IF EXISTS {table}_deliverable_state_check;"
    )
    op.execute(
        f"UPDATE {table} SET status = 'submitted' "
        "WHERE status IN ('received', 'in_review');"
    )
    op.execute(
        f"UPDATE {table} SET status = 'ready' WHERE status = 'delivered';"
    )
    op.execute(
        f"ALTER TABLE {table} ALTER COLUMN status SET DEFAULT 'submitted';"
    )
    op.execute(
        f"ALTER TABLE {table} ADD CONSTRAINT {table}_status_check "
        "CHECK (status IN ('submitted', 'ready'));"
    )
    op.execute(
        f"ALTER TABLE {table} ADD CONSTRAINT {table}_deliverable_state_check "
        f"CHECK ({_LEGACY_DELIVERABLE_STATE_CHECK});"
    )


def upgrade() -> None:
    _rewrite_file_submission_status("conta_luz_submission")
    _rewrite_file_submission_status("solar_proposal_submission")

    op.execute(
        """
        ALTER TABLE diagnostico_energetico_submission
          ADD COLUMN status TEXT NOT NULL DEFAULT 'received',
          ADD COLUMN location TEXT,
          ADD COLUMN installation_size TEXT,
          ADD COLUMN consuming_equipment TEXT,
          ADD COLUMN current_monthly_cost_brl NUMERIC(14, 2),
          ADD COLUMN deliverable_filename TEXT,
          ADD COLUMN deliverable_content_type TEXT,
          ADD COLUMN deliverable_size_bytes BIGINT,
          ADD COLUMN deliverable_sha256 TEXT,
          ADD COLUMN deliverable_data BYTEA,
          ADD COLUMN delivered_at TIMESTAMPTZ,
          ADD COLUMN customer_email_id TEXT,
          ADD COLUMN customer_notified_at TIMESTAMPTZ;
        """
    )
    op.execute(
        "ALTER TABLE diagnostico_energetico_submission "
        "ADD CONSTRAINT diagnostico_energetico_submission_status_check "
        "CHECK (status IN ('received', 'in_review', 'delivered'));"
    )
    op.execute(
        "ALTER TABLE diagnostico_energetico_submission "
        "ADD CONSTRAINT diagnostico_energetico_submission_deliverable_state_check "
        f"CHECK ({_DELIVERABLE_STATE_CHECK});"
    )
    op.execute(
        "CREATE INDEX diagnostico_energetico_submission_status_created_idx "
        "ON diagnostico_energetico_submission(status, created_at);"
    )


def downgrade() -> None:
    op.execute(
        "DROP INDEX IF EXISTS diagnostico_energetico_submission_status_created_idx;"
    )
    op.execute(
        "ALTER TABLE diagnostico_energetico_submission "
        "DROP CONSTRAINT IF EXISTS "
        "diagnostico_energetico_submission_deliverable_state_check;"
    )
    op.execute(
        "ALTER TABLE diagnostico_energetico_submission "
        "DROP CONSTRAINT IF EXISTS diagnostico_energetico_submission_status_check;"
    )
    op.execute(
        """
        ALTER TABLE diagnostico_energetico_submission
          DROP COLUMN IF EXISTS customer_notified_at,
          DROP COLUMN IF EXISTS customer_email_id,
          DROP COLUMN IF EXISTS delivered_at,
          DROP COLUMN IF EXISTS deliverable_data,
          DROP COLUMN IF EXISTS deliverable_sha256,
          DROP COLUMN IF EXISTS deliverable_size_bytes,
          DROP COLUMN IF EXISTS deliverable_content_type,
          DROP COLUMN IF EXISTS deliverable_filename,
          DROP COLUMN IF EXISTS current_monthly_cost_brl,
          DROP COLUMN IF EXISTS consuming_equipment,
          DROP COLUMN IF EXISTS installation_size,
          DROP COLUMN IF EXISTS location,
          DROP COLUMN IF EXISTS status;
        """
    )
    _restore_file_submission_status("solar_proposal_submission")
    _restore_file_submission_status("conta_luz_submission")
