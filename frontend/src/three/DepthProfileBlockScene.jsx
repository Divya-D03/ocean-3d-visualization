import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useOceanStore } from '../store/useOceanStore';
import BlockWireframeBox from './BlockWireframeBox';
import BlockCTDColumn from './BlockCTDColumn';
import BlockScalarLayer from './BlockScalarLayer';
import BlockCurrentArrows from './BlockCurrentArrows';

export default function DepthProfileBlockScene() {
  const blockStation = useOceanStore((state) => state.blockStation);
  const blockVariable = useOceanStore((state) => state.blockVariable);
  const blockDepth = useOceanStore((state) => state.blockDepth);
  const blockTime = useOceanStore((state) => state.blockTime);
  const blockStationData = useOceanStore((state) => state.blockStationData);

  const blockLayers = useOceanStore((state) => state.blockLayers) || {
    scalarSlice: true,
    currentArrows: true,
    ctdColumn: true,
  };

  if (!blockStation) return null;

  const currentLayerKey = `${blockTime}_${blockDepth}`;

  // Active grid slice for temperature or salinity
  const activeGrid = blockVariable === 'temperature'
    ? blockStationData?.temperatureLayers?.[currentLayerKey]
    : blockVariable === 'salinity'
    ? blockStationData?.salinityLayers?.[currentLayerKey]
    : null;

  // Other loaded depths for semi-transparent volume stacking
  const otherLayers = [];
  if (blockStationData && (blockVariable === 'temperature' || blockVariable === 'salinity')) {
    const layersMap = blockVariable === 'temperature'
      ? blockStationData.temperatureLayers
      : blockStationData.salinityLayers;

    Object.entries(layersMap || {}).forEach(([key, grid]) => {
      if (key !== currentLayerKey && grid) {
        otherLayers.push({
          key,
          depth: grid.depth,
          grid,
        });
      }
    });
  }

  return (
    <div className="w-full h-full relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[11, 7, 13]} fov={45} near={0.1} far={150} />

        {/* Studio & Ocean Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[12, 20, 15]} intensity={1.3} color="#f8fafc" />
        <directionalLight position={[-15, 10, -10]} intensity={0.5} color="#38bdf8" />
        <pointLight position={[0, -4, 0]} intensity={0.4} color="#0284c7" />

        {/* Scene Background */}
        <color attach="background" args={['#030712']} />

        {/* Acrylic Wireframe Bounding Box with Depth Scale */}
        <BlockWireframeBox station={blockStation} activeDepth={blockDepth} />

        {/* 1. Station In-situ Vertical CTD Profile Reference Column */}
        {blockLayers.ctdColumn && (
          <BlockCTDColumn
            station={blockStation}
            profile={blockStationData?.profile}
            griddedProfile={blockStationData?.griddedProfile}
            variable={blockVariable}
          />
        )}

        {/* 2. Horizontal Gridded Scalar Slices (Temperature or Salinity) */}
        {blockLayers.scalarSlice && (
          <group>
            {/* Active Depth Layer (High Opacity) */}
            {activeGrid && (
              <BlockScalarLayer
                gridData={activeGrid}
                depth={blockDepth}
                isActive={true}
                variable={blockVariable}
              />
            )}

            {/* Stacked Depth Layers for Volumetric Context (Semi-transparent) */}
            {otherLayers.map((item) => (
              <BlockScalarLayer
                key={item.key}
                gridData={item.grid}
                depth={item.depth}
                isActive={false}
                variable={blockVariable}
              />
            ))}
          </group>
        )}

        {/* 3. Surface Current Directional Arrows (GEO_U, GEO_V) */}
        {blockLayers.currentArrows && (
          <BlockCurrentArrows
            currentsData={blockStationData?.currents}
            station={blockStation}
          />
        )}

        {/* Smooth OrbitControls centered on water column */}
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          target={[0, -3.5, 0]}
          minDistance={5}
          maxDistance={35}
        />
      </Canvas>
    </div>
  );
}
