import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  ShieldCheck,
  Lock,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  LayoutGrid,
  Bell,
  AlertTriangle,
  Sparkles,
  BookOpen,
  MessageSquare,
  CalendarDays,
  Newspaper,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react';
import { PortfolioCtx } from './portfolioContext';
import { Card, CardTitle, Locked, PillTabs, PLAN_RANK, money, signedMoney, pct } from './portfolioUi';
import { EquityChart, DonutChart, Gauge, DrawdownChart, DonutSeg, BarList, PnlHeatmap, ChartMarker } from './PortfolioCharts';
import { PortfolioCommunityCard } from './PortfolioCommunityCard';
import {
  Timeframe,
  TF_DAYS,
  drawdownSeries,
  goalProgress,
  smartAlerts,
  isClosed,
  closedMs,
  groupPnl,
  dailyPnl,
  rOf,
} from './portfolioMath';

type WidgetId = 'allocation' | 'margin' | 'performance' | 'drawdown' | 'recent' | 'goals' | 'strategy' | 'heatmap' | 'metrics';
interface WidgetState {
  id: WidgetId;
  visible: boolean;
}
const WIDGET_LABEL: Record<WidgetId, string> = {
  allocation: 'Allocation by asset class',
  margin: 'Margin & liquidation risk',
  performance: 'Win / loss breakdown',
  drawdown: 'Drawdown curve',
  recent: 'Recent trades',
  goals: 'Goals',
  strategy: 'P&L by strategy',
  heatmap: 'Daily P&L heatmap',
  metrics: 'Custom metrics',
};
const DEFAULT_WIDGETS: WidgetState[] = [
  { id: 'margin', visible: true },
  { id: 'allocation', visible: true },
  { id: 'performance', visible: true },
  { id: 'recent', visible: true },
  { id: 'drawdown', visible: true },
  { id: 'goals', visible: true },
  { id: 'strategy', visible: false },
  { id: 'heatmap', visible: false },
  { id: 'metrics', visible: false },
];

const CLASS_COLORS: Record<string, string> = {
  Forex: '#5338ec',
  Crypto: '#FD02B0',
  Commodity: '#d4a017',
  Indices: '#0d9488',
  Stocks: '#0b1c30',
};

const SIGNAL_MAP: Record<string, string> = {
  'EUR/USD': 'EUR/USD',
  'XAU/USD': 'XAU/USD',
  'BTC/USDT': 'BTC/USDT',
  'GBP/JPY': 'GBP/JPY',
  'USD/CAD': 'USD/CAD',
  NVDA: 'NVDA',
};

