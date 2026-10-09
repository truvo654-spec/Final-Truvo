// Saved runs table and side-by-side comparison of 2–3 runs.
import React, { useMemo, useState } from 'react';
import { Copy, Eye, GitCompare, Share2, Trash2, ArrowLeft } from 'lucide-react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { BacktestRun } from '../../backtest/store';
import { computeMetrics, Metrics } from '../../backtest/metrics';
import { describeRules } from '../../backtest/rules';
import { dateOnly, money, num, pct, rr } from '../../backtest/format';
import { LineChart } from './charts';
import { Card, Pill, btnPrimary, btnSecondary } from './ui';

interface Props {
  runs: BacktestRun[];
  playbooks: JournalPlaybook[];
  tz: string;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToast: (m: string) => void;
  onNew: () => void;
}

const COLORS = ['#5338ec', '#0ea5e9', '#f59e0b'];

/** Plain-language settings of a run, used to highlight what changed between runs. */
function settingRows(r: BacktestRun): Record<string, string> {
  const s = r.settings;
  const rules = describeRules(s.rules);
  return {
    Symbol: `${s.symbol} · ${s.timeframe}`,
    Dates: `${s.from} → ${s.to}`,
    Session: s.session.id === 'any' ? 'Any time' : `${s.session.start}:00–${s.session.end}:00 UTC`,
    'News days': s.news,
    Entry: rules.find((x) => x.label === 'Entry')?.text ?? '',
    Stop: rules.find((x) => x.label === 'Stop loss')?.text ?? '',
    Target: rules.find((x) => x.label === 'Take profit')?.text ?? '',
    Manage: rules.find((x) => x.label === 'Manage')?.text ?? 'None',
    Risk: s.risk.mode === 'percent' ? `${s.risk.percent}% per trade` : s.risk.mode === 'fixedR' ? `${s.risk.fixedR} ${s.risk.currency} per trade` : `${s.risk.qty} per trade`,
    Costs: s.costs.enabled ? 'Included' : 'Off',
  };
}

