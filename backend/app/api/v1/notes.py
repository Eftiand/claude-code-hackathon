from __future__ import annotations

import base64
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.exceptions import ContentFilteredError, RateLimitExceeded
from app.dependencies import get_client_ip, get_note_service
from app.schemas.note import (
    NoteCreate,
    NoteListResponse,
    NotePointResponse,
    NoteResponse,
)
from app.services.note_service import NoteService

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post(
    "",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        429: {"description": "Rate limit exceeded"},
        400: {"description": "Invalid input or content filtered"},
    },
)
async def create_note(
    note_data: NoteCreate,
    request: Request,
    note_service: NoteService = Depends(get_note_service),
    client_ip: str = Depends(get_client_ip),
):
    """
    Submit a new note to the globe map.

    - Rate limited to 5 requests per hour per IP
    - Message is filtered for inappropriate content
    - Location is resolved from frontend data or IP fallback
    """
    # Check honeypot - if filled, silently reject (bot detected)
    if note_data.honeypot:
        # Return fake success response to not tip off bots
        # But actually don't store anything
        return NoteResponse(
            id="00000000-0000-0000-0000-000000000000",
            name=note_data.name,
            message=note_data.message,
            country_code=note_data.country_code,
            city=note_data.city,
            lat=note_data.lat,
            lon=note_data.lon,
            created_at=datetime.now(timezone.utc),
        )

    try:
        note = await note_service.create_note(
            note_data=note_data,
            client_ip=client_ip,
        )
        return note
    except RateLimitExceeded as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e),
            headers={"Retry-After": str(e.retry_after_seconds)},
        )
    except ContentFilteredError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=NoteListResponse)
async def list_notes(
    cursor: str | None = None,
    limit: int = 20,
    note_service: NoteService = Depends(get_note_service),
):
    """
    Get paginated list of notes, newest first.

    Uses cursor-based pagination for efficiency.
    """
    if limit < 1 or limit > 100:
        limit = 20

    # Decode cursor (base64 encoded ISO timestamp)
    cursor_datetime = None
    if cursor:
        try:
            decoded = base64.urlsafe_b64decode(cursor).decode("utf-8")
            cursor_datetime = datetime.fromisoformat(decoded)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cursor format",
            )

    notes, has_more = await note_service.list_notes(
        cursor=cursor_datetime,
        limit=limit,
    )

    # Generate next cursor
    next_cursor = None
    if has_more and notes:
        last_timestamp = notes[-1].created_at.isoformat()
        next_cursor = base64.urlsafe_b64encode(last_timestamp.encode()).decode()

    return NoteListResponse(
        notes=notes,
        next_cursor=next_cursor,
        has_more=has_more,
    )


@router.get("/points", response_model=list[NotePointResponse])
async def get_note_points(
    limit: int = 1000,
    note_service: NoteService = Depends(get_note_service),
):
    """
    Get notes formatted for react-globe.gl points layer.

    Returns notes that have location data.
    """
    if limit < 1 or limit > 10000:
        limit = 1000

    return await note_service.get_notes_as_points(limit=limit)
