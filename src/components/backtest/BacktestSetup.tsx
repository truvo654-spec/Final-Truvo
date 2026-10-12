// Setup for an automated backtest: three short steps on one page, everything pre-filled.
import React, { useMemo, useState } from 'react';
import { ChevronDown, Sparkles, AlertCircle, Play } from 'lucide-react';
import type { Broker, JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { eligible, metrics } from '../journal/journalMath';
import { SYMBOLS, marketGroupOf, symbolSpec } from '../../backtest/marketData';
import {
  JournalRules, defaultCostsFor, defaultSettings, describeCondition, describeRules, presetRange, ruleCount, validateSettings,
} from '../../backtest/rules';
import {
  ALL_TIMEFRAMES, ASSET_CLASSES, AssetClass, BacktestSettings, Currency, SESSIONS, SUPPORTED_TIMEFRAMES, Timeframe,
} from '../../backtest/types';
import { pct, rr, utcWindow } from '../../backtest/format';
import { MAX_RULES } from '../../backtest/config';
import { Field, Hint, Pill, Segmented, Toggle, btnPrimary, btnSecondary, inputBase, inputCls } from './ui';

type PresetId = '3' | '6' | '12' | '24' | 'max';

interface Props {
  settings: BacktestSettings;
  onChange: (s: BacktestSettings) => void;
  playbooks: JournalPlaybook[];
  entries: JournalEntry[];
  brokers: Broker[];
  journalRules: JournalRules;
  onRun: () => void;
  onOpenTrades: (ids: string[], label: string) => void;
  runHint: string;
  tz: string;
}

const PROP_TEMPLATES = [
  { account: 'Apex 50K evaluation', profitTargetPct: 6, maxDrawdownPct: 5, trailing: true, dailyLossPct: 2.5, minDays: 7 },
  { account: 'FTMO 100K challenge', profitTargetPct: 10, maxDrawdownPct: 10, trailing: false, dailyLossPct: 5, minDays: 4 },
  { account: 'Topstep 50K combine', profitTargetPct: 6, maxDrawdownPct: 4, trailing: true, dailyLossPct: 2, minDays: 5 },
];

/** Costs from a broker's account types (raw/zero accounts: commission + tight spread). */
function brokerCosts(b: Broker, symbol: string): { commissionPerSide: number; spread: number; slippage: number } {
  const base = defaultCostsFor(symbol);
  const spec = symbolSpec(symbol);
  if (spec?.assetClass !== 'Forex') return base;
  const raw = (b.accountTypes || []).find((a) => /raw|zero|pro|ecn/i.test(a.name) && /\$/.test(a.commission));
  const m = raw?.commission.match(/\$\s*(\d+(?:\.\d+)?)/);
  const roundTurn = /round|r\/t|rt\b/i.test(raw?.commission || '');
  const fromPips = parseFloat(b.spreadFrom) || 0;
  if (m) return { commissionPerSide: roundTurn ? +m[1] / 2 : +m[1], spread: Math.max(0.1, fromPips + 0.1), slippage: 0.2 };
  return { commissionPerSide: 0, spread: Math.max(0.6, fromPips + 0.6), slippage: 0.2 };
}

const sizeText = (sym: string) => {
  const s = symbolSpec(sym);
  if (!s) return '';
  if (s.assetClass === 'Forex') return `1 lot = ${s.multiplier.toLocaleString('en-US')} units · $${(s.multiplier * s.costUnit.size).toFixed(0)} per pip`;
  if (s.assetClass === 'Futures') return `$${s.multiplier} per point per contract · tick ${s.tickSize}`;
  return `${s.sizeUnit} · tick ${s.tickSize}`;
};

const Step: React.FC<{ n: number; title: string; sub: string; children: React.ReactNode; right?: React.ReactNode }> = ({ n, title, sub, children, right }) => (
  <section className="bg-white border border-[#e2e8f0] rounded-2xl p-5 min-w-0" aria-label={title}>
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-7 h-7 rounded-full bg-[#EEF0FE] text-[#5338ec] text-xs font-bold shrink-0" aria-hidden>{n}</span>
        <div>
          <h3 className="text-base font-bold text-[#0b1c30]">{title}</h3>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
      {right}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

const Fold: React.FC<{ title: string; summary: string; open: boolean; onToggle: () => void; children: React.ReactNode; id: string }> = ({ title, summary, open, onToggle, children, id }) => (
  <div className="rounded-xl border border-slate-200">
    <button type="button" data-dropdown-trigger="true" aria-expanded={open} aria-controls={id} onClick={onToggle} className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-slate-50 rounded-xl">
      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      <span className="text-xs font-bold text-[#0b1c30]">{title}</span>
      <span className="text-[11px] text-slate-500 truncate">{summary}</span>
    </button>
    {open && <div id={id} className="px-3.5 pb-3.5 pt-1 space-y-4">{children}</div>}
  </div>
);

export const BacktestSetup: React.FC<Props> = ({ settings: s, onChange, playbooks, entries, brokers, journalRules, onRun, onOpenTrades, runHint, tz }) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const set = (p: Partial<BacktestSettings>) => onChange({ ...s, ...p });

  const spec = symbolSpec(s.symbol);
  const problems = validateSettings(s);
  const choosable = playbooks.filter((p) => p.status !== 'archived');
  const pb = choosable.find((p) => p.id === s.playbookId) || null;

  const journalEntries = useMemo(() => pb ? entries.filter((e) => e.strategy === pb.name) : [], [pb, entries]);
  const live = useMemo(() => {
    if (!pb) return null;
    const list = journalEntries.filter(eligible);
    const shared = metrics(list);
    const m = { trades: shared.n, winRate: (shared.winRate ?? 0) / 100, avgR: shared.avgR, pf: shared.pf };
    const counts = new Map<string, number>();
    list.forEach((e) => counts.set(e.symbol, (counts.get(e.symbol) || 0) + 1));
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return { m, top: top ? { symbol: top[0], n: top[1] } : null };
  }, [pb, journalEntries]);

  const choosePlaybook = (id: string) => {
    const p = playbooks.find((x) => x.id === id) || null;
    const counts = new Map<string, number>();
    entries.filter((e) => p && e.strategy === p.name).forEach((e) => counts.set(e.symbol, (counts.get(e.symbol) || 0) + 1));
    const most = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([sym]) => sym).find((sym) => symbolSpec(sym));
    const d = defaultSettings({ playbook: p, journalRules, mostTraded: most });
    onChange({ ...d, risk: { ...d.risk, startBalance: s.risk.startBalance, currency: s.risk.currency }, costs: s.costs.brokerId ? s.costs : { ...s.costs, ...defaultCostsFor(d.symbol) }, prop: s.prop });
  };

  const chooseSymbol = (sym: string) => {
    const b = brokers.find((x) => x.id === s.costs.brokerId);
    set({ symbol: sym, costs: { ...s.costs, ...(b ? brokerCosts(b, sym) : defaultCostsFor(sym)) } });
  };
  const chooseClass = (c: AssetClass) => { const first = SYMBOLS.find((x) => marketGroupOf(x) === c); if (first) chooseSymbol(first.symbol); };

  const brokerOptions = useMemo(() => {
    const used = new Set(entries.map((e) => e.brokerId).filter(Boolean));
    return brokers.filter((b) => b.connected || used.has(b.id));
  }, [brokers, entries]);

  const preset = (['3', '6', '12', '24', 'max'] as const).find((m) => { const r = presetRange(m === 'max' ? 'max' : Number(m)); return r.from === s.from && r.to === s.to; });
  const sessionText = s.session.id === 'any' ? 'Any time' : `${s.session.id === 'custom' ? 'Custom hours' : SESSIONS[s.session.id].label} ${utcWindow(s.session.start, s.session.end, tz)}`;
  const DAYS = [[1, 'M', 'Monday'], [2, 'T', 'Tuesday'], [3, 'W', 'Wednesday'], [4, 'Th', 'Thursday'], [5, 'F', 'Friday'], [6, 'S', 'Saturday'], [0, 'Su', 'Sunday']] as const;
  const dayText = s.weekdays.length === 5 && [1, 2, 3, 4, 5].every((d) => s.weekdays.includes(d)) ? 'Mon–Fri' : s.weekdays.length === 7 ? 'Every day' : `${s.weekdays.length} days`;
  const unit = spec?.costUnit.label ?? 'pips';
  const roundTrip = s.costs.enabled ? `$${(s.costs.commissionPerSide * 2).toFixed(2)} commission + ${(s.costs.spread + 2 * s.costs.slippage).toFixed(2)} ${unit} spread and slippage per round trip` : 'Costs off';
  const matchesRisk = s.risk.mode === 'percent' && s.risk.percent === journalRules.maxRisk;
  const matchesDaily = s.risk.dailyLossPct === journalRules.maxDailyLoss;
  const rc = ruleCount(s);

  return (
    <div className="space-y-5 pb-28">
      {pb && (
        <div className="flex flex-wrap items-center gap-4 bg-[#FBFAFF] border border-[#5338ec]/20 rounded-2xl px-5 py-4">
          <Sparkles className="w-5 h-5 text-[#5338ec] shrink-0" aria-hidden />
          <div className="flex-1 min-w-[14rem]">
            <p className="text-sm font-bold text-[#0b1c30]">Filled in from your <span className="text-[#5338ec]">{pb.name}</span> playbook</p>
            <p className="text-xs text-[#474556]">Rules, session, market and risk come from the playbook and your journal rules. Change anything below, or just press Run.</p>
          </div>
          {live && live.m.trades > 0 && (
            <div className="text-xs text-[#474556]" title="How this playbook has done in your real journal trades">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your journal so far</p>
              <p className="tabular-nums"><b className="text-[#0b1c30]">{pct(live.m.winRate, 0)}</b> win rate · <b className="text-[#0b1c30]">{rr(live.m.avgR)}</b> avg · {live.m.trades} trades</p>
            </div>
          )}
        </div>
      )}

      {/* STEP 1 */}
      <Step n={1} title="What to test" sub="Choose a playbook to transfer its hypothesis and settings, then compare the test with your journal trades." right={<span className="text-[11px] text-slate-500 tabular-nums" title="Entry rules plus extra filters and trade-management rules. Many rules make a test easy to over-fit.">{rc} rule{rc === 1 ? '' : 's'}{rc > MAX_RULES ? ' · consider fewer' : ''}</span>}>
        <Field label="Playbook hypothesis" htmlFor="bt-pb" hint="Selecting a playbook automatically fills its testable rules, market, session and risk settings.">
          <select id="bt-pb" value={s.playbookId ?? ''} onChange={(e) => { if (e.target.value) choosePlaybook(e.target.value); }} className={`${inputCls} max-w-sm`} disabled={!choosable.length}>
            <option value="" disabled>Choose a playbook</option>
            {choosable.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.grade}){p.status === 'testing' ? ' · testing' : ''}</option>)}
          </select>
        </Field>

        {pb ? (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-4">
            <div className="space-y-3">
              <div className="rounded-xl border border-[#5338ec]/20 bg-[#FBFAFF] p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#5338ec]" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0b1c30]">Hypothesis from {pb.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#474556]">{pb.thesis || pb.entryTrigger || 'No written hypothesis is saved in this playbook yet.'}</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  {pb.technicalRecipeId
                    ? 'The simulation rules below are transferred from this playbook’s saved technical recipe.'
                    : 'No technical recipe is saved. The simulation uses a starter rule set matched to the playbook name and style; discretionary notes are shown for context but are not simulated.'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rules this test will simulate</p>
                <ol className="mt-2 space-y-2">
                  {describeRules(s.rules, unit).map((r, i) => (
                    <li key={r.label} className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="w-5 shrink-0 pt-0.5 text-[10px] font-mono font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{r.label}</p>
                        <p className="text-sm text-[#0b1c30]">{r.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <details className="rounded-xl border border-slate-200 px-3.5 py-2.5">
                <summary className="cursor-pointer text-xs font-semibold text-[#474556]">View written playbook rules and execution notes</summary>
                <div className="mt-3 space-y-3 text-xs leading-relaxed text-[#474556]">
                  {pb.entryTrigger && <p><b>Entry trigger:</b> {pb.entryTrigger}</p>}
                  {pb.stopRule && <p><b>Stop / invalidation:</b> {pb.stopRule}</p>}
                  {pb.targetRule && <p><b>Profit taking:</b> {pb.targetRule}</p>}
                  {pb.rules.length > 0 && <ul className="space-y-2">{pb.rules.map((rule) => <li key={rule.id}><b>{rule.title}:</b> {rule.detail}</li>)}</ul>}
                </div>
              </details>
            </div>

            <aside className="rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Compare with your journal</p>
              {live && live.m.trades > 0 ? (
                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs tabular-nums">
                  <div><dt className="text-slate-500">Closed trades</dt><dd className="mt-0.5 font-bold text-[#0b1c30]">{live.m.trades}</dd></div>
                  <div><dt className="text-slate-500">Win rate</dt><dd className="mt-0.5 font-bold text-[#0b1c30]">{pct(live.m.winRate, 0)}</dd></div>
                  <div><dt className="text-slate-500">Average R</dt><dd className="mt-0.5 font-bold text-[#0b1c30]">{live.m.avgR === null ? '—' : rr(live.m.avgR)}</dd></div>
                  <div><dt className="text-slate-500">Profit factor</dt><dd className="mt-0.5 font-bold text-[#0b1c30]">{live.m.pf === null ? '—' : Number.isFinite(live.m.pf) ? live.m.pf.toFixed(2) : '∞'}</dd></div>
                </dl>
              ) : <p className="mt-3 text-xs text-slate-500">No eligible closed journal trades for this playbook yet.</p>}
              <button type="button" disabled={!journalEntries.length} onClick={() => onOpenTrades(journalEntries.map((e) => e.id), `${pb.name} playbook journal`)} className={`${btnSecondary} mt-4 w-full justify-center disabled:cursor-not-allowed`}>
                {journalEntries.length ? `View ${journalEntries.length} journal entr${journalEntries.length === 1 ? 'y' : 'ies'}` : 'No matching journal entries'}
              </button>
            </aside>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            {choosable.length
              ? 'Choose a playbook to generate the test hypothesis from its saved data.'
              : 'No active or testing playbooks are available. Create or reactivate one in Playbook to build a test hypothesis.'}
          </div>
        )}
      </Step>

      {/* STEP 2 */}
      <Step n={2} title="Market and dates" sub="Which market, which period, which chart.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Market type">
            <Segmented label="Asset class" value={spec ? marketGroupOf(spec) : 'Forex'} onChange={chooseClass} options={ASSET_CLASSES.map((c) => ({ id: c, label: c }))} />
            {spec && marketGroupOf(spec) === 'Indices' && <p className="text-[11px] text-slate-500 mt-1">Micro index futures (MNQ / MES), not cash-index CFDs.</p>}
          </Field>
          <Field label="Symbol" htmlFor="bt-symbol" hint="Instruments the demo price feed covers. Your journal names map automatically (NAS100 → MNQ, US500 → MES, XAU/USD → MGC)." aside={live?.top && pb && <span className="text-[10px] text-emerald-700 font-semibold">Most traded in {pb.name}: {live.top.symbol} ({live.top.n})</span>}>
            <select id="bt-symbol" value={s.symbol} onChange={(e) => chooseSymbol(e.target.value)} className={inputCls}>
              {ASSET_CLASSES.filter((c) => SYMBOLS.some((x) => marketGroupOf(x) === c)).map((c) => (
                <optgroup key={c} label={c}>{SYMBOLS.filter((x) => marketGroupOf(x) === c).map((x) => <option key={x.symbol} value={x.symbol}>{x.symbol} · {x.name}{x.aliases.length ? ` (${x.aliases[0]})` : ''}</option>)}</optgroup>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">{sizeText(s.symbol)}</p>
          </Field>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Dates" hint="Both days are included. The demo feed has data from Oct 2024 to Oct 2026."
            aside={<Segmented<PresetId> size="sm" label="Date presets" value={(preset ?? '') as PresetId} onChange={(m) => set(presetRange(m === 'max' ? 'max' : Number(m)))} options={[{ id: '3', label: '3M' }, { id: '6', label: '6M' }, { id: '12', label: '1Y' }, { id: '24', label: '2Y' }, { id: 'max', label: 'Max' }]} />}>
            <div className="flex items-center gap-2">
              <input type="date" aria-label="Start date" value={s.from} onChange={(e) => set({ from: e.target.value })} className={inputCls} />
              <span className="text-xs text-slate-400">to</span>
              <input type="date" aria-label="End date" value={s.to} onChange={(e) => set({ to: e.target.value })} className={inputCls} />
            </div>
          </Field>
          <Field label="Chart timeframe" hint="Bar size the rules are checked on. Tick, 1s and 1m need a tick data feed, which isn't connected yet.">
            <Segmented label="Timeframe" value={s.timeframe} onChange={(tf: Timeframe) => set({ timeframe: tf })}
              options={ALL_TIMEFRAMES.map((t) => ({ id: t, label: t === 'tick' ? 'Tick' : t }))}
              disabled={Object.fromEntries(ALL_TIMEFRAMES.filter((t) => !SUPPORTED_TIMEFRAMES.includes(t)).map((t) => [t, 'Needs a tick data feed (coming with the live data provider).'])) as Partial<Record<Timeframe, string>>} />
          </Field>
        </div>
        <Fold id="bt-filters" title="When to trade" open={!!open.filters} onToggle={() => toggle('filters')} summary={`${sessionText} · ${dayText} · news days ${s.news === 'include' ? 'included' : s.news === 'skip' ? 'skipped' : 'only'}`}>
          <Field label="Session" hint="Only open trades inside this window. Hours are in UTC; your local time is shown next to them.">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented label="Session" value={s.session.id} onChange={(id) => set({ session: id === 'any' ? { id, start: 0, end: 24 } : id === 'custom' ? { id, start: s.session.start % 24, end: s.session.end === 24 ? 16 : s.session.end } : { id, start: SESSIONS[id].start, end: SESSIONS[id].end } })}
                options={[{ id: 'any', label: 'Any time' }, { id: 'asia', label: 'Asia' }, { id: 'london', label: 'London' }, { id: 'ny', label: 'New York' }, { id: 'custom', label: 'Custom' }]} />
              {s.session.id === 'custom' && (
                <span className="flex items-center gap-1.5 text-xs">
                  <select aria-label="Session start hour (UTC)" value={s.session.start} onChange={(e) => set({ session: { ...s.session, start: Number(e.target.value) } })} className={`${inputBase} w-auto`}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</select>
                  to
                  <select aria-label="Session end hour (UTC)" value={s.session.end} onChange={(e) => set({ session: { ...s.session, end: Number(e.target.value) } })} className={`${inputBase} w-auto`}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h + 1}>{String((h + 1) % 24).padStart(2, '0')}:00</option>)}</select>
                  UTC
                </span>
              )}
            </div>
            {s.session.id !== 'any' && <p className="text-[11px] text-slate-500 mt-1">{utcWindow(s.session.start, s.session.end, tz)}</p>}
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Weekdays">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Weekdays to trade">
                {DAYS.map(([d, short, long]) => {
                  const on = s.weekdays.includes(d);
                  return <button key={d} type="button" aria-pressed={on} title={long} onClick={() => set({ weekdays: on ? s.weekdays.filter((x) => x !== d) : [...s.weekdays, d] })}
                    className={`w-9 h-8 rounded-lg text-xs font-bold border ${on ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>{short}</button>;
                })}
              </div>
            </Field>
            <Field label="High-impact news days" hint="Days with US jobs (NFP), inflation (CPI) or Fed (FOMC) releases.">
              <Segmented label="News days" value={s.news} onChange={(n) => set({ news: n })} options={[{ id: 'include', label: 'Include', title: 'Trade news days like any other day' }, { id: 'skip', label: 'Skip', title: 'No trades on news days' }, { id: 'only', label: 'Only news days', title: 'Trade only on news days' }]} />
            </Field>
          </div>
        </Fold>
      </Step>

      {/* STEP 3 */}
      <Step n={3} title="Money, risk and costs" sub="Defaults come from your journal rules and your broker.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Starting balance" htmlFor="bt-bal">
            <div className="flex gap-1.5">
              <input id="bt-bal" type="number" min={0} step={1000} value={s.risk.startBalance} onChange={(e) => set({ risk: { ...s.risk, startBalance: Number(e.target.value) } })} className={inputCls} />
              <select aria-label="Account currency" value={s.risk.currency} onChange={(e) => set({ risk: { ...s.risk, currency: e.target.value as Currency } })} className={`${inputBase} w-auto`}><option>USD</option><option>EUR</option><option>GBP</option></select>
            </div>
          </Field>
          <Field label="Risk per trade" className="lg:col-span-2" hint="% of balance: each trade risks this share of the current balance (sizes grow and shrink with it). Fixed $: the same dollar risk every time. Fixed size: the same position size every time."
            aside={matchesRisk ? <Pill tone="good" title="Same as Max risk per trade in your journal's Trading rules">Matches your journal rules</Pill> : null}>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented size="sm" label="Position sizing" value={s.risk.mode} onChange={(m) => set({ risk: { ...s.risk, mode: m } })} options={[{ id: 'percent', label: '% of balance' }, { id: 'fixedR', label: 'Fixed $' }, { id: 'fixedQty', label: 'Fixed size' }]} />
              <div className="flex items-center gap-1.5 w-36">
                <input type="number" step="any" min={0} aria-label="Risk amount" value={s.risk.mode === 'percent' ? s.risk.percent : s.risk.mode === 'fixedR' ? s.risk.fixedR : s.risk.qty}
                  onChange={(e) => { const v = Number(e.target.value); set({ risk: { ...s.risk, ...(s.risk.mode === 'percent' ? { percent: v } : s.risk.mode === 'fixedR' ? { fixedR: v } : { qty: v }) } }); }} className={inputCls} />
                <span className="text-xs text-slate-500 whitespace-nowrap">{s.risk.mode === 'percent' ? '%' : s.risk.mode === 'fixedR' ? s.risk.currency : spec?.sizeUnit}</span>
              </div>
              {s.risk.mode === 'percent' && <span className="text-[11px] text-slate-500 tabular-nums">≈ {(s.risk.startBalance * s.risk.percent / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })} {s.risk.currency} at the start</span>}
            </div>
          </Field>
          <Field label="Daily loss limit" hint="Stop trading for the day once losses reach this % of the day's starting balance. Leave empty for no limit." aside={matchesDaily ? <Pill tone="good" title="Same as Max daily loss in your journal's Trading rules">Journal rule</Pill> : null}>
            <div className="flex items-center gap-1.5"><input type="number" step="0.5" min={0} placeholder="Off" aria-label="Daily loss limit percent" value={s.risk.dailyLossPct ?? ''} onChange={(e) => set({ risk: { ...s.risk, dailyLossPct: e.target.value === '' ? null : Number(e.target.value) } })} className={inputCls} /><span className="text-xs text-slate-500">%</span></div>
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Max drawdown limit" hint="End the whole test if the balance falls this % below its highest point. Leave empty to run to the end.">
            <div className="flex items-center gap-1.5"><input type="number" step="1" min={0} placeholder="Off" aria-label="Max drawdown limit percent" value={s.risk.maxDrawdownPct ?? ''} onChange={(e) => set({ risk: { ...s.risk, maxDrawdownPct: e.target.value === '' ? null : Number(e.target.value) } })} className={inputCls} /><span className="text-xs text-slate-500">%</span></div>
          </Field>
        </div>

        <Fold id="bt-costs" title="Costs" open={!!open.costs} onToggle={() => toggle('costs')} summary={s.costs.enabled ? `On · ${brokers.find((b) => b.id === s.costs.brokerId)?.name ?? 'typical costs'} · ${roundTrip}` : 'Off (results will look better than real trading)'}>
          <div className="flex items-center gap-2">
            <Toggle id="bt-costs-on" label="Include costs" checked={s.costs.enabled} onChange={(v) => set({ costs: { ...s.costs, enabled: v } })} />
            <label htmlFor="bt-costs-on" className="text-sm font-semibold text-[#0b1c30]">Include commission, spread and slippage</label>
          </div>
          {s.costs.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Use costs from my broker" htmlFor="bt-broker" hint="Pre-fills commission and spread from your broker's raw-spread account. You can still change the numbers.">
                <select id="bt-broker" value={s.costs.brokerId ?? ''} onChange={(e) => { const b = brokers.find((x) => x.id === e.target.value); set({ costs: { ...s.costs, brokerId: b?.id ?? null, ...(b ? brokerCosts(b, s.symbol) : defaultCostsFor(s.symbol)) } }); }} className={inputCls}>
                  <option value="">Typical costs for this market</option>
                  {brokerOptions.map((b) => <option key={b.id} value={b.id}>{b.name}{b.connected ? ' (connected)' : ''}</option>)}
                </select>
              </Field>
              <Field label="Commission" hint={`USD per ${spec?.sizeUnit.replace(/s$/, '') ?? 'unit'} per side (charged on entry and on exit).`}>
                <div className="flex items-center gap-1.5"><input type="number" step="any" min={0} aria-label="Commission per side" value={s.costs.commissionPerSide} onChange={(e) => set({ costs: { ...s.costs, commissionPerSide: Number(e.target.value) } })} className={inputCls} /><span className="text-[11px] text-slate-500 whitespace-nowrap">$ / side</span></div>
              </Field>
              <Field label="Spread" hint={`Typical bid/ask spread in ${unit}. Half is paid on entry and half on exit.`}>
                <div className="flex items-center gap-1.5"><input type="number" step="any" min={0} aria-label="Spread" value={s.costs.spread} onChange={(e) => set({ costs: { ...s.costs, spread: Number(e.target.value) } })} className={inputCls} /><span className="text-[11px] text-slate-500">{unit}</span></div>
              </Field>
              <Field label="Slippage" hint={`Extra ${unit} lost on market and stop orders (limit orders and targets have none).`}>
                <div className="flex items-center gap-1.5"><input type="number" step="any" min={0} aria-label="Slippage" value={s.costs.slippage} onChange={(e) => set({ costs: { ...s.costs, slippage: Number(e.target.value) } })} className={inputCls} /><span className="text-[11px] text-slate-500">{unit}</span></div>
              </Field>
            </div>
          )}
          <Field label="Fill model" hint="Next bar open is the realistic default: a signal at a bar's close can only be traded on the next bar. Same bar close assumes you get the closing price.">
            <Segmented label="Fill model" value={s.costs.fillModel} onChange={(f) => set({ costs: { ...s.costs, fillModel: f } })} options={[{ id: 'nextOpen', label: 'Next bar open' }, { id: 'sameClose', label: 'Same bar close' }]} />
            <p className="text-[11px] text-slate-500 mt-1">Limit orders fill only if price trades through them. If a stop and a target are both hit in one bar, the stop counts first.</p>
          </Field>
        </Fold>

        <Fold id="bt-prop" title="Prop-firm challenge" open={!!open.prop} onToggle={() => toggle('prop')} summary={s.prop ? `On · ${s.prop.account}` : 'Off'}>
          <div className="flex flex-wrap items-center gap-3">
            <Toggle id="bt-prop-on" label="Prop-firm mode" checked={!!s.prop} onChange={(v) => set({ prop: v ? { ...PROP_TEMPLATES[0] } : null, risk: v ? { ...s.risk, startBalance: 50000 } : s.risk })} />
            <label htmlFor="bt-prop-on" className="text-sm font-semibold text-[#0b1c30]">Test against prop-firm rules</label>
            {s.prop && (
              <select aria-label="Prop account template" value={s.prop.account} onChange={(e) => { const t = PROP_TEMPLATES.find((p) => p.account === e.target.value); if (t) set({ prop: { ...t }, risk: { ...s.risk, startBalance: /100K/.test(t.account) ? 100000 : 50000 } }); }} className={`${inputBase} w-auto`}>
                {PROP_TEMPLATES.map((p) => <option key={p.account}>{p.account}</option>)}
              </select>
            )}
          </div>
          {s.prop && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {([['profitTargetPct', 'Profit target', '%', 'Pass when the balance is up this much (after the minimum days).'], ['maxDrawdownPct', 'Max drawdown', '%', 'Fail if the balance falls this far below the start (or below the peak if trailing).'], ['dailyLossPct', 'Daily loss', '%', 'Fail if one day loses this % of that day\'s starting balance.'], ['minDays', 'Min trading days', 'days', 'Days with at least one trade needed before passing.']] as const).map(([k, label, u, hint]) => (
                <Field key={k} label={label} hint={hint}>
                  <div className="flex items-center gap-1.5"><input type="number" step="any" min={0} aria-label={label} value={s.prop![k]} onChange={(e) => set({ prop: { ...s.prop!, [k]: Number(e.target.value) } })} className={inputCls} /><span className="text-xs text-slate-500">{u}</span></div>
                </Field>
              ))}
              <Field label="Trailing drawdown" hint="Measure the drawdown from the highest balance instead of the starting balance.">
                <Toggle label="Trailing drawdown" checked={s.prop.trailing} onChange={(v) => set({ prop: { ...s.prop!, trailing: v } })} />
              </Field>
            </div>
          )}
        </Fold>
      </Step>

      {/* Sticky run bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[14rem]">
            <p className="text-xs font-semibold text-[#0b1c30] truncate">{s.symbol} · {s.timeframe} · {s.from} → {s.to} · {s.rules.entry.length ? describeCondition(s.rules.entry[0]) : 'no entry rule'}{s.rules.entry.length > 1 ? ` +${s.rules.entry.length - 1}` : ''}</p>
            {problems.length || !pb ? (
              <p className="text-[11px] text-rose-600 flex items-center gap-1" role="alert"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{problems[0]?.message ?? 'Choose an active playbook to create a test hypothesis.'}</p>
            ) : (
              <p className="text-[11px] text-slate-500">{runHint}</p>
            )}
          </div>
          <button type="button" className={`${btnPrimary} h-11 px-6 text-base`} disabled={problems.length > 0 || !pb} onClick={onRun}><Play className="w-4 h-4" /> Run backtest</button>
        </div>
      </div>
    </div>
  );
};
