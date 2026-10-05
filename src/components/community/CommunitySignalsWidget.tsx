import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { MarketSignal } from '../../types';
import { INITIAL_SIGNALS } from '../../data/mockData';

interface CommunitySignalsWidgetProps {
  onSelectSignal?: (signal: MarketSignal) => void;
  onNavigateToTab?: (tab: string) => void;
  onUpgradePrompt?: () => void;
}

const MiniSparkline: React.FC<{ points: number[]; positive: boolean }> = ({ points, positive }) => {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 56;
  const h = 20;
  const step = w / (points.length - 1);
  const pts = points.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-14 h-5 shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? '#16a34a' : '#5945F1'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const CommunitySignalsWidget: React.FC<CommunitySignalsWidgetProps> = ({
  onSelectSignal,
  onNavigateToTab,
  onUpgradePrompt,
}) => {
  const featured = INITIAL_SIGNALS.slice(0, 5);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
          Most Recent <span className="text-[#5945F1]">Signals.</span>
        </h3>
        <button
          onClick={() => onNavigateToTab?.('signals')}
          className="flex items-center gap-0.5 text-xs font-bold text-[#5945F1] hover:underline shrink-0"
        >
          More <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-[#94a3b8] font-medium mb-3">View most recent signals for your trading</p>

      <div className="space-y-2">
        {featured.map((sig, idx) => {
          const isPremium = idx === 3; // demo: 4th row gated, mirrors reference's BTC/USD lock
          const isPositive = sig.change24h >= 0;
          return (
            <div
              key={sig.id}
              onClick={() => !isPremium && onSelectSignal?.(sig)}
              className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{sig.flag.split('/')[0]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0b1c30] truncate">{sig.ticker}</p>
                  {isPremium ? (
                    <p className="flex items-center gap-1 text-[10px] font-semibold text-[#FD02B0]">
                      <Lock className="w-2.5 h-2.5" /> Premium Signal
                    </p>
                  ) : (
                    <p className={`text-xs font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {isPositive ? '+' : ''}
                      {sig.change24h.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isPremium && <MiniSparkline points={sig.sparkline} positive={isPositive} />}
                {isPremium ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpgradePrompt?.();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#FD02B0] text-[#FD02B0] text-xs font-bold hover:bg-pink-50 transition-colors"
                  >
                    Upgrade
                  </button>
                ) : (
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      sig.action === 'BUY' ? 'bg-[#CAEB0E] text-slate-950' : 'bg-[#5945F1] text-white'
                    }`}
                  >
                    {sig.action === 'BUY' ? 'Buy' : 'Sell'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
