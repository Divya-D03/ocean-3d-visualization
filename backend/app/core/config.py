from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Ocean 3D Visualization API"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://ocean:ocean@localhost:5432/oceandb"

    # CORS — allow the Vite dev server by default
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
