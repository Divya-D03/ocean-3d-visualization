import { X, Database, CheckCircle, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';

export default function DatasetInfoModal() {
  const isDatasetInfoOpen = useOceanStore((state) => state.isDatasetInfoOpen);
  const setDatasetInfoOpen = useOceanStore((state) => state.setDatasetInfoOpen);

  if (!isDatasetInfoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-5 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                INCOIS Datasets & Scientific Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Ocean 3D Explorer &bull; Smart India Hackathon (SIH) MVP
              </p>
            </div>
          </div>
          <button
            onClick={() => setDatasetInfoOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIH Context */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 leading-relaxed">
          <strong>Smart India Hackathon Objective:</strong> Interactive 3D ocean data visualization platform integrating numerical ocean model/analysis outputs with real-world in-situ ARGO profiling observations for oceanographic research, maritime advisories, and model validation.
        </div>

        {/* Datasets Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Integrated INCOIS ERDDAP Datasets
          </h3>

          {/* Dataset 1 */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">
                1. Indian ARGO Floats (tabledap)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Indian_ARGO_Floats
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Autonomous profiling floats drifting across the Indian Ocean basin, measuring in-situ CTD vertical profiles from sea surface down to 2,000 meters depth.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Key variables: <code className="text-slate-200">PLATFORM_NUMBER</code>, <code className="text-slate-200">CYCLE_NUMBER</code>, <code className="text-slate-200">PRES_ADJUSTED</code>, <code className="text-slate-200">TEMP_ADJUSTED</code>, <code className="text-slate-200">PSAL_ADJUSTED</code>.
            </div>
          </div>

          {/* Dataset 2 */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                2. INCOIS ARGO Monthly VAM (griddap)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                incois_argo_mnt_VAM
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Value Added Monthly objective analysis of ocean temperature and salinity across 24 standard vertical depth levels (ZAX: 5m to 2000m) at 1° spatial resolution.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Key variables: <code className="text-slate-200">TEMP</code> (°C), <code className="text-slate-200">SAL</code> (PSU), <code className="text-slate-200">ZAX</code> (meters depth).
            </div>
          </div>

          {/* Dataset 3 */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">
                3. Value Added Products: Currents (griddap)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                incois_valueadded_products_datasets
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Gridded historical geostrophic ocean current components across the Indian Ocean, showing major surface circulation features and gyres.
            </p>
            <div className="text-[11px] font-mono text-slate-400">
              Key variables: <code className="text-slate-200">GEO_U</code> (zonal cm/s), <code className="text-slate-200">GEO_V</code> (meridional cm/s).
              <span className="ml-2 text-amber-400 text-[10px] italic">Note: Historical dataset.</span>
            </div>
          </div>
        </div>

        {/* Validation Methodology */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Model Validation Methodology
          </div>
          <p className="text-slate-400 text-[11px]">
            Collocation matches in-situ float coordinates to the nearest model grid coordinate in 3D space and time. Validation metrics include Bias (mean difference), MAE (mean absolute error), and RMSE (root-mean-square error).
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>INCOIS ERDDAP Base: <code className="text-cyan-400">erddap.incois.gov.in</code></span>
          <button
            onClick={() => setDatasetInfoOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
