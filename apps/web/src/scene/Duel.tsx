import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDuelStore } from '../store/useDuelStore';
import type { DuelCard, Side } from '../store/useDuelStore';
import { Card3D } from './Card3D';

const CARD_SCALE = 0.52;
const COL_GAP = 1.7;

/** One card on the board or in hand, easing toward its slot. */
function BoardCard({
  dc,
  target,
  rotX,
  tapped,
  playable,
  onClick,
}: {
  dc: DuelCard;
  target: [number, number, number];
  rotX: number;
  tapped: boolean;
  playable: boolean;
  onClick?: () => void;
}) {
  const g = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!g.current) return;
    const k = 0.16;
    g.current.position.x += (target[0] - g.current.position.x) * k;
    g.current.position.y += (target[1] - g.current.position.y) * k;
    g.current.position.z += (target[2] - g.current.position.z) * k;
    g.current.rotation.x += (rotX - g.current.rotation.x) * k;
    const rz = tapped ? -Math.PI / 2 : 0;
    g.current.rotation.z += (rz - g.current.rotation.z) * k;
    const s = (playable ? CARD_SCALE * 1.06 : CARD_SCALE) - (dc.sick ? 0.02 : 0);
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k);
  });

  return (
    <group ref={g} position={[target[0], target[1] + 4, target[2]]} scale={0.01}>
      <Card3D card={dc.card} focused={playable} onClick={onClick} />
    </group>
  );
}

function row(cards: DuelCard[], z: number, y: number): { dc: DuelCard; pos: [number, number, number] }[] {
  const start = -((cards.length - 1) * COL_GAP) / 2;
  return cards.map((dc, i) => ({ dc, pos: [start + i * COL_GAP, y, z] as [number, number, number] }));
}

export function Duel() {
  const cards = useDuelStore((s) => s.cards);
  const phase = useDuelStore((s) => s.phase);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);
  const playCard = useDuelStore((s) => s.playCard);
  const attack = useDuelStore((s) => s.attack);

  const yourTurn = current === 'you' && !winner;
  const canPlay = yourTurn && (phase === 'main1' || phase === 'main2');
  const canAttack = yourTurn && phase === 'combat';

  const zoneCards = (owner: Side, zone: DuelCard['zone']) =>
    cards.filter((c) => c.owner === owner && c.zone === zone);

  const layout = useMemo(() => {
    return {
      oracleCreatures: row(zoneCards('oracle', 'creatures'), -3.6, 0.05),
      oracleLands: row(zoneCards('oracle', 'lands'), -5.6, 0.05),
      youCreatures: row(zoneCards('you', 'creatures'), 1.4, 0.05),
      youLands: row(zoneCards('you', 'lands'), 3.4, 0.05),
      hand: zoneCards('you', 'hand'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const hand = layout.hand;
  const handStart = -((hand.length - 1) * 1.5) / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* battlefield glow line between the sides */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -1.2]}>
        <planeGeometry args={[16, 0.04]} />
        <meshBasicMaterial color="#8b6cff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      {[...layout.oracleCreatures, ...layout.oracleLands].map(({ dc, pos }) => (
        <BoardCard key={dc.uid} dc={dc} target={pos} rotX={-1.15} tapped={dc.tapped} playable={false} />
      ))}

      {[...layout.youCreatures, ...layout.youLands].map(({ dc, pos }) => (
        <BoardCard
          key={dc.uid}
          dc={dc}
          target={pos}
          rotX={-1.15}
          tapped={dc.tapped}
          playable={canAttack && dc.zone === 'creatures' && !dc.tapped && !dc.sick}
          onClick={() => canAttack && attack(dc.uid)}
        />
      ))}

      {hand.map((dc, i) => {
        const x = handStart + i * 1.5;
        return (
          <BoardCard
            key={dc.uid}
            dc={dc}
            target={[x, 1.9 + Math.abs(x) * -0.05, 8.4]}
            rotX={-0.5}
            tapped={false}
            playable={canPlay}
            onClick={() => canPlay && playCard(dc.uid)}
          />
        );
      })}
    </group>
  );
}
