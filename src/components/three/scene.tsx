'use client';

import {PerformanceMonitor} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import {Suspense, useRef, useState} from 'react';
import {pointer, scroll} from '@/lib/live';
import {useApp} from '@/lib/store';
import Blob from './blob';
import Effects from './effects';
import Particles from './particles';

/** Mouse-parallax camera with a hint of roll from scroll velocity. */
function CameraRig() {
  useFrame(({camera}, delta) => {
    const k = 1 - Math.exp(-delta * 2.5);
    camera.position.x += (pointer.nx * 0.35 - camera.position.x) * k;
    camera.position.y += (-pointer.ny * 0.25 - camera.position.y) * k;
    camera.rotation.z += (-scroll.velocity * 0.0006 - camera.rotation.z) * k;
    camera.lookAt(0, 0, -1.5);
  });
  return null;
}

/** Flags the scene as ready once a couple of frames have actually rendered. */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current++ === 2) useApp.getState().setSceneReady();
  });
  return null;
}

export default function Scene() {
  const tier = useApp(s => s.tier);
  const loaded = useApp(s => s.loaded);
  const setTier = useApp(s => s.setTier);
  const high = tier === 'high';
  const [dpr, setDpr] = useState<number>(high ? 1.6 : 1.25);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1600ms] ease-expo"
      style={{opacity: loaded ? 1 : 0}}
    >
      <Canvas
        dpr={dpr}
        camera={{position: [0, 0, 6], fov: 35, near: 0.1, far: 80}}
        gl={{antialias: !high, powerPreference: 'high-performance', alpha: false, stencil: false}}
        onCreated={({gl, scene, camera}) => {
          gl.setClearColor('#07070a');
          gl.compile(scene, camera);
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(d => Math.max(1, d - 0.3))}
          onIncline={() => setDpr(d => Math.min(high ? 1.75 : 1.25, d + 0.2))}
          flipflops={3}
          onFallback={() => high && setTier('mid')}
        />
        <Suspense fallback={null}>
          <CameraRig />
          <Blob detail={high ? 64 : 36} />
          <Particles count={high ? 1600 : 650} />
          {high && <Effects />}
          <ReadySignal />
        </Suspense>
      </Canvas>
    </div>
  );
}
