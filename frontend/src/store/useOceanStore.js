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
} from '../services/api';

export const useOceanStore = create((set, get) => ({
  // Active parameter
  selectedParam: 'temperature', // 'temperature' | 'salinity' | 'currents' | 'observations'
  depth: 5.0,
  time: '2020-01-15T00:00:00Z',
  
  // Region & Bounds
  activeRegion: 'Arabian Sea',
  bounds: { lat_min: 5.0, lat_max: 25.0, lon_min: 50.0, lon_max: 77.0 },
  presets: {},

  // Metadata
  availableDepths: [5.0, 10.0, 20.0, 30.0, 50.0, 75.0, 100.0, 150.0, 200.0, 300.0, 500.0, 1000.0, 2000.0],
  availableTimes: ['2020-01-15T00:00:00Z', '2019-07-15T00:00:00Z', '2019-01-15T00:00:00Z', '2018-07-15T00:00:00Z', '2018-01-15T00:00:00Z'],
  currentsTimes: ['2018-01-10T00:00:00Z', '2017-07-10T00:00:00Z', '2017-01-10T00:00:00Z'],

  // Animation
  isPlaying: false,
  playbackSpeed: 2000,

  // Data states
  gridData: null,
  currentsData: null,
  observations: [],
  selectedFloat: null,
  selectedFloatProfile: null,
  comparisonData: null,

  // Layers
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

  // Select ARGO float
  selectFloat: async (floatSummary) => {
    set({ selectedFloat: floatSummary, isComparisonOpen: true, loading: true, loadingMessage: `Loading ARGO Float ${floatSummary.platform_number}...` });
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
    set({ selectedFloat: null, selectedFloatProfile: null, comparisonData: null, isComparisonOpen: false });
  },

  // Data Loading
  initPlatform: async () => {
    set({ loading: true, loadingMessage: 'Connecting to INCOIS ERDDAP services...' });
    try {
      const [health, meta] = await Promise.all([
        fetchHealth().catch(() => ({ status: 'degraded' })),
        fetchMetadata().catch(() => ({})),
      ]);

      set({
        healthStatus: health,
        availableDepths: meta.available_depths || get().availableDepths,
        availableTimes: meta.available_times || get().availableTimes,
        currentsTimes: meta.currents_times || get().currentsTimes,
        presets: meta.presets || {
          'Arabian Sea': { lat_min: 5.0, lat_max: 25.0, lon_min: 50.0, lon_max: 77.0 },
          'Bay of Bengal': { lat_min: 5.0, lat_max: 23.0, lon_min: 78.0, lon_max: 98.0 },
          'Equatorial Indian Ocean': { lat_min: -10.0, lat_max: 10.0, lon_min: 50.0, lon_max: 100.0 },
          'Full Indian Ocean': { lat_min: -25.0, lat_max: 25.0, lon_min: 40.0, lon_max: 110.0 },
        },
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
