import React, { useState } from 'react';
import { MarketCategory } from './instrumentAnalysisData';
import { ChevronRight, ArrowUpRight, ArrowDownRight, Sparkles, Lock, X } from 'lucide-react';
import { motion } from 'motion/react';
import { TabSubmain } from '../common/TabSubmain';

export type AnalysisDuration = '1H' | '6H' | '12H' | '24H' | '1W' | '1M' | '6M' | '1Y';

export interface DurationOption {
  id: AnalysisDuration;
  label: string;
  minTierLevel: number;
  tierName: string;
  description: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
  {
    id: '1H',
    label: '1H',
    minTierLevel: 1,
    tierName: 'Rookie',
    description: 'Real-time 1-hour intraday momentum and high-frequency tick flow analysis.',
  },
  {
    id: '6H',
    label: '6H',
    minTierLevel: 1,
    tierName: 'Rookie',
    description: '6-hour session range tracking across London and New York overlaps.',
  },
  {
    id: '12H',
    label: '12H',
    minTierLevel: 1,
    tierName: 'Rookie',
    description: '12-hour cyclical market sentiment and orderbook delta distribution.',
  },
  {
    id: '24H',
    label: '24H',
    minTierLevel: 1,
    tierName: 'Rookie',
    description: 'Full 24-hour daily market range, open-close performance, and volatility metrics.',
  },
  {
    id: '1W',
    label: '1W',
    minTierLevel: 2,
    tierName: 'Climber',
    description: 'Historical 1-Week market horizon and swing volatility tracking are available from Climber (Level 2) and above.',
  },
  {
    id: '1M',
    label: '1M',
    minTierLevel: 3,
    tierName: 'Player',
    description: 'Monthly 1M deep-liquidity trend analysis and macro institutional distribution require Player (Level 3) tier or above.',
  },
  {
    id: '6M',
    label: '6M',
    minTierLevel: 3,
    tierName: 'Player',
    description: 'Semi-annual 6M market regime analysis and asset rotation tracking require Player (Level 3) tier or above.',
  },
  {
    id: '1Y',
    label: '1Y',
    minTierLevel: 4,
    tierName: 'Boss',
    description: 'Comprehensive 1-Year multi-cycle macroeconomic analysis and long-term liquidity mapping require Boss (Level 4) tier.',
  },
];

interface MarketBannerCardProps {
  category: MarketCategory;
  userTierLevel?: number;
  currentDuration?: AnalysisDuration;
  onDurationChange?: (duration: AnalysisDuration) => void;
  onOpenHighlight?: () => void;
  onOpenETF?: () => void;
  onShowToast?: (msg: string) => void;
}

