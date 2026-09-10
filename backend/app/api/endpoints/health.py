from fastapi import APIRouter
from app.services.erddap_service import erddap_service
from app.db import is_db_connected
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint verifying API service, INCOIS ERDDAP connectivity, and database status.
    """
    erddap_status = await erddap_service.check_health()
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "database_connected": is_db_connected(),
        "erddap": {
            "status": "connected" if erddap_status.get("connected") else "offline_cache_mode",
            "base_url": settings.ERDDAP_BASE_URL,
            "details": erddap_status,
        }
    }
