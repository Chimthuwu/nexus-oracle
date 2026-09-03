import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MindMapper() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      {/* A placeholder for the actual Brain 3D model */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          wireframe={true} 
          transparent={true} 
          opacity={0.3} 
        />
      </mesh>
      {/* Some glowing nodes to represent memories */}
      <mesh position={[1, 1, 1]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#8b6cff" />
      </mesh>
      <mesh position={[-1, 0.5, 1.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#d6a84f" />
      </mesh>
      <mesh position={[0.5, -1, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#5b8cff" />
      </mesh>
    </group>
  );
}
