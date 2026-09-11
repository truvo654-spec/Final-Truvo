import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Calculator, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { CalculatorType } from '../calculators/TradingCalculatorsModal';

interface InteractiveTradeGraphicProps {
  onSelectCalculator?: (type: CalculatorType) => void;
  onSelectSignals?: () => void;
  onSelectCashback?: () => void;
}

export const InteractiveTradeGraphic: React.FC<InteractiveTradeGraphicProps> = ({
  onSelectCalculator,
  onSelectSignals,
  onSelectCashback,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [floatingNotification, setFloatingNotification] = useState<{ id: number; text: string } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoveredIcon(null);
  };

  const triggerAction = (label: string, callback?: () => void) => {
    setFloatingNotification({ id: Date.now(), text: label });
    setTimeout(() => setFloatingNotification(null), 1800);
    if (callback) {
      setTimeout(() => callback(), 250);
    }
  };

  return (
    <div
      className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
    >
      {/* 3D Tilting Orbital Arena */}
      <motion.div
        className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center"
        animate={{
          rotateX: tilt.y,
          rotateY: tilt.x,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        {/* SVG Orbital Rings & Background Circle */}
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="orbit-grad-trade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="center-glow-trade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#bcf026" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#bcf026" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Glow Field */}
          <circle cx="100" cy="100" r="75" fill="url(#center-glow-trade)" />

          {/* Large Dotted Orbit Loop 1 (Tilted Ellipse) */}
          <ellipse
            cx="100"
            cy="100"
            rx="82"
            ry="48"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.3"
            strokeDasharray="2.5 3.5"
            transform="rotate(-28 100 100)"
            opacity="0.75"
          />

          {/* Dotted Orbit Loop 2 (Counter-tilted) */}
          <ellipse
            cx="100"
            cy="100"
            rx="64"
            ry="78"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            transform="rotate(24 100 100)"
            opacity="0.65"
          />

          {/* Inner Dashed Ring */}
          <circle
            cx="100"
            cy="100"
            r="42"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.4"
          />
        </svg>

        {/* ─── SATELLITE 1: Solid Blue Orbital Dot (Mid-Left Orbit) ─── */}
        <motion.div
          className="absolute z-20 w-3.5 h-3.5 rounded-full bg-[#3b5bfd] shadow-md border-2 border-white cursor-pointer"
          style={{ top: '48%', left: '16%' }}
          animate={{
            scale: [1, 1.25, 1],
            boxShadow: [
              '0 0 0 0 rgba(59, 91, 253, 0.4)',
              '0 0 0 6px rgba(59, 91, 253, 0)',
              '0 0 0 0 rgba(59, 91, 253, 0)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
          whileHover={{ scale: 1.4 }}
          onClick={() => triggerAction('🔵 Active Orbital Node')}
          title="Active Live Liquidity Feed"
        />

        {/* ─── SQUIRCLE 1 (Top-Left): Light Lavender Box with Purple Bar/Line Chart ─── */}
        <motion.div
          className="absolute z-30 cursor-pointer"
          style={{ top: '6%', left: '20%' }}
          animate={{
            y: [-3, 3, -3],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.15, rotate: 0 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setHoveredIcon('signals')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={() => triggerAction('⚡ Opening Signals...', onSelectSignals)}
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#e9eafc] border border-white/90 shadow-xl flex items-center justify-center text-[#4f46e5] relative group transition-all">
            <TrendingUp className="w-6 h-6 stroke-[2.2] text-[#4f46e5]" />
            {hoveredIcon === 'signals' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0b1c30] text-white text-[9px] font-bold whitespace-nowrap shadow-lg">
                Market Signals
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── SQUIRCLE 2 (Top-Right): Royal Purple/Blue Box with White Target Bullseye ─── */}
        <motion.div
          className="absolute z-30 cursor-pointer"
          style={{ top: '14%', right: '8%' }}
          animate={{
            y: [3, -3, 3],
            rotate: [2, -2, 2],
          }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          whileHover={{ scale: 1.15, rotate: 0 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setHoveredIcon('target')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={() => triggerAction('🎯 Trade Planning Calc', () => onSelectCalculator?.('planning'))}
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#4338ca] border border-indigo-300/40 shadow-xl flex items-center justify-center text-white relative group">
            <Target className="w-6 h-6 stroke-[2.2] text-white" />
            {hoveredIcon === 'target' && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0b1c30] text-white text-[9px] font-bold whitespace-nowrap shadow-lg">
                Risk Target Planner
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── SQUIRCLE 3 (Bottom-Left): Hot Neon Pink/Magenta with White Calculator ─── */}
        <motion.div
          className="absolute z-30 cursor-pointer"
          style={{ bottom: '12%', left: '14%' }}
          animate={{
            y: [2, -4, 2],
            rotate: [-1, 2, -1],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          whileHover={{ scale: 1.15, rotate: 0 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setHoveredIcon('calc')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={() => triggerAction('🧮 Forex Sizing Calc', () => onSelectCalculator?.('forex'))}
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#fe01b1] border border-pink-300/40 shadow-xl flex items-center justify-center text-white relative group">
            <Calculator className="w-6 h-6 stroke-[2.2] text-white" />
            {hoveredIcon === 'calc' && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0b1c30] text-white text-[9px] font-bold whitespace-nowrap shadow-lg">
                Forex Calculator
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── SQUIRCLE 4 (Bottom-Right): Deep Slate Black Box with White Dollar Sign ─── */}
        <motion.div
          className="absolute z-30 cursor-pointer"
          style={{ bottom: '10%', right: '12%' }}
          animate={{
            y: [-3, 3, -3],
            rotate: [1, -2, 1],
          }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          whileHover={{ scale: 1.15, rotate: 0 }}
          whileTap={{ scale: 0.92 }}
          onMouseEnter={() => setHoveredIcon('cashback')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={() => triggerAction('💵 Cashback Overview', onSelectCashback)}
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-xl flex items-center justify-center text-white relative group">
            <DollarSign className="w-6 h-6 stroke-[2.5] text-white" />
            {hoveredIcon === 'cashback' && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#0b1c30] text-white text-[9px] font-bold whitespace-nowrap shadow-lg">
                Cashback Rebates
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Action Toast */}
      <AnimatePresence>
        {floatingNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            className="absolute z-50 px-3 py-1 rounded-xl bg-[#0b1c30] text-[#c6f831] font-bold text-xs shadow-2xl border border-white/20 whitespace-nowrap pointer-events-none"
          >
            {floatingNotification.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
