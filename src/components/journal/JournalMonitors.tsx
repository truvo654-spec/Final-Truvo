import { JournalHelp } from './JournalHelp';
import React, { useMemo } from 'react';
import { JournalEntry } from '../../types';
import { currencyOf, eligible, netOf, resultOf, statusOf, timestampMs } from './journalMath';

export interface JournalRules {
  maxRisk: number;
  maxDailyLoss: number;
  maxTrades: number;
  stopAfterLosses: number;
}

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
  const covered = entries.filter(e => e.checklistSnapshot);
  const checklist = covered.length ? covered.reduce((sum,e) => {
    const snapshot = e.checklistSnapshot!;
    return sum + (snapshot.length ? snapshot.filter(item=>e.checklistDone.includes(item.id)).length / snapshot.length : 1);
  }, 0) / covered.length : null;
  const clean = entries.filter((e) => e.mistakes.length === 0).length / entries.length;
  const score = Math.round((plan * 0.5 + (checklist ?? 0) * 0.3 + clean * 0.2) / (checklist === null ? 0.7 : 1) * 100);
  // current run of plan-following trades, newest first
  const newestFirst = [...entries].sort((a, b) => (b.entryTime || b.date).localeCompare(a.entryTime || a.date));
  let run = 0;
  for (const e of newestFirst) { if (e.followedPlan) run++; else break; }
  return { score, plan: Math.round(plan * 100), checklist: checklist === null ? null : Math.round(checklist * 100), checklistCoverage:covered.length, clean: Math.round(clean * 100), run };
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
              <div className="flex justify-between text-[11px] mb-1"><span className="text-[#474556]">{name} <span className="text-[#94a3b8]">· weight {w}</span></span><span className="font-mono font-semibold">{v === null ? 'Unknown' : `${v}%`}</span></div>
              {v !== null && bar(v, tone)}
            </div>
          ))}
          <p className="text-[11px] text-[#474556] pt-1">
            {d.run > 0 ? `${d.run} answered trade${d.run === 1 ? '' : 's'} in a row on plan.` : 'Latest answered trade off plan.'} Unanswered reviews are excluded. Checklist coverage: {d.checklistCoverage} saved snapshots; unknown checklist history is excluded from its weight, never regraded using current rules.
          </p>
        </div>
      ) : (
        <p className="text-xs text-[#474556]">No sufficiently answered reviews in this range yet.</p>
      )}
    </div>
  );
};

/* ───────────────────── Personal rules monitor ───────────────────── */

export function checkRules(entries: JournalEntry[], rules: JournalRules) {
  entries = entries.filter(e => statusOf(e) !== 'planned');
  const byDay = new Map<string, JournalEntry[]>();
  const accountKey = (e:JournalEntry) => `${e.accountId?.trim() || 'legacy-demo'} · ${currencyOf(e)}`;
  entries.forEach((e) => { const key = `${e.date} · ${accountKey(e)}`; byDay.set(key, [...(byDay.get(key) || []), e]); });
  const tooMany: string[] = [];
  const keptTrading: string[] = [];
  const riskBreaches: string[] = [], dailyBreaches: string[] = [];
  let riskCoverage=0, streakCoverage=0, dailyCoverage=0;
  for (const e of entries) if (Number.isFinite(e.initialRisk) && e.initialRisk! > 0 && Number.isFinite(e.equityAtEntry) && e.equityAtEntry! > 0) {
    riskCoverage++;
    if (e.initialRisk! / e.equityAtEntry! * 100 > rules.maxRisk) riskBreaches.push(`${e.date} · ${accountKey(e)}`);
  }
  byDay.forEach((list, date) => {
    if (list.length > rules.maxTrades) tooMany.push(date);
    for (const entry of list) {
      if (!entry.entryTime || !Number.isFinite(timestampMs(entry.entryTime))) continue;
      const at=timestampMs(entry.entryTime), day=entry.entryTime.slice(0,10);
      const account=entries.filter(e=>accountKey(e)===accountKey(entry));
      const unknownClose=account.some(e=>statusOf(e)==='closed' && (!e.exitTime || !Number.isFinite(timestampMs(e.exitTime))) && e.date<=day);
      const closed=account.filter(e=>e.exitTime && Number.isFinite(timestampMs(e.exitTime)) &&
        timestampMs(e.exitTime)<at && e.exitTime.slice(0,10)===day && statusOf(e)==='closed')
        .sort((a,b)=>timestampMs(a.exitTime!)-timestampMs(b.exitTime!));
      if (!unknownClose) {
        streakCoverage++;
        let losses=0;
        for (const e of closed) losses=eligible(e) && resultOf(e)==='loss' ? losses+1 : 0;
        if (rules.stopAfterLosses>0 && losses>=rules.stopAfterLosses) keptTrading.push(date);
      }
      if (!unknownClose && closed.every(e=>eligible(e)) && Number.isFinite(entry.dayStartEquity) && entry.dayStartEquity!>0) {
        dailyCoverage++;
        if (-closed.reduce((sum,e)=>sum+netOf(e),0) / entry.dayStartEquity! * 100 >= rules.maxDailyLoss) dailyBreaches.push(date);
      }
    }
  });
  return { tooMany, keptTrading:[...new Set(keptTrading)], riskBreaches:[...new Set(riskBreaches)], dailyBreaches:[...new Set(dailyBreaches)], riskCoverage, streakCoverage, dailyCoverage, total:entries.length };
}

