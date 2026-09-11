import React, { useState } from 'react';
import { PerformanceTimeframeData } from '../types';
import { TrendingUp, DollarSign, BarChart3, Calendar, ArrowUpRight, Shield, Layers, HelpCircle } from 'lucide-react';

interface PerformanceSectionProps {
  performanceData: Record<'1D' | '1W' | '1M' | 'All', PerformanceTimeframeData>;
  onOpenConnectModal: () => void;
  onOpenLedger: () => void;
}

export const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  performanceData,
  onOpenConnectModal,
  onOpenLedger,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'All'>('1M');
  const [showZeroState, setShowZeroState] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const currentData = performanceData[timeframe];
  const history = currentData.history;

  // Compute SVG chart coordinates
  const maxVal = Math.max(...history.map((h) => h.cashback), 10);
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const points = history.map((item, idx) => {
    const x = paddingX + (idx / (history.length - 1 || 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (item.cashback / maxVal) * (svgHeight - paddingY * 2);
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`
    : '';

  return (
    <div
      id="performance-overview-section"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-sm relative"
    >
      {/* Header with Title + Time Segment Tabs + Zero-State Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#0b1c30] tracking-tight">
              Your Performance: March 2026
            </h3>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-[#dcfce7] text-[#15803d]">
              Audited
            </span>
          </div>
          <p className="text-xs text-[#474556] mt-0.5">
            Real-time verified lot volume and automated rebates credited
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Zero-state preview toggle for inspection */}
          <button
            onClick={() => setShowZeroState(!showZeroState)}
            className="text-[11px] font-semibold text-slate-500 hover:text-[#5338ec] underline transition-colors"
            title="Toggle zero-state display described in design system"
          >
            {showZeroState ? 'View Active Metrics' : 'Preview Zero State'}
          </button>

          {/* Segmented Time Filter Tabs: "1D", "1W", "1M", "All" */}
          <div className="p-1 rounded-full bg-[#f1f5f9] flex items-center gap-1 border border-slate-200">
            {(['1D', '1W', '1M', 'All'] as const).map((tf) => {
              const active = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setShowZeroState(false);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#5338ec] text-white shadow-sm'
                      : 'text-[#474556] hover:text-[#0b1c30]'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Body: Zero State or Performance Metrics */}
      {showZeroState ? (
        /* Zero-State Inset as specified in design system */
        <div className="my-6 rounded-2xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-[#e2e8f0] flex items-center justify-center mb-4 text-3xl">
            📈
          </div>
          <h4 className="font-display text-lg font-bold text-[#0b1c30] mb-1.5">
            No Trading Volume Logged Yet
          </h4>
          <p className="text-xs sm:text-sm text-[#474556] max-w-sm mb-5 leading-relaxed">
            Your performance tracking starts with your first trade. Link your verified broker account to track lots and receive instant cashback.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenConnectModal}
              className="px-4 py-2 rounded-lg border border-[#5338ec] text-[#5338ec] bg-white hover:bg-[#5338ec]/5 text-xs font-bold transition-all"
            >
              Connect Broker
            </button>
            <button
              onClick={() => setShowZeroState(false)}
              className="px-4 py-2 rounded-lg bg-[#5338ec] text-white text-xs font-bold hover:bg-[#4338ca] transition-all"
            >
              Load Demo Trades
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left / Top: Metric Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3.5 sm:gap-4">
            {/* Metric 1: Total Cashback */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all">
              <div className="flex items-center justify-between text-[#474556] text-xs font-medium mb-1">
                <span>Total Cashback</span>
                <span className="text-[#15803d] font-bold text-[11px] bg-[#dcfce7] px-1.5 py-0.5 rounded">
                  +18.4%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tabular-nums">
                ${currentData.totalCashback.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-[#474556] mt-1 block">
                Calculated on net closed volume
              </span>
            </div>

            {/* Metric 2: Lots Traded */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all">
              <div className="flex items-center justify-between text-[#474556] text-xs font-medium mb-1">
                <span>Lots Traded</span>
                <span className="text-[#5338ec] font-bold text-[11px] bg-[#eef2ff] px-1.5 py-0.5 rounded">
                  {timeframe}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-[#0b1c30] tabular-nums">
                {currentData.lotsTraded.toFixed(1)}{' '}
                <span className="text-sm font-normal text-slate-500">Lots</span>
              </div>
              <span className="text-[11px] text-[#474556] mt-1 block">
                Standard institutional lots
              </span>
            </div>

            {/* Metric 3: Avg Cashback / Lot */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all">
              <div className="text-[#474556] text-xs font-medium mb-1">
                Avg Cashback / Lot
              </div>
              <div className="text-xl sm:text-2xl font-bold font-display text-[#5338ec] tabular-nums">
                ${currentData.avgCashbackPerLot.toFixed(2)}
              </div>
              <span className="text-[11px] text-[#474556] mt-1 block">
                Includes +10% tier boost
              </span>
            </div>

            {/* Metric 4: Best Day */}
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all">
              <div className="text-[#474556] text-xs font-medium mb-1">
                Best Trading Day
              </div>
              <div className="text-xl sm:text-2xl font-bold font-display text-[#0b1c30] tabular-nums">
                ${currentData.bestDay.toFixed(2)}
              </div>
              <span className="text-[11px] text-[#474556] mt-1 block">
                Peak rebate payout single session
              </span>
            </div>
          </div>

          {/* Right: SVG Interactive Area & Trend Chart */}
          <div className="lg:col-span-6 bg-[#f8fafc] rounded-xl p-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#5338ec]" />
                <span className="text-xs font-bold text-[#0b1c30]">
                  Rebate Accumulation Trend ({timeframe})
                </span>
              </div>
              <button
                onClick={onOpenLedger}
                className="text-xs font-bold text-[#5338ec] hover:underline flex items-center gap-1"
              >
                <span>View Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Responsive Chart Container */}
            <div className="w-full relative h-[180px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5338ec" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#5338ec" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line
                  x1={paddingX}
                  y1={paddingY}
                  x2={svgWidth - paddingX}
                  y2={paddingY}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight / 2}
                  x2={svgWidth - paddingX}
                  y2={svgHeight / 2}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY}
                  stroke="#cbd5e1"
                />

                {/* Shaded Area */}
                {areaD && <path d={areaD} fill="url(#purpleGradient)" />}

                {/* Primary Trend Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#5338ec"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIndex === idx ? 6 : 4}
                      className="fill-white stroke-[#5338ec] stroke-2 cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                    {/* X axis labels */}
                    <text
                      x={pt.x}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 font-medium select-none"
                    >
                      {pt.date}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                <div
                  className="absolute -top-3 z-20 bg-[#0b1c30] text-white px-2.5 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none transform -translate-x-1/2"
                  style={{
                    left: `${(points[hoveredPointIndex].x / svgWidth) * 100}%`,
                  }}
                >
                  <div className="font-bold text-[#c6f831]">
                    ${points[hoveredPointIndex].cashback.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {points[hoveredPointIndex].lots} lots • {points[hoveredPointIndex].trades} trades
                  </div>
                </div>
              )}
            </div>

            {/* Bottom mini status */}
            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#474556]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                <span>Next payout scheduled: Monday, 00:00 UTC</span>
              </span>
              <span className="font-bold text-[#0b1c30]">
                Pending: ${currentData.pendingPayout.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
