import React, { useMemo, useState } from 'react';
import { BacktestResult, Strategy } from './engine/types';
import { runBacktest } from './engine/backtest';
import { SCENARIOS, generateBars } from './engine/marketData';
import { monteCarlo } from './engine/monteCarlo';
import { cloneStrategy } from './engine/templates';
import { FanChart } from './StrategyCharts';
import { money, pct, ratio, signedPct } from './format';
import { Field, SelectBox } from './ui';

const Card: React.FC<{ title: string; sub: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5">
    <h3 className="text-sm font-bold text-[#0b1c30]">{title}</h3>
    <p className="text-xs text-[#6b7686] mt-0.5 mb-4">{sub}</p>
    {children}
  </section>
);

const Stat: React.FC<{ label: string; value: string; sub?: string; tone?: 'good' | 'bad' | 'neutral' }> = ({ label, value, sub, tone = 'neutral' }) => (
  <div className="bg-slate-50 rounded-xl px-4 py-3">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">{label}</p>
    <p className={`font-display text-lg font-black mt-0.5 ${tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-rose-600' : 'text-[#0b1c30]'}`}>{value}</p>
    {sub && <p className="text-[11px] text-[#6b7686]">{sub}</p>}
  </div>
);

export const StressTab: React.FC<{ result: BacktestResult; strategy: Strategy; scenario: number }> = ({ result: r, strategy, scenario }) => {
  const [runs, setRuns] = useState(500);
  const mc = useMemo(() => monteCarlo(r.trades, r.strategy.capital, runs), [r.trades, r.strategy.capital, runs]);

  const histories = useMemo(
    () =>
      SCENARIOS.map((sc) => {
        const bars = generateBars(strategy.instrument, strategy.timeframe, strategy.period, sc.id);
        return { sc, res: runBacktest(strategy, bars) };
      }),
    [strategy]
  );
  const winners = histories.filter((h) => h.res.metrics.returnPct > 0).length;

  const costs = useMemo(
    () =>
      [0, 1, 2, 3].map((mult) => {
        const s = cloneStrategy(strategy);
        s.costs = { spreadPips: strategy.costs.spreadPips * mult, slippagePips: strategy.costs.slippagePips * mult, commissionPerLot: strategy.costs.commissionPerLot * mult };
        return { mult, res: runBacktest(s, r.bars) };
      }),
    [strategy, r.bars]
  );

  return (
    <div className="space-y-4">
      <Card title="Shuffle the trades" sub={`Takes your ${r.trades.length} trades and replays them in a random order many times. It shows how much the order of wins and losses alone can change the outcome.`}>
        {!mc ? (
          <p className="text-sm text-[#474556]">Needs at least 5 trades. Use a longer period or a faster candle size.</p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
              <div className="w-44"><Field label="Number of shuffles"><SelectBox<number> value={runs} onChange={setRuns} ariaLabel="Number of shuffles" options={[200, 500, 1000].map((x) => ({ value: x, label: `${x} shuffles` }))} /></Field></div>
              <p className="text-[11px] text-[#6b7686]">Dark band: middle 50% of outcomes. Light band: middle 90%. Line: the median.</p>
            </div>
            <FanChart mc={mc} capital={r.strategy.capital} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <Stat label="Median final balance" value={money(mc.medianFinal)} sub={`${signedPct((mc.medianFinal / r.strategy.capital - 1) * 100)}`} tone={mc.medianFinal >= r.strategy.capital ? 'good' : 'bad'} />
              <Stat label="Middle 90% range" value={`${money(mc.p5Final)} to ${money(mc.p95Final)}`} sub="5th to 95th percentile" />
              <Stat label="Chance of a profit" value={pct(mc.probProfit, 0)} sub="ended above the start" tone={mc.probProfit >= 70 ? 'good' : mc.probProfit < 50 ? 'bad' : 'neutral'} />
              <Stat label="Typical worst drawdown" value={pct(mc.medianDD, 0)} sub={`1 in 20 shuffles: ${pct(mc.p95DD, 0)} or worse`} tone={mc.p95DD >= 35 ? 'bad' : 'neutral'} />
              <Stat label="Drawdown of 20%+" value={pct(mc.probDD20, 0)} sub="share of shuffles" />
              <Stat label="Drawdown of 30%+" value={pct(mc.probDD30, 0)} sub="share of shuffles" tone={mc.probDD30 >= 25 ? 'bad' : 'neutral'} />
              <Stat label="Lost half the account" value={pct(mc.probRuin, 1)} sub="ended below 50% of the start" tone={mc.probRuin >= 5 ? 'bad' : 'neutral'} />
              <Stat label="Your actual run" value={money(r.equity[r.equity.length - 1])} sub={`drawdown ${pct(r.metrics.maxDrawdownPct, 0)}`} />
            </div>
            <p className="text-[11px] text-[#6b7686] mt-3">This reuses the trades from one simulated history. It cannot show what happens in a market that behaves differently.</p>
          </>
        )}
      </Card>

      <Card title="Try other price histories" sub="Same rules, same settings, three different simulated markets. A strategy that only works on one of them is a warning sign.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#6b7686] text-left">
                <th className="pb-2 font-bold">History</th>
                <th className="pb-2 font-bold text-right">Return</th>
                <th className="pb-2 font-bold text-right">Worst drawdown</th>
                <th className="pb-2 font-bold text-right">Profit factor</th>
                <th className="pb-2 font-bold text-right">Win rate</th>
                <th className="pb-2 font-bold text-right">Trades</th>
                <th className="pb-2 font-bold text-right">Buy and hold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {histories.map(({ sc, res }) => (
                <tr key={sc.id} className={sc.id === scenario ? 'bg-[#F8F7FF]' : ''}>
                  <td className="py-2.5 font-semibold text-[#0b1c30]">{sc.label}{sc.id === scenario && <span className="ml-2 text-[10px] font-bold bg-[#EEF0FE] text-[#5338ec] px-2 py-0.5 rounded-full">current</span>}</td>
                  <td className={`py-2.5 text-right font-mono font-bold ${res.metrics.returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{signedPct(res.metrics.returnPct)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{pct(res.metrics.maxDrawdownPct)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{ratio(res.metrics.profitFactor)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{pct(res.metrics.winRate, 0)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{res.metrics.trades}</td>
                  <td className="py-2.5 text-right font-mono text-[#6b7686]">{signedPct(res.buyHoldPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={`text-xs mt-3 rounded-lg px-3 py-2 ${winners === 3 ? 'bg-emerald-50 text-emerald-800' : winners === 0 ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>
          {winners === 3 ? 'Made money on all three histories. A good sign, though simulated prices are not a real market.' : winners === 0 ? 'Lost money on all three histories.' : `Made money on ${winners} of 3 histories. Results depend a lot on which market it runs on.`}
        </p>
      </Card>

      <Card title="How much do costs matter" sub="The same trades with spread, slippage and commission scaled up. Fast strategies can look fine until costs rise.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#6b7686] text-left">
                <th className="pb-2 font-bold">Costs</th>
                <th className="pb-2 font-bold text-right">Net profit</th>
                <th className="pb-2 font-bold text-right">Return</th>
                <th className="pb-2 font-bold text-right">Profit factor</th>
                <th className="pb-2 font-bold text-right">Worst drawdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {costs.map(({ mult, res }) => (
                <tr key={mult} className={mult === 1 ? 'bg-[#F8F7FF]' : ''}>
                  <td className="py-2.5 font-semibold text-[#0b1c30]">{mult === 0 ? 'No costs' : mult === 1 ? 'Your settings' : `${mult}× your settings`}</td>
                  <td className={`py-2.5 text-right font-mono font-bold ${res.metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(res.metrics.netProfit)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{signedPct(res.metrics.returnPct)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{ratio(res.metrics.profitFactor)}</td>
                  <td className="py-2.5 text-right font-mono text-[#0b1c30]">{pct(res.metrics.maxDrawdownPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
