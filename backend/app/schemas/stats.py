from pydantic import BaseModel


class CountryStats(BaseModel):
    country_code: str
    count: int
    lat: float  # Country centroid
    lng: float


class CountryStatsResponse(BaseModel):
    countries: list[CountryStats]
    total_notes: int


class HeatmapPoint(BaseModel):
    """Format for react-globe.gl heatmap layer."""

    lat: float
    lng: float
    weight: float
