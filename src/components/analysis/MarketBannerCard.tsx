import React from 'react';
import { MarketCategory } from './instrumentAnalysisData';
import { ChevronRight, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface MarketBannerCardProps {
  category: MarketCategory;
  onOpenHighlight?: () => void;
  onOpenETF?: () => void;
}

export const MarketBannerCard: React.FC<MarketBannerCardProps> = ({
  category,
  onOpenHighlight,
  onOpenETF,
}) => {
  // Fear & Greed gauge calculations (score typically 0-100, default 72)
  const score = category.fearGreedScore || 72;
  const needleAngle = -180 + (score / 100) * 180;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xs border border-indigo-100/90 overflow-hidden select-none transition-all">
      {/* ─── 1. TOP HEADER BANNER (Solid Indigo / Blue) ─── */}
      <div className="bg-[#5046E5] px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Blue App Icon with Bar Chart Graphic */}
          <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center p-2 shrink-0 shadow-inner">
            <div className="w-full h-full flex items-end justify-center gap-1">
              <span className="w-1.5 h-3 bg-white/90 rounded-xs" />
              <span className="w-1.5 h-5 bg-white rounded-xs" />
              <span className="w-1.5 h-3.5 bg-white/80 rounded-xs" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
              {category.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-white/80 flex-wrap">
              <span className="font-bold text-white text-sm">{category.statValue || '$200.5T'}</span>
              <span className="text-emerald-300 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded-full border border-emerald-400/30">
                {category.statChange || '+0.45%'}
              </span>
              <span className="text-white/60">·</span>
              <span className="font-medium">Activity {category.activity || '+$4.15'}</span>
            </div>
          </div>
        </div>

        {/* Live Indicator on Right */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] font-bold text-white tracking-wider uppercase">Live Market</span>
        </div>
      </div>

      {/* ─── 2. WHITE CARD BODY (4 Horizontal Columns Matching Reference Screenshot) ─── */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
        {/* Section 1: 24H Market Highlight */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onOpenHighlight}
            className="flex items-center gap-1 text-sm font-bold text-[#5046E5] hover:text-[#4338CA] transition-colors cursor-pointer group"
          >
            <span>24H Market Highlight</span>
            <ChevronRight className="w-4 h-4 text-[#5046E5] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="space-y-2.5">
            {/* Market Size Row */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              </div>
              <div className="flex items-baseline justify-between flex-1">
                <span className="text-xs text-slate-500 font-medium">Market Size</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-slate-900">{category.entryVal?.split(' ')[0] || '+$2.0T'}</span>
                  <span className="text-xs font-bold text-emerald-500">{category.statChange || '+0.45%'}</span>
                </div>
              </div>
            </div>

            {/* Volume Row */}
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              </div>
              <div className="flex items-baseline justify-between flex-1">
                <span className="text-xs text-slate-500 font-medium">Volume</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-slate-900">{category.volumeVal?.split(' ')[0] || '+$2.0T'}</span>
                  <span className="text-xs font-bold text-emerald-500">{category.statChange || '+0.45%'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: ETF */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onOpenETF}
            className="flex items-center gap-1 text-sm font-bold text-[#5046E5] hover:text-[#4338CA] transition-colors cursor-pointer group"
          >
            <span>ETF</span>
            <ChevronRight className="w-4 h-4 text-[#5046E5] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Left Sub-column (Long & Open Interest) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Long</span>
                  <span className="text-xs font-bold text-slate-900">+$2.0T</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Open Interest</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-900">+$2.0T</span>
                    <span className="text-[10px] font-bold text-emerald-500">+0.45%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sub-column (Short & Volume) */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-3 h-3 text-[#FD02B0] stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Short</span>
                  <span className="text-xs font-bold text-[#FD02B0]">+$2.0T</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-3 h-3 text-[#FD02B0] stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Volume</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-[#FD02B0]">+$2.0T</span>
                    <span className="text-[10px] font-bold text-[#FD02B0]">+0.45%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Liquidation Wave Chart */}
        <div className="space-y-1">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800">
              All Liquidation: <span className="font-extrabold">{category.allLiquidation || '$600.40 m'}</span>
            </span>
          </div>

          <div className="w-full h-[58px] relative overflow-hidden pt-1">
            <svg viewBox="0 0 280 55" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id={`bannerChartGrad-${category.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded wave */}
              <path
                d="M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20 L 280,55 L 0,55 Z"
                fill={`url(#bannerChartGrad-${category.id})`}
              />
              {/* Stroke wave */}
              <path
                d="M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
            <span>0.00</span>
            <span>24.00</span>
          </div>
        </div>

        {/* Section 4: Fear & Greed Semicircle Speedometer */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-slate-500 mb-1">Fear &amp; Greed</span>

          <div className="relative w-28 h-14 flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-28 h-14">
              <defs>
                <linearGradient id={`fearGreedArc-${category.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="35%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#BEF226" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path
                d="M 12 48 A 38 38 0 0 1 88 48"
                fill="none"
                stroke={`url(#fearGreedArc-${category.id})`}
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>

            {/* Needle */}
            <motion.div
              className="absolute bottom-0 left-1/2 w-[2.5px] h-11 bg-slate-900 rounded-full z-10"
              style={{ transformOrigin: 'bottom center' }}
              initial={{ rotate: -180 }}
              animate={{ rotate: needleAngle }}
              transition={{ type: 'spring', stiffness: 140, damping: 14 }}
            >
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full -top-1 -left-[4px] absolute shadow-xs border border-white" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-black text-slate-900">{score}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#BEF226] text-[#0f2402] border border-[#aedb1a]">
              {category.fearGreedLabel || 'Greed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
