import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

/**
 * The Oracle — a cosmic black hole, fully procedural (ported from the reference
 * NEXUS build): a fresnel event horizon, a noise-swirled plasma accretion disc
 * (outer + a tighter inner one), a soft halo, orbiting accretion particles,
 * energy pulse rings and spiral arms. It spins up and blazes while thinking.
 */

// ── shared shader chunks ────────────────────────────────────────────────────
const NOISE = /* glsl */ `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float smoothNoise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }
`;

const DISK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const OUTER_FRAG = /* glsl */ `
  uniform float uTime; uniform float uSpeed; uniform float uIntensity;
  uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3; uniform vec3 uColor4; uniform vec3 uGlow;
  varying vec2 vUv;
  ${NOISE}
  void main(){
    float r = vUv.x;
    float angle = vUv.y * 6.2832;
    float t = uTime * uSpeed;
    float swirl = angle + r * 8.0 + t * 0.6;
    float n  = smoothNoise(vec2(swirl*0.8 + t*0.15, r*6.0 + t*0.1));
    float n2 = smoothNoise(vec2(swirl*1.2 - t*0.2,  r*4.0 + t*0.08));
    float brightness = max(0.1, 1.0 - r*0.6);
    vec3 c1 = mix(uColor1, uColor2, n*0.8 + 0.2);
    vec3 c2 = mix(uColor3, uColor4, n2*0.6 + 0.2);
    vec3 col = mix(c1, c2, 0.5 + 0.5*sin(r*12.0 + t*0.3 + angle*0.5));
    col += uGlow * exp(-r*3.0) * 0.4;
    float edge = 1.0 - smoothstep(0.7, 1.0, r);
    float inner = smoothstep(0.0, 0.08, r);
    float falloff = edge * inner;
    col *= brightness * falloff * uIntensity;
    col *= 0.95 + 0.05*sin(t*2.3 + r*14.0 + angle*3.0);
    gl_FragColor = vec4(col, falloff * 0.9);
  }
`;

const INNER_FRAG = /* glsl */ `
  uniform float uTime; uniform float uSpeed; uniform float uIntensity;
  uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uGlow;
  varying vec2 vUv;
  ${NOISE}
  void main(){
    float r = vUv.x;
    float angle = vUv.y * 6.2832;
    float t = uTime * uSpeed;
    float swirl = angle + r*10.0 + t*0.8;
    float n  = smoothNoise(vec2(swirl + t*0.2, r*8.0));
    float n2 = smoothNoise(vec2(swirl*1.3 - t*0.15, r*5.0 + t*0.1));
    vec3 col = mix(uColor1, uColor2, n*0.7 + 0.3);
    col += uGlow * n2 * 0.3;
    float bright = 1.0 - r*0.3;
    float edge = 1.0 - smoothstep(0.3, 1.0, r);
    float inner = smoothstep(0.0, 0.05, r);
    float falloff = edge * inner * bright * uIntensity;
    col *= falloff;
    gl_FragColor = vec4(col, falloff * 0.85);
  }
`;

