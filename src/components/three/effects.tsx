'use client';

import {useFrame} from '@react-three/fiber';
import {Bloom, ChromaticAberration, EffectComposer, Vignette} from '@react-three/postprocessing';
import {BlendFunction, type ChromaticAberrationEffect} from 'postprocessing';
import {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {scroll} from '@/lib/live';

/** Cinematic post stack. Chromatic aberration breathes with scroll velocity. */
export default function Effects() {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), []);

  useFrame((_, delta) => {
    if (!ca.current) return;
    const target = 0.0006 + Math.min(Math.abs(scroll.velocity) * 0.00018, 0.0045);
    const k = 1 - Math.exp(-delta * 6);
    offset.x += (target - offset.x) * k;
    offset.y = offset.x;
    ca.current.offset.copy(offset);
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.95} luminanceThreshold={0.55} luminanceSmoothing={0.25} radius={0.75} />
      <ChromaticAberration
        ref={ca}
        offset={offset}
        radialModulation
        modulationOffset={0.35}
        blendFunction={BlendFunction.NORMAL}
      />
      <Vignette eskil={false} offset={0.22} darkness={0.72} />
    </EffectComposer>
  );
}
