import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

/**
 * The Oracle — an event horizon. A black core ringed by a churning accretion
 * disc of infalling light, with a bright photon ring and a lensed arc of the
 * disc curving over the top. It spins faster and burns brighter while thinking.
 */

const DISC_N = 5200;
const R_IN = 1.28;
const R_OUT = 3.25;

const _c = new THREE.Color();
const hot = new THREE.Color('#fff3e0');
const mid = new THREE.Color('#ffb14a');
const cool = new THREE.Color('#c9481f');
const ember = new THREE.Color('#5c1c12');

function discColor(tt: number): THREE.Color {
  // tt: 0 at inner edge (hottest) → 1 at outer edge (embers)
  if (tt < 0.4) return _c.copy(hot).lerp(mid, tt / 0.4);
  if (tt < 0.75) return _c.copy(mid).lerp(cool, (tt - 0.4) / 0.35);
  return _c.copy(cool).lerp(ember, (tt - 0.75) / 0.25);
}

export function Oracle() {
  const groupRef = useRef<THREE.Group>(null);
  const discRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const photonRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const isThinking = useOracleStore((s) => s.isThinking);
  const energy = useRef(0.3);

  const disc = useMemo(() => {
    const positions = new Float32Array(DISC_N * 3);
    const colors = new Float32Array(DISC_N * 3);
    const speed = new Float32Array(DISC_N);
    const angle = new Float32Array(DISC_N);
    const radius = new Float32Array(DISC_N);
    for (let i = 0; i < DISC_N; i++) {
      // Bias toward the inner disc where it's brightest.
      const tt = Math.pow(Math.random(), 1.7);
      const r = R_IN + tt * (R_OUT - R_IN);
      const a = Math.random() * Math.PI * 2;
      radius[i] = r;
      angle[i] = a;
      // Keplerian-ish: inner material orbits much faster.
      speed[i] = 0.9 / Math.pow(r, 1.5);
      const h = (Math.random() - 0.5) * 0.05 * r * (1 - tt * 0.6);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = h;
      positions[i * 3 + 2] = Math.sin(a) * r;
      const col = discColor(tt);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { geo, positions, speed, angle, radius };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    const target = isThinking ? 1 : 0.3;
    energy.current += (target - energy.current) * 0.05;
    const e = energy.current;

    if (groupRef.current) {
      groupRef.current.position.y = 0.9 + Math.sin(t * 0.3) * 0.03;
      // A slight tilt so the disc reads as a disc, not a line.
      groupRef.current.rotation.x = -0.42;
      groupRef.current.rotation.z = 0.08;
    }

    if (discRef.current) {
      const { positions, speed, angle, radius } = disc;
      const boost = 1 + e * 1.6;
      for (let i = 0; i < DISC_N; i++) {
        angle[i] += dt * speed[i] * boost * 6;
        const r = radius[i];
        positions[i * 3] = Math.cos(angle[i]) * r;
        positions[i * 3 + 2] = Math.sin(angle[i]) * r;
      }
      discRef.current.geometry.attributes.position.needsUpdate = true;
      const m = discRef.current.material as THREE.PointsMaterial;
      m.opacity = 0.85 + e * 0.15;
      m.size = 0.032 + e * 0.012;
    }

    if (coreRef.current) {
      const s = 1 + Math.sin(t * (isThinking ? 4 : 1.2)) * 0.02 * (0.5 + e);
      coreRef.current.scale.setScalar(s);
    }
    if (photonRef.current) {
      const m = photonRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + e * 0.4 + Math.sin(t * 3) * 0.05;
      photonRef.current.rotation.z += dt * 0.4;
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.16 + e * 0.14;
      glowRef.current.rotation.z -= dt * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.9, 0]}>
      {/* Event horizon — a true black sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>

      {/* Photon ring — bright bent light hugging the horizon (billboarded) */}
      <mesh ref={photonRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.16, 0.028, 16, 128]} />
        <meshBasicMaterial
          color="#ffe6c0"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Blazing inner rim where the disc meets the horizon */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_IN + 0.04, 0.05, 16, 160]} />
        <meshBasicMaterial
          color="#fff1d8"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Soft body glow under the disc */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 3.4, 96]} />
        <meshBasicMaterial
          color="#ff8a3a"
          transparent
          opacity={0.14}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Accretion disc — infalling light */}
      <points ref={discRef} geometry={disc.geo} frustumCulled={false}>
        <pointsMaterial
          vertexColors
          size={0.034}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      <pointLight color="#ff9d5c" distance={16} intensity={1.6} />
    </group>
  );
}
