'use client';

import {ContactShadows, Environment, Float, Lightformer, RoundedBox, useTexture} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import {Suspense, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {pointer} from '@/lib/live';

/** Shared, mutable progress (0..1 across all screens) written by the showcase's scroll timeline. */
export type ScreenProgress = {current: number};

const BODY = {w: 1.62, h: 3.44, d: 0.19, r: 0.24};
const SCREEN = {w: 1.5, h: 3.32, r: 0.19};

const screenVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

// Rounded-rect screen that dissolves between two screenshots with a glowing sweep.
const screenFragment = /* glsl */ `
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uMix;
uniform vec2 uSize;
uniform float uRadius;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float roundedBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }

void main(){
  vec2 p = (vUv - 0.5) * uSize;
  float sdf = roundedBox(p, uSize * 0.5, uRadius);
  if (sdf > 0.0) discard;

  vec3 a = texture2D(uA, vUv).rgb;
  vec3 b = texture2D(uB, vUv).rgb;

  float n = noise(vUv * vec2(16.0, 34.0)) * 0.6 + noise(vUv * vec2(4.0, 8.0)) * 0.4;
  float d = (1.0 - vUv.y) * 0.85 + n * 0.15;
  float edge = uMix * 1.3 - 0.15;
  float m = 1.0 - smoothstep(edge - 0.015, edge + 0.015, d); // revealed where d < edge
  vec3 col = mix(a, b, m);

  float moving = step(0.001, uMix) * step(uMix, 0.999);
  float glow = smoothstep(0.022, 0.0, abs(d - edge)) * moving;
  col = mix(col, vec3(0.78, 1.0, 0.24), glow * 0.9);

  // glass sheen
  col += 0.05 * smoothstep(0.35, 1.2, vUv.x + vUv.y * 0.4);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

function Screen({screens, progress}: {screens: string[]; progress: ScreenProgress}) {
  const textures = useTexture(screens);
  const material = useRef<THREE.ShaderMaterial>(null);
  useMemo(
    () =>
      textures.forEach(t => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
      }),
    [textures]
  );
  // Created once: three.js binds the uniforms object at compile time, so it must never be replaced.
  const uniforms = useMemo(
    () => ({
      uA: {value: textures[0]},
      uB: {value: textures[Math.min(1, textures.length - 1)]},
      uMix: {value: 0},
      uSize: {value: new THREE.Vector2(SCREEN.w, SCREEN.h)},
      uRadius: {value: SCREEN.r},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(() => {
    // Write to the live material: the renderer reads material.uniforms, not our initial object.
    const u = material.current?.uniforms;
    if (!u) return;
    const n = textures.length;
    const f = Math.min(Math.max(progress.current, 0), 1) * (n - 1);
    const i = Math.min(Math.floor(f), n - 2);
    const frac = f - Math.max(i, 0);
    // hold each screen, then transition in the middle of the gap
    const t = THREE.MathUtils.smoothstep(frac, 0.3, 0.7);
    u.uA.value = textures[Math.max(i, 0)];
    u.uB.value = textures[Math.min(Math.max(i, 0) + 1, n - 1)];
    u.uMix.value = n < 2 ? 0 : t;
  });

  return (
    <mesh position={[0, 0, BODY.d / 2 + 0.009]}>
      <planeGeometry args={[SCREEN.w, SCREEN.h]} />
      <shaderMaterial ref={material} vertexShader={screenVertex} fragmentShader={screenFragment} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
}

function Phone({screens, progress}: {screens: string[]; progress: ScreenProgress}) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-delta * 4);
    const g = group.current;
    // Turns from three-quarter left to three-quarter right across the showcase, plus damped mouse tilt.
    const targetY = -0.5 + progress.current * 1.0 + pointer.nx * 0.25;
    const targetX = 0.06 - pointer.ny * 0.14;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
  });

  const frame = (
    <meshPhysicalMaterial color="#1a1a21" metalness={0.92} roughness={0.26} clearcoat={1} clearcoatRoughness={0.15} />
  );

  return (
    <group ref={group}>
      {/* body */}
      <RoundedBox args={[BODY.w, BODY.h, BODY.d]} radius={BODY.r} smoothness={8} castShadow>
        {frame}
      </RoundedBox>
      {/* black glass front, slightly inset */}
      <RoundedBox args={[BODY.w - 0.05, BODY.h - 0.05, 0.01]} radius={BODY.r - 0.02} smoothness={6} position={[0, 0, BODY.d / 2 - 0.002]}>
        <meshPhysicalMaterial color="#050507" roughness={0.08} metalness={0.2} clearcoat={1} />
      </RoundedBox>
      <Screen screens={screens} progress={progress} />
      {/* dynamic island */}
      <RoundedBox args={[0.44, 0.13, 0.01]} radius={0.06} smoothness={4} position={[0, SCREEN.h / 2 - 0.17, BODY.d / 2 + 0.014]}>
        <meshBasicMaterial color="#000" />
      </RoundedBox>
      {/* side buttons */}
      {[
        [BODY.w / 2 + 0.012, 0.75, 0.42],
        [-BODY.w / 2 - 0.012, 0.95, 0.22],
        [-BODY.w / 2 - 0.012, 0.55, 0.36],
        [-BODY.w / 2 - 0.012, 0.1, 0.36],
      ].map(([x, y, h], i) => (
        <RoundedBox key={i} args={[0.03, h, 0.07]} radius={0.012} smoothness={3} position={[x, y, 0]}>
          {frame}
        </RoundedBox>
      ))}
      {/* camera module on the back */}
      <group position={[-0.34, BODY.h / 2 - 0.62, -BODY.d / 2 - 0.02]}>
        <RoundedBox args={[0.78, 0.82, 0.05]} radius={0.16} smoothness={4}>
          <meshPhysicalMaterial color="#23232c" metalness={0.6} roughness={0.35} clearcoat={1} />
        </RoundedBox>
        {[
          [-0.17, 0.18],
          [-0.17, -0.18],
          [0.19, 0],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, -0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.14, 0.05, 32]} />
            <meshPhysicalMaterial color="#07070a" metalness={0.5} roughness={0.1} clearcoat={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function PhoneScene({screens, progress, label}: {screens: string[]; progress: ScreenProgress; label: string}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{position: [0, 0, 8.4], fov: 30}}
      gl={{antialias: true, alpha: true, powerPreference: 'high-performance'}}
      aria-label={label}
      role="img"
    >
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 4, 4]} scale={[8, 1.2, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#9d5cff" />
          <Lightformer intensity={1.4} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#c8ff3d" />
          <Lightformer intensity={0.8} position={[0, -4, -2]} scale={[8, 1, 1]} color="#ffffff" />
        </Environment>
        <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.5}>
          <Phone screens={screens} progress={progress} />
        </Float>
        <ContactShadows position={[0, -2.25, 0]} opacity={0.55} blur={2.6} scale={7} far={4} color="#000" />
      </Suspense>
    </Canvas>
  );
}
