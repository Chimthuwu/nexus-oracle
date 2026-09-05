import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useOracleStore } from '../store/useOracleStore';

const _target = new THREE.Vector3();

export function CameraRig() {
  const { camera, pointer } = useThree();
  const view = useOracleStore((s) => s.view);
  const inspectedCard = useOracleStore((s) => s.inspectedCard);

  useFrame((state) => {
    // Oracle mode is driven by <OrbitControls> — hands off.
    if (view === 'oracle') return;

    let px = 0;
    let py = 1;
    let pz = 12;
    let lookY = 0;

    if (view === 'mindmapper') {
      // The brain mesh is deliberately oversized (radius 8). Frame it pulled
      // back and raised so its whole bulk sits in the upper screen, clear of
      // the bottom question/answer HUD, then orbit it slowly. Removes the
      // mount-time-camera fragility of the old in-scene <OrbitControls> and
      // keeps framing identical regardless of viewport height.
      const cam = camera as THREE.PerspectiveCamera;
      if (cam.fov !== 50) {
        cam.fov = 50;
        cam.updateProjectionMatrix();
      }
      const ang = state.clock.elapsedTime * 0.06;
      const dist = 26;
      px = Math.sin(ang) * dist + pointer.x * 0.6;
      py = 1 + pointer.y * 0.4;
      pz = Math.cos(ang) * dist;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, py, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, pz, 0.05);
      // Aim above the brain's centre (it sits at y≈-5) so the whole mesh
      // rides in the upper ~60% of the frame, above the HUD.
      camera.lookAt(_target.set(0, -2, 0));
      return;
    }

    if (view === 'duel') {
      // Looking down at the table — opponent's side up-screen, yours down-screen.
      // Wider than the other views' fov so both your hand (close, low) and the
      // far board row (opponent's lands) stay inside frame together.
      const cam = camera as THREE.PerspectiveCamera;
      if (cam.fov !== 58) {
        cam.fov = 58;
        cam.updateProjectionMatrix();
      }
      px = pointer.x * 0.4;
      py = 7.6 + pointer.y * 0.3;
      pz = 9.6;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, px, 0.06);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, py, 0.06);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, pz, 0.06);
      camera.lookAt(_target.set(0, 0.5, -1.2));
      return;
    }

    {
      const cam = camera as THREE.PerspectiveCamera;
      if (cam.fov !== 50) {
        cam.fov = 50;
        cam.updateProjectionMatrix();
      }
    }

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
