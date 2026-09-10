from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class GridPoint(BaseModel):
    lat: float
    lon: float
    val: Optional[float] = None


class OceanSliceResponse(BaseModel):
    variable: str = Field(..., description="Parameter name, e.g. TEMP or SAL")
    unit: str = Field(..., description="Physical unit, e.g. °C or PSU")
    depth: float = Field(..., description="Depth in meters (ZAX)")
    time: str = Field(..., description="Timestamp ISO string")
    lat_range: List[float] = Field(..., description="[lat_min, lat_max]")
    lon_range: List[float] = Field(..., description="[lon_min, lon_max]")
    lat_dim: int
    lon_dim: int
    latitudes: List[float]
    longitudes: List[float]
    # Flattened 2D row-major array [lat_dim x lon_dim] for fast WebGL buffer transfer
    values: List[Optional[float]]
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    mean_val: Optional[float] = None
    source: str = Field(default="INCOIS ERDDAP (incois_argo_mnt_VAM)")


class CurrentVectorPoint(BaseModel):
    lat: float
    lon: float
    u: Optional[float] = Field(None, description="Zonal current velocity in cm/s")
    v: Optional[float] = Field(None, description="Meridional current velocity in cm/s")
    speed: Optional[float] = Field(None, description="Current speed magnitude in cm/s")
    direction: Optional[float] = Field(None, description="Flow heading direction in degrees")


class CurrentsResponse(BaseModel):
    time: str
    lat_range: List[float]
    lon_range: List[float]
    latitudes: List[float]
    longitudes: List[float]
    points: List[CurrentVectorPoint]
    max_speed: Optional[float] = None
    source: str = Field(default="INCOIS ERDDAP (incois_valueadded_products_datasets - Historical)")


class VerticalProfilePoint(BaseModel):
    depth: float
    temperature: Optional[float] = None
    salinity: Optional[float] = None


class GriddedProfileResponse(BaseModel):
    latitude: float
    longitude: float
    time: str
    levels: List[VerticalProfilePoint]
    source: str = "INCOIS ARGO Monthly VAM"


class OceanMetadataResponse(BaseModel):
    available_depths: List[float]
    available_times: List[str]
    currents_times: List[str]
    bounds: Dict[str, float]
    presets: Dict[str, Dict[str, float]]
