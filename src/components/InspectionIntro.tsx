import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';

interface InspectionIntroProps {
  onComplete: () => void;
}

/**
 * Check if the intro should be displayed for the current session
 */
export const shouldShowIntro = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Development or explicit query override: VITE_FORCE_INTRO=true or ?intro=force / ?forceIntro=true
  const forceEnv = import.meta.env.VITE_FORCE_INTRO === 'true';
  const urlParams = new URLSearchParams(window.location.search);
  const forceQuery = urlParams.get('intro') === 'force' || urlParams.get('forceIntro') === 'true';

  if (forceEnv || forceQuery) {
    return true;
  }

  // SessionStorage check
  const alreadyShown = sessionStorage.getItem('teamInspectraIntroShown');
  return !alreadyShown;
};

const STATUS_ITEMS = [
  { id: 'vision', label: 'AI VISION', status: 'READY' },
  { id: 'classification', label: 'ASSET CLASSIFICATION', status: 'READY' },
  { id: 'defect', label: 'DEFECT DETECTION', status: 'READY' },
  { id: 'knowledge', label: 'KNOWLEDGE BASE', status: 'READY' },
  { id: 'engine', label: 'INSPECTION ENGINE', status: 'READY' },
];

export const InspectionIntro: React.FC<InspectionIntroProps> = ({ onComplete }) => {
  // Stage 1: Dark opening (0 - 500ms)
  // Stage 2: Engineering grid & wireframes (500 - 1000ms)
  // Stage 3: AI scanning beam & HUD labels (1000 - 1800ms)
  // Stage 4: Logo reveal (1800 - 2300ms)
  // Stage 5: Product reveal (2300 - 2700ms)
  // Stage 6: System initialization telemetry (2700 - 3200ms)
  // Stage 7: Final brand frame (3200 - 3600ms)
  // Stage 8: Light sweep transition (3600 - 3900ms)
  const [stage, setStage] = useState<number>(1);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [statusProgressIndex, setStatusProgressIndex] = useState<number>(0);

  // Check prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Safe dismiss and cleanup
  const handleDismiss = useCallback(() => {
    try {
      sessionStorage.setItem('teamInspectraIntroShown', 'true');
    } catch {
      // Ignore sessionStorage exceptions (e.g. private mode)
    }
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 320);
  }, [onComplete]);

  // Reduced motion: fast fade and immediate dismiss
  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion, handleDismiss]);

  // Main timeline sequencer (0.0s to 3.9s)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const t2 = setTimeout(() => setStage(2), 500);
    const t3 = setTimeout(() => setStage(3), 1000);
    const t4 = setTimeout(() => setStage(4), 1800);
    const t5 = setTimeout(() => setStage(5), 2300);
    const t6 = setTimeout(() => setStage(6), 2700);

    // Sequential status rows reveal during Stage 6
    const s1 = setTimeout(() => setStatusProgressIndex(1), 2780);
    const s2 = setTimeout(() => setStatusProgressIndex(2), 2860);
    const s3 = setTimeout(() => setStatusProgressIndex(3), 2940);
    const s4 = setTimeout(() => setStatusProgressIndex(4), 3020);
    const s5 = setTimeout(() => setStatusProgressIndex(5), 3100);

    const t7 = setTimeout(() => setStage(7), 3200);
    const t8 = setTimeout(() => setStage(8), 3600);
    const tEnd = setTimeout(() => handleDismiss(), 3900);

    // Strict 4000ms failsafe
    const tFailsafe = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(s5);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(tEnd);
      clearTimeout(tFailsafe);
    };
  }, [prefersReducedMotion, handleDismiss]);

  // Keyboard shortcut (Escape to Skip)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDismiss]);

  if (isExiting) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] pointer-events-none bg-[#020617]"
      />
    );
  }

  return (
    <div
      role="region"
      aria-label="Team Inspectra Introduction Animation"
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#020617] text-white select-none cursor-default font-sans flex flex-col items-center justify-center"
    >
      {/* 1. CINEMATIC BACKGROUND WITH CONDITIONAL BRIDGE OVERLAY (STAGE 7) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle cyan central radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Ambient deep navy / slate grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Stage 7: Infrastructure Background Image Fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 7 ? 0.22 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-center bg-cover bg-no-repeat mix-blend-luminosity filter brightness-75 contrast-125"
          style={{ backgroundImage: `url('/images/assets/bridge_102.jpg')` }}
        />
      </div>

      {/* 2. PERSPECTIVE ENGINEERING GRID (STAGE 2+) */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-x-0 bottom-0 h-[45vh] pointer-events-none overflow-hidden [perspective:800px]"
          >
            <div 
              className="w-full h-full origin-bottom [transform:rotateX(68deg)]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(6, 182, 212, 0.45) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(6, 182, 212, 0.45) 1px, transparent 1px)
                `,
                backgroundSize: '64px 44px',
                maskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
                WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 95%)',
              }}
            />
            {/* Cyan horizon glow line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. SUBTLE INFRASTRUCTURE WIREFRAME OUTLINES (STAGE 2 - 6) */}
      <AnimatePresence>
        {stage >= 2 && stage < 7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.28 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center max-w-5xl mx-auto px-4"
          >
            <svg
              viewBox="0 0 1000 400"
              className="w-full h-auto text-cyan-400 stroke-current fill-none stroke-[1.2] opacity-80"
              style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.3))' }}
            >
              {/* Bridge Wireframe (Left/Center) */}
              <g opacity="0.85">
                <path d="M 50 280 L 450 280" strokeDasharray="4 4" />
                <path d="M 120 280 L 120 180 L 140 180 L 140 280" />
                <path d="M 360 280 L 360 180 L 380 180 L 380 280" />
                <path d="M 50 240 Q 250 310 450 240" strokeWidth="1.5" />
                <line x1="200" y1="280" x2="200" y2="255" />
                <line x1="250" y1="280" x2="250" y2="260" />
                <line x1="300" y1="280" x2="300" y2="255" />
                {/* Structural joint node ticks */}
                <circle cx="130" cy="180" r="3" fill="#06b6d4" />
                <circle cx="370" cy="180" r="3" fill="#06b6d4" />
              </g>

              {/* Building & Tower Wireframe (Center-Right) */}
              <g opacity="0.7">
                <rect x="520" y="140" width="90" height="140" strokeDasharray="2 3" />
                <line x1="520" y1="175" x2="610" y2="175" />
                <line x1="520" y1="210" x2="610" y2="210" />
                <line x1="520" y1="245" x2="610" y2="245" />
                <line x1="565" y1="140" x2="565" y2="280" />
              </g>

              {/* Pipeline Infrastructure Wireframe (Far Right) */}
              <g opacity="0.75">
                <path d="M 680 260 L 920 260" strokeWidth="2.5" />
                <path d="M 680 274 L 920 274" strokeWidth="2.5" />
                {/* Flanges */}
                <rect x="740" y="254" width="10" height="26" rx="2" />
                <rect x="850" y="254" width="10" height="26" rx="2" />
                <line x1="745" y1="248" x2="745" y2="254" />
                <line x1="855" y1="248" x2="855" y2="254" />
              </g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. AI SCANNING BEAM & HUD LABELS (STAGE 3) */}
      <AnimatePresence>
        {stage === 3 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Elegant Vertical Scanning Laser Sweep */}
            <motion.div
              initial={{ x: '-10vw' }}
              animate={{ x: '110vw' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute top-0 bottom-0 w-[4px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_6px_rgba(6,182,212,0.85)] z-20"
            >
              {/* Secondary trailing pulse */}
              <div className="absolute inset-y-0 -left-16 w-16 bg-gradient-to-r from-transparent to-cyan-400/20 pointer-events-none" />
            </motion.div>

            {/* Tactical AI HUD telemetry markers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col justify-between p-8 md:p-14 text-[10px] font-mono tracking-widest text-cyan-400/80"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    AI SCANNER ACQUIRING TARGETS
                  </span>
                  <p className="text-slate-400">FPS: 60.0 • LATENCY: 12ms</p>
                </div>
                <div className="text-right text-slate-400">
                  <p>SYS: OPTICAL PRECISION</p>
                  <p className="text-cyan-400">ENGINEERING SPEC: ISO-17020</p>
                </div>
              </div>

              {/* Central Floating Micro HUD Labels */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto w-full text-center">
                {['BRIDGE', 'ROAD', 'BUILDING', 'PIPELINE', 'INDUSTRIAL'].map((tag, idx) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.25 }}
                    className="p-1.5 rounded-md border border-cyan-500/30 bg-slate-900/60 backdrop-blur-xs text-[11px] font-mono text-cyan-300 tracking-wider shadow-xs shadow-cyan-500/20"
                  >
                    [{tag}]
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between items-end text-slate-500 text-[9px]">
                <p>LAT 37.7749° N, LONG 122.4194° W</p>
                <p>TELEMETRY BUFFER: 100%</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. STAGE 1: INITIAL DARK OPENING TAGLINE */}
      <AnimatePresence>
        {stage === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="text-center z-10 px-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono tracking-widest uppercase mb-4 shadow-sm shadow-cyan-500/20">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              AUTONOMOUS ASSET INTELLIGENCE
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-[0.25em] text-slate-200 uppercase drop-shadow-md">
              ANALYZE <span className="text-cyan-400">•</span> PREVENT <span className="text-cyan-400">•</span> BUILD SAFER
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. MAIN BRAND REVEAL CONTAINER (STAGES 4, 5, 6, 7) */}
      {stage >= 4 && (
        <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl w-full px-6 text-center space-y-5">
          {/* LOGO & ROTATING HUD RING (STAGE 4+) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Rotating Circular HUD Ring */}
            <div className="absolute -inset-4 sm:-inset-6 pointer-events-none">
              <svg className="w-full h-full animate-[spin_18s_linear_infinite]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(6, 182, 212, 0.45)"
                  strokeWidth="1.2"
                  strokeDasharray="6 8 18 8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="41"
                  fill="none"
                  stroke="rgba(56, 189, 248, 0.25)"
                  strokeWidth="0.8"
                  strokeDasharray="2 4"
                />
                {/* Precision alignment ticks */}
                <line x1="50" y1="2" x2="50" y2="7" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="50" y1="93" x2="50" y2="98" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="2" y1="50" x2="7" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="93" y1="50" x2="98" y2="50" stroke="#38bdf8" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Counter-rotating subtle outer ring */}
            <div className="absolute -inset-7 sm:-inset-9 pointer-events-none opacity-40">
              <svg className="w-full h-full animate-[spin_30s_linear_infinite_reverse]" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="rgba(6, 182, 212, 0.3)"
                  strokeWidth="0.75"
                  strokeDasharray="3 14 30 14"
                />
              </svg>
            </div>

            {/* EXISTING TEAM INSPECTRA LOGO ICON MARK (From App.tsx TopNav) */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#0284c7] to-[#22d3ee] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 border border-white/20">
              <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-md text-white" />
            </div>
          </motion.div>

          {/* BRAND NAME & TAGLINE (STAGE 4+) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="space-y-1"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight sm:tracking-normal text-white uppercase drop-shadow-lg">
              TEAM INSPECTRA
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-cyan-400 uppercase">
              INSPECT <span className="text-slate-500">•</span> ANALYZE <span className="text-slate-500">•</span> PREVENT
            </p>
          </motion.div>

          {/* 7. PRODUCT REVEAL (STAGE 5+) */}
          {stage >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="px-4 py-2 rounded-xl bg-slate-900/60 border border-cyan-500/25 backdrop-blur-md max-w-lg mx-auto"
            >
              <h2 className="text-sm sm:text-base md:text-lg font-extrabold tracking-wider bg-gradient-to-r from-slate-100 via-cyan-200 to-sky-300 bg-clip-text text-transparent uppercase">
                AI-POWERED REAL-TIME
                <br />
                ASSET INSPECTION ASSISTANT
              </h2>
            </motion.div>
          )}

          {/* 8. SYSTEM INITIALIZATION TELEMETRY PANEL (STAGE 6) */}
          {stage === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-slate-950/85 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/60 backdrop-blur-md space-y-3 font-mono text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  SYSTEM INITIALIZATION
                </span>
                <span className="text-slate-400">METRICS AUDIT</span>
              </div>

              {/* Status Rows */}
              <div className="space-y-1.5 text-xs">
                {STATUS_ITEMS.map((item, idx) => {
                  const isReady = statusProgressIndex > idx;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: isReady ? 1 : 0.4, x: 0 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80"
                    >
                      <span className="text-slate-300 tracking-wider font-semibold text-[11px]">
                        {item.label}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-bold text-[11px] transition-colors duration-200 ${
                          isReady ? 'text-emerald-400' : 'text-slate-600'
                        }`}
                      >
                        {isReady ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>READY</span>
                          </>
                        ) : (
                          <span className="text-slate-600">INITIALIZING...</span>
                        )}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Bar & Initialized 100% */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-cyan-300 tracking-wider">
                    {statusProgressIndex >= 5 ? 'SYSTEM INITIALIZED 100%' : 'CALIBRATING CORE MODULES...'}
                  </span>
                  <span className="text-cyan-400 font-mono">
                    {Math.min(100, statusProgressIndex * 20)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(100, statusProgressIndex * 20)}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* 9. STAGE 7: FINAL BRAND FRAME */}
          {stage >= 7 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-3 pt-2"
            >
              <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-400/40 bg-cyan-950/50 backdrop-blur-md shadow-lg shadow-cyan-500/20">
                <p className="text-xs sm:text-sm font-extrabold tracking-[0.2em] text-cyan-300 uppercase">
                  INSPECT TODAY <span className="text-slate-400">•</span> BUILD A SAFER TOMORROW
                </p>
              </div>

              {/* Subtle Corner HUD Marks */}
              <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-slate-400">
                <span>[GATE: ACTIVE]</span>
                <span>•</span>
                <span>[AI PIPELINE: 2.5 FLASH]</span>
                <span>•</span>
                <span>[ZERO FABRICATION: VERIFIED]</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 10. STAGE 8: CYAN LIGHT SWEEP / DIAGONAL TRANSITION WIPE */}
      <AnimatePresence>
        {stage >= 8 && (
          <motion.div
            initial={{ x: '-120%', opacity: 0.9 }}
            animate={{ x: '160%', opacity: 1 }}
            transition={{ duration: 0.42, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-y-0 w-[45vw] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent -skew-x-12 pointer-events-none z-50 shadow-[0_0_60px_rgba(6,182,212,0.8)]"
          />
        )}
      </AnimatePresence>

      {/* 11. SKIP CONTROL BUTTON (NON-BLOCKING) */}
      <button
        onClick={handleDismiss}
        aria-label="Skip introduction animation"
        className="absolute top-5 right-5 z-50 px-3.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-cyan-300 text-xs font-mono tracking-wider transition-all duration-150 backdrop-blur-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-cyan-500/50"
      >
        <span>SKIP</span>
        <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded border border-slate-700">ESC</kbd>
      </button>

      {/* 12. BOTTOM HUD TIMESTAMP & VERSION BADGE */}
      <div className="absolute bottom-4 inset-x-0 px-6 flex justify-between items-center text-[10px] font-mono text-slate-400 pointer-events-none">
        <span>TEAM INSPECTRA • OS-ENG v2.6</span>
        <span>INITIALIZING INTERFACE...</span>
      </div>
    </div>
  );
};
