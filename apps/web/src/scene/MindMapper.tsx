import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

export function MindMapper() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/brain.glb');
  const memories = useOracleStore((s) => s.memories);
  const [hoveredMemory, setHoveredMemory] = useState<string | null>(null);



  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0, 1.5, 0]} scale={[0.5, 0.5, 0.5]}>
      {/* 3D Brain Model */}
      <primitive object={scene} />

      {/* Render memories as glowing nodes */}
      {memories.map((m) => {
        const isHovered = hoveredMemory === m.id;
        
        return (
          <mesh 
            key={m.id} 
            position={new THREE.Vector3(...m.position)}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredMemory(m.id);
            }}
            onPointerOut={() => setHoveredMemory(null)}
          >
            <sphereGeometry args={[isHovered ? 0.08 : 0.05, 16, 16]} />
            <meshBasicMaterial color={m.color} />
            
            {isHovered && (
              <Html distanceFactor={10} position={[0, 0.2, 0]} center>
                <div style={{
                  background: 'rgba(10, 10, 15, 0.9)',
                  border: `1px solid ${m.color}`,
                  padding: '8px 12px',
                  borderRadius: '4px',
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  pointerEvents: 'none',
                  textShadow: '0 0 4px rgba(0,0,0,0.5)'
                }}>
                  {m.text}
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
      </group>
      {/* Orbit Controls */}
      <OrbitControls
        makeDefault
        target={[0, 1.5, 0]}
        enablePan={false}
        enableZoom={true}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

useGLTF.preload('/assets/brain.glb');
