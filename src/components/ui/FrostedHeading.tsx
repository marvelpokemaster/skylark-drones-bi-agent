'use client';
import { useRef, useState, ElementType } from 'react';
import clsx from 'clsx';

export default function FrostedHeading({ children, className, as: Component = 'h2' }: { children: React.ReactNode, className?: string, as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Component 
      className={clsx("relative inline-block overflow-visible", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Level 1: Base text */}
      <span ref={ref} className="relative z-10 transition-colors duration-300">
        {children}
      </span>
      
      {/* Level 2 & 3 & 4: Frost, Specular, and Edge layers */}
      <span 
        className="absolute inset-0 z-20 text-transparent pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `
            radial-gradient(40px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.9) 0%, transparent 100%),
            radial-gradient(120px circle at ${pos.x}px ${pos.y}px, rgba(139, 92, 246, 0.5) 0%, rgba(34, 211, 238, 0.2) 50%, transparent 100%),
            radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(255, 255, 255, 0.05) 0%, transparent 100%)
          `,
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
