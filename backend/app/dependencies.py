from __future__ import annotations

from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.db.repositories.note_repository import NoteRepository
from app.db.session import get_async_session
from app.services.content_filter.base import ContentFilterService
from app.services.content_filter.basic import BasicContentFilter
from app.services.geolocation.base import GeoLocationService
from app.services.geolocation.ipapi import IpApiGeoLocationService
from app.services.geolocation.mock import MockGeoLocationService
from app.services.note_service import NoteService
from app.services.rate_limiter.base import RateLimiterService
from app.services.rate_limiter.memory import InMemoryRateLimiter

# Singleton instances for services that don't need per-request state
_geolocation_service: GeoLocationService | None = None
_rate_limiter: RateLimiterService | None = None
_content_filter: ContentFilterService | None = None


def get_geolocation_service(
    settings: Settings = Depends(get_settings),
) -> GeoLocationService:
    """Get geolocation service based on configuration."""
    global _geolocation_service
    if _geolocation_service is None:
        if settings.environment == "test":
            _geolocation_service = MockGeoLocationService()
        else:
            _geolocation_service = IpApiGeoLocationService(
                timeout=settings.geolocation_timeout
            )
    return _geolocation_service


def get_rate_limiter() -> RateLimiterService:
    """Get rate limiter service. In production, consider Redis-based implementation."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = InMemoryRateLimiter()
    return _rate_limiter


def get_content_filter(
    settings: Settings = Depends(get_settings),
) -> ContentFilterService:
    """Get content filter service."""
    global _content_filter
    if _content_filter is None:
        blocked_words = set(settings.custom_blocked_words) if settings.custom_blocked_words else None
        _content_filter = BasicContentFilter(blocked_words=blocked_words)
    return _content_filter


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies."""
    # Check for forwarded headers (behind reverse proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take first IP in chain (original client)
        return forwarded_for.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct connection
    return request.client.host if request.client else "unknown"


async def get_note_repository(
    db: AsyncSession = Depends(get_async_session),
) -> NoteRepository:
    """Provide note repository instance."""
    return NoteRepository(db)


async def get_note_service(
    repository: NoteRepository = Depends(get_note_repository),
    geolocation: GeoLocationService = Depends(get_geolocation_service),
    rate_limiter: RateLimiterService = Depends(get_rate_limiter),
    content_filter: ContentFilterService = Depends(get_content_filter),
    settings: Settings = Depends(get_settings),
) -> NoteService:
    """Provide fully configured note service."""
    return NoteService(
        repository=repository,
        geolocation_service=geolocation,
        rate_limiter=rate_limiter,
        content_filter=content_filter,
        settings=settings,
    )
