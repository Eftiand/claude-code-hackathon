from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Index, String, text
from sqlmodel import Field, SQLModel


class Note(SQLModel, table=True):
    __tablename__ = "notes"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
    )
    name: str | None = Field(
        default=None,
        max_length=60,
    )
    message: str = Field(
        sa_column=Column(String(200), nullable=False),
    )
    country_code: str | None = Field(
        default=None,
        sa_column=Column(String(2), index=True, nullable=True),
    )
    city: str | None = Field(
        default=None,
        max_length=100,
    )
    lat: float | None = Field(default=None)
    lon: float | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
    )
    ip_hash: str = Field(
        sa_column=Column(String(64), index=True, nullable=False),
    )

    __table_args__ = (
        Index("ix_notes_created_at_desc", text("created_at DESC")),
        Index("ix_notes_country_created", "country_code", "created_at"),
    )
