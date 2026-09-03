import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Sparkles } from '@react-three/drei';
import { Oracle } from './scene/Oracle';
import { CameraRig } from './scene/CameraRig';
import { Effects } from './scene/Effects';
import { CommandBar } from './components/CommandBar';

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

        <Oracle />
        <CameraRig />
        <Effects />
      </Canvas>
      
      {/* UI Overlays */}
      <CommandBar />
    </div>
  );
}

export default App;
