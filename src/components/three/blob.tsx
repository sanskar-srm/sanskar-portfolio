'use client';

import {useFrame, useThree} from '@react-three/fiber';
import {useMemo, useRef} from 'react';
import * as THREE from 'three';
import {gsap} from '@/lib/gsap';
import {lens, pointer, scroll} from '@/lib/live';
import {useApp} from '@/lib/store';
import {desktopPoses, mobilePoses, type Pose} from './poses';
import {blobFragment, blobVertex, plainVertex, xrayFragment} from './shaders';

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const tmpA = new THREE.Color();
const tmpB = new THREE.Color();
const worldPos = new THREE.Vector3();

type Props = {detail: number};

export default function Blob({detail}: Props) {
  const group = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Group>(null!);
  const {size, camera, gl} = useThree();
  const narrow = size.width < 768;
  const poses = narrow ? mobilePoses : desktopPoses;

  // Shared uniforms: the wireframe re-uses the displacement field so it hugs the surface.
  const uniforms = useMemo(
    () => ({
      uTime: {value: 0},
      uDistort: {value: poses[0].distort},
      uFreq: {value: poses[0].freq},
      uSpeed: {value: poses[0].speed},
      uColorA: {value: new THREE.Color(poses[0].colorA)},
      uColorB: {value: new THREE.Color(poses[0].colorB)},
      uColorC: {value: new THREE.Color(poses[0].colorC)},
      uLens: {value: new THREE.Vector2(-9999, -9999)},
      uLensR: {value: 0},
      uIntensity: {value: poses[0].intensity},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const xrayUniforms = useMemo(
    () => ({
      ...uniforms,
      uColor: {value: new THREE.Color('#c8ff3d')},
      uOpacity: {value: 0.9},
    }),
    [uniforms]
  );

  // Live (damped) values, plus the intro scale that plays when the preloader lifts.
  const live = useRef({x: poses[0].pos[0], y: poses[0].pos[1], z: poses[0].pos[2], scale: poses[0].scale, spin: poses[0].spin, intro: 0});
  const introStarted = useRef(false);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const t = state.clock.elapsedTime;
    const L = live.current;

    if (!introStarted.current && useApp.getState().loaded) {
      introStarted.current = true;
      gsap.to(L, {intro: 1, duration: 2.4, ease: 'expo.out', delay: 0.15});
    }

    // Blend between the current and next chapter pose.
    const i = Math.min(poses.length - 1, Math.floor(scroll.chapter));
    const f = smoothstep(0.55, 1, scroll.chapter - i);
    const a: Pose = poses[i];
    const b: Pose = poses[Math.min(poses.length - 1, i + 1)];
    const mix = (x: number, y: number) => x + (y - x) * f;

    const k = 1 - Math.exp(-dt * 3.2);
    L.x += (mix(a.pos[0], b.pos[0]) - L.x) * k;
    L.y += (mix(a.pos[1], b.pos[1]) - L.y) * k;
    L.z += (mix(a.pos[2], b.pos[2]) - L.z) * k;
    L.scale += (mix(a.scale, b.scale) - L.scale) * k;
    L.spin += (mix(a.spin, b.spin) - L.spin) * k;

    const u = uniforms;
    const velocityKick = Math.min(Math.abs(scroll.velocity) * 0.012, 0.25);
    u.uTime.value = t;
    u.uDistort.value += (mix(a.distort, b.distort) + velocityKick + pointer.velocity * 0.004 - u.uDistort.value) * k;
    u.uIntensity.value += (mix(a.intensity, b.intensity) - u.uIntensity.value) * k;
    u.uFreq.value += (mix(a.freq, b.freq) - u.uFreq.value) * k;
    u.uSpeed.value += (mix(a.speed, b.speed) - u.uSpeed.value) * k;
    u.uColorA.value.lerp(tmpA.set(a.colorA).lerp(tmpB.set(b.colorA), f), k);
    u.uColorB.value.lerp(tmpA.set(a.colorB).lerp(tmpB.set(b.colorB), f), k);
    u.uColorC.value.lerp(tmpA.set(a.colorC).lerp(tmpB.set(b.colorC), f), k);

    const g = group.current;
    // Idle float + damped mouse parallax
    g.position.set(L.x + pointer.nx * 0.25, L.y - pointer.ny * 0.2 + Math.sin(t * 0.6) * 0.06, L.z);
    g.scale.setScalar(Math.max(0.0001, L.scale * L.intro));
    g.rotation.y += dt * L.spin + scroll.velocity * 0.0009;
    g.rotation.x += ((pointer.ny * 0.35 + Math.sin(t * 0.25) * 0.1) - g.rotation.x) * k;
    g.rotation.z += ((-pointer.nx * 0.2) - g.rotation.z) * k;
    core.current.rotation.x = t * 0.5;
    core.current.rotation.y = -t * 0.7;

    // X-ray lens: screen-space circle in device pixels
    const dpr = gl.getPixelRatio();
    u.uLens.value.set(pointer.lx * dpr, (size.height - pointer.ly) * dpr);
    u.uLensR.value = lens.r * dpr;

    // Is the pointer over the blob? Approximate with its projected bounding circle.
    g.getWorldPosition(worldPos);
    const dist = camera.position.distanceTo(worldPos);
    const fov = (camera as THREE.PerspectiveCamera).fov;
    const pxRadius =
      ((L.scale * L.intro * (1 + u.uDistort.value * 0.5)) / (dist * Math.tan((fov * Math.PI) / 360))) *
      (size.height / 2);
    worldPos.project(camera);
    const sx = (worldPos.x * 0.5 + 0.5) * size.width;
    const sy = (-worldPos.y * 0.5 + 0.5) * size.height;
    lens.overBlob = L.intro > 0.6 && Math.hypot(pointer.x - sx, pointer.y - sy) < pxRadius * 0.92;
  });

  return (
    <group ref={group}>
      <mesh frustumCulled={false}>
        <icosahedronGeometry args={[1, detail]} />
        <shaderMaterial vertexShader={blobVertex} fragmentShader={blobFragment} uniforms={uniforms} />
      </mesh>
      {/* the x-ray layer */}
      <mesh frustumCulled={false} scale={1.003}>
        <icosahedronGeometry args={[1, Math.max(6, Math.round(detail / 5))]} />
        <shaderMaterial
          vertexShader={blobVertex}
          fragmentShader={xrayFragment}
          uniforms={xrayUniforms}
          wireframe
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <group ref={core}>
        <mesh frustumCulled={false} scale={0.36}>
          <icosahedronGeometry args={[1, 1]} />
          <shaderMaterial vertexShader={plainVertex} fragmentShader={xrayFragment} uniforms={xrayUniforms} wireframe transparent depthWrite={false} />
        </mesh>
        <mesh frustumCulled={false} scale={0.12}>
          <sphereGeometry args={[1, 24, 24]} />
          <shaderMaterial vertexShader={plainVertex} fragmentShader={xrayFragment} uniforms={xrayUniforms} transparent />
        </mesh>
      </group>
    </group>
  );
}
