'use client';
import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    setIsMobile(!mq.matches);
    const checkMq = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', checkMq);
    return () => mq.removeEventListener('change', checkMq);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let lastMoveTime = Date.now();
    
    // Interaction visual targets
    let targetGlowOpacity = 0.4;
    let currentGlowOpacity = 0.4;
    let targetRingScale = 1;
    let currentRingScale = 1;
    
    // Ambient persistence
    let currentAmbient = 0.2; 
    let isTracking = false;

    let frame: number;

    const update = () => {
      // 1. Position Inertia (Smooth Lerp)
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // 2. Global Ambient Persistence
      const timeSinceMove = Date.now() - lastMoveTime;
      let ambientTarget = 0; // Default off when resting a long time
      if (isTracking) {
        if (timeSinceMove < 1000) {
          ambientTarget = 1.0; // Glow stays up 1000ms after move
        } else if (timeSinceMove < 2500) {
          ambientTarget = 0.3; // Very slow decay
        }
      }
      
      // Lerp intensity slowly for the soft fade effect
      currentAmbient += (ambientTarget - currentAmbient) * 0.015;

      // 3. Update CSS Vars globally for panels/borders
      document.documentElement.style.setProperty('--pointer-x', `${currentX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${currentY}px`);
      document.documentElement.style.setProperty('--ambient-intensity', currentAmbient.toString());

      // 4. Cursor element visual states
      currentGlowOpacity += (targetGlowOpacity - currentGlowOpacity) * 0.1;
      currentRingScale += (targetRingScale - currentRingScale) * 0.15;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX - 64}px, ${currentY - 64}px, 0)`;
        glowRef.current.style.opacity = currentGlowOpacity.toString();
      }
      if (ringRef.current) {
        const ringSize = 16 * currentRingScale;
        ringRef.current.style.transform = `translate3d(${currentX - ringSize/2}px, ${currentY - ringSize/2}px, 0)`;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        ringRef.current.style.borderColor = targetRingScale > 1 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)';
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${currentX - 3}px, ${currentY - 3}px, 0)`;
      }

      frame = requestAnimationFrame(update);
    };

    const onMouseMove = (e: MouseEvent) => {
      // First move jumps immediately to avoid flying in from corner
      if (!isTracking) {
        currentX = e.clientX;
        currentY = e.clientY;
        isTracking = true;
      }
      
      targetX = e.clientX;
      targetY = e.clientY;
      lastMoveTime = Date.now();

      const target = e.target as HTMLElement;
      if (target) {
        const isInteractive = window.getComputedStyle(target).cursor === 'pointer' || target.closest('button') !== null || target.closest('a') !== null;
        const isTextNode = window.getComputedStyle(target).cursor === 'text' || ['p','h1','h2','h3','span'].includes(target.tagName.toLowerCase());
        
        targetRingScale = isInteractive ? 1.5 : 1;
        
        if (isTextNode && !isInteractive) {
          targetGlowOpacity = 0.2;
          if (ringRef.current) ringRef.current.style.opacity = '0';
          if (dotRef.current) dotRef.current.style.opacity = '0';
        } else {
          targetGlowOpacity = isInteractive ? 0.6 : 0.4;
          if (ringRef.current) ringRef.current.style.opacity = '1';
          if (dotRef.current) dotRef.current.style.opacity = '1';
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    frame = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Soft Cursor Glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[100] mix-blend-screen will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)', opacity: 0 }}
      />
      
      {/* Translucent Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] border border-white/20 will-change-transform transition-colors duration-200"
        style={{ opacity: 0 }}
      />

      {/* Tiny Center Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[100] will-change-transform transition-opacity duration-200"
        style={{ opacity: 0 }}
      />
    </>
  );
}
