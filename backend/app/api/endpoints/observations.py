from fastapi import APIRouter, Query, Path
from app.services.observation_service import observation_service
from app.schemas.observation import ObservationsListResponse, ArgoProfileDetail

router = APIRouter(prefix="/observations", tags=["observations"])


@router.get("", response_model=ObservationsListResponse)
async def get_observations(
    lat_min: float = Query(-10.0, description="Minimum latitude"),
    lat_max: float = Query(25.0, description="Maximum latitude"),
    lon_min: float = Query(55.0, description="Minimum longitude"),
    lon_max: float = Query(95.0, description="Maximum longitude"),
    time_min: str = Query("2020-01-01T00:00:00Z", description="Start timestamp"),
    time_max: str = Query("2020-06-30T00:00:00Z", description="End timestamp"),
):
    """
    Retrieve real-world in-situ ARGO float observations from INCOIS ERDDAP (Indian_ARGO_Floats).
    Returns list of platforms with surface measurements, max profile depths, and coordinates.
    """
    return await observation_service.get_observations(
        lat_min=lat_min,
        lat_max=lat_max,
        lon_min=lon_min,
        lon_max=lon_max,
        time_start=time_min,
        time_end=time_max,
    )


@router.get("/{platform_id}", response_model=ArgoProfileDetail)
async def get_float_profile(
    platform_id: str = Path(..., description="WMO Platform ID of the ARGO float")
):
    """
    Retrieve the full vertical CTD depth profile (Pressure, Temperature, Salinity) for a specific ARGO float.
    """
    return await observation_service.get_float_profile(platform_id)
