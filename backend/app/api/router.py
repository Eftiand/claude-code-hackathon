from fastapi import APIRouter

from app.api.v1 import health, notes, stats

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(health.router)
api_router.include_router(notes.router)
api_router.include_router(stats.router)
