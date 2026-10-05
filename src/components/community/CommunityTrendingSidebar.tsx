import React, { useMemo, useState } from 'react';
import { instruments } from '../analysis/detail/mockMarket';

type ViewMode = 'trending' | 'gainers';
type Period = '1D' | '1W' | '1M' | '1Y';

const PERIODS: Period[] = ['1D', '1W', '1M', '1Y'];

const ICON_COLORS = ['#F7931A', '#627EEA', '#8247E5', '#00FFA3', '#F3BA2F', '#23292F', '#E6007A', '#2775CA'];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}T`;
  return `$${marketCap.toFixed(1)}B`;
}

export const CommunityTrendingSidebar: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('trending');
  const [period, setPeriod] = useState<Period>('1D');

  const tokens = useMemo(() => {
    const crypto = instruments.filter((i) => i.market === 'Crypto');
    const withPeriodChange = crypto.map((i, idx) => {
      const periodChange =
        period === '1D' ? i.change : period === '1W' ? i.change * 1.8 : period === '1M' ? i.return1m : i.return1m * 7.4;
      return { ...i, periodChange, idx };
    });
    const sorted =
      mode === 'gainers'
        ? [...withPeriodChange].sort((a, b) => b.periodChange - a.periodChange)
        : [...withPeriodChange].sort((a, b) => b.marketCap - a.marketCap);
    return sorted.slice(0, 10);
  }, [mode, period]);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs w-full">
      <p className="text-sm font-bold text-[#0b1c30] mb-3">Showing Posts of:</p>

      <div className="flex items-center gap-1 bg-[#f8fafc] rounded-full p-1 mb-4">
        <button
          onClick={() => setMode('trending')}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
            mode === 'trending' ? 'bg-white text-[#5338ec] shadow-xs' : 'text-[#474556] hover:text-[#0b1c30]'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setMode('gainers')}
          className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${
            mode === 'gainers' ? 'bg-white text-[#5338ec] shadow-xs' : 'text-[#474556] hover:text-[#0b1c30]'
          }`}
        >
          Top Gainers
        </button>
      </div>

      <div className="mb-4">
        <p className="text-[11px] font-semibold text-[#94a3b8] mb-1.5">Period</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                period === p ? 'bg-[#5338ec] text-white' : 'bg-slate-100 text-[#474556] hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-[#94a3b8] pb-2 border-b border-[#f1f5f9]">
        <span># Token / Price</span>
        <span>MC / Chg</span>
      </div>

      <div className="divide-y divide-[#f1f5f9] max-h-[420px] overflow-y-auto">
        {tokens.map((t, i) => (
          <div key={t.symbol} className="flex items-center justify-between py-2.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono text-[#94a3b8] w-4 shrink-0">{i + 1}</span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: ICON_COLORS[t.idx % ICON_COLORS.length] }}
              >
                {t.symbol.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0b1c30] truncate">{t.symbol}</p>
                <p className="text-[11px] text-[#474556] font-mono">{formatPrice(t.price)}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-[#94a3b8] font-mono">{formatMarketCap(t.marketCap)}</p>
              <p className={`text-[11px] font-bold font-mono ${t.periodChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.periodChange >= 0 ? '+' : ''}
                {t.periodChange.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
