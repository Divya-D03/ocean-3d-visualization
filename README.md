# 🌊 Ocean 3D Visualization Platform (INCOIS)

A web-based, browser-native **3D Ocean Data Visualization System** designed to integrate INCOIS ocean model outputs (NetCDF) with real-time observational data (Argo floats, Gliders, CTD) in a single interactive environment. 

This platform empowers operational oceanographers to perform rapid, intuitive analysis of complex 3D ocean phenomena (temperature, salinity, currents, chlorophyll) across the full water column, improving hazard assessment, search-and-rescue, and fishery advisories. It also serves as a powerful science communication tool for public outreach.

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────────────────┐
│                         Data Sources                               │
│  INCOIS Ocean Models (NetCDF) · Argo Floats · Underwater Gliders   │
└────────────────────┬───────────────────────────────────────────────┘
                     │  NetCDF / CSV / ASCII files
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│              Python Processing  (backend/app/processing/)          │
│  xarray · PyNIO · NumPy  →  normalize, interpolate, slice          │
└────────────────────┬───────────────────────────────────────────────┘
                     │  cleaned records & spatial data
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐   ┌──────────────────────┐
┌──────────────────┐   ┌──────────────────────┐
│  PostgreSQL +    │   │  Processed NetCDF /  │
│  PostGIS (DB)    │   │  CSV (data/processed)│
└────────┬─────────┘   └──────────────────────┘
         │ (Argo/Glider Coordinates)
         ▼
┌────────────────────────────────────────────────────────────────────┐
│                    FastAPI  (backend/app/main.py)                  │
│  REST API · GeoJSON responses · Data subsetting & extraction       │
└────────────────────┬───────────────────────────────────────────────┘
                     │  JSON / GeoJSON / Binary Arrays
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│            React + Three.js / React Three Fiber  (frontend/)       │
│  Volumetric Rendering · Depth Slices · Markers · Zustand State     │
└────────────────────┬───────────────────────────────────────────────┘
                     │
                     ▼
          Operational Forecasters & Public
```

---

## 📁 Folder Structure

```text
ocean-3d-visualization/
│
├── backend/                        # Python / FastAPI service
│   ├── app/
│   │   ├── main.py                 # App entry point, CORS, /health route
│   │   ├── api/                    # REST endpoints (temperature, salinity)
│   │   ├── core/config.py          # Pydantic settings (reads .env)
│   │   ├── db/__init__.py          # SQLAlchemy engine + session factory
│   │   ├── processing/             # NetCDF/xarray processing pipelines
│   │   └── models/                 # PostGIS Models (Floats, Gliders)
│   ├── requirements.txt
│   ├── .env.example                
│   └── Dockerfile
│
├── frontend/                       # React + Three.js SPA
│   ├── src/
│   │   ├── components/             # UI: Colorbars, Sliders, Overlays
│   │   ├── scenes/                 # 3D: Volumetric ocean, Argo markers
│   │   ├── App.jsx                 # Root component
│   │   └── main.jsx                # React DOM entry
│   ├── package.json
│   ├── vite.config.js              # Dev proxy → backend:8000
│   └── .env.example
│
├── data/
│   ├── raw/                        # gitignored — drop .nc and .csv files here
│   └── processed/                  # gitignored — pipeline output
│
├── docker-compose.yml              # PostGIS DB + backend + frontend
├── .gitignore
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

| Tool | Minimum version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| Docker + Docker Compose | v2+ |

---

### 1 · Database (Docker)

Spin up PostgreSQL + PostGIS (for Argo float/Glider geospatial queries) with a single command:

```bash
docker-compose up -d db
```

The database will be available at `localhost:5432` with:
- **user** `ocean` / **password** `ocean` / **database** `oceandb`

*(Note: `docker-compose up` without arguments will spin up the DB, Backend, and Frontend all via Docker, but for active development, running Backend and Frontend natively via steps 2 and 3 is recommended).*

---

### 2 · Backend (FastAPI)

```bash
# 1. Create and activate a virtual environment
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# 2. Install dependencies (FastAPI, xarray, netCDF4, GeoAlchemy2)
pip install -r requirements.txt

# 3. Copy and configure environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL if needed

# 4. Start the dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: [http://localhost:8000/health](http://localhost:8000/health) → `{"status":"ok"}`
Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3 · Frontend (React + Three.js)

```bash
cd frontend

# Install dependencies (three, @react-three/fiber, zustand)
npm install

# Copy environment variables
cp .env.example .env.local

# Start the Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the scaffold rotating test cube confirming the WebGL pipeline works.

---

## 👥 Team Task Areas

### 📊 Data Processing / Backend API
> **Owner:** _TBD_

- **NetCDF Ingestion:** Use `xarray` and `netCDF4` to parse INCOIS model outputs (Temperature, Salinity, Currents, Chlorophyll).
- **REST API:** Build endpoints in FastAPI that allow the frontend to request specific variables, time-steps, and depth slices without downloading the entire dataset.

---

### 🗄️ Database / PostGIS
> **Owner:** _TBD_

- **In-Situ Data Models:** Define SQLAlchemy ORM models with PostGIS geometry for Argo floats, Gliders, and CTD sensors.
- **Geospatial Queries:** Optimize the DB to rapidly serve instrument markers based on the frontend's current bounding box and time slider.

---

### 🖥️ Frontend UI / Dashboard
> **Owner:** _TBD_

- **Interactive Controls:** Build the variable selector, depth-slice navigation, and time-step animation controls.
- **Dynamic Colorbar:** Create a customizable colorbar editor (color palette, min/max range, log/linear scales).
- **Data Panels:** Build the pop-up charts (depth-vs-variable profile) that appear when a user clicks an Argo float.

---

### 🌊 3D / WebGL Visualization
> **Owner:** _TBD_

- **Volumetric Rendering:** Use React Three Fiber to render the ocean model fields across the full water column.
- **Isosurfaces & Slices:** Implement shaders/materials for depth-slice views and vertical exaggeration.
- **Instrument Overlay:** Plot geospatially accurate 3D markers for observational instruments within the water column.

---

## 🎯 Project Context

This platform addresses a critical gap identified by **INCOIS**: the lack of an integrated, web-based 3D visualization platform capable of simultaneously rendering complex ocean model fields and in-situ instrument observations. 

By utilizing open standards (CF Conventions for NetCDF, OGC) and modern browser-native technologies, this tool transforms massive numerical model outputs into intuitive visual experiences for operational decision-making, hazard assessment, and public science communication.

---

## 👩‍💻 Author

**Divya D** · [@Divya-D03](https://github.com/Divya-D03)
