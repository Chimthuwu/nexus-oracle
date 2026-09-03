import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

export function Oracle() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Points>(null);
  const isThinking = useOracleStore((state) => state.isThinking);

  // Orbiting particle ring
  const particlesCount = 200;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    const angle = (i / particlesCount) * Math.PI * 2;
    const radius = 3 + Math.random() * 0.5;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.x += delta * 0.1;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= delta * 0.15;
      shellRef.current.rotation.z += delta * 0.05;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.3;
    }

    if (isThinking && coreRef.current) {
      // Pulse scale if thinking
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      coreRef.current.scale.setScalar(scale);
    } else if (coreRef.current) {
      // Lerp back to normal
      coreRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group>
      {/* Core */}
      <Icosahedron ref={coreRef} args={[1, 2]}>
        <meshStandardMaterial 
          color="#d6a84f" 
          emissive="#f4cf76" 
          emissiveIntensity={isThinking ? 1.5 : 0.5} 
          roughness={0.2}
          metalness={0.8}
        />
      </Icosahedron>

      {/* Wireframe Shell */}
      <Icosahedron ref={shellRef} args={[1.5, 1]}>
        <meshBasicMaterial color="#8b6cff" wireframe transparent opacity={0.3} />
      </Icosahedron>

      {/* Orbiting Ring */}
      <points ref={ringRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#f4cf76" transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  );
}
