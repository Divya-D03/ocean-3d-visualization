import { X, CheckCircle, BarChart3, Waves, ArrowRight, Box } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';

export default function ComparisonPanel() {
  const isComparisonOpen = useOceanStore((state) => state.isComparisonOpen);
  const setComparisonOpen = useOceanStore((state) => state.setComparisonOpen);
  const comparisonData = useOceanStore((state) => state.comparisonData);
  const selectedFloat = useOceanStore((state) => state.selectedFloat);
  const closeFloatDetail = useOceanStore((state) => state.closeFloatDetail);
  const open3DProfile = useOceanStore((state) => state.open3DProfile);

  if (!isComparisonOpen || !comparisonData) return null;

  const {
    platform_number,
    cycle_number,
    observation_time,
    latitude,
    longitude,
    matched_model_lat,
    matched_model_lon,
    surface_depth,
    obs_temperature,
    model_temperature,
    temperature_diff,
    obs_salinity,
    model_salinity,
    salinity_diff,
    metrics,
    profile_comparison,
    notes,
  } = comparisonData;

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

  return (
    <div className="absolute top-20 left-6 z-30 w-96 max-h-[82vh] overflow-y-auto bg-slate-950/90 backdrop-blur-xl border border-cyan-800/60 rounded-2xl shadow-2xl text-slate-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Model vs Observation
            </h2>
            <p className="text-[11px] text-cyan-400 font-mono">
              ARGO #{platform_number} (Cycle {cycle_number})
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setComparisonOpen(false);
            closeFloatDetail();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Float Location & Spatial Collocation Info */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">Float Lat / Lon:</span>
          <span className="text-white font-semibold">{latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Model Grid Point:</span>
          <span className="text-cyan-300">{matched_model_lat.toFixed(1)}°N, {matched_model_lon.toFixed(1)}°E</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Obs Timestamp:</span>
          <span className="text-slate-300">{formatDate(observation_time)}</span>
        </div>
      </div>

      {/* 3D Depth Profile Scene Entry Button */}
      <button
        onClick={() => open3DProfile(selectedFloat)}
        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 border border-cyan-400/40 transition active:scale-[0.98] cursor-pointer"
      >
        <Box className="w-4 h-4 text-cyan-200" />
        <span>View 3D Depth Profile</span>
        <ArrowRight className="w-3.5 h-3.5 ml-auto text-cyan-200" />
      </button>

      {/* Side-by-Side Surface Comparison Cards */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-1">
          Collocated Comparison (Depth ~ {surface_depth}m)
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* Model Card */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-amber-400">Model</div>
            <div className="text-[9px] text-slate-500 mb-1">INCOIS VAM</div>
            <div className="text-sm font-mono font-bold text-white">
              {model_temperature !== null ? `${model_temperature}°C` : '--'}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {model_salinity !== null ? `${model_salinity} PSU` : '--'}
            </div>
          </div>

          {/* Observation Card */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-900/60 text-center">
            <div className="text-[10px] uppercase font-bold text-cyan-400">ARGO Float</div>
            <div className="text-[9px] text-slate-500 mb-1">In-Situ CTD</div>
            <div className="text-sm font-mono font-bold text-white">
              {obs_temperature !== null ? `${obs_temperature}°C` : '--'}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {obs_salinity !== null ? `${obs_salinity} PSU` : '--'}
            </div>
          </div>

          {/* Difference Card */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Diff (&Delta;)</div>
            <div className="text-[9px] text-slate-500 mb-1">Model &minus; Obs</div>
            <div className="text-sm font-mono font-bold text-emerald-300">
              {temperature_diff !== null
                ? `${temperature_diff > 0 ? '+' : ''}${temperature_diff}°C`
                : '--'}
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              {salinity_diff !== null
                ? `${salinity_diff > 0 ? '+' : ''}${salinity_diff} PSU`
                : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Statistical Validation Metrics */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Water Column Validation
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            N = {metrics.sample_size} levels
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Temp RMSE:</div>
            <div className="text-sm font-bold text-cyan-300">
              {metrics.temperature_rmse !== null ? `${metrics.temperature_rmse} °C` : '--'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              MAE: {metrics.temperature_mae ?? '--'} | Bias: {metrics.temperature_bias ?? '--'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400">Salinity RMSE:</div>
            <div className="text-sm font-bold text-cyan-300">
              {metrics.salinity_rmse !== null ? `${metrics.salinity_rmse} PSU` : '--'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              MAE: {metrics.salinity_mae ?? '--'} | Bias: {metrics.salinity_bias ?? '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical CTD Depth Profile Comparison Curve (SVG) */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
          <span>CTD Profile Comparison</span>
          <div className="flex items-center gap-2 font-normal lowercase text-[10px]">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Float
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Model
            </span>
          </div>
        </div>

        {/* Mini SVG Line Chart: Depth vs Temperature */}
        <div className="h-36 w-full bg-slate-950/80 rounded-lg p-2 flex flex-col justify-between relative border border-slate-800/80">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 260 110">
            {/* Horizontal Depth grid lines */}
            <line x1="25" y1="10" x2="255" y2="10" stroke="#1e293b" strokeDasharray="2" />
            <line x1="25" y1="55" x2="255" y2="55" stroke="#1e293b" strokeDasharray="2" />
            <line x1="25" y1="100" x2="255" y2="100" stroke="#1e293b" strokeDasharray="2" />

            {/* Depth Labels on Y axis */}
            <text x="0" y="14" fill="#64748b" fontSize="8" fontFamily="monospace">0m</text>
            <text x="0" y="58" fill="#64748b" fontSize="8" fontFamily="monospace">500m</text>
            <text x="0" y="103" fill="#64748b" fontSize="8" fontFamily="monospace">2000m</text>

            {/* Observed CTD Polyline (Cyan) */}
            {profile_comparison?.length > 1 && (
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                points={profile_comparison
                  .filter((p) => p.obs_temp !== null)
                  .map((p) => {
                    const x = 30 + ((p.obs_temp - 4) / 26) * 220;
                    const y = 10 + (Math.min(2000, p.depth) / 2000) * 90;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Model VAM Polyline (Amber) */}
            {profile_comparison?.length > 1 && (
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="3 2"
                points={profile_comparison
                  .filter((p) => p.model_temp !== null)
                  .map((p) => {
                    const x = 30 + ((p.model_temp - 4) / 26) * 220;
                    const y = 10 + (Math.min(2000, p.depth) / 2000) * 90;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
            <span>4°C (Deep ocean)</span>
            <span>Temperature Axis &rarr;</span>
            <span>30°C (SST)</span>
          </div>
        </div>
      </div>

      {/* Scientific Citation / Notes */}
      <p className="text-[10px] text-slate-500 leading-relaxed italic">
        {notes}
      </p>
    </div>
  );
}
