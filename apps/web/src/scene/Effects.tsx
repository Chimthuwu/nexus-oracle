import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function Effects() {
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
      />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}
