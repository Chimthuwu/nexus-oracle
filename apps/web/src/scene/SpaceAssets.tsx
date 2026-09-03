import { Component, Suspense, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Stars, useTexture } from '@react-three/drei';
import { PLYLoader } from 'three-stdlib';
import * as THREE from 'three';
import { Starfield } from './Starfield';

/**
 * The loaded-asset layer of the space environment:
 *   - cloud_180.ply  — a 300k-point coloured nebula ("NebulaeGenerator")
 *   - model.ply      — a 50k-point blue-white star cluster
 *   - galaxy.obj     — a 32k-point galaxy spiral (positions only; we colour it)
 *
 * All three ship vertex data we render as additive point clouds. If any asset
 * fails to load, the ErrorBoundary drops us back to the bare procedural
 * Starfield so the scene never goes black.
 */

const NEBULA_URL = '/assets/space/cloud_180.ply';
const CLUSTER_URL = '/assets/space/model.ply';
const GALAXY_URL = '/assets/space/galaxy.obj';

/** Parse a faces-free .obj into a centred, unit-ish BufferGeometry of points. */
function parseObjPoints(text: string): THREE.BufferGeometry {
  const verts: number[] = [];
  for (const line of text.split('\n')) {
    if (line[0] !== 'v' || line[1] !== ' ') continue;
    const p = line.split(/\s+/);
    verts.push(+p[1], +p[2], +p[3]);
  }
  const positions = new Float32Array(verts);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.center();
  geo.computeBoundingSphere();
  const r = geo.boundingSphere?.radius || 1;
  geo.scale(1 / r, 1 / r, 1 / r); // normalise to radius ~1; caller scales up

  // Colour ramp: warm gold core → violet rim, based on distance from centre.
  const n = positions.length / 3;
  const colors = new Float32Array(positions.length);
  const core = new THREE.Color('#ffd9a0');
  const mid = new THREE.Color('#c98bff');
  const edge = new THREE.Color('#4a63ff');
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const d = Math.min(
      1,
      Math.hypot(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
    );
    if (d < 0.45) c.copy(core).lerp(mid, d / 0.45);
    else c.copy(mid).lerp(edge, (d - 0.45) / 0.55);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

function Galaxy() {
  const text = useLoader(THREE.FileLoader, GALAXY_URL) as string;
  const geometry = useMemo(() => parseObjPoints(text), [text]);
  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.012;
  });

  return (
    <points
      ref={ref}
      geometry={geometry}
      position={[24, 15, -52]}
      rotation={[Math.PI * 0.52, 0.4, 0.24]}
      scale={10}
      frustumCulled={false}
    >
      <pointsMaterial
        vertexColors
        color="#e8c78f"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.26}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Nebula() {
  const geometry = useLoader(PLYLoader, NEBULA_URL);
  const ref = useRef<THREE.Points>(null);

  const centred = useMemo(() => {
    const g = geometry.clone();
    g.center();
    g.computeBoundingSphere();
    const r = g.boundingSphere?.radius || 1;
    g.scale(1 / r, 1 / r, 1 / r);
    return g;
  }, [geometry]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.006;
  });

  return (
    <points
      ref={ref}
      geometry={centred}
      position={[3, 2, -50]}
      rotation={[1.2, 0.3, 0.15]}
      scale={52}
      frustumCulled={false}
    >
      <pointsMaterial
        vertexColors
        color="#a98adf"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.09}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function StarCluster() {
  const geometry = useLoader(PLYLoader, CLUSTER_URL);
  const ref = useRef<THREE.Points>(null);

  const centred = useMemo(() => {
    const g = geometry.clone();
    g.center();
    g.computeBoundingSphere();
    const r = g.boundingSphere?.radius || 1;
    g.scale(1 / r, 1 / r, 1 / r);
    return g;
  }, [geometry]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.01;
  });

  return (
    <points
      ref={ref}
      geometry={centred}
      position={[-26, 11, -44]}
      scale={5}
      frustumCulled={false}
    >
      <pointsMaterial
        vertexColors
        color="#8fb0ff"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

class AssetBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn('Space assets failed to load — falling back to procedural field.', err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Distant nebula haze from the supplied astronomy plate (eso1723a). */
function NebulaPlate() {
  const tex = useTexture('/assets/nebula/eso1723a.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.002;
  });
  return (
    <mesh ref={ref} position={[6, 3, -60]} rotation={[0, 0, 0.3]} frustumCulled={false}>
      <planeGeometry args={[110, 55]} />
      <meshBasicMaterial
        map={tex}
        color="#8a74d8"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function SpaceAssets() {
  return (
    <>
      {/* Crisp deep-field stars all around — the 360° backdrop. */}
      <Stars radius={120} depth={80} count={6000} factor={4} saturation={0} fade speed={0.6} />
      <Starfield />
      <AssetBoundary>
        <Suspense fallback={null}>
          <NebulaPlate />
          <Nebula />
          <Galaxy />
          <StarCluster />
        </Suspense>
      </AssetBoundary>
    </>
  );
}
