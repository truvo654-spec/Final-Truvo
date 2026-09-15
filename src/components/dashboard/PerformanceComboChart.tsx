import React, { useState } from 'react';

export interface PerformanceComboChartProps {
  totalCashback?: string;
  lotsTraded?: string | number;
  avgCashbackPerLot?: string;
  bestDay?: string;
  className?: string;
  isDemoActive?: boolean;
}

interface DayData {
  day: number;
  cashback: number; // in USD
  lots: number; // in lots
  hasData: boolean;
}

// Exact dataset matching image.png (Days 1-15 active data, Days 16-31 zero/future)
const DEFAULT_CHART_DATA: DayData[] = [
  { day: 1, cashback: 22.5, lots: 2.25, hasData: true },
  { day: 2, cashback: 22.5, lots: 2.25, hasData: true },
  { day: 3, cashback: 36.8, lots: 3.68, hasData: true },
  { day: 4, cashback: 36.8, lots: 3.68, hasData: true },
  { day: 5, cashback: 27.5, lots: 2.75, hasData: true },
  { day: 6, cashback: 26.5, lots: 2.65, hasData: true },
  { day: 7, cashback: 15.8, lots: 1.58, hasData: true },
  { day: 8, cashback: 15.8, lots: 1.58, hasData: true },
  { day: 9, cashback: 32.8, lots: 3.28, hasData: true },
  { day: 10, cashback: 36.5, lots: 3.65, hasData: true },
  { day: 11, cashback: 46.8, lots: 4.68, hasData: true },
  { day: 12, cashback: 50.8, lots: 5.08, hasData: true },
  { day: 13, cashback: 0, lots: 0, hasData: true },
  { day: 14, cashback: 0, lots: 0, hasData: true },
  { day: 15, cashback: 36.8, lots: 3.68, hasData: true },
  // Days 16 through 31: no trades yet
  ...Array.from({ length: 16 }, (_, i) => ({
    day: 16 + i,
    cashback: 0,
    lots: 0,
    hasData: false,
  })),
];

