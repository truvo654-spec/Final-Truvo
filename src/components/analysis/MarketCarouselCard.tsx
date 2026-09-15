import React from 'react';
import { MarketCategory } from './instrumentAnalysisData';
import { ChevronRight, TrendingUp, TrendingDown, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface MarketCarouselCardProps {
  category: MarketCategory;
  isActive: boolean;
  distance?: number;
  onClick: () => void;
}

export const MarketCarouselCard: React.FC<MarketCarouselCardProps> = ({
  category,
  isActive,
  distance = 0,
  onClick,
}) => {
  // Fear & Greed needle angle (72 out of 100 -> -180 to 0)
  const score = category.fearGreedScore || 72;
  const needleAngle = -180 + (score / 100) * 180;

  // Category Icon Badge
  const getCategoryBadge = (catId: string) => {
    switch (catId) {
      case 'crypto':
        return { emoji: '⚡', label: 'Crypto' };
      case 'forex':
        return { emoji: '💱', label: 'Forex' };
      case 'indices':
        return { emoji: '📊', label: 'Indices CFDs' };
      case 'commodities':
        return { emoji: '🛢️', label: 'Commodities' };
      case 'stocks':
        return { emoji: '📈', label: 'Stocks' };
      default:
        return { emoji: '✨', label: category.name };
    }
  };

  const badgeInfo = getCategoryBadge(category.id);

  return (
    <div
      onClick={onClick}
      className={`group relative w-[340px] sm:w-[370px] select-none rounded-[28px] overflow-hidden shrink-0 transition-all duration-300 bg-white ${
        isActive
          ? 'shadow-[0_22px_55px_rgba(89,69,241,0.28),0_10px_25px_rgba(253,2,176,0.18)] ring-2 ring-[#5945F1] border-2 border-[#5945F1]/80'
          : 'shadow-lg border border-slate-200/90 hover:border-[#5945F1]/50'
      }`}
    >
      {/* ─── CARD TOP HEADER ─── */}
      <div
        className={`py-3 px-4.5 flex items-center justify-between transition-colors ${
          isActive
            ? 'bg-gradient-to-r from-[#4338CA] via-[#5945F1] to-[#FD02B0]'
            : 'bg-[#705FF5] group-hover:bg-[#6250EF]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg select-none">{badgeInfo.emoji}</span>
          <span
            className={`font-black text-sm sm:text-base tracking-wide ${
              isActive ? 'text-white drop-shadow-xs' : 'text-white/95'
            }`}
          >
            {category.name}
          </span>
        </div>

        {isActive ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/25">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-extrabold tracking-wider text-white uppercase">
              LIVE
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-white/75 group-hover:text-white group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
            Inspect <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* ─── CARD MAIN BODY (White Container) ─── */}
      <div className="bg-white p-5 sm:p-5.5 space-y-3.5 text-slate-800 relative">
        {/* Top Stat & Fear/Greed Gauge */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Stat & 24h Activity */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              {/* Colorful 3-bar histogram icon with playful bouncing equalizer bars */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] p-0.5 shadow-2xs flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-white rounded-[10px] flex items-end justify-center gap-1 p-2">
                  <motion.div
                    className="w-1.5 bg-[#6366F1] rounded-xs"
                    animate={
                      isActive
                        ? { height: ['35%', '85%', '50%', '35%'] }
                        : { height: '40%' }
                    }
                    transition={
                      isActive
                        ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                        : {}
                    }
                  />
                  <motion.div
                    className="w-1.5 bg-[#EC4899] rounded-xs"
                    animate={
                      isActive
                        ? { height: ['70%', '35%', '95%', '70%'] }
                        : { height: '70%' }
                    }
                    transition={
                      isActive
                        ? {
                            repeat: Infinity,
                            duration: 2.1,
                            ease: 'easeInOut',
                            delay: 0.2,
                          }
                        : {}
                    }
                  />
                  <motion.div
                    className="w-1.5 bg-[#10B981] rounded-xs"
                    animate={
                      isActive
                        ? { height: ['45%', '90%', '30%', '45%'] }
                        : { height: '55%' }
                    }
                    transition={
                      isActive
                        ? {
                            repeat: Infinity,
                            duration: 1.6,
                            ease: 'easeInOut',
                            delay: 0.4,
                          }
                        : {}
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold font-display text-[#0b1c30]">
                    {category.statValue}
                  </span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {category.statChange}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <span>Activity {category.activity}</span>
                  {isActive && (
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Semicircle Fear & Greed Gauge */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-slate-400 mb-0.5">
              Fear &amp; Greed
            </span>
            <div className="relative w-20 h-10 flex items-end justify-center overflow-hidden">
              {/* Semicircle Rainbow Track */}
              <svg viewBox="0 0 100 50" className="w-20 h-10">
                <defs>
                  <linearGradient id={`gaugeGrad-${category.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="35%" stopColor="#F59E0B" />
                    <stop offset="70%" stopColor="#BEF226" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                <path
                  d="M 12 48 A 38 38 0 0 1 88 48"
                  fill="none"
                  stroke={`url(#gaugeGrad-${category.id})`}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>

              {/* Playful Animated Needle with Spring Settle */}
              <motion.div
                className="absolute bottom-0 left-1/2 w-[2.5px] h-8 bg-slate-900 rounded-full z-10"
                style={{ transformOrigin: 'bottom center' }}
                initial={{ rotate: -180 }}
                animate={{ rotate: needleAngle }}
                transition={{
                  type: 'spring',
                  stiffness: 140,
                  damping: 12,
                  delay: isActive ? 0.12 : 0,
                }}
              >
                <div className="w-2 h-2 bg-slate-950 rounded-full -top-1 -left-[3px] absolute shadow-xs border border-white" />
              </motion.div>
            </div>

            {/* Score & Label Pill */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm font-extrabold text-slate-900">{score}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-transform"
                style={{
                  backgroundColor: '#BEF226',
                  color: '#1C4100',
                }}
              >
                Greed
              </span>
            </div>
          </div>
        </div>

        {/* Section: 24H Market Highlight */}
        <div className="pt-2 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5945F1] hover:text-[#4338CA] transition-colors cursor-pointer">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#5945F1] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
                <rect x="2" y="2" width="12" height="12" rx="2" fill="#5945F1" />
                <path d="M4 5h8M4 8h8M4 11h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-bold text-[#5945F1]">24H Market Highlight</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#5945F1] group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
            <div className="bg-slate-50/80 rounded-lg p-1.5">
              <span className="text-slate-400 block text-[11px]">Entry</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-slate-900 text-sm">+$2.0T</span>
                <span className="text-emerald-500 font-bold text-xs">+0.45%</span>
              </div>
            </div>
            <div className="bg-slate-50/80 rounded-lg p-1.5">
              <span className="text-slate-400 block text-[11px]">Stop</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-slate-900 text-sm">+$2.0T</span>
                <span className="text-emerald-500 font-bold text-xs">+0.45%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: ETFs */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5945F1]">
            <span className="w-3.5 h-3.5 rounded-xs bg-[#5945F1] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 fill-white">
                <rect x="2" y="2" width="12" height="12" rx="2" fill="#5945F1" />
                <path d="M4 5h8M4 8h8M4 11h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-sm font-bold text-[#5945F1]">ETFs</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#5945F1]" />
          </div>

          <div className="flex items-baseline justify-between text-xs pt-0.5 px-0.5">
            <span className="text-slate-400 text-xs">All liquidation</span>
            <span className="font-bold text-slate-900 text-sm">$600.40 M</span>
          </div>
        </div>

        {/* ─── Inner Light Container (Long, Short, Open Interest, Volume & Wave Chart) ─── */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 space-y-3.5 border border-slate-100/80">
          {/* Long / Short Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Long</span>
              <span className="font-bold text-emerald-500 text-sm">$450.0M</span>
            </div>
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Short</span>
              <span className="font-bold text-[#FD02B0] text-sm">$150.4M</span>
            </div>
          </div>

          {/* Open Interest / Volume */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Open Interest</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 text-sm">+$2.0T</span>
                <span className="text-emerald-500 font-bold text-xs flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +0.45%
                </span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-xs block mb-0.5">Volume</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 text-sm">+$2.0T</span>
                <span className="text-[#FD02B0] font-bold text-xs flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  +0.45%
                </span>
              </div>
            </div>
          </div>

          {/* ─── Lime Wave Area Chart with Live Pulse Beacon ─── */}
          <div className="pt-1">
            <div className="w-full h-[52px] relative overflow-hidden">
              <svg
                viewBox="0 0 268 54"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id={`limeWaveGrad-${category.id}`} x1="0%" y1="0%" x2="0%" y2="1">
                    <stop offset="0%" stopColor="#BEF226" stopOpacity="0.55" />
                    <stop offset="70%" stopColor="#BEF226" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#BEF226" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Shaded Area */}
                <path
                  d="M 0,38 C 20,38 35,28 50,28 C 65,28 75,36 90,36 C 105,36 115,26 130,26 C 145,26 155,34 170,34 C 185,34 195,4 210,4 C 222,4 230,32 240,32 C 250,32 258,20 268,20 L 268,54 L 0,54 Z"
                  fill={`url(#limeWaveGrad-${category.id})`}
                />
                {/* Stroke Line */}
                <path
                  d="M 0,38 C 20,38 35,28 50,28 C 65,28 75,36 90,36 C 105,36 115,26 130,26 C 145,26 155,34 170,34 C 185,34 195,4 210,4 C 222,4 230,32 240,32 C 250,32 258,20 268,20"
                  fill="none"
                  stroke="#A3E635"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Live Pulsing Beacon on wave tip */}
              {isActive && (
                <div className="absolute right-1 top-[17px] flex items-center justify-center pointer-events-none">
                  <span className="absolute w-4 h-4 rounded-full bg-[#BEF226]/60 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-[#A3E635] shadow-xs border border-white" />
                </div>
              )}
            </div>
            {/* X Axis labels: 0.00 and 24.00 */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-0.5 px-0.5">
              <span>0.00</span>
              <span className="flex items-center gap-1">
                {isActive && <Sparkles className="w-2.5 h-2.5 text-amber-500" />}
                24.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
