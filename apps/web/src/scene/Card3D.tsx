import { Suspense, useMemo, useRef, useState } from 'react';
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

/** Procedural Nexus card back — drawn once, shared by every card. */
let backTexture: THREE.CanvasTexture | null = null;
function getBackTexture(): THREE.CanvasTexture {
  if (backTexture) return backTexture;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 715;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(256, 357, 40, 256, 357, 460);
  g.addColorStop(0, '#1c1630');
  g.addColorStop(0.55, '#0e0b18');
  g.addColorStop(1, '#050308');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 715);
  ctx.strokeStyle = 'rgba(214,168,79,.5)';
  ctx.lineWidth = 10;
  ctx.strokeRect(22, 22, 468, 671);
  ctx.strokeStyle = 'rgba(139,108,255,.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 432, 635);
  ctx.fillStyle = '#d6a84f';
  ctx.font = '210px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(214,168,79,.7)';
  ctx.shadowBlur = 40;
  ctx.fillText('✦', 256, 330);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(244,241,234,.85)';
  ctx.font = '600 34px Georgia, serif';
  ctx.fillText('N E X U S', 256, 470);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  backTexture = tex;
  return tex;
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
  const back = useMemo(() => getBackTexture(), []);

  useFrame(() => {
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      const target = focused ? 0.6 : lit ? 0.4 : 0.1;
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

      {/* Back face */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.006]}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={back} toneMapped={false} />
      </mesh>

      <Suspense fallback={<FrontFallback />}>
        <CardFront url={card.imageUrl} />
      </Suspense>
    </group>
  );
}
