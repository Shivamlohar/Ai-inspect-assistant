import { memo } from 'react';

export const AnimatedBackground = memo(function AnimatedBackground() {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-opacity duration-700"
    >
      {/* 1. CONTINUOUS DRIFTING AURORA GRADIENT ORBS (GPU-ACCELERATED) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Orb 1: Electric Cyan (Top Left / Center) */}
        <div 
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-cyan-500/15 dark:bg-cyan-500/20 blur-[90px] animate-aurora-1"
          style={{ willChange: 'transform' }}
        />

        {/* Orb 2: Royal Indigo / Purple (Top Right) */}
        <div 
          className="absolute -top-20 -right-24 w-[38rem] h-[38rem] rounded-full bg-indigo-500/12 dark:bg-purple-600/20 blur-[105px] animate-aurora-2"
          style={{ willChange: 'transform' }}
        />

        {/* Orb 3: Radiant Emerald (Bottom Right) */}
        <div 
          className="absolute -bottom-36 -right-28 w-[36rem] h-[36rem] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[100px] animate-aurora-3"
          style={{ willChange: 'transform' }}
        />

        {/* Orb 4: Deep Sky Blue (Bottom Left) */}
        <div 
          className="absolute -bottom-24 -left-20 w-[32rem] h-[32rem] rounded-full bg-sky-500/12 dark:bg-blue-600/15 blur-[95px] animate-aurora-4"
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* 2. INDUSTRIAL CYBERNETIC METROLOGY GRID */}
      <div className="absolute inset-0 bg-cyber-grid opacity-35 dark:opacity-25" />

      {/* 3. CONTINUOUS LiDAR SCANNING LASER BEAM SWEEP */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 dark:opacity-80 shadow-[0_0_12px_2px_rgba(6,182,212,0.6)] animate-lidar-sweep pointer-events-none" />

      {/* 4. SUBTLE RADIAL VIGNETTE (Keeps UI contents ultra-sharp & readable) */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70 dark:opacity-85 pointer-events-none" />

      {/* 5. FLOATING MICRO-TELEMETRY PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-60">
        <span className="particle p1" />
        <span className="particle p2" />
        <span className="particle p3" />
        <span className="particle p4" />
        <span className="particle p5" />
        <span className="particle p6" />
      </div>
    </div>
  );
});

export default AnimatedBackground;
