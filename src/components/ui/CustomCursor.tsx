'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isText, setIsText] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Disable on mobile/touch devices or reduced motion
    const mq = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    setIsMobile(!mq.matches);

    const checkMq = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', checkMq);

    return () => mq.removeEventListener('change', checkMq);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let frame: number;
    const updateMousePosition = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        // Site-wide Light Field tracker
        document.documentElement.style.setProperty('--pointer-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--pointer-y', `${e.clientY}px`);
      });

      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isInteractive = window.getComputedStyle(target).cursor === 'pointer' || target.tagName.toLowerCase() === 'button' || target.closest('button') !== null || target.closest('a') !== null;
      const isTextNode = window.getComputedStyle(target).cursor === 'text' || target.tagName.toLowerCase() === 'p' || target.tagName.toLowerCase() === 'h1' || target.tagName.toLowerCase() === 'h2' || target.tagName.toLowerCase() === 'h3' || target.tagName.toLowerCase() === 'span';
      
      setIsHovering(isInteractive);
      setIsText(isTextNode && !isInteractive);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Soft Glow */}
      <motion.div
        className="fixed top-0 left-0 w-32 h-32 rounded-full pointer-events-none z-[100] mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)' }}
        animate={{
          x: mousePosition.x - 64,
          y: mousePosition.y - 64,
          opacity: isText ? 0.5 : (isHovering ? 0.8 : 0.6)
        }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />
      
      {/* Translucent Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] border border-white/20"
        animate={{
          x: mousePosition.x - (isHovering ? 16 : 8),
          y: mousePosition.y - (isHovering ? 16 : 8),
          width: isHovering ? 32 : 16,
          height: isHovering ? 32 : 16,
          opacity: isText ? 0 : 1,
          borderColor: isHovering ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      {/* Tiny Center Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[100]"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          opacity: isText ? 0 : 1
        }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />
    </>
  );
}
