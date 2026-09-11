import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Radio, Flame, Sparkles, Crown, Gift } from 'lucide-react';

export const InteractiveCompanyGraphic: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [cheers, setCheers] = useState<Array<{ id: number; text: string }>>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setActiveBadge(null);
  };

  const handleCheer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = Date.now();
    setCheers((prev) => [...prev.slice(-3), { id, text: '🏆 +50 XP Ticket Claimed!' }]);
    setTimeout(() => {
      setCheers((prev) => prev.filter((c) => c.id !== id));
    }, 1500);
  };

  return (
    <div
      className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center select-none cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
    >
      {/* 3D Tilting Sphere Container */}
      <motion.div
        className="relative w-40 h-40 flex items-center justify-center"
        animate={{
          rotateX: tilt.y,
          rotateY: tilt.x,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <svg viewBox="0 0 160 160" className="w-40 h-40 overflow-visible">
          <defs>
            <clipPath id="sphere-clip-interactive-company">
              <circle cx="80" cy="80" r="66" />
            </clipPath>
            <radialGradient id="sphere-grad-interactive-company" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id="gold-orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#5945F1" />
              <stop offset="100%" stopColor="#c6f831" />
            </linearGradient>
          </defs>

          {/* Sphere Base */}
          <circle cx="80" cy="80" r="66" fill="url(#sphere-grad-interactive-company)" />

          {/* Internal Grid */}
          <g clipPath="url(#sphere-clip-interactive-company)">
            {[-52, -42, -32, -22, -12, -2, 8, 18, 28, 38, 48].map((yOffset, i) => (
              <line
                key={i}
                x1="0"
                y1={80 + yOffset}
                x2="160"
                y2={80 + yOffset}
                stroke="#94a3b8"
                strokeWidth="1.2"
                strokeDasharray="2.5 3.5"
                strokeOpacity="0.5"
              />
            ))}
          </g>

          {/* Outer Rim */}
          <circle
            cx="80"
            cy="80"
            r="66"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Golden Orbit Ring */}
          <ellipse
            cx="80"
            cy="80"
            rx="75"
            ry="24"
            fill="none"
            stroke="url(#gold-orbit-grad)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            transform="rotate(-20 80 80)"
            opacity="0.85"
          />
        </svg>

        {/* Orbiting Sparkle Star */}
        <motion.div
          className="absolute w-3.5 h-3.5 text-amber-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '80px 80px', top: 6, left: 6 }}
        >
          <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
        </motion.div>

        {/* Big Bouncing Trophy at Center */}
        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          onClick={handleCheer}
          className="absolute z-20 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl border border-amber-300 flex items-center justify-center text-white cursor-pointer hover:scale-115 transition-transform group"
          title="Click to claim weekly competition boost!"
        >
          <Trophy className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        </motion.div>
      </motion.div>

      {/* Floating Interactive Badges */}
      {/* 1. Live Floor Badge */}
      <motion.div
        className="absolute top-2 right-1 z-30"
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => setActiveBadge('live')}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#0c0d12] text-white px-2.5 py-1 rounded-xl shadow-lg border border-slate-700/80 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Radio className="w-3 h-3 text-[#c6f831] animate-pulse" />
          <span>Live Floor</span>
          <span className="text-[8px] px-1 py-0.2 rounded-xs bg-[#c6f831]/20 text-[#c6f831] font-mono">
            348 active
          </span>
        </motion.div>
      </motion.div>

      {/* 2. $1,750 Pool Badge */}
      <motion.div
        className="absolute bottom-5 left-1 z-30"
        animate={{ y: [3, -3, 3] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        onClick={handleCheer}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#5945F1] to-[#FE01B1] text-white px-2.5 py-1 rounded-xl shadow-lg border border-purple-300/40 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Crown className="w-3 h-3 text-[#c6f831]" />
          <span>$1,750 Prize Pool</span>
        </motion.div>
      </motion.div>

      {/* 3. Weekly Rank #1 Badge */}
      <motion.div
        className="absolute bottom-2 right-2 z-30"
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded-lg shadow-md border border-amber-300 text-[9.5px] font-black flex items-center gap-1 cursor-pointer"
        >
          <Flame className="w-3 h-3 text-red-600 fill-red-500" />
          <span>Leaderboard Race</span>
        </motion.div>
      </motion.div>

      {/* Floating Cheers on click */}
      <AnimatePresence>
        {cheers.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1.05 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 rounded-xl bg-[#0b1c30] text-[#c6f831] font-bold text-[10px] shadow-2xl border border-amber-400/40 whitespace-nowrap pointer-events-none"
          >
            {c.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