export const PortfolioOverview: React.FC<{ ctx: PortfolioCtx }> = ({ ctx }) => {
  const { plan, series, fullSeries, rawSeries, timeframe, stats, openTrades, unrealized, isLive, windowTrades } = ctx;
  const rank = PLAN_RANK[plan];
  const [compare, setCompare] = useState(false);
  const [allocMode, setAllocMode] = useState<'trades' | 'pnl'>('trades');
  const [widgets, setWidgets] = useState<WidgetState[]>(DEFAULT_WIDGETS);
  const [customizing, setCustomizing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [metricIds, setMetricIds] = useState<string[]>(['expectancy', 'avgWin', 'avgLoss', 'bestTrade']);

  const last = series[series.length - 1]?.value ?? 0;
  const first = series[0]?.value ?? 0;
  const change = last - first;
  const changePct = first ? (change / first) * 100 : 0;

  const prevWindow = useMemo(() => {
    const len = series.length;
    const idx = rawSeries.findIndex((p) => p.date === series[0].date);
    if (idx - len < 0) return undefined;
    return rawSeries.slice(idx - len, idx).map((p) => p.value);
  }, [series, rawSeries]);
  const canCompare = rank >= 2 && !!prevWindow;

  const tfOptions: { id: Timeframe; label: string }[] = [
    { id: '1W', label: '1W' },
    { id: '2W', label: '2W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: 'ALL', label: 'All' },
  ];
  const lockedTf = tfOptions
    .filter((o) => (o.id === 'ALL' ? ctx.historyDays < 9999 : TF_DAYS[o.id] > ctx.historyDays))
    .map((o) => o.id);

  const marginEquity = fullSeries[fullSeries.length - 1]?.value ?? 1;
  const marginUsed = ctx.marginUsed + (isLive ? (unrealized + 138.4) * -0.35 : 0);
  const usage = Math.max(0, Math.min(100, (marginUsed / marginEquity) * 100));
  const freeMargin = marginEquity - marginUsed;
  const marginLevel = marginUsed > 0 ? (marginEquity / marginUsed) * 100 : 0;
  const risk = usage < 40 ? 'Low' : usage < 70 ? 'Moderate' : 'High';

  const ddLimit = ctx.goals.find((g) => g.type === 'drawdown')?.target ?? 8;
  const alerts = useMemo(() => smartAlerts(ctx.trades, fullSeries, ddLimit), [ctx.trades, fullSeries, ddLimit]);

  const allocation: DonutSeg[] = useMemo(() => {
    const map = new Map<string, number>();
    windowTrades.forEach((t) => map.set(t.assetClass, (map.get(t.assetClass) || 0) + (allocMode === 'trades' ? 1 : Math.abs(t.pnl))));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, color: CLASS_COLORS[name] || '#94a3b8' }))
      .sort((a, b) => b.value - a.value);
  }, [windowTrades, allocMode]);

  const dd = useMemo(() => drawdownSeries(series), [series]);
  const recent = useMemo(() => [...ctx.trades].sort((a, b) => Date.parse(b.closedAt || b.openedAt) - Date.parse(a.closedAt || a.openedAt)).slice(0, 5), [ctx.trades]);

  const markers: ChartMarker[] = useMemo(() => {
    if (!overlay) return [];
    const dates = new Set(series.map((p) => p.date));
    return ctx.trades
      .filter((t) => isClosed(t) && t.confidence !== undefined && dates.has((t.closedAt as string).slice(0, 10)))
      .map((t) => ({
        date: (t.closedAt as string).slice(0, 10),
        radius: 3.5 + ((t.confidence as number) - 55) / 9,
        win: t.outcome === 'win',
        label: `${t.symbol} ${t.direction}: ${t.outcome === 'win' ? 'win' : 'loss'} ${signedMoney(t.pnl, 0)}, signal confidence ${t.confidence}%`,
      }));
  }, [overlay, series, ctx.trades]);

  const METRICS: Record<string, { label: string; value: string; tone?: 'good' | 'bad' }> = useMemo(() => {
    const closed = windowTrades.filter(isClosed);
    const avgHold = closed.length ? closed.reduce((a, t) => a + (closedMs(t) - Date.parse(t.openedAt)) / 3600000, 0) / closed.length : 0;
    const conf = closed.filter((t) => t.confidence !== undefined);
    const lots = windowTrades.reduce((a, t) => a + t.size, 0);
    const days = Object.keys(dailyPnl(windowTrades)).length;
    return {
      expectancy: { label: 'Expectancy / trade', value: signedMoney(stats.expectancy, 0), tone: stats.expectancy >= 0 ? 'good' : 'bad' },
      avgWin: { label: 'Average win', value: money(stats.avgWin, 0), tone: 'good' },
      avgLoss: { label: 'Average loss', value: `-${money(stats.avgLoss, 0)}`, tone: 'bad' },
      bestTrade: { label: 'Best trade', value: stats.best ? signedMoney(stats.best.pnl, 0) : '—', tone: 'good' },
      worstTrade: { label: 'Worst trade', value: stats.worst ? signedMoney(stats.worst.pnl, 0) : '—', tone: 'bad' },
      avgR: { label: 'Average R', value: `${stats.avgR >= 0 ? '+' : ''}${stats.avgR.toFixed(2)}R` },
      avgHold: { label: 'Average hold time', value: avgHold < 48 ? `${avgHold.toFixed(1)}h` : `${(avgHold / 24).toFixed(1)}d` },
      lots: { label: 'Lots traded', value: lots.toFixed(1) },
      tradingDays: { label: 'Days with closed trades', value: String(days) },
      sigConf: { label: 'Avg signal confidence', value: conf.length ? `${Math.round(conf.reduce((a, t) => a + (t.confidence as number), 0) / conf.length)}%` : '—' },
      sigWin: { label: 'Signal-based win rate', value: conf.length ? `${Math.round((conf.filter((t) => t.outcome === 'win').length / conf.length) * 100)}%` : '—' },
      rr: { label: 'Reward / risk (R)', value: closed.length ? `${(closed.filter((t) => rOf(t) > 0).reduce((a, t) => a + rOf(t), 0) / Math.max(1, closed.filter((t) => rOf(t) > 0).length)).toFixed(1)} : 1` : '—' },
    };
  }, [windowTrades, stats]);

  const move = (id: WidgetId, dir: -1 | 1) =>
    setWidgets((prev) => {
      const i = prev.findIndex((w) => w.id === id);
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const renderWidget = (w: WidgetState) => {
    switch (w.id) {
      case 'margin':
        return (
          <Card key={w.id} className="p-5">
            <CardTitle
              title="Margin & liquidation risk"
              hint={isLive ? 'Live margin tracking' : 'Daily snapshot'}
              right={
                isLive ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                ) : (
                  <button onClick={ctx.upgrade} className="flex items-center gap-1 text-[10px] font-bold text-[#5338ec]">
                    <Lock className="w-3 h-3" /> Live on Premium
                  </button>
                )
              }
            />
            <div className="flex items-center gap-4 flex-wrap">
              <Gauge value={usage} label={`${usage.toFixed(0)}%`} sub={`${risk} risk`} size={160} />
              <div className="space-y-2.5 text-xs flex-1 min-w-[140px]">
                <div className="flex justify-between"><span className="text-[#474556]">Margin used</span><span className="font-mono font-bold">{money(marginUsed, 0)}</span></div>
                <div className="flex justify-between"><span className="text-[#474556]">Free margin</span><span className="font-mono font-bold">{money(freeMargin, 0)}</span></div>
                <div className="flex justify-between"><span className="text-[#474556]">Margin level</span><span className="font-mono font-bold">{marginLevel ? `${marginLevel.toFixed(0)}%` : '—'}</span></div>
                <p className="text-[11px] text-[#94a3b8] leading-relaxed pt-1">
                  A margin level under 100% means new trades are blocked. Brokers close positions at their stop-out level.
                </p>
              </div>
            </div>
          </Card>
        );
      case 'allocation':
        return (
          <Card key={w.id} className="p-5">
            <CardTitle
              title="Allocation by asset class"
              hint="Share of activity in this window"
              right={
                <PillTabs
                  options={[{ id: 'trades', label: 'Trades' }, { id: 'pnl', label: 'P&L' }]}
                  value={allocMode}
                  onChange={setAllocMode}
                />
              }
            />
            {allocation.length ? (
              <DonutChart
                segments={allocation}
                centerTop={allocMode === 'trades' ? String(windowTrades.length) : money(allocation.reduce((a, s) => a + s.value, 0), 0)}
                centerBottom={allocMode === 'trades' ? 'trades' : 'gross P&L'}
              />
            ) : (
              <p className="text-sm text-[#474556] py-8 text-center">No trades in this window.</p>
            )}
          </Card>
        );
      case 'performance':
        return (
          <Card key={w.id} className="p-5">
            <CardTitle title="Win / loss breakdown" hint={`${stats.closed} closed trades`} />
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 mb-3">
              <div className="bg-emerald-400" style={{ width: `${stats.closed ? (stats.wins / stats.closed) * 100 : 0}%` }} />
              <div className="bg-slate-300" style={{ width: `${stats.closed ? (stats.breakeven / stats.closed) * 100 : 0}%` }} />
              <div className="bg-rose-400" style={{ width: `${stats.closed ? (stats.losses / stats.closed) * 100 : 0}%` }} />
            </div>
            <div className="flex justify-between text-xs font-semibold mb-4">
              <span className="text-emerald-600">{stats.wins} wins</span>
              <span className="text-slate-400">{stats.breakeven} even</span>
              <span className="text-rose-600">{stats.losses} losses</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50 rounded-xl p-3"><p className="text-emerald-700 mb-0.5">Average win</p><p className="font-mono font-bold text-emerald-600">{money(stats.avgWin, 0)}</p></div>
              <div className="bg-rose-50 rounded-xl p-3"><p className="text-rose-700 mb-0.5">Average loss</p><p className="font-mono font-bold text-rose-600">-{money(stats.avgLoss, 0)}</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-[#474556] mb-0.5">Best trade</p><p className="font-mono font-bold">{stats.best ? `${stats.best.symbol} ${signedMoney(stats.best.pnl, 0)}` : '—'}</p></div>
              <div className="bg-slate-50 rounded-xl p-3"><p className="text-[#474556] mb-0.5">Current streak</p><p className="font-mono font-bold">{stats.streak.n ? `${stats.streak.n} ${stats.streak.type === 'win' ? 'wins' : 'losses'}` : '—'}</p></div>
            </div>
          </Card>
        );
      case 'drawdown':
        return (
          <Card key={w.id} className="p-5 md:col-span-2">
            <CardTitle title="Drawdown curve" hint="How far equity sits below its previous high" />
            <Locked locked={rank < 2} label="Unlock on Premium" onUpgrade={ctx.upgrade}>
              <DrawdownChart data={dd} limit={ddLimit} />
            </Locked>
          </Card>
        );
      case 'recent':
        return (
          <Card key={w.id} className="p-5">
            <CardTitle title="Recent trades" right={<button onClick={() => ctx.setTab('trades')} className="text-xs font-semibold text-[#5338ec] hover:underline">View all</button>} />
            <div className="divide-y divide-[#f1f5f9]">
              {recent.map((t) => (
                <button key={t.id} onClick={() => ctx.openTrade(t.id)} className="w-full flex items-center justify-between py-2.5 text-left group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold ${t.direction === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {t.direction === 'BUY' ? 'B' : 'S'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#0b1c30] group-hover:text-[#5338ec] truncate">{t.symbol}</p>
                      <p className="text-[11px] text-[#94a3b8]">{t.broker} · {isClosed(t) ? 'Closed' : 'Open'}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold font-mono ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(t.pnl)}</span>
                </button>
              ))}
            </div>
          </Card>
        );
      case 'goals':
        return (
          <Card key={w.id} className="p-5 md:col-span-2">
            <CardTitle title="Goals" right={<button onClick={() => ctx.setTab('goals')} className="text-xs font-semibold text-[#5338ec] hover:underline">Manage</button>} />
            {rank < 1 ? (
              <div className="text-center py-6">
                <Target className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold mb-1">Set growth and drawdown goals</p>
                <button onClick={ctx.upgrade} className="text-xs font-bold text-[#5338ec] hover:underline">Available on Intermediate</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {ctx.goals.map((g) => {
                  const p = goalProgress(g, fullSeries);
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[#0b1c30] truncate pr-2">{g.label}</span>
                        <span className={`font-bold ${p.tone === 'good' ? 'text-emerald-600' : p.tone === 'warn' ? 'text-amber-600' : 'text-rose-600'}`}>{p.status}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.tone === 'good' ? 'bg-emerald-400' : p.tone === 'warn' ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${Math.max(3, p.progress * 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      case 'strategy': {
        const rows = groupPnl(windowTrades, (t) => t.strategyTag || 'Untagged');
        return (
          <Card key={w.id} className="p-5">
            <CardTitle title="P&L by strategy" hint="Realized P&L by strategy tag in this window" />
            {rows.length ? <BarList items={rows.map((r) => ({ name: r.name, value: r.pnl, sub: `${r.count} trades` }))} /> : <p className="text-sm text-[#474556] py-6 text-center">No closed trades in this window.</p>}
          </Card>
        );
      }
      case 'heatmap':
        return (
          <Card key={w.id} className="p-5 md:col-span-2">
            <CardTitle title="Daily P&L heatmap" hint="Greener is a better day, redder a worse one" />
            <PnlHeatmap daily={dailyPnl(ctx.trades)} weeks={16} />
          </Card>
        );
      case 'metrics':
        return (
          <Card key={w.id} className="p-5">
            <CardTitle title="Custom metrics" hint="Pick up to 6 numbers to keep in view" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metricIds.map((id) => (
                <div key={id} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[11px] text-[#474556] mb-0.5">{METRICS[id].label}</p>
                  <p className={`text-base font-bold font-mono ${METRICS[id].tone === 'good' ? 'text-emerald-600' : METRICS[id].tone === 'bad' ? 'text-rose-600' : 'text-[#0b1c30]'}`}>{METRICS[id].value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(METRICS).map(([id, m]) => {
                const on = metricIds.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => setMetricIds((p) => (on ? p.filter((x) => x !== id) : p.length >= 6 ? p : [...p, id]))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${on ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </Card>
        );
    }
  };

  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <div className="space-y-6">
      {/* ───────── Hero ───────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0b1c30] p-6 sm:p-8 text-white">
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60">
                Total balance
                <button onClick={() => setHideBalance((v) => !v)} aria-label="Toggle balance" className="text-white/50 hover:text-white">
                  {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {isLive && (
                  <span className="flex items-center gap-1 text-[10px] text-[#CAEB0E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CAEB0E] animate-pulse" /> LIVE
                  </span>
                )}
              </p>
              <p className="text-4xl sm:text-5xl font-display font-bold font-mono tracking-tight mt-1">
                {hideBalance ? '••••••' : money(last)}
              </p>
              <p className={`flex items-center gap-1.5 text-sm font-bold mt-1.5 ${change >= 0 ? 'text-[#CAEB0E]' : 'text-rose-300'}`}>
                {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {hideBalance ? '••••' : signedMoney(change)} ({pct(changePct)})
                <span className="text-white/50 font-medium">in {timeframe === 'ALL' ? 'all history' : timeframe}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <PillTabs
                dark
                options={tfOptions}
                value={timeframe}
                onChange={ctx.setTimeframe}
                locked={lockedTf}
                onLockedClick={ctx.upgrade}
              />
              <button
                onClick={() => (rank >= 2 ? setOverlay((v) => !v) : ctx.upgrade())}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  overlay && rank >= 2 ? 'bg-white text-[#0b1c30] border-white' : 'border-white/25 text-white/80 hover:border-white/60'
                }`}
              >
                {rank < 2 && <Lock className="w-3 h-3" />} Signal confidence overlay
              </button>
              <button
                onClick={() => (canCompare ? setCompare((v) => !v) : rank < 2 ? ctx.upgrade() : ctx.toast('Not enough earlier history to compare this window.'))}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  compare && canCompare ? 'bg-white text-[#0b1c30] border-white' : 'border-white/25 text-white/80 hover:border-white/60'
                }`}
              >
                {rank < 2 && <Lock className="w-3 h-3" />} Compare with previous period
              </button>
            </div>
          </div>
          <EquityChart data={series} compare={compare && canCompare ? prevWindow : undefined} markers={overlay && rank >= 2 ? markers : undefined} theme="dark" height={270} />
          {overlay && rank >= 2 && (
            <p className="text-[11px] text-white/60 mt-2">
              Dots are closed trades that came from a signal. Bigger means higher signal confidence. Green won, red lost.
            </p>
          )}
          {plan === 'basic' && (
            <p className="text-[11px] text-white/50 mt-2">
              Basic shows the last 14 days.{' '}
              <button onClick={ctx.upgrade} className="underline text-white/80 hover:text-white">See longer history</button>
            </p>
          )}
        </div>
      </div>

      {/* ───────── Stat cards ───────── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-[#474556] mb-1.5">Realized P&amp;L</p>
          <p className={`text-xl font-bold font-mono ${stats.realized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(stats.realized, 0)}</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">{stats.closed} closed trades</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-[#474556] mb-1.5">Unrealized P&amp;L</p>
          <p className={`text-xl font-bold font-mono ${unrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(unrealized, 0)}</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">{openTrades.length} open positions</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-[#474556] mb-1.5">Win rate</p>
          <p className="text-xl font-bold font-mono text-[#0b1c30]">{stats.winRate.toFixed(0)}%</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">{stats.wins}W · {stats.losses}L</p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-[#474556] mb-1.5">Profit factor</p>
          {rank >= 1 ? (
            <>
              <p className="text-xl font-bold font-mono text-[#0b1c30]">{stats.profitFactor >= 99 ? '∞' : stats.profitFactor.toFixed(2)}</p>
              <p className="text-[11px] text-[#94a3b8] mt-1">gross win ÷ gross loss</p>
            </>
          ) : (
            <button onClick={ctx.upgrade} className="flex items-center gap-1 text-xs font-bold text-[#5338ec] mt-1"><Lock className="w-3 h-3" /> Intermediate</button>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-[#474556] mb-1.5">Avg risk / reward</p>
          {rank >= 1 ? (
            <>
              <p className="text-xl font-bold font-mono text-[#0b1c30]">{stats.avgR >= 0 ? '+' : ''}{stats.avgR.toFixed(2)}R</p>
              <p className="text-[11px] text-[#94a3b8] mt-1">per closed trade</p>
            </>
          ) : (
            <button onClick={ctx.upgrade} className="flex items-center gap-1 text-xs font-bold text-[#5338ec] mt-1"><Lock className="w-3 h-3" /> Intermediate</button>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-[#474556] mb-1.5">Active trades</p>
          <p className="flex items-center gap-1.5 text-xl font-bold font-mono text-[#0b1c30]"><Activity className="w-4 h-4 text-[#5338ec]" /> {openTrades.length}</p>
          <p className="text-[11px] text-[#94a3b8] mt-1">across {new Set(openTrades.map((t) => t.broker)).size || 0} accounts</p>
        </Card>
      </div>

      {/* ───────── Widgets + rail ───────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0b1c30]">Your dashboard</h3>
            <button
              onClick={() => (rank >= 2 ? setCustomizing(true) : ctx.upgrade())}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] px-3 py-1.5 rounded-xl transition-colors"
            >
              {rank < 2 ? <Lock className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />} Customize layout
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 grid-flow-dense">{visibleWidgets.map(renderWidget)}</div>
          {visibleWidgets.length === 0 && (
            <div className="text-center py-14 text-sm text-[#474556]">All widgets are hidden. Use Customize layout to bring them back.</div>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <CardTitle title="Open positions" hint="Linked to signals and your journal" />
            {openTrades.length === 0 && <p className="text-xs text-[#474556]">No open positions.</p>}
            <div className="space-y-3">
              {openTrades.map((t) => (
                <div key={t.id} className="border border-[#f1f5f9] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-[#0b1c30]">
                      {t.symbol} <span className={`text-xs ${t.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.direction}</span>
                    </p>
                    <span className={`text-sm font-bold font-mono ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(t.pnl, 0)}</span>
                  </div>
                  <div className="flex gap-2">
                    {SIGNAL_MAP[t.symbol] && (
                      <button onClick={() => ctx.openSignal(SIGNAL_MAP[t.symbol])} className="flex-1 text-[11px] font-bold text-[#5338ec] bg-[#EEF0FE] hover:bg-[#E0E3FC] rounded-lg py-1.5 transition-colors">
                        View signal
                      </button>
                    )}
                    <button onClick={() => ctx.navigate('trading-journal')} className="flex-1 text-[11px] font-bold text-[#474556] bg-slate-100 hover:bg-slate-200 rounded-lg py-1.5 transition-colors">
                      Journal it
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <CardTitle
              title="Smart notifications"
              icon={<Bell className="w-4 h-4 text-[#5338ec]" />}
              right={rank >= 2 ? <span className="text-[10px] font-bold text-emerald-600 uppercase">On</span> : undefined}
            />
            <Locked locked={rank < 2} label="Unlock on Premium" onUpgrade={ctx.upgrade}>
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5 text-xs">
                    {a.tone === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /> : a.tone === 'positive' ? <Sparkles className="w-4 h-4 text-[#5338ec] shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <span className="text-[#0b1c30] leading-relaxed">{a.text}</span>
                  </div>
                ))}
              </div>
            </Locked>
          </Card>

          <PortfolioCommunityCard ctx={ctx} stats={stats} series={series} />

          <Card className="p-5">
            <CardTitle title="Keep going" hint="Jump to the rest of MarketSyde" />
            <div className="space-y-1">
              {[
                { icon: CalendarDays, label: 'Economic calendar', sub: "See what moves your open positions", tab: 'economic-calendar' },
                { icon: Newspaper, label: 'Market news', sub: 'Context for today’s moves', tab: 'news' },
                { icon: BookOpen, label: 'Position sizing course', sub: 'Education Hub', tab: 'education-hub' },
                { icon: MessageSquare, label: 'Share with the community', sub: 'Discuss your setups', tab: 'community' },
                { icon: Zap, label: 'Trading signals', sub: 'Fresh ideas with risk targets', tab: 'signals' },
              ].map((l) => (
                <button key={l.tab} onClick={() => ctx.navigate(l.tab)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8F7FF] text-left transition-colors group">
                  <span className="w-8 h-8 rounded-lg bg-[#EEF0FE] flex items-center justify-center shrink-0"><l.icon className="w-4 h-4 text-[#5338ec]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#0b1c30] group-hover:text-[#5338ec]">{l.label}</span>
                    <span className="block text-[11px] text-[#94a3b8]">{l.sub}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* ───────── Customize modal ───────── */}
      {customizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[#0b1c30]">Customize layout</h3>
              <button onClick={() => setCustomizing(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[#474556] mb-4">Show, hide and reorder the modules under your chart.</p>
            <div className="space-y-2 mb-5">
              {widgets.map((w, i) => (
                <div key={w.id} className="flex items-center gap-3 border border-slate-200 rounded-xl px-3 py-2.5">
                  <button onClick={() => setWidgets((p) => p.map((x) => (x.id === w.id ? { ...x, visible: !x.visible } : x)))} className={`w-5 h-5 rounded-md border flex items-center justify-center ${w.visible ? 'bg-[#5338ec] border-[#5338ec]' : 'border-slate-300'}`} aria-label="Toggle">
                    {w.visible && <span className="text-white text-xs leading-none">✓</span>}
                  </button>
                  <span className="text-sm font-semibold flex-1">{WIDGET_LABEL[w.id]}</span>
                  <button disabled={i === 0} onClick={() => move(w.id, -1)} className="text-slate-400 hover:text-[#5338ec] disabled:opacity-25"><ArrowUp className="w-4 h-4" /></button>
                  <button disabled={i === widgets.length - 1} onClick={() => move(w.id, 1)} className="text-slate-400 hover:text-[#5338ec] disabled:opacity-25"><ArrowDown className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setWidgets(DEFAULT_WIDGETS)} className="flex-1 border border-slate-200 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50">Reset</button>
              <button onClick={() => { setCustomizing(false); ctx.toast('Layout saved'); }} className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
