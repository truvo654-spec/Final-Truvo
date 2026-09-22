import React, { useState } from 'react';
import { MarketSignal } from '../types';
import { Sparkles, Lock, ArrowUpRight, ArrowDownRight, Compass, ShieldAlert } from 'lucide-react';

interface SignalsListProps {
  signals: MarketSignal[];
  isLoggedIn?: boolean;
  onSelectSignal: (signal: MarketSignal) => void;
  onUpgradePrompt: () => void;
  onLeadToVisitorPage?: () => void;
}

export const SignalsList: React.FC<SignalsListProps> = ({
  signals,
  isLoggedIn = true,
  onSelectSignal,
  onUpgradePrompt,
  onLeadToVisitorPage,
}) => {
  const [filterClass, setFilterClass] = useState<string>('All');

  const assetClasses = ['All', 'Forex', 'Crypto', 'Commodity', 'Indices'];

  const filteredSignals = signals.filter(
    (s) => filterClass === 'All' || s.assetClass === filterClass
  );

  return (
    <div
      id="market-signals-section"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e2e8f0] shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header with Title & Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#0b1c30] tracking-tight">
                Most Recent Signals
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c6f831] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803d]"></span>
              </span>
            </div>
            <p className="text-xs text-[#474556] mt-0.5">
              Institutional quantitative setup stream with automated risk/reward ratios
            </p>
          </div>

          {/* Filter Chips */}
          <div className="p-1 rounded-lg bg-[#f1f5f9] flex items-center gap-1 border border-slate-200 overflow-x-auto self-start sm:self-auto">
            {assetClasses.map((ac) => (
              <button
                key={ac}
                onClick={() => setFilterClass(ac)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  filterClass === ac
                    ? 'bg-white text-[#5338ec] font-bold shadow-xs'
                    : 'text-[#474556] hover:text-[#0b1c30]'
                }`}
              >
                {ac}
              </button>
            ))}
          </div>
        </div>

        {/* Signals Table / Row List */}
        <div className="divide-y divide-[#f1f5f9] overflow-x-auto">
          {filteredSignals.map((signal) => {
            const isPositive = signal.change24h >= 0;
            const minSpark = Math.min(...signal.sparkline);
            const maxSpark = Math.max(...signal.sparkline);
            const sparkRange = maxSpark - minSpark || 1;

            // Generate sparkline SVG path
            const sparkWidth = 72;
            const sparkHeight = 22;
            const sparkPoints = signal.sparkline.map((val, idx) => {
              const x = (idx / (signal.sparkline.length - 1)) * sparkWidth;
              const y = sparkHeight - ((val - minSpark) / sparkRange) * (sparkHeight - 4) - 2;
              return `${x},${y}`;
            });
            const sparkD = `M ${sparkPoints.join(' L ')}`;

            return (
              <div
                key={signal.id}
                className="py-3.5 px-2 hover:bg-[#f8fafc] rounded-xl transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                onClick={() => {
                  if (!isLoggedIn && onLeadToVisitorPage) {
                    onLeadToVisitorPage();
                  } else if (signal.action === 'UPGRADE') {
                    onUpgradePrompt();
                  } else {
                    onSelectSignal(signal);
                  }
                }}
              >
                {/* Asset Flag + Ticker Symbol + Name */}
                <div className="flex items-center gap-3 min-w-[150px]">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                    {signal.flag}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-[#0b1c30] group-hover:text-[#5338ec] transition-colors">
                        {signal.ticker}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {signal.timeframe}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#474556] truncate max-w-[110px] sm:max-w-none">
                      {signal.name}
                    </div>
                  </div>
                </div>

                {/* Price & Directional Delta */}
                <div className="text-right min-w-[90px]">
                  <div className="text-xs font-bold text-[#0b1c30] tabular-nums">
                    {signal.price > 100 ? signal.price.toFixed(2) : signal.price.toFixed(4)}
                  </div>
                  <div
                    className={`text-[11px] font-semibold tabular-nums flex items-center justify-end gap-0.5 ${
                      isPositive ? 'text-[#15803d]' : 'text-slate-500'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 text-[#15803d]" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-slate-500" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {signal.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Embedded SVG Sparkline */}
                <div className="hidden sm:block w-[72px] h-[22px] shrink-0">
                  <svg width={sparkWidth} height={sparkHeight} className="overflow-visible">
                    <path
                      d={sparkD}
                      fill="none"
                      stroke={
                        signal.action === 'BUY'
                          ? '#15803d'
                          : signal.action === 'UPGRADE'
                          ? '#db2777'
                          : '#5338ec'
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Confidence Badge */}
                <div className="hidden md:block text-right min-w-[65px]">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Conf.</span>
                  <span className="text-xs font-bold text-[#0b1c30] tabular-nums">
                    {signal.confidence}%
                  </span>
                </div>

                {/* Right-Aligned Action Buttons */}
                <div className="shrink-0">
                  {signal.action === 'BUY' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn && onLeadToVisitorPage) {
                          onLeadToVisitorPage();
                        } else {
                          onSelectSignal(signal);
                        }
                      }}
                      className="h-[28px] px-3.5 rounded-full bg-[#c6f831] hover:bg-[#b5e723] text-[#0f172a] font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                    >
                      <span>Buy</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {signal.action === 'SELL' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggedIn && onLeadToVisitorPage) {
                          onLeadToVisitorPage();
                        } else {
                          onSelectSignal(signal);
                        }
                      }}
                      className="h-[28px] px-3.5 rounded-full bg-[#5338ec] hover:bg-[#4338ca] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                    >
                      <span>Sell</span>
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {signal.action === 'UPGRADE' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgradePrompt();
                      }}
                      className="h-[28px] px-3 rounded-full border border-[#fbcfe8] bg-[#fdf2f8] hover:bg-[#fce7f3] text-[#db2777] font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 whitespace-nowrap"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Upgrade</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom helper tip */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#474556]">
        <span>Click any signal row to reveal entry, TP1/TP2, and invalidation stop loss.</span>
        <button
          onClick={() => {
            if (!isLoggedIn && onLeadToVisitorPage) {
              onLeadToVisitorPage();
            } else {
              onSelectSignal(signals[0]);
            }
          }}
          className="font-bold text-[#5338ec] hover:underline"
        >
          View Setup Details
        </button>
      </div>
    </div>
  );
};
