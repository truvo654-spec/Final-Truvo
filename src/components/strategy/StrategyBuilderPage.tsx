import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Strategy, Trade } from './engine/types';
import { runBacktest, splitMetrics } from './engine/backtest';
import { PERIODS, generateBars, getInstrument } from './engine/marketData';
import { TEMPLATES, cloneStrategy } from './engine/templates';
import { Tunable } from './engine/optimize';
import { buildInsights } from './insights';
import { SetupPanel } from './SetupPanel';
import { OverviewTab } from './OverviewTab';
import { TradesTab, tradesToCsv } from './TradesTab';
import { ReplayTab } from './ReplayTab';
import { OptimizeTab } from './OptimizeTab';
import { StressTab } from './StressTab';
import { CompareTab } from './CompareTab';
import { isValidStrategy, loadCurrent, loadSaved, saveAll, saveCurrent, withNewId } from './strategyStore';
import { money, pct, signedMoney, signedPct } from './format';
import { inputCls } from './ui';

type Tab = 'overview' | 'trades' | 'replay' | 'optimize' | 'stress' | 'compare';
const SCENARIO_KEY = 'marketsyde_strategy_scenario';

/** A small dropdown that closes on an outside click or Escape. */
const Menu: React.FC<{ label: string; align?: 'left' | 'right'; width?: string; children: (close: () => void) => React.ReactNode }> = ({ label, align = 'left', width = 'w-72', children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={`px-3.5 py-2 rounded-lg border text-xs font-bold transition-colors ${open ? 'border-[#5338ec] text-[#5338ec]' : 'border-slate-200 text-[#0b1c30] hover:border-[#5338ec]'} bg-white`}>
        {label} <span aria-hidden className="ml-0.5 text-[10px]">▾</span>
      </button>
      {open && <div role="menu" className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 ${width} max-w-[calc(100vw-2rem)] bg-white border border-[#e2e8f0] rounded-2xl shadow-xl p-2 z-40`}>{children(() => setOpen(false))}</div>}
    </div>
  );
};

const MenuItem: React.FC<{ onClick: () => void; title: string; sub?: string; danger?: boolean }> = ({ onClick, title, sub, danger }) => (
  <button type="button" role="menuitem" onClick={onClick} className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${danger ? 'hover:bg-rose-50' : 'hover:bg-slate-50'}`}>
    <span className={`block text-sm font-semibold ${danger ? 'text-rose-600' : 'text-[#0b1c30]'}`}>{title}</span>
    {sub && <span className="block text-[11px] text-[#6b7686] leading-snug mt-0.5">{sub}</span>}
  </button>
);

const download = (name: string, text: string, mime: string): boolean => {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
};

const copy = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const StrategyBuilderPage: React.FC<{ onShowToast: (msg: string) => void }> = ({ onShowToast }) => {
  const [strategy, setStrategy] = useState<Strategy>(() => loadCurrent());
  const [committed, setCommitted] = useState<Strategy>(strategy);
  const [scenario, setScenarioState] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(SCENARIO_KEY)) || 1;
    } catch {
      return 1;
    }
  });
  const [saved, setSaved] = useState<Strategy[]>(() => loadSaved());
  const [tab, setTab] = useState<Tab>('overview');
  const [pane, setPane] = useState<'build' | 'results'>('results');
  const [replayTrade, setReplayTrade] = useState<Trade | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const setScenario = (n: number) => {
    setScenarioState(n);
    try {
      localStorage.setItem(SCENARIO_KEY, String(n));
    } catch {
      /* ignore */
    }
  };

  // run a moment after the last edit, so typing a number does not rerun on every key
  useEffect(() => {
    const t = window.setTimeout(() => setCommitted(strategy), 260);
    const s = window.setTimeout(() => saveCurrent(strategy), 400);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(s);
    };
  }, [strategy]);
  const updating = committed !== strategy;

  const bars = useMemo(() => generateBars(committed.instrument, committed.timeframe, committed.period, scenario), [committed.instrument, committed.timeframe, committed.period, scenario]);
  const result = useMemo(() => runBacktest(committed, bars), [committed, bars]);
  const noCost = useMemo(() => runBacktest({ ...committed, costs: { spreadPips: 0, commissionPerLot: 0, slippagePips: 0 } }, bars), [committed, bars]);
  const split = useMemo(() => splitMetrics(result), [result]);
  const insights = useMemo(() => buildInsights(result, noCost, split), [result, noCost, split]);
  const m = result.metrics;
  const ins = getInstrument(committed.instrument);

  const persistSaved = (list: Strategy[]) => {
    setSaved(list);
    saveAll(list);
  };
  const saveCurrentStrategy = () => {
    const entry = { ...cloneStrategy(strategy), updatedAt: new Date().toISOString() };
    const exists = saved.some((s) => s.id === entry.id);
    persistSaved(exists ? saved.map((s) => (s.id === entry.id ? entry : s)) : [entry, ...saved]);
    onShowToast(exists ? `Updated “${entry.name}”` : `Saved “${entry.name}”`);
  };

  const applyTunables = (changes: { tunable: Tunable; value: number }[]) => {
    setStrategy((prev) => {
      const d = cloneStrategy(prev);
      changes.forEach((c) => c.tunable.set(d, c.value));
      return d;
    });
    onShowToast('Applied those values to your strategy');
  };

  const exportJson = () => JSON.stringify(strategy, null, 2);
  const filenameBase = `${(strategy.name || 'strategy').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!isValidStrategy(parsed)) throw new Error('shape');
      setStrategy({ ...parsed, id: parsed.id || withNewId(parsed).id });
      setImportOpen(false);
      setImportText('');
      setImportError('');
      onShowToast(`Imported “${parsed.name}”`);
    } catch {
      setImportError('That does not look like a strategy exported from here. Check the text and try again.');
    }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'trades', label: `Trades (${m.trades})` },
    { id: 'replay', label: 'Replay' },
    { id: 'optimize', label: 'Optimise' },
    { id: 'stress', label: 'Stress test' },
    { id: 'compare', label: 'Compare' },
  ];

  const periodLabel = PERIODS.find((p) => p.id === committed.period)?.label;

  return (
    <div className="strategy-root w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Strategy Builder &amp; Backtesting</h1>
          <p className="text-sm text-[#474556] mt-1 max-w-2xl">Build a trading idea from rules, then see how it would have traded on historical prices. Replay it candle by candle, and stress test it before you risk anything.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Menu label="Start from a template" width="w-80">
            {(close) => (
              <>
                <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">Templates</p>
                {TEMPLATES.map((t) => (
                  <MenuItem key={t.id} title={`${t.name} · ${t.style}`} sub={t.blurb} onClick={() => { setStrategy(t.build()); close(); onShowToast(`Started from “${t.name}”`); }} />
                ))}
              </>
            )}
          </Menu>
          <Menu label={`My strategies${saved.length ? ` (${saved.length})` : ''}`} width="w-80" align="right">
            {(close) => (
              <>
                <MenuItem title="Save this strategy" sub="Keeps it in this browser so you can come back to it." onClick={() => { saveCurrentStrategy(); close(); }} />
                <MenuItem title="Save as a copy" sub="Makes a new entry and leaves the original alone." onClick={() => { const c = withNewId(strategy); c.name = `${strategy.name} copy`; persistSaved([c, ...saved]); setStrategy(c); close(); onShowToast(`Saved “${c.name}”`); }} />
                <div className="border-t border-slate-100 my-1" />
                {saved.length === 0 && <p className="px-3 py-3 text-xs text-[#6b7686]">Nothing saved yet.</p>}
                {saved.map((s) => (
                  <div key={s.id} className="flex items-center gap-1">
                    <div className="flex-1 min-w-0"><MenuItem title={s.name} sub={`${getInstrument(s.instrument).label} · ${s.timeframe}${s.id === strategy.id ? ' · open now' : ''}`} onClick={() => { setStrategy(cloneStrategy(s)); close(); onShowToast(`Opened “${s.name}”`); }} /></div>
                    <button type="button" aria-label={`Delete ${s.name}`} onClick={() => { persistSaved(saved.filter((x) => x.id !== s.id)); onShowToast(`Deleted “${s.name}”`); }} className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-lg leading-none">×</button>
                  </div>
                ))}
              </>
            )}
          </Menu>
          <Menu label="Export / import" width="w-72" align="right">
            {(close) => (
              <>
                <MenuItem title="Copy strategy as JSON" sub="Paste it into another browser with Import." onClick={async () => { close(); onShowToast((await copy(exportJson())) ? 'Strategy copied' : 'Could not copy here'); }} />
                <MenuItem title="Download strategy (JSON)" onClick={() => { close(); onShowToast(download(`${filenameBase}.json`, exportJson(), 'application/json') ? 'Download started' : 'Could not download here. Use Copy instead.'); }} />
                <MenuItem title="Copy trades as CSV" onClick={async () => { close(); onShowToast((await copy(tradesToCsv(result))) ? 'Trades copied' : 'Could not copy here'); }} />
                <MenuItem title="Download trades (CSV)" onClick={() => { close(); onShowToast(download(`${filenameBase}-trades.csv`, tradesToCsv(result), 'text/csv') ? 'Download started' : 'Could not download here. Use Copy instead.'); }} />
                <div className="border-t border-slate-100 my-1" />
                <MenuItem title="Import a strategy…" sub="Paste JSON from an export." onClick={() => { close(); setImportOpen(true); }} />
              </>
            )}
          </Menu>
          <button type="button" onClick={saveCurrentStrategy} className="px-4 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold transition-colors">Save</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="flex items-center gap-2 min-w-[240px] flex-1 max-w-md">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686] shrink-0">Name</span>
          <input value={strategy.name} onChange={(e) => setStrategy({ ...strategy, name: e.target.value })} maxLength={60} aria-label="Strategy name" className={inputCls} />
        </label>
        <p className="text-xs text-[#474556] bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex-1 min-w-[260px]">
          Prices here are simulated and past results do not predict future ones. This is a learning tool, not advice.
        </p>
      </div>

      {/* Live summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Net profit', value: signedMoney(m.netProfit), tone: m.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600', sub: signedPct(m.returnPct) },
          { label: 'Worst drawdown', value: pct(m.maxDrawdownPct), tone: m.maxDrawdownPct >= 25 ? 'text-rose-600' : 'text-[#0b1c30]', sub: `on ${money(committed.capital)}` },
          { label: 'Profit factor', value: isFinite(m.profitFactor) ? m.profitFactor.toFixed(2) : '∞', tone: m.profitFactor >= 1 ? 'text-[#0b1c30]' : 'text-rose-600', sub: `win rate ${m.winRate.toFixed(0)}%` },
          { label: 'Trades', value: String(m.trades), tone: 'text-[#0b1c30]', sub: `${ins.label} · ${committed.timeframe} · ${periodLabel}` },
        ].map((x) => (
          <div key={x.label} className="bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3 relative">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b7686]">{x.label}</p>
            <p className={`font-display text-xl font-black mt-0.5 ${x.tone}`}>{x.value}</p>
            <p className="text-[11px] text-[#6b7686] truncate">{x.sub}</p>
          </div>
        ))}
      </div>
      <p className={`text-[11px] font-semibold mb-3 h-4 ${updating ? 'text-[#5338ec]' : 'text-transparent'}`} aria-live="polite">{updating ? 'Updating results…' : 'Up to date'}</p>

      {/* Mobile: switch between building and results */}
      <div className="lg:hidden flex rounded-xl border border-slate-200 overflow-hidden mb-4 text-sm font-bold" role="group" aria-label="Show">
        {(['build', 'results'] as const).map((p) => (
          <button key={p} type="button" aria-pressed={pane === p} onClick={() => setPane(p)} className={`flex-1 py-2.5 transition-colors ${pane === p ? 'bg-[#5338ec] text-white' : 'bg-white text-[#474556]'}`}>
            {p === 'build' ? 'Build the strategy' : 'See the results'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[400px_minmax(0,1fr)] gap-5 items-start">
        <aside className={`${pane === 'build' ? 'block' : 'hidden'} lg:block lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:pr-1`}>
          <SetupPanel strategy={strategy} onChange={setStrategy} scenario={scenario} onScenario={setScenario} barCount={bars.length} />
        </aside>

        <main className={`${pane === 'results' ? 'block' : 'hidden'} lg:block min-w-0`}>
          <div className="sticky top-[68px] z-20 bg-[#f8fafc] -mx-1 px-1 border-b border-[#e2e8f0] mb-4">
            <div className="flex overflow-x-auto gap-1 scrollbar-none" role="tablist" aria-label="Results">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)} className={`relative shrink-0 px-4 py-3 text-sm font-bold transition-colors ${tab === t.id ? 'text-[#5338ec]' : 'text-[#474556] hover:text-[#0b1c30]'}`}>
                  {t.label}
                  {tab === t.id && <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-[#5338ec]" />}
                </button>
              ))}
            </div>
          </div>

          {tab === 'overview' && <OverviewTab result={result} insights={insights} split={split} />}
          {tab === 'trades' && (
            m.trades === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-sm text-[#474556]">No trades yet. Adjust the rules and they will show up here.</div>
            ) : (
              <TradesTab
                result={result}
                onReplay={(t) => { setReplayTrade(t); setTab('replay'); }}
                onCopyCsv={async () => onShowToast((await copy(tradesToCsv(result))) ? 'Trades copied' : 'Could not copy here')}
                onDownloadCsv={() => onShowToast(download(`${filenameBase}-trades.csv`, tradesToCsv(result), 'text/csv') ? 'Download started' : 'Could not download here. Use Copy instead.')}
              />
            )
          )}
          {tab === 'replay' && (m.trades === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-sm text-[#474556]">Nothing to replay yet. Your rules have not opened a trade.</div> : <ReplayTab key={`${committed.id}-${scenario}-${committed.instrument}-${committed.timeframe}-${committed.period}`} result={result} focusTrade={replayTrade} onClearFocus={() => setReplayTrade(null)} />)}
          {tab === 'optimize' && <OptimizeTab strategy={committed} bars={bars} onApply={applyTunables} />}
          {tab === 'stress' && <StressTab result={result} strategy={committed} scenario={scenario} />}
          {tab === 'compare' && <CompareTab current={committed} saved={saved} scenario={scenario} />}
        </main>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={() => setImportOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Import a strategy" className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-lg shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0b1c30]">Import a strategy</h3>
            <p className="text-sm text-[#474556] mt-1 mb-3">Paste the JSON you copied from Export. It replaces what is open now, so save first if you want to keep it.</p>
            <textarea value={importText} onChange={(e) => { setImportText(e.target.value); setImportError(''); }} rows={9} placeholder='{ "name": "My strategy", ... }' aria-label="Strategy JSON" className={`${inputCls} font-mono text-xs`} />
            {importError && <p className="text-xs text-rose-600 mt-2" role="alert">{importError}</p>}
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setImportOpen(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl">Cancel</button>
              <button type="button" onClick={doImport} disabled={!importText.trim()} className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
