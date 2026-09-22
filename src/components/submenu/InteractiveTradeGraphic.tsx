import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Calculator, DollarSign, TrendingUp, ArrowLeftRight, Clock, BarChart2, Activity, Compass, LineChart } from 'lucide-react';
import { CalculatorType } from '../calculators/TradingCalculatorsModal';

export type TradeFeatureVariant = 'signals' | 'analysis' | 'calculators' | 'converters';

interface InteractiveTradeGraphicProps {
  variant?: TradeFeatureVariant;
  onSelectCalculator?: (type: CalculatorType) => void;
  onSelectSignals?: () => void;
  onSelectAnalysis?: () => void;
  onSelectCashback?: () => void;
}

export const InteractiveTradeGraphic: React.FC<InteractiveTradeGraphicProps> = ({
  variant = 'signals',
  onSelectCalculator,
  onSelectSignals,
  onSelectAnalysis,
  onSelectCashback,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoveredIcon(null);
  };

  return (
    <div
      className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
    >
      <AnimatePresence mode="wait">
        {/* ─────────────────────────────────────────────────────────────
            VARIANT 1: TRADING SIGNALS (Navigation Menu Content 44.png)
           ───────────────────────────────────────────────────────────── */}
        {variant === 'signals' && (
          <motion.div
            key="signals"
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: tilt.y,
              rotateY: tilt.x - 6,
            }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative cursor-pointer"
            onClick={onSelectSignals}
          >
            {/* Tilted Dark Card */}
            <div className="w-48 sm:w-52 rounded-3xl bg-[#0f1115] border border-white/10 p-4 sm:p-5 shadow-2xl relative overflow-visible transform -rotate-6 transition-transform duration-300 hover:rotate-0 group">
              {/* Top Row: White Dot & SIGNALS */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                <span className="text-[11px] font-bold tracking-widest text-white/90 uppercase font-mono">
                  SIGNALS
                </span>
              </div>

              {/* Middle Row: Gold Coins Icon + XAU/USD + +14.05% */}
              <div className="flex items-center gap-2.5 mb-4">
                {/* Gold Bullion / Coin Stack Icon */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white text-white">
                    <path d="M4 14h6v4H4v-4zm10 0h6v4h-6v-4zM9 7h6v4H9V7z" opacity="0.9" />
                    <circle cx="8" cy="11" r="2.5" fill="#fef08a" />
                    <circle cx="16" cy="11" r="2.5" fill="#fef08a" />
                    <circle cx="12" cy="17" r="2.5" fill="#fef08a" />
                  </svg>
                </div>

                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-black text-white leading-tight tracking-tight">
                    XAU/USD
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    +14.05%
                  </span>
                </div>
              </div>

              {/* Glowing Prismatic Bar / Iris shimmer */}
              <div className="w-3.5 h-10 rounded-full bg-gradient-to-b from-purple-500 via-pink-500 to-indigo-600 opacity-80 blur-xs absolute left-5 top-20 pointer-events-none" />

              {/* Bottom Row: 88% confidence + BUY badge */}
              <div className="flex items-baseline gap-1 pt-2">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  88%
                </span>
                <span className="text-xs text-white/70 font-medium">
                  confidence
                </span>
              </div>

              {/* Green "BUY" pill badge poking out at bottom right */}
              <div className="absolute -bottom-2 -right-2 bg-[#10b981] group-hover:bg-[#059669] text-white text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
                BUY
              </div>
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VARIANT 1.5: INSTRUMENT ANALYSIS (Deep Technical Telemetry)
           ───────────────────────────────────────────────────────────── */}
        {variant === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: tilt.y,
              rotateY: tilt.x - 4,
            }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative cursor-pointer"
            onClick={onSelectAnalysis}
          >
            {/* Tilted Dark Card */}
            <div className="w-48 sm:w-52 rounded-3xl bg-[#0b1c30] border border-white/15 p-4 sm:p-5 shadow-2xl relative overflow-visible transform -rotate-3 transition-transform duration-300 hover:rotate-0 group">
              {/* Top Row: Green Dot & INSTRUMENT ANALYSIS */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#bef226] shadow-xs animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-[#bef226] uppercase font-mono">
                    ANALYSIS
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                  1H
                </span>
              </div>

              {/* Middle Row: Asset & Mini Technical Candlestick Bars */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                    EUR/USD
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                    <span>RSI 62.4 • Bullish</span>
                  </div>
                </div>

                {/* Technical Radar / Indicator Icon Box */}
                <div className="w-9 h-9 rounded-xl bg-[#5945F1] flex items-center justify-center text-white shadow-md shrink-0">
                  <Activity className="w-5 h-5 text-[#bef226] stroke-[2.5]" />
                </div>
              </div>

              {/* SVG Micro Candlestick Chart */}
              <div className="w-full h-9 bg-black/30 rounded-xl p-1.5 flex items-end justify-between gap-1 border border-white/5">
                {[
                  { h: 14, green: true },
                  { h: 20, green: true },
                  { h: 16, green: false },
                  { h: 24, green: true },
                  { h: 28, green: true },
                  { h: 22, green: false },
                  { h: 30, green: true },
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-xs transition-all ${
                        bar.green ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                      style={{ height: `${bar.h}px` }}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Row: Confluence status */}
              <div className="flex items-baseline justify-between pt-2.5">
                <span className="text-xs font-mono font-bold text-slate-300">
                  EMA 20 &gt; 50 &gt; 200
                </span>
                <span className="text-[11px] text-[#bef226] font-extrabold">
                  STRONG
                </span>
              </div>

              {/* Lime "METRICS" pill badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#bef226] group-hover:bg-[#aee019] text-black text-xs font-black px-3 py-1 rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center transition-transform group-hover:scale-105">
                ANALYZE
              </div>
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VARIANT 2: TRADING CALCULATORS (Navigation Menu Content 45.png)
           ───────────────────────────────────────────────────────────── */}
        {variant === 'calculators' && (
          <motion.div
            key="calculators"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: tilt.y,
              rotateY: tilt.x,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center"
          >
            {/* SVG Orbital Rings */}
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              {/* Large Dotted Orbit Loop 1 */}
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
                opacity="0.85"
              />

              {/* Dotted Orbit Loop 2 */}
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
                opacity="0.75"
              />
            </svg>

            {/* Orbit Node Dot (Blue) */}
            <div
              className="absolute z-20 w-3.5 h-3.5 rounded-full bg-[#3b5bfd] shadow-md border-2 border-white"
              style={{ top: '48%', left: '16%' }}
            />

            {/* SQUIRCLE 1 (Top-Left): Lavender card with blue trending chart */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ top: '6%', left: '20%' }}
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCalculator?.('technical')}
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#e9eafc] border border-white/90 shadow-xl flex items-center justify-center text-[#4f46e5]">
                <TrendingUp className="w-6 h-6 stroke-[2.4] text-[#4f46e5]" />
              </div>
            </motion.div>

            {/* SQUIRCLE 2 (Top-Right): Indigo card with target */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ top: '14%', right: '8%' }}
              animate={{ y: [2, -2, 2] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCalculator?.('planning')}
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#4338ca] border border-indigo-300/40 shadow-xl flex items-center justify-center text-white">
                <Target className="w-6 h-6 stroke-[2.2] text-white" />
              </div>
            </motion.div>

            {/* SQUIRCLE 3 (Bottom-Left): Hot Pink card with calculator */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ bottom: '12%', left: '14%' }}
              animate={{ y: [2, -3, 2] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCalculator?.('forex')}
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#fe01b1] border border-pink-300/40 shadow-xl flex items-center justify-center text-white">
                <Calculator className="w-6 h-6 stroke-[2.2] text-white" />
              </div>
            </motion.div>

            {/* SQUIRCLE 4 (Bottom-Right): Deep Black card with Dollar sign */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ bottom: '10%', right: '12%' }}
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCashback?.()}
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#111111] border border-slate-700/80 shadow-xl flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6 stroke-[2.5] text-white" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VARIANT 3: CONVERTER CALCULATORS (Navigation Menu Content 46.png)
           ───────────────────────────────────────────────────────────── */}
        {variant === 'converters' && (
          <motion.div
            key="converters"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: tilt.y,
              rotateY: tilt.x,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
          >
            {/* SVG Wireframe Globe with curved arrows */}
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
              {/* Globe Outer Ring */}
              <circle
                cx="100"
                cy="110"
                r="64"
                fill="none"
                stroke="#a3e635"
                strokeWidth="1.4"
                opacity="0.85"
              />

              {/* Horizontal Latitude Line */}
              <line
                x1="36"
                y1="110"
                x2="164"
                y2="110"
                stroke="#a3e635"
                strokeWidth="1.2"
                opacity="0.75"
              />

              {/* Curved Longitude Ellipse */}
              <ellipse
                cx="100"
                cy="110"
                rx="34"
                ry="64"
                fill="none"
                stroke="#a3e635"
                strokeWidth="1.2"
                opacity="0.75"
              />

              {/* Upper Curved Exchange Arrow (pointing right towards Bitcoin) */}
              <path
                d="M 65 82 C 85 70, 110 70, 130 84"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <polygon points="132,84 124,78 128,88" fill="#3b82f6" />

              {/* Lower Curved Exchange Arrow (pointing left towards Clock) */}
              <path
                d="M 125 140 C 105 152, 75 150, 58 134"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <polygon points="56,134 64,139 60,129" fill="#3b82f6" />
            </svg>

            {/* CARD 1 (Top-Left): Hot Pink with Dollar Sign $ */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ top: '4%', left: '16%' }}
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCalculator?.('currency')}
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#fe01b1] border border-pink-300/40 shadow-xl flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6 stroke-[2.6] text-white" />
              </div>
            </motion.div>

            {/* BADGE (Between Cards): Black circle with white ⇄ exchange arrows */}
            <motion.div
              className="absolute z-40"
              style={{ top: '24%', left: '46%' }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-7 h-7 rounded-full bg-[#111111] border-2 border-white flex items-center justify-center text-white shadow-md">
                <ArrowLeftRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </div>
            </motion.div>

            {/* CARD 2 (Top-Right): Royal Blue/Indigo with Bitcoin Symbol ₿ */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ top: '16%', right: '8%' }}
              animate={{ y: [2, -2, 2] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCalculator?.('currency')}
            >
              <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#4f46e5] border border-indigo-300/40 shadow-xl flex items-center justify-center text-white">
                <span className="text-xl sm:text-2xl font-black text-white leading-none">
                  ₿
                </span>
              </div>
            </motion.div>

            {/* CLOCK 1 (Mid-Left): Blue circular clock (9 o'clock) */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ top: '44%', left: '6%' }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.15 }}
              onClick={() => onSelectCalculator?.('timezone')}
            >
              <div className="w-8 h-8 rounded-full bg-[#3b82f6] border-2 border-white flex items-center justify-center text-white shadow-lg">
                <Clock className="w-4 h-4 text-white stroke-[2.4]" />
              </div>
            </motion.div>

            {/* CLOCK 2 (Mid-Right): Purple circular clock (3 o'clock) */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ top: '56%', right: '18%' }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              whileHover={{ scale: 1.15 }}
              onClick={() => onSelectCalculator?.('timezone')}
            >
              <div className="w-8 h-8 rounded-full bg-[#6366f1] border-2 border-white flex items-center justify-center text-white shadow-lg">
                <Clock className="w-4 h-4 text-white stroke-[2.4]" />
              </div>
            </motion.div>

            {/* CARD 3 (Bottom-Right): Soft Lavender squircle with Candlestick Chart */}
            <motion.div
              className="absolute z-30 cursor-pointer"
              style={{ bottom: '10%', right: '28%' }}
              animate={{ y: [-1, 2, -1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              whileHover={{ scale: 1.12 }}
              onClick={() => onSelectCalculator?.('forex')}
            >
              <div className="w-9 h-9 rounded-xl bg-[#ede9fe] border border-white shadow-md flex items-center justify-center text-[#5945F1]">
                <BarChart2 className="w-5 h-5 text-[#5945F1] stroke-[2.2]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
