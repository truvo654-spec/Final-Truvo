import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Radio, Star, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FloatingBadgeProps {
  name: string;
  sub: string;
  perk: string;
  rating: string;
  color: string;
  bg: string;
  border: string;
  positionClass: string;
  delay: number;
}

export const InteractiveBrokersGraphic: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [pings, setPings] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const badges: FloatingBadgeProps[] = [
    {
      name: 'exness',
      sub: 'Raw Spread',
      perk: '$8.50/lot instant cashback • 0.0 pip spread',
      rating: '4.9 ★',
      color: '#000000',
      bg: '#ffcc00',
      border: '#fde047',
      positionClass: 'bottom-4 left-0 sm:left-2',
      delay: 0,
    },
    {
      name: 'HFM',
      sub: 'HF MARKETS',
      perk: '$7.20/lot rebate • Tier-1 FSC & FCA regulated',
      rating: '4.8 ★',
      color: '#ffffff',
      bg: '#0c0d12',
      border: '#334155',
      positionClass: 'top-1 right-2',
      delay: 0.3,
    },
    {
      name: 'FxPro',
      sub: 'PRO TRADE',
      perk: '$6.00/lot rebate • No dealing desk NDD execution',
      rating: '4.7 ★',
      color: '#ffffff',
      bg: '#dc2626',
      border: '#f87171',
      positionClass: 'top-12 -right-2',
      delay: 0.6,
    },
    {
      name: 'XM',
      sub: 'Ultra-Low',
      perk: '$6.80/lot rebate • Zero deposit & withdrawal fees',
      rating: '4.8 ★',
      color: '#ffffff',
      bg: '#0c0d12',
      border: '#334155',
      positionClass: 'bottom-2 right-4',
      delay: 0.9,
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setActiveTooltip(null);
  };

  const handleTriggerRadar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScanning(true);
    const newPing = { id: Date.now(), x: 80, y: 80 };
    setPings((prev) => [...prev.slice(-3), newPing]);
    setTimeout(() => setIsScanning(false), 1400);
  };

  return (
    <div
      className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center select-none cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '800px',
      }}
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
        {/* SVG Base Sphere with Dynamic Shading */}
        <svg viewBox="0 0 160 160" className="w-40 h-40 overflow-visible">
          <defs>
            <clipPath id="sphere-clip-interactive-brokers">
              <circle cx="80" cy="80" r="66" />
            </clipPath>
            <radialGradient id="sphere-grad-interactive-brokers" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#e2e8f0" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id="orbit-grad-brokers" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5945F1" />
              <stop offset="50%" stopColor="#FE01B1" />
              <stop offset="100%" stopColor="#c6f831" />
            </linearGradient>
          </defs>

          {/* Outer glowing aura */}
          <circle cx="80" cy="80" r="70" fill="#5338ec" fillOpacity="0.04" />
          <circle cx="80" cy="80" r="66" fill="url(#sphere-grad-interactive-brokers)" />

          {/* Internal Dotted Latitude Matrix */}
          <g clipPath="url(#sphere-clip-interactive-brokers)">
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
                strokeOpacity="0.55"
              />
            ))}
            {/* Continent Silhouettes */}
            <path
              d="M 45,55 Q 65,40 75,55 Q 90,60 82,75 Q 65,78 45,55 Z"
              fill="#94a3b8"
              fillOpacity="0.28"
            />
            <path
              d="M 80,82 Q 105,75 115,92 Q 100,110 82,98 Z"
              fill="#94a3b8"
              fillOpacity="0.28"
            />

            {/* Radar Sweep Effect */}
            {isScanning && (
              <motion.circle
                cx="80"
                cy="80"
                initial={{ r: 10, opacity: 0.9 }}
                animate={{ r: 70, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                fill="none"
                stroke="#5945F1"
                strokeWidth="3"
              />
            )}
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

          {/* Animated Orbit Rings with Travelling Energy Orbs */}
          <ellipse
            cx="80"
            cy="80"
            rx="75"
            ry="24"
            fill="none"
            stroke="url(#orbit-grad-brokers)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            transform="rotate(-22 80 80)"
            opacity="0.8"
          />
        </svg>

        {/* Orbiting particles */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-[#5945F1] shadow-[0_0_8px_#5945F1]"
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{
            transformOrigin: '80px 80px',
            top: 2,
            left: 2,
          }}
        />
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-[#FE01B1] shadow-[0_0_8px_#FE01B1]"
          animate={{
            rotate: -360,
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            transformOrigin: '80px 80px',
            bottom: 4,
            right: 4,
          }}
        />

        {/* Radar Ping trigger button at center of globe */}
        <motion.button
          onClick={handleTriggerRadar}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          title="Click to scan broker spreads"
          className="absolute w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs border border-indigo-200 text-[#5338ec] flex items-center justify-center shadow-md hover:bg-white transition-all z-20 group"
        >
          <Radio className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
        </motion.button>
      </motion.div>

      {/* Floating Interactive Badges with sine-wave bobbing & click tooltips */}
      {badges.map((b) => {
        const isHovered = activeTooltip === b.name;
        return (
          <motion.div
            key={b.name}
            className={`absolute ${b.positionClass} z-30`}
            animate={{
              y: [-4, 4, -4],
            }}
            transition={{
              duration: 3 + b.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: b.delay,
            }}
            onMouseEnter={() => setActiveTooltip(b.name)}
            onClick={() => setActiveTooltip(isHovered ? null : b.name)}
          >
            <motion.div
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: b.bg,
                color: b.color,
                borderColor: b.border,
              }}
              className="px-2.5 py-1 rounded-xl shadow-lg border text-left cursor-pointer transition-all flex items-center gap-1.5"
            >
              <div>
                <div className="font-extrabold text-[11px] leading-tight tracking-tight flex items-center gap-1">
                  <span>{b.name}</span>
                  {b.name === 'exness' && <Sparkles className="w-2.5 h-2.5 text-amber-950" />}
                </div>
                <div className="text-[7.5px] font-bold tracking-tighter opacity-80 uppercase leading-none">
                  {b.sub}
                </div>
              </div>
              <span className="text-[8px] px-1 py-0.2 rounded-md bg-black/15 font-bold font-mono">
                {b.rating}
              </span>
            </motion.div>

            {/* Interactive Tooltip Card */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl bg-[#0b1c30] text-white shadow-2xl border border-indigo-500/40 z-50 pointer-events-none text-left"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#c6f831] pb-1 border-b border-slate-700/60">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#c6f831]" />
                      <span>Verified Rebate</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Real-Time</span>
                  </div>
                  <p className="text-[10px] text-slate-200 mt-1 leading-snug">{b.perk}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
