import { Activity, Globe2, Layers, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';

export default function Navbar() {
  const activeRegion = useOceanStore((state) => state.activeRegion);
  const setRegion = useOceanStore((state) => state.setRegion);
  const healthStatus = useOceanStore((state) => state.healthStatus);
  const setDatasetInfoOpen = useOceanStore((state) => state.setDatasetInfoOpen);
  const presets = useOceanStore((state) => state.presets);

  const isConnected = healthStatus?.erddap?.status === 'connected';

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/40">
      {/* Brand & Project Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-lg shadow-cyan-500/20">
          <Globe2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white font-sans">
              Ocean 3D Explorer
            </h1>
            <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              SIH MVP
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            INCOIS Gridded Ocean Models &times; In-Situ ARGO Profiling
          </p>
        </div>
      </div>

      {/* Center: Geographic Region Presets */}
      <div className="hidden md:flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        {Object.keys(presets).map((reg) => (
          <button
            key={reg}
            onClick={() => setRegion(reg)}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeRegion === reg
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Right: Status & Documentation */}
      <div className="flex items-center gap-3">
        {/* INCOIS Live Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
            isConnected
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
              : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
          }`}
          title={isConnected ? 'Direct link to INCOIS ERDDAP active' : 'Operating in resilient cache mode'}
        >
          {isConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="font-mono text-[11px]">
            {isConnected ? 'INCOIS ERDDAP Live' : 'INCOIS Cache Mode'}
          </span>
        </div>

        {/* Dataset Info Trigger */}
        <button
          onClick={() => setDatasetInfoOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Datasets</span>
        </button>
      </div>
    </header>
  );
}
