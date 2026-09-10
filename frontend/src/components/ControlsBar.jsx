import { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Play,
  Pause,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';

export default function ControlsBar() {
  const selectedParam = useOceanStore((state) => state.selectedParam);
  const setSelectedParam = useOceanStore((state) => state.setSelectedParam);
  const depth = useOceanStore((state) => state.depth);
  const setDepth = useOceanStore((state) => state.setDepth);
  const availableDepths = useOceanStore((state) => state.availableDepths);

  const time = useOceanStore((state) => state.time);
  const setTime = useOceanStore((state) => state.setTime);
  const availableTimes = useOceanStore((state) => state.availableTimes);
  const isPlaying = useOceanStore((state) => state.isPlaying);
  const togglePlay = useOceanStore((state) => state.togglePlay);
  const stepNextTime = useOceanStore((state) => state.stepNextTime);

  const layerVisibility = useOceanStore((state) => state.layerVisibility);
  const toggleLayer = useOceanStore((state) => state.toggleLayer);

  const [layersOpen, setLayersOpen] = useState(false);

  // Animation loop for time stepping
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        stepNextTime();
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, stepNextTime]);

  const params = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°C' },
    { id: 'salinity', label: 'Salinity', icon: Droplets, unit: 'PSU' },
    { id: 'currents', label: 'Currents', icon: Wind, unit: 'cm/s' },
    { id: 'observations', label: 'ARGO Floats', icon: Compass, unit: 'CTD' },
  ];

  // Format ISO time to readable format "Jan 2020"
  const formatTimeLabel = (isoStr) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-950/85 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/80">
        {/* 1. Parameter Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          {params.map((p) => {
            const Icon = p.icon;
            const isActive = selectedParam === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedParam(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Depth Slider (Disabled for surface currents) */}
        <div className="flex items-center gap-3 px-3 py-1 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400">
            Depth:{' '}
            <span className="font-bold text-cyan-400">{depth}m</span>
          </div>
          <input
            type="range"
            min="0"
            max={availableDepths.length - 1}
            step="1"
            value={Math.max(0, availableDepths.indexOf(depth))}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              setDepth(availableDepths[idx]);
            }}
            className="w-28 sm:w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* 3. Time Controller & Play/Pause */}
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/60 rounded-xl border border-slate-800">
          <button
            onClick={togglePlay}
            className={`p-1.5 rounded-lg transition ${
              isPlaying
                ? 'bg-amber-600 text-white'
                : 'bg-cyan-700 text-white hover:bg-cyan-600'
            }`}
            title={isPlaying ? 'Pause Animation' : 'Play Time Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-transparent text-xs font-mono text-cyan-300 font-medium focus:outline-none cursor-pointer"
          >
            {availableTimes.map((t) => (
              <option key={t} value={t} className="bg-slate-900 text-white">
                {formatTimeLabel(t)}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Layer Visibility Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-medium transition"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Layers</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {layersOpen && (
            <div className="absolute bottom-12 right-0 w-48 p-2.5 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-xl z-50 text-xs text-slate-300 space-y-2">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                Toggle 3D Layers
              </div>
              <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.gridded}
                  onChange={() => toggleLayer('gridded')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Gridded Model Field</span>
              </label>
              <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.currents}
                  onChange={() => toggleLayer('currents')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Current Vectors (GEO_U/V)</span>
              </label>
              <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.floats}
                  onChange={() => toggleLayer('floats')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>ARGO Observation Points</span>
              </label>
              <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.surface}
                  onChange={() => toggleLayer('surface')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Ocean Surface Plane</span>
              </label>
              <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.coastlines}
                  onChange={() => toggleLayer('coastlines')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Coastline Outlines</span>
              </label>
              <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={layerVisibility.depthGrid}
                  onChange={() => toggleLayer('depthGrid')}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Depth Grid & Pillars</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
