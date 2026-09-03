import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Sparkles,
  Environment,
  Lightformer,
} from '@react-three/drei';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

/**
 * The Oracle — a scrying orb: a glass plasma sphere with a living emissive
 * heart, wrapped in soft light and a fine orbiting current. It reflects the
 * space around it (via the Lightformer environment) and roils while thinking.
 */

function SoftGlow({
  radius,
  color,
  opacity,
}: {
  radius: number;
  color: string;
  opacity: number;
}) {
  return (
    <mesh>
      <sphereGeometry args={[radius, 32, 32]} />
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

export function Oracle() {
  const groupRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);
  const heartMat = useRef<any>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const isThinking = useOracleStore((s) => s.isThinking);
  const energy = useRef(0.35);

  const RING_N = 300;
  const { positions, angles, radii } = useMemo(() => {
    const positions = new Float32Array(RING_N * 3);
    const angles = new Float32Array(RING_N);
    const radii = new Float32Array(RING_N);
    for (let i = 0; i < RING_N; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 1.35 + Math.random() * 0.9;
    }
    return { positions, angles, radii };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    const target = isThinking ? 1 : 0.32;
    energy.current += (target - energy.current) * 0.05;
    const e = energy.current;

    if (groupRef.current) groupRef.current.position.y = 0.4 + Math.sin(t * 0.35) * 0.04;

    if (heartRef.current) {
      heartRef.current.rotation.y += dt * (0.12 + e * 0.4);
      heartRef.current.rotation.z -= dt * 0.06;
      const pulse = 1 + Math.sin(t * (isThinking ? 5 : 1.3)) * 0.06 * (0.4 + e);
      heartRef.current.scale.setScalar(pulse * 0.62);
    }
    if (heartMat.current) {
      heartMat.current.distort = 0.32 + e * 0.4;
      heartMat.current.speed = 1 + e * 3;
      heartMat.current.emissiveIntensity = 0.55 + e * 1.1;
    }
    if (glassRef.current) {
      glassRef.current.rotation.y += dt * (0.05 + e * 0.15);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + e * 3 + Math.sin(t * 3) * 0.2;
      lightRef.current.color.setHSL(0.72 - e * 0.08, 0.7, 0.6);
    }
    if (ringRef.current) {
      const speed = isThinking ? 2.6 : 1;
      for (let i = 0; i < RING_N; i++) {
        const a = angles[i] + t * (0.14 + (i % 9) * 0.02) * speed;
        const r = radii[i];
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = Math.sin(a * 2.2 + i) * 0.32;
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      ringRef.current.geometry.attributes.position.needsUpdate = true;
      ringRef.current.rotation.z = 0.35;
      ringRef.current.rotation.y += dt * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {/* Reflections for the glass — bars of cool + warm light, no network. */}
      <Environment resolution={256}>
        <Lightformer intensity={2} color="#8b6cff" position={[-4, 2, -3]} scale={[6, 6, 1]} />
        <Lightformer intensity={1.4} color="#f4cf76" position={[4, -1, 2]} scale={[5, 5, 1]} />
        <Lightformer intensity={0.8} color="#ffffff" position={[0, 4, 4]} scale={[3, 3, 1]} />
        <Lightformer intensity={0.6} color="#3a2f7a" position={[0, -4, -4]} scale={[8, 8, 1]} />
      </Environment>

      <pointLight ref={lightRef} color="#8b6cff" distance={22} intensity={2.4} />
      <pointLight color="#f4cf76" distance={10} intensity={0.6} position={[1.6, 0.8, 2]} />

      {/* Living emissive heart */}
      <mesh ref={heartRef}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          ref={heartMat}
          color="#1a1030"
          emissive="#7a5cff"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={0.1}
          distort={0.34}
          speed={2}
        />
      </mesh>

      {/* Glass plasma sphere */}
      <mesh ref={glassRef}>
        <sphereGeometry args={[1.0, 96, 96]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.9}
          roughness={0.12}
          ior={1.4}
          chromaticAberration={0.35}
          anisotropicBlur={0.4}
          distortion={0.3}
          distortionScale={0.35}
          temporalDistortion={0.12}
          color="#d8ccff"
          attenuationColor="#7458d8"
          attenuationDistance={1.6}
        />
      </mesh>

      {/* Layered soft glow — no hard edges */}
      <SoftGlow radius={1.18} color="#7a5cff" opacity={0.1} />
      <SoftGlow radius={1.7} color="#5a44b8" opacity={0.05} />
      <SoftGlow radius={2.6} color="#3a2f7a" opacity={0.025} />

      <Sparkles count={26} scale={[5, 3.5, 5]} size={2.2} speed={0.22} opacity={0.5} color="#f4cf76" />

      {/* Fine orbiting current */}
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
          size={0.022}
          color="#f4cf76"
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
