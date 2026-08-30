'use client';

import React, { useRef, MouseEvent, useState, useEffect } from 'react';

export default function FrostedHeading({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || isMobile || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--mouse-x', `${x}px`);
    ref.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const shouldDisable = reducedMotion || isMobile;

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !shouldDisable && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block ${className}`}
    >
      <span className="relative z-10">{children}</span>
      
      {!shouldDisable && (
        <span 
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            color: 'transparent',
            backgroundImage: 'radial-gradient(circle 100px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.9) 0%, rgba(34,211,238,0.6) 20%, rgba(139,92,246,0.3) 50%, transparent 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {children}
        </span>
      )}
    </div>
  );
}
