import React, { useMemo, useState } from 'react';
import { BacktestResult, Metrics } from './engine/types';
import { Histogram, LineChart, MonthlyHeatmap } from './StrategyCharts';
import { barsToDays, money, pct, ratio, signedMoney, signedPct } from './format';
import { Insight } from './insights';
import { Pill } from './ui';

const Card: React.FC<{ title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, sub, right, children, className = '' }) => (
  <section className={`bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="text-sm font-bold text-[#0b1c30]">{title}</h3>
        {sub && <p className="text-[11px] text-[#6b7686] mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
    {children}
  </section>
);

const Metric: React.FC<{ label: string; value: string; sub?: string; tone?: 'good' | 'bad' | 'neutral'; tip: string }> = ({ label, value, sub, tone = 'neutral', tip }) => (
  <div className="bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3" title={tip}>
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686] flex items-center gap-1">
      {label}
      <span aria-hidden className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 text-[9px] font-black text-slate-600 cursor-help">?</span>
    </p>
    <p className={`font-display text-xl sm:text-2xl font-black mt-0.5 ${tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-rose-600' : 'text-[#0b1c30]'}`}>{value}</p>
    {sub && <p className="text-[11px] text-[#6b7686] mt-0.5">{sub}</p>}
  </div>
);

const toneDot: Record<Insight['tone'], string> = { good: 'bg-emerald-500', warn: 'bg-amber-500', info: 'bg-[#5338ec]' };

export const OverviewTab: React.FC<{
  result: BacktestResult;
  insights: Insight[];
  split: { cut: number; inSample: Metrics; outSample: Metrics };
}> = ({ result: r, insights, split }) => {
  const m = r.metrics;
  const [showBH, setShowBH] = useState(true);
  const [histUnit, setHistUnit] = useState<'pct' | 'r'>('pct');
  const days = barsToDays(m.maxDrawdownBars, r.barsPerYear);
  const times = useMemo(() => r.bars.map((b) => b.t), [r.bars]);

  const series = useMemo(
    () => [
      { name: 'Strategy', color: '#5338ec', values: r.equity, width: 2 },
      ...(showBH ? [{ name: 'Buy and hold', color: '#94a3b8', values: r.buyHoldEquity, dashed: true, width: 1.5 }] : []),
    ],
    [r.equity, r.buyHoldEquity, showBH]
  );
  const ddSeries = useMemo(() => [{ name: 'Drawdown', color: '#e11d48', values: r.drawdown, fill: true }], [r.drawdown]);

  const histValues = r.trades.map((t) => (histUnit === 'pct' ? t.pnlPct : (t.r ?? NaN))).filter((v) => isFinite(v));
  const reasons: [string, number, string][] = [
    ['Stop loss', r.exitReasons.stop, '#e11d48'],
    ['Take profit', r.exitReasons.target, '#16a34a'],
    ['Trailing stop', r.exitReasons.trailing, '#0ea5e9'],
    ['Time limit', r.exitReasons.time, '#f59e0b'],
    ['Opposite signal', r.exitReasons.opposite, '#8b5cf6'],
    ['Exit rule', r.exitReasons.rule, '#0d9488'],
    ['End of test', r.exitReasons.end, '#94a3b8'],
  ];
  const maxReason = Math.max(1, ...reasons.map((x) => x[1]));

  if (m.trades === 0)
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center">
        <p className="text-lg font-bold text-[#0b1c30]">These rules never opened a trade</p>
        <p className="text-sm text-[#474556] mt-2 max-w-lg mx-auto">Either no rule is set for a side that is switched on, or the conditions never became true in this history. Try a shorter indicator length, a longer test period, or start from a template.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <Metric label="Net profit" value={signedMoney(m.netProfit)} sub={`${signedPct(m.returnPct)} on ${money(r.strategy.capital)}`} tone={m.netProfit >= 0 ? 'good' : 'bad'} tip="Money made or lost after spread, slippage and commission." />
        <Metric label="Yearly return" value={signedPct(m.cagr)} sub="compound, per year" tone={m.cagr >= 0 ? 'good' : 'bad'} tip="The steady yearly rate that would give the same final balance (CAGR)." />
        <Metric label="Worst drawdown" value={pct(m.maxDrawdownPct)} sub={`${money(m.maxDrawdownMoney)} · ~${days} days`} tone={m.maxDrawdownPct >= 25 ? 'bad' : 'neutral'} tip="The biggest fall from a peak in the account to a later low, and how long the dip lasted." />
        <Metric label="Sharpe ratio" value={ratio(m.sharpe)} sub={`Sortino ${ratio(m.sortino)}`} tone={m.sharpe >= 1 ? 'good' : m.sharpe < 0 ? 'bad' : 'neutral'} tip="Return per unit of day-to-day swing. Above 1 is decent, below 0 means a loss. Sortino counts only the downside swings." />
        <Metric label="Profit factor" value={ratio(m.profitFactor)} sub={`${money(m.grossProfit)} won / ${money(m.grossLoss)} lost`} tone={m.profitFactor >= 1.3 ? 'good' : m.profitFactor < 1 ? 'bad' : 'neutral'} tip="Total money won divided by total money lost. Below 1 loses money." />
        <Metric label="Win rate" value={pct(m.winRate, 0)} sub={`${Math.round((m.winRate / 100) * m.trades)} of ${m.trades} trades`} tip="Share of trades that closed in profit. It means little without the size of wins versus losses." />
        <Metric label="Average win / loss" value={`${money(m.avgWin)} / ${money(m.avgLoss)}`} sub={`payoff ${ratio(m.payoff)}×`} tip="Average winning trade and average losing trade. Payoff is the first divided by the second." />
        <Metric label="Expectancy" value={signedMoney(m.expectancy, 1)} sub={m.avgR !== null ? `avg ${ratio(m.avgR)}R per trade` : 'per trade'} tone={m.expectancy >= 0 ? 'good' : 'bad'} tip="Average result of one trade. R is the money risked at the stop, so 0.4R means winning 40% of the risk on average." />
        <Metric label="Trades" value={String(m.trades)} sub={`${m.longTrades} long · ${m.shortTrades} short`} tip="Number of closed trades in the test." />
        <Metric label="Longest streaks" value={`${m.maxConsecWins}W / ${m.maxConsecLosses}L`} sub={`avg trade ${m.avgBars.toFixed(1)} candles`} tip="Most wins in a row and most losses in a row." />
        <Metric label="In the market" value={pct(m.exposurePct, 0)} sub={`best ${signedMoney(m.best)} · worst ${signedMoney(m.worst)}`} tip="Share of candles with a trade open, and the best and worst single trade." />
        <Metric label="Buy and hold" value={signedPct(r.buyHoldPct)} sub="same prices, no trading" tone={r.buyHoldPct >= 0 ? 'good' : 'bad'} tip="What simply buying at the start and holding to the end would have returned on these prices." />
      </div>

      <Card
        title="Equity curve"
        sub={`Starting with ${money(r.strategy.capital)}. Hover to read values.`}
        right={<Pill active={showBH} onClick={() => setShowBH((v) => !v)}>Compare with buy and hold</Pill>}
      >
        <LineChart times={times} series={series} baseline={r.strategy.capital} yFormat={(v) => money(v)} ariaLabel="Equity curve" />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Drawdown" sub="How far below its previous peak the account was.">
          <LineChart times={times} series={ddSeries} height={200} zeroLine yFormat={(v) => `${v.toFixed(0)}%`} ariaLabel="Drawdown" />
        </Card>
        <Card title="What these numbers say" sub="Plain-language notes from the rules below, not advice.">
          <ul className="space-y-3">
            {insights.slice(0, 7).map((i) => (
              <li key={i.title} className="flex items-start gap-3">
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${toneDot[i.tone]}`} aria-hidden />
                <div>
                  <p className="text-sm font-bold text-[#0b1c30]">{i.title}</p>
                  <p className="text-xs text-[#474556] leading-relaxed">{i.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Monthly returns" sub="Percent change in the account each month. The last column is the year.">
        <MonthlyHeatmap monthly={r.monthly} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card
          title="Trade results"
          sub={histUnit === 'pct' ? 'Each trade as a % of the balance when it opened.' : 'Each trade in R, the money risked at the stop.'}
          right={
            <div className="flex gap-1.5">
              <Pill active={histUnit === 'pct'} onClick={() => setHistUnit('pct')}>% of balance</Pill>
              <Pill active={histUnit === 'r'} onClick={() => setHistUnit('r')}>R multiple</Pill>
            </div>
          }
        >
          <Histogram values={histValues} unit={histUnit === 'pct' ? '%' : 'R'} ariaLabel="Distribution of trade results" />
          {histUnit === 'r' && histValues.length === 0 && <p className="text-xs text-[#6b7686]">R needs a stop loss. Add one to see this view.</p>}
        </Card>
        <Card title="How trades ended" sub="Why each trade closed.">
          <ul className="space-y-2">
            {reasons.filter((x) => x[1] > 0).map(([label, n, color]) => (
              <li key={label} className="flex items-center gap-3 text-xs">
                <span className="w-28 text-[#474556] shrink-0">{label}</span>
                <span className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden"><span className="block h-full rounded-full" style={{ width: `${(n / maxReason) * 100}%`, background: color }} /></span>
                <span className="w-16 text-right font-mono text-[#0b1c30]">{n} · {Math.round((n / m.trades) * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Long and short" sub="Each side on its own.">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wide text-[#6b7686] text-left"><th className="pb-2 font-bold" /><th className="pb-2 font-bold text-right">Trades</th><th className="pb-2 font-bold text-right">Win rate</th><th className="pb-2 font-bold text-right">Net</th></tr></thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              <tr><td className="py-2 font-semibold text-[#0b1c30]">Long</td><td className="py-2 text-right font-mono">{m.longTrades}</td><td className="py-2 text-right font-mono">{pct(m.longWinRate, 0)}</td><td className={`py-2 text-right font-mono font-bold ${m.longNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(m.longNet)}</td></tr>
              <tr><td className="py-2 font-semibold text-[#0b1c30]">Short</td><td className="py-2 text-right font-mono">{m.shortTrades}</td><td className="py-2 text-right font-mono">{pct(m.shortWinRate, 0)}</td><td className={`py-2 text-right font-mono font-bold ${m.shortNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedMoney(m.shortNet)}</td></tr>
            </tbody>
          </table>
        </Card>
        <Card title="Early part vs later part" sub="The first 70% of the history against the last 30%. A big gap can mean the rules fit the past too closely.">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wide text-[#6b7686] text-left"><th className="pb-2 font-bold" /><th className="pb-2 font-bold text-right">First 70%</th><th className="pb-2 font-bold text-right">Last 30%</th></tr></thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {[
                ['Return', signedPct(split.inSample.returnPct), signedPct(split.outSample.returnPct)],
                ['Worst drawdown', pct(split.inSample.maxDrawdownPct), pct(split.outSample.maxDrawdownPct)],
                ['Win rate', pct(split.inSample.winRate, 0), pct(split.outSample.winRate, 0)],
                ['Profit factor', ratio(split.inSample.profitFactor), ratio(split.outSample.profitFactor)],
                ['Trades', String(split.inSample.trades), String(split.outSample.trades)],
              ].map(([k, a, b]) => (
                <tr key={k}><td className="py-2 font-semibold text-[#0b1c30]">{k}</td><td className="py-2 text-right font-mono">{a}</td><td className="py-2 text-right font-mono">{b}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
