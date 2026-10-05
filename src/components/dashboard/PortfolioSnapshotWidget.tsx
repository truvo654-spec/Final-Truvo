import React, { useMemo, useState } from 'react';
import { MarketSignal } from '../../types';
import { ACCOUNT_SERIES, PORTFOLIO_ACCOUNTS, PORTFOLIO_TRADES } from '../../data/portfolioData';
import { COURSES } from '../../data/educationData';
import { COMMUNITY_TOPICS } from '../../data/communityData';
import { totalSeries, tradeStats, tradesInRange, isClosed, sliceSeries } from '../portfolio/portfolioMath';
import { Sparkline } from '../portfolio/PortfolioCharts';
import { FEATURE_FLAGS } from '../../config/featureFlags';

type Mode = 'portfolio' | 'learn' | 'signals' | 'discuss';

interface PortfolioSnapshotWidgetProps {
  size: 1 | 2 | 3;
  signals: MarketSignal[];
  onNavigateToTab: (tab: string) => void;
  onSelectSignal: (signal: MarketSignal) => void;
}

const money = (n: number, d = 0) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;

const MODES: { id: Mode; label: string }[] = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'learn', label: 'Learn' },
  { id: 'signals', label: 'Signals' },
  { id: 'discuss', label: 'Discuss' },
];

export const PortfolioSnapshotWidget: React.FC<PortfolioSnapshotWidgetProps> = ({ size, signals, onNavigateToTab, onSelectSignal }) => {
  const [mode, setMode] = useState<Mode>('portfolio');

  const data = useMemo(() => {
    const series = sliceSeries(totalSeries([]), 30, 30);
    const last = series[series.length - 1].value;
    const first = series[0].value;
    const window = tradesInRange(PORTFOLIO_TRADES, 30);
    const s = tradeStats(window);
    const open = PORTFOLIO_TRADES.filter((t) => !isClosed(t));
    const marginUsed = PORTFOLIO_ACCOUNTS.reduce((a, c) => a + c.marginUsed, 0);
    return {
      values: series.map((p) => p.value),
      last,
      change: last - first,
      pct: ((last - first) / first) * 100,
      realized: s.realized,
      unrealized: open.reduce((a, t) => a + t.pnl, 0),
      winRate: s.winRate,
      openCount: open.length,
      usage: Math.min(100, (marginUsed / last) * 100),
    };
  }, []);
  void ACCOUNT_SERIES;

  const wide = size > 1;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] h-full flex flex-col overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
          Portfolio<span className="text-[#FD02B0]">.</span>
        </h3>
        <div className="inline-flex items-center gap-0.5 bg-[#f1f5f9] rounded-full p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                mode === m.id ? 'bg-white text-[#5338ec] shadow-xs' : 'text-[#474556] hover:text-[#0b1c30]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-4 flex-1 min-h-[210px]">
        {mode === 'portfolio' && (
          <div className={wide ? 'grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-center' : 'space-y-3'}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">Total balance</p>
              <p className="text-3xl font-display font-bold font-mono text-[#0b1c30]">{money(data.last, 2)}</p>
              <p className={`text-xs font-bold ${data.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.change >= 0 ? '+' : ''}{money(data.change)} ({data.pct >= 0 ? '+' : ''}{data.pct.toFixed(1)}%) <span className="text-[#94a3b8] font-medium">30 days</span>
              </p>
              <Sparkline values={data.values} color="#5338ec" className="w-full h-14 mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 rounded-xl p-2.5"><p className="text-[10px] text-[#474556]">Realized</p><p className={`text-sm font-bold font-mono ${data.realized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{data.realized >= 0 ? '+' : ''}{money(data.realized)}</p></div>
              <div className="bg-slate-50 rounded-xl p-2.5"><p className="text-[10px] text-[#474556]">Unrealized</p><p className={`text-sm font-bold font-mono ${data.unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{data.unrealized >= 0 ? '+' : ''}{money(data.unrealized)}</p></div>
              <div className="bg-slate-50 rounded-xl p-2.5"><p className="text-[10px] text-[#474556]">Win rate</p><p className="text-sm font-bold font-mono">{data.winRate.toFixed(0)}%</p></div>
              <div className="bg-slate-50 rounded-xl p-2.5"><p className="text-[10px] text-[#474556]">Open trades</p><p className="text-sm font-bold font-mono">{data.openCount}</p></div>
              <div className="col-span-2">
                <div className="flex justify-between text-[10px] text-[#474556] mb-1"><span>Margin usage</span><span className="font-mono font-bold">{data.usage.toFixed(0)}%</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${data.usage < 50 ? 'bg-emerald-400' : data.usage < 80 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${data.usage}%` }} /></div>
              </div>
            </div>
          </div>
        )}

        {mode === 'learn' && (
          <div className="divide-y divide-[#f1f5f9]">
            {COURSES.slice(0, 3).map((c) => (
              <div key={c.id} onClick={() => onNavigateToTab('education-hub')} className="flex items-center gap-3 py-2.5 cursor-pointer group">
                <img src={c.thumbnail} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0b1c30] group-hover:text-[#5338ec] truncate">{c.title}</p>
                  <p className="text-[11px] text-[#94a3b8]">{c.level} · {c.lessons.length} lessons</p>
                </div>
                <span className="text-[11px] font-bold text-[#5338ec]">+{c.pointsReward} pts</span>
              </div>
            ))}
          </div>
        )}

        {mode === 'signals' && (
          <div className="divide-y divide-[#f1f5f9]">
            {signals.slice(0, 4).map((sg) => (
              <div key={sg.id} onClick={() => onSelectSignal(sg)} className="flex items-center justify-between gap-3 py-2.5 cursor-pointer group">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0b1c30] group-hover:text-[#5338ec]">{sg.ticker}</p>
                  <p className="text-[11px] text-[#94a3b8]">{sg.confidence}% confidence · {sg.timeframe}</p>
                </div>
                <span className={`font-mono text-xs font-bold ${sg.change24h >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{sg.change24h >= 0 ? '+' : ''}{sg.change24h.toFixed(2)}%</span>
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${sg.action === 'BUY' ? 'bg-[#CAEB0E] text-slate-950' : 'bg-[#5945F1] text-white'}`}>{sg.action === 'BUY' ? 'Buy' : 'Sell'}</span>
              </div>
            ))}
          </div>
        )}

        {mode === 'discuss' && (
          <div className="divide-y divide-[#f1f5f9]">
            {COMMUNITY_TOPICS.filter((t) => !t.featured).slice(0, 4).map((t) => (
              <div key={t.id} onClick={() => onNavigateToTab('community')} className="py-2.5 cursor-pointer group">
                <p className="text-sm font-semibold text-[#0b1c30] group-hover:text-[#5338ec] line-clamp-1">{t.title}</p>
                <p className="text-[11px] text-[#94a3b8]">{t.answersCount} replies{t.category ? ` · ${t.category}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t border-[#f1f5f9] flex items-center justify-between">
        <span className="text-[11px] text-[#94a3b8]">Updated from your connected accounts</span>
        {FEATURE_FLAGS.portfolioTracker && (
          <button onClick={() => onNavigateToTab('portfolio-tracker')} className="text-xs font-bold text-[#5338ec] hover:underline">
            Open Portfolio Tracker →
          </button>
        )}
      </div>
    </div>
  );
};
