import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraRig() {
  const { camera, pointer } = useThree();

  useFrame((state, delta) => {
    // Idle orbit - slight movement based on pointer
    const targetX = (pointer.x * 2);
    const targetY = (pointer.y * 2) + 2;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10, 0.05);
    
    camera.lookAt(0, 0, 0);
  });

  return null;
}
