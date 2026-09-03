import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

/**
 * The Oracle — the fixed heart of the scene. A molten inner core inside a
 * slowly counter-rotating wireframe shell, wrapped by an orbiting particle
 * ring. It breathes gently at rest and pulses hard while thinking.
 */
export function Oracle() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const isThinking = useOracleStore((s) => s.isThinking);
  const energy = useRef(0.35);

  const RING_N = 220;
  const { positions, angles, radii } = useMemo(() => {
    const positions = new Float32Array(RING_N * 3);
    const angles = new Float32Array(RING_N);
    const radii = new Float32Array(RING_N);
    for (let i = 0; i < RING_N; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 1.7 + Math.random() * 0.7;
    }
    return { positions, angles, radii };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    const target = isThinking ? 1 : 0.35;
    energy.current += (target - energy.current) * 0.08;
    const e = energy.current;

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.06;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += dt * (0.15 + e * 0.5);
      coreRef.current.rotation.x += dt * 0.08;
      const pulse = 1 + Math.sin(t * (isThinking ? 7 : 1.6)) * 0.06 * (e * 2);
      coreRef.current.scale.setScalar(pulse);
    }
    if (coreMat.current) {
      coreMat.current.emissiveIntensity = 0.6 + e * 1.6;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= dt * (0.2 + e * 0.7);
      shellRef.current.rotation.z += dt * 0.05;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z -= dt * 0.12;
      const hs = 1 + Math.sin(t * 1.2) * 0.03;
      haloRef.current.scale.setScalar(hs);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + e * 0.12;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.6 + e * 2.4 + Math.sin(t * 3) * 0.2;
    }
    if (ringRef.current) {
      const speed = isThinking ? 3.2 : 1;
      for (let i = 0; i < RING_N; i++) {
        const a = angles[i] + t * (0.25 + (i % 5) * 0.05) * speed;
        const r = radii[i];
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = Math.sin(a * 1.7) * 0.45;
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      ringRef.current.geometry.attributes.position.needsUpdate = true;
      ringRef.current.rotation.y += dt * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.6, -1.8]}>
      <pointLight ref={lightRef} color="#8b6cff" distance={16} intensity={2} />
      <pointLight color="#f4cf76" distance={10} intensity={0.6} position={[1, 1, 2]} />

      {/* Molten core */}
      <Icosahedron ref={coreRef} args={[0.62, 4]}>
        <meshStandardMaterial
          ref={coreMat}
          color="#6b4fd0"
          emissive="#7a5cff"
          emissiveIntensity={0.9}
          roughness={0.25}
          metalness={0.5}
          transparent
          opacity={0.94}
        />
      </Icosahedron>

      {/* Wireframe shell */}
      <Icosahedron ref={shellRef} args={[0.86, 1]}>
        <meshBasicMaterial color="#f4cf76" wireframe transparent opacity={0.4} />
      </Icosahedron>

      {/* Soft halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial
          color="#8b6cff"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbiting ring */}
      <points ref={ringRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={RING_N}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#f4cf76"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
