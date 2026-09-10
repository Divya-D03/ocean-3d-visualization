from pydantic import BaseModel, Field
from typing import List, Optional


class ProfileComparisonPoint(BaseModel):
    depth: float
    model_temp: Optional[float] = None
    obs_temp: Optional[float] = None
    temp_diff: Optional[float] = None
    model_sal: Optional[float] = None
    obs_sal: Optional[float] = None
    sal_diff: Optional[float] = None


class ValidationMetrics(BaseModel):
    temperature_bias: Optional[float] = None
    temperature_mae: Optional[float] = None
    temperature_rmse: Optional[float] = None
    salinity_bias: Optional[float] = None
    salinity_mae: Optional[float] = None
    salinity_rmse: Optional[float] = None
    sample_size: int = 0


class ComparisonResponse(BaseModel):
    platform_number: str
    cycle_number: int
    observation_time: str
    model_time: str
    latitude: float
    longitude: float
    matched_model_lat: float
    matched_model_lon: float
    
    # Surface comparison
    surface_depth: float
    obs_temperature: Optional[float] = None
    model_temperature: Optional[float] = None
    temperature_diff: Optional[float] = None
    
    obs_salinity: Optional[float] = None
    model_salinity: Optional[float] = None
    salinity_diff: Optional[float] = None

    # Full profile comparison
    profile_comparison: List[ProfileComparisonPoint]
    metrics: ValidationMetrics
    
    notes: str = Field(
        default="Comparison derived using spatial and temporal nearest-neighbor collocation with INCOIS Monthly VAM."
    )
