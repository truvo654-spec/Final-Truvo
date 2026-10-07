import React, { useMemo, useState } from 'react';
import { Strategy } from './engine/types';
import { runBacktest } from './engine/backtest';
import { generateBars } from './engine/marketData';
import { TEMPLATES, cloneStrategy } from './engine/templates';
import { LineChart } from './StrategyCharts';
import { money, pct, ratio, signedPct } from './format';
import { Switch } from './ui';

const COLORS = ['#5338ec', '#0d9488', '#be185d', '#d97706'];

interface Entry {
  key: string;
  name: string;
  tag: string;
  strategy: Strategy;
}

export const CompareTab: React.FC<{ current: Strategy; saved: Strategy[]; scenario: number }> = ({ current, saved, scenario }) => {
  const entries: Entry[] = useMemo(
    () => [
      { key: 'current', name: current.name || 'Current strategy', tag: 'Open now', strategy: current },
      ...saved.filter((s) => s.id !== current.id).map((s) => ({ key: `saved:${s.id}`, name: s.name, tag: 'Saved', strategy: s })),
      ...TEMPLATES.filter((t) => t.id !== 'blank').map((t) => ({ key: `tpl:${t.id}`, name: t.name, tag: 'Template', strategy: t.build() })),
    ],
    [current, saved]
  );
  const [picked, setPicked] = useState<string[]>(['current', 'tpl:rsi-reversion']);
  const [sameMarket, setSameMarket] = useState(true);

  const rows = useMemo(
    () =>
      picked
        .map((k) => entries.find((e) => e.key === k))
        .filter((e): e is Entry => !!e)
        .map((e, i) => {
          const s = cloneStrategy(e.strategy);
          if (sameMarket) {
            s.instrument = current.instrument;
            s.timeframe = current.timeframe;
            s.period = current.period;
            s.capital = current.capital;
            s.costs = { ...current.costs };
          }
          const bars = generateBars(s.instrument, s.timeframe, s.period, scenario);
          return { entry: e, color: COLORS[i % COLORS.length], res: runBacktest(s, bars) };
        }),
    [picked, entries, sameMarket, current, scenario]
  );

  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : p.length >= 4 ? p : [...p, k]));
  const longest = rows.reduce((a, b) => (b.res.bars.length > a.res.bars.length ? b : a), rows[0]);
  const series = rows.map((x) => ({ name: x.entry.name, color: x.color, values: x.res.equity.map((v) => (v / x.res.strategy.capital - 1) * 100) }));
  const sameLength = rows.length > 0 && rows.every((x) => x.res.bars.length === rows[0].res.bars.length);

  return (
    <div className="space-y-4">
      <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0b1c30]">Pick up to 4 strategies</h3>
            <p className="text-xs text-[#6b7686] mt-0.5">Your open strategy, anything you saved, and the built-in templates.</p>
          </div>
          <Switch checked={sameMarket} onChange={setSameMarket} label="Test all on the same market, period and costs" />
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {entries.map((e) => {
            const on = picked.includes(e.key);
            return (
              <label key={e.key} className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${on ? 'border-[#5338ec] bg-[#F8F7FF]' : 'border-slate-200 hover:border-[#5338ec]'} ${!on && picked.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="checkbox" checked={on} disabled={!on && picked.length >= 4} onChange={() => toggle(e.key)} className="rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
                <span className="min-w-0 flex-1 text-sm font-semibold text-[#0b1c30] truncate">{e.name}</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{e.tag}</span>
              </label>
            );
          })}
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="text-sm text-[#474556] text-center py-8">Pick at least one strategy above.</p>
      ) : (
        <>
          <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-bold text-[#0b1c30]">Return over time</h3>
            <p className="text-xs text-[#6b7686] mt-0.5 mb-3">Percent gained or lost since the start.{!sameLength && ' The strategies use different periods, so the dates only line up for the longest one.'}</p>
            <LineChart times={longest.res.bars.map((b) => b.t)} series={series} zeroLine yFormat={(v) => `${v.toFixed(0)}%`} ariaLabel="Return of each compared strategy" />
            <div className="flex flex-wrap gap-4 mt-2">
              {rows.map((x) => <span key={x.entry.key} className="flex items-center gap-1.5 text-xs text-[#474556]"><span className="w-3 h-1.5 rounded-full" style={{ background: x.color }} />{x.entry.name}</span>)}
            </div>
          </section>

          <section className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#6b7686] text-left">
                  <th className="pb-2 font-bold">Strategy</th>
                  <th className="pb-2 font-bold text-right">Net profit</th>
                  <th className="pb-2 font-bold text-right">Return</th>
                  <th className="pb-2 font-bold text-right">Worst drawdown</th>
                  <th className="pb-2 font-bold text-right">Sharpe</th>
                  <th className="pb-2 font-bold text-right">Profit factor</th>
                  <th className="pb-2 font-bold text-right">Win rate</th>
                  <th className="pb-2 font-bold text-right">Trades</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {rows.map(({ entry, color, res }) => (
                  <tr key={entry.key}>
                    <td className="py-2.5 font-semibold text-[#0b1c30]"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: color }} />{entry.name}</td>
                    <td className={`py-2.5 text-right font-mono font-bold ${res.metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(res.metrics.netProfit)}</td>
                    <td className="py-2.5 text-right font-mono text-[#0b1c30]">{signedPct(res.metrics.returnPct)}</td>
                    <td className="py-2.5 text-right font-mono text-[#0b1c30]">{pct(res.metrics.maxDrawdownPct)}</td>
                    <td className="py-2.5 text-right font-mono text-[#0b1c30]">{ratio(res.metrics.sharpe)}</td>
                    <td className="py-2.5 text-right font-mono text-[#0b1c30]">{ratio(res.metrics.profitFactor)}</td>
                    <td className="py-2.5 text-right font-mono text-[#0b1c30]">{pct(res.metrics.winRate, 0)}</td>
                    <td className="py-2.5 text-right font-mono text-[#0b1c30]">{res.metrics.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
};
