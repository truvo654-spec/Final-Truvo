import React, { useMemo, useState } from 'react';
import { StickyNote } from 'lucide-react';
import { PortfolioCtx } from './portfolioContext';
import { Card, CardTitle, Locked, PillTabs, PLAN_RANK, signedMoney } from './portfolioUi';
import { PnlHeatmap, BarList, Histogram, DrawdownChart } from './PortfolioCharts';
import { dailyPnl, drawdownSeries, durationH, groupPnl, isClosed, tradeStats, tradesInRange } from './portfolioMath';

type Breakdown = 'strategy' | 'risk' | 'instrument';

export const PortfolioAnalytics: React.FC<{ ctx: PortfolioCtx }> = ({ ctx }) => {
  const rank = PLAN_RANK[ctx.plan];
  const locked = rank < 1;
  const [bd, setBd] = useState<Breakdown>('strategy');
  const [open, setOpen] = useState<string | null>(null);

  const closed = useMemo(() => ctx.trades.filter(isClosed), [ctx.trades]);
  const start = ctx.fullSeries[0]?.value || 1;

  const tfRows = useMemo(
    () =>
      ([['Last 7 days', 7], ['Last 30 days', 30], ['Last 90 days', 90], ['All history', 9999]] as [string, number][]).map(([label, d]) => {
        const s = tradeStats(tradesInRange(ctx.trades, d));
        return { label, d, s };
      }),
    [ctx.trades]
  );

  const roi = useMemo(
    () => groupPnl(ctx.trades, (t) => t.assetClass).map((g) => ({ name: g.name, value: (g.pnl / start) * 100, right: `${g.pnl >= 0 ? '+' : ''}${((g.pnl / start) * 100).toFixed(1)}%`, sub: `${g.count} trades` })),
    [ctx.trades, start]
  );

  const duration = useMemo(() => {
    const wins = closed.filter((t) => t.outcome === 'win');
    const losses = closed.filter((t) => t.outcome === 'loss');
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    const buckets = [
      { label: '<1h', test: (h: number) => h < 1 },
      { label: '1–4h', test: (h: number) => h >= 1 && h < 4 },
      { label: '4–24h', test: (h: number) => h >= 4 && h < 24 },
      { label: '1–3d', test: (h: number) => h >= 24 && h < 72 },
      { label: '3d+', test: (h: number) => h >= 72 },
    ].map((b) => ({
      label: b.label,
      win: wins.filter((t) => b.test(durationH(t))).length,
      loss: losses.filter((t) => b.test(durationH(t))).length,
    }));
    return { avgWin: avg(wins.map(durationH)), avgLoss: avg(losses.map(durationH)), buckets };
  }, [closed]);

  const groups = useMemo(() => {
    const key =
      bd === 'strategy' ? (t: (typeof closed)[number]) => t.strategyTag || 'Untagged'
      : bd === 'risk' ? (t: (typeof closed)[number]) => (t.riskTag || 'untagged').replace('-', ' ')
      : (t: (typeof closed)[number]) => t.symbol;
    return groupPnl(ctx.trades, key).slice(0, 10).map((g) => ({
      ...g,
      trades: closed.filter((t) => key(t) === g.name).sort((a, b) => b.pnl - a.pnl).slice(0, 4),
    }));
  }, [ctx.trades, bd, closed]);

  const notes = useMemo(() => ctx.trades.filter((t) => t.analystNote), [ctx.trades]);
  const dd = useMemo(() => drawdownSeries(ctx.fullSeries), [ctx.fullSeries]);
  const ddLimit = ctx.goals.find((g) => g.type === 'drawdown')?.target;

  const dur = (h: number) => (h < 48 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`);

  return (
    <Locked locked={locked} label="Unlock analytics on Intermediate" onUpgrade={ctx.upgrade} className="min-h-[420px]" top>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5 lg:col-span-2">
            <CardTitle title="Daily P&L heatmap" hint="Each square is a day. Greener means a better day, redder a worse one." />
            <PnlHeatmap daily={dailyPnl(ctx.trades)} weeks={18} />
          </Card>

          <Card className="p-5">
            <CardTitle title="Win rate & risk/reward by timeframe" hint="Calculated automatically from closed trades" />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#94a3b8] font-bold uppercase tracking-wide">
                    <th className="pb-2 font-bold">Period</th>
                    <th className="pb-2 font-bold text-right">Trades</th>
                    <th className="pb-2 font-bold text-right">Win rate</th>
                    <th className="pb-2 font-bold text-right">Avg R</th>
                    <th className="pb-2 font-bold text-right">P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {tfRows.map((r) => (
                    <tr key={r.label} className="border-t border-[#f1f5f9]">
                      <td className="py-2.5 font-semibold text-[#0b1c30]">{r.label}</td>
                      <td className="py-2.5 text-right font-mono">{r.s.closed}</td>
                      <td className="py-2.5 text-right font-mono">{r.s.winRate.toFixed(0)}%</td>
                      <td className="py-2.5 text-right font-mono">{r.s.avgR >= 0 ? '+' : ''}{r.s.avgR.toFixed(2)}R</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${r.s.realized >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(r.s.realized, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <CardTitle title="Return per asset class" hint="Realized P&L as a share of your starting balance" />
            {roi.length ? <BarList items={roi} /> : <p className="text-sm text-[#474556]">No closed trades yet.</p>}
          </Card>

          <Card className="p-5 lg:col-span-2">
            <CardTitle title="Trade duration" hint="How long winners and losers are held" />
            <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-6 items-center">
              <div className="space-y-3">
                <div className="bg-emerald-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-emerald-700 font-semibold">Average winner held</p>
                  <p className="text-lg font-bold font-mono text-emerald-600">{dur(duration.avgWin)}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-rose-700 font-semibold">Average loser held</p>
                  <p className="text-lg font-bold font-mono text-rose-600">{dur(duration.avgLoss)}</p>
                </div>
              </div>
              <Histogram buckets={duration.buckets} />
            </div>
          </Card>
        </div>

        {/* Premium section */}
        <div>
          <h3 className="text-sm font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
            Portfolio breakdown
            {rank < 2 && <span className="text-[10px] font-bold uppercase tracking-wide text-[#5338ec] bg-[#EEF0FE] px-2 py-0.5 rounded-full">Premium</span>}
          </h3>
          <Locked locked={rank < 2 && !locked} label="Unlock on Premium" onUpgrade={ctx.upgrade}>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
              <Card className="p-5">
                <CardTitle
                  title="Drill down"
                  hint="Click a row to see the trades behind it"
                  right={
                    <PillTabs
                      options={[{ id: 'strategy', label: 'Strategy' }, { id: 'risk', label: 'Risk level' }, { id: 'instrument', label: 'Instrument' }]}
                      value={bd}
                      onChange={(v) => {
                        setBd(v);
                        setOpen(null);
                      }}
                    />
                  }
                />
                <div>
                  {groups.map((g) => (
                    <div key={g.name} className="border-t border-[#f1f5f9] first:border-0">
                      <button onClick={() => setOpen(open === g.name ? null : g.name)} className="w-full flex items-center gap-3 py-3 text-left">
                        <span className={`w-4 text-center text-slate-400 transition-transform inline-block ${open === g.name ? 'rotate-90' : ''}`}>›</span>
                        <span className="flex-1 text-sm font-semibold text-[#0b1c30] capitalize">{g.name}</span>
                        <span className="text-xs text-[#94a3b8] w-16 text-right">{g.count} trades</span>
                        <span className="text-xs font-mono w-14 text-right">{Math.round((g.wins / g.count) * 100)}% win</span>
                        <span className={`text-sm font-bold font-mono w-20 text-right ${g.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(g.pnl, 0)}</span>
                      </button>
                      {open === g.name && (
                        <div className="pl-7 pb-3 space-y-1.5">
                          {g.trades.map((t) => (
                            <button key={t.id} onClick={() => ctx.openTrade(t.id)} className="w-full flex items-center justify-between text-xs bg-slate-50 hover:bg-[#F8F7FF] rounded-lg px-3 py-2 transition-colors">
                              <span className="font-semibold text-[#0b1c30]">{t.symbol} <span className={t.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}>{t.direction}</span></span>
                              <span className={`font-mono font-bold ${t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(t.pnl, 0)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <div className="space-y-5">
                <Card className="p-5">
                  <CardTitle title="Analyst notes" hint="From signals you imported" icon={<StickyNote className="w-4 h-4 text-[#5338ec]" />} />
                  <div className="space-y-3">
                    {notes.slice(0, 4).map((t) => (
                      <button key={t.id} onClick={() => ctx.openTrade(t.id)} className="w-full text-left bg-[#F8F7FF] rounded-xl p-3 hover:bg-[#EEF0FE] transition-colors">
                        <p className="text-xs font-bold text-[#0b1c30] mb-0.5">{t.symbol}</p>
                        <p className="text-xs text-[#474556] leading-relaxed">{t.analystNote}</p>
                      </button>
                    ))}
                    {!notes.length && <p className="text-xs text-[#474556]">No analyst notes yet.</p>}
                  </div>
                </Card>
                <Card className="p-5">
                  <CardTitle title="Drawdown curve" />
                  <DrawdownChart data={dd} limit={ddLimit} height={150} />
                </Card>
              </div>
            </div>
          </Locked>
        </div>
      </div>
    </Locked>
  );
};
