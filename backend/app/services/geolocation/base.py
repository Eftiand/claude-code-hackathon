from __future__ import annotations

from abc import ABC, abstractmethod

from pydantic import BaseModel


class GeoLocation(BaseModel):
    country_code: str | None = None
    city: str | None = None
    lat: float | None = None
    lon: float | None = None


class GeoLocationService(ABC):
    @abstractmethod
    async def lookup_by_ip(self, ip_address: str) -> GeoLocation:
        """Lookup location by IP address."""
        pass

    @abstractmethod
    async def get_country_centroid(self, country_code: str) -> tuple[float, float]:
        """Get approximate center coordinates for a country."""
        pass
