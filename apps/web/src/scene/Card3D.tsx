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

function CardFace({ url }: { url: string }) {
  const tex = useTexture(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return (
    <mesh>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function CardFallback() {
  return (
    <mesh>
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial color="#15121d" />
    </mesh>
  );
}

/**
 * A single card in 3D — the real Scryfall image on a plane with a
 * rarity-tinted additive backing that flares on hover. Purely presentational;
 * the parent positions it.
 */
export function Card3D({
  card,
  hovered = false,
  focused = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  card: CardData;
  hovered?: boolean;
  focused?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}) {
  const glow = useRef<THREE.Mesh>(null);
  const [localHover, setLocalHover] = useState(false);
  const lit = hovered || localHover || focused;

  useFrame(() => {
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      const target = focused ? 0.7 : lit ? 0.45 : 0.12;
      mat.opacity += (target - mat.opacity) * 0.15;
      const s = focused ? 1.12 : lit ? 1.08 : 1.03;
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
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Suspense fallback={<CardFallback />}>
        <CardFace url={card.imageUrl} />
      </Suspense>
    </group>
  );
}
