import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function MindMapper() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/brain.glb');

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.5, 0]} scale={[0.5, 0.5, 0.5]}>
      {/* 3D Brain Model */}
      <primitive object={scene} />

      {/* Some glowing nodes to represent memories lighting up */}
      <mesh position={[1, 1, 1]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#8b6cff" />
      </mesh>
      <mesh position={[-1, 0.5, 1.5]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#d6a84f" />
      </mesh>
      <mesh position={[0.5, -1, 0.5]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#5b8cff" />
      </mesh>
    </group>
  );
}

useGLTF.preload('/assets/brain.glb');
