from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db import Base


class Platform(Base):
    """Oceanographic platform / station metadata."""
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform_number = Column(String(32), unique=True, nullable=False, index=True)
    platform_type = Column(String(64), default="ARGO Float")
    data_centre = Column(String(32), default="INCOIS")


class ArgoProfileRecord(Base):
    """Observation profile header record."""
    __tablename__ = "argo_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform_number = Column(String(32), ForeignKey("platforms.platform_number"), nullable=False, index=True)
    cycle_number = Column(Integer, nullable=False)
    time = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    measurements = relationship("ArgoMeasurementRecord", back_populates="profile", cascade="all, delete-orphan")


class ArgoMeasurementRecord(Base):
    """In-situ CTD measurement point across depth column."""
    __tablename__ = "argo_measurements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("argo_profiles.id"), nullable=False, index=True)
    depth = Column(Float, nullable=False)  # Pressure in dbar / Depth in meters
    temperature = Column(Float, nullable=True)  # °C
    salinity = Column(Float, nullable=True)  # PSU
    qc_flag = Column(Integer, default=1)

    profile = relationship("ArgoProfileRecord", back_populates="measurements")
