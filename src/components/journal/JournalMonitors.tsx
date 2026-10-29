import { JournalHelp } from './JournalHelp';
import React, { useMemo } from 'react';
import { JournalEntry } from '../../types';
import { eligible, resultOf, statusOf } from './journalMath';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { resolvePlaybookTradingRules, type GlobalTradingRules, type JournalRules } from '../../data/tradingRules';
export type { GlobalTradingRules, JournalRules } from '../../data/tradingRules';

const NEGATIVE_EMOTIONS = ['Anxious', 'FOMO', 'Greedy', 'Frustrated'];

const bar = (pct: number, color: string) => (
  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" role="presentation">
    <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color }} />
  </div>
);

/* ───────────────────────── Discipline ───────────────────────── */

export function computeDiscipline(entries: JournalEntry[], checklistLength: number) {
  entries = entries.filter(e => typeof e.followedPlan === 'boolean' && (e.mistakesReviewed === true || (e.mistakesReviewed === undefined && e.emotionBefore && e.emotionAfter && e.rating != null)));
  if (!entries.length) return null;
  const plan = entries.filter((e) => e.followedPlan).length / entries.length;
  const checklist = checklistLength
    ? entries.reduce((a, e) => a + Math.min(1, e.checklistDone.length / checklistLength), 0) / entries.length
    : 1;
  const clean = entries.filter((e) => e.mistakes.length === 0).length / entries.length;
  const score = Math.round((plan * 0.5 + checklist * 0.3 + clean * 0.2) * 100);
  // current run of plan-following trades, newest first
  const newestFirst = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let run = 0;
  for (const e of newestFirst) { if (e.followedPlan) run++; else break; }
  return { score, plan: Math.round(plan * 100), checklist: Math.round(checklist * 100), clean: Math.round(clean * 100), run };
}

export const DisciplineCard: React.FC<{ entries: JournalEntry[]; checklistLength: number }> = ({ entries, checklistLength }) => {
  const d = useMemo(() => computeDiscipline(entries, checklistLength), [entries, checklistLength]);
  const tone = !d ? '#94a3b8' : d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#f43f5e';
  const label = !d ? 'No data' : d.score >= 80 ? 'Strong' : d.score >= 60 ? 'Slipping' : 'Needs work';
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold">Discipline<JournalHelp label="Discipline" /></h4>
          <p className="text-[11px] text-[#94a3b8]">In the selected range</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-mono leading-none" style={{ color: tone }}>{d ? d.score : '—'}</p>
          <p className="text-[10px] font-semibold text-[#474556] mt-1">{label}</p>
        </div>
      </div>
      {d ? (
        <div className="space-y-2.5">
          {([
            ['Plan followed', d.plan, '50%'],
            ['Checklist done', d.checklist, '30%'],
            ['Mistake-free trades', d.clean, '20%'],
          ] as const).map(([name, v, w]) => (
            <div key={name}>
              <div className="flex justify-between text-[11px] mb-1"><span className="text-[#474556]">{name} <span className="text-[#94a3b8]">· weight {w}</span></span><span className="font-mono font-semibold">{v}%</span></div>
              {bar(v, tone)}
            </div>
          ))}
          <p className="text-[11px] text-[#474556] pt-1">
            {d.run > 0 ? `${d.run} answered trade${d.run === 1 ? '' : 's'} in a row on plan.` : 'Latest answered trade off plan.'} Unanswered reviews are excluded, not counted as mistake-free.
          </p>
        </div>
      ) : (
        <p className="text-xs text-[#474556]">No sufficiently answered reviews in this range yet.</p>
      )}
    </div>
  );
};

/* ───────────────────── Personal rules monitor ───────────────────── */

export function checkRules(entries: JournalEntry[], rules: JournalRules, enabled: Record<keyof JournalRules, boolean> = { maxRisk: true, maxDailyLoss: true, maxTrades: true, stopAfterLosses: true }) {
  entries = entries.filter(e => statusOf(e) !== 'planned');
  const byDay = new Map<string, JournalEntry[]>();
  entries.forEach((e) => byDay.set(e.date, [...(byDay.get(e.date) || []), e]));
  const tooMany: string[] = [];
  const keptTrading: string[] = [];
  byDay.forEach((list, date) => {
    const ordered = [...list].sort((a, b) => (a.entryTime || '').localeCompare(b.entryTime || ''));
    if (enabled.maxTrades && ordered.length > rules.maxTrades) tooMany.push(date);
    let losses = 0;
    for (let i = 0; i < ordered.length; i++) {
      if (enabled.stopAfterLosses && losses >= rules.stopAfterLosses) { keptTrading.push(date); break; }
      if (eligible(ordered[i])) losses = resultOf(ordered[i]) === 'loss' ? losses + 1 : 0;
    }
  });
  return { tooMany, keptTrading };
}

