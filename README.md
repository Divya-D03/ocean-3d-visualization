# 🌊 Ocean 3D Explorer

> **Smart India Hackathon (SIH) MVP**  
> Interactive 3D Ocean Data Visualization Platform Integrating Numerical Ocean Model Outputs with Real-World In-Situ ARGO Observations.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-r168+-black?logo=three.js)](https://threejs.org)
[![INCOIS ERDDAP](https://img.shields.io/badge/Data-INCOIS%20ERDDAP-0284c7)](https://erddap.incois.gov.in/erddap)

---

## 📌 Project Objective & SIH Problem Context

Operational oceanographers, climate scientists, and maritime planners require intuitive tools to explore complex 3D ocean dynamics across space, depth, and time. Existing tools often isolate gridded numerical model analyses from in-situ observational platforms or require downloading massive NetCDF files locally.

**Ocean 3D Explorer** solves this problem by connecting directly to the **Indian National Centre for Ocean Information Services (INCOIS) ERDDAP** data server. It renders interactive 3D scalar depth slices (temperature, salinity), historical current vector fields, and in-situ ARGO float profiles in the browser. Crucially, it provides a **Model vs Observation validation engine** that performs 3D collocation to compute scientific validation metrics (**Difference $\Delta$, Bias, MAE, and RMSE**) across the vertical water column in real-time.

---

## 🏗️ Core Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        INCOIS ERDDAP Portal                            │
│  · Indian_ARGO_Floats (tabledap: in-situ float CTD profiles)           │
│  · incois_argo_mnt_VAM (griddap: gridded monthly TEMP, SAL, ZAX)       │
│  · incois_valueadded_products_datasets (griddap: historical GEO_U/V)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Live Subsetting (RFC 3986 Encoded)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI REST Backend                            │
│  · erddap_service.py: Asynchronous HTTP querying with SSL handling     │
│  · cache_service.py: Memory & Disk response caching (data/cache/)      │
│  · ocean_service.py: Gridded temperature, salinity, currents, profiles │
│  · observation_service.py: ARGO float clustering & CTD extraction      │
│  · comparison_service.py: Collocated model vs float validation metrics │
│  · db/: SQLAlchemy / PostGIS models + resilient local fallback         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Clean Optimized JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        React + Vite Frontend                           │
│  · Zustand Global State (variable, depth, time, selected float, layers)│
│  · Axios API Client with loading & error interceptors                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Three.js 3D Scientific Scene                        │
│  · 3D Ocean Surface & Indian Ocean Basin Coordinate System             │
│  · Gridded Scalar Layer (Temperature / Salinity depth planes)          │
│  · Dynamic Flow Streamlines / Particle Field (Historical Currents)     │
│  · Interactive ARGO Float Markers (Raycaster hover/click selection)    │
│  · Vertical CTD Depth Profiles & Side-by-Side Model Validation UI      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Integrated INCOIS Datasets

1. **Indian ARGO Floats (`Indian_ARGO_Floats`)**
   - **Type:** `tabledap`
   - **Role:** Real-world in-situ observation points and vertical CTD profiles.
   - **Variables:** `PLATFORM_NUMBER`, `CYCLE_NUMBER`, `time`, `latitude`, `longitude`, `PRES_ADJUSTED`, `TEMP_ADJUSTED`, `PSAL_ADJUSTED`.
2. **INCOIS ARGO Monthly VAM (`incois_argo_mnt_VAM`)**
   - **Type:** `griddap`
   - **Role:** 3D gridded numerical ocean analysis for the Indian Ocean basin (Lat -29.5° to 29.5°, Lon 30.5° to 119.5°).
   - **Variables:** `TEMP` (°C), `SAL` (PSU), `ZAX` (depth: 24 levels from 5.0m to 2000.0m).
3. **INCOIS Value Added Products (`incois_valueadded_products_datasets`)**
   - **Type:** `griddap`
   - **Role:** Historical geostrophic ocean current components.
   - **Variables:** `GEO_U` (zonal velocity), `GEO_V` (meridional velocity).
   - *Note:* Treated as historical analysis, not a real-time current feed.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, Three.js, `@react-three/fiber`, `@react-three/drei`, Tailwind CSS, Lucide React, Zustand, Axios.
- **Backend:** Python 3.11+, FastAPI, Uvicorn, httpx, NumPy, Pandas, xarray, SQLAlchemy.
- **Database:** PostgreSQL + PostGIS (SQLAlchemy schema included; resilient local cache fallback enabled when offline).
- **Data Integration:** INCOIS ERDDAP REST API.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v24+)
- **Python**: 3.11+ (tested on Python 3.14)
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional, sensible defaults included)
copy .env.example .env

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be accessible at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Health Endpoint:** `http://127.0.0.1:8000/api/health`

---

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

Frontend will be accessible at `http://localhost:5173`.

---

### 3. Database Setup (Optional PostGIS)

By default, the platform uses an **in-memory metadata cache and direct ERDDAP queries** (`ENABLE_DB_FALLBACK=true`), allowing it to run out of the box without requiring local PostgreSQL.

To connect PostgreSQL with PostGIS for persistent spatial indexing:
```bash
# Using Docker Compose
docker compose up -d db

# Or configure your local PostgreSQL instance in backend/.env:
DATABASE_URL=postgresql+psycopg2://ocean:ocean@localhost:5432/oceandb
```
The SQLAlchemy models in `backend/app/models/observation.py` will automatically create the required platform and profile tables upon database connection.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, ERDDAP connection status, DB connection status |
| `GET` | `/api/ocean/metadata` | Available depths, time slices, presets, and basin bounds |
| `GET` | `/api/ocean/temperature` | 2D horizontal depth slice of temperature (°C) |
| `GET` | `/api/ocean/salinity` | 2D horizontal depth slice of salinity (PSU) |
| `GET` | `/api/ocean/currents` | Surface current vectors (`u`, `v`, `speed`, `direction`) |
| `GET` | `/api/ocean/profile` | Vertical CTD profile across depth at a given lat/lon |
| `GET` | `/api/observations` | In-situ ARGO float station summaries and coordinates |
| `GET` | `/api/observations/{id}` | Full vertical CTD profile for a specific ARGO float |
| `GET` | `/api/comparison` | Collocated model vs observation comparison & metrics (Bias, MAE, RMSE) |

---

## 🔬 Scientific Validation Methodology

When an ARGO float is selected, the platform collocates the float's coordinate $(lat, lon, depth, time)$ with the nearest grid cell in INCOIS Monthly VAM:

1. **Difference ($\Delta$):**
   $$\Delta T = T_{\text{model}} - T_{\text{observed}}$$
   $$\Delta S = S_{\text{model}} - S_{\text{observed}}$$
2. **Bias (Mean Error):**
   $$\text{Bias} = \frac{1}{N} \sum_{i=1}^{N} (X_{\text{model}, i} - X_{\text{observed}, i})$$
3. **Mean Absolute Error (MAE):**
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |X_{\text{model}, i} - X_{\text{observed}, i}|$$
4. **Root Mean Square Error (RMSE):**
   $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (X_{\text{model}, i} - X_{\text{observed}, i})^2}$$