export const RulesMonitor: React.FC<{ entries: JournalEntry[]; rules: JournalRules; onEdit: () => void }> = ({ entries, rules, onEdit }) => {
  const r = useMemo(() => checkRules(entries, rules), [entries, rules]);
  const rows: { name: string; limit: string; breaches: string[] | null }[] = [
    { name: 'Max trades per day', limit: `${rules.maxTrades}`, breaches: entries.some(e => statusOf(e) !== 'planned') ? r.tooMany : null },
    { name: 'Stop after consecutive losses', limit: `${rules.stopAfterLosses} · ${r.streakCoverage}/${r.total} timed checks`, breaches: r.streakCoverage ? r.keptTrading : null },
    { name: 'Max risk per trade', limit: `${rules.maxRisk}% of account · ${r.riskCoverage}/${r.total} covered`, breaches: r.riskCoverage ? r.riskBreaches : null },
    { name: 'Max daily loss', limit: `${rules.maxDailyLoss}% of verified day-start equity · ${r.dailyCoverage}/${r.total} covered`, breaches: r.dailyCoverage ? r.dailyBreaches : null },
  ];
  const total = r.tooMany.length + r.keptTrading.length + r.riskBreaches.length + r.dailyBreaches.length;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold">Personal rules<JournalHelp label="Personal rules" /></h4>
          <p className="text-[11px] text-[#94a3b8]">Checked against your entries</p>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${total ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
          {total ? `${total} breach${total === 1 ? '' : 'es'}` : 'No known breaches · incomplete'}
        </span>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.name} className="flex items-start justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#0b1c30]">{row.name}<JournalHelp label={row.name} /></p>
              <p className="text-[11px] text-[#94a3b8]">Limit {row.limit}{row.breaches && row.breaches.length ? ` · ${row.breaches.slice(0, 3).join(', ')}${row.breaches.length > 3 ? '…' : ''}` : ''}</p>
            </div>
            {row.breaches === null ? (
              <span className="shrink-0 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5" title="Required risk, equity history, or complete timestamped results are not available for this rule">Unknown</span>
            ) : row.breaches.length ? (
              <span className="shrink-0 text-[10px] font-bold text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">{row.breaches.length} day{row.breaches.length === 1 ? '' : 's'}</span>
            ) : (
              <span className="shrink-0 text-[10px] font-bold text-slate-600 bg-slate-50 rounded px-1.5 py-0.5">No known breach</span>
            )}
          </li>
        ))}
      </ul>
      <button onClick={onEdit} className="mt-3 text-xs font-semibold text-[#5338ec] hover:underline">Edit rules in Playbook</button>
    </div>
  );
};

/* ───────────────────────── Tilt monitor ───────────────────────── */

export function computeTilt(entries: JournalEntry[], rules: JournalRules) {
  const recent = entries.filter(e=>statusOf(e)!=='planned').sort((a, b) => (b.exitTime || b.entryTime || b.date).localeCompare(a.exitTime || a.entryTime || a.date)).slice(0, 5);
  if (!recent.length) return null;
  const signals: string[] = [];
  let streak = 0;
  for (const e of recent) { if (eligible(e) && resultOf(e) === 'loss') streak++; else break; }
  if (streak >= 2) signals.push(`${streak} losses in a row`);
  const negative = recent.filter((e) => NEGATIVE_EMOTIONS.includes(e.emotionBefore)).length;
  if (negative >= 2) signals.push(`${negative} of ${recent.length} trades started anxious, greedy, FOMO or frustrated`);
  const off = recent.filter((e) => e.followedPlan === false).length;
  if (off >= 2) signals.push(`${off} of ${recent.length} trades off plan`);
  const revenge = recent.filter((e) => e.mistakes.includes('Revenge trade') || e.tags.includes('Revenge') || e.tags.includes('Overtraded')).length;
  if (revenge >= 1) signals.push(`${revenge} flagged revenge or overtrading`);
  if (checkRules(recent, rules).keptTrading.length) signals.push('Traded past your stop-after-losses rule');
  const level = signals.length >= 4 ? 'high' : signals.length >= 2 ? 'elevated' : 'calm';
  return { level, signals, sample: recent.length } as const;
}

export const TiltMonitor: React.FC<{ entries: JournalEntry[]; rules: JournalRules }> = ({ entries, rules }) => {
  const t = useMemo(() => computeTilt(entries, rules), [entries, rules]);
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
