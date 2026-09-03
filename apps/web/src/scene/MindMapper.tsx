import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

const TARGET_RADIUS = 1.7;
const CENTER_Y = 0.9;

/**
 * Mind Mapper — a dim holographic brain where the Oracle sits, growing more
 * luminous as it learns about you. Each stored memory is a small glowing node
 * spread across the surface.
 */
export function MindMapper() {
  const groupRef = useRef<THREE.Group>(null);
  const brainMat = useRef<THREE.MeshStandardMaterial | null>(null);
  const { scene } = useGLTF('/assets/brain.glb');
  const memories = useOracleStore((s) => s.memories);
  const [hovered, setHovered] = useState<string | null>(null);

  // Normalise + re-skin the model in place (reliable across reloads).
  const brain = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = TARGET_RADIUS / (Math.max(size.x, size.y, size.z) / 2 || 1);
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -center.y * s, -center.z * s);

    const mat = new THREE.MeshStandardMaterial({
      color: '#2a1f52',
      emissive: '#6a52c8',
      emissiveIntensity: 0.55,
      roughness: 0.5,
      metalness: 0.15,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    brainMat.current = mat;
    scene.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) m.material = mat;
    });
    return scene;
  }, [scene]);

  const learn = Math.min(1, memories.length / 12);

  const nodePositions = useMemo(
    () =>
      memories.map((_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(memories.length, 1));
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = TARGET_RADIUS * 0.95;
        return new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.8,
          r * Math.sin(phi) * Math.sin(theta)
        );
      }),
    [memories]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.07;
      groupRef.current.position.y = CENTER_Y + Math.sin(t * 0.4) * 0.03;
    }
    if (brainMat.current) {
      brainMat.current.opacity = 0.45 + learn * 0.3;
      brainMat.current.emissiveIntensity = 0.45 + learn * 0.7 + Math.sin(t * 1.4) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#6a5ad0" />
      <pointLight position={[4, 4, 5]} intensity={1.4 + learn * 1.2} color="#8b6cff" distance={22} />
      <pointLight position={[-4, -2, -3]} intensity={0.7} color="#d6a84f" distance={18} />

      <group ref={groupRef} position={[0, CENTER_Y, 0]}>
        <primitive object={brain} />

        {memories.map((m, i) => {
          const isHovered = hovered === m.id;
          return (
            <group key={m.id} position={nodePositions[i]}>
              <mesh
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHovered(m.id);
                }}
                onPointerOut={() => setHovered(null)}
              >
                <sphereGeometry args={[isHovered ? 0.07 : 0.042, 16, 16]} />
                <meshBasicMaterial color={m.color} />
              </mesh>
              <mesh scale={isHovered ? 2.4 : 1.7}>
                <sphereGeometry args={[0.042, 12, 12]} />
                <meshBasicMaterial
                  color={m.color}
                  transparent
                  opacity={0.12}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              {isHovered && (
                <Html distanceFactor={9} position={[0, 0.22, 0]} center>
                  <div
                    style={{
                      background: 'rgba(12,10,20,0.92)',
                      border: `1px solid ${m.color}`,
                      padding: '7px 11px',
                      borderRadius: '8px',
                      color: '#efeaff',
                      maxWidth: '220px',
                      fontSize: '11px',
                      lineHeight: 1.4,
                      fontFamily: 'Inter, sans-serif',
                      pointerEvents: 'none',
                    }}
                  >
                    {m.text}
                  </div>
                </Html>
              )}
            </group>
          );
        })}

        <mesh>
          <sphereGeometry args={[TARGET_RADIUS * 1.5, 32, 32]} />
          <meshBasicMaterial
            color="#4a3aa0"
            transparent
            opacity={0.03 + learn * 0.05}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <OrbitControls
        makeDefault
        target={[0, CENTER_Y, 0]}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.055}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </>
  );
}

useGLTF.preload('/assets/brain.glb');
