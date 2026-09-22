import React, { useState } from 'react';
import { BarChart3, ArrowRight } from 'lucide-react';

export interface PerformanceComboChartProps {
  totalCashback?: string;
  lotsTraded?: string | number;
  avgCashbackPerLot?: string;
  bestDay?: string;
  className?: string;
  isDemoActive?: boolean;
  timeframe?: '1D' | '1W' | '1M' | 'All';
  isEmpty?: boolean;
  isFirstTrade?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateCtaText?: string;
  onEmptyStateCtaClick?: () => void;
}

interface ChartPoint {
  label: string; // "1", "2" or "Mon" or "Jan"
  fullLabel: string; // "March 10, 2026"
  cashback: number; // in USD
  lots: number; // in lots
  hasData: boolean;
}

// 31-day data for 1M timeframe filling the full width (Day 1 through Day 31)
const MONTH_DATA: ChartPoint[] = [
  { label: '1', fullLabel: 'March 1, 2026', cashback: 22.0, lots: 2.3, hasData: true },
  { label: '2', fullLabel: 'March 2, 2026', cashback: 23.5, lots: 2.8, hasData: true },
  { label: '3', fullLabel: 'March 3, 2026', cashback: 36.5, lots: 3.8, hasData: true },
  { label: '4', fullLabel: 'March 4, 2026', cashback: 37.0, lots: 3.7, hasData: true },
  { label: '5', fullLabel: 'March 5, 2026', cashback: 35.0, lots: 2.6, hasData: true },
  { label: '6', fullLabel: 'March 6, 2026', cashback: 30.0, lots: 2.3, hasData: true },
  { label: '7', fullLabel: 'March 7, 2026', cashback: 22.5, lots: 2.0, hasData: true },
  { label: '8', fullLabel: 'March 8, 2026', cashback: 22.0, lots: 2.2, hasData: true },
  { label: '9', fullLabel: 'March 9, 2026', cashback: 30.0, lots: 3.2, hasData: true },
  { label: '10', fullLabel: 'March 10, 2026', cashback: 42.0, lots: 3.8, hasData: true },
  { label: '11', fullLabel: 'March 11, 2026', cashback: 54.0, lots: 4.6, hasData: true },
  { label: '12', fullLabel: 'March 12, 2026', cashback: 56.0, lots: 3.5, hasData: true },
  { label: '13', fullLabel: 'March 13, 2026', cashback: 30.0, lots: 1.5, hasData: true },
  { label: '14', fullLabel: 'March 14, 2026', cashback: 6.0, lots: 0.6, hasData: true },
  { label: '15', fullLabel: 'March 15, 2026', cashback: 42.0, lots: 4.0, hasData: true },
  { label: '16', fullLabel: 'March 16, 2026', cashback: 48.0, lots: 4.5, hasData: true },
  { label: '17', fullLabel: 'March 17, 2026', cashback: 58.5, lots: 5.2, hasData: true },
  { label: '18', fullLabel: 'March 18, 2026', cashback: 64.0, lots: 5.8, hasData: true },
  { label: '19', fullLabel: 'March 19, 2026', cashback: 55.0, lots: 4.9, hasData: true },
  { label: '20', fullLabel: 'March 20, 2026', cashback: 46.0, lots: 4.2, hasData: true },
  { label: '21', fullLabel: 'March 21, 2026', cashback: 8.0, lots: 0.8, hasData: true },
  { label: '22', fullLabel: 'March 22, 2026', cashback: 12.0, lots: 1.2, hasData: true },
  { label: '23', fullLabel: 'March 23, 2026', cashback: 48.0, lots: 4.4, hasData: true },
  { label: '24', fullLabel: 'March 24, 2026', cashback: 62.0, lots: 5.3, hasData: true },
  { label: '25', fullLabel: 'March 25, 2026', cashback: 72.0, lots: 6.2, hasData: true },
  { label: '26', fullLabel: 'March 26, 2026', cashback: 66.0, lots: 5.7, hasData: true },
  { label: '27', fullLabel: 'March 27, 2026', cashback: 78.0, lots: 6.9, hasData: true },
  { label: '28', fullLabel: 'March 28, 2026', cashback: 10.0, lots: 1.0, hasData: true },
  { label: '29', fullLabel: 'March 29, 2026', cashback: 16.0, lots: 1.6, hasData: true },
  { label: '30', fullLabel: 'March 30, 2026', cashback: 68.0, lots: 6.0, hasData: true },
  { label: '31', fullLabel: 'March 31, 2026', cashback: 82.0, lots: 7.2, hasData: true },
];

