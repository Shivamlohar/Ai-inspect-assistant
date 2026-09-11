import { useEffect, useRef, memo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  color: string;
}

export const AnimatedBackground = memo(function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const coreGlowRef = useRef<HTMLDivElement | null>(null);
  const auroraContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Target coordinates from mouse
    let targetX = width / 2;
    let targetY = height / 2;
    // Current interpolated coordinates for fluid inertia
    let currentX = width / 2;
    let currentY = height / 2;
    let isMouseActive = false;

    // Handle high DPI displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Track cursor movement
    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      isMouseActive = true;
    };

    const onMouseLeave = () => {
      isMouseActive = false;
      targetX = width / 2;
      targetY = height / 2;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // Initialize 45 liquid telemetry nodes
    const particleCount = Math.min(36, Math.floor((width * height) / 28000));
    const colors = [
      '#06b6d4', // electric cyan
      '#0ea5e9', // sky blue
      '#10b981', // emerald
      '#8b5cf6', // violet
      '#38bdf8'  // light cyan
    ];

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      radius: Math.random() * 1.8 + 1.2,
      baseAlpha: Math.random() * 0.35 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    let isVisible = true;
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Main 60fps render loop
    const render = () => {
      if (!isVisible) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      // Smooth lerp for liquid inertia (0.075 = buttery viscous fluid follow)
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;

      // Update liquid caustic spotlight DOM elements
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      if (coreGlowRef.current) {
        coreGlowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      // Parallax fluid shift on background aurora orbs
      if (auroraContainerRef.current) {
        const deltaX = (currentX - width / 2) * -0.04;
        const deltaY = (currentY - height / 2) * -0.04;
        auroraContainerRef.current.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Render & update interactive particles
      const connectionDist = 130;
      const mouseInfluenceRadius = 180;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on borders with soft wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Calculate cursor distance
        const dx = currentX - p.x;
        const dy = currentY - p.y;
        const distToMouse = Math.hypot(dx, dy);

        // Fluid magnetic deflection when near cursor
        if (distToMouse < mouseInfluenceRadius && isMouseActive) {
          const force = (1 - distToMouse / mouseInfluenceRadius) * 0.04;
          p.x -= (dx / distToMouse) * force * 15;
          p.y -= (dy / distToMouse) * force * 15;

          // Draw radiant beam to cursor
          const laserAlpha = (1 - distToMouse / mouseInfluenceRadius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(currentX, currentY);
          ctx.strokeStyle = `rgba(6, 182, 212, ${laserAlpha})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Sparkle halo around particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${laserAlpha * 0.5})`;
          ctx.fill();
        }

        // Draw node-to-node filaments
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (distNodes < connectionDist) {
            const filamentAlpha = (1 - distNodes / connectionDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${filamentAlpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animFrameId = requestAnimationFrame(render);
    };

        let isMounted = true;
    const scheduleStart = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 80);

    const idleToken = scheduleStart(() => {
      if (isMounted) {
        render();
      }
    });

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameId);
      if (typeof window.cancelIdleCallback === 'function' && typeof idleToken === 'number') {
        window.cancelIdleCallback(idleToken);
      }
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-opacity duration-700"
    >
      {/* 1. CONTINUOUS DRIFTING AURORA GRADIENT ORBS (WITH LIQUID PARALLAX) */}
      <div ref={auroraContainerRef} className="absolute inset-0 overflow-hidden transition-transform duration-300 ease-out">
        {/* Orb 1: Electric Cyan (Top Left / Center) */}
        <div 
          className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-cyan-500/15 dark:bg-cyan-500/22 blur-[95px] animate-aurora-1"
          style={{ willChange: 'transform' }}
        />

        {/* Orb 2: Royal Indigo / Purple (Top Right) */}
        <div 
          className="absolute -top-20 -right-24 w-[38rem] h-[38rem] rounded-full bg-indigo-500/14 dark:bg-purple-600/22 blur-[105px] animate-aurora-2"
          style={{ willChange: 'transform' }}
        />

        {/* Orb 3: Radiant Emerald (Bottom Right) */}
        <div 
          className="absolute -bottom-36 -right-28 w-[36rem] h-[36rem] rounded-full bg-emerald-500/12 dark:bg-emerald-500/18 blur-[100px] animate-aurora-3"
          style={{ willChange: 'transform' }}
        />

        {/* Orb 4: Deep Sky Blue (Bottom Left) */}
        <div 
          className="absolute -bottom-24 -left-20 w-[32rem] h-[32rem] rounded-full bg-sky-500/14 dark:bg-blue-600/18 blur-[95px] animate-aurora-4"
          style={{ willChange: 'transform' }}
        />
      </div>

      {/* 2. DYNAMIC CURSOR-FOLLOWING LIQUID CAUSTIC SPOTLIGHT (60FPS FLUID LENS) */}
      <div 
        ref={spotlightRef}
        className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full pointer-events-none blur-[60px] opacity-70 dark:opacity-85 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(99, 102, 241, 0.10) 40%, rgba(16, 185, 129, 0.04) 65%, transparent 80%)',
          willChange: 'transform'
        }}
      />

      {/* 3. DYNAMIC INTENSE INNER CURSOR LIQUID SPECULAR CORE */}
      <div 
        ref={coreGlowRef}
        className="absolute -top-[100px] -left-[100px] w-[200px] h-[200px] rounded-full pointer-events-none blur-[28px] opacity-60 dark:opacity-80"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 75%)',
          willChange: 'transform'
        }}
      />

      {/* 4. INDUSTRIAL CYBERNETIC METROLOGY GRID (Illuminated dynamically by cursor spotlight) */}
      <div className="absolute inset-0 bg-cyber-grid opacity-35 dark:opacity-30" />

      {/* 5. INTERACTIVE 60FPS CANVAS (Quantum Telemetry Particles & Magnetic Lasers) */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 6. CONTINUOUS LiDAR SCANNING LASER BEAM SWEEP */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-65 dark:opacity-85 shadow-[0_0_14px_2.5px_rgba(6,182,212,0.65)] animate-lidar-sweep pointer-events-none" />

      {/* 7. SUBTLE RADIAL VIGNETTE (Preserves maximum contrast & readability) */}
      <div className="absolute inset-0 bg-radial-vignette opacity-70 dark:opacity-85 pointer-events-none" />
    </div>
  );
});

export default AnimatedBackground;
