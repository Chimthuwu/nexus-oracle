import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { OBJLoader } from 'three-stdlib';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

/**
 * The Oracle — an event horizon.
 *
 * The accretion disc is the supplied model (`model_3.obj`, textured with
 * `ring_diff_B` + `ring_opa`); the core, glow and star sky are procedural so
 * the whole thing stays light. The disc spins and everything brightens while
 * the Oracle is thinking.
 */

const BASE = '/assets/blackhole';
const DISC_SCALE = 0.03; // model_3 r≈113 → ~3.4

function useDiscGeometry(): THREE.BufferGeometry {
  const obj = useLoader(OBJLoader, `${BASE}/model_3.obj`);
  return useMemo(() => {
    let geo: THREE.BufferGeometry | null = null;
    obj.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh && !geo) geo = m.geometry as THREE.BufferGeometry;
    });
    return (geo ?? new THREE.BufferGeometry()) as THREE.BufferGeometry;
  }, [obj]);
}

function Glow({ r, color, opacity }: { r: number; color: string; opacity: number }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function BlackHole() {
  const groupRef = useRef<THREE.Group>(null);
  const discRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const isThinking = useOracleStore((s) => s.isThinking);
  const energy = useRef(0.3);

  const discGeo = useDiscGeometry();
  const [ringDiff, ringOpa] = useTexture([
    `${BASE}/ring_diff_B.png`,
    `${BASE}/ring_opa.png`,
  ]);

  useMemo(() => {
    ringDiff.colorSpace = THREE.SRGBColorSpace;
    ringDiff.anisotropy = 8;
  }, [ringDiff]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const target = isThinking ? 1 : 0.3;
    energy.current += (target - energy.current) * 0.05;
    const e = energy.current;

    if (groupRef.current) {
      groupRef.current.position.y = 0.9 + Math.sin(t * 0.3) * 0.03;
      groupRef.current.rotation.x = -0.48;
      groupRef.current.rotation.z = 0.05;
    }
    if (discRef.current) {
      discRef.current.rotation.z += dt * (0.14 + e * 0.55);
      const m = discRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.85 + e * 0.15;
      m.color.setScalar(0.8 + e * 0.55);
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * (isThinking ? 4 : 1.2)) * 0.012;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0, 0.9, 0]}>
        {/* Event horizon */}
        <mesh ref={coreRef} renderOrder={1}>
          <sphereGeometry args={[0.62, 64, 64]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Photon ring hugging the horizon */}
        <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
          <torusGeometry args={[0.72, 0.02, 16, 128]} />
          <meshBasicMaterial
            color="#ffe9c8"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* Accretion disc (supplied model) */}
        <mesh ref={discRef} geometry={discGeo} scale={DISC_SCALE} renderOrder={3}>
          <meshBasicMaterial
            map={ringDiff}
            alphaMap={ringOpa}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <Glow r={1.0} color="#ff9a4a" opacity={0.12} />
        <Glow r={1.7} color="#d0742e" opacity={0.06} />
        <Glow r={2.8} color="#7a3f1e" opacity={0.03} />

        <pointLight color="#ff9d5c" distance={16} intensity={1.6} />
      </group>
    </>
  );
}