const WEEK_DATA: ChartPoint[] = [
  { label: 'Mon', fullLabel: 'Monday, March 9', cashback: 30.0, lots: 3.2, hasData: true },
  { label: 'Tue', fullLabel: 'Tuesday, March 10', cashback: 42.0, lots: 3.8, hasData: true },
  { label: 'Wed', fullLabel: 'Wednesday, March 11', cashback: 54.0, lots: 4.6, hasData: true },
  { label: 'Thu', fullLabel: 'Thursday, March 12', cashback: 56.0, lots: 3.5, hasData: true },
  { label: 'Fri', fullLabel: 'Friday, March 13', cashback: 30.0, lots: 1.5, hasData: true },
  { label: 'Sat', fullLabel: 'Saturday, March 14', cashback: 6.0, lots: 0.6, hasData: true },
  { label: 'Sun', fullLabel: 'Sunday, March 15', cashback: 42.0, lots: 4.0, hasData: true },
];

const DAY_DATA: ChartPoint[] = [
  { label: '00:00', fullLabel: '00:00 UTC', cashback: 4.0, lots: 0.4, hasData: true },
  { label: '04:00', fullLabel: '04:00 UTC', cashback: 12.0, lots: 1.1, hasData: true },
  { label: '08:00', fullLabel: '08:00 London Open', cashback: 45.0, lots: 4.2, hasData: true },
  { label: '12:00', fullLabel: '12:00 UTC', cashback: 32.0, lots: 2.8, hasData: true },
  { label: '14:30', fullLabel: '14:30 NY Open', cashback: 76.0, lots: 6.8, hasData: true },
  { label: '18:00', fullLabel: '18:00 UTC', cashback: 48.0, lots: 4.0, hasData: true },
  { label: '22:00', fullLabel: '22:00 Close', cashback: 18.0, lots: 1.5, hasData: true },
];

const ALL_DATA: ChartPoint[] = [
  { label: 'Jan', fullLabel: 'January 2026', cashback: 420.0, lots: 38.0, hasData: true },
  { label: 'Feb', fullLabel: 'February 2026', cashback: 680.0, lots: 56.0, hasData: true },
  { label: 'Mar', fullLabel: 'March 2026', cashback: 1248.0, lots: 112.4, hasData: true },
  { label: 'Apr', fullLabel: 'April 2026 (Est)', cashback: 850.0, lots: 75.0, hasData: true },
  { label: 'May', fullLabel: 'May 2026 (Est)', cashback: 920.0, lots: 80.0, hasData: true },
  { label: 'Jun', fullLabel: 'June 2026 (Est)', cashback: 1040.0, lots: 92.0, hasData: true },
  { label: 'Jul', fullLabel: 'July 2026 (Est)', cashback: 1100.0, lots: 98.0, hasData: true },
  { label: 'Aug', fullLabel: 'August 2026 (Est)', cashback: 950.0, lots: 84.0, hasData: true },
  { label: 'Sep', fullLabel: 'September 2026 (Est)', cashback: 1180.0, lots: 105.0, hasData: true },
  { label: 'Oct', fullLabel: 'October 2026 (Est)', cashback: 1250.0, lots: 110.0, hasData: true },
  { label: 'Nov', fullLabel: 'November 2026 (Est)', cashback: 1320.0, lots: 118.0, hasData: true },
  { label: 'Dec', fullLabel: 'December 2026 (Est)', cashback: 1450.0, lots: 130.0, hasData: true },
];

