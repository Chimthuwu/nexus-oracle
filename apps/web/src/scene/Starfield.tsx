import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural deep-space backdrop — three parallax shells of stars plus a faint
 * dust haze. This is the always-present base layer; the loaded nebula / galaxy
 * assets (SpaceAssets) sit in front of it and the whole thing survives even if
 * those assets fail to load.
 */

interface ShellProps {
  count: number;
  radius: number;
  spread: number;
  size: number;
  color: THREE.ColorRepresentation;
  opacity: number;
  drift: number;
}

function StarShell({ count, radius, spread, size, color, opacity, drift }: ShellProps) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      // Uniform-ish on a sphere shell with a little radial jitter.
      v.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize().multiplyScalar(radius + (Math.random() - 0.5) * spread);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      scales[i] = 0.4 + Math.random() * 0.9;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return geo;
  }, [count, radius, spread]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * drift;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Starfield() {
  return (
    <group>
      <StarShell count={1400} radius={90} spread={40} size={0.18} color="#cdd6ff" opacity={0.5} drift={0.004} />
      <StarShell count={900} radius={55} spread={30} size={0.13} color="#8b6cff" opacity={0.35} drift={0.008} />
      <StarShell count={500} radius={34} spread={18} size={0.09} color="#f4cf76" opacity={0.28} drift={0.014} />
    </group>
  );
}
