import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * Post pipeline: additive glow on everything bright (the Oracle, the point
 * clouds, card summon flashes) plus a gentle lens vignette to pull the eye to
 * centre.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.18}
        luminanceSmoothing={0.9}
        intensity={1.15}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.15} darkness={0.95} />
    </EffectComposer>
  );
}
