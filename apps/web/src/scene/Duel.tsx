import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDuelStore } from '../store/useDuelStore';
import type { DuelCard, Side } from '../store/useDuelStore';
import { Card3D } from './Card3D';

const BOARD_SCALE = 0.85;
const HAND_SCALE = 0.62;
const COL_GAP = 2.15;
const BOARD_TILT = -0.95; // lying back on the table
const HAND_TILT = -0.32;

/** Focus transform — a card picked up toward the camera (archive-style). */
const FOCUS = { x: 0, y: 3.6, z: 4.2, scale: 1.0, tilt: -0.6 };

function DuelCardMesh({
  dc,
  slot,
  selected,
  tapped,
  playable,
  onClick,
}: {
  dc: DuelCard;
  slot: { x: number; y: number; z: number; tilt: number; fan: number; scale: number };
  selected: boolean;
  tapped: boolean;
  playable: boolean;
  onClick: () => void;
}) {
  const g = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!g.current || !inner.current) return;
    const k = 0.16;
    const t = selected ? FOCUS : slot;
    const s = selected ? FOCUS.scale : playable ? slot.scale * 1.06 : slot.scale - (dc.sick ? 0.04 : 0);
    g.current.position.x += (t.x - g.current.position.x) * k;
    g.current.position.y += (t.y - g.current.position.y) * k;
    g.current.position.z += (t.z - g.current.position.z) * k;
    g.current.rotation.x += (t.tilt - g.current.rotation.x) * k;
    const rz = tapped && !selected ? Math.PI / 2 : 0;
    g.current.rotation.z += (rz - g.current.rotation.z) * k;
    const fan = selected ? 0 : (slot as { fan: number }).fan;
    inner.current.rotation.y += (fan - inner.current.rotation.y) * k;
    g.current.scale.setScalar(g.current.scale.x + (s - g.current.scale.x) * k);
  });

  return (
    <group ref={g} position={[slot.x, slot.y + 2.5, slot.z]} scale={0.01}>
      <group ref={inner}>
        <Card3D card={dc.card} focused={selected || playable} onClick={onClick} />
      </group>
    </group>
  );
}

function boardRow(cards: DuelCard[], z: number) {
  const start = -((cards.length - 1) * COL_GAP) / 2;
  return cards.map((dc, i) => ({
    dc,
    // Tiny per-card z-step: with equal COL_GAP < CARD_W, neighbours overlap on
    // screen, and identical z leaves the raycaster's hit order for that overlap
    // undefined (a tie), so clicks there can land on the wrong card. The step
    // is too small to read as a depth difference but breaks the tie.
    slot: { x: start + i * COL_GAP, y: 0.05, z: z + i * 0.01, tilt: BOARD_TILT, fan: 0, scale: BOARD_SCALE },
  }));
}

/**
 * The battlefield + your hand, all in 3D. Click a card (hand or board) to pick
 * it up toward you for a close look; the PLAY / ATTACK button then floats below
 * it (DuelAction). Click again or elsewhere to set it back down.
 */
export function Duel() {
  const cards = useDuelStore((s) => s.cards);
  const phase = useDuelStore((s) => s.phase);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);
  const inspectedUid = useDuelStore((s) => s.inspectedUid);
  const setInspected = useDuelStore((s) => s.setInspected);
  const pendingMulligan = useDuelStore((s) => s.pendingMulligan);

  const canAttack = current === 'you' && !winner && !pendingMulligan && phase === 'combat';
  const anyFocused = inspectedUid != null;

  const zone = (owner: Side, z: DuelCard['zone']) =>
    cards.filter((c) => c.owner === owner && c.zone === z);

  const board = useMemo(
    () => [
      ...boardRow(zone('oracle', 'lands'), -3.6),
      ...boardRow(zone('oracle', 'creatures'), -1.9),
      ...boardRow(zone('you', 'creatures'), 1.6),
      ...boardRow(zone('you', 'lands'), 3.4),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards]
  );

  const hand = zone('you', 'hand');
  const handStart = -((hand.length - 1) * 1.5) / 2;
  const untappedLands = zone('you', 'lands').filter((c) => !c.tapped).length;
  const canPlay =
    current === 'you' && !winner && !pendingMulligan && (phase === 'main1' || phase === 'main2');
  const canAfford = (dc: DuelCard) =>
    /land/i.test(dc.card.typeLine) || untappedLands >= (dc.card.manaValue ?? 0);

  const toggle = (uid: string) => setInspected(inspectedUid === uid ? null : uid);

  return (
    <group>
      {/* table surface + seam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -1]}>
        <planeGeometry args={[28, 18]} />
        <meshBasicMaterial color="#0c0a18" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.7]}>
        <planeGeometry args={[24, 0.05]} />
        <meshBasicMaterial color="#8b6cff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* click-away plane to set a card back down */}
      {anyFocused && (
        <mesh position={[0, 2, -3]} onClick={() => setInspected(null)}>
          <planeGeometry args={[80, 50]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {board.map(({ dc, slot }) => (
        <DuelCardMesh
          key={dc.uid}
          dc={dc}
          slot={anyFocused && inspectedUid !== dc.uid ? { ...slot, z: slot.z - 4 } : slot}
          selected={inspectedUid === dc.uid}
          tapped={dc.tapped}
          playable={
            canAttack && dc.owner === 'you' && dc.zone === 'creatures' && !dc.tapped && !dc.sick
          }
          onClick={() => toggle(dc.uid)}
        />
      ))}

      {hand.map((dc, i) => {
        const x = handStart + i * 1.5;
        const slot = {
          x,
          y: 1.9 + Math.abs(x) * -0.04,
          // Each card a hair closer than its left neighbour — matches the
          // fanned stacking order visually and gives the raycaster an
          // unambiguous winner in the overlap between adjacent cards.
          z: 6 + i * 0.015,
          tilt: HAND_TILT,
          fan: -x * 0.05,
          scale: HAND_SCALE,
        };
        return (
          <DuelCardMesh
            key={dc.uid}
            dc={dc}
            slot={
              anyFocused && inspectedUid !== dc.uid
                ? { ...slot, y: -1.4, z: 8.2, scale: slot.scale * 0.55, fan: slot.fan * 0.4 }
                : slot
            }
            selected={inspectedUid === dc.uid}
            tapped={false}
            playable={canPlay && canAfford(dc)}
            onClick={() => toggle(dc.uid)}
          />
        );
      })}
    </group>
  );
}
