import React from 'react';
import { ArrowRight, Clock, Hourglass, Diamond } from 'lucide-react';
import { MarketSignal } from '../../types';

interface TodaysMarketOpportunitiesProps {
  signals?: MarketSignal[];
  onSelectSignal?: (signal: MarketSignal) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const TodaysMarketOpportunities: React.FC<TodaysMarketOpportunitiesProps> = ({
  signals = [],
  onSelectSignal,
  onNavigateToTab,
}) => {
  const handleSelect = (ticker: string) => {
    if (!onSelectSignal) return;
    const sig = signals.find((s) => s.ticker === ticker) || signals[0];
    if (sig) {
      onSelectSignal(sig);
    }
  };

  return (
    <div className="bg-[#5945F1] rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4.5">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg sm:text-xl font-black tracking-tight">
          <span className="text-[#DCF73B]">Today's</span>{' '}
          <span className="text-white">Market</span>{' '}
          <span className="text-[#DCF73B]">Opportunities</span>
          <span className="text-[#FD02B0]">.</span>
        </h3>
        <p className="text-xs text-white/90 leading-relaxed max-w-sm mx-auto">
          If you're planning your next move, start with these opportunities.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: USD/CAD */}
        <div
          onClick={() => handleSelect('USD/CAD')}
          className="p-3.5 rounded-2xl bg-white text-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
        >
          <div className="space-y-2">
            {/* Header: Flags & Ticker */}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1 items-center">
                <span className="text-base leading-none">🇺🇸</span>
                <span className="text-base leading-none">🇨🇦</span>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">USD/CAD</span>
            </div>

            {/* Target, Entry, Stop + Confidence */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="space-y-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-slate-400">Target</span>
                  <span className="blur-[3px] select-none text-slate-400 font-mono">1.3850</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-slate-400">Entry</span>
                  <span className="blur-[3px] select-none text-slate-400 font-mono">1.3810</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-slate-400">Stop</span>
                  <span className="blur-[3px] select-none text-slate-400 font-mono">1.3780</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-[#5945F1] leading-none">99%</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Confidence</div>
              </div>
            </div>

            {/* Risk/Reward Divider */}
            <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
              <span>Risk/Reward</span>
              <span className="font-bold text-slate-800">1:1.8</span>
            </div>
          </div>

          {/* Level 4 Badge */}
          <div className="pt-2 flex justify-center items-center gap-1 text-xs font-semibold text-[#5945F1]">
            <Diamond className="w-3.5 h-3.5 text-[#5945F1] stroke-[2.2]" />
            <span>Level 4</span>
          </div>
        </div>

        {/* Card 2: GBP/USD */}
        <div
          onClick={() => handleSelect('GBP/USD')}
          className="p-3.5 rounded-2xl bg-white text-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2"
        >
          <div className="space-y-2">
            {/* Header: Flags & Ticker */}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1 items-center">
                <span className="text-base leading-none">🇬🇧</span>
                <span className="text-base leading-none">🇺🇸</span>
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">GBP/USD</span>
            </div>

            {/* Target, Entry, Stop + Confidence */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="space-y-0.5 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-slate-400">Target</span>
                  <span className="font-semibold text-slate-800 font-mono">1.2875</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-slate-400">Entry</span>
                  <span className="font-semibold text-slate-800 font-mono">1.2838</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-slate-400">Stop</span>
                  <span className="font-semibold text-slate-800 font-mono">1.2795</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-[#5945F1] leading-none">73%</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Confidence</div>
              </div>
            </div>

            {/* Risk/Reward Divider */}
            <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
              <span>Risk/Reward</span>
              <span className="font-bold text-slate-800">1:1.7</span>
            </div>
          </div>

          {/* Time & Buy Button */}
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium px-0.5">
              <span className="text-[#5945F1] flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> 30m period
              </span>
              <span className="text-emerald-600 flex items-center gap-0.5">
                <Hourglass className="w-3 h-3" /> valid for 12m
              </span>
            </div>
            <button
              type="button"
              className="w-full py-1.5 px-3 rounded-xl bg-[#DCF73B] hover:bg-[#cbe527] text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              Buy <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Explore Signals Button */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => onNavigateToTab?.('signals')}
          className="py-2 px-6 rounded-lg bg-white hover:bg-slate-50 text-[#5945F1] font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          Explore Signals
        </button>
      </div>
    </div>
  );
};
