import { useEffect } from 'react';
import { useOceanStore } from './store/useOceanStore';
import OceanScene from './three/OceanScene';
import Navbar from './components/Navbar';
import ControlsBar from './components/ControlsBar';
import ColorbarLegend from './components/ColorbarLegend';
import ComparisonPanel from './components/ComparisonPanel';
import LoadingOverlay from './components/LoadingOverlay';
import DatasetInfoModal from './components/DatasetInfoModal';
import DepthProfile3DView from './components/DepthProfile3DView';

export default function App() {
  const initPlatform = useOceanStore((state) => state.initPlatform);
  const viewMode = useOceanStore((state) => state.viewMode);

  useEffect(() => {
    initPlatform();
  }, [initPlatform]);

  const isBlockView = viewMode === 'block3d';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712]">
      {/* 1. Main 2D/3D Ocean Overview Map Layer */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
          isBlockView
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        {/* Top Navigation Bar with Basin Filter */}
        <Navbar />

        {/* Main Interactive Three.js 3D Ocean Canvas */}
        <main className="w-full h-full">
          <OceanScene />
        </main>

        {/* Scientific Legend / Colorbar */}
        <ColorbarLegend />

        {/* Side-by-side Model vs Observation Validation Panel with "View 3D Depth Profile" button */}
        <ComparisonPanel />

        {/* Floating Bottom Dashboard Controls */}
        <ControlsBar />

        {/* Loading Spinners & Error Banners */}
        <LoadingOverlay />

        {/* Datasets & Architecture Modal */}
        <DatasetInfoModal />
      </div>

      {/* 2. Full-Page 3D Depth-Profile Block Scene Layer */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
          isBlockView
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-105 pointer-events-none'
        }`}
      >
        {isBlockView && <DepthProfile3DView />}
      </div>
    </div>
  );
}
