'use client';

import {cn} from '@/lib/utils';
import type React from 'react';
import {useEffect, useRef} from 'react';

interface InteractiveBackgroundProps {
  className?: string;
}

const InteractiveBackground: React.FC<InteractiveBackgroundProps> = ({className}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({x: -1000, y: -1000});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouse.current.x = event.clientX - rect.left;
        mouse.current.y = event.clientY - rect.top;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (canvasRef.current && event.touches.length > 0) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouse.current.x = event.touches[0].clientX - rect.left;
        mouse.current.y = event.touches[0].clientY - rect.top;
      }
    };

    const handleMouseOut = () => {
      mouse.current = {x: -1000, y: -1000};
    };

    const handleTouchEnd = () => {
      mouse.current = {x: -1000, y: -1000};
    };

    let animationFrameId: number;
    let particles: Particle[] = [];

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      baseX: number;
      baseY: number;
      density: number;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = color;
        this.density = Math.random() * 30 + 1;
      }

      update() {
        if (!canvas) return;
        // Mouse interaction
        const dxMouse = mouse.current.x - this.x;
        const dyMouse = mouse.current.y - this.y;
        const distance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        const forceDirectionX = dxMouse / distance;
        const forceDirectionY = dyMouse / distance;
        const maxDistance = 100;
        const force = (maxDistance - distance) / maxDistance;

        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          // Default movement
          if (this.x > canvas.width || this.x < 0) {
            this.speedX = -this.speedX;
          }
          if (this.y > canvas.height || this.y < 0) {
            this.speedY = -this.speedY;
          }
          this.x += this.speedX;
          this.y += this.speedY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      if (!canvas) return;
      const numberOfParticles = (canvas.width * canvas.height) / 10000;
      for (let i = 0; i < numberOfParticles; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y, `hsl(125, 100%, ${50 + Math.random() * 30}%)`)); // Neon Green with varying lightness
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const particle of particles) {
        particle.update();
        particle.draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    const connect = () => {
      if (!ctx) return;
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            opacityValue = 1 - distance / 120;
            ctx.strokeStyle = `hsla(125, 100%, 51%, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setCanvasSize();
        init();
      }, 100);
    };

    init();
    animate();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn('fixed top-0 left-0 -z-10', className)} />;
};

export default InteractiveBackground;
