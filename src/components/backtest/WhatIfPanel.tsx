// What-if on your real journal trades: pick trades with the journal's filters, change one rule, compare.
import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Info, ListPlus, TrendingDown, TrendingUp } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { JOURNAL_TODAY } from '../../data/journalData';
import type { JournalRules } from '../../backtest/rules';
import { describeWhatIf, ESTIMATED_RULES, runWhatIf, WhatIfRule } from '../../backtest/whatif';
import { dateOnly, money, num, pct, rr, tone, utcWindow } from '../../backtest/format';
import { loadWhatIfs, saveWhatIfs } from '../../backtest/store';
import { LineChart } from './charts';
import { Card, Field, Hint, Pill, Segmented, btnPrimary, btnSecondary, inputBase, inputCls } from './ui';

interface Props {
  entries: JournalEntry[];
  playbooks: JournalPlaybook[];
  journalRules: JournalRules;
  tz: string;
  onToast: (m: string) => void;
  onOpenTrades: (ids: string[], label: string) => void;
  onAddRule: (kind: 'rule' | 'checklist', label: string, patch?: Partial<JournalRules>) => void;
}

type Kind = WhatIfRule['kind'];
const RULES: { kind: Kind; title: string; hint: string }[] = [
  { kind: 'lossesPerDay', title: 'Stop after N losses a day', hint: 'Skip every trade taken after the Nth losing trade of that day.' },
  { kind: 'dailyLoss', title: 'Max daily loss', hint: 'Skip trades once the day is down this much.' },
  { kind: 'hours', title: 'Only trade certain hours', hint: 'Skip trades opened outside these hours (UTC).' },
  { kind: 'mistakes', title: 'Skip trades with a mistake tag', hint: 'Skip trades you tagged with these mistakes or tags.' },
  { kind: 'breakeven', title: 'Move stop to breakeven', hint: 'Once a trade is X R in profit, a return to entry closes it at breakeven.' },
  { kind: 'target', title: 'Different target', hint: 'Take profit at this many R.' },
  { kind: 'stop', title: 'Tighter stop', hint: 'Stop at a fraction of the original risk, e.g. 0.75R.' },
];

