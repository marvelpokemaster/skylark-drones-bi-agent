'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const phases = [
  "CONNECTING TO LIVE DATA...",
  "LOADING BUSINESS SIGNALS...",
  "PREPARING EXECUTIVE VIEW..."
];

export default function Loading() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex(prev => (prev < phases.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-obsidian-900 flex flex-col items-center justify-center p-6">
      
      {/* Background glow for splash */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="font-space font-bold tracking-tight text-3xl md:text-4xl text-gradient-primary">
            Skylark Intelligence
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest text-center">
            Initializing executive intelligence...
          </div>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary"
              initial={{ width: "10%", left: "0%" }}
              animate={{ width: ["10%", "30%", "10%"], left: ["0%", "70%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          </div>

          <div className="h-4 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="absolute text-[10px] font-mono text-zinc-400 tracking-wider"
              >
                {phases[phaseIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
