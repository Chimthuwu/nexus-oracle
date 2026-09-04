import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';
import type { CardData } from '../store/useOracleStore';
import { Card3D } from './Card3D';

const COLS = 5;
const GAP_X = 3.0;
const GAP_Y = 4.15;
const TOP_Y = 2.4;
const FOCUS_Z = 4.2;
const FOCUS_SCALE = 1.32;
// How many rows to keep rendered around the camera
const RENDER_WINDOW_UP = 3;
const RENDER_WINDOW_DOWN = 4;

interface DragState {
  active: boolean;
  rot: { x: number; y: number };
  last: { x: number; y: number };
  moved: number;
}

interface SlotProps {
  card: CardData;
  baseX: number;
  baseY: number;
  baseZ: number;
  baseRotY: number;
  focused: boolean;
  anyFocused: boolean;
  containerY: React.MutableRefObject<number>;
  drag: React.MutableRefObject<DragState>;
  onToggle: () => void;
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
  drag,
  onToggle,
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
    let rx = 0;
    let s = 1;

    if (focused) {
      tx = 0;
      ty = -containerY.current + 0.4;
      tz = FOCUS_Z;
      ry = drag.current.rot.y;
      rx = drag.current.rot.x;
      s = FOCUS_SCALE;
    } else if (anyFocused) {
      tz = baseZ - 5;
    }

    const k = 0.14;
    g.current.position.x += (tx - g.current.position.x) * k;
    g.current.position.y += (ty - g.current.position.y) * k;
    g.current.position.z += (tz - g.current.position.z) * k;
    // Focused card follows the drag directly; others ease.
    g.current.rotation.y += (ry - g.current.rotation.y) * (focused ? 0.4 : k);
    g.current.rotation.x += (rx - g.current.rotation.x) * (focused ? 0.4 : k);
    const target = s * (0.5 + 0.5 * Math.pow(appear.current, 0.5));
    g.current.scale.setScalar(g.current.scale.x + (target - g.current.scale.x) * k);
  });

  // Start slightly behind and scaled down to animate in cleanly when virtualized
  return (
    <group ref={g} position={[baseX, baseY, baseZ - 4]} scale={0.2}>
      <Card3D
        card={card}
        focused={focused}
        onPointerDown={(e) => {
          if (!focused) return;
          drag.current.active = true;
          drag.current.moved = 0;
          drag.current.last = { x: e.clientX, y: e.clientY };
        }}
        onClick={() => {
          // Ignore the click that ends a rotate-drag.
          if (focused && drag.current.moved > 6) return;
          onToggle();
        }}
      />
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
  const drag = useRef<DragState>({
    active: false,
    rot: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    moved: 0,
  });

  const [currentRow, setCurrentRow] = useState(0);

  const rows = Math.max(1, Math.ceil(cards.length / COLS));
  const maxScroll = Math.max(0, (rows - 1) * GAP_Y - GAP_Y * 0.5);

  useEffect(() => {
    scrollTarget.current = 0;
    setCurrentRow(0);
  }, [cards]);

  // Reset the rotation whenever the focused card changes.
  useEffect(() => {
    drag.current.rot = { x: 0, y: 0 };
    drag.current.active = false;
  }, [inspectedCard]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (inspectedCard) return;
      const nextTarget = THREE.MathUtils.clamp(
        scrollTarget.current + e.deltaY * 0.015,
        0,
        maxScroll
      );
      scrollTarget.current = nextTarget;
      
      const newRow = Math.round(nextTarget / GAP_Y);
      setCurrentRow((prev) => (prev !== newRow ? newRow : prev));
    };
    
    const onMove = (e: PointerEvent | MouseEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.last.x;
      const dy = e.clientY - drag.current.last.y;
      drag.current.last = { x: e.clientX, y: e.clientY };
      drag.current.moved += Math.abs(dx) + Math.abs(dy);
      drag.current.rot.y += dx * 0.011;
      drag.current.rot.x = THREE.MathUtils.clamp(drag.current.rot.x - dy * 0.011, -0.9, 0.9);
    };
    const onUp = () => {
      drag.current.active = false;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('mouseup', onUp);
    };
  }, [maxScroll, inspectedCard]);

  useFrame(() => {
    containerY.current += (scrollTarget.current - containerY.current) * 0.12;
    if (container.current) container.current.position.y = containerY.current;
  });

  const slots = useMemo(() => {
    const center = (COLS - 1) / 2;
    const minRow = Math.max(0, currentRow - RENDER_WINDOW_UP);
    const maxRow = Math.min(rows - 1, currentRow + RENDER_WINDOW_DOWN);
    
    const visibleSlots = [];
    
    for (let i = 0; i < cards.length; i++) {
      const row = Math.floor(i / COLS);
      
      // Virtualization check: ONLY render the card if it's within our window,
      // OR if it is currently the inspected card (so it doesn't unmount mid-inspection).
      const isInspected = inspectedCard?.id === cards[i].id;
      if (!isInspected && (row < minRow || row > maxRow)) continue;
      
      const col = i % COLS;
      const off = col - center;
      
      visibleSlots.push({
        card: cards[i],
        baseX: off * GAP_X,
        baseZ: -(Math.abs(off) ** 1.3) * 0.45,
        baseRotY: -off * 0.11,
        rowY: TOP_Y - row * GAP_Y,
      });
    }
    return visibleSlots;
  }, [cards, currentRow, rows, inspectedCard]);

  return (
    <group ref={container} position={[0, 0, 0]}>
      {/* click-away target to release a focused card */}
      {inspectedCard && (
        <mesh position={[0, 0, -8]} onClick={() => setInspectedCard(null)}>
          <planeGeometry args={[180, 160]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

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
          drag={drag}
          onToggle={() =>
            setInspectedCard(inspectedCard?.id === slot.card.id ? null : slot.card)
          }
        />
      ))}
    </group>
  );
}