/**
 * Helper to compute continuous, smooth cubic Bézier spline across coordinate points
 */
function getSplinePath(points: { x: number; y: number }[], tension = 0.32): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export const PerformanceComboChart: React.FC<PerformanceComboChartProps> = ({
  totalCashback = '$0.00',
  lotsTraded = '0',
  avgCashbackPerLot = '$0.00',
  bestDay = '$0.00',
  className = '',
  timeframe = '1M',
  isEmpty = false,
  isFirstTrade = false,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateCtaText,
  onEmptyStateCtaClick,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  // Pick dataset based on timeframe and state
  const baseData: ChartPoint[] =
    timeframe === '1D'
      ? DAY_DATA
      : timeframe === '1W'
      ? WEEK_DATA
      : timeframe === 'All'
      ? ALL_DATA
      : MONTH_DATA;

  const currentData: ChartPoint[] = isEmpty
    ? baseData.map((p) => ({
        ...p,
        cashback: 0,
        lots: 0,
        hasData: false,
      }))
    : isFirstTrade
    ? baseData.map((p, idx) => ({
        ...p,
        cashback: idx === 0 ? 8.0 : 0,
        lots: idx === 0 ? 1.6 : 0,
        hasData: idx === 0,
      }))
    : baseData;

  // SVG Geometry - 1000px wide for high precision, balanced 340px height for harmonious ratio
  const leftAxisX = 48;
  const rightAxisX = 952;
  const plotLeft = 56;
  const plotRight = 944;
  const plotWidth = plotRight - plotLeft; // 888px
  const plotTop = 24;
  const plotBottom = 265;
  const plotHeight = plotBottom - plotTop; // 241px

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
    // For 'All' timeframe, scale is higher (max 1500 USD, 150 lots)
    const maxVal = timeframe === 'All' ? 1500 : 100;
    const clamped = Math.min(maxVal, Math.max(0, val));
    return plotBottom - (clamped / maxVal) * plotHeight;
  };

  const totalPoints = currentData.length;
  const slotWidth = plotWidth / totalPoints;

  const getPointCenterX = (index: number) => {
    return plotLeft + (index + 0.5) * slotWidth;
  };

  // Full-width points spanning all items in currentData
  const cashbackPoints = currentData.map((d, i) => ({
    x: getPointCenterX(i),
    y: getY(d.cashback),
  }));

  // Volume scale: 10 lots = 100 on normal, 150 lots = 1500 on All
  const volumePoints = currentData.map((d, i) => ({
    x: getPointCenterX(i),
    y: getY(timeframe === 'All' ? d.lots * 10 : d.lots * 10),
  }));

  // Build the continuous splines spanning the entire width
  const cashbackSpline = getSplinePath(cashbackPoints, 0.3);
  const volumeSpline = getSplinePath(volumePoints, 0.32);

  // Build the closed area path for the lime gradient fill across the entire chart
  const firstPt = cashbackPoints[0];
  const lastPt = cashbackPoints[cashbackPoints.length - 1];
  const cashbackAreaPath = `${cashbackSpline} L ${lastPt.x.toFixed(2)} ${plotBottom.toFixed(2)} L ${firstPt.x.toFixed(2)} ${plotBottom.toFixed(2)} Z`;

  return (
    <div id="dashboard-performance-chart-card" className={`w-full space-y-4 ${className}`}>
      {/* ─── TOP KPI SUMMARY ROW (Matching Image 1 & Design Specs) ─── */}
      <div className="pt-2 pb-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left">
          {/* Col 1: Total Cashback */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-medium text-slate-600 tracking-normal">
              Total Cashback ({timeframe})
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-tight">
              {totalCashback}
            </div>
          </div>

          {/* Col 2: Lots Traded */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-medium text-slate-600 tracking-normal">
              Lots Traded
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-tight">
              {lotsTraded}
            </div>
          </div>

          {/* Col 3: Avg Cashback / Lot */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-medium text-slate-600 tracking-normal">
              Avg Cashback / Lot
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-tight">
              {avgCashbackPerLot}
            </div>
          </div>

          {/* Col 4: Best Day */}
          <div className="space-y-1">
            <div className="text-xs sm:text-[13px] font-medium text-slate-600 tracking-normal">
              Best Day
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono leading-tight">
              {bestDay}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DUAL AXIS COMBO CHART (Full-Width, Balanced & Seamless) ─── */}
      <div className="w-full relative select-none min-h-[280px]">
        {/* Empty State Overlay with Background Blur (1:1 with User Image 1) */}
        {isEmpty && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 max-w-[420px] w-full text-center flex flex-col items-center animate-in zoom-in-95 duration-150">
              {/* Rounded soft indigo icon container */}
              <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] text-[#5240F2] flex items-center justify-center mb-4 shadow-2xs">
                <BarChart3 className="w-7 h-7 stroke-[2]" />
              </div>

              {/* Title */}
              <h4 className="font-display font-extrabold text-lg sm:text-xl text-[#0b1c30] tracking-tight">
                {emptyStateTitle || 'No Performance Recorded Yet'}
              </h4>

              {/* Subtitle / Description */}
              <p className="text-xs sm:text-[13px] text-slate-500 mt-2 mb-6 leading-relaxed max-w-[320px]">
                {emptyStateDescription ||
                  'Connect a broker and place your first trade to plot daily cashback earnings and volume in real time.'}
              </p>

              {/* Primary Action Button */}
              {emptyStateCtaText && onEmptyStateCtaClick && (
                <button
                  type="button"
                  onClick={onEmptyStateCtaClick}
                  className="px-6 py-2.5 rounded-xl bg-[#5240F2] hover:bg-[#4335C4] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>{emptyStateCtaText}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hover Tooltip Overlay */}
        {!isEmpty && hoveredPoint && (
          <div
            className="absolute pointer-events-none z-20 bg-[#0b1c30] text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl border border-slate-700 transition-all duration-75"
            style={{
              left: `${(
                (getPointCenterX(currentData.findIndex((p) => p.label === hoveredPoint.label)) /
                  1000) *
                100
              ).toFixed(1)}%`,
              top: '8px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-slate-300">{hoveredPoint.fullLabel}</div>
            <div className="text-[#CAEB0E] font-semibold">
              Cashback: ${hoveredPoint.cashback.toFixed(2)}
            </div>
            <div className="text-[#FD02B0] font-medium">
              Volume: {hoveredPoint.lots.toFixed(2)} Lots
            </div>
          </div>
        )}

        {/* Responsive Full-Width SVG with gentle background blur when isEmpty */}
        <div className={`w-full transition-all duration-300 ${isEmpty ? 'filter blur-[1.2px] opacity-90 select-none pointer-events-none' : ''}`}>
          <svg
            viewBox="0 0 1000 330"
            className="w-full h-auto overflow-visible"
          >
            <defs>
              {/* Soft lime area gradient matching design */}
              <linearGradient id="cashbackAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BEF226" stopOpacity="0.45" />
                <stop offset="65%" stopColor="#BEF226" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#BEF226" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Dashed Gridlines & Dual Y-Axis Labels */}
            {yTicks.map((tick) => {
              const y = getY(timeframe === 'All' ? tick.val * 15 : tick.val);
              const isBaseline = tick.val === 0;

              return (
                <g key={`ytick-${tick.val}`}>
                  {/* Left Y-Axis Label: USD ($100 down to $0) */}
                  <text
                    x={leftAxisX}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] fill-slate-500 font-medium font-mono"
                  >
                    {timeframe === 'All' ? `$${tick.val * 15}` : tick.usd}
                  </text>

                  {/* Horizontal Gridline: Dashed for 10..100, Solid for Baseline $0 */}
                  {isBaseline ? (
                    <line
                      x1={plotLeft}
                      y1={y}
                      x2={plotRight}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />
                  ) : (
                    <line
                      x1={plotLeft}
                      y1={y}
                      x2={plotRight}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      strokeWidth="1.1"
                    />
                  )}

                  {/* Right Y-Axis Label: Lots (10 lots down to 0 lots) */}
                  <text
                    x={rightAxisX}
                    y={y + 4}
                    textAnchor="start"
                    className="text-[11px] fill-slate-500 font-medium font-mono"
                  >
                    {timeframe === 'All' ? `${(tick.val * 1.5).toFixed(0)} lots` : tick.lots}
                  </text>
                </g>
              );
            })}

            {/* 1. Lime-Green Area Fill for Cashback (USD) - Only rendered when not empty */}
            {!isEmpty && (
              <path
                d={cashbackAreaPath}
                fill="url(#cashbackAreaGrad)"
              />
            )}

            {/* 2. Lime-Green Smooth Spline Stroke for Cashback (USD) - Only rendered when not empty */}
            {!isEmpty && (
              <path
                d={cashbackSpline}
                fill="none"
                stroke="#A3E635"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* 3. Vibrant Hot-Pink / Magenta Line Spline for Trading Volume (Lots) */}
            {/* When empty, draws horizontal baseline across full width matching Image 1 */}
            <path
              d={isEmpty ? `M ${plotLeft} ${plotBottom} L ${plotRight} ${plotBottom}` : volumeSpline}
              fill="none"
              stroke="#FD02B0"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Live real-time pulsing beacons on latest data points */}
            {!isEmpty && cashbackPoints.length > 0 && (
              <g className="pointer-events-none">
                {/* Lime beacon on Cashback latest point */}
                {(() => {
                  const pt = cashbackPoints[cashbackPoints.length - 1];
                  return (
                    <g key="cashback-latest-beacon">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="8"
                        fill="#BEF226"
                        className="animate-ping opacity-50 origin-center"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#A3E635"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })()}

                {/* Hot pink beacon on Volume latest point */}
                {(() => {
                  const pt = volumePoints[volumePoints.length - 1];
                  return (
                    <g key="volume-latest-beacon">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="7"
                        fill="#FD02B0"
                        className="animate-ping opacity-50 origin-center"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#FD02B0"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                      />
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Transparent Hitboxes for all points to enable hover tooltips */}
            {!isEmpty &&
              currentData.map((d, idx) => {
                const centerX = getPointCenterX(idx);
                return (
                  <rect
                    key={`point-hitbox-${d.label}-${idx}`}
                    x={centerX - slotWidth / 2}
                    y={plotTop}
                    width={slotWidth}
                    height={plotHeight + 35}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(d)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

            {/* X-Axis Points (Days 1..31 or Mon..Sun or Jan..Dec) */}
            {currentData.map((d, idx) => {
              const centerX = getPointCenterX(idx);
              const isHovered = hoveredPoint?.label === d.label;

              return (
                <text
                  key={`x-point-${d.label}-${idx}`}
                  x={centerX}
                  y="292"
                  textAnchor="middle"
                  className={`text-[11px] font-mono transition-colors ${
                    isHovered
                      ? 'fill-[#0b1c30] font-black text-[12px]'
                      : 'fill-slate-500 font-medium'
                  }`}
                >
                  {d.label}
                </text>
              );
            })}
          </svg>

          {/* ─── CHART LEGEND (Matching Image 1) ─── */}
          <div className="flex items-center justify-center gap-7 pt-2 text-xs font-normal text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-4 h-2.5 rounded-[2px] bg-[#BEF226] border border-[#a3e635]/60" />
              <span className="text-[12px] sm:text-[13px] text-slate-700 font-medium">Cashback (USD)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-[2.5px] rounded-full bg-[#FD02B0]" />
              <span className="text-[12px] sm:text-[13px] text-slate-700 font-medium">Trading Volume (Lots)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
