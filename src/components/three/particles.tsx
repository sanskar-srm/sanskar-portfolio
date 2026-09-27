'use client';

import {useFrame, useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {scroll} from '@/lib/live';
import {particleFragment, particleVertex} from './shaders';

/** A field of dust the camera travels through as you scroll. */
export default function Particles({count}: {count: number}) {
  const gl = useThree(s => s.gl);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = Math.random() * -46 + 6;
      scales[i] = 0.4 + Math.random() * 1.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: {value: 0},
      uTravel: {value: 0},
      uPixelRatio: {value: 1},
      uSize: {value: 38},
      uColor: {value: new THREE.Color('#d9d9e3')},
      uColor2: {value: new THREE.Color('#c8ff3d')},
    }),
    []
  );

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    // travel with scroll, plus a slow constant drift so the field never feels static
    const target = scroll.progress * 38 + state.clock.elapsedTime * 0.15;
    uniforms.uTravel.value += (target - uniforms.uTravel.value) * (1 - Math.exp(-delta * 4));
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