---

## ⚠️ Scientific Assumptions & Limitations

1. **Spatial Resolution:** The INCOIS Monthly VAM provides objective analysis at a $1.0^\circ \times 1.0^\circ$ horizontal grid resolution. Fine-scale sub-mesoscale eddies and coastal boundary layers under 100km are not resolved by the monthly climatological analysis.
2. **Nearest-Neighbor Collocation:** In-situ float observations are collocated to the nearest $0.5^\circ$ center grid cell of the model domain. For rigorous scientific comparisons, float trajectories are preserved with their exact decimal degree coordinates.
3. **Currents Dataset Temporal Range:** The `incois_valueadded_products_datasets` (GEO_U and GEO_V) is treated strictly as **historical analysis data** (2004–2019) and is not presented as a real-time current feed.
4. **Vertical Depth Levels:** Standard numerical model depth slices are extracted across 24 discrete ZAX levels (5m to 2000m). Float CTD measurements are mapped to the closest model depth level within scientific tolerance thresholds.

---

## 📁 Project Structure

```text
ocean-3d-visualization/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── comparison.py     # Model vs ARGO validation endpoints
│   │   │   │   ├── health.py         # System health & diagnostics
│   │   │   │   ├── observations.py   # ARGO float observations
│   │   │   │   └── ocean.py          # Temperature, salinity, currents, profiles
│   │   │   └── __init__.py           # API root router
│   │   ├── core/
│   │   │   └── config.py             # Pydantic environment configuration
│   │   ├── db/
│   │   │   └── __init__.py           # SQLAlchemy engine with resilient fallback
│   │   ├── models/
│   │   │   └── observation.py        # PostGIS SQLAlchemy models
│   │   ├── schemas/
│   │   │   ├── comparison.py         # Validation & difference schemas
│   │   │   ├── observation.py        # ARGO profile schemas
│   │   │   └── ocean.py              # Gridded slices & current schemas
│   │   ├── services/
│   │   │   ├── cache_service.py      # In-memory & disk caching
│   │   │   ├── comparison_service.py # Collocation & statistical metrics
│   │   │   ├── erddap_service.py     # RFC 3986 compliant INCOIS HTTP client
│   │   │   ├── observation_service.py# ARGO float parser & profile extractor
│   │   │   └── ocean_service.py      # Numerical model gridded slicer
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ColorbarLegend.jsx    # Scientific color gradient & units
│   │   │   ├── ComparisonPanel.jsx   # Side-by-side validation & CTD chart
│   │   │   ├── ControlsBar.jsx       # Floating bottom parameter & depth deck
│   │   │   ├── DatasetInfoModal.jsx  # Documentation & SIH modal
│   │   │   ├── LoadingOverlay.jsx    # Animated loading indicators
│   │   │   └── Navbar.jsx            # Brand, presets, and status badges
│   │   ├── services/
│   │   │   └── api.js                # Axios client for backend APIs
│   │   ├── store/
│   │   │   └── useOceanStore.js      # Zustand global state manager
│   │   ├── three/
│   │   │   ├── ArgoFloatMarkers.jsx  # Interactive 3D floats & depth lines
│   │   │   ├── coords.js             # Geographic to 3D coordinate math
│   │   │   ├── CurrentParticles.jsx  # Flow particles for GEO_U / GEO_V
│   │   │   ├── DepthGrid.jsx         # 3D bounding box & depth markers
│   │   │   ├── GriddedLayer.jsx      # Scalar surface plane with vertex colors
│   │   │   ├── OceanBasin.jsx        # Ocean surface, bathymetry, coastlines
│   │   │   └── OceanScene.jsx        # R3F Canvas, lighting, & OrbitControls
│   │   ├── utils/
│   │   │   └── colormaps.js          # Turbo, Viridis, Haline, Speed colormaps
│   │   ├── App.jsx                   # Main layout container
│   │   ├── index.css                 # Dark ocean aesthetic & custom scrollbars
│   │   └── main.jsx                  # React entry point
│   ├── package.json
│   ├── vite.config.js                # Dev proxy to FastAPI backend
│   └── tailwind.config.js
│
├── data/
│   ├── cache/                        # Cached ERDDAP responses (auto-created)
│   └── sample/                       # Offline fallback datasets
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔮 Roadmap & Future Enhancements

- [ ] **Volumetric 3D Shaders:** Direct 3D Raymarching / Marching Cubes isosurface extraction for thermoclines.
- [ ] **Glider & CTD Ship Cruise Integration:** Support for mobile autonomous gliders and high-resolution shipboard CTD tracks.
- [ ] **Automated Daily Sync:** Cron-based ingestion worker updating local PostGIS tables with newly surfaced ARGO profiles.
- [ ] **Multi-Model Comparison:** Inter-comparison between INCOIS GODAS, ROMS, and global Copernicus Marine (CMEMS) models.

---

## 📄 License

Developed for the **Smart India Hackathon (SIH)**. Scientific datasets provided courtesy of **INCOIS (Indian National Centre for Ocean Information Services)**.
