from fastapi import APIRouter
from app.api.endpoints.health import router as health_router
from app.api.endpoints.ocean import router as ocean_router
from app.api.endpoints.observations import router as observations_router
from app.api.endpoints.comparison import router as comparison_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(ocean_router)
api_router.include_router(observations_router)
api_router.include_router(comparison_router)
