import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * Post pipeline: additive bloom for every bright source, soft vignette.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={1.1}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.16} darkness={0.98} />
    </EffectComposer>
  );
}
