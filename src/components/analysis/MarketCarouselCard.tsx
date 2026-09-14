import React from 'react';
import { MarketCategory } from './instrumentAnalysisData';
import { ChevronRight, BarChart2 } from 'lucide-react';

interface MarketCarouselCardProps {
  category: MarketCategory;
  isActive: boolean;
  onClick: () => void;
}

export const MarketCarouselCard: React.FC<MarketCarouselCardProps> = ({
  category,
  isActive,
  onClick,
}) => {
  // Semicircle gauge geometry
  // Arc from 180 deg to 0 deg (angle from PI to 0)
  // Value 0 to 100
  const score = category.fearGreedScore;
  // Angle for needle: 0 corresponds to -180deg (left), 100 corresponds to 0deg (right)
  const needleAngle = -180 + (score / 100) * 180;

  // SVG Area Chart coordinates based on category.chartPoints (24 points)
  const chartWidth = 260;
  const chartHeight = 54;
  const minVal = Math.min(...category.chartPoints);
  const maxVal = Math.max(...category.chartPoints);
  const range = maxVal - minVal || 1;

  const pointsString = category.chartPoints
    .map((val, idx) => {
      const x = (idx / (category.chartPoints.length - 1)) * chartWidth;
      const y = chartHeight - ((val - minVal) / range) * (chartHeight - 12) - 6;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPath = `M 0,${chartHeight} L ${pointsString} L ${chartWidth},${chartHeight} Z`;
  const linePath = `M ${pointsString}`;

  return (
    <div
      onClick={onClick}
      className={`transition-all duration-300 cursor-pointer select-none rounded-[28px] overflow-hidden shrink-0 ${
        isActive
          ? 'w-[330px] sm:w-[360px] shadow-[0_20px_50px_rgba(79,70,229,0.25)] ring-1 ring-[#5945F1] border-2 border-[#5945F1] bg-[#4338CA] transform scale-100 z-20'
          : 'w-[290px] sm:w-[320px] shadow-sm border border-indigo-200/60 bg-[#8374F5] hover:bg-[#7766F0] opacity-85 hover:opacity-95 transform scale-[0.94] z-10'
      }`}
    >
      {/* ─── CARD TOP HEADER ─── */}
      <div className="py-3 px-4 text-center">
        <span
          className={`font-bold text-sm sm:text-base tracking-wide ${
            isActive ? 'text-white' : 'text-white/95'
          }`}
        >
          {category.name}
        </span>
      </div>

      {/* ─── CARD MAIN BODY (White Container) ─── */}
      <div className="bg-white rounded-t-[24px] p-5 sm:p-6 space-y-4 text-slate-800">
        {/* Top Stat & Fear/Greed Gauge */}
        <div className="flex items-start justify-between gap-3">
          {/* Left: Stat & 24h Activity */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 shadow-2xs flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5 text-[#5945F1]" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold font-display text-[#0b1c30]">
                    {category.statValue}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {category.statChange}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Activity {category.activity}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Semicircle Fear & Greed Gauge */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Fear &amp; Greed
            </span>
            <div className="relative w-20 h-10 flex items-end justify-center overflow-hidden">
              {/* Semicircle Track */}
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
                  d="M 10 48 A 40 40 0 0 1 90 48"
                  fill="none"
                  stroke={`url(#gaugeGrad-${category.id})`}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              {/* Needle Indicator */}
              <div
                className="absolute bottom-0 left-1/2 w-[2px] h-9 bg-slate-800 origin-bottom transform transition-transform duration-500 rounded-full"
                style={{ transform: `translateX(-50%) rotate(${needleAngle}deg)` }}
              >
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full -top-0.5 -left-0.5 absolute"></div>
              </div>
            </div>
            {/* Score & Label Pill */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-sm font-bold text-slate-800">{category.fearGreedScore}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase"
                style={{
                  backgroundColor: category.fearGreedColor,
                  color: category.fearGreedScore > 60 ? '#14532D' : '#78350F',
                }}
              >
                {category.fearGreedLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Section: 24H Market Highlight */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:text-[#4338CA]">
            <span className="w-2 h-2 rounded-xs bg-[#4F46E5]"></span>
            <span>24H Market Highlight</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Entry</span>
              <span className="font-semibold text-slate-800">{category.entryVal}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Stop</span>
              <span className="font-semibold text-slate-800">{category.stopVal}</span>
            </div>
          </div>
        </div>

        {/* Section: ETFs & Liquidation */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#4F46E5]">
            <span className="w-2 h-2 rounded-xs bg-[#4F46E5]"></span>
            <span>ETFs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-400 text-[11px]">All liquidation</span>
            <span className="font-bold text-slate-900">{category.allLiquidation}</span>
          </div>

          {/* Long / Short Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Long</span>
              <span className="font-bold text-emerald-600">{category.longVal}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Short</span>
              <span className="font-bold text-rose-500">{category.shortVal}</span>
            </div>
          </div>

          {/* Open Interest / Volume */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div>
              <span className="text-slate-400 text-[11px] block">Open Interest</span>
              <span className="font-semibold text-slate-800">{category.openInterest}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Volume</span>
              <span className="font-semibold text-slate-800">{category.volumeVal}</span>
            </div>
          </div>
        </div>

        {/* ─── Wave Area Chart ─── */}
        <div className="pt-2">
          <div className="w-full h-[54px] relative overflow-hidden rounded-lg">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id={`areaGrad-${category.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#BEF226" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#84CC16" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#84CC16" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Shaded Area */}
              <path d={areaPath} fill={`url(#areaGrad-${category.id})`} />
              {/* Stroke Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#84CC16"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* X Axis labels */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1 px-1">
            <span>0.00</span>
            <span>24.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
