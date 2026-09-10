from fastapi import APIRouter, Query
from typing import Optional
from app.services.ocean_service import (
    ocean_service,
    AVAILABLE_DEPTHS,
    AVAILABLE_TIMES,
    CURRENTS_TIMES,
    PRESETS,
)
from app.schemas.ocean import (
    OceanSliceResponse,
    CurrentsResponse,
    GriddedProfileResponse,
    OceanMetadataResponse,
)

router = APIRouter(prefix="/ocean", tags=["ocean"])


@router.get("/metadata", response_model=OceanMetadataResponse)
async def get_ocean_metadata():
    """Retrieve metadata about available depths, temporal slices, basin bounds, and geographic presets."""
    return OceanMetadataResponse(
        available_depths=AVAILABLE_DEPTHS,
        available_times=AVAILABLE_TIMES,
        currents_times=CURRENTS_TIMES,
        bounds={"lat_min": -29.5, "lat_max": 29.5, "lon_min": 30.5, "lon_max": 119.5},
        presets=PRESETS,
    )


@router.get("/temperature", response_model=OceanSliceResponse)
async def get_temperature_grid(
    depth: float = Query(5.0, description="Depth in meters (ZAX)"),
    time: str = Query("2020-01-15T00:00:00Z", description="Timestamp in ISO format"),
    lat_min: float = Query(5.0, description="Minimum latitude"),
    lat_max: float = Query(25.0, description="Maximum latitude"),
    lon_min: float = Query(60.0, description="Minimum longitude"),
    lon_max: float = Query(90.0, description="Maximum longitude"),
):
    """Retrieve 2D horizontal depth slice of temperature (°C) from INCOIS Monthly VAM."""
    return await ocean_service.get_temperature_slice(
        depth=depth,
        time_iso=time,
        lat_min=lat_min,
        lat_max=lat_max,
        lon_min=lon_min,
        lon_max=lon_max,
    )


@router.get("/salinity", response_model=OceanSliceResponse)
async def get_salinity_grid(
    depth: float = Query(5.0, description="Depth in meters (ZAX)"),
    time: str = Query("2020-01-15T00:00:00Z", description="Timestamp in ISO format"),
    lat_min: float = Query(5.0, description="Minimum latitude"),
    lat_max: float = Query(25.0, description="Maximum latitude"),
    lon_min: float = Query(60.0, description="Minimum longitude"),
    lon_max: float = Query(90.0, description="Maximum longitude"),
):
    """Retrieve 2D horizontal depth slice of salinity (PSU) from INCOIS Monthly VAM."""
    return await ocean_service.get_salinity_slice(
        depth=depth,
        time_iso=time,
        lat_min=lat_min,
        lat_max=lat_max,
        lon_min=lon_min,
        lon_max=lon_max,
    )


@router.get("/currents", response_model=CurrentsResponse)
async def get_currents_grid(
    time: str = Query("2018-01-10T00:00:00Z", description="Timestamp in ISO format"),
    lat_min: float = Query(5.0, description="Minimum latitude"),
    lat_max: float = Query(25.0, description="Maximum latitude"),
    lon_min: float = Query(60.0, description="Minimum longitude"),
    lon_max: float = Query(90.0, description="Maximum longitude"),
):
    """
    Retrieve historical surface currents (GEO_U, GEO_V) from INCOIS Value Added Products.
    Note: Historical analysis dataset, not a live feed.
    """
    return await ocean_service.get_currents(
        time_iso=time,
        lat_min=lat_min,
        lat_max=lat_max,
        lon_min=lon_min,
        lon_max=lon_max,
    )


@router.get("/profile", response_model=GriddedProfileResponse)
async def get_vertical_profile(
    latitude: float = Query(15.0, description="Latitude"),
    longitude: float = Query(70.0, description="Longitude"),
    time: str = Query("2020-01-15T00:00:00Z", description="Timestamp in ISO format"),
):
    """Retrieve vertical ocean water column profile across standard depth levels at given coordinate."""
    return await ocean_service.get_vertical_profile(
        latitude=latitude,
        longitude=longitude,
        time_iso=time,
    )