interface RuleMonitorRow {
  name: string;
  limit: string;
  breaches: string[] | null;
}

interface RuleMonitorGroup {
  name: string;
  rows: RuleMonitorRow[];
}

export const RulesMonitor: React.FC<{ entries: JournalEntry[]; playbooks: JournalPlaybook[]; defaults: GlobalTradingRules; onEdit: () => void }> = ({ entries, playbooks, defaults, onEdit }) => {
  const groups = useMemo(() => {
    const groups = playbooks
      .map(playbook => ({ name: playbook.name, entries: entries.filter(entry => entry.strategy === playbook.name), settings: resolvePlaybookTradingRules(playbook, defaults) }))
      .filter(group => group.entries.length);
    const linkedNames = new Set(playbooks.map(playbook => playbook.name));
    const unlinked = entries.filter(entry => !linkedNames.has(entry.strategy));
    if (unlinked.length) groups.push({ name: 'Other strategies', entries: unlinked, settings: { values: defaults, enabled: { maxRisk: true, maxDailyLoss: true, maxTrades: true, stopAfterLosses: true }, customRules: [] } });
    if (!groups.length) groups.push({ name: 'Default rules', entries: [], settings: { values: defaults, enabled: { maxRisk: true, maxDailyLoss: true, maxTrades: true, stopAfterLosses: true }, customRules: [] } });

    return groups.map(group => {
      const result = checkRules(group.entries, group.settings.values, group.settings.enabled);
      const rows = [
        group.settings.enabled.maxTrades && {
          name: `Max trades per day · ${group.name}`,
          limit: String(group.settings.values.maxTrades),
          breaches: group.entries.some(entry => statusOf(entry) !== 'planned') ? result.tooMany : null,
        },
        group.settings.enabled.stopAfterLosses && {
          name: `Stop after consecutive losses · ${group.name}`,
          limit: String(group.settings.values.stopAfterLosses),
          breaches: group.entries.length && group.entries.every(entry => entry.entryTime && eligible(entry)) ? result.keptTrading : null,
        },
        group.settings.enabled.maxRisk && {
          name: `Max risk per trade · ${group.name}`,
          limit: `${group.settings.values.maxRisk}% of account`,
          breaches: null,
        },
        group.settings.enabled.maxDailyLoss && {
          name: `Max daily loss · ${group.name}`,
          limit: `${group.settings.values.maxDailyLoss}% of account`,
          breaches: null,
        },
      ].filter((row): row is RuleMonitorRow => !!row);
      return { name: group.name, rows };
    }).filter(group => group.rows.length > 0);
  }, [entries, playbooks, defaults]);
  const total = groups.reduce((sum, group) => sum + group.rows.reduce((rowTotal, row) => rowTotal + (row.breaches?.length ?? 0), 0), 0);
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold">Personal rules<JournalHelp label="Personal rules" /></h4>
          <p className="text-[11px] text-[#94a3b8]">Checked against entries for each playbook</p>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${total ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
          {total ? `${total} breach${total === 1 ? '' : 'es'}` : groups.length ? 'No known breaches · incomplete' : 'No active rules'}
        </span>
      </div>
      {groups.length > 0 && <ul className="space-y-2">
        {groups.map(group => {
          const breaches = group.rows.reduce((sum, row) => sum + (row.breaches?.length ?? 0), 0);
          const unknown = group.rows.filter(row => row.breaches === null).length;
          return <li key={group.name} className="rounded-lg border border-slate-100 px-3">
            <details>
              <summary className="flex cursor-pointer items-center justify-between gap-3 py-2 text-xs font-semibold text-[#0b1c30]">
                <span>{group.name} · {group.rows.length} active rule{group.rows.length === 1 ? '' : 's'}</span>
                <span className={breaches ? 'text-rose-600' : 'text-slate-500'}>{breaches ? `${breaches} breach${breaches === 1 ? '' : 'es'}` : unknown ? `${unknown} need evidence` : 'No known breaches'}</span>
              </summary>
              <ul className="space-y-2 pb-3">
                {group.rows.map(row => <li key={row.name} className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-[#0b1c30]">{row.name}<JournalHelp label={row.name} /></p>
                    <p className="text-[11px] text-[#94a3b8]">Limit {row.limit}{row.breaches && row.breaches.length ? ` · ${row.breaches.slice(0, 3).join(', ')}${row.breaches.length > 3 ? '…' : ''}` : ''}</p>
                  </div>
                  {row.breaches === null ? (
                    <span className="shrink-0 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5" title="Required risk, equity history, or complete timestamped results are not available for this rule">Unknown</span>
                  ) : row.breaches.length ? (
                    <span className="shrink-0 text-[10px] font-bold text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">{row.breaches.length} day{row.breaches.length === 1 ? '' : 's'}</span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">Kept</span>
                  )}
                </li>)}
              </ul>
            </details>
          </li>;
        })}
      </ul>}
      <button onClick={onEdit} className="mt-3 text-xs font-semibold text-[#5338ec] hover:underline">Manage rules by playbook</button>
    </div>
  );
};

/* ───────────────────────── Tilt monitor ───────────────────────── */

export function computeTilt(entries: JournalEntry[], playbooks: JournalPlaybook[], defaults: GlobalTradingRules) {
  const recent = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  if (!recent.length) return null;
  const signals: string[] = [];
  let streak = 0;
  for (const e of recent) { if (e.outcome === 'loss') streak++; else break; }
  if (streak >= 2) signals.push(`${streak} losses in a row`);
  const negative = recent.filter((e) => NEGATIVE_EMOTIONS.includes(e.emotionBefore)).length;
  if (negative >= 2) signals.push(`${negative} of ${recent.length} trades started anxious, greedy, FOMO or frustrated`);
  const off = recent.filter((e) => e.followedPlan === false).length;
  if (off >= 2) signals.push(`${off} of ${recent.length} trades off plan`);
  const revenge = recent.filter((e) => e.mistakes.includes('Revenge trade') || e.tags.includes('Revenge') || e.tags.includes('Overtraded')).length;
  if (revenge >= 1) signals.push(`${revenge} flagged revenge or overtrading`);
  const byStrategy = new Map<string, JournalEntry[]>();
  recent.forEach(entry => byStrategy.set(entry.strategy, [...(byStrategy.get(entry.strategy) || []), entry]));
  byStrategy.forEach((trades, strategy) => {
    const playbook = playbooks.find(item => item.name === strategy);
    const settings = playbook ? resolvePlaybookTradingRules(playbook, defaults) : { values: defaults, enabled: { maxRisk: true, maxDailyLoss: true, maxTrades: true, stopAfterLosses: true }, customRules: [] };
    if (settings.enabled.stopAfterLosses && checkRules(trades, settings.values, settings.enabled).keptTrading.length) {
      signals.push(`Traded past the ${strategy} stop-after-losses rule`);
    }
  });
  const level = signals.length >= 4 ? 'high' : signals.length >= 2 ? 'elevated' : 'calm';
  return { level, signals, sample: recent.length } as const;
}

export const TiltMonitor: React.FC<{ entries: JournalEntry[]; playbooks: JournalPlaybook[]; defaults: GlobalTradingRules }> = ({ entries, playbooks, defaults }) => {
  const t = useMemo(() => computeTilt(entries, playbooks, defaults), [entries, playbooks, defaults]);
  const style = !t
    ? { label: 'No data', cls: 'bg-slate-100 text-slate-500', dot: '#94a3b8' }
    : t.level === 'high'
    ? { label: 'High tilt', cls: 'bg-rose-50 text-rose-600', dot: '#f43f5e' }
    : t.level === 'elevated'
    ? { label: 'Elevated', cls: 'bg-amber-50 text-amber-700', dot: '#f59e0b' }
    : { label: t && t.signals.length===0 && entries.some(e=>e.emotionBefore==null || e.followedPlan==null) ? 'Incomplete evidence' : 'Steady', cls: 'bg-slate-100 text-slate-600', dot: '#94a3b8' };
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5" role="status" aria-label={`Tilt monitor: ${style.label}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold">Tilt monitor<JournalHelp label="Tilt monitor" /></h4>
          <p className="text-[11px] text-[#94a3b8]">{t ? `Your last ${t.sample} entr${t.sample === 1 ? 'y' : 'ies'}` : 'Needs at least one entry'}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${style.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} aria-hidden="true" />{style.label}
        </span>
      </div>
      {t && t.signals.length > 0 ? (
        <ul className="space-y-1.5 text-xs text-[#474556] list-disc pl-4">
          {t.signals.map((s) => <li key={s}>{s}</li>)}
        </ul>
      ) : (
        <p className="text-xs text-[#474556]">{t ? 'No tilt signals in your recent trades.' : 'Add entries to start monitoring.'}</p>
      )}
      {t && t.level !== 'calm' && (
        <p className="mt-3 text-[11px] font-semibold text-[#0b1c30] bg-slate-50 rounded-lg px-3 py-2">
          Consider stepping away before the next trade. Review your checklist first.
        </p>
      )}
    </div>
  );
};
