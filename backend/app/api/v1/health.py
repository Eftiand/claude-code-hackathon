from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.session import get_async_session
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(
    db: AsyncSession = Depends(get_async_session),
):
    """
    Health check endpoint for load balancers and monitoring.
    """
    settings = get_settings()
    db_status = "healthy"

    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    return HealthResponse(
        status="ok" if db_status == "healthy" else "degraded",
        database=db_status,
        version=settings.app_version,
    )
