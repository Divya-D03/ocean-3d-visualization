import { Loader2, AlertTriangle, X } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';

export default function LoadingOverlay() {
  const loading = useOceanStore((state) => state.loading);
  const loadingMessage = useOceanStore((state) => state.loadingMessage);
  const error = useOceanStore((state) => state.error);

  return (
    <>
      {/* Loading Spinner Indicator */}
      {loading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 bg-slate-950/90 backdrop-blur-md border border-cyan-800/80 rounded-full shadow-lg text-cyan-300 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>{loadingMessage || 'Fetching INCOIS ocean dataset...'}</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-red-950/90 backdrop-blur-md border border-red-800 rounded-xl shadow-lg text-red-200 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}
