import { useOceanStore } from '../store/useOceanStore';
import { getColormapCSSGradient } from '../utils/colormaps';

export default function ColorbarLegend() {
  const selectedParam = useOceanStore((state) => state.selectedParam);
  const gridData = useOceanStore((state) => state.gridData);
  const currentsData = useOceanStore((state) => state.currentsData);

  if (selectedParam === 'observations') return null;

  let title = 'Temperature';
  let unit = '°C';
  let minVal = 4.0;
  let maxVal = 30.0;
  let meanVal = null;
  let cmapName = 'turbo';
  let source = 'INCOIS ARGO Monthly VAM';

  if (selectedParam === 'temperature') {
    title = 'Sea Water Temperature';
    unit = '°C';
    cmapName = 'turbo';
    if (gridData) {
      minVal = gridData.min_val ?? 4.0;
      maxVal = gridData.max_val ?? 30.0;
      meanVal = gridData.mean_val;
      source = gridData.source;
    }
  } else if (selectedParam === 'salinity') {
    title = 'Practical Salinity';
    unit = 'PSU';
    cmapName = 'haline';
    if (gridData) {
      minVal = gridData.min_val ?? 32.0;
      maxVal = gridData.max_val ?? 37.0;
      meanVal = gridData.mean_val;
      source = gridData.source;
    }
  } else if (selectedParam === 'currents') {
    title = 'Current Velocity Magnitude';
    unit = 'cm/s';
    cmapName = 'speed';
    minVal = 0.0;
    maxVal = currentsData?.max_speed ? Math.round(currentsData.max_speed) : 25.0;
    source = 'INCOIS Value Added Products (Historical)';
  }

  const gradient = getColormapCSSGradient(cmapName);

  return (
    <div className="absolute top-20 right-6 z-20 w-64 p-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-slate-200">
      <div className="flex items-center justify-between text-xs font-semibold mb-1">
        <span>{title}</span>
        <span className="text-cyan-400 font-mono">[{unit}]</span>
      </div>

      {/* Color Gradient Bar */}
      <div
        className="w-full h-3 rounded-md shadow-inner border border-slate-700/60 my-1.5"
        style={{ background: gradient }}
      />

      {/* Numerical Ticks */}
      <div className="flex justify-between text-[11px] font-mono text-slate-400">
        <span>{typeof minVal === 'number' ? minVal.toFixed(1) : minVal}</span>
        {meanVal !== null && (
          <span className="text-slate-300">
            avg: <strong className="text-white">{meanVal}</strong>
          </span>
        )}
        <span>{typeof maxVal === 'number' ? maxVal.toFixed(1) : maxVal}</span>
      </div>

      {/* Source Citation */}
      <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-500 truncate">
        {source}
      </div>
    </div>
  );
}
