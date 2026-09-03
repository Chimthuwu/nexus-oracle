import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDuelStore } from '../store/useDuelStore';
import type { DuelCard, Side } from '../store/useDuelStore';
import { Card3D } from './Card3D';

const CARD_SCALE = 0.46;
const HAND_SCALE = 0.5;
const COL_GAP = 1.55;

/** One card on the board or in hand, easing toward its slot. */
function BoardCard({
  dc,
  target,
  rotX,
  scale,
  tapped,
  playable,
  onClick,
}: {
  dc: DuelCard;
  target: [number, number, number];
  rotX: number;
  scale: number;
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
    const rz = tapped ? Math.PI / 2 : 0;
    g.current.rotation.z += (rz - g.current.rotation.z) * k;
    const s = (playable ? scale * 1.08 : scale) - (dc.sick ? 0.03 : 0);
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k);
  });

  return (
    <group ref={g} position={[target[0], target[1] + 3, target[2]]} scale={0.01}>
      <group rotation={[0, -target[0] * 0.045, -target[0] * 0.03]}>
        <Card3D card={dc.card} focused={playable} onClick={onClick} />
      </group>
    </group>
  );
}

function row(
  cards: DuelCard[],
  z: number,
  y: number
): { dc: DuelCard; pos: [number, number, number] }[] {
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
      oracleLands: row(zoneCards('oracle', 'lands'), -6.5, 1.4),
      oracleCreatures: row(zoneCards('oracle', 'creatures'), -3.8, 1.4),
      youCreatures: row(zoneCards('you', 'creatures'), 0.8, 1.4),
      youLands: row(zoneCards('you', 'lands'), 3.4, 1.35),
      hand: zoneCards('you', 'hand'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const hand = layout.hand;
  const handStart = -((hand.length - 1) * 1.5) / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* battlefield seam between the two sides */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.4]}>
        <planeGeometry args={[20, 0.05]} />
        <meshBasicMaterial color="#8b6cff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      {[...layout.oracleLands, ...layout.oracleCreatures].map(({ dc, pos }) => (
        <BoardCard
          key={dc.uid}
          dc={dc}
          target={pos}
          rotX={-0.12}
          scale={CARD_SCALE}
          tapped={dc.tapped}
          playable={false}
        />
      ))}

      {[...layout.youCreatures, ...layout.youLands].map(({ dc, pos }) => (
        <BoardCard
          key={dc.uid}
          dc={dc}
          target={pos}
          rotX={-0.12}
          scale={CARD_SCALE}
          tapped={dc.tapped}
          playable={canAttack && dc.zone === 'creatures' && !dc.tapped && !dc.sick}
          onClick={() => canAttack && attack(dc.uid)}
        />
      ))}

      {hand.map((dc, i) => {
        const x = handStart + i * 1.3;
        return (
          <BoardCard
            key={dc.uid}
            dc={dc}
            target={[x, 0.5 + Math.abs(x) * -0.05, 6.6]}
            rotX={-0.28}
            scale={HAND_SCALE}
            tapped={false}
            playable={canPlay}
            onClick={() => canPlay && playCard(dc.uid)}
          />
        );
      })}
    </group>
  );
}
