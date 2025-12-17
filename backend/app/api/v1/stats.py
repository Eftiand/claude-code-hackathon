from fastapi import APIRouter, Depends

from app.dependencies import get_note_service
from app.schemas.stats import CountryStatsResponse, HeatmapPoint
from app.services.note_service import NoteService

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/countries", response_model=CountryStatsResponse)
async def get_country_stats(
    note_service: NoteService = Depends(get_note_service),
):
    """
    Get note counts per country for globe heatmap visualization.

    Returns country codes with counts and centroid coordinates.
    """
    return await note_service.get_country_stats()


@router.get("/heatmap", response_model=list[HeatmapPoint])
async def get_heatmap_data(
    note_service: NoteService = Depends(get_note_service),
):
    """
    Get heatmap data formatted for react-globe.gl.

    Aggregates notes by location for density visualization.
    """
    return await note_service.get_heatmap_data()
