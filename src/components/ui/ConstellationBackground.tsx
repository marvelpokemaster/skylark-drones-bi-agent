'use client';
import { useEffect, useRef } from 'react';

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();

    let mouseX = -1000;
    let mouseY = -1000;
    let isVisible = true;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle Configuration
    const getParticleCount = () => {
      if (width < 768) return 16;
      if (width < 1024) return 32;
      return 50; // Desktop
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseOpacity: number;
      twinklePhase: number;
      twinkleSpeed: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Extremely slow drift
        const angle = Math.random() * Math.PI * 2;
        const speed = prefersReducedMotion ? 0 : (0.02 + Math.random() * 0.05);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.radius = 0.5 + Math.random();
        this.baseOpacity = 0.1 + Math.random() * 0.3;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = prefersReducedMotion ? 0 : (0.002 + Math.random() * 0.008);
        
        // Color mapping
        const rand = Math.random();
        if (rand < 0.08) {
          this.color = '139, 92, 246'; // violet
        } else if (rand < 0.16) {
          this.color = '34, 211, 238'; // cyan
        } else {
          this.color = '200, 205, 215'; // cool gray/white
        }
      }

      update() {
        if (!prefersReducedMotion) {
          this.x += this.vx;
          this.y += this.vy;
          
          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
          if (this.y < 0) this.y = height;
          if (this.y > height) this.y = 0;
          
          this.twinklePhase += this.twinkleSpeed;
        }
      }
      
      draw() {
        let opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.15;
        
        // Cursor influence (opacity increase within 120px)
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 140) {
          const boost = (140 - dist) / 140;
          opacity += boost * 0.3; // subtle boost
        }
        
        opacity = Math.max(0.02, Math.min(1, opacity));

        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${this.color}, ${opacity})`;
        ctx!.fill();
      }
    }

    let particles: Particle[] = [];
    for (let i = 0; i < getParticleCount(); i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      resize();
      const newCount = getParticleCount();
      if (newCount > particles.length) {
        for (let i = particles.length; i < newCount; i++) {
          particles.push(new Particle());
        }
      } else if (newCount < particles.length) {
        particles = particles.slice(0, newCount);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let animationFrameId: number;

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
          
          // Draw subtle constellation lines
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < 14400) { // 120px max distance
              const dist = Math.sqrt(distSq);
              let lineOpacity = ((120 - dist) / 120) * 0.08; // extremely low base opacity
              
              const cursorDistI = Math.sqrt(Math.pow(mouseX - particles[i].x, 2) + Math.pow(mouseY - particles[i].y, 2));
              const cursorDistJ = Math.sqrt(Math.pow(mouseX - particles[j].x, 2) + Math.pow(mouseY - particles[j].y, 2));
              
              if (cursorDistI < 140 || cursorDistJ < 140) {
                lineOpacity += 0.04; // tiny boost near cursor
              }
              
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(139, 150, 180, ${Math.min(lineOpacity, 0.15)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[-3]" />;
}
