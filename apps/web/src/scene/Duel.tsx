import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDuelStore } from '../store/useDuelStore';
import type { DuelCard, Side } from '../store/useDuelStore';
import { Card3D } from './Card3D';

const CARD_SCALE = 0.72;
const COL_GAP = 2.15;
const CARD_TILT = -0.95; // lying back on the "table", angled up toward the camera

/** A card standing on the battlefield, easing toward its slot. */
function BoardCard({
  dc,
  target,
  selected,
  tapped,
  playable,
  onClick,
}: {
  dc: DuelCard;
  target: [number, number, number];
  selected: boolean;
  tapped: boolean;
  playable: boolean;
  onClick: () => void;
}) {
  const g = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!g.current) return;
    const k = 0.16;
    const lift = selected ? 0.6 : playable ? 0.2 : 0;
    g.current.position.x += (target[0] - g.current.position.x) * k;
    g.current.position.y += (target[1] + lift - g.current.position.y) * k;
    g.current.position.z += (target[2] + (selected ? 0.4 : 0) - g.current.position.z) * k;
    const rz = tapped ? Math.PI / 2 : 0;
    g.current.rotation.z += (rz - g.current.rotation.z) * k;
    g.current.rotation.x += ((selected ? -0.55 : CARD_TILT) - g.current.rotation.x) * k;
    const s = selected ? CARD_SCALE * 1.15 : CARD_SCALE - (dc.sick ? 0.04 : 0);
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k);
  });

  return (
    <group ref={g} position={[target[0], target[1] + 2.5, target[2]]} scale={0.01}>
      <Card3D card={dc.card} focused={selected || playable} onClick={onClick} />
    </group>
  );
}

function row(cards: DuelCard[], z: number, y: number) {
  const start = -((cards.length - 1) * COL_GAP) / 2;
  return cards.map((dc, i) => ({ dc, pos: [start + i * COL_GAP, y, z] as [number, number, number] }));
}

/**
 * The battlefield — board state only (both sides' creatures + lands). The hand
 * lives in a DOM strip (DuelHand) and card details in the DuelHUD panel, so the
 * 3D view never gets crowded.
 */
export function Duel() {
  const cards = useDuelStore((s) => s.cards);
  const phase = useDuelStore((s) => s.phase);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);
  const inspectedUid = useDuelStore((s) => s.inspectedUid);
  const setInspected = useDuelStore((s) => s.setInspected);

  const canAttack = current === 'you' && !winner && phase === 'combat';

  const zone = (owner: Side, z: DuelCard['zone']) =>
    cards.filter((c) => c.owner === owner && c.zone === z);

  const layout = useMemo(
    () => ({
      oracleLands: row(zone('oracle', 'lands'), -4.7, 0.05),
      oracleCreatures: row(zone('oracle', 'creatures'), -2.6, 0.05),
      youCreatures: row(zone('you', 'creatures'), 2.1, 0.05),
      youLands: row(zone('you', 'lands'), 4.3, 0.05),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards]
  );

  const toggle = (uid: string) => setInspected(inspectedUid === uid ? null : uid);
  const empty =
    layout.oracleCreatures.length +
      layout.oracleLands.length +
      layout.youCreatures.length +
      layout.youLands.length ===
    0;

  return (
    <group>
      {/* the table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -1]}>
        <planeGeometry args={[26, 16]} />
        <meshBasicMaterial color="#0c0a18" transparent opacity={0.55} />
      </mesh>
      {/* battlefield seam between the two sides */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.7]}>
        <planeGeometry args={[24, 0.05]} />
        <meshBasicMaterial color="#8b6cff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      {empty && (
        <mesh position={[0, 0.6, -0.7]} visible={false}>
          <planeGeometry args={[0.001, 0.001]} />
          <meshBasicMaterial />
        </mesh>
      )}

      {[...layout.oracleLands, ...layout.oracleCreatures, ...layout.youCreatures, ...layout.youLands].map(
        ({ dc, pos }) => (
          <BoardCard
            key={dc.uid}
            dc={dc}
            target={pos}
            selected={inspectedUid === dc.uid}
            tapped={dc.tapped}
            playable={
              canAttack &&
              dc.owner === 'you' &&
              dc.zone === 'creatures' &&
              !dc.tapped &&
              !dc.sick
            }
            onClick={() => toggle(dc.uid)}
          />
        )
      )}
    </group>
  );
}
