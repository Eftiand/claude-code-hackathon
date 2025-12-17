from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from app.config import Settings
from app.core.exceptions import ContentFilteredError, RateLimitExceeded
from app.core.security import hash_ip
from app.db.repositories.note_repository import NoteRepository
from app.models.note import Note
from app.schemas.note import NoteCreate, NotePointResponse, NoteResponse
from app.schemas.stats import CountryStats, CountryStatsResponse, HeatmapPoint
from app.services.content_filter.base import ContentFilterService
from app.services.geolocation.base import GeoLocationService
from app.services.rate_limiter.base import RateLimiterService


class NoteService:
    def __init__(
        self,
        repository: NoteRepository,
        geolocation_service: GeoLocationService,
        rate_limiter: RateLimiterService,
        content_filter: ContentFilterService,
        settings: Settings,
    ):
        self.repository = repository
        self.geolocation = geolocation_service
        self.rate_limiter = rate_limiter
        self.content_filter = content_filter
        self.settings = settings

    async def create_note(
        self,
        note_data: NoteCreate,
        client_ip: str,
    ) -> NoteResponse:
        """Create a new note with validation, rate limiting, and location resolution."""
        ip_hash = hash_ip(client_ip, self.settings.ip_hash_salt)

        # Check rate limit
        window = timedelta(hours=self.settings.rate_limit_window_hours)
        is_allowed = await self.rate_limiter.is_allowed(
            identifier=ip_hash,
            endpoint="create_note",
            max_requests=self.settings.rate_limit_requests,
            window=window,
        )

        if not is_allowed:
            remaining_seconds = int(window.total_seconds())
            raise RateLimitExceeded(
                "Rate limit exceeded. Please try again later.",
                retry_after_seconds=remaining_seconds,
            )

        # Check content filter
        if self.settings.content_filter_enabled:
            filter_result = await self.content_filter.check_content(note_data.message)
            if not filter_result.is_clean:
                raise ContentFilteredError(
                    f"Message contains inappropriate content: {filter_result.reason}"
                )

            # Also filter name if provided
            if note_data.name:
                name_filter = await self.content_filter.check_content(note_data.name)
                if not name_filter.is_clean:
                    raise ContentFilteredError(
                        f"Name contains inappropriate content: {name_filter.reason}"
                    )

        # Resolve location
        lat, lon, country_code, city = await self._resolve_location(
            note_data=note_data,
            client_ip=client_ip,
        )

        # Create note
        note = Note(
            id=uuid.uuid4(),
            name=note_data.name,
            message=note_data.message,
            country_code=country_code,
            city=city,
            lat=lat,
            lon=lon,
            created_at=datetime.now(timezone.utc),
            ip_hash=ip_hash,
        )

        # Record rate limit
        await self.rate_limiter.record_request(ip_hash, "create_note")

        # Save to database
        saved_note = await self.repository.create(note)

        return NoteResponse.model_validate(saved_note)

    async def _resolve_location(
        self,
        note_data: NoteCreate,
        client_ip: str,
    ) -> tuple[float | None, float | None, str | None, str | None]:
        """
        Resolve location from multiple sources with priority:
        1. Frontend-provided lat/lon (if share_location is True)
        2. Frontend-provided country_code (use centroid)
        3. IP-based geolocation fallback
        """
        lat: float | None = None
        lon: float | None = None
        country_code = note_data.country_code
        city = note_data.city

        # Priority 1: Explicit coordinates (opt-in)
        if (
            note_data.share_location
            and note_data.lat is not None
            and note_data.lon is not None
        ):
            lat = note_data.lat
            lon = note_data.lon

        # Priority 2/3: Country-based or IP-based
        if country_code is None:
            # Try IP geolocation
            geo = await self.geolocation.lookup_by_ip(client_ip)
            country_code = geo.country_code
            city = city or geo.city

            # Use IP location if no explicit coords
            if lat is None and geo.lat is not None:
                lat = geo.lat
                lon = geo.lon

        # If we have country but no coords, use centroid
        if country_code and lat is None:
            centroid = await self.geolocation.get_country_centroid(country_code)
            lat, lon = centroid

        return lat, lon, country_code, city

    async def list_notes(
        self,
        cursor: datetime | None = None,
        limit: int = 20,
    ) -> tuple[list[NoteResponse], bool]:
        """List notes with cursor pagination, newest first."""
        notes = await self.repository.list_notes(
            cursor=cursor,
            limit=limit + 1,  # Fetch one extra to check has_more
        )

        has_more = len(notes) > limit
        if has_more:
            notes = notes[:limit]

        return [NoteResponse.model_validate(n) for n in notes], has_more

    async def get_notes_as_points(self, limit: int = 1000) -> list[NotePointResponse]:
        """Get notes formatted for react-globe.gl points layer."""
        notes = await self.repository.list_notes_with_location(limit=limit)

        return [
            NotePointResponse(
                lat=note.lat,
                lng=note.lon,  # Note: react-globe.gl uses 'lng'
                size=0.5,
                color="#00ff00",
                label=f"{note.name or 'Anonymous'}: {note.message[:50]}..."
                if len(note.message) > 50
                else f"{note.name or 'Anonymous'}: {note.message}",
                id=str(note.id),
            )
            for note in notes
            if note.lat is not None and note.lon is not None
        ]

    async def get_country_stats(self) -> CountryStatsResponse:
        """Get note counts per country."""
        stats = await self.repository.count_by_country()
        total = await self.repository.get_total_count()

        country_stats = []
        for stat in stats:
            if stat["country_code"]:
                centroid = await self.geolocation.get_country_centroid(stat["country_code"])
                country_stats.append(
                    CountryStats(
                        country_code=stat["country_code"],
                        count=stat["count"],
                        lat=centroid[0],
                        lng=centroid[1],
                    )
                )

        return CountryStatsResponse(
            countries=country_stats,
            total_notes=total,
        )

    async def get_heatmap_data(self) -> list[HeatmapPoint]:
        """Get heatmap data for react-globe.gl."""
        stats = await self.get_country_stats()
        max_count = max((c.count for c in stats.countries), default=1)

        return [
            HeatmapPoint(
                lat=c.lat,
                lng=c.lng,
                weight=c.count / max_count,  # Normalize to 0-1
            )
            for c in stats.countries
        ]
