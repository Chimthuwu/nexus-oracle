import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDuelStore } from '../store/useDuelStore';
import type { DuelCard, Side } from '../store/useDuelStore';
import { Card3D } from './Card3D';

const CARD_SCALE = 0.6;
const HAND_SCALE = 0.78;
const COL_GAP = 1.8;

interface SlotProps {
  dc: DuelCard;
  target: [number, number, number];
  rotX: number;
  fan: number;
  scale: number;
  tapped: boolean;
  focused: boolean;
  anyFocused: boolean;
  playable: boolean;
  onClick: () => void;
}

function BoardCard({
  dc,
  target,
  rotX,
  fan,
  scale,
  tapped,
  focused,
  anyFocused,
  playable,
  onClick,
}: SlotProps) {
  const g = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!g.current || !inner.current) return;
    const k = 0.15;

    let [tx, ty, tz] = target;
    let rx = rotX;
    let rz = tapped ? Math.PI / 2 : 0;
    let ry = fan;
    let s = playable ? scale * 1.06 : scale;

    if (focused) {
      tx = 1.4;
      ty = 1.9;
      tz = 5.6;
      rx = 0;
      rz = 0;
      ry = 0;
      s = 1.0;
    } else if (anyFocused) {
      s *= 0.9;
    }

    g.current.position.x += (tx - g.current.position.x) * k;
    g.current.position.y += (ty - g.current.position.y) * k;
    g.current.position.z += (tz - g.current.position.z) * k;
    g.current.rotation.x += (rx - g.current.rotation.x) * k;
    g.current.rotation.z += (rz - g.current.rotation.z) * k;
    inner.current.rotation.y += (ry - inner.current.rotation.y) * k;
    const cur = g.current.scale.x + (s - g.current.scale.x) * k;
    g.current.scale.setScalar(cur);
  });

  return (
    <group ref={g} position={[target[0], target[1] + 3, target[2]]} scale={0.01}>
      <group ref={inner}>
        <Card3D card={dc.card} focused={focused || playable} onClick={onClick} />
      </group>
    </group>
  );
}

function rowSlots(cards: DuelCard[], z: number, y: number) {
  const start = -((cards.length - 1) * COL_GAP) / 2;
  return cards.map((dc, i) => ({
    dc,
    pos: [start + i * COL_GAP, y, z] as [number, number, number],
  }));
}

export function Duel() {
  const cards = useDuelStore((s) => s.cards);
  const phase = useDuelStore((s) => s.phase);
  const current = useDuelStore((s) => s.current);
  const winner = useDuelStore((s) => s.winner);
  const inspectedUid = useDuelStore((s) => s.inspectedUid);
  const setInspected = useDuelStore((s) => s.setInspected);

  const yourTurn = current === 'you' && !winner;
  const canPlay = yourTurn && (phase === 'main1' || phase === 'main2');
  const canAttack = yourTurn && phase === 'combat';

  const zoneCards = (owner: Side, zone: DuelCard['zone']) =>
    cards.filter((c) => c.owner === owner && c.zone === zone);

  const layout = useMemo(
    () => ({
      oracleLands: rowSlots(zoneCards('oracle', 'lands'), -5.4, 1.75),
      oracleCreatures: rowSlots(zoneCards('oracle', 'creatures'), -3.2, 1.75),
      youCreatures: rowSlots(zoneCards('you', 'creatures'), 0.6, 1.75),
      youLands: rowSlots(zoneCards('you', 'lands'), 2.5, 1.65),
      hand: zoneCards('you', 'hand'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards]
  );

  const hand = layout.hand;
  const handStart = -((hand.length - 1) * 1.45) / 2;
  const anyFocused = inspectedUid != null;

  const toggle = (uid: string) => setInspected(inspectedUid === uid ? null : uid);

  return (
    <group>
      {/* click-away plane to release a focused card */}
      {anyFocused && (
        <mesh position={[0, 1, -6]} onClick={() => setInspected(null)}>
          <planeGeometry args={[90, 60]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* battlefield seam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.2]}>
        <planeGeometry args={[22, 0.05]} />
        <meshBasicMaterial color="#8b6cff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </mesh>

      {[...layout.oracleLands, ...layout.oracleCreatures].map(({ dc, pos }) => (
        <BoardCard
          key={dc.uid}
          dc={dc}
          target={pos}
          rotX={-0.1}
          fan={0}
          scale={CARD_SCALE}
          tapped={dc.tapped}
          focused={inspectedUid === dc.uid}
          anyFocused={anyFocused}
          playable={false}
          onClick={() => toggle(dc.uid)}
        />
      ))}

      {[...layout.youCreatures, ...layout.youLands].map(({ dc, pos }) => (
        <BoardCard
          key={dc.uid}
          dc={dc}
          target={pos}
          rotX={-0.1}
          fan={0}
          scale={CARD_SCALE}
          tapped={dc.tapped}
          focused={inspectedUid === dc.uid}
          anyFocused={anyFocused}
          playable={canAttack && dc.zone === 'creatures' && !dc.tapped && !dc.sick}
          onClick={() => toggle(dc.uid)}
        />
      ))}

      {hand.map((dc, i) => {
        const x = handStart + i * 1.45;
        return (
          <BoardCard
            key={dc.uid}
            dc={dc}
            target={[x, 0.55 + Math.abs(x) * -0.05, 7.2]}
            rotX={-0.2}
            fan={-x * 0.05}
            scale={HAND_SCALE}
            tapped={false}
            focused={inspectedUid === dc.uid}
            anyFocused={anyFocused}
            playable={canPlay}
            onClick={() => toggle(dc.uid)}
          />
        );
      })}
    </group>
  );
}
