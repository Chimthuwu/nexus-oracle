import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CardData, useOracleStore } from '../store/useOracleStore';

interface CardMeshProps {
  card: CardData;
  index: number;
  total: number;
}

function CardArt({ url }: { url: string }) {
  const texture = useTexture(url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
  return (
    <mesh position={[0, 0.7, 0.027]}>
      <planeGeometry args={[2.3, 1.4]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function CardArtFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).color.setHSL(
        0, 0, 0.1 + Math.sin(state.clock.elapsedTime * 5) * 0.05
      );
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.7, 0.027]}>
      <planeGeometry args={[2.3, 1.4]} />
      <meshBasicMaterial color="#333" />
    </mesh>
  );
}

export function CardMesh({ card, index, total }: CardMeshProps) {
  const group = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const setInspectedCard = useOracleStore(state => state.setInspectedCard);
  const inspectedCard = useOracleStore(state => state.inspectedCard);
  
  const isSelected = inspectedCard?.id === card.id;

  // Generate a random spawn position far away
  const spawnPos = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
    -30 - Math.random() * 20
  ), []);

  // Calculate target position in a gentle arc
  const targetPos = useMemo(() => {
    const spread = 2.8;
    const offset = (index - (total - 1) / 2) * spread;
    // slight curve (parabola)
    const yOffset = -Math.pow(offset, 2) * 0.05 + 0.5;
    return new THREE.Vector3(offset, yOffset, 2);
  }, [index, total]);

  useFrame((state, delta) => {
    if (group.current) {
      if (isSelected) {
        // Fly to center for inspection
        const inspectPos = new THREE.Vector3(-1.5, 0, 3);
        group.current.position.lerp(inspectPos, 0.08);
        
        // Gentle rotation in inspect mode
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime) * 0.1, 0.05);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.05);
      } else {
        // Lerp position towards target in arc
        group.current.position.lerp(targetPos, 0.05);
        
        // Face camera somewhat, with slight bobbing
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, 0.05);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0, 0.05);
        
        // Floating effect once settled
        if (group.current.position.distanceTo(targetPos) < 0.5 && !inspectedCard) {
          group.current.position.y += Math.sin(state.clock.elapsedTime * 2 + index) * 0.002;
        }
      }
      
      // If another card is inspected, fade out or push back (just push back for now)
      if (inspectedCard && !isSelected) {
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, -10, 0.05);
      }
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    setInspectedCard(isSelected ? null : card);
  };

  return (
    <group ref={group} position={spawnPos} onClick={handleClick}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[2.5, 3.5, 0.05]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Frame / Borders */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[2.4, 3.4]} />
        <meshBasicMaterial color="#222" />
      </mesh>

      <Suspense fallback={<CardArtFallback />}>
        <CardArt url={card.artCropUrl} />
      </Suspense>

      {/* Name Bar */}
      <mesh position={[0, 1.5, 0.027]}>
        <planeGeometry args={[2.3, 0.3]} />
        <meshBasicMaterial color="#c8bfa9" />
      </mesh>
      <Text position={[-1.1, 1.5, 0.028]} fontSize={0.15} color="#16130e" anchorX="left" fontWeight="bold">
        {card.name.toUpperCase()}
      </Text>

      {/* Type Line */}
      <mesh position={[0, -0.1, 0.027]}>
        <planeGeometry args={[2.3, 0.25]} />
        <meshBasicMaterial color="#c8bfa9" />
      </mesh>
      <Text position={[-1.1, -0.1, 0.028]} fontSize={0.12} color="#16130e" anchorX="left" fontWeight="bold">
        {card.typeLine.toUpperCase()}
      </Text>

      {/* Oracle Text Box */}
      <mesh position={[0, -1.0, 0.027]}>
        <planeGeometry args={[2.3, 1.4]} />
        <meshBasicMaterial color="#d2c8ae" />
      </mesh>
      <Text 
        position={[-1.1, -0.4, 0.028]} 
        fontSize={0.09} 
        color="#16130e" 
        anchorX="left" 
        anchorY="top" 
        maxWidth={2.1}
        lineHeight={1.4}
      >
        {card.oracleText}
      </Text>
    </group>
  );
}