export const SavedRuns: React.FC<Props> = ({ runs, playbooks, tz, onOpen, onDuplicate, onDelete, onToast, onNew }) => {
  const [sel, setSel] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const pbName = (id: string | null) => playbooks.find((p) => p.id === id)?.name ?? '—';

  const picked = runs.filter((r) => sel.includes(r.id));
  const metrics = useMemo(() => picked.map((r) => computeMetrics(r.output.result.trades, r.output.result.startBalance, r.output.result.rangeStart, r.output.result.rangeEnd)), [picked]);

  const share = async (r: BacktestRun) => {
    const t = `${r.name}: ${r.summary.trades} trades, ${money(r.summary.net, r.settings.risk.currency, 0)} net, win rate ${pct(r.summary.winRate, 0)}, avg ${rr(r.summary.avgR)}, max drawdown ${pct(r.summary.maxDDPct)}.`;
    try { await navigator.clipboard.writeText(t); onToast('Run summary copied'); } catch { onToast('Copy blocked by the browser'); }
  };

  if (comparing && picked.length >= 2) {
    const rows = picked.map(settingRows);
    const keys = Object.keys(rows[0]);
    const changed = keys.filter((k) => rows.some((x) => x[k] !== rows[0][k]));
    const best = (f: (m: Metrics) => number, higher = true) => { const v = metrics.map(f); const b = higher ? Math.max(...v) : Math.min(...v); return v.map((x) => x === b); };
    const metricRows: [string, (m: Metrics) => number, (x: number) => string, boolean][] = [
      ['Net P&L', (m) => m.netPnl, (x) => money(x, 'USD', 0), true],
      ['Win rate', (m) => m.winRate, (x) => pct(x, 1), true],
      ['Average R', (m) => m.avgR, (x) => rr(x), true],
      ['Profit factor', (m) => m.profitFactor ?? 99, (x) => (x >= 99 ? '∞' : num(x)), true],
      ['Max drawdown', (m) => m.maxDDPct, (x) => pct(-x), false],
      ['Trades', (m) => m.trades, (x) => `${x}`, true],
    ];
    const ib = metrics.map((m) => m.avgR).indexOf(Math.max(...metrics.map((m) => m.avgR)));
    const comment = `${picked[ib].name} earns the most per trade (${rr(metrics[ib].avgR)})${changed.length ? `; the runs differ in ${changed.map((c) => c.toLowerCase()).join(', ')}` : ''}${metrics[ib].maxDDPct <= Math.min(...metrics.map((m) => m.maxDDPct)) + 1e-9 ? ', with the smallest drawdown too.' : ', but not with the smallest drawdown.'}`;
    return (
      <div className="space-y-5">
        <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-[#474556] hover:text-[#5338ec]" onClick={() => setComparing(false)}><ArrowLeft className="w-4 h-4" /> Back to saved runs</button>
        <p className="text-[15px] text-[#0b1c30] max-w-[75ch]">{comment}</p>
        <Card title="Compare runs" sub="Changed settings are highlighted. The best value in each row is green, with its lead over the next best.">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs tabular-nums">
              <thead><tr className="border-b border-slate-200"><th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-slate-500 w-32">Setting</th>
                {picked.map((r, i) => <th key={r.id} className="text-left py-2 px-3"><span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: COLORS[i] }} />{r.name}</th>)}</tr></thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k} className={`border-b border-slate-100 ${changed.includes(k) ? 'bg-amber-50' : ''}`}>
                    <td className="py-2 pr-3 font-semibold text-slate-500">{k}{changed.includes(k) && <span className="ml-1 text-[10px] text-amber-700 font-bold">changed</span>}</td>
                    {rows.map((x, i) => <td key={i} className="py-2 px-3 text-[#0b1c30]">{x[k]}</td>)}
                  </tr>
                ))}
                {metricRows.map(([k, f, fmt, hi]) => {
                  const isBest = best(f, hi);
                  const vals = metrics.map(f);
                  return (
                    <tr key={k} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-semibold text-slate-500">{k}</td>
                      {vals.map((v, i) => {
                        const others = vals.filter((_, j) => j !== i);
                        const lead = hi ? v - Math.max(...others) : Math.min(...others) - v;
                        return <td key={i} className={`py-2 px-3 font-bold ${isBest[i] && vals.length > 1 ? 'text-emerald-700' : 'text-[#0b1c30]'}`}>{fmt(v)}{isBest[i] && lead > 0 && k !== 'Trades' && <span className="ml-1 text-[10px] font-semibold text-emerald-600">({k === 'Max drawdown' ? pct(lead).replace('−', '') : k === 'Average R' ? rr(lead) : k === 'Win rate' ? `+${(lead * 100).toFixed(1)} pts` : k === 'Net P&L' ? money(lead, 'USD', 0) : `+${num(lead)}`} better)</span>}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Equity curves" sub="Return on each run's starting balance, so different balances compare fairly.">
          <LineChart label="Equity curves of the compared runs" area={false} yFmt={(y) => pct(y, 0, true)} xFmt={(x) => dateOnly(x, tz)}
            series={picked.map((r, i) => ({ name: r.name, color: COLORS[i], dashed: i > 0, points: [{ x: r.output.result.rangeStart, y: 0 }, ...r.output.result.trades.map((t) => ({ x: t.exitTime, y: (t.balance - r.output.result.startBalance) / r.output.result.startBalance }))] }))} />
        </Card>
      </div>
    );
  }

  return (
    <Card title="Saved runs" sub="Tick 2 or 3 runs to compare them side by side." right={
      <div className="flex gap-2">
        <button type="button" className={btnSecondary} disabled={sel.length < 2} title={sel.length < 2 ? 'Tick 2 or 3 runs first' : undefined} onClick={() => setComparing(true)}><GitCompare className="w-3.5 h-3.5" /> Compare {sel.length >= 2 ? `(${sel.length})` : ''}</button>
        <button type="button" className={btnPrimary} onClick={onNew}>New backtest</button>
      </div>}>
      {runs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm font-semibold text-[#0b1c30]">No saved runs yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Run a backtest and press Save to keep it here. Saved runs can be compared and set as a playbook's expected results.</p>
          <button type="button" className={btnPrimary} onClick={onNew}>Start a backtest</button>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-xs tabular-nums">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-2 w-8"><span className="sr-only">Select</span></th>
                {['Name', 'Mode', 'Playbook', 'Symbol', 'Range', 'Trades', 'Net', 'PF', 'Max DD', 'Last run', ''].map((h) => <th key={h} className={`py-2 px-2 font-bold ${['Trades', 'Net', 'PF', 'Max DD'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const on = sel.includes(r.id);
                return (
                  <tr key={r.id} className={`border-b border-slate-100 ${on ? 'bg-[#EEF0FE]' : ''}`}>
                    <td className="py-2 pr-2"><input type="checkbox" aria-label={`Select ${r.name} to compare`} checked={on} disabled={!on && sel.length >= 3} onChange={() => setSel(on ? sel.filter((x) => x !== r.id) : [...sel, r.id])} /></td>
                    <td className="py-2 px-2"><button type="button" className="font-bold text-[#0b1c30] hover:text-[#5338ec] text-left" onClick={() => onOpen(r.id)}>{r.name}</button></td>
                    <td className="py-2 px-2"><Pill>Automated</Pill></td>
                    <td className="py-2 px-2">{pbName(r.playbookId)}</td>
                    <td className="py-2 px-2">{r.symbol} · {r.timeframe}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-slate-500">{r.from} → {r.to}</td>
                    <td className="py-2 px-2 text-right">{r.summary.trades}</td>
                    <td className={`py-2 px-2 text-right font-bold ${r.summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(r.summary.net, r.settings.risk.currency, 0)}</td>
                    <td className="py-2 px-2 text-right">{num(r.summary.pf)}</td>
                    <td className="py-2 px-2 text-right text-rose-600">{pct(-r.summary.maxDDPct)}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-slate-500">{dateOnly(Date.parse(r.lastRun), tz)}</td>
                    <td className="py-2 pl-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <button type="button" title="Open" aria-label={`Open ${r.name}`} onClick={() => onOpen(r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Eye className="w-4 h-4" /></button>
                        <button type="button" title="Duplicate and edit" aria-label={`Duplicate ${r.name}`} onClick={() => onDuplicate(r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Copy className="w-4 h-4" /></button>
                        <button type="button" title="Copy a summary to share" aria-label={`Share ${r.name}`} onClick={() => share(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Share2 className="w-4 h-4" /></button>
                        {confirm === r.id ? (
                          <span className="flex items-center gap-1 ml-1">
                            <button type="button" className="text-[11px] font-bold text-rose-600 hover:underline" onClick={() => { onDelete(r.id); setConfirm(null); setSel(sel.filter((x) => x !== r.id)); }}>Delete</button>
                            <button type="button" className="text-[11px] text-slate-500 hover:underline" onClick={() => setConfirm(null)}>Keep</button>
                          </span>
                        ) : (
                          <button type="button" title="Delete" aria-label={`Delete ${r.name}`} onClick={() => setConfirm(r.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
