from .base import GeoLocation, GeoLocationService
from .ipapi import COUNTRY_CENTROIDS


class MockGeoLocationService(GeoLocationService):
    """Mock geolocation service for testing."""

    def __init__(
        self,
        default_country: str = "US",
        default_city: str = "New York",
    ):
        self.default_country = default_country
        self.default_city = default_city

    async def lookup_by_ip(self, ip_address: str) -> GeoLocation:
        """Return mock location data."""
        lat, lon = COUNTRY_CENTROIDS.get(self.default_country, (40.7128, -74.0060))
        return GeoLocation(
            country_code=self.default_country,
            city=self.default_city,
            lat=lat,
            lon=lon,
        )

    async def get_country_centroid(self, country_code: str) -> tuple[float, float]:
        """Get approximate center coordinates for a country."""
        return COUNTRY_CENTROIDS.get(country_code.upper(), (0.0, 0.0))
