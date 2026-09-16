import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ScatterPoint {
  id: string;
  name: string;
  symbol: string;
  xVal: number; // percentage (-3% to 9%)
  yVal: number; // percentage (-3% to 9%)
  marketCap: string;
  size: number; // pixel radius
  color: string;
  winRate: string;
}

interface InstrumentScatterViewProps {
  onSelectInstrument?: (symbol: string) => void;
}

export const InstrumentScatterView: React.FC<InstrumentScatterViewProps> = ({
  onSelectInstrument,
}) => {
  const [xAxis, setXAxis] = useState<string>('Change 1D (%)');
  const [yAxis, setYAxis] = useState<string>('Change 1D (%)');
  const [pointSize, setPointSize] = useState<string>('Market cap ($B)');
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  // Exact distribution matching Frame 427322387 (2).png
  const points: ScatterPoint[] = [
    // Negative cluster (pink/rose dots)
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC/USD', xVal: -2.3, yVal: -2.2, marketCap: '$4.08B', size: 8, color: '#EC4899', winRate: '>50%' },
    { id: 'xmr', name: 'Monero', symbol: 'XMR/USD', xVal: -2.0, yVal: -1.9, marketCap: '$2.80B', size: 7, color: '#F43F5E', winRate: '48%' },
    { id: 'ton', name: 'Toncoin', symbol: 'TON/USD', xVal: -1.7, yVal: -1.8, marketCap: '$14.2B', size: 9, color: '#F43F5E', winRate: '>50%' },
    { id: 'avax', name: 'Avalanche', symbol: 'AVAX/USD', xVal: -1.5, yVal: -1.5, marketCap: '$9.56B', size: 10, color: '#E11D48', winRate: '>50%' },
    { id: 'dot', name: 'Polkadot', symbol: 'DOT/USD', xVal: -1.2, yVal: -1.3, marketCap: '$6.20B', size: 7, color: '#DB2777', winRate: '46%' },
    { id: 'pol', name: 'Polygon', symbol: 'POL/USD', xVal: -0.9, yVal: -0.8, marketCap: '$57.8B', size: 12, color: '#C026D3', winRate: '>50%' },
    { id: 'hbar', name: 'Hedera', symbol: 'HBAR/USD', xVal: -0.6, yVal: -0.5, marketCap: '$3.50B', size: 8, color: '#A855F7', winRate: '>50%' },
    { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR/USD', xVal: -0.4, yVal: -0.3, marketCap: '$4.80B', size: 9, color: '#9333EA', winRate: '49%' },

    // Centered around 0% (purple/indigo dots)
    { id: 'link', name: 'Chainlink', symbol: 'LINK/USD', xVal: -0.1, yVal: 0.1, marketCap: '$7.40B', size: 10, color: '#7C3AED', winRate: '>50%' },
    { id: 'ada', name: 'Cardano', symbol: 'ADA/USD', xVal: 0.2, yVal: 0.3, marketCap: '$12.5B', size: 10, color: '#6366F1', winRate: '>50%' },
    { id: 'doge', name: 'Dogecoin', symbol: 'DOGE/USD', xVal: 0.4, yVal: 0.4, marketCap: '$14.2B', size: 9, color: '#5945F1', winRate: '>50%' },
    { id: 'xrp', name: 'Ripple', symbol: 'XRP/USD', xVal: 0.7, yVal: 0.7, marketCap: '$83.88B', size: 12, color: '#4F46E5', winRate: 'Neutral' },
    { id: 'uni', name: 'Uniswap', symbol: 'UNI/USD', xVal: 1.0, yVal: 0.9, marketCap: '$3.71B', size: 8, color: '#4F46E5', winRate: '>50%' },

    // Positive cluster (indigo/blue dots)
    { id: 'sol', name: 'Solana', symbol: 'SOL/USD', xVal: 1.5, yVal: 1.3, marketCap: '$60.3B', size: 10, color: '#4338CA', winRate: '>50%' },
    { id: 'bnb', name: 'Binance Coin', symbol: 'BNB/USD', xVal: 1.8, yVal: 1.4, marketCap: '$84.04B', size: 11, color: '#4338CA', winRate: '>50%' },
    { id: 'aave', name: 'Aave', symbol: 'AAVE/USD', xVal: 2.1, yVal: 1.5, marketCap: '$2.10B', size: 8, color: '#4338CA', winRate: '>50%' },
    { id: 'usdt', name: 'Tether USD', symbol: 'USDT/USD', xVal: 3.2, yVal: 2.0, marketCap: '$118B', size: 11, color: '#3730A3', winRate: '>50%' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH/USD', xVal: 4.6, yVal: 2.4, marketCap: '$297.46B', size: 14, color: '#3730A3', winRate: '>50%' },
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC/USD', xVal: 5.0, yVal: 2.7, marketCap: '$1.54T', size: 20, color: '#3730A3', winRate: '>50%' },
  ];

  // Grid bounds: Y runs from 9% down to -3% (span of 12%)
  // X runs from -3% up to 9% (span of 12%)
  const minRange = -3;
  const maxRange = 9;
  const span = maxRange - minRange; // 12

  const getYPercent = (val: number) => {
    // 9 is at top (0%), -3 is at bottom (100%)
    return ((maxRange - val) / span) * 100;
  };

  const getXPercent = (val: number) => {
    // -3 is at left (0%), 9 is at right (100%)
    return ((val - minRange) / span) * 100;
  };

  const ySteps = [9, 6, 3, 0, -3];
  const xSteps = [-3, 0, 3, 6, 9];

  return (
    <div className="w-full bg-white rounded-2xl border border-[#8B5CF6]/30 p-5 sm:p-7 shadow-2xs space-y-6">
      {/* ─── Top Header Bar: Title + Subtitle + 3 Selects ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 select-none">
            Market Scatter
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare available market metrics with native units
          </p>
        </div>

        {/* 3 Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* X axis */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">X axis</span>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 cursor-pointer shadow-2xs"
            >
              <option value="Change 1D (%)">Change 1D (%)</option>
              <option value="1M Return (%)">1M Return (%)</option>
              <option value="RSI">RSI</option>
              <option value="RoL Volume">RoL Volume</option>
            </select>
          </div>

          {/* Y axis */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Y axis</span>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 cursor-pointer shadow-2xs"
            >
              <option value="Change 1D (%)">Change 1D (%)</option>
              <option value="1M Return (%)">1M Return (%)</option>
              <option value="RSI">RSI</option>
              <option value="RoL Volume">RoL Volume</option>
            </select>
          </div>

          {/* Point size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Point size:</span>
            <select
              value={pointSize}
              onChange={(e) => setPointSize(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40 cursor-pointer shadow-2xs"
            >
              <option value="Market cap ($B)">Market cap ($B)</option>
              <option value="Relative Volume ($B)">Relative Volume ($B)</option>
              <option value="24h Volume ($B)">24h Volume ($B)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Scatter Plot Visual Stage (Exact match to Frame 427322387 (2).png) ─── */}
      <div className="relative w-full pt-4 pb-2 select-none">
        <div className="flex w-full">
          {/* Y Axis Labels Column */}
          <div className="w-10 sm:w-12 shrink-0 flex flex-col justify-between text-right pr-3 sm:pr-4 text-xs font-medium text-slate-700 h-[260px] sm:h-[300px]">
            {ySteps.map((step) => (
              <span key={step} className="leading-none -translate-y-1/2">
                {step}%
              </span>
            ))}
          </div>

          {/* Chart Plot Area */}
          <div className="relative flex-1 h-[260px] sm:h-[300px] border-b border-indigo-200/80">
            {/* Horizontal Dashed Gridlines */}
            {ySteps.map((step) => {
              const topPct = getYPercent(step);
              return (
                <div
                  key={step}
                  className={`absolute left-0 right-0 border-t ${
                    step === 0
                      ? 'border-indigo-300/80'
                      : 'border-dashed border-indigo-200/60'
                  }`}
                  style={{ top: `${topPct}%` }}
                />
              );
            })}

            {/* Plotted Scatter Circles */}
            {points.map((pt) => {
              const xPos = getXPercent(pt.xVal);
              const yPos = getYPercent(pt.yVal);
              const isHovered = hoveredPoint?.id === pt.id;

              return (
                <motion.div
                  key={pt.id}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onSelectInstrument?.(pt.symbol)}
                  whileHover={{ scale: 1.3 }}
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    width: `${pt.size}px`,
                    height: `${pt.size}px`,
                    backgroundColor: pt.color,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-shadow shadow-xs hover:shadow-md hover:ring-3 hover:ring-indigo-300/50 z-20"
                />
              );
            })}

            {/* Hover Tooltip Popup */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    left: `${getXPercent(hoveredPoint.xVal)}%`,
                    top: `${getYPercent(hoveredPoint.yVal)}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-[120%] z-30 pointer-events-none bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl min-w-[130px] border border-slate-700/60"
                >
                  <div className="font-bold text-white flex items-center justify-between gap-2">
                    <span>{hoveredPoint.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {hoveredPoint.symbol}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    Change 1D: {hoveredPoint.xVal >= 0 ? `+${hoveredPoint.xVal}%` : `${hoveredPoint.xVal}%`}
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between gap-2 mt-0.5">
                    <span>Market Cap:</span>
                    <span className="font-bold text-white">{hoveredPoint.marketCap}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* X Axis Labels Row */}
        <div className="flex pl-10 sm:pl-12 w-full justify-between pt-2 text-xs font-medium text-slate-600">
          {xSteps.map((step) => (
            <span key={step} className="text-center w-8 -translate-x-1/2">
              {step}%
            </span>
          ))}
        </div>

        {/* Axis Legend Caption (Exact match to Frame 427322387 (2).png) */}
        <div className="text-center text-xs font-medium text-slate-600 pt-5 select-none flex items-center justify-center gap-6">
          <span>X: Change 1D [%]</span>
          <span>Y: Change 1D [%]</span>
          <span>Size: Market cap [$B]</span>
        </div>
      </div>
    </div>
  );
};
