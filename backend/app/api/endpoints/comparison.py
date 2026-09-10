from fastapi import APIRouter, Query
from typing import Optional
from app.services.comparison_service import comparison_service
from app.schemas.comparison import ComparisonResponse

router = APIRouter(prefix="/comparison", tags=["comparison"])


@router.get("", response_model=ComparisonResponse)
async def get_model_vs_observation_comparison(
    platform_id: str = Query(..., description="ARGO float platform number, e.g. 2902260"),
    depth: float = Query(5.0, description="Depth level in meters to compare"),
    time: Optional[str] = Query(None, description="Model timestamp to compare against (ISO string)"),
):
    """
    Compare real-world in-situ ARGO float observations with collocated INCOIS gridded ocean model data.
    Computes direct delta (Model - Obs) and statistical validation metrics (Bias, MAE, RMSE) across the water column.
    """
    return await comparison_service.compare_observation_with_model(
        platform_id=platform_id,
        depth=depth,
        time_iso=time,
    )
