import React, { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '../../types';
import { buildCoachScenarioStudy, coachEligibleTrades, coachPeriod } from './coachScenarios';
import { type CoachGoal } from './aiCoach';
import { metrics } from './journalMath';
import { formatMoney } from './JournalCurrency';
import { describeWhatIf } from '../../backtest/whatif';
import { CoachCandleChart } from './CoachCandleChart';
import { makeSavedWhatIf, savedWhatIfKey, whatIfSaveKey } from '../../backtest/savedWhatIf';
import { loadWhatIfs, saveWhatIfs } from '../../backtest/store';
import type { RecommendationGoal } from '../../backtest/recommender';
import { CoachTradeList } from './CoachTradeList';

const box = 'rounded-2xl border border-slate-200 bg-white p-5';
const field = 'mt-1.5 h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-xs';
const colors = ['#5338ec', '#06a7a0', '#ea8b24', '#dd4279', '#387ad9', '#8b5bb3'];
export const JournalScenarioLab: React.FC<{ history: JournalEntry[]; currency: string; today: string; goal: CoachGoal; playbookName?: string; onEvidence: (ids: string[], label: string) => void; onToast: (msg: string) => void }> = ({ history, currency, today, goal, playbookName, onEvidence, onToast }) => {
  const [period, setPeriod] = useState('7');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [market, setMarket] = useState('all');
  const [symbol, setSymbol] = useState('all');
  const [tradeSelection, setTradeSelection] = useState<{ key: string; ids: string[] } | null>(null);
  const [variation, setVariation] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const base = useMemo(() => history.filter(e => (!playbookName || e.strategy.trim().toLowerCase() === playbookName.trim().toLowerCase()) && e.date <= today), [history, playbookName, today]);
  const dates = coachPeriod(base, today, period === 'all' ? null : Number(period));
  const start = from || dates.from, end = to || dates.to;
  const dated = useMemo(() => base.filter(e => (!start || e.date >= start) && e.date <= end), [base, start, end]);
  const marketOptions = [...new Set(dated.map(e => e.assetClass))].sort();
  const instrumentOptions = [...new Set(dated.filter(e => market === 'all' || e.assetClass === market).map(e => e.symbol))].sort();
  const filtered = useMemo(() => dated.filter(e => (market === 'all' || e.assetClass === market) && (symbol === 'all' || e.symbol === symbol)), [dated, market, symbol]);
  const available = useMemo(() => coachEligibleTrades(filtered, currency, today), [filtered, currency, today]);
  const selectionKey = available.map(entry => entry.id).sort().join('|');
  const selectedTradeIds = tradeSelection?.key === selectionKey ? tradeSelection.ids.slice(0, 1) : [];
  const selectedTradeKey = selectedTradeIds.slice().sort().join('|');
  const goalKey: RecommendationGoal = goal === 'drawdown' ? 'drawdown' : goal === 'expectancy' ? 'net' : 'win';
  const study = useMemo(() => buildCoachScenarioStudy(available.filter(entry => selectedTradeIds.includes(entry.id)), currency, today, goalKey, variation), [available, selectedTradeKey, currency, today, goalKey, variation]);
  const selectTrades = (ids: string[]) => { setTradeSelection({ key: selectionKey, ids: ids.slice(-1) }); setVariation(value => value + 1); };
  useEffect(() => { const ids = study.shortlist.slice(0, 2).map(r => r.id); setSelected(ids); setShowAll(false); }, [study]);
  const selectedRows = study.shortlist.filter(r => selected.includes(r.id));
  const baseline = metrics(study.cohort);
  const money = (n: number | null, signed = true) => n == null || !Number.isFinite(n) ? '—' : signed ? formatMoney(n, currency) : formatMoney(n, currency).replace(/^\+/, '');
  const num = (n: number | null, suffix = '') => n == null || !Number.isFinite(n) ? '—' : `${n.toFixed(2)}${suffix}`;
  const describe = (row: typeof study.rows[number]) => row.rule.kind === 'dailyLoss' ? `Stop after ${money(row.rule.usd, false)} daily loss` : describeWhatIf(row.rule);
  const ledger = study.rows[0]?.output.trades || [];
  const dateMap = new Map(study.cohort.map(e => [e.id, e.date]));
  const save = () => {
    const existing = loadWhatIfs();
    const context = { currency, source: 'ai' as const, goal: goalKey, benchmark: 'AI Coach · selected Trade Log', scope: { From: start || 'All', To: end, Market: market, Instrument: symbol, Playbook: playbookName || 'All', 'Trade IDs': study.cohort.map(e => e.id).sort().join(',') } };
    const keys = new Set(existing.map(savedWhatIfKey));
    const additions = selectedRows.filter(r => !keys.has(whatIfSaveKey(r.rule, context, r.output))).map(r => makeSavedWhatIf(r, context, `AI Coach · ${describe(r)}`));
    if (!additions.length) { onToast('These comparisons are already saved'); return; }
    onToast(saveWhatIfs([...additions, ...existing]) ? `${additions.length} scenario comparisons saved to Backtest → Saved runs` : 'Could not save comparison: browser storage unavailable');
  };
  return <div className="space-y-5" aria-label="One trade log to multiple scenarios">
    <section className={box} aria-label="Choose trades to analyze"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">1. Choose trades to analyze</h3><span className="text-xs text-slate-500">One baseline for every scenario</span></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <label className="text-xs font-semibold">Period<select aria-label="Period" className={field} value={period} onChange={e => { setPeriod(e.target.value); setFrom(''); setTo(''); setTradeSelection(null); setMarket('all'); setSymbol('all'); }}><option value="7">Latest week</option><option value="30">Latest 30 days</option><option value="90">Latest 90 days</option><option value="all">All history</option></select></label>
        <label className="text-xs font-semibold">From<input aria-label="From" type="date" className={field} value={start} max={end} onChange={e => { setFrom(e.target.value); setTradeSelection(null); }}/></label>
        <label className="text-xs font-semibold">To<input aria-label="To" type="date" className={field} value={end} max={today} min={start} onChange={e => { setTo(e.target.value); setTradeSelection(null); }}/></label>
        <label className="text-xs font-semibold">Market<select aria-label="Market" className={field} value={market} onChange={e => { setMarket(e.target.value); setSymbol('all'); setTradeSelection(null); }}><option value="all">All recorded markets</option>{marketOptions.map(m => <option key={m}>{m}</option>)}</select></label>
        <label className="text-xs font-semibold">Instrument<select aria-label="Instrument" className={field} value={symbol} onChange={e => { setSymbol(e.target.value); setTradeSelection(null); }}><option value="all">All recorded instruments</option>{instrumentOptions.map(s => <option key={s}>{s}</option>)}</select></label>
      </div><p className="mt-3 text-[11px] text-slate-500">{study.cohort.length} eligible closes · {start || 'All dates'} → {end} · {currency}. Presets end on your latest recorded trade, not today's calendar. Account and journal filters apply.</p>
      <CoachTradeList entries={available} currency={currency} selectedIds={selectedTradeIds} onSelectionChange={selectTrades}/>
    </section>

    <section className={box} aria-label="Matching alternative scenarios"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">2. Pick several alternative scenarios</h3><button type="button" disabled={!study.rows.length} onClick={() => setVariation(value => value + 1)} className="rounded-lg border border-[#5338ec]/25 px-3 py-2 text-xs font-semibold text-[#5338ec] disabled:opacity-40">Show other matching ideas</button></div><p className="mt-1 text-xs leading-relaxed text-slate-500">{study.recommendation?.candidate ? `${study.recommendation.status === 'candidate' ? 'Promising earlier-period candidate' : 'Exploratory earlier-period candidate'}: ${study.recommendation.candidate.name}. ` : 'No supported alternative met the improvement guardrails in the earlier period. '}Ideas refresh to match your selected trades. Each scenario changes one rule; comparisons use the same selected baseline.</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{study.shortlist.map(row => <label key={row.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selected.includes(row.id) ? 'border-[#5338ec]/50 bg-[#FBFAFF]' : 'border-slate-200'}`}><input type="checkbox" className="mt-1 accent-[#5338ec]" checked={selected.includes(row.id)} onChange={() => setSelected(ids => ids.includes(row.id) ? ids.filter(id => id !== row.id) : [...ids, row.id])}/><div className="min-w-0"><p className="text-xs font-bold">{describe(row)}</p><p className="mt-1 text-[10px] font-semibold text-[#5338ec]">{row.output.estimated ? 'Estimated · reconstructed price path' : row.rule.kind === 'mistakes' ? 'Retrospective tag exclusion' : 'Recorded trade filter'}</p><p className="mt-2 text-xs text-slate-600">Earlier-period change: {money(row.training.saved)} · {row.output.changed} changed / {row.output.skipped} skipped in the full selection</p><p className="mt-1 text-[11px] text-slate-500">Later-period change: {row.validation ? money(row.validation.saved) : 'Not enough later-period records'}</p></div></label>)}</div>
      {study.shortlist.length === 0 && <p className="mt-3 text-xs text-amber-700">{!selectedTradeIds.length ? 'Select one trade above to see matching scenario ideas.' : 'This trade lacks the recorded risk, timestamps or tags needed to evaluate an alternative. Choose another trade or complete those fields.'}</p>}
      <p className="mt-4 text-xs text-slate-500">Comparison updates automatically as you select scenarios. Your recorded baseline is always included.</p>
    </section>

    <section className={box}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">3. One trade vs {selectedRows.length} selected scenarios</h3><p className="mt-1 text-xs text-slate-500">Your selected trade and its alternatives on the same candle chart</p></div><button type="button" disabled={!selectedRows.length} onClick={save} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold disabled:opacity-40">Save selected comparisons</button></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><caption className="sr-only">Recorded trade log versus selected alternatives</caption><thead><tr><th className="bg-slate-50 p-3">Metric / strategy</th><th className="bg-slate-50 p-3">Your Trade Log</th>{selectedRows.map((r, i) => <th key={r.id} className="max-w-48 bg-[#F6F3FF] p-3"><span style={{ color: colors[i] }}>S{i + 1}</span> · {describe(r)}</th>)}</tr></thead><tbody>{[
        ['Net result', money(baseline.n ? baseline.total : null), ...selectedRows.map(r => money(r.output.whatIf.netPnl))],
        ['Difference vs your log', 'Baseline', ...selectedRows.map(r => money(r.output.saved))],
        ['Trades retained', `${baseline.n}`, ...selectedRows.map(r => `${r.output.whatIf.trades} / ${baseline.n}`)],
        ['Win rate', num(baseline.winRate, '%'), ...selectedRows.map(r => num(r.output.whatIf.winRate * 100, '%'))],
        ['Average R', num(baseline.avgR, 'R'), ...selectedRows.map(r => num(r.output.whatIf.avgR, 'R'))],
        ['Daily net drawdown', money(baseline.n ? baseline.drawdown : null, false), ...selectedRows.map(r => money(r.output.whatIf.maxDD, false))],
        ['Losses avoided / wins forfeited', '—', ...selectedRows.map(r => `${r.output.lossesAvoided} / ${r.output.winsForfeited}`)],
        ['Evidence type', 'Recorded closed net results', ...selectedRows.map(r => r.output.estimated ? 'Synthetic path estimate' : r.rule.kind === 'mistakes' ? 'Hindsight tag filter' : 'Recorded filter')],
      ].map(([label, ...values]) => <tr key={label} className="border-b border-slate-100"><th className="p-3 font-semibold">{label}</th>{values.map((v, i) => <td key={i} className="p-3 font-mono">{v}</td>)}</tr>)}</tbody></table></div>
      {study.cohort[0] && <CoachCandleChart key={study.cohort[0].id} entry={study.cohort[0]} currency={currency} scenarios={selectedRows.map((row, i) => ({ name: `S${i + 1}`, description: describe(row), color: colors[i], rule: row.rule, outcome: row.output.trades.find(trade => trade.id === study.cohort[0].id)! }))}/>}
      <p className="mt-4 text-[11px] leading-relaxed text-amber-800">Positive differences are historical experiments, not promised improvements. Target, stop and breakeven outcomes use a seeded synthetic path, not real candles; costs on changed exits are not fully reconstructed. Untested entry strategies remain in the playbook experiments below. Missing prerequisites keep a trade unchanged and are explained in the ledger.</p>
    </section>

    {ledger.length > 0 && <details className={box}><summary className="cursor-pointer text-sm font-semibold">Trade-by-trade comparison ({ledger.length})</summary><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead><tr><th className="p-3">Recorded trade</th><th className="p-3">Your net</th>{selectedRows.map((r, i) => <th key={r.id} className="p-3">S{i + 1} · alternative net / outcome</th>)}</tr></thead><tbody>{(showAll ? ledger : ledger.slice(0, 20)).map(t => <tr key={t.id} className="border-b border-slate-100"><th className="p-3"><button type="button" className="text-[#5338ec]" onClick={() => onEvidence([t.id], 'AI Coach · source trade')}>{dateMap.get(t.id)} · {t.symbol} · {t.direction}</button></th><td className="p-3 font-mono">{money(t.actualNet)}</td>{selectedRows.map(r => { const next = r.output.trades.find(x => x.id === t.id)!; return <td key={r.id} className="p-3"><strong>{money(next.newNet)}</strong><p className="mt-1 text-[10px] text-slate-500">{next.status} · {next.note || 'Recorded outcome retained'}</p></td>; })}</tr>)}</tbody></table></div>{ledger.length > 20 && <button type="button" className="mt-2 text-xs font-semibold text-[#5338ec]" onClick={() => setShowAll(v => !v)}>{showAll ? 'Show first 20' : 'Show all trades'}</button>}</details>}
  </div>;
};
