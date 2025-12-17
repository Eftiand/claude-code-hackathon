"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notes",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(60), nullable=True),
        sa.Column("message", sa.String(200), nullable=False),
        sa.Column("country_code", sa.String(2), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lon", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("ip_hash", sa.String(64), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notes_id", "notes", ["id"])
    op.create_index("ix_notes_country_code", "notes", ["country_code"])
    op.create_index("ix_notes_created_at", "notes", ["created_at"])
    op.create_index("ix_notes_ip_hash", "notes", ["ip_hash"])
    op.create_index("ix_notes_created_at_desc", "notes", [sa.text("created_at DESC")])
    op.create_index("ix_notes_country_created", "notes", ["country_code", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_notes_country_created", table_name="notes")
    op.drop_index("ix_notes_created_at_desc", table_name="notes")
    op.drop_index("ix_notes_ip_hash", table_name="notes")
    op.drop_index("ix_notes_created_at", table_name="notes")
    op.drop_index("ix_notes_country_code", table_name="notes")
    op.drop_index("ix_notes_id", table_name="notes")
    op.drop_table("notes")
