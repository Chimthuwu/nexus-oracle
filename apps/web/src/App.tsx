import { Canvas } from '@react-three/fiber';
import { Oracle } from './scene/Oracle';
import { CameraRig } from './scene/CameraRig';
import { Effects } from './scene/Effects';
import { CardMesh } from './scene/CardMesh';
import { SpaceAssets } from './scene/SpaceAssets';
import { CommandBar } from './components/CommandBar';
import { ResponseCaption } from './components/ResponseCaption';
import { InspectHUD } from './components/InspectHUD';
import { Spine } from './components/Spine';
import { useOracleStore } from './store/useOracleStore';

function SceneContent() {
  const cards = useOracleStore(state => state.cards);
  return (
    <>
      <SpaceAssets />
      <Oracle />
      {cards.map((card, idx) => (
        <CardMesh key={card.id} card={card} index={idx} total={cards.length} />
      ))}
      <CameraRig />
      <Effects />
    </>
  );
}

function App() {
  return (
    <>
      <div className="loading" id="loading" style={{ display: 'none' }}><div className="glyph"></div><span>Waking the Oracle</span></div>
      
      <div id="scene">
        <Canvas
          camera={{ position: [0, 2, 10], fov: 45 }}
          gl={{ antialias: false, toneMappingExposure: 1.2 }}
        >
          <color attach="background" args={['#020103']} />
          
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

          <SceneContent />
        </Canvas>
      </div>
      
      <div className="wordmark"><div className="glyph"></div><span>NEXUS</span></div>
      
      <Spine />
      <ResponseCaption />
      <InspectHUD />
      <CommandBar />
    </>
  );
}

export default App;
