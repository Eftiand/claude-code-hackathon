import re
import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

# ISO 3166-1 alpha-2 pattern
COUNTRY_CODE_PATTERN = re.compile(r"^[A-Z]{2}$")


class NoteCreate(BaseModel):
    name: str | None = Field(None, max_length=60)
    message: str = Field(..., min_length=1, max_length=200)
    country_code: str | None = Field(None, max_length=2)
    city: str | None = Field(None, max_length=100)
    lat: float | None = Field(None, ge=-90, le=90)
    lon: float | None = Field(None, ge=-180, le=180)
    share_location: bool = Field(False, description="Opt-in to share precise location")
    honeypot: str | None = Field(None, alias="_hp_field")

    model_config = {"populate_by_name": True}

    @field_validator("country_code")
    @classmethod
    def validate_country_code(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v = v.upper()
        if not COUNTRY_CODE_PATTERN.match(v):
            raise ValueError("Invalid ISO 3166-1 alpha-2 country code")
        return v

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Message cannot be empty or whitespace only")
        return v.strip()

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v


class NoteResponse(BaseModel):
    id: uuid.UUID
    name: str | None
    message: str
    country_code: str | None
    city: str | None
    lat: float | None
    lon: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotePointResponse(BaseModel):
    """Format optimized for react-globe.gl points layer."""

    lat: float
    lng: float  # Note: react-globe.gl uses 'lng' not 'lon'
    size: float = 0.5
    color: str = "#00ff00"
    label: str
    id: str


class NoteListResponse(BaseModel):
    notes: list[NoteResponse]
    next_cursor: str | None = None
    has_more: bool = False
