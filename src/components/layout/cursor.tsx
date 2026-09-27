'use client';

import {useEffect, useRef} from 'react';
import {gsap} from '@/lib/gsap';
import {lens, LENS_R, pointer} from '@/lib/live';
import {useApp} from '@/lib/store';

type Mode = 'default' | 'hover' | 'label';

/**
 * Canvas cursor: a precise dot plus a damped ring that stretches with velocity,
 * grows over interactive elements, shows labels (data-cursor="View"), and turns
 * into a scope reticle when the x-ray lens is open.
 */
export default function Cursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isTouch = useApp(s => s.isTouch);
  const reducedMotion = useApp(s => s.reducedMotion);
  const tier = useApp(s => s.tier);
  const enabled = tier !== 'pending' && !isTouch && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    let mode: Mode = 'default';
    let label = '';
    const onOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      const labelled = el.closest<HTMLElement>('[data-cursor]');
      const interactive = el.closest('a, button, [role="button"], input, textarea, label, summary');
      lens.overXray = !!el.closest('[data-xray]');
      if (labelled) {
        mode = 'label';
        label = labelled.dataset.cursor ?? '';
      } else if (interactive) {
        mode = 'hover';
      } else {
        mode = 'default';
      }
      lens.overInteractive = mode !== 'default';
    };
    document.addEventListener('pointerover', onOver);

    const s = {ring: 16, fill: 0, labelAlpha: 0, dotX: -99, dotY: -99, angle: 0, stretch: 0, visible: 0};

    const draw = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 64) / 1000;
      const k = (f: number) => 1 - Math.pow(1 - f, dt * 60);
      const lensOpen = lens.r > 1;
      const targetRing = mode === 'label' ? 46 : mode === 'hover' ? 30 : lensOpen ? Math.max(16, lens.r) : 16;

      s.ring += (targetRing - s.ring) * k(0.18);
      s.fill += ((mode === 'label' ? 1 : mode === 'hover' ? 0.14 : 0) - s.fill) * k(0.2);
      s.labelAlpha += ((mode === 'label' ? 1 : 0) - s.labelAlpha) * k(0.2);
      s.visible += ((pointer.active ? 1 : 0) - s.visible) * k(0.2);
      s.dotX += (pointer.x - s.dotX) * k(0.55);
      s.dotY += (pointer.y - s.dotY) * k(0.55);

      const vx = pointer.x - pointer.lx;
      const vy = pointer.y - pointer.ly;
      const speed = Math.hypot(vx, vy);
      if (speed > 0.5) s.angle = Math.atan2(vy, vx);
      s.stretch += (Math.min(speed / 140, 0.45) * (lensOpen ? 0.2 : 1) - s.stretch) * k(0.2);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (s.visible < 0.01) return;
      ctx.globalAlpha = s.visible;

      // ring
      ctx.save();
      ctx.translate(pointer.lx, pointer.ly);
      ctx.rotate(s.angle);
      ctx.scale(1 + s.stretch, 1 - s.stretch * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, s.ring, 0, Math.PI * 2);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.stroke();
      if (s.fill > 0.01) {
        ctx.fillStyle = `rgba(255,255,255,${s.fill})`;
        ctx.fill();
      }
      ctx.restore();

      // scope reticle when the lens is open
      const lensAmt = Math.min(1, lens.r / LENS_R);
      if (lensAmt > 0.02) {
        ctx.save();
        ctx.translate(pointer.lx, pointer.ly);
        ctx.strokeStyle = `rgba(255,255,255,${0.85 * lensAmt})`;
        ctx.lineWidth = 1;
        const r = s.ring;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(r + 4, 0);
          ctx.lineTo(r + 14, 0);
          ctx.stroke();
        }
        ctx.font = '500 9px ui-monospace, monospace';
        ctx.fillStyle = `rgba(255,255,255,${0.8 * lensAmt})`;
        ctx.textAlign = 'center';
        ctx.fillText('X-RAY', 0, -r - 20);
        ctx.restore();
      }

      // label
      if (s.labelAlpha > 0.02 && label) {
        ctx.save();
        ctx.globalAlpha = s.labelAlpha * s.visible;
        ctx.font = '600 11px ui-monospace, monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.toUpperCase(), pointer.lx, pointer.ly + 1);
        ctx.restore();
      }

      // dot
      if (mode !== 'label') {
        ctx.beginPath();
        ctx.arc(s.dotX, s.dotY, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
    };
    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('resize', resize);
      document.removeEventListener('pointerover', onOver);
      lens.overXray = false;
      lens.overInteractive = false;
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] h-screen w-screen mix-blend-difference"
    />
  );
}
