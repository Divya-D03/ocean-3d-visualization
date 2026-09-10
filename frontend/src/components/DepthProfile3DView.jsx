import { ArrowLeft, Thermometer, Droplets, Wind, AlertTriangle, Loader2, BarChart2, Compass, ShieldCheck } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';
import DepthProfileBlockScene from '../three/DepthProfileBlockScene';
import { getColormapCSSGradient } from '../utils/colormaps';

export default function DepthProfile3DView() {
  const blockStation = useOceanStore((state) => state.blockStation);
  const blockVariable = useOceanStore((state) => state.blockVariable);
  const setBlockVariable = useOceanStore((state) => state.setBlockVariable);
  const blockDepth = useOceanStore((state) => state.blockDepth);
  const setBlockDepth = useOceanStore((state) => state.setBlockDepth);
  const blockTime = useOceanStore((state) => state.blockTime);
  const setBlockTime = useOceanStore((state) => state.setBlockTime);
  const availableDepths = useOceanStore((state) => state.availableDepths);
  const availableTimes = useOceanStore((state) => state.availableTimes);
  const blockStationData = useOceanStore((state) => state.blockStationData);
  const blockLoading = useOceanStore((state) => state.blockLoading);
  const blockError = useOceanStore((state) => state.blockError);
  const close3DProfile = useOceanStore((state) => state.close3DProfile);

  const blockLayers = useOceanStore((state) => state.blockLayers) || {
    scalarSlice: true,
    currentArrows: true,
    ctdColumn: true,
  };
  const toggleBlockLayer = useOceanStore((state) => state.toggleBlockLayer);

  if (!blockStation) return null;

  const comparison = blockStationData?.comparison;
  const metrics = comparison?.metrics;

  const formatDate = (isoStr) => {
    try {
      return new Date(isoStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoStr;
    }
  };

  // Active layer stats for the colorbar
  const currentLayerKey = `${blockTime}_${blockDepth}`;
  const activeGrid = blockVariable === 'temperature'
    ? blockStationData?.temperatureLayers?.[currentLayerKey]
    : blockVariable === 'salinity'
    ? blockStationData?.salinityLayers?.[currentLayerKey]
    : null;

  const currents = blockStationData?.currents;

  let unit = blockVariable === 'salinity' ? 'PSU' : '°C';
  let cmapName = blockVariable === 'salinity' ? 'haline' : 'turbo';
  let minVal = blockVariable === 'salinity' ? 32.0 : 4.0;
  let maxVal = blockVariable === 'salinity' ? 37.0 : 30.0;
  let meanVal = null;

  if (activeGrid) {
    minVal = activeGrid.min_val ?? minVal;
    maxVal = activeGrid.max_val ?? maxVal;
    meanVal = activeGrid.mean_val;
  }

  const gradient = getColormapCSSGradient(cmapName);
  const speedGradient = getColormapCSSGradient('speed');
  const maxCurrentSpeed = currents?.max_speed ? Math.round(currents.max_speed) : 25.0;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#030712] select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-950/90 backdrop-blur-md border-b border-cyan-900/50 z-20">
        {/* Back to Map Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={close3DProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition active:scale-95 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Back to map</span>
          </button>

          {/* Station Metadata Details */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                3D Water Column Block &bull; ARGO #{blockStation.platform_number}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Cycle {blockStation.cycle_number}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Location: {blockStation.latitude.toFixed(3)}°N, {blockStation.longitude.toFixed(3)}°E &bull; {formatDate(blockStation.time)}
            </p>
          </div>
        </div>

        {/* Model vs Observation Validation Stats Badge */}
        {metrics && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Validation:</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span>
                Temp RMSE: <strong className="text-cyan-300">{metrics.temperature_rmse ?? '--'}°C</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                Bias: <strong className="text-cyan-300">{metrics.temperature_bias ?? '--'}°C</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                Sal RMSE: <strong className="text-cyan-300">{metrics.salinity_rmse ?? '--'} PSU</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[10px]">
                (N={metrics.sample_size} levels)
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main 3D Canvas Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Loading Spinner */}
        {blockLoading && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/90 backdrop-blur-md border border-cyan-800 text-cyan-300 text-xs font-mono shadow-xl">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Retrieving real INCOIS depth data around station...</span>
          </div>
        )}

        {/* Error Banner */}
        {blockError && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-950/90 backdrop-blur-md border border-red-800 text-red-200 text-xs font-mono shadow-xl">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{blockError}</span>
          </div>
        )}

        {/* 3D Block Three.js Scene */}
        <DepthProfileBlockScene />

        {/* Right Floating Colorbar Legend */}
        <div className="absolute top-6 right-6 z-20 w-64 p-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-slate-200 space-y-3">
          {/* Scalar Slice Legend */}
          {blockLayers.scalarSlice && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="capitalize">{blockVariable} Slice</span>
                <span className="text-cyan-400 font-mono">[{unit}]</span>
              </div>
              <div
                className="w-full h-2.5 rounded shadow-inner border border-slate-700/60 my-1.5"
                style={{ background: gradient }}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{typeof minVal === 'number' ? minVal.toFixed(1) : minVal}</span>
                {meanVal !== null && <span className="text-slate-300">avg: <strong className="text-white">{meanVal}</strong></span>}
                <span>{typeof maxVal === 'number' ? maxVal.toFixed(1) : maxVal}</span>
              </div>
            </div>
          )}

          {/* Currents Speed Scale (if currents enabled) */}
          {blockLayers.currentArrows && (
            <div className={blockLayers.scalarSlice ? 'pt-2 border-t border-slate-800/80' : ''}>
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  <span>Surface Currents</span>
                </span>
                <span className="text-amber-400 font-mono">[cm/s]</span>
              </div>
              <div
                className="w-full h-2 rounded shadow-inner border border-slate-700/60 my-1"
                style={{ background: speedGradient }}
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>0.0</span>
                <span className="text-slate-500">Surface (0m)</span>
                <span>{maxCurrentSpeed.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* CTD Column Indicator */}
          {blockLayers.ctdColumn && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>CTD Observation Line</span>
              </span>
              <span>In-situ ARGO</span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-800 text-[9px] text-slate-500 font-mono">
            INCOIS ERDDAP (~2° bounding box)
          </div>
        </div>

        {/* Floating Bottom Controls Deck for the 3D Block View */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl">
            {/* 1. Variable Selector (Temperature vs Salinity) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              <button
                onClick={() => setBlockVariable('temperature')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  blockVariable === 'temperature'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                <span>Temperature</span>
              </button>

              <button
                onClick={() => setBlockVariable('salinity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  blockVariable === 'salinity'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Salinity</span>
              </button>
            </div>

            {/* 2. Independent Layer Toggles (Pills) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5">Layers:</span>
              
              {/* Scalar Slice Pill */}
              <button
                onClick={() => toggleBlockLayer('scalarSlice')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  blockLayers.scalarSlice
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${blockLayers.scalarSlice ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                <span>Scalar Slice</span>
              </button>

              {/* Current Arrows Pill */}
              <button
                onClick={() => toggleBlockLayer('currentArrows')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  blockLayers.currentArrows
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${blockLayers.currentArrows ? 'bg-amber-400' : 'bg-slate-600'}`} />
                <span>Current Arrows</span>
              </button>

              {/* CTD Column Pill */}
              <button
                onClick={() => toggleBlockLayer('ctdColumn')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  blockLayers.ctdColumn
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${blockLayers.ctdColumn ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span>CTD Column</span>
              </button>
            </div>

            {/* 3. Depth Slider (with Surface indicator for currents) */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/70 rounded-xl border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                Depth: <span className="font-bold text-cyan-400">{blockDepth}m</span>
              </div>

              <input
                type="range"
                min="0"
                max={availableDepths.length - 1}
                step="1"
                value={Math.max(0, availableDepths.indexOf(blockDepth))}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  setBlockDepth(availableDepths[idx]);
                }}
                className="w-28 sm:w-36 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              {blockLayers.currentArrows && blockDepth > 5 && (
                <div className="hidden sm:block px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-[9px] font-mono text-amber-300 whitespace-nowrap">
                  Currents: Surface (0m)
                </div>
              )}
            </div>

            {/* 4. Time Slice Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/70 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Time:</span>
              <select
                value={blockTime}
                onChange={(e) => setBlockTime(e.target.value)}
                className="bg-transparent text-xs font-mono text-cyan-300 font-medium focus:outline-none cursor-pointer"
              >
                {availableTimes.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    {new Date(t).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
