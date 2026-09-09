# Models package — Pydantic schemas + SQLAlchemy ORM models
# TODO (Database/PostGIS team): define ORM models here using app.db.Base
# TODO (Backend API team): define Pydantic request/response schemas here
# Example ORM model:
#   from sqlalchemy import Column, Integer, String
#   from geoalchemy2 import Geometry
#   from app.db import Base
#
#   class Observation(Base):
#       __tablename__ = "observations"
#       id = Column(Integer, primary_key=True)
#       location = Column(Geometry("POINT", srid=4326))
