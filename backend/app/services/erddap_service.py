import httpx
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.services.cache_service import cache_service

logger = logging.getLogger("erddap_service")
logging.basicConfig(level=logging.INFO)


class ErddapService:
    def __init__(self):
        self.base_url = settings.ERDDAP_BASE_URL.rstrip("/")
        self.verify_ssl = settings.ERDDAP_VERIFY_SSL
        self.timeout = settings.ERDDAP_TIMEOUT_SECONDS

    async def get_client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout)

    async def check_health(self) -> Dict[str, Any]:
        """Verify connectivity to INCOIS ERDDAP."""
        cache_key = "erddap_health_status"
        cached = cache_service.get(cache_key)
        if cached is not None:
            return cached

        url = f"{self.base_url}/status.html"
        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=8.0) as client:
                res = await client.get(url)
                is_ok = res.status_code == 200
                status_info = {
                    "connected": is_ok,
                    "status_code": res.status_code,
                    "base_url": self.base_url,
                    "ssl_verification": self.verify_ssl,
                }
                cache_service.set(cache_key, status_info, ttl=60)
                return status_info
        except Exception as e:
            logger.warning(f"ERDDAP health check failed: {e}")
            return {
                "connected": False,
                "error": str(e),
                "base_url": self.base_url,
                "ssl_verification": self.verify_ssl,
            }

    async def query_gridded_vam(
        self,
        variable: str,
        time_iso: str,
        depth: float,
        lat_min: float,
        lat_max: float,
        lon_min: float,
        lon_max: float,
    ) -> Optional[Dict[str, Any]]:
        """
        Query INCOIS ARGO Monthly VAM griddap dataset.
        Properly encodes RFC 3986 brackets (%5B, %5D) to prevent Tomcat 400 Bad Request.
        """
        cache_key = f"vam_{variable}_{time_iso}_{depth}_{lat_min}_{lat_max}_{lon_min}_{lon_max}"
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        # INCOIS VAM constraints: Lat -29.5 to 29.5, Lon 30.5 to 119.5
        clamped_lat_min = max(-29.5, min(29.5, lat_min))
        clamped_lat_max = max(-29.5, min(29.5, lat_max))
        clamped_lon_min = max(30.5, min(119.5, lon_min))
        clamped_lon_max = max(30.5, min(119.5, lon_max))

        # Format URL with encoded brackets: %5B for [ and %5D for ]
        query_str = (
            f"{variable}"
            f"%5B({time_iso})%5D"
            f"%5B({depth})%5D"
            f"%5B({clamped_lat_min:.1f}):({clamped_lat_max:.1f})%5D"
            f"%5B({clamped_lon_min:.1f}):({clamped_lon_max:.1f})%5D"
        )
        url = f"{self.base_url}/griddap/{settings.DATASET_GRIDDED_VAM}.json?{query_str}"

        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                logger.info(f"Querying INCOIS ERDDAP VAM: {url}")
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    cache_service.set(cache_key, data)
                    return data
                else:
                    logger.warning(f"VAM query status {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.error(f"Error querying VAM: {e}")

        return None

    async def query_currents(
        self,
        time_iso: str,
        lat_min: float,
        lat_max: float,
        lon_min: float,
        lon_max: float,
    ) -> Optional[Dict[str, Any]]:
        """
        Query INCOIS Value Added Products (GEO_U, GEO_V).
        """
        cache_key = f"currents_{time_iso}_{lat_min}_{lat_max}_{lon_min}_{lon_max}"
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        clamped_lat_min = max(-29.5, min(29.5, lat_min))
        clamped_lat_max = max(-29.5, min(29.5, lat_max))
        clamped_lon_min = max(30.5, min(119.5, lon_min))
        clamped_lon_max = max(30.5, min(119.5, lon_max))

        # GEO_U and GEO_V dimensions: time, lat, lon
        u_query = f"GEO_U%5B({time_iso})%5D%5B({clamped_lat_min:.1f}):({clamped_lat_max:.1f})%5D%5B({clamped_lon_min:.1f}):({clamped_lon_max:.1f})%5D"
        v_query = f"GEO_V%5B({time_iso})%5D%5B({clamped_lat_min:.1f}):({clamped_lat_max:.1f})%5D%5B({clamped_lon_min:.1f}):({clamped_lon_max:.1f})%5D"
        url = f"{self.base_url}/griddap/{settings.DATASET_CURRENTS}.json?{u_query},{v_query}"

        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                logger.info(f"Querying INCOIS ERDDAP Currents: {url}")
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    cache_service.set(cache_key, data)
                    return data
                else:
                    logger.warning(f"Currents query status {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.error(f"Error querying Currents: {e}")

        return None

    async def query_argo_floats(
        self,
        lat_min: float = -10.0,
        lat_max: float = 25.0,
        lon_min: float = 55.0,
        lon_max: float = 95.0,
        time_start: str = "2020-01-01T00:00:00Z",
        time_end: str = "2020-03-01T00:00:00Z",
    ) -> Optional[Dict[str, Any]]:
        """
        Query Indian ARGO Floats (tabledap).
        Fields: PLATFORM_NUMBER, CYCLE_NUMBER, time, latitude, longitude, PRES_ADJUSTED, TEMP_ADJUSTED, PSAL_ADJUSTED.
        """
        cache_key = f"argo_floats_{lat_min}_{lat_max}_{lon_min}_{lon_max}_{time_start}_{time_end}"
        cached = cache_service.get(cache_key)
        if cached:
            return cached

        fields = "PLATFORM_NUMBER,CYCLE_NUMBER,time,latitude,longitude,PRES_ADJUSTED,TEMP_ADJUSTED,PSAL_ADJUSTED"
        filters = (
            f"&latitude>={lat_min:.2f}&latitude<={lat_max:.2f}"
            f"&longitude>={lon_min:.2f}&longitude<={lon_max:.2f}"
            f"&time>={time_start}&time<={time_end}"
        )
        url = f"{self.base_url}/tabledap/{settings.DATASET_ARGO_FLOATS}.json?{fields}{filters}"

        try:
            async with httpx.AsyncClient(verify=self.verify_ssl, timeout=self.timeout) as client:
                logger.info(f"Querying INCOIS ARGO Floats: {url}")
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    cache_service.set(cache_key, data, ttl=14400)
                    return data
                else:
                    logger.warning(f"ARGO query status {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.error(f"Error querying ARGO floats: {e}")

        return None


erddap_service = ErddapService()
