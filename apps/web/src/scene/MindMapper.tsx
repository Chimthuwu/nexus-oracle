import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import { mergeBufferGeometries } from 'three-stdlib';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

const TARGET_RADIUS = 1.8;
const CENTER_Y = 0.9;

const FRESNEL_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    vN = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position,1.0);
    vV = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const FRESNEL_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uPower; uniform float uOpacity;
  varying vec3 vN; varying vec3 vV;
  void main(){
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
    gl_FragColor = vec4(uColor, f * uOpacity);
  }
`;

/**
 * Mind Mapper — a holographic brain where the Oracle sits. The 437 anatomical
 * parts of brain.glb are merged into one mesh (fast, one draw call), skinned as
 * a translucent violet shell with a fresnel rim. It brightens as it learns.
 */
export function MindMapper() {
  const groupRef = useRef<THREE.Group>(null);
  const shellMat = useRef<THREE.MeshStandardMaterial | null>(null);
  const rimMat = useRef<THREE.ShaderMaterial | null>(null);
  const { scene } = useGLTF('/assets/brain.glb', '/draco/');
  const memories = useOracleStore((s) => s.memories);
  const [hovered, setHovered] = useState<string | null>(null);

  const geometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh || !m.geometry) return;
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      // keep only position + normal so every part merges cleanly
      for (const key of Object.keys(g.attributes)) {
        if (key !== 'position' && key !== 'normal') g.deleteAttribute(key);
      }
      parts.push(g.index ? g.toNonIndexed() : g);
    });
    const merged = parts.length ? mergeBufferGeometries(parts, false) : new THREE.BufferGeometry();
    const geo = merged ?? new THREE.BufferGeometry();
    geo.computeBoundingSphere();
    geo.center();
    const r = geo.boundingSphere?.radius || 1;
    geo.scale(TARGET_RADIUS / r, TARGET_RADIUS / r, TARGET_RADIUS / r);
    geo.computeVertexNormals();
    return geo;
  }, [scene]);

  const learn = Math.min(1, memories.length / 12);

  const nodePositions = useMemo(
    () =>
      memories.map((_, i) => {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(memories.length, 1));
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = TARGET_RADIUS * 0.98;
        return new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.85,
          r * Math.sin(phi) * Math.sin(theta)
        );
      }),
    [memories]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.position.y = CENTER_Y + Math.sin(t * 0.4) * 0.03;
    }
    if (shellMat.current) {
      shellMat.current.emissiveIntensity = 0.35 + learn * 0.9 + Math.sin(t * 1.4) * 0.04;
      shellMat.current.opacity = 0.28 + learn * 0.25;
    }
    if (rimMat.current) {
      rimMat.current.uniforms.uOpacity.value = 0.5 + learn * 0.5 + Math.sin(t * 1.6) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} color="#6a5ad0" />
      <pointLight position={[4, 5, 5]} intensity={1.6 + learn * 1.4} color="#8b6cff" distance={24} />
      <pointLight position={[-4, -2, -4]} intensity={0.7} color="#d6a84f" distance={18} />

      <group ref={groupRef} position={[0, CENTER_Y, 0]}>
        {/* translucent shell */}
        <mesh geometry={geometry}>
          <meshStandardMaterial
            ref={shellMat}
            color="#241a45"
            emissive="#6a52c8"
            emissiveIntensity={0.4}
            roughness={0.5}
            metalness={0.1}
            transparent
            opacity={0.3}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* fresnel rim */}
        <mesh geometry={geometry} scale={1.008}>
          <shaderMaterial
            ref={rimMat}
            vertexShader={FRESNEL_VERT}
            fragmentShader={FRESNEL_FRAG}
            uniforms={{
              uColor: { value: new THREE.Color('#b9a4ff') },
              uPower: { value: 2.5 },
              uOpacity: { value: 0.6 },
            }}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

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
                <sphereGeometry args={[isHovered ? 0.07 : 0.045, 16, 16]} />
                <meshBasicMaterial color={m.color} />
              </mesh>
              <mesh scale={isHovered ? 2.6 : 1.9}>
                <sphereGeometry args={[0.045, 12, 12]} />
                <meshBasicMaterial
                  color={m.color}
                  transparent
                  opacity={0.16}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              {isHovered && (
                <Html distanceFactor={9} position={[0, 0.24, 0]} center>
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

        {/* soft aura */}
        <mesh>
          <sphereGeometry args={[TARGET_RADIUS * 1.5, 32, 32]} />
          <meshBasicMaterial
            color="#5a44b0"
            transparent
            opacity={0.04 + learn * 0.06}
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

useGLTF.preload('/assets/brain.glb', '/draco/');
