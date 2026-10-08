import React, { useMemo, useState } from 'react';
import { JournalEntry } from '../../types';
import { JournalPlaybook, ScenarioStatus } from '../../data/journalPlaybooks';

// Playbook analytics: win rate, profit factor, avg win/loss and target hit rate as a rolling
// line (trade by trade), a comparison across playbooks, an R-outcome distribution against the
// target, and scenario management stats. Light theme, single-series charts.

type Metric = 'winRate' | 'pf' | 'payoff' | 'target';
const METRICS: { id: Metric; label: string; help: string; ref: number; refLabel: string }[] = [
  { id: 'winRate', label: 'Win rate', help: 'Share of decided trades (wins + losses) that won.', ref: 50, refLabel: '50%' },
  { id: 'pf', label: 'Profit factor', help: 'Gross profit ÷ gross loss. Above 1.0 makes money.', ref: 1, refLabel: 'break-even 1.0' },
  { id: 'payoff', label: 'Avg win / loss', help: 'Average winning trade ÷ average losing trade (in $).', ref: 1, refLabel: '1:1' },
  { id: 'target', label: 'Target hit', help: "Share of trades that reached the playbook's minimum reward:risk (e.g. ≥ 2R).", ref: 50, refLabel: '50%' },
];
const WINDOW = 10;

/** Small ⓘ marker with a hover / focus explanation. */
const Info: React.FC<{ title: string; children: React.ReactNode; align?: 'left' | 'right' }> = ({ title, children, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span tabIndex={0} role="button" aria-label={`About ${title}`} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="ml-1 w-3.5 h-3.5 rounded-full border border-slate-300 text-[9px] leading-[12px] text-center font-bold text-slate-500 cursor-help normal-case tracking-normal">i</span>
      {open && (
        <span role="tooltip" className={`absolute z-40 top-5 ${align === 'right' ? 'right-0' : 'left-0'} w-72 rounded-xl bg-[#0b1c30] text-white text-[11px] leading-relaxed font-normal normal-case tracking-normal p-3 shadow-2xl text-left`}>
          <span className="block font-bold text-xs mb-1">{title}</span>
          {children}
        </span>
      )}
    </span>
  );
};
const netOf = (e: JournalEntry) => e.pnl - (e.commission ?? 0);

const metricOf = (list: JournalEntry[], m: Metric, target: number): number | null => {
  if (!list.length) return null;
  const nets = list.map(netOf);
  const wins = nets.filter((x) => x > 0), losses = nets.filter((x) => x < 0);
  switch (m) {
    case 'winRate': {
      const w = list.filter((e) => e.outcome === 'win').length, l = list.filter((e) => e.outcome === 'loss').length;
      return w + l ? (w / (w + l)) * 100 : null;
    }
    case 'pf': {
      const gl = Math.abs(losses.reduce((a, b) => a + b, 0));
      return gl > 0 ? wins.reduce((a, b) => a + b, 0) / gl : wins.length ? 5 : null; // capped display for "no losses"
    }
    case 'payoff':
      return wins.length && losses.length ? (wins.reduce((a, b) => a + b, 0) / wins.length) / Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : null;
    case 'target': {
      const withR = list.filter((e) => e.rMultiple !== null);
      return withR.length ? (withR.filter((e) => (e.rMultiple as number) >= target).length / withR.length) * 100 : null;
    }
  }
};
const fmt = (m: Metric, v: number | null) => (v === null ? '—' : m === 'winRate' || m === 'target' ? `${v.toFixed(0)}%` : m === 'pf' && v >= 5 ? '5.0+' : `${v.toFixed(2)}${m === 'payoff' ? ':1' : ''}`);

interface Props {
  playbook: JournalPlaybook;
  playbooks: JournalPlaybook[];
  entries: JournalEntry[]; // all entries (for comparison)
  onShowTrades: (ids: string[], label: string) => void;
}

