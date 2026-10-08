// "Backtest vs live" on a playbook page, and the "Strategy health" widget for the journal overview.
import React, { useMemo } from 'react';
import { FlaskConical, HeartPulse } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { PlaybookExpectedStats } from '../../backtest/store';
import { healthOf, HEALTH_LABEL, liveStats } from '../../backtest/gap';
import { dateOnly, num, pct, rr } from '../../backtest/format';
import { LineChart } from './charts';
import { Pill, btnSecondary } from './ui';

const toneOf = (h: string) => (h === 'on-track' ? 'good' : h === 'behind' ? 'bad' : 'neutral') as 'good' | 'bad' | 'neutral';

export const PlaybookBacktestPanel: React.FC<{ playbook: JournalPlaybook; entries: JournalEntry[]; expected?: PlaybookExpectedStats; onBacktest: () => void }> = ({ playbook, entries, expected, onBacktest }) => {
  const live = useMemo(() => liveStats(entries, playbook.name), [entries, playbook.name]);
  const h = healthOf(live, expected);
  if (!expected) {
    return (
      <div className="rounded-xl border border-dashed border-[#5338ec]/30 bg-[#FBFAFF] p-4 flex flex-wrap items-center gap-3">
        <FlaskConical className="w-5 h-5 text-[#5338ec]" aria-hidden />
        <div className="flex-1 min-w-[12rem]">
          <p className="text-sm font-bold text-[#0b1c30]">Backtest vs live</p>
          <p className="text-xs text-[#474556]">Test this playbook on past prices to see what to expect, then track your live trades against it.</p>
        </div>
        <button type="button" onClick={onBacktest} className="h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-xs font-semibold text-white">Backtest this playbook</button>
      </div>
    );
  }
  const n = live.trades;
  const band = Array.from({ length: Math.max(2, n + 1) }, (_, k) => ({ x: k, lo: expected.avgR * k - 2 * expected.stdR * Math.sqrt(k), hi: expected.avgR * k + 2 * expected.stdR * Math.sqrt(k) }));
  const rows: [string, string, string, string][] = [
    ['Win rate', 'Winning trades ÷ all trades', pct(expected.winRate, 0), n ? pct(live.winRate, 0) : '—'],
    ['Average R', 'Average result per trade in units of risk', rr(expected.avgR), n ? rr(live.avgR) : '—'],
    ['Profit factor', 'Gross profit ÷ gross loss', num(expected.pf), n ? num(live.pf) : '—'],
    ['Max drawdown', 'Largest fall from a high', pct(-expected.maxDDPct), n ? pct(-live.maxDDPct) : '—'],
    ['Trades', 'Sample size', `${expected.trades}`, `${n}`],
  ];
  return (
    <div className="rounded-xl border border-slate-200 p-4 space-y-3" aria-label="Backtest vs live">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-bold text-[#0b1c30] mr-auto">Backtest vs live</h4>
        <Pill tone={toneOf(h.health)} title="On track while your live cumulative R stays inside the range the backtest predicts (average ± 2 standard deviations).">{HEALTH_LABEL[h.health]}</Pill>
        <button type="button" onClick={onBacktest} className={`${btnSecondary} h-8`}>Re-test</button>
      </div>
      <p className="text-[11px] text-slate-500">Expected from "{expected.runName}" ({expected.symbol}, saved {dateOnly(Date.parse(expected.savedAt))}).</p>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
        <table className="w-full text-xs tabular-nums self-start">
          <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200"><th className="text-left py-1.5">Measure</th><th className="text-right py-1.5">Expected</th><th className="text-right py-1.5">Live</th></tr></thead>
          <tbody>{rows.map(([k, hint, e, l]) => <tr key={k} className="border-b border-slate-100"><td className="py-1.5 font-semibold" title={hint}>{k}</td><td className="py-1.5 text-right">{e}</td><td className="py-1.5 text-right font-bold">{l}</td></tr>)}</tbody>
        </table>
        <div className="min-w-0">
          {n > 0 ? (
            <LineChart label="Live cumulative R against the backtest's expected range" area={false} height={170} xFmt={(x) => `Trade ${Math.round(x)}`} yFmt={(y) => rr(y, 0)}
              band={{ color: '#5338ec', points: band, label: 'Expected range' }}
              series={[{ name: 'Your live trades (cumulative R)', color: '#0b1c30', points: [{ x: 0, y: 0 }, ...live.cumR.map((y, i) => ({ x: i + 1, y }))] }]} />
          ) : <p className="text-xs text-slate-500">No live trades with this playbook yet.</p>}
        </div>
      </div>
    </div>
  );
};

export const StrategyHealthCard: React.FC<{ playbooks: JournalPlaybook[]; entries: JournalEntry[]; expected: Record<string, PlaybookExpectedStats>; onOpen: () => void }> = ({ playbooks, entries, expected, onOpen }) => {
  const rows = useMemo(() => playbooks.filter((p) => expected[p.id]).map((p) => {
    const live = liveStats(entries, p.name);
    return { p, live, h: healthOf(live, expected[p.id]) };
  }).sort((a, b) => a.h.gapR - b.h.gapR), [playbooks, entries, expected]);
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
      <h4 className="text-sm font-bold mb-1 flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-[#5338ec]" /> Strategy health</h4>
      <p className="text-[11px] text-slate-500 mb-3">Live results vs each playbook's backtest, biggest gap first.</p>
      {rows.length === 0 ? (
        <>
          <p className="text-xs text-[#474556]">No playbook has a saved backtest yet. Test one to see if your live trading matches it.</p>
          <button type="button" onClick={onOpen} className="mt-2 text-xs font-semibold text-[#5338ec] hover:underline">Test a playbook</button>
        </>
      ) : (
        <ul className="space-y-2.5">
          {rows.map(({ p, live, h }) => (
            <li key={p.id} className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#0b1c30] flex-1 truncate">{p.name}</span>
              <span className={`tabular-nums ${h.gapR < 0 ? 'text-rose-600' : 'text-emerald-600'}`} title={`Live ${rr(live.avgR)} vs expected ${rr(expected[p.id].avgR)} per trade`}>{h.health === 'too-few' ? `${live.trades} trades` : `${rr(h.gapR)}/trade`}</span>
              <Pill tone={toneOf(h.health)}>{HEALTH_LABEL[h.health]}</Pill>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 0 && <button type="button" onClick={onOpen} className="mt-3 text-xs font-semibold text-[#5338ec] hover:underline">Open Backtest</button>}
    </div>
  );
};
