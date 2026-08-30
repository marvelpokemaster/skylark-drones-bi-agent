'use client';
import { useRef, useEffect, ElementType } from 'react';
import clsx from 'clsx';

export default function FrostedHeading({ children, className, as: Component = 'h2' }: { children: React.ReactNode, className?: string, as?: ElementType }) {
  const containerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const highlight = highlightRef.current;
    
    // Disable on mobile/reduced-motion
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!container || !highlight || !mq.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetOpacity = 0;
    let currentOpacity = 0;
    let lastMoveTime = 0;
    let frame: number;
    let isHovering = false;

    const update = () => {
      // Lerp position for silky inertia
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      
      // Persistence logic
      const timeSinceMove = Date.now() - lastMoveTime;
      if (!isHovering && timeSinceMove > 500) {
         targetOpacity = 0;
      }
      
      // Smooth fade out
      currentOpacity += (targetOpacity - currentOpacity) * 0.05;

      // Apply directly to DOM without React state
      if (currentOpacity > 0.005 || targetOpacity > 0) {
        highlight.style.opacity = currentOpacity.toString();
        highlight.style.backgroundImage = `
          radial-gradient(50px circle at ${currentX}px ${currentY}px, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(150px circle at ${currentX}px ${currentY}px, rgba(139, 92, 246, 0.4) 0%, rgba(34, 211, 238, 0.15) 50%, transparent 100%),
          radial-gradient(350px circle at ${currentX}px ${currentY}px, rgba(255, 255, 255, 0.03) 0%, transparent 100%)
        `;
      } else {
        highlight.style.opacity = '0';
      }

      frame = requestAnimationFrame(update);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      
      // Initialize position instantly on enter if it was 0
      if (targetOpacity === 0 && currentOpacity < 0.1) {
        currentX = targetX;
        currentY = targetY;
      }

      targetOpacity = 1;
      lastMoveTime = Date.now();
      isHovering = true;
    };

    const onMouseLeave = () => {
      isHovering = false;
      lastMoveTime = Date.now();
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    frame = requestAnimationFrame(update);

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Component 
      ref={containerRef}
      className={clsx("relative inline-block overflow-visible", className)}
    >
      <span className="relative z-10 transition-colors duration-300">
        {children}
      </span>
      
      <span 
        ref={highlightRef}
        className="absolute inset-0 z-20 text-transparent pointer-events-none"
        style={{
          opacity: 0,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </Component>
  );
}