export const PerformanceComboChart: React.FC<PerformanceComboChartProps> = ({
  totalCashback = '$0.00',
  lotsTraded = '0',
  avgCashbackPerLot = '$0.00',
  bestDay = '$0.00',
  className = '',
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // SVG Coordinate Geometry:
  // ViewBox: 0 0 1000 320 (High-res 16:5 ratio that stretches full-width across any container)
  const leftAxisX = 45;
  const rightAxisX = 955;
  const plotLeft = 55;
  const plotRight = 945;
  const plotWidth = plotRight - plotLeft; // 890px
  const plotTop = 38;
  const plotBottom = 260;
  const plotHeight = plotBottom - plotTop; // 222px

  const yTicks = [
    { usd: '$100', lots: '10 lots', val: 100 },
    { usd: '$90', lots: '9 lots', val: 90 },
    { usd: '$80', lots: '8 lots', val: 80 },
    { usd: '$70', lots: '7 lots', val: 70 },
    { usd: '$60', lots: '6 lots', val: 60 },
    { usd: '$50', lots: '5 lots', val: 50 },
    { usd: '$40', lots: '4 lots', val: 40 },
    { usd: '$30', lots: '3 lots', val: 30 },
    { usd: '$20', lots: '2 lots', val: 20 },
    { usd: '$10', lots: '1 lots', val: 10 },
    { usd: '$0', lots: '0 lots', val: 0 },
  ];

  const getY = (val: number) => {
    return plotBottom - (val / 100) * plotHeight;
  };

  const daySlotWidth = plotWidth / 31; // ~28.71px per day
  const barWidth = 14.5; // Width of lavender bar

  const getDayCenterX = (dayNum: number) => {
    return plotLeft + (dayNum - 0.5) * daySlotWidth;
  };

  // Build the continuous polyline for Days 1 to 15 (matching image.png)
  const activeDays = DEFAULT_CHART_DATA.filter((d) => d.day <= 15);
  const polylinePoints = activeDays
    .map((d) => {
      const x = getDayCenterX(d.day);
      const y = getY(d.cashback);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div
      id="dashboard-performance-chart-card"
      className={`w-full rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden ${className}`}
    >
      {/* ─── TOP KPI SUMMARY TABLE / METRIC ROW (1:1 with image.png) ─── */}
      <div className="px-6 sm:px-8 pt-6 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left">
          {/* Col 1: Total Cashback (1M) */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-normal text-slate-500 tracking-normal">
              Total Cashback (1M)
            </div>
            <div className="text-base sm:text-lg font-bold text-[#5945F1] font-mono leading-none">
              {totalCashback}
            </div>
          </div>

          {/* Col 2: Lots Traded */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-normal text-slate-500 tracking-normal">
              Lots Traded
            </div>
            <div className="text-base sm:text-lg font-bold text-[#5945F1] font-mono leading-none">
              {lotsTraded}
            </div>
          </div>

          {/* Col 3: Avg Cashback / Lot */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-normal text-slate-500 tracking-normal">
              Avg Cashback / Lot
            </div>
            <div className="text-base sm:text-lg font-bold text-[#5945F1] font-mono leading-none">
              {avgCashbackPerLot}
            </div>
          </div>

          {/* Col 4: Best Day */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-normal text-slate-500 tracking-normal">
              Best Day
            </div>
            <div className="text-base sm:text-lg font-bold text-[#5945F1] font-mono leading-none">
              {bestDay}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Divider Line (1:1 with image.png) */}
      <div className="w-full h-px bg-slate-100" />

      {/* ─── DUAL AXIS COMBO CHART (FULL WIDTH 1:1 WITH image.png) ─── */}
      <div className="px-4 sm:px-6 pt-5 pb-6">
        <div className="w-full relative">
          {/* Hover Tooltip Overlay */}
          {hoveredDay && hoveredDay.hasData && (
            <div
              className="absolute pointer-events-none z-20 bg-[#0b1c30] text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl border border-slate-700 transition-all duration-75"
              style={{
                left: `${((getDayCenterX(hoveredDay.day) / 1000) * 100).toFixed(1)}%`,
                top: '15px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold text-slate-300">Day {hoveredDay.day}</div>
              <div className="text-[#c4b5fd] font-semibold">
                Cashback: ${hoveredDay.cashback.toFixed(2)}
              </div>
              <div className="text-emerald-400 font-medium">
                Volume: {hoveredDay.lots.toFixed(2)} Lots
              </div>
            </div>
          )}

          {/* Responsive Full-Width SVG (Scales to 100% width on any screen) */}
          <svg
            viewBox="0 0 1000 320"
            className="w-full h-auto max-h-[360px] overflow-visible select-none"
          >
            {/* Horizontal Gridlines & Dual Y-Axis Labels */}
            {yTicks.map((tick) => {
              const y = getY(tick.val);
              const isBaseline = tick.val === 0;

              return (
                <g key={`ytick-${tick.val}`}>
                  {/* Left Y-Axis Label: USD */}
                  <text
                    x={leftAxisX}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[12px] fill-slate-700 font-semibold"
                  >
                    {tick.usd}
                  </text>

                  {/* Horizontal Gridline (Dashed for 10-100, Solid for 0 baseline) */}
                  {isBaseline ? (
                    <line
                      x1={plotLeft}
                      y1={y}
                      x2={plotRight}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1.4"
                    />
                  ) : (
                    <line
                      x1={plotLeft}
                      y1={y}
                      x2={plotRight}
                      y2={y}
                      stroke="#c7d2fe"
                      strokeOpacity="0.45"
                      strokeDasharray="5 5"
                      strokeWidth="1.1"
                    />
                  )}

                  {/* Right Y-Axis Label: Lots */}
                  <text
                    x={rightAxisX}
                    y={y + 4}
                    textAnchor="start"
                    className="text-[12px] fill-slate-700 font-semibold"
                  >
                    {tick.lots}
                  </text>
                </g>
              );
            })}

            {/* Bars: Cashback (USD) in light lavender/purple (#C4B5FD) */}
            {DEFAULT_CHART_DATA.map((d) => {
              if (!d.hasData || d.cashback <= 0) return null;

              const centerX = getDayCenterX(d.day);
              const barHeight = (d.cashback / 100) * plotHeight;
              const y = plotBottom - barHeight;

              return (
                <g
                  key={`chart-bar-${d.day}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <rect
                    x={centerX - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill="#C4B5FD"
                    className="transition-opacity hover:opacity-90"
                  />
                </g>
              );
            })}

            {/* Line: Trading Volume (Lots) in vibrant purple (#5945F1) */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#5945F1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Transparent Hitboxes for all 31 days to enable hover tooltips */}
            {DEFAULT_CHART_DATA.map((d) => {
              const centerX = getDayCenterX(d.day);
              return (
                <rect
                  key={`day-hitbox-${d.day}`}
                  x={centerX - daySlotWidth / 2}
                  y={plotTop}
                  width={daySlotWidth}
                  height={plotHeight + 25}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              );
            })}

            {/* X-Axis Days 1 through 31 */}
            {DEFAULT_CHART_DATA.map((d) => {
              const centerX = getDayCenterX(d.day);
              const isHovered = hoveredDay?.day === d.day;

              return (
                <text
                  key={`x-day-${d.day}`}
                  x={centerX}
                  y="280"
                  textAnchor="middle"
                  className={`text-[11px] font-mono transition-colors ${
                    isHovered
                      ? 'fill-[#5945F1] font-bold text-[12px]'
                      : 'fill-slate-500 font-medium'
                  }`}
                >
                  {d.day}
                </text>
              );
            })}
          </svg>
        </div>

        {/* ─── CHART LEGEND (1:1 with image.png) ─── */}
        <div className="flex items-center justify-center gap-6 pt-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-3.5 rounded-[2px] bg-[#C4B5FD]" />
            <span className="text-[13px] text-slate-700 font-normal">Cashback (USD)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-[2.5px] bg-[#5945F1] rounded-full" />
            <span className="text-[13px] text-slate-700 font-normal">Trading Volume (Lots)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
