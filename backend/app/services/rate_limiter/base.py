from abc import ABC, abstractmethod
from datetime import timedelta


class RateLimiterService(ABC):
    @abstractmethod
    async def is_allowed(
        self,
        identifier: str,
        endpoint: str,
        max_requests: int,
        window: timedelta,
    ) -> bool:
        """Check if request is allowed under rate limit."""
        pass

    @abstractmethod
    async def record_request(self, identifier: str, endpoint: str) -> None:
        """Record a request for rate limiting."""
        pass

    @abstractmethod
    async def get_remaining(
        self,
        identifier: str,
        endpoint: str,
        max_requests: int,
        window: timedelta,
    ) -> int:
        """Get remaining requests in current window."""
        pass
