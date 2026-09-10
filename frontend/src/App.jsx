import { useEffect } from 'react';
import { useOceanStore } from './store/useOceanStore';
import OceanScene from './three/OceanScene';
import Navbar from './components/Navbar';
import ControlsBar from './components/ControlsBar';
import ColorbarLegend from './components/ColorbarLegend';
import ComparisonPanel from './components/ComparisonPanel';
import LoadingOverlay from './components/LoadingOverlay';
import DatasetInfoModal from './components/DatasetInfoModal';

export default function App() {
  const initPlatform = useOceanStore((state) => state.initPlatform);

  useEffect(() => {
    initPlatform();
  }, [initPlatform]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712]">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Interactive Three.js 3D Ocean Canvas */}
      <main className="w-full h-full">
        <OceanScene />
      </main>

      {/* Scientific Legend / Colorbar */}
      <ColorbarLegend />

      {/* Side-by-side Model vs Observation Validation Panel */}
      <ComparisonPanel />

      {/* Floating Bottom Dashboard Controls */}
      <ControlsBar />

      {/* Loading Spinners & Error Banners */}
      <LoadingOverlay />

      {/* Datasets & Architecture Modal */}
      <DatasetInfoModal />
    </div>
  );
}
