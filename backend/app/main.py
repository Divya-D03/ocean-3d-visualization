from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Production MVP API for Ocean 3D Explorer — Integrating INCOIS ERDDAP numerical ocean models with in-situ ARGO observations.",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all /api routes
app.include_router(api_router)


# Root endpoints
@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to Ocean 3D Explorer API",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "version": settings.VERSION,
    }


@app.get("/health", tags=["health"])
async def direct_health():
    """Top-level health endpoint alias."""
    from app.api.endpoints.health import health_check
    return await health_check()
