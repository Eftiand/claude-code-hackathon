from __future__ import annotations

import asyncio
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from .base import RateLimiterService


class InMemoryRateLimiter(RateLimiterService):
    """In-memory rate limiter for development. Use Redis in production."""

    def __init__(self):
        self._requests: dict[str, list[datetime]] = defaultdict(list)
        self._lock: asyncio.Lock | None = None

    def _get_lock(self) -> asyncio.Lock:
        if self._lock is None:
            self._lock = asyncio.Lock()
        return self._lock

    def _make_key(self, identifier: str, endpoint: str) -> str:
        return f"{identifier}:{endpoint}"

    def _cleanup_old_requests(self, key: str, window: timedelta) -> None:
        cutoff = datetime.now(timezone.utc) - window
        self._requests[key] = [ts for ts in self._requests[key] if ts > cutoff]

    async def is_allowed(
        self,
        identifier: str,
        endpoint: str,
        max_requests: int,
        window: timedelta,
    ) -> bool:
        """Check if request is allowed under rate limit."""
        key = self._make_key(identifier, endpoint)
        async with self._get_lock():
            self._cleanup_old_requests(key, window)
            return len(self._requests[key]) < max_requests

    async def record_request(self, identifier: str, endpoint: str) -> None:
        """Record a request for rate limiting."""
        key = self._make_key(identifier, endpoint)
        async with self._get_lock():
            self._requests[key].append(datetime.now(timezone.utc))

    async def get_remaining(
        self,
        identifier: str,
        endpoint: str,
        max_requests: int,
        window: timedelta,
    ) -> int:
        """Get remaining requests in current window."""
        key = self._make_key(identifier, endpoint)
        async with self._get_lock():
            self._cleanup_old_requests(key, window)
            return max(0, max_requests - len(self._requests[key]))
