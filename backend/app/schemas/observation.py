from pydantic import BaseModel, Field
from typing import List, Optional


class ArgoMeasurementPoint(BaseModel):
    depth: float = Field(..., description="Pressure/depth in decibars / meters")
    temperature: Optional[float] = Field(None, description="In-situ temperature in °C")
    salinity: Optional[float] = Field(None, description="In-situ salinity in PSU")


class ArgoObservationSummary(BaseModel):
    platform_number: str = Field(..., description="WMO Platform ID")
    cycle_number: int = Field(..., description="Float cycle number")
    time: str = Field(..., description="Timestamp of profile")
    latitude: float
    longitude: float
    surface_temp: Optional[float] = None
    surface_sal: Optional[float] = None
    max_depth: Optional[float] = None
    profile_points_count: int = 0


class ArgoProfileDetail(BaseModel):
    platform_number: str
    cycle_number: int
    time: str
    latitude: float
    longitude: float
    measurements: List[ArgoMeasurementPoint]
    source: str = "INCOIS ERDDAP (Indian_ARGO_Floats)"


class ObservationsListResponse(BaseModel):
    total_floats: int
    floats: List[ArgoObservationSummary]
    time_min: Optional[str] = None
    time_max: Optional[str] = None
