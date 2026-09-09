from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="Ocean 3D Visualization API",
    version="0.1.0",
    description="Backend API for the Ocean 3D Visualization Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint — confirms the API is running."""
    return {"status": "ok"}
