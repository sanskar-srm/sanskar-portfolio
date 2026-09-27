'use client';

import dynamic from 'next/dynamic';
import {useApp} from '@/lib/store';

// The whole three.js bundle is code-split and only fetched on capable devices.
const Scene = dynamic(() => import('@/components/three/scene'), {ssr: false});

/** 2D stand-in used on first paint, low-power devices and reduced motion. */
function FallbackBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -right-[10%] top-[8%] h-[60vmax] w-[60vmax] animate-drift rounded-full bg-[radial-gradient(circle_at_center,rgba(157,92,255,0.34),transparent_62%)] blur-2xl" />
      <div
        className="absolute -left-[15%] bottom-[-10%] h-[55vmax] w-[55vmax] animate-drift rounded-full bg-[radial-gradient(circle_at_center,rgba(200,255,61,0.12),transparent_60%)] blur-2xl"
        style={{animationDelay: '-9s'}}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#07070a_85%)]" />
    </div>
  );
}

export default function Stage() {
  const tier = useApp(s => s.tier);
  const show3D = tier === 'mid' || tier === 'high';
  return (
    <>
      <FallbackBackdrop />
      {show3D && <Scene />}
    </>
  );
}