export const MarketBannerCard: React.FC<MarketBannerCardProps> = ({
  category,
  userTierLevel = 1,
  currentDuration,
  onDurationChange,
  onOpenHighlight,
  onOpenETF,
  onShowToast,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<AnalysisDuration>(currentDuration || '24H');
  const [unlockedDurations, setUnlockedDurations] = useState<Set<AnalysisDuration>>(new Set());
  const [lockedModalTarget, setLockedModalTarget] = useState<DurationOption | null>(null);

  const isDurationUnlocked = (id: AnalysisDuration) => {
    const opt = DURATION_OPTIONS.find((o) => o.id === id);
    if (!opt) return true;
    return userTierLevel >= opt.minTierLevel || unlockedDurations.has(id);
  };

  const handleSelectDuration = (id: AnalysisDuration) => {
    setSelectedDuration(id);
    onDurationChange?.(id);
  };

  const handleUnlockModalDuration = () => {
    if (!lockedModalTarget) return;
    const targetId = lockedModalTarget.id;
    const targetLabel = lockedModalTarget.label;

    setUnlockedDurations((prev) => {
      const next = new Set(prev);
      next.add(targetId);
      return next;
    });

    setSelectedDuration(targetId);
    onDurationChange?.(targetId);
    onShowToast?.(`🔓 Unlocked ${targetLabel} timeframe with Credits!`);
    setLockedModalTarget(null);
  };

  // Fear & Greed gauge calculations (score typically 0-100, default 72)
  const score = category.fearGreedScore || 72;
  const needleAngle = -180 + (score / 100) * 180;

  return (
    <div className="w-full bg-white rounded-2xl shadow-xs border border-indigo-100/90 overflow-hidden select-none transition-all relative">
      {/* ─── 1. TOP HEADER BANNER (Solid Indigo / Blue) ─── */}
      <div className="bg-[#5046E5] px-5 sm:px-6 py-3.5 sm:py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
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

        {/* ─── DURATION SWITCHER TOOLBAR (Using TabSubmain with signature inverted fillets & lavender baseline) ─── */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-0.5 self-start xl:self-center">
          <div className="bg-white dark:bg-[#120a2e] px-3 sm:px-4 py-1.5 rounded-2xl border border-slate-200/90 dark:border-purple-900/60 shadow-2xs">
            <TabSubmain<AnalysisDuration>
              tabs={DURATION_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
                isLocked: !isDurationUnlocked(opt.id),
                minTierLevel: opt.minTierLevel,
                tierName: opt.tierName,
                description: opt.description,
              }))}
              activeTab={selectedDuration}
              onChange={(id) => handleSelectDuration(id)}
              onLockedTabClick={(tab) => {
                const opt = DURATION_OPTIONS.find((o) => o.id === tab.id);
                if (opt) setLockedModalTarget(opt);
              }}
              prefixLabel="DURATION"
              size="sm"
            />
          </div>
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
            <span>{selectedDuration} Market Highlight</span>
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
          <div className="flex items-center justify-end gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5046E5] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5046E5]" />
            </span>
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
              {/* Shaded animated wave */}
              <motion.path
                d="M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20 L 280,55 L 0,55 Z"
                animate={{
                  d: [
                    "M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20 L 280,55 L 0,55 Z",
                    "M 0,34 C 25,30 40,18 60,26 C 80,34 95,28 115,28 C 135,26 150,18 170,16 C 190,14 205,28 225,28 C 245,26 255,14 270,6 C 275,6 278,14 280,18 L 280,55 L 0,55 Z",
                    "M 0,40 C 25,42 40,28 60,20 C 80,16 95,38 115,38 C 135,40 150,26 170,26 C 190,28 205,38 225,38 C 245,38 255,6 270,12 C 275,12 278,18 280,22 L 280,55 L 0,55 Z",
                    "M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20 L 280,55 L 0,55 Z"
                  ]
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                fill={`url(#bannerChartGrad-${category.id})`}
              />
              {/* Stroke animated wave */}
              <motion.path
                d="M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20"
                animate={{
                  d: [
                    "M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20",
                    "M 0,34 C 25,30 40,18 60,26 C 80,34 95,28 115,28 C 135,26 150,18 170,16 C 190,14 205,28 225,28 C 245,26 255,14 270,6 C 275,6 278,14 280,18",
                    "M 0,40 C 25,42 40,28 60,20 C 80,16 95,38 115,38 C 135,40 150,26 170,26 C 190,28 205,38 225,38 C 245,38 255,6 270,12 C 275,12 278,18 280,22",
                    "M 0,38 C 25,38 40,24 60,24 C 80,24 95,36 115,36 C 135,36 150,22 170,22 C 190,22 205,34 225,34 C 245,34 255,8 270,8 C 275,8 278,16 280,20"
                  ]
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Traveling Live Telemetry Beacon Dot */}
              <motion.circle
                r="3.5"
                fill="#5046E5"
                stroke="#ffffff"
                strokeWidth="1.5"
                animate={{
                  cx: [10, 60, 115, 170, 225, 270, 225, 170, 115, 60, 10],
                  cy: [37, 24, 35, 22, 33, 8, 33, 22, 35, 24, 37],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
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

            {/* Live Swaying Pressure Needle */}
            <motion.div
              className="absolute bottom-0 left-1/2 w-[2.5px] h-11 bg-slate-900 rounded-full z-10"
              style={{ transformOrigin: 'bottom center' }}
              initial={{ rotate: -180 }}
              animate={{
                rotate: [needleAngle, needleAngle - 3.5, needleAngle + 2.5, needleAngle - 1.5, needleAngle],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full -top-1 -left-[4px] absolute shadow-xs border border-white" />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-lg font-black text-slate-900">{score}</span>
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#BEF226] text-[#0f2402] border border-[#aedb1a] shadow-xs inline-block"
            >
              {category.fearGreedLabel || 'Greed'}
            </motion.span>
          </div>
        </div>
      </div>

      {/* ─── LOCKED DURATION MODAL WITH BLURRED BACKGROUND & CTA ─── */}
      {lockedModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLockedModalTarget(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLockedModalTarget(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Frosted Lock Icon */}
            <div className="relative w-14 h-14 rounded-2xl bg-[#5945F1]/10 border border-[#5945F1]/25 flex items-center justify-center mb-4 shadow-inner">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Lock className="w-6 h-6 text-[#5945F1]" strokeWidth={2.2} />
              </motion.div>
            </div>

            {/* Required Tier Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-[#5945F1] border border-purple-200 mb-2.5">
              <span>Requires {lockedModalTarget.tierName}</span>
              <span className="text-purple-400">·</span>
              <span>Level {lockedModalTarget.minTierLevel}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
              {lockedModalTarget.label} Timeframe Locked
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 max-w-sm">
              {lockedModalTarget.description}
            </p>

            {/* CTA Buttons */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleUnlockModalDuration}
                className="w-full flex-1 relative group overflow-hidden py-3 px-5 rounded-xl bg-[#5945F1] hover:bg-[#4a36e2] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#5945F1]/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Unlock with Credits</span>
              </button>
              <button
                type="button"
                onClick={() => setLockedModalTarget(null)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1">
              <span>Tip: Earn points by closing lots to level up automatically.</span>
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};