export const PlaybookAnalytics: React.FC<Props> = ({ playbook, playbooks, entries, onShowTrades }) => {
  const [metric, setMetric] = useState<Metric>('winRate');
  const [hover, setHover] = useState<number | null>(null);
  const def = METRICS.find((m) => m.id === metric)!;
  const target = playbook.benchmarkRR;

  const trades = useMemo(
    () => entries.filter((e) => e.strategy === playbook.name).sort((a, b) => (a.entryTime || a.date).localeCompare(b.entryTime || b.date)),
    [entries, playbook.name]
  );

  // rolling series: value after each trade over the last WINDOW trades (expanding until WINDOW)
  const series = useMemo(
    () => trades.map((_, i) => metricOf(trades.slice(Math.max(0, i + 1 - WINDOW), i + 1), metric, target)),
    [trades, metric, target]
  );
  const overall = metricOf(trades, metric, target);

  // comparison across playbooks
  const compare = useMemo(
    () => playbooks
      .map((p) => ({ p, v: metricOf(entries.filter((e) => e.strategy === p.name), metric, p.benchmarkRR), n: entries.filter((e) => e.strategy === p.name).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => (b.v ?? -1) - (a.v ?? -1)),
    [playbooks, entries, metric]
  );

  // R distribution vs target
  const buckets = useMemo(() => {
    const defs = [
      { label: '≤ -1R', test: (r: number) => r <= -1 },
      { label: '-1 to 0', test: (r: number) => r > -1 && r < 0 },
      { label: '0 to 1R', test: (r: number) => r >= 0 && r < 1 },
      { label: '1 to 2R', test: (r: number) => r >= 1 && r < 2 },
      { label: '2 to 3R', test: (r: number) => r >= 2 && r < 3 },
      { label: '≥ 3R', test: (r: number) => r >= 3 },
    ];
    const rs = trades.map((e) => e.rMultiple).filter((x): x is number => x !== null);
    return defs.map((d) => ({ ...d, n: rs.filter(d.test).length }));
  }, [trades]);
  const bMax = Math.max(1, ...buckets.map((b) => b.n));

  // scenario management
  const sc = playbook.scenarios || [];
  const count = (st: ScenarioStatus) => sc.filter((x) => x.status === st).length;
  const resolved = count('triggered') + count('closed') + count('invalidated');
  const triggerRate = resolved ? ((count('triggered') + count('closed')) / resolved) * 100 : null;
  const rrs = sc.map((x) => (x.entry !== undefined && x.stop !== undefined && x.target !== undefined && x.entry !== x.stop ? Math.abs(x.target - x.entry) / Math.abs(x.entry - x.stop) : null)).filter((x): x is number => x !== null);
  const fromSc = trades.filter((e) => e.scenarioId);
  const notSc = trades.filter((e) => !e.scenarioId);
  const avgNet = (l: JournalEntry[]) => (l.length ? l.reduce((a, e) => a + netOf(e), 0) / l.length : null);

  // chart geometry
  const W = 700, H = 150, M = { t: 12, r: 12, b: 22, l: 44 };
  const vals = series.filter((v): v is number => v !== null);
  const yMaxRaw = Math.max(def.ref, ...vals);
  const yMax = metric === 'winRate' || metric === 'target' ? 100 : Math.ceil(yMaxRaw * 1.15 * 2) / 2;
  const x = (i: number) => M.l + (series.length <= 1 ? (W - M.l - M.r) / 2 : (i / (series.length - 1)) * (W - M.l - M.r));
  const y = (v: number) => M.t + (1 - Math.min(v, yMax) / yMax) * (H - M.t - M.b);
  const path = series.map((v, i) => (v === null ? '' : `${i && series[i - 1] !== null ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)).join(' ');
  const ticks = [0, yMax / 2, yMax];
  const lbl = 'text-[10px] font-bold tracking-wider uppercase text-slate-500';

  // plain-language explanations with this playbook's own numbers
  const nets = trades.map(netOf);
  const wN = trades.filter((e) => e.outcome === 'win').length, lN = trades.filter((e) => e.outcome === 'loss').length;
  const gW = nets.filter((x) => x > 0).reduce((a, b) => a + b, 0), gL = Math.abs(nets.filter((x) => x < 0).reduce((a, b) => a + b, 0));
  const nWin = nets.filter((x) => x > 0).length, nLoss = nets.filter((x) => x < 0).length;
  const payoffV = nWin && nLoss ? (gW / nWin) / (gL / nLoss) : null;
  const withR = trades.filter((e) => e.rMultiple !== null);
  const hitN = withR.filter((e) => (e.rMultiple as number) >= target).length;
  const usd = (v: number) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const calc = (t: string) => <span className="block mt-1.5 pt-1.5 border-t border-white/15 font-mono text-emerald-300">{t}</span>;
  const explain: Record<Metric, React.ReactNode> = {
    winRate: (<>Wins ÷ (wins + losses). Breakeven and open trades are left out. Read it together with Avg win/loss: a 40% win rate is fine if a typical win is twice a typical loss.{calc(`This playbook: ${wN} wins ÷ ${wN + lN} decided = ${fmt('winRate', metricOf(trades, 'winRate', target))}`)}</>),
    pf: (<>Gross profit ÷ gross loss, after commissions. Below 1.0 loses money; 1.0–1.5 thin edge; 1.5–2.0 solid; above 2.0 strong. Shown as 5.0+ when there are no losing trades.{calc(`This playbook: ${usd(gW)} won ÷ ${usd(gL)} lost = ${fmt('pf', metricOf(trades, 'pf', target))}`)}</>),
    payoff: (<>Average winning trade ÷ average losing trade, in dollars. 2:1 means a typical win is twice a typical loss. The win rate needed to break even is 1 ÷ (1 + ratio).{calc(payoffV === null ? 'This playbook: needs at least one win and one loss.' : `This playbook: avg win ${usd(gW / nWin)} ÷ avg loss ${usd(gL / nLoss)} = ${payoffV.toFixed(2)}:1 → break-even win rate ${(100 / (1 + payoffV)).toFixed(0)}%`)}</>),
    target: (<>Share of trades whose result reached this playbook's minimum reward:risk ({target}R), measured in R (multiples of the planned risk). Low values mean exits before target or targets set too far.{calc(`This playbook: ${hitN} of ${withR.length} trades reached ≥ ${target}R = ${fmt('target', metricOf(trades, 'target', target))}`)}</>),
  };

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2" role="tablist" aria-label="Metric">
        {METRICS.map((m) => {
          const v = metricOf(trades, m.id, target);
          const on = metric === m.id;
          return (
            <button key={m.id} type="button" role="tab" aria-selected={on} onClick={() => { setMetric(m.id); setHover(null); }}
              className={`text-left rounded-xl border px-3 py-2.5 ${on ? 'border-[#5338ec] bg-[#F8F7FF]' : 'border-slate-200 hover:bg-slate-50'}`}>
              <span className={lbl}>{m.label}{m.id === 'target' ? ` (≥${target}R)` : ''}<Info title={m.label} align={m.id === 'target' || m.id === 'payoff' ? 'right' : 'left'}>{explain[m.id]}</Info></span>
              <span className="block text-lg font-bold font-mono text-[#0b1c30]">{fmt(m.id, v)}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 -mt-2">{def.help}</p>

      {/* Rolling chart */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={lbl}>{def.label}, rolling {WINDOW} trades<Info title="Rolling chart">Each point is the metric over the last {WINDOW} trades up to that trade (fewer at the start). A rising line means the edge is improving; a falling line means it is fading. The dashed line is the reference ({def.refLabel}). Hover the chart to see each trade.</Info></p>
          <p className="text-[11px] text-slate-500">Overall <b className="text-[#0b1c30] font-mono">{fmt(metric, overall)}</b> · dashed line = {def.refLabel}</p>
        </div>
        {trades.length < 2 ? (
          <p className="text-sm text-slate-500 py-8 text-center">Needs at least 2 trades with this playbook.</p>
        ) : (
          <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-1" role="img" aria-label={`${def.label} over ${trades.length} trades, now ${fmt(metric, series[series.length - 1])}`} onMouseLeave={() => setHover(null)}
              onMouseMove={(e) => {
                const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const px = ((e.clientX - r.left) / r.width) * W;
                let best = 0; series.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
                setHover(best);
              }}>
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="#eef2f7" />
                  <text x={M.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="ui-monospace, monospace">{fmt(metric, t)}</text>
                </g>
              ))}
              <line x1={M.l} x2={W - M.r} y1={y(def.ref)} y2={y(def.ref)} stroke="#94a3b8" strokeDasharray="4 4" />
              <path d={path} fill="none" stroke="#5338ec" strokeWidth={2} strokeLinejoin="round" />
              {series.map((v, i) => v !== null && (hover === i || i === series.length - 1) && <circle key={i} cx={x(i)} cy={y(v)} r={4} fill="#5338ec" stroke="#fff" strokeWidth={2} />)}
              <text x={M.l} y={H - 6} fontSize="10" fill="#64748b">Trade 1</text>
              <text x={W - M.r} y={H - 6} fontSize="10" fill="#64748b" textAnchor="end">Trade {trades.length}</text>
              {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={M.t} y2={H - M.b} stroke="#cbd5e1" />}
            </svg>
            {hover !== null && (
              <div className="pointer-events-none absolute top-1 bg-[#0b1c30] text-white rounded-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap" style={{ left: `${(x(hover) / W) * 100}%`, transform: x(hover) > W * 0.6 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)' }} role="status">
                <p className="font-semibold">Trade {hover + 1} · {trades[hover].symbol} · {(trades[hover].entryTime || trades[hover].date).slice(0, 10)}</p>
                <p className="font-mono">{def.label}: {fmt(metric, series[hover])} · this trade {netOf(trades[hover]) >= 0 ? '+' : ''}{netOf(trades[hover]).toFixed(2)} ({trades[hover].rMultiple === null ? '—' : `${trades[hover].rMultiple}R`})</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Compare playbooks */}
        <div className="rounded-xl border border-slate-200 p-3">
          <p className={lbl}>{def.label} by playbook<Info title="By playbook">The same metric for every playbook that has trades. The number in brackets is the trade count; the thin vertical marker is the reference ({def.refLabel}). Results from fewer than 10 trades are not reliable yet.</Info></p>
          <ul className="mt-2 space-y-1.5">
            {compare.map(({ p, v, n }) => {
              const max = Math.max(def.ref, ...compare.map((c) => c.v ?? 0)) || 1;
              const me = p.id === playbook.id;
              return (
                <li key={p.id} className="text-[11px]">
                  <div className="flex justify-between"><span className={me ? 'font-bold text-[#0b1c30]' : 'text-[#474556]'}>{p.name} <span className="text-slate-400">({n})</span></span><span className="font-mono font-bold">{fmt(metric, v)}</span></div>
                  <div className="relative h-2 rounded-full bg-slate-100 mt-0.5">
                    <div className={`h-full rounded-full ${me ? 'bg-[#5338ec]' : 'bg-slate-300'}`} style={{ width: `${Math.max(2, ((v ?? 0) / max) * 100)}%` }} />
                    <span className="absolute top-[-2px] bottom-[-2px] w-px bg-slate-500" style={{ left: `${(def.ref / max) * 100}%` }} aria-hidden="true" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* R distribution vs target */}
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="flex justify-between items-baseline"><p className={lbl}>Results in R vs target<Info title="Results in R" align="right">Each trade's result in R, the number of planned risks won or lost (e.g. +2R = twice the risk). Red bars are losses, light green are winners that closed before the {target}R target, dark green reached the target. Many light-green trades suggest taking profit too early.</Info></p><span className="text-[10px] text-slate-500">target = 1:{target}</span></div>
          <div className="flex items-end gap-1.5 h-28 mt-2">
            {buckets.map((b) => {
              const hit = b.label.startsWith('≥') || (parseFloat(b.label) >= target);
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${b.label}: ${b.n} trades`}>
                  <span className="text-[10px] font-mono text-[#0b1c30]">{b.n || ''}</span>
                  <div className={`w-full rounded-t ${b.label.startsWith('≤') || b.label.startsWith('-') ? 'bg-rose-400' : hit ? 'bg-emerald-500' : 'bg-emerald-200'}`} style={{ height: `${(b.n / bMax) * 100}%`, minHeight: b.n ? 3 : 0 }} />
                  <span className="text-[9px] text-slate-500 whitespace-nowrap">{b.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Dark green bars reached the {target}R target; light green were winners that exited early.</p>
        </div>
      </div>

      {/* Scenario management */}
      <div className="rounded-xl border border-slate-200 p-3">
        <p className={lbl}>Scenario management<Info title="Scenario management">Watching: idea written, waiting. Triggered: the setup happened and you traded it. Invalidated: the idea failed before entry. Closed: finished. Trigger rate = (triggered + closed) ÷ all resolved scenarios. Avg planned R:R comes from each scenario's entry, stop and target. Trades from scenarios are journal entries logged with "Check and trade".</Info></p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {(['watching', 'triggered', 'invalidated', 'closed'] as const).map((st) => (
            <div key={st} className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-[10px] font-semibold text-slate-500 capitalize">{st}</p><p className="text-base font-bold font-mono text-[#0b1c30]">{count(st)}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-[11px]">
          <p className="text-[#474556]">Trigger rate: <b className="font-mono text-[#0b1c30]">{triggerRate === null ? '—' : `${triggerRate.toFixed(0)}%`}</b> <span className="text-slate-400">(triggered or closed ÷ all resolved)</span></p>
          <p className="text-[#474556]">Avg planned R:R: <b className="font-mono text-[#0b1c30]">{rrs.length ? `1:${(rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2)}` : '—'}</b></p>
          <p className="text-[#474556]">Trades from scenarios: <b className="font-mono text-[#0b1c30]">{fromSc.length}</b>
            {fromSc.length > 0 && <> · avg <b className="font-mono">{avgNet(fromSc)!.toFixed(2)}</b> vs others <b className="font-mono">{avgNet(notSc)?.toFixed(2) ?? '—'}</b> <button type="button" onClick={() => onShowTrades(fromSc.map((e) => e.id), `${playbook.name} scenario trades`)} className="text-[#5338ec] hover:underline">view</button></>}
          </p>
        </div>
        {fromSc.length === 0 && <p className="text-[10px] text-slate-400 mt-1">Trades logged with "Check and trade" from a scenario are linked here, so you can see whether planned ideas beat spontaneous ones.</p>}
      </div>
    </div>
  );
};
