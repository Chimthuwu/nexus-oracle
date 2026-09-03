import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BlackHole } from './scene/BlackHole';
import { CameraRig } from './scene/CameraRig';
import { Effects } from './scene/Effects';
import { CardMesh } from './scene/CardMesh';
import { CardBrowser } from './scene/CardBrowser';
import { Duel } from './scene/Duel';
import { SpaceAssets } from './scene/SpaceAssets';
import { MindMapper } from './scene/MindMapper';
import { CommandBar } from './components/CommandBar';
import { BrowserBar } from './components/BrowserBar';
import { DuelHUD } from './components/DuelHUD';
import { ResponseCaption } from './components/ResponseCaption';
import { Transcript } from './components/Transcript';
import { InspectHUD } from './components/InspectHUD';
import { Spine } from './components/Spine';
import { useOracleStore } from './store/useOracleStore';

function SceneContent() {
  const view = useOracleStore((state) => state.view);
  const cards = useOracleStore((state) => state.cards);
  return (
    <>
      <SpaceAssets />
      {view === 'browser' && <CardBrowser />}
      {view === 'duel' && <Duel />}
      {view === 'mindmapper' && <MindMapper />}
      {view === 'oracle' && (
        <>
          <BlackHole />
          {cards.map((card, idx) => (
            <CardMesh key={card.id} card={card} index={idx} total={cards.length} />
          ))}
          {/* Orbit the Oracle 360° — no pan, no zoom, framing stays fixed. */}
          <OrbitControls
            makeDefault
            target={[0, 0.9, 0]}
            enablePan={false}
            enableZoom={false}
            enableDamping
            dampingFactor={0.055}
            rotateSpeed={0.5}
            autoRotate
            autoRotateSpeed={0.22}
          />
        </>
      )}
      <CameraRig />
      <Effects />
    </>
  );
}

/** Cosmetic intro veil — the procedural starfield renders instantly beneath it. */
function LoadingVeil() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`loading${gone ? ' hide' : ''}`} id="loading">
      <div className="glyph" />
      <span>Waking the Oracle</span>
    </div>
  );
}

function App() {
  const view = useOracleStore((s) => s.view);

  return (
    <>
      <div id="scene">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 2.2, 12.5], fov: 50 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.3,
          }}
        >
          <color attach="background" args={['#050308']} />
          <fogExp2 attach="fog" args={['#070410', 0.02]} />

          <ambientLight color="#2a2440" intensity={1.1} />
          <pointLight color="#d6a84f" position={[-6, 3, -3]} intensity={1.1} distance={30} />

          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>

      <LoadingVeil />

      <div className="wordmark">
        <div className="glyph" />
        <span>The Oracle</span>
      </div>

      <Spine />
      <InspectHUD />

      {(view === 'oracle' || view === 'mindmapper') && (
        <>
          <ResponseCaption />
          <CommandBar />
        </>
      )}
      <Transcript />
      <BrowserBar />
      <DuelHUD />
    </>
  );
}

export default App;
