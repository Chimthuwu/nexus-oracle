import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';
import type { CardData } from '../store/useOracleStore';
import { Card3D } from './Card3D';

const COLS = 5;
const GAP_X = 3.0;
const GAP_Y = 4.15;
const TOP_Y = 3.2;
const FOCUS_Z = 7;

interface SlotProps {
  card: CardData;
  baseX: number;
  baseY: number; // static row position inside the scrolling container
  baseZ: number;
  baseRotY: number;
  focused: boolean;
  anyFocused: boolean;
  containerY: React.MutableRefObject<number>;
  onClick: () => void;
}

function Slot({
  card,
  baseX,
  baseY,
  baseZ,
  baseRotY,
  focused,
  anyFocused,
  containerY,
  onClick,
}: SlotProps) {
  const g = useRef<THREE.Group>(null);
  const appear = useRef(0);

  useFrame((_, delta) => {
    if (!g.current) return;
    appear.current = Math.min(1, appear.current + delta * 2.4);

    let tx = baseX;
    let ty = baseY;
    let tz = baseZ;
    let ry = baseRotY;
    let s = 1;

    if (focused) {
      // Pin to a fixed spot in front of the camera regardless of scroll.
      tx = 0;
      ty = -containerY.current + 0.6;
      tz = FOCUS_Z;
      ry = 0;
      s = 1.7;
    } else if (anyFocused) {
      tz = baseZ - 5;
    }

    const k = 0.14;
    g.current.position.x += (tx - g.current.position.x) * k;
    g.current.position.y += (ty - g.current.position.y) * k;
    g.current.position.z += (tz - g.current.position.z) * k;
    g.current.rotation.y += (ry - g.current.rotation.y) * k;
    const target = s * (0.5 + 0.5 * appear.current);
    g.current.scale.setScalar(g.current.scale.x + (target - g.current.scale.x) * k);
  });

  return (
    <group ref={g} position={[baseX, baseY + 5, baseZ]} scale={0.5}>
      <Card3D card={card} focused={focused} onClick={onClick} />
    </group>
  );
}

export function CardBrowser() {
  const cards = useOracleStore((s) => s.browserCards);
  const inspectedCard = useOracleStore((s) => s.inspectedCard);
  const setInspectedCard = useOracleStore((s) => s.setInspectedCard);

  const container = useRef<THREE.Group>(null);
  const containerY = useRef(0);
  const scrollTarget = useRef(0);

  const rows = Math.max(1, Math.ceil(cards.length / COLS));
  const maxScroll = Math.max(0, (rows - 1) * GAP_Y - GAP_Y * 0.5);

  useEffect(() => {
    scrollTarget.current = 0;
  }, [cards]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (inspectedCard) return;
      scrollTarget.current = THREE.MathUtils.clamp(
        scrollTarget.current + e.deltaY * 0.01,
        0,
        maxScroll
      );
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [maxScroll, inspectedCard]);

  useFrame(() => {
    containerY.current += (scrollTarget.current - containerY.current) * 0.12;
    if (container.current) container.current.position.y = containerY.current;
  });

  const slots = useMemo(() => {
    const center = (COLS - 1) / 2;
    return cards.map((card, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const off = col - center;
      return {
        card,
        baseX: off * GAP_X,
        baseZ: -(Math.abs(off) ** 1.3) * 0.45,
        baseRotY: -off * 0.11,
        rowY: TOP_Y - row * GAP_Y,
      };
    });
  }, [cards]);

  return (
    <group ref={container} position={[0, 0, 0]}>
      {slots.map((slot) => (
        <Slot
          key={slot.card.id}
          card={slot.card}
          baseX={slot.baseX}
          baseY={slot.rowY}
          baseZ={slot.baseZ}
          baseRotY={slot.baseRotY}
          focused={inspectedCard?.id === slot.card.id}
          anyFocused={inspectedCard != null}
          containerY={containerY}
          onClick={() =>
            setInspectedCard(inspectedCard?.id === slot.card.id ? null : slot.card)
          }
        />
      ))}
    </group>
  );
}
