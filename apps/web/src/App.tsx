import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Sparkles } from '@react-three/drei';
import { Oracle } from './scene/Oracle';
import { CameraRig } from './scene/CameraRig';
import { Effects } from './scene/Effects';
import { CardMesh } from './scene/CardMesh';
import { CommandBar } from './components/CommandBar';
import { ResponseCaption } from './components/ResponseCaption';
import { InspectHUD } from './components/InspectHUD';
import { Spine } from './components/Spine';
import { useOracleStore } from './store/useOracleStore';

function SceneContent() {
  const cards = useOracleStore(state => state.cards);
  return (
    <>
      <Oracle />
      {cards.map((card, idx) => (
        <CardMesh key={card.id} card={card} index={idx} total={cards.length} />
      ))}
      <CameraRig />
      <Effects />
    </>
  );
}

function App() {
  return (
    <div className="w-full h-full relative bg-black">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Environment & Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        {/* Procedural Space Background as fallback */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={20} size={5} speed={0.4} color="#8b6cff" opacity={0.2} />

        <SceneContent />
      </Canvas>
      
      {/* UI Overlays */}
      <Spine />
      <ResponseCaption />
      <InspectHUD />
      <CommandBar />
    </div>
  );
}

export default App;
