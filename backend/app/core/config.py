from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Ocean 3D Explorer API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # INCOIS ERDDAP Configuration
    ERDDAP_BASE_URL: str = "https://erddap.incois.gov.in/erddap"
    # Set to False because INCOIS ERDDAP uses Indian NIC certs not present in default Mozilla CA bundle
    ERDDAP_VERIFY_SSL: bool = False
    ERDDAP_TIMEOUT_SECONDS: float = 25.0

    # Datasets
    DATASET_ARGO_FLOATS: str = "Indian_ARGO_Floats"
    DATASET_GRIDDED_VAM: str = "incois_argo_mnt_VAM"
    DATASET_CURRENTS: str = "incois_valueadded_products_datasets"

    # Caching
    CACHE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "cache")
    CACHE_TTL_SECONDS: int = 7200  # 2 hours

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://ocean:ocean@localhost:5432/oceandb"
    ENABLE_DB_FALLBACK: bool = True

    # CORS — allow Vite dev server and common frontend hosts
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
