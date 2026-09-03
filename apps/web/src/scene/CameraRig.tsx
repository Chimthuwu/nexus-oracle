import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

export function CameraRig() {
  const { camera, pointer } = useThree();
  const inspectedCard = useOracleStore(state => state.inspectedCard);

  useFrame((state, delta) => {
    if (inspectedCard) {
      // In Inspect mode, move camera close to the center
      const targetX = 0;
      const targetY = 0;
      const targetZ = 5;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
      camera.lookAt(0, 0, 0);
    } else {
      // Idle orbit - slight movement based on pointer
      const targetX = (pointer.x * 2);
      const targetY = (pointer.y * 2) + 1;
      const targetZ = 12;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
      
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}