const HORIZON_VERT = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main(){
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const HORIZON_FRAG = /* glsl */ `
  uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uGlowColor; uniform float uGlowIntensity;
  varying vec3 vN; varying vec3 vV;
  void main(){
    float fres = pow(1.0 - max(0.0, dot(vN, vV)), 3.0);
    float glow = fres * uGlowIntensity * 1.2;
    vec3 col = mix(uColor1, uColor2, fres*0.8);
    col += uGlowColor * glow * 0.6;
    col += vec3(0.15,0.02,0.25) * glow * 0.5;
    gl_FragColor = vec4(col, 0.92 + glow*0.08);
  }
`;

/** RingGeometry with polar UVs (u = radial 0-1, v = angular 0-1). */
function polarRing(inner: number, outer: number, seg = 128, rings = 48) {
  const geo = new THREE.RingGeometry(inner, outer, seg, rings);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, y);
    uv[i * 2] = (r - inner) / (outer - inner);
    uv[i * 2 + 1] = Math.atan2(y, x) / (Math.PI * 2) + 0.5;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

function radialSprite(stops: [number, string][], size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const P_COUNT = 800;

export function BlackHole() {
  const grp = useRef<THREE.Group>(null);
  const isThinking = useOracleStore((s) => s.isThinking);
  const energy = useRef(0.15);

  const kit = useMemo(() => {
    const horizonMat = new THREE.ShaderMaterial({
      uniforms: {
        uGlowIntensity: { value: 0.5 },
        uColor1: { value: new THREE.Color(0x0a0520) },
        uColor2: { value: new THREE.Color(0x3a1a6a) },
        uGlowColor: { value: new THREE.Color(0xb488ff) },
      },
      vertexShader: HORIZON_VERT,
      fragmentShader: HORIZON_FRAG,
      transparent: true,
    });

    const diskGeo = polarRing(1.6, 4.8, 128, 64);
    const diskMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.12 },
        uIntensity: { value: 0.6 },
        uColor1: { value: new THREE.Color(0x8a3aff) },
        uColor2: { value: new THREE.Color(0x4a1a8a) },
        uColor3: { value: new THREE.Color(0xb488ff) },
        uColor4: { value: new THREE.Color(0x2a0a5a) },
        uGlow: { value: new THREE.Color(0xcc88ff) },
      },
      vertexShader: DISK_VERT,
      fragmentShader: OUTER_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const innerGeo = polarRing(0.8, 1.8, 96, 40);
    const innerMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.3 },
        uIntensity: { value: 1.0 },
        uColor1: { value: new THREE.Color(0xcc88ff) },
        uColor2: { value: new THREE.Color(0x6a2aaa) },
        uGlow: { value: new THREE.Color(0xff88cc) },
      },
      vertexShader: DISK_VERT,
      fragmentShader: INNER_FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const glowTex = radialSprite([
      [0, 'rgba(180,136,255,1)'],
      [0.05, 'rgba(150,100,255,0.8)'],
      [0.2, 'rgba(100,60,200,0.4)'],
      [0.5, 'rgba(50,20,120,0.15)'],
      [1, 'rgba(0,0,0,0)'],
    ]);
    const haloTex = radialSprite(
      [
        [0, 'rgba(180,136,255,0.4)'],
        [0.1, 'rgba(130,80,255,0.3)'],
        [0.3, 'rgba(80,40,200,0.15)'],
        [0.6, 'rgba(40,20,100,0.05)'],
        [1, 'rgba(0,0,0,0)'],
      ],
      1024
    );

    // accretion particles
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(P_COUNT * 3);
    const pData: { angle: number; radius: number; height: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < P_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 3.6;
      const height = (Math.random() - 0.5) * 0.6;
      pData.push({ angle, radius, height, speed: 0.08 + Math.random() * 0.2, phase: Math.random() * Math.PI * 2 });
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = height;
      pPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xcc88ff,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    // pulse rings
    const pulses = Array.from({ length: 5 }, (_, i) => {
      const radius = 1.8 + i * 0.6;
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.02, 24, 64),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xb488ff : 0x6a4aff,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      mesh.rotation.x = -0.5;
      mesh.rotation.z = 0.15 + i * 0.02;
      mesh.userData = { baseRadius: radius, life: i / 5 };
      return mesh;
    });

    // spiral arms
    const arms = Array.from({ length: 3 }, (_, a) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const r = 1.6 + u * 3.2;
        const ang = u * 6 + a * 2.094;
        pts.push(new THREE.Vector3(Math.cos(ang) * r, Math.sin(u * 4 + a * 2) * 0.15, Math.sin(ang) * r));
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color: a === 0 ? 0xb488ff : a === 1 ? 0x8a4aff : 0x6a2aaa,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      line.userData = { offset: a * 2.094 };
      return line;
    });

    return { horizonMat, diskGeo, diskMat, innerGeo, innerMat, glowTex, haloTex, pGeo, pMat, pData, pulses, arms };
  }, []);

  const refs = useRef<{
    horizon: THREE.Mesh | null;
    glow: THREE.Sprite | null;
    disk: THREE.Mesh | null;
    innerDisk: THREE.Mesh | null;
    halo: THREE.Sprite | null;
    particles: THREE.Points | null;
  }>({
    horizon: null,
    glow: null,
    disk: null,
    innerDisk: null,
    halo: null,
    particles: null,
  });

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const target = isThinking ? 1 : 0.15;
    energy.current += (target - energy.current) * 0.04;
    const e = energy.current;
    const speedMul = 1 + e * 3.5;
    const r = refs.current;

    if (grp.current) grp.current.rotation.y += dt * (0.01 + e * 0.04);

    kit.horizonMat.uniforms.uGlowIntensity.value = 0.4 + e * 1.2;

    if (r.glow) {
      (r.glow.material as THREE.SpriteMaterial).opacity = 0.4 + e * 0.6;
      const s = 6 * (1 + Math.sin(t * 0.5 + e * 2) * 0.05);
      r.glow.scale.set(s, s, 1);
    }

    kit.diskMat.uniforms.uTime.value = t;
    kit.diskMat.uniforms.uSpeed.value = 0.12 * speedMul;
    kit.diskMat.uniforms.uIntensity.value = 0.5 + e * 0.8;
    if (r.disk) r.disk.rotation.z += dt * (0.02 + e * 0.08);

    kit.innerMat.uniforms.uTime.value = t;
    kit.innerMat.uniforms.uSpeed.value = 0.3 * speedMul;
    kit.innerMat.uniforms.uIntensity.value = 0.8 + e * 1.2;
    if (r.innerDisk) r.innerDisk.rotation.z += dt * (0.03 + e * 0.12);

    if (r.halo) {
      (r.halo.material as THREE.SpriteMaterial).opacity = 0.3 + e * 0.5;
      const s = 12 + e * 4;
      r.halo.scale.set(s, s, 1);
    }

    // particles
    if (r.particles) {
      const arr = (r.particles.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < P_COUNT; i++) {
        const d = kit.pData[i];
        const a = d.angle + t * d.speed * speedMul * 0.6;
        const rad = d.radius + Math.sin(t * 0.2 + d.phase) * 0.15;
        arr[i * 3] = Math.cos(a) * rad;
        arr[i * 3 + 1] = (d.height + Math.sin(t * 0.4 + d.phase * 1.3) * 0.1) * (1 + Math.sin(t * 0.15 + d.phase) * 0.2);
        arr[i * 3 + 2] = Math.sin(a) * rad;
      }
      r.particles.geometry.attributes.position.needsUpdate = true;
      const m = r.particles.material as THREE.PointsMaterial;
      m.opacity = 0.4 + e * 0.6;
      m.size = 0.03 + e * 0.04;
    }

    // pulse rings
    const active = isThinking || e > 0.3;
    for (const ring of kit.pulses) {
      const ud = ring.userData as { baseRadius: number; life: number };
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (active) {
        ud.life += 0.015 * (1 + e * 0.5);
        if (ud.life > 1) ud.life = 0;
        const ease = 1 - Math.pow(1 - ud.life, 2);
        const s = 1 + ease * 0.3;
        ring.scale.set(s, s, s);
        mat.opacity = Math.sin(ud.life * Math.PI) * 0.4 * (0.3 + e * 0.7);
        ring.rotation.y += 0.01 * (1 + e);
      } else {
        ud.life = Math.max(0, ud.life - 0.005);
        mat.opacity = ud.life * 0.3;
        ring.scale.setScalar(1);
      }
    }

    // spiral arms
    for (const arm of kit.arms) {
      const pos = arm.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const off = (arm.userData as { offset: number }).offset;
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const rad = 1.6 + u * 3.2;
        const ang = u * 6 + off + t * 0.08 * speedMul;
        arr[i * 3] = Math.cos(ang) * rad;
        arr[i * 3 + 1] = Math.sin(u * 4 + off + t * 0.05) * 0.15;
        arr[i * 3 + 2] = Math.sin(ang) * rad;
      }
      pos.needsUpdate = true;
      (arm.material as THREE.LineBasicMaterial).opacity = 0.04 + e * 0.12;
    }
  });

  return (
    <group ref={grp} position={[0, 0.9, 0]}>
      <mesh ref={(m) => (refs.current.horizon = m)}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={kit.horizonMat} attach="material" />
      </mesh>

      <sprite ref={(s) => (refs.current.glow = s)} scale={[7, 7, 1]}>
        <spriteMaterial
          map={kit.glowTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.7}
        />
      </sprite>

      <mesh
        ref={(m) => (refs.current.disk = m)}
        geometry={kit.diskGeo}
        rotation={[-0.45, 0, 0.15]}
      >
        <primitive object={kit.diskMat} attach="material" />
      </mesh>

      <mesh
        ref={(m) => (refs.current.innerDisk = m)}
        geometry={kit.innerGeo}
        rotation={[-0.45, 0, 0.15]}
      >
        <primitive object={kit.innerMat} attach="material" />
      </mesh>

      <sprite ref={(s) => (refs.current.halo = s)} scale={[14, 14, 1]}>
        <spriteMaterial
          map={kit.haloTex}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          opacity={0.6}
        />
      </sprite>

      <points
        ref={(p) => {
          refs.current.particles = p as unknown as THREE.Points;
        }}
        geometry={kit.pGeo}
      >
        <primitive object={kit.pMat} attach="material" />
      </points>

      {kit.pulses.map((m, i) => (
        <primitive key={`pulse${i}`} object={m} />
      ))}
      {kit.arms.map((l, i) => (
        <primitive key={`arm${i}`} object={l} />
      ))}

      <pointLight color="#b488ff" distance={22} intensity={1.6} />
    </group>
  );
}
