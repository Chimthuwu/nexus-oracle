import { Suspense, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { CardData } from '../store/useOracleStore';

export const CARD_W = 2.5;
export const CARD_H = 3.49; // MTG card ratio 63:88

const RARITY_GLOW: Record<CardData['rarity'], string> = {
  common: '#c9d1e6',
  uncommon: '#b6c7d6',
  rare: '#f4cf76',
  mythic: '#ff9d5c',
};

/**
 * The Nexus card back — a custom design (not a reproduction of any published
 * card back). Drawn once to an offscreen canvas and shared by every card.
 */
let backTexture: THREE.CanvasTexture | null = null;
function getBackTexture(): THREE.CanvasTexture {
  if (backTexture) return backTexture;
  const W = 620;
  const H = 868;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const cx = W / 2;
  const cy = H / 2;

  // Deep field
  const bg = ctx.createRadialGradient(cx, cy * 0.9, 30, cx, cy, H * 0.62);
  bg.addColorStop(0, '#241c3a');
  bg.addColorStop(0.5, '#130f22');
  bg.addColorStop(1, '#08060f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Faint star specks
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.globalAlpha = Math.random() * 0.5;
    ctx.fillRect(x, y, Math.random() < 0.2 ? 2 : 1, Math.random() < 0.2 ? 2 : 1);
  }
  ctx.globalAlpha = 1;

  const frame = (inset: number, lw: number, style: string) => {
    ctx.strokeStyle = style;
    ctx.lineWidth = lw;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  };
  frame(26, 14, '#d6a84f');
  frame(26, 3, 'rgba(255,231,180,0.7)');
  frame(46, 1.5, 'rgba(139,108,255,0.5)');

  // Corner flourishes
  ctx.strokeStyle = 'rgba(214,168,79,0.85)';
  ctx.lineWidth = 4;
  const corners: [number, number, number, number][] = [
    [26, 26, 1, 1],
    [W - 26, 26, -1, 1],
    [26, H - 26, 1, -1],
    [W - 26, H - 26, -1, -1],
  ];
  for (const [x, y, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x + sx * 60, y);
    ctx.quadraticCurveTo(x + sx * 18, y + sy * 18, x, y + sy * 60);
    ctx.stroke();
  }

  // Sigil glow ring
  const ring = ctx.createRadialGradient(cx, cy, 40, cx, cy, 220);
  ring.addColorStop(0, 'rgba(139,108,255,0.35)');
  ring.addColorStop(1, 'rgba(139,108,255,0)');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(244,207,118,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 170, 0, Math.PI * 2);
  ctx.stroke();

  // Four-point star sigil
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f4cf76';
  ctx.shadowColor = 'rgba(244,207,118,0.9)';
  ctx.shadowBlur = 60;
  const star = (r1: number, r2: number) => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? r1 : r2;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  };
  star(120, 26);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff6e2';
  star(120, 14);
  ctx.restore();

  // Wordmark
  ctx.fillStyle = 'rgba(244,241,234,0.9)';
  ctx.font = '600 40px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '10px';
  ctx.fillText('THE ORACLE', cx + 5, cy + 250);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  backTexture = tex;
  return tex;
}

function CardBack() {
  return (
    <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.006]}>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial map={getBackTexture()} toneMapped={false} />
    </mesh>
  );
}

function CardFront({ url }: { url: string }) {
  const tex = useTexture(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return (
    <mesh position={[0, 0, 0.006]}>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function FrontFallback() {
  return (
    <mesh position={[0, 0, 0.006]}>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial color="#15121d" />
    </mesh>
  );
}

/**
 * A single card in 3D — real Scryfall image on the front, a procedural Nexus
 * back, a rarity-tinted additive glow that flares on hover/focus. Purely
 * presentational; the parent positions and rotates it.
 */
export function Card3D({
  card,
  hovered = false,
  focused = false,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onClick,
}: {
  card: CardData;
  hovered?: boolean;
  focused?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onPointerDown?: (e: { clientX: number; clientY: number }) => void;
  onClick?: () => void;
}) {
  const glow = useRef<THREE.Mesh>(null);
  const [localHover, setLocalHover] = useState(false);
  const lit = hovered || localHover || focused;

  useFrame(() => {
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      const target = focused ? 0.32 : lit ? 0.28 : 0.08;
      mat.opacity += (target - mat.opacity) * 0.15;
      const s = focused ? 1.1 : lit ? 1.07 : 1.03;
      glow.current.scale.x += (s - glow.current.scale.x) * 0.15;
      glow.current.scale.y = glow.current.scale.x;
    }
  });

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHover(true);
        onPointerOver?.();
      }}
      onPointerOut={() => {
        setLocalHover(false);
        onPointerOut?.();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown?.({ clientX: e.clientX, clientY: e.clientY });
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <mesh ref={glow} position={[0, 0, -0.02]} scale={1.03}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial
          color={lit ? RARITY_GLOW[card.rarity] : '#8b6cff'}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Suspense fallback={<FrontFallback />}>
        <CardBack />
      </Suspense>

      <Suspense fallback={<FrontFallback />}>
        <CardFront url={card.imageUrl} />
      </Suspense>
    </group>
  );
}
