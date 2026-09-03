import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

const _target = new THREE.Vector3();

export function CameraRig() {
  const { camera, pointer } = useThree();
  const view = useOracleStore((s) => s.view);
  const inspectedCard = useOracleStore((s) => s.inspectedCard);

  useFrame(() => {
    let px = 0;
    let py = 1;
    let pz = 12;
    let lookY = 0;

    if (inspectedCard) {
      // Close-up on the inspected card (both modes park it near the centre).
      px = view === 'browser' ? 0 : 0;
      py = 0;
      pz = view === 'browser' ? 11 : 5;
      lookY = 0;
    } else if (view === 'browser') {
      // Steady framing of the card wall, faint parallax from the pointer.
      px = pointer.x * 1.2;
      py = pointer.y * 0.8;
      pz = 15;
      lookY = 0;
    } else {
      // Oracle idle orbit.
      px = pointer.x * 2;
      py = pointer.y * 2 + 1;
      pz = 12;
      lookY = 0;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, py, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, pz, 0.05);
    camera.lookAt(_target.set(0, lookY, 0));
  });

  return null;
}
