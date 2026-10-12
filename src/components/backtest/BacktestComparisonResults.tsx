import React, { useMemo } from 'react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { computeMetrics } from '../../backtest/metrics';
import { liveStats } from '../../backtest/gap';
import { money, num, pct, rr, tone, utcWindow } from '../../backtest/format';
import { SESSIONS } from '../../backtest/types';
import { Card, btnSecondary } from './ui';
import { JournalTradeBenchmark } from './JournalTradeBenchmark';
import type { BacktestSettings, JobOutput } from '../../backtest/types';

export interface BacktestComparisonItem {
  settings: BacktestSettings;
  output: JobOutput;
}

interface Props {
  items: BacktestComparisonItem[];
  playbooks: JournalPlaybook[];
  entries: JournalEntry[];
  benchmarkEntries: JournalEntry[];
  tz: string;
  onOpenTrades: (ids: string[], label: string) => void;
  onEditSetup: () => void;
  onViewResult: (item: BacktestComparisonItem) => void;
}

export const BacktestComparisonResults: React.FC<Props> = ({ items, playbooks, entries, benchmarkEntries, tz, onOpenTrades, onEditSetup, onViewResult }) => {
  const rows = useMemo(() => items.map((item) => {
    const { settings, output } = item;
    const result = output.result;
    const metrics = computeMetrics(result.trades, result.startBalance, result.rangeStart, result.rangeEnd);
    const playbook = playbooks.find((p) => p.id === settings.playbookId);
    const matchingEntries = playbook ? entries.filter((e) => e.strategy === playbook.name) : [];
    const live = playbook ? liveStats(entries, playbook.name) : null;
    const session = settings.session.id === 'any'
      ? 'Any time'
      : `${settings.session.id === 'custom' ? 'Custom hours' : SESSIONS[settings.session.id].label} ${utcWindow(settings.session.start, settings.session.end, tz)}`;
    return { item, metrics, playbook, matchingEntries, live, session, currency: result.currency };
  }), [items, playbooks, entries, tz]);

  const shared = items[0]?.settings;
  if (!shared) return null;

  return (
    <div className="space-y-5">
      {benchmarkEntries.length > 0 && <JournalTradeBenchmark entries={benchmarkEntries} />}
      <Card title="Playbook comparison" sub="Each playbook used the same market, dates, balance, risk and costs; its own rules, timeframe and session were preserved."
        right={<button type="button" className={btnSecondary} onClick={onEditSetup}>Edit comparison setup</button>}>
        <p className="mb-3 text-[11px] text-slate-500">Historical simulations are comparisons, not forecasts. Open a full report for robustness checks and the simulated trade log.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-xs tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-3">Playbook</th>
                <th className="px-3 py-2">Timeframe / session</th>
                <th className="px-3 py-2 text-right">Net P&amp;L / ROI</th>
                <th className="px-3 py-2 text-right">Win rate</th>
                <th className="px-3 py-2 text-right">Average R</th>
                <th className="px-3 py-2 text-right">Profit factor</th>
                <th className="px-3 py-2 text-right">Max drawdown</th>
                <th className="px-3 py-2 text-right">Trades</th>
                <th className="px-3 py-2">Live journal</th>
                <th className="py-2 pl-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, metrics: m, playbook, matchingEntries, live, session, currency }) => (
                <tr key={item.settings.playbookId} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-bold text-[#0b1c30]">{playbook?.name ?? item.settings.name}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{item.settings.symbol} · {item.settings.from} → {item.settings.to}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.settings.timeframe}<p className="mt-0.5 text-[10px] text-slate-500">{session}</p></td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <span className={`font-bold ${tone(m.netPnl)}`}>{money(m.netPnl, currency, 0)}</span>
                    <p className="mt-0.5 text-[10px] text-slate-500">{pct(m.netPct, 1, true)}</p>
                  </td>
                  <td className="px-3 py-3 text-right">{m.trades ? pct(m.winRate, 0) : '—'}</td>
                  <td className={`px-3 py-3 text-right font-semibold ${tone(m.avgR)}`}>{m.trades ? rr(m.avgR) : '—'}</td>
                  <td className="px-3 py-3 text-right">{m.trades ? (m.profitFactor === null ? '∞' : num(m.profitFactor)) : '—'}</td>
                  <td className="px-3 py-3 text-right text-rose-600">{m.trades ? pct(-m.maxDDPct) : '—'}</td>
                  <td className="px-3 py-3 text-right">{m.trades}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{live?.trades ? <>{pct(live.winRate, 0)} · {rr(live.avgR)}<p className="mt-0.5 text-[10px] text-slate-500">{live.trades} closed</p></> : <span className="text-slate-400">No eligible trades</span>}</td>
                  <td className="py-3 pl-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <button type="button" className="font-semibold text-[#5338ec] hover:underline" onClick={() => onViewResult(item)}>Full report</button>
                      {matchingEntries.length > 0 && <button type="button" className="font-semibold text-[#5338ec] hover:underline" onClick={() => onOpenTrades(matchingEntries.map((e) => e.id), `${playbook?.name ?? 'Playbook'} journal`)}>Trade Log ({matchingEntries.length})</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
