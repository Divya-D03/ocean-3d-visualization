import math
import numpy as np
import logging
from typing import Optional, List
from app.services.observation_service import observation_service
from app.services.ocean_service import ocean_service
from app.schemas.comparison import (
    ComparisonResponse,
    ProfileComparisonPoint,
    ValidationMetrics,
)

logger = logging.getLogger("comparison_service")


class ComparisonService:
    async def compare_observation_with_model(
        self,
        platform_id: str,
        depth: float = 5.0,
        time_iso: Optional[str] = None,
    ) -> ComparisonResponse:
        """
        Extract collocated gridded model values from INCOIS VAM and compare with ARGO float observations.
        """
        # 1. Fetch ARGO float profile
        profile = await observation_service.get_float_profile(platform_id)
        lat = profile.latitude
        lon = profile.longitude
        obs_time = profile.time

        # Match to nearest 0.5-degree grid center in INCOIS VAM (-29.5 to 29.5 step 1.0, 30.5 to 119.5 step 1.0)
        grid_lat = round(lat - 0.5) + 0.5
        grid_lon = round(lon - 0.5) + 0.5

        # 2. Extract model vertical profile at this location
        query_time = time_iso or "2020-01-15T00:00:00Z"
        gridded_profile = await ocean_service.get_vertical_profile(
            latitude=grid_lat,
            longitude=grid_lon,
            time_iso=query_time
        )

        model_levels_dict = {lvl.depth: lvl for lvl in gridded_profile.levels}

        # 3. Match observation points with model levels
        points_comparison: List[ProfileComparisonPoint] = []
        temp_diffs = []
        temp_abs_diffs = []
        temp_sq_diffs = []

        sal_diffs = []
        sal_abs_diffs = []
        sal_sq_diffs = []

        # Compare at model depth levels
        for model_depth, model_lvl in model_levels_dict.items():
            # Find nearest observation measurement within depth tolerance
            nearest_obs = min(
                profile.measurements,
                key=lambda m: abs(m.depth - model_depth),
                default=None
            )

            # Tolerance: within 30% of depth or 25m
            depth_tol = max(25.0, model_depth * 0.3)
            matched_obs_temp = None
            matched_obs_sal = None

            if nearest_obs and abs(nearest_obs.depth - model_depth) <= depth_tol:
                matched_obs_temp = nearest_obs.temperature
                matched_obs_sal = nearest_obs.salinity

            m_temp = model_lvl.temperature
            m_sal = model_lvl.salinity

            t_diff = None
            if m_temp is not None and matched_obs_temp is not None:
                t_diff = round(m_temp - matched_obs_temp, 3)
                temp_diffs.append(t_diff)
                temp_abs_diffs.append(abs(t_diff))
                temp_sq_diffs.append(t_diff ** 2)

            s_diff = None
            if m_sal is not None and matched_obs_sal is not None:
                s_diff = round(m_sal - matched_obs_sal, 3)
                sal_diffs.append(s_diff)
                sal_abs_diffs.append(abs(s_diff))
                sal_sq_diffs.append(s_diff ** 2)

            points_comparison.append(
                ProfileComparisonPoint(
                    depth=model_depth,
                    model_temp=m_temp,
                    obs_temp=matched_obs_temp,
                    temp_diff=t_diff,
                    model_sal=m_sal,
                    obs_sal=matched_obs_sal,
                    sal_diff=s_diff
                )
            )

        # 4. Surface metrics (depth ~ 5m)
        surface_pt = next((p for p in points_comparison if p.depth == 5.0), points_comparison[0])

        # 5. Compute statistical validation metrics
        t_bias = round(float(np.mean(temp_diffs)), 3) if temp_diffs else None
        t_mae = round(float(np.mean(temp_abs_diffs)), 3) if temp_abs_diffs else None
        t_rmse = round(float(np.sqrt(np.mean(temp_sq_diffs))), 3) if temp_sq_diffs else None

        s_bias = round(float(np.mean(sal_diffs)), 3) if sal_diffs else None
        s_mae = round(float(np.mean(sal_abs_diffs)), 3) if sal_abs_diffs else None
        s_rmse = round(float(np.sqrt(np.mean(sal_sq_diffs))), 3) if sal_sq_diffs else None

        metrics = ValidationMetrics(
            temperature_bias=t_bias,
            temperature_mae=t_mae,
            temperature_rmse=t_rmse,
            salinity_bias=s_bias,
            salinity_mae=s_mae,
            salinity_rmse=s_rmse,
            sample_size=len(temp_diffs)
        )

        return ComparisonResponse(
            platform_number=str(platform_id),
            cycle_number=profile.cycle_number,
            observation_time=obs_time,
            model_time=query_time,
            latitude=lat,
            longitude=lon,
            matched_model_lat=grid_lat,
            matched_model_lon=grid_lon,
            surface_depth=surface_pt.depth,
            obs_temperature=surface_pt.obs_temp,
            model_temperature=surface_pt.model_temp,
            temperature_diff=surface_pt.temp_diff,
            obs_salinity=surface_pt.obs_sal,
            model_salinity=surface_pt.model_sal,
            salinity_diff=surface_pt.sal_diff,
            profile_comparison=points_comparison,
            metrics=metrics,
            notes="Collocated match against INCOIS ARGO Monthly VAM grid. Error metrics computed across full vertical water column."
        )


comparison_service = ComparisonService()
