import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { PLYLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import * as THREE from 'three';

export function SpaceAssets() {
  const cloud180 = useLoader(PLYLoader, '/assets/space/cloud_180.ply');
  const modelPly = useLoader(PLYLoader, '/assets/space/model.ply');
  const galaxyObj = useLoader(OBJLoader, '/assets/space/galaxy.obj');
  
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background galaxy object */}
      <primitive 
        object={galaxyObj} 
        scale={0.5} 
        position={[0, -5, -20]} 
      />
      
      {/* PLY Point clouds */}
      <points geometry={cloud180} position={[-10, 5, -15]} scale={2}>
        <pointsMaterial color="#8b6cff" size={0.05} sizeAttenuation transparent opacity={0.6} />
      </points>

      <points geometry={modelPly} position={[10, -5, -10]} scale={3}>
        <pointsMaterial color="#d6a84f" size={0.05} sizeAttenuation transparent opacity={0.8} />
      </points>
    </group>
  );
}
