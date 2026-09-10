import { create } from 'zustand';
import {
  fetchHealth,
  fetchMetadata,
  fetchTemperature,
  fetchSalinity,
  fetchCurrents,
  fetchObservations,
  fetchFloatProfile,
  fetchComparison,
  fetchOceanProfile,
} from '../services/api';

// Bounding box delta for the 3D block view (~2° box: ±1.0° in lat and lon)
export const STATION_BOX_DELTA = 1.0;

export const DEFAULT_PRESETS = {
  'All': { lat_min: -25.0, lat_max: 25.0, lon_min: 40.0, lon_max: 110.0 },
  'Arabian Sea': { lat_min: 8.0, lat_max: 25.0, lon_min: 50.0, lon_max: 77.0 },
  'Bay of Bengal': { lat_min: 5.0, lat_max: 23.0, lon_min: 80.0, lon_max: 98.0 },
  'Lakshadweep Sea': { lat_min: 8.0, lat_max: 14.0, lon_min: 71.0, lon_max: 77.0 },
  'Andaman Sea': { lat_min: 6.0, lat_max: 16.0, lon_min: 92.0, lon_max: 99.0 },
};

export const useOceanStore = create((set, get) => ({
  // View mode: 'map' (overview 3D basin) or 'block3d' (station 3D depth-profile block)
  viewMode: 'map',

  // Active parameter on map
  selectedParam: 'temperature', // 'temperature' | 'salinity' | 'currents' | 'observations'
  depth: 5.0,
  time: '2020-01-15T00:00:00Z',

  // Region & Bounds
  activeRegion: 'All',
  bounds: DEFAULT_PRESETS['All'],
  presets: DEFAULT_PRESETS,

  // Metadata
  availableDepths: [5.0, 10.0, 20.0, 30.0, 50.0, 75.0, 100.0, 150.0, 200.0, 300.0, 500.0, 1000.0, 2000.0],
  availableTimes: ['2020-01-15T00:00:00Z', '2019-07-15T00:00:00Z', '2019-01-15T00:00:00Z', '2018-07-15T00:00:00Z', '2018-01-15T00:00:00Z'],
  currentsTimes: ['2018-01-10T00:00:00Z', '2017-07-10T00:00:00Z', '2017-01-10T00:00:00Z'],

  // Animation
  isPlaying: false,
  playbackSpeed: 2000,

  // Map Data states
  gridData: null,
  currentsData: null,
  observations: [],
  selectedFloat: null,
  selectedFloatProfile: null,
  comparisonData: null,

  // 3D Block View State
  blockStation: null,
  blockVariable: 'temperature', // 'temperature' | 'salinity'
  blockDepth: 5.0,
  blockTime: '2020-01-15T00:00:00Z',
  blockLayers: {
    scalarSlice: true,
    currentArrows: true,
    ctdColumn: true,
  },
  blockStationData: null,
  stationCache: {}, // stationId -> cached data
  blockLoading: false,
  blockError: null,

  // Layers on map
  layerVisibility: {
    surface: true,
    gridded: true,
    currents: true,
    floats: true,
    depthGrid: true,
    coastlines: true,
  },

  // Modals & Panels
  isComparisonOpen: false,
  isDatasetInfoOpen: false,

  // System
  loading: false,
  loadingMessage: '',
  error: null,
  healthStatus: null,

  // Actions
  setSelectedParam: (param) => {
    set({ selectedParam: param });
    get().loadActiveData();
  },

  setDepth: (depth) => {
    set({ depth });
    get().loadActiveData();
  },

  setTime: (time) => {
    set({ time });
    get().loadActiveData();
  },

  setRegion: (regionName) => {
    const presets = get().presets;
    if (presets[regionName]) {
      set({ activeRegion: regionName, bounds: presets[regionName] });
      get().loadActiveData();
      get().loadObservations();
    }
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  stepNextTime: () => {
    const { availableTimes, time } = get();
    const idx = availableTimes.indexOf(time);
    const nextIdx = (idx + 1) % availableTimes.length;
    set({ time: availableTimes[nextIdx] });
    get().loadActiveData();
  },

  toggleLayer: (layerKey) => {
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerKey]: !state.layerVisibility[layerKey],
      },
    }));
  },

  setComparisonOpen: (open) => set({ isComparisonOpen: open }),
  setDatasetInfoOpen: (open) => set({ isDatasetInfoOpen: open }),

  // Select ARGO float on map
  selectFloat: async (floatSummary) => {
    set({
      selectedFloat: floatSummary,
      isComparisonOpen: true,
      loading: true,
      loadingMessage: `Loading ARGO Float ${floatSummary.platform_number}...`,
    });
    try {
      const [profile, comparison] = await Promise.all([
        fetchFloatProfile(floatSummary.platform_number),
        fetchComparison(floatSummary.platform_number, get().depth, get().time),
      ]);
      set({
        selectedFloatProfile: profile,
        comparisonData: comparison,
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching float profile / comparison:', err);
      set({ error: 'Failed to load float details from INCOIS.', loading: false });
    }
  },

  closeFloatDetail: () => {
    set({
      selectedFloat: null,
      selectedFloatProfile: null,
      comparisonData: null,
      isComparisonOpen: false,
    });
  },

  // 3D Depth-Profile Block View Actions
  open3DProfile: async (station) => {
    const targetStation = station || get().selectedFloat;
    if (!targetStation) return;

    set({
      viewMode: 'block3d',
      blockStation: targetStation,
      blockVariable: 'temperature',
      blockDepth: 5.0,
      blockError: null,
    });

    await get().loadStationBlockData(targetStation);
  },

  close3DProfile: () => {
    set({ viewMode: 'map' });
  },

  toggleBlockLayer: (layerKey) => {
    set((state) => ({
      blockLayers: {
        ...state.blockLayers,
        [layerKey]: !state.blockLayers[layerKey],
      },
    }));
  },

  setBlockVariable: (variable) => {
    set({ blockVariable: variable });
    const { blockStation } = get();
    if (blockStation) {
      get().loadStationBlockData(blockStation);
    }
  },

  setBlockDepth: (depth) => {
    set({ blockDepth: depth });
    const { blockStation } = get();
    if (blockStation) {
      get().loadStationBlockData(blockStation);
    }
  },

  setBlockTime: (time) => {
    set({ blockTime: time });
    const { blockStation } = get();
    if (blockStation) {
      get().loadStationBlockData(blockStation);
    }
  },

  loadStationBlockData: async (station) => {
    const stationId = station.platform_number;
    const { blockVariable, blockDepth, blockTime, stationCache } = get();

    // Small ~2° bounding box around station's lat/lon
    const bounds = {
      lat_min: Math.max(-29.5, station.latitude - STATION_BOX_DELTA),
      lat_max: Math.min(29.5, station.latitude + STATION_BOX_DELTA),
      lon_min: Math.max(30.5, station.longitude - STATION_BOX_DELTA),
      lon_max: Math.min(119.5, station.longitude + STATION_BOX_DELTA),
    };

    let cached = stationCache[stationId] || {
      station,
      profile: null,
      griddedProfile: null,
      comparison: null,
      temperatureLayers: {},
      salinityLayers: {},
      currents: null,
    };

    set({ blockLoading: true, blockError: null });

    try {
      // 1. Fetch metadata/profile/comparison if not already cached
      const promises = [];

      if (!cached.profile) {
        promises.push(
          fetchFloatProfile(stationId).then((p) => {
            cached.profile = p;
          })
        );
      }

      if (!cached.griddedProfile) {
        promises.push(
          fetchOceanProfile({
            latitude: station.latitude,
            longitude: station.longitude,
            time: blockTime,
          }).then((gp) => {
            cached.griddedProfile = gp;
          })
        );
      }

      if (!cached.comparison) {
        promises.push(
          fetchComparison(stationId, blockDepth, blockTime).then((c) => {
            cached.comparison = c;
          })
        );
      }

      // 2. Fetch the active scalar variable layer for the 2° box
      const layerKey = `${blockTime}_${blockDepth}`;

      if (blockVariable === 'temperature' && !cached.temperatureLayers[layerKey]) {
        promises.push(
          fetchTemperature({ depth: blockDepth, time: blockTime, bounds }).then((grid) => {
            cached.temperatureLayers[layerKey] = grid;
          })
        );
      } else if (blockVariable === 'salinity' && !cached.salinityLayers[layerKey]) {
        promises.push(
          fetchSalinity({ depth: blockDepth, time: blockTime, bounds }).then((grid) => {
            cached.salinityLayers[layerKey] = grid;
          })
        );
      }

      // 3. Always ensure surface currents are loaded for the 2° box
      if (!cached.currents) {
        promises.push(
          fetchCurrents({ time: '2018-01-10T00:00:00Z', bounds }).then((curr) => {
            cached.currents = curr;
          })
        );
      }

      await Promise.all(promises);

      // Save to cache
      const updatedCache = { ...stationCache, [stationId]: cached };
      set({
        stationCache: updatedCache,
        blockStationData: cached,
        blockLoading: false,
      });

      // Background preload other standard depth levels for smooth volumetric slicing
      if (blockVariable === 'temperature' || blockVariable === 'salinity') {
        const depthsToPreload = [5.0, 50.0, 100.0, 200.0, 500.0, 1000.0, 2000.0].filter(
          (d) => d !== blockDepth
        );
        depthsToPreload.slice(0, 3).forEach((d) => {
          const k = `${blockTime}_${d}`;
          if (blockVariable === 'temperature' && !cached.temperatureLayers[k]) {
            fetchTemperature({ depth: d, time: blockTime, bounds })
              .then((grid) => {
                cached.temperatureLayers[k] = grid;
                set({ stationCache: { ...get().stationCache, [stationId]: cached } });
              })
              .catch(() => {});
          } else if (blockVariable === 'salinity' && !cached.salinityLayers[k]) {
            fetchSalinity({ depth: d, time: blockTime, bounds })
              .then((grid) => {
                cached.salinityLayers[k] = grid;
                set({ stationCache: { ...get().stationCache, [stationId]: cached } });
              })
              .catch(() => {});
          }
        });
      }
    } catch (err) {
      console.error('Error loading station block data:', err);
      set({
        blockLoading: false,
        blockError: 'Failed to fetch depth data from backend for this station. Please check connectivity.',
      });
    }
  },

  // Map Data Initialization
  initPlatform: async () => {
    set({ loading: true, loadingMessage: 'Connecting to INCOIS ERDDAP services...' });
    try {
      const [health, meta] = await Promise.all([
        fetchHealth().catch(() => ({ status: 'degraded' })),
        fetchMetadata().catch(() => ({})),
      ]);

      const mergedPresets = {
        ...DEFAULT_PRESETS,
        ...(meta.presets || {}),
      };

      set({
        healthStatus: health,
        availableDepths: meta.available_depths || get().availableDepths,
        availableTimes: meta.available_times || get().availableTimes,
        currentsTimes: meta.currents_times || get().currentsTimes,
        presets: mergedPresets,
      });

      // Load initial parameter slice and observations
      await Promise.all([get().loadActiveData(), get().loadObservations()]);
      set({ loading: false });
    } catch (err) {
      console.error('Initialization error:', err);
      set({ loading: false, error: 'Initialization error. Check backend status.' });
    }
  },

  loadActiveData: async () => {
    const { selectedParam, depth, time, bounds } = get();
    try {
      if (selectedParam === 'temperature') {
        const grid = await fetchTemperature({ depth, time, bounds });
        set({ gridData: grid, error: null });
      } else if (selectedParam === 'salinity') {
        const grid = await fetchSalinity({ depth, time, bounds });
        set({ gridData: grid, error: null });
      } else if (selectedParam === 'currents') {
        const currents = await fetchCurrents({ time: '2018-01-10T00:00:00Z', bounds });
        set({ currentsData: currents, error: null });
      }
    } catch (err) {
      console.error('Data load error:', err);
      set({ error: 'Failed to retrieve requested ocean parameter subset.' });
    }
  },

  loadObservations: async () => {
    const { bounds } = get();
    try {
      const res = await fetchObservations(bounds);
      set({ observations: res.floats || [] });
    } catch (err) {
      console.error('Failed to load observations:', err);
    }
  },
}));