const MultiPick: React.FC<{ label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }> = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1 h-9 text-xs font-semibold border rounded-lg px-3 bg-white hover:bg-slate-50 ${value.length ? 'border-[#5338ec] text-[#5338ec]' : 'border-slate-200 text-[#0b1c30]'}`}>
        {label}{value.length ? ` (${value.length})` : ': all'} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl p-2 max-h-72 overflow-y-auto" onMouseLeave={() => setOpen(false)}>
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs cursor-pointer">
              <input type="checkbox" checked={value.includes(o)} onChange={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])} />{o}
            </label>
          ))}
          <button type="button" className="text-[11px] font-semibold text-[#5338ec] hover:underline px-2 pt-1" onClick={() => onChange([])}>All</button>
        </div>
      )}
    </div>
  );
};

export const WhatIfPanel: React.FC<Props> = ({ entries, playbooks, tz, onToast, onOpenTrades, onAddRule }) => {
  const [range, setRange] = useState<'all' | '30' | '90'>('all');
  const [pbs, setPbs] = useState<string[]>([]);
  const [syms, setSyms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<'all' | 'wins' | 'losses'>('all');
  const [kind, setKind] = useState<Kind>('mistakes');
  // Start with the two mistakes you log most often, so the first result means something.
  const topMistakes = useMemo(() => {
    const c = new Map<string, number>();
    entries.forEach((e) => e.mistakes.forEach((m) => c.set(m, (c.get(m) || 0) + 1)));
    return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([m]) => m);
  }, [entries]);
  const [params, setParams] = useState({ n: 1, usd: 300, start: 7, end: 16, tags: topMistakes, be: 1, target: 2, stop: 0.75 });

  const allTags = useMemo(() => Array.from(new Set(entries.flatMap((e) => [...e.mistakes, ...e.tags]))).sort(), [entries]);
  const symbols = useMemo(() => Array.from(new Set(entries.map((e) => e.symbol))).sort(), [entries]);
  const names = useMemo(() => Array.from(new Set([...playbooks.map((p) => p.name), ...entries.map((e) => e.strategy)])).sort(), [playbooks, entries]);

  const picked = useMemo(() => {
    const since = range === 'all' ? '' : new Date(Date.parse(`${JOURNAL_TODAY}T00:00:00Z`) - Number(range) * 86400000).toISOString().slice(0, 10);
    return entries.filter((e) => e.outcome !== 'open'
      && (!since || e.date >= since)
      && (!pbs.length || pbs.includes(e.strategy))
      && (!syms.length || syms.includes(e.symbol))
      && (!tags.length || [...e.tags, ...e.mistakes].some((t) => tags.includes(t)))
      && (result === 'all' || (result === 'wins' ? e.pnl > 0 : e.pnl < 0)));
  }, [entries, range, pbs, syms, tags, result]);

  const rule: WhatIfRule = kind === 'lossesPerDay' ? { kind, n: params.n } : kind === 'dailyLoss' ? { kind, usd: params.usd } : kind === 'hours' ? { kind, start: params.start, end: params.end }
    : kind === 'mistakes' ? { kind, tags: params.tags } : kind === 'breakeven' ? { kind, r: params.be } : kind === 'target' ? { kind, r: params.target } : { kind, mult: params.stop };
  const out = useMemo(() => runWhatIf(picked, rule), [picked, JSON.stringify(rule)]); // eslint-disable-line react-hooks/exhaustive-deps

  const changed = out.trades.filter((t) => t.status !== 'same');
  const curve = (sel: 'a' | 'w') => {
    let c = 0;
    const list = [...out.trades].sort((a, b) => a.exitTime - b.exitTime);
    return [{ x: list[0]?.entryTime ?? 0, y: 0 }, ...list.map((t) => ({ x: t.exitTime, y: (c += sel === 'a' ? t.actualNet : t.status === 'skipped' ? 0 : t.newNet) }))];
  };
  const headline = !picked.length ? 'No journal trades match these filters.'
    : !changed.length ? `${describeWhatIf(rule)} would not have changed any of these ${picked.length} trades.`
    : `${describeWhatIf(rule)} would have ${out.saved >= 0 ? 'added' : 'cost'} ${money(Math.abs(out.saved), 'USD', 0, false)} on these ${picked.length} trades${out.skipped ? ` (${out.skipped} skipped` : ''}${out.changed ? `${out.skipped ? ', ' : ' ('}${out.changed} changed` : ''}${out.skipped || out.changed ? ')' : ''}.`;

  const ruleText = describeWhatIf(rule);
  const add = () => {
    const list = loadWhatIfs();
    saveWhatIfs([{ id: `wi_${Date.now().toString(36)}`, createdAt: new Date().toISOString(), rule, trades: picked.length, actualNet: out.actual.netPnl, whatIfNet: out.whatIf.netPnl, saved: out.saved }, ...list]);
    onAddRule('checklist', ruleText);
  };

  const rows: [string, string, number, number, (x: number) => string, boolean][] = [
    ['Net P&L', 'Total result of the trades', out.actual.netPnl, out.whatIf.netPnl, (x) => money(x, 'USD', 0), true],
    ['Win rate', 'Winning trades ÷ trades taken', out.actual.winRate, out.whatIf.winRate, (x) => pct(x, 1), true],
    ['Profit factor', 'Gross profit ÷ gross loss', out.actual.profitFactor ?? 0, out.whatIf.profitFactor ?? 0, (x) => num(x), true],
    ['Average R', 'Average result per trade in units of risk', out.actual.avgR, out.whatIf.avgR, (x) => rr(x), true],
    ['Max drawdown', 'Largest fall from a high, on a $10,000 account', out.actual.maxDD, out.whatIf.maxDD, (x) => money(-x, 'USD', 0), false],
    ['Trades', 'Trades taken', out.actual.trades, out.whatIf.trades, (x) => `${x}`, true],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Which trades to test">
        <Segmented label="Date range" value={range} onChange={setRange} options={[{ id: 'all', label: 'All time' }, { id: '90', label: 'Last 90 days' }, { id: '30', label: 'Last 30 days' }]} />
        <MultiPick label="Playbook" options={names} value={pbs} onChange={setPbs} />
        <MultiPick label="Symbol" options={symbols} value={syms} onChange={setSyms} />
        <MultiPick label="Tags" options={allTags} value={tags} onChange={setTags} />
        <Segmented label="Result" value={result} onChange={setResult} options={[{ id: 'all', label: 'All results' }, { id: 'wins', label: 'Wins' }, { id: 'losses', label: 'Losses' }]} />
        <span className="ml-auto text-xs text-[#474556] tabular-nums">Testing <b className="text-[#0b1c30]">{picked.length}</b> trades from your journal</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
        <Card title="Change one rule" sub="Pick one. Everything else stays as you traded it.">
          <div className="space-y-2" role="radiogroup" aria-label="Rule to change">
            {RULES.map((r) => {
              const on = kind === r.kind;
              return (
                <div key={r.kind} className={`rounded-xl border p-3 ${on ? 'border-[#5338ec] bg-[#FBFAFF]' : 'border-slate-200'}`}>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="whatif-rule" checked={on} onChange={() => setKind(r.kind)} className="mt-0.5" />
                    <span className="flex-1">
                      <span className="text-xs font-bold text-[#0b1c30]">{r.title}</span>
                      {ESTIMATED_RULES.includes(r.kind) && <Pill tone="warn" className="ml-1.5" title="Journal trades have no recorded price path, so this uses a path rebuilt from entry, stop, exit and times.">Estimate</Pill>}
                      <span className="block text-[11px] text-slate-500">{r.hint}</span>
                    </span>
                  </label>
                  {on && (
                    <div className="mt-2.5 pl-6 flex flex-wrap items-center gap-2 text-xs">
                      {r.kind === 'lossesPerDay' && (<><input type="number" min={1} max={10} aria-label="Losses per day" value={params.n} onChange={(e) => setParams({ ...params, n: Math.max(1, Number(e.target.value)) })} className={`${inputBase} w-20`} /> losses</>)}
                      {r.kind === 'dailyLoss' && (<>$<input type="number" min={10} step={50} aria-label="Max daily loss in dollars" value={params.usd} onChange={(e) => setParams({ ...params, usd: Math.max(1, Number(e.target.value)) })} className={`${inputBase} w-28`} /></>)}
                      {r.kind === 'hours' && (<>
                        <select aria-label="From hour UTC" value={params.start} onChange={(e) => setParams({ ...params, start: Number(e.target.value) })} className={`${inputBase} w-auto`}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select>
                        to
                        <select aria-label="To hour UTC" value={params.end} onChange={(e) => setParams({ ...params, end: Number(e.target.value) })} className={`${inputBase} w-auto`}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h + 1}>{String((h + 1) % 24).padStart(2, '0')}:00</option>)}</select>
                        <span className="basis-full text-[11px] text-slate-500">{utcWindow(params.start, params.end, tz)}</span>
                      </>)}
                      {r.kind === 'mistakes' && (
                        <div className="flex flex-wrap gap-1.5">
                          {allTags.map((t) => { const sel = params.tags.includes(t); return <button key={t} type="button" aria-pressed={sel} onClick={() => setParams({ ...params, tags: sel ? params.tags.filter((x) => x !== t) : [...params.tags, t] })} className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border ${sel ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-[#474556]'}`}>{t}</button>; })}
                        </div>
                      )}
                      {r.kind === 'breakeven' && (<>at <input type="number" min={0.25} step={0.25} aria-label="Breakeven at R" value={params.be} onChange={(e) => setParams({ ...params, be: Number(e.target.value) })} className={`${inputBase} w-20`} /> R</>)}
                      {r.kind === 'target' && (<Segmented size="sm" label="Target" value={String(params.target)} onChange={(v) => setParams({ ...params, target: Number(v) })} options={['1', '1.5', '2', '2.5', '3'].map((x) => ({ id: x, label: `${x}R` }))} />)}
                      {r.kind === 'stop' && (<Segmented size="sm" label="Stop size" value={String(params.stop)} onChange={(v) => setParams({ ...params, stop: Number(v) })} options={['0.5', '0.75', '0.9'].map((x) => ({ id: x, label: `${x}R` }))} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-5 min-w-0">
          <section className={`rounded-2xl border p-5 ${out.saved > 0 ? 'border-emerald-200 bg-emerald-50' : out.saved < 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`} aria-live="polite">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Result</p>
            <p className="text-lg font-bold text-[#0b1c30] mt-0.5 flex items-start gap-2">
              {out.saved > 0 ? <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : out.saved < 0 ? <TrendingDown className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" /> : null}{headline}
            </p>
            {picked.length > 0 && <p className="text-xs text-[#474556] mt-1">{out.lossesAvoided} losing trade{out.lossesAvoided === 1 ? '' : 's'} avoided or reduced · {out.winsForfeited} winning trade{out.winsForfeited === 1 ? '' : 's'} given up or cut.{out.estimated ? ' This rule is an estimate based on rebuilt price paths.' : ''}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" className={btnPrimary} disabled={!picked.length} onClick={add}><ListPlus className="w-4 h-4" /> Add this as a rule in my checklist</button>
            </div>
          </section>

          {picked.length > 0 && (<>
            <Card title="Actual vs what-if" sub="Same trades, one rule changed.">
              <div className="overflow-x-auto">
                <table className="w-full text-xs tabular-nums">
                  <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200"><th className="text-left py-2">Measure</th><th className="text-right py-2">What you did</th><th className="text-right py-2">With the rule</th><th className="text-right py-2">Change</th></tr></thead>
                  <tbody>
                    {rows.map(([k, hint, a, b, f, hi]) => {
                      const d = b - a;
                      const good = hi ? d > 1e-9 : d < -1e-9;
                      const bad = hi ? d < -1e-9 : d > 1e-9;
                      return (
                        <tr key={k} className="border-b border-slate-100">
                          <td className="py-2 font-semibold"><Hint text={hint}>{k}</Hint></td>
                          <td className="py-2 text-right">{f(a)}</td>
                          <td className="py-2 text-right font-bold">{f(b)}</td>
                          <td className={`py-2 text-right font-bold ${k === 'Trades' ? 'text-slate-500' : good ? 'text-emerald-600' : bad ? 'text-rose-600' : 'text-slate-400'}`}>
                            {Math.abs(d) < 1e-9 ? 'same' : `${d > 0 ? '+' : '−'}${k === 'Win rate' ? `${Math.abs(d * 100).toFixed(1)} pts` : k === 'Max drawdown' || k === 'Net P&L' ? money(Math.abs(d), 'USD', 0, false) : k === 'Average R' ? `${Math.abs(d).toFixed(2)}R` : k === 'Trades' ? Math.abs(d) : Math.abs(d).toFixed(2)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="Equity: actual vs what-if" sub="Cumulative P&L of these trades in time order.">
              <LineChart label="Actual and what-if equity" area={false} yFmt={(y) => money(y, 'USD', 0)} xFmt={(x) => dateOnly(x, tz)}
                series={[{ name: 'What you did', color: '#94a3b8', dashed: true, points: curve('a') }, { name: 'With the rule', color: '#5338ec', points: curve('w') }]} />
            </Card>

            <Card title={`Trades that changed (${changed.length})`} right={changed.length > 0 ? <button type="button" className={btnSecondary} onClick={() => onOpenTrades(changed.map((t) => t.id), `What-if: ${ruleText}`)}>Open in Trade Log <ArrowRight className="w-3.5 h-3.5" /></button> : undefined}>
              {changed.length === 0 ? <p className="text-xs text-slate-500 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> This rule wouldn't have changed any of these trades.</p> : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-xs tabular-nums">
                    <thead><tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200"><th className="text-left py-2 pr-2">Date</th><th className="text-left py-2 px-2">Symbol</th><th className="text-left py-2 px-2">Playbook</th><th className="text-right py-2 px-2">Actual</th><th className="text-right py-2 px-2">With the rule</th><th className="text-left py-2 pl-2">What happened</th></tr></thead>
                    <tbody>
                      {changed.slice(0, 15).map((t) => (
                        <tr key={t.id} className="border-b border-slate-100">
                          <td className="py-2 pr-2 whitespace-nowrap">{dateOnly(t.entryTime, tz)}</td>
                          <td className="py-2 px-2 font-semibold">{t.symbol} <span className={t.direction === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}>{t.direction === 'BUY' ? 'Long' : 'Short'}</span></td>
                          <td className="py-2 px-2">{t.strategy}</td>
                          <td className={`py-2 px-2 text-right ${tone(t.actualNet)}`}>{money(t.actualNet, 'USD', 0)} <span className="text-slate-400">{rr(t.actualR, 1)}</span></td>
                          <td className={`py-2 px-2 text-right font-bold ${t.status === 'skipped' ? 'text-slate-500' : tone(t.newNet)}`}>{t.status === 'skipped' ? 'Skipped' : <>{money(t.newNet, 'USD', 0)} <span className="text-slate-400 font-normal">{rr(t.newR, 1)}</span></>}</td>
                          <td className="py-2 pl-2 text-[#474556]">{t.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {changed.length > 15 && <p className="text-[11px] text-slate-500 mt-2">+{changed.length - 15} more. Open them in the Trade Log to see all.</p>}
                </div>
              )}
            </Card>
          </>)}
        </div>
      </div>
    </div>
  );
};

