// Backtesting home: three plain questions, your playbooks tested vs live, usage, practice and recent runs.
import React, { useMemo } from 'react';
import { Coins, Award, History } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { EXTRA_RUN_CREDITS, POINTS } from '../../backtest/config';
import { healthOf, HEALTH_LABEL, liveStats } from '../../backtest/gap';
import { pct, rr, money, dateOnly } from '../../backtest/format';
import type { BacktestRun, PlaybookExpectedStats, ReplaySession, Usage } from '../../backtest/store';
import { Card, Pill, btnLink, btnSecondary } from './ui';

interface Props {
  playbooks: JournalPlaybook[];
  entries: JournalEntry[];
  expected: Record<string, PlaybookExpectedStats>;
  runs: BacktestRun[];
  usage: Usage;
  limit: number;
  credits: number;
  sessions: ReplaySession[];
  tz: string;
  onTest: (playbookId?: string) => void;
  onWhatIf: () => void;
  onReplay: () => void;
  onOpenRun: (id: string) => void;
  onAllRuns: () => void;
}

const MODES = [
  { key: 'test', title: 'Test a playbook on past prices', text: 'Pick a playbook, press Run. Your rules are checked bar by bar over up to two years of prices, with costs.', cta: 'Start a backtest', time: 'About 10 seconds' },
  { key: 'whatif', title: 'What if I followed one rule?', text: 'Change one rule on your real journal trades, like "stop after 2 losses a day", and see what it would have changed.', cta: 'Try a what-if', time: 'Instant · free' },
  { key: 'replay', title: 'Practice on past charts', text: 'Trade bar by bar with the future hidden. Replay your own losing trades blind and earn Points.', cta: 'Start practising', time: 'Free · earns Points' },
] as const;

export const BacktestHome: React.FC<Props> = ({ playbooks, entries, expected, runs, usage, limit, credits, sessions, tz, onTest, onWhatIf, onReplay, onOpenRun, onAllRuns }) => {
  const rows = useMemo(() => playbooks.filter((p) => p.status !== 'archived').map((p) => {
    const live = liveStats(entries, p.name);
    const exp = expected[p.id];
    return { p, live, exp, h: healthOf(live, exp) };
  }), [playbooks, entries, expected]);

  const weekAgo = Date.now() - 7 * 86400000;
  const week = sessions.filter((s) => s.finishedAt && Date.parse(s.finishedAt) >= weekAgo);
  const left = Math.max(0, limit - usage.used) + usage.prepaid;
  const act = { test: () => onTest(), whatif: onWhatIf, replay: onReplay };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map(({ key, title, text, cta, time }, i) => (
          <button key={key} type="button" onClick={act[key]} className="group text-left bg-white border border-[#e2e8f0] rounded-2xl p-5 hover:border-[#5338ec] hover:shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5338ec] mb-1.5">{['Backtest', 'What-if', 'Practice'][i]}</p>
            <p className="text-base font-bold text-[#0b1c30] mb-1">{title}</p>
            <p className="text-xs text-[#474556] leading-relaxed mb-4">{text}</p>
            <span className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#5338ec]">{cta} →</span>
              <span className="text-slate-400">{time}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
        <Card title="Your playbooks: tested vs live" sub="Live numbers come from your journal. Tested numbers come from the backtest you saved for that playbook.">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs tabular-nums">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2 pr-2">Playbook</th>
                  <th className="text-right py-2 px-2" title="Win rate and average R of your real trades with this playbook">Live</th>
                  <th className="text-right py-2 px-2" title="Win rate and average R from the saved backtest">Tested</th>
                  <th className="text-left py-2 px-2" title="On track: live results are inside the range the backtest predicts. Underperforming: below it.">Status</th>
                  <th className="py-2 pl-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ p, live, exp, h }) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-2"><p className="font-bold text-[#0b1c30]">{p.name}</p><p className="text-[10px] text-slate-400">{p.grade} · {p.status === 'testing' ? 'testing' : 'active'}</p></td>
                    <td className="py-2.5 px-2 text-right">{live.trades ? <><b>{pct(live.winRate, 0)}</b> · {rr(live.avgR)}<p className="text-[10px] text-slate-400">{live.trades} trades</p></> : <span className="text-slate-400">No trades</span>}</td>
                    <td className="py-2.5 px-2 text-right">{exp ? <><b>{pct(exp.winRate, 0)}</b> · {rr(exp.avgR)}<p className="text-[10px] text-slate-400">{exp.trades} trades · {exp.symbol}</p></> : <span className="text-slate-400">—</span>}</td>
                    <td className="py-2.5 px-2"><Pill tone={h.health === 'on-track' ? 'good' : h.health === 'behind' ? 'bad' : 'neutral'} title={h.health === 'behind' ? `Live average is ${rr(h.gapR)} vs the backtest` : undefined}>{HEALTH_LABEL[h.health]}</Pill></td>
                    <td className="py-2.5 pl-2 text-right"><button type="button" className={`${btnSecondary} h-8`} onClick={() => onTest(p.id)}>{exp ? 'Re-test' : 'Test'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="Test runs this month" sub="Automated backtests included in your plan.">
            <p className="text-2xl font-bold tabular-nums text-[#0b1c30]">{Math.min(usage.used, limit)} <span className="text-sm font-semibold text-slate-400">of {limit} used</span></p>
            <div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(usage.used, limit)} aria-label="Runs used this month">
              <div className="h-full bg-[#5338ec] rounded-full" style={{ width: `${Math.min(100, (usage.used / Math.max(1, limit)) * 100)}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" /> Need more? Spend {EXTRA_RUN_CREDITS} Syde Credits per extra run. You have {credits.toLocaleString('en-US')}.</p>
            {usage.prepaid > 0 && <p className="text-[11px] text-emerald-700 mt-1">{usage.prepaid} extra run{usage.prepaid === 1 ? '' : 's'} already paid for.</p>}
            {left <= 0 && <p className="text-[11px] text-slate-500 mt-1">What-if and practice replay stay free.</p>}
          </Card>
          <Card title="Practice" sub="Replay sessions finished in the last 7 days.">
            <div className="flex items-end gap-6">
              <div><p className="text-2xl font-bold tabular-nums">{week.length}</p><p className="text-[11px] text-slate-500">sessions</p></div>
              <div><p className="text-2xl font-bold tabular-nums flex items-center gap-1"><Award className="w-5 h-5 text-amber-500" />{week.filter((s) => s.pointsAwarded).length * POINTS.replaySession}</p><p className="text-[11px] text-slate-500">Points earned</p></div>
            </div>
            <button type="button" className={`${btnLink} mt-3`} onClick={onReplay}>Practise now →</button>
          </Card>
          <Card title="Recent runs" right={runs.length > 0 ? <button type="button" className={btnLink} onClick={onAllRuns}>See all</button> : undefined}>
            {runs.length === 0 ? (
              <div className="text-center py-4">
                <History className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No saved runs yet. Save a backtest to keep it here.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {runs.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => onOpenRun(r.id)} className="w-full text-left rounded-xl border border-slate-200 px-3 py-2 hover:border-[#5338ec]">
                      <p className="text-xs font-bold text-[#0b1c30] truncate">{r.name}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">{r.symbol} · {r.summary.trades} trades · <span className={r.summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{money(r.summary.net, r.settings.risk.currency, 0)}</span> · {dateOnly(Date.parse(r.lastRun), tz)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
