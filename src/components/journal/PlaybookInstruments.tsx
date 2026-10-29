import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, PencilLine, Plus, Search, Sparkles, X } from 'lucide-react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { DATA_END } from '../../backtest/config';
import { JournalHelp } from './JournalHelp';
import { useDialogFocus } from './useDialogFocus';
import { InstrumentPatternForm } from './InstrumentPatternForm';
import { PLAYBOOK_CONDITIONS_PATTERN, playbookConditionPattern } from './playbookConditionPattern';
import { validatePlaybookConditions } from '../../backtest/playbookConditions';
import { canonicalInstrument, INSTRUMENT_MARKETS, instrumentMarket, playbookInstrumentSelection, knownInstrument, newInstrumentPattern, PATTERN_LABELS, PLAYBOOK_INSTRUMENTS, playbookPattern, suggestPlaybookInstruments, type InstrumentPattern, type InstrumentPatternSetup, type InstrumentSuggestion } from './instrumentMatching';

type Selection = ReturnType<typeof playbookInstrumentSelection> & Pick<JournalPlaybook, 'instrumentPatterns' | 'instrumentPatternId' | 'instrumentTimeframe'>;
const secondary = 'inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-[#B8ABFB] hover:text-[#5338ec] focus-visible:outline-2 focus-visible:outline-[#5338ec] disabled:opacity-40';

export const PlaybookInstruments: React.FC<{
  playbook: JournalPlaybook; entries: JournalEntry[]; onSave: (selection: Selection) => void; inlineSelect?: boolean;
}> = ({ playbook, entries, onSave, inlineSelect = false }) => {
  const [mode, setMode] = useState<'browse' | 'suggestions' | null>(null);
  const [query, setQuery] = useState('');
  const selected = (playbook.symbols || []).map(canonicalInstrument);
  const inlineCandidates = useMemo(() => {
    const journalSymbols = entries
      .filter(entry => !knownInstrument(entry.symbol))
      .map(entry => ({ symbol: canonicalInstrument(entry.symbol), name: 'From your journal', market: entry.assetClass }));
    const customSymbols = selected
      .filter(symbol => !knownInstrument(symbol))
      .flatMap(symbol => {
        const market = playbook.instrumentMarkets?.[symbol];
        return market ? [{ symbol, name: 'Custom instrument', market }] : [];
      });
    const catalog = [...PLAYBOOK_INSTRUMENTS, ...journalSymbols, ...customSymbols];
    return [...new Map(catalog
      .filter(instrument => playbook.markets.includes(instrument.market))
      .filter(instrument => `${instrument.symbol} ${instrument.name}`.toLowerCase().includes(query.trim().toLowerCase()))
      .map(instrument => [canonicalInstrument(instrument.symbol), instrument] as const)).values()];
  }, [entries, playbook.instrumentMarkets, playbook.markets, query, selected]);
  const toggleInline = (instrument: typeof inlineCandidates[number]) => {
    const symbol = canonicalInstrument(instrument.symbol);
    const symbols = selected.includes(symbol) ? selected.filter(item => item !== symbol) : [...selected, symbol];
    const assignments = { ...playbook.instrumentMarkets };
    if (symbols.includes(symbol) && !knownInstrument(symbol)) assignments[symbol] = instrument.market;
    else if (!symbols.includes(symbol)) delete assignments[symbol];
    onSave({
      ...playbookInstrumentSelection(playbook, symbols, assignments),
      instrumentPatterns: playbook.instrumentPatterns,
      instrumentPatternId: playbook.instrumentPatternId,
      instrumentTimeframe: playbook.instrumentTimeframe,
    });
  };
  return <section aria-label="Playbook instruments" className="rounded-xl border border-slate-200 px-3 py-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Instruments<JournalHelp label="Playbook instruments" text="Browse Forex, Indices, Commodity, Crypto and Stocks. Saving an instrument adds its market type to the playbook. AI suggestions compare generated sample candles with a preset or your named setup rules. Review the fit, source, date and reasons before adding a candidate. Selections and patterns stay local and apply only when saved." /></h4>
      <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setMode('suggestions')} className={`${secondary} !border-[#E2DCFF] !bg-[#FAF8FF] !text-[#5338ec]`}><Sparkles size={13} />AI suggestions</button>{!inlineSelect && <button type="button" onClick={() => setMode('browse')} className={secondary}><PencilLine size={13} />Edit instruments</button>}</div>
    </div>
    {inlineSelect && <div className="mt-3">
      <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 focus-within:border-[#5338ec] focus-within:ring-2 focus-within:ring-[#5338ec]/15">
        <Search size={14} className="shrink-0 text-slate-400" />
        <input aria-label="Search instruments" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search instruments" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
      </label>
      <div role="group" aria-label="Choose instruments" className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
        {inlineCandidates.map(instrument => <button key={instrument.symbol} type="button" aria-pressed={selected.includes(canonicalInstrument(instrument.symbol))} onClick={() => toggleInline(instrument)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${selected.includes(canonicalInstrument(instrument.symbol)) ? 'border-[#5338ec] bg-[#F0EDFF] text-[#5338ec]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{instrument.symbol}</button>)}
        {!inlineCandidates.length && <p className="text-xs text-slate-500">{playbook.markets.length ? 'No matching instruments in the selected markets.' : 'Choose a strategy market to see instruments.'}</p>}
      </div>
      <p className="mt-2 text-[10px] text-slate-500" aria-live="polite">Selected: {selected.length ? selected.join(', ') : 'None'}</p>
    </div>}
    {!inlineSelect && <div className="mt-3 flex flex-wrap gap-2">{(playbook.symbols || []).map(symbol => {
      const count = entries.filter(e => e.strategy === playbook.name && canonicalInstrument(e.symbol) === canonicalInstrument(symbol)).length;
      return <span key={symbol} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">{symbol}<span className="text-[10px] font-normal text-slate-400" title="Linked journal trades in the current scope">{count}</span></span>;
    })}{!playbook.symbols?.length && <p className="text-xs text-slate-500">Choose the instruments you want to track for this setup.</p>}</div>
    }
    {mode && <InstrumentEditor key={`${playbook.id}-${mode}`} playbook={playbook} entries={entries} initialMode={mode} onClose={() => setMode(null)} onSave={selection => { onSave(selection); setMode(null); }} />}
  </section>;
};

const InstrumentEditor: React.FC<{
  playbook: JournalPlaybook; entries: JournalEntry[]; initialMode: 'browse' | 'suggestions'; onClose: () => void; onSave: (selection: Selection) => void;
}> = ({ playbook, entries, initialMode, onClose, onSave }) => {
  const dialog = useDialogFocus(onClose);
  const mode = initialMode;
  const isSuggestions = mode === 'suggestions';
  const savedSymbols = useMemo(() => new Set((playbook.symbols || []).map(canonicalInstrument)), [playbook.symbols]);
  const [market, setMarket] = useState<PortfolioAssetClass>(playbook.markets[0] || 'Forex');
  const [selected, setSelected] = useState(() => [...new Set((playbook.symbols || []).map(canonicalInstrument))]);
  const [assignments, setAssignments] = useState<Record<string, PortfolioAssetClass>>(() => Object.fromEntries((playbook.symbols || []).flatMap(s => {
    const market = instrumentMarket(s, playbook);
    return market ? [[canonicalInstrument(s), market]] : [];
  })));
  const [query, setQuery] = useState('');
  const [patterns, setPatterns] = useState<InstrumentPatternSetup[]>(() => playbook.instrumentPatterns || []);
  const playbookSetup = useMemo(() => playbookConditionPattern(playbook), [playbook]);
  const conditionError = playbook.technicalEntryConditions ? validatePlaybookConditions(playbook.technicalEntryConditions) : null;
  const [patternId, setPatternId] = useState(() => playbook.instrumentPatternId && (Object.hasOwn(PATTERN_LABELS, playbook.instrumentPatternId) || playbook.instrumentPatterns?.some(p => p.id === playbook.instrumentPatternId) || (playbook.instrumentPatternId === PLAYBOOK_CONDITIONS_PATTERN && playbookSetup)) ? playbook.instrumentPatternId : playbookSetup ? PLAYBOOK_CONDITIONS_PATTERN : playbookPattern(playbook));
  const activePattern = patternId === PLAYBOOK_CONDITIONS_PATTERN ? playbookSetup : patterns.find(p => p.id === patternId);
  const pattern = activePattern?.pattern || patternId as InstrumentPattern;
  const [patternForm, setPatternForm] = useState<InstrumentPatternSetup | null>(null);
  const patternSelect = useRef<HTMLSelectElement>(null);
  const finishPatternEdit = () => {
    setPatternForm(null);
    requestAnimationFrame(() => patternSelect.current?.focus());
  };
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1D'>(playbook.instrumentTimeframe || '4h');
  const [suggestions, setSuggestions] = useState<InstrumentSuggestion[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [scanError, setScanError] = useState('');
  const scan = useRef(0);
  useEffect(() => { scan.current++; setSuggestions(null); setBusy(false); setScanError(''); return () => { scan.current++; }; }, [market, patternId, patterns, timeframe]);
  const candidates = useMemo(() => {
    const catalog = [...PLAYBOOK_INSTRUMENTS, ...entries.filter(e => !knownInstrument(e.symbol)).map(e => ({ symbol: canonicalInstrument(e.symbol), name: 'From your journal', market: e.assetClass })), ...selected.filter(s => !knownInstrument(s) && assignments[s]).map(s => ({ symbol:s, name:'Custom instrument', market:assignments[s] }))];
    return [...new Map(catalog.filter(i => i.market === market && `${i.symbol} ${i.name}`.toLowerCase().includes(query.trim().toLowerCase())).map(i => [i.symbol, i])).values()];
  }, [market, query, entries, selected, assignments]);
  const toggle = (symbol: string, chosenMarket: PortfolioAssetClass) => {
    if (isSuggestions && savedSymbols.has(symbol)) return;
    setSelected(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]);
    setAssignments(prev => ({ ...prev, [symbol]: chosenMarket }));
  };
  const runScan = async () => {
    const token = ++scan.current;
    setBusy(true); setScanError('');
    try {
      // Yield a frame before generating the existing local sample feed.
      await new Promise<void>(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
      const result = await suggestPlaybookInstruments(playbook, entries, { market, pattern, setup: activePattern, timeframe, asOf: new Date().toISOString().slice(0,10) });
      if (token === scan.current) setSuggestions(result);
    } catch { if (token === scan.current) setScanError('The sample scan could not finish. Try again, or close this window and use Edit instruments.'); }
    finally { if (token === scan.current) setBusy(false); }
  };
  const confirm = () => {
    if (patternForm) return;
    onSave({ ...playbookInstrumentSelection(playbook, selected, assignments), instrumentPatterns: patterns, instrumentPatternId: patternId, instrumentTimeframe: timeframe });
  };
  const addedMarkets = INSTRUMENT_MARKETS.filter(m => !playbook.markets.includes(m) && selected.some(s => (knownInstrument(s)?.market || assignments[s]) === m));
  const additions = selected.filter(symbol => !savedSymbols.has(symbol));
  const visibleSelection = isSuggestions ? additions : selected;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/35 p-3 sm:p-6" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="instrument-editor-title" tabIndex={-1} className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#0b1c30] shadow-2xl outline-none">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-5"><div><h2 id="instrument-editor-title" className="text-lg font-bold">{isSuggestions ? 'AI instrument suggestions' : 'Edit instruments'}</h2><p className="mt-1 text-xs text-slate-500">{playbook.name || 'New playbook'} · {isSuggestions ? 'find pattern matches and add instruments to your playbook.' : 'browse all five markets and manage your instruments.'}</p></div><button type="button" onClick={onClose} aria-label={isSuggestions ? 'Close AI suggestions' : 'Close instrument editor'} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <p className="mb-4 text-xs text-slate-500">{isSuggestions ? `${savedSymbols.size} already in playbook · ${additions.length} ready to add` : `${selected.length} selected · changes apply when you save`}</p>
        <div role="group" aria-label="Instrument market type" className="mb-4 flex flex-wrap gap-2">{INSTRUMENT_MARKETS.map(m => <button key={m} type="button" aria-pressed={market === m} onClick={() => { setMarket(m); setQuery(''); }} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${market === m ? 'border-[#CFC5FF] bg-[#F5F2FF] text-[#5338ec]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{m}</button>)}</div>

        {mode === 'browse' ? <section aria-label="Browse instruments">
          <label className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={14} className="text-slate-400" /><input aria-label="Search instruments" value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${market} instruments…`} className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
          <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{candidates.map(instrument => {
            const on = selected.includes(instrument.symbol);
            return <button key={instrument.symbol} type="button" aria-pressed={on} onClick={() => toggle(instrument.symbol, instrument.market)} className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left ${on ? 'border-[#CFC5FF] bg-[#FAF8FF]' : 'border-slate-200 hover:bg-slate-50'}`}><span><strong className="block text-xs">{instrument.symbol}</strong><span className="mt-0.5 block text-[11px] text-slate-500">{instrument.name}</span></span><span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? 'border-[#5338ec] bg-[#5338ec] text-white' : 'border-slate-300'}`}>{on && <Check size={13} />}</span></button>;
          })}{!candidates.length && <p className="col-span-full rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">No matching {market} instruments. Try another search or market.</p>}</div>
        </section> : <section aria-label="Pattern matching" className="space-y-4">
          {patternForm ? <InstrumentPatternForm key={patternForm.id || 'new'} initial={patternForm} patterns={patterns} onCancel={finishPatternEdit} onApply={setup => { setPatterns(current => [...current.filter(p => p.id !== setup.id), setup]); setPatternId(setup.id); finishPatternEdit(); }} /> : <>
          <div className="rounded-xl border border-[#DED5FF] bg-[#FAF8FF] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-[#5338ec]"><Sparkles size={14} />Pattern matching · generated sample data</div><p className="mt-2 text-xs leading-relaxed text-slate-600">Matches completed candles to a preset or your own technical rules, using the tools and parameters you choose. Scores describe pattern fit, not win probability. This local rules-based scan uses sample candles through {DATA_END}; it is not a live market scan.</p></div>
          {conditionError && <p role="alert" className="text-xs text-rose-700">Playbook entry conditions are incomplete: {conditionError} Fix them in Technical conditions to scan them. Other patterns remain available.</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label className="min-w-0 text-xs font-semibold">Setup pattern<select ref={patternSelect} aria-label="Setup pattern" disabled={!!patternForm} value={patternId} onChange={e => setPatternId(e.target.value)} className="mt-1.5 h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs disabled:opacity-50">{playbookSetup && <option value={PLAYBOOK_CONDITIONS_PATTERN}>Playbook entry conditions</option>}<optgroup label="Presets">{Object.entries(PATTERN_LABELS).filter(([id]) => id !== 'custom').map(([id,label]) => <option key={id} value={id}>{label}</option>)}</optgroup>{patterns.length > 0 && <optgroup label="Your setup patterns">{patterns.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>}</select></label><label className="text-xs font-semibold">Candle timeframe<select aria-label="Candle timeframe" value={timeframe} onChange={e => setTimeframe(e.target.value as typeof timeframe)} className="mt-1.5 block h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="1h">1 hour</option><option value="4h">4 hours</option><option value="1D">Daily</option></select></label></div>
          <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><button type="button" disabled={!!patternForm} onClick={() => setPatternForm(newInstrumentPattern(pattern))} className={secondary}><Plus size={13} />Set up pattern</button>{activePattern && patternId !== PLAYBOOK_CONDITIONS_PATTERN && <><button type="button" disabled={!!patternForm} onClick={() => setPatternForm({ ...activePattern })} className={secondary}><PencilLine size={13} />Edit pattern</button><button type="button" disabled={!!patternForm} onClick={() => { setPatterns(current => current.filter(p => p.id !== patternId)); setPatternId(pattern); patternSelect.current?.focus(); }} className="px-1 text-xs text-slate-500 hover:text-rose-600 disabled:opacity-40">Remove pattern</button></>}</div><button type="button" disabled={busy || !!patternForm} onClick={runScan} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#5338ec] px-4 text-xs font-semibold text-white disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{busy ? 'Scanning…' : suggestions ? 'Scan again' : 'Find pattern matches'}</button></div>
          {activePattern && !patternForm && <p className="rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">{activePattern.pattern === 'custom' ? `${activePattern.patternType} · ${activePattern.matchMode === 'any' ? 'Any' : 'All'} of ${activePattern.technicalRules?.length || 0} rules` : PATTERN_LABELS[activePattern.pattern]} · {activePattern.lookbackBars} candles · fit ≥ {activePattern.minFit}{activePattern.pattern !== 'custom' && <> · EMA direction: {activePattern.direction} · volume ≥ {activePattern.minVolumeRatio}×</>}{activePattern.pattern === 'breakout' ? ` · breakout ≥ ${activePattern.minBreakoutAtr} ATR` : ''}<br />{patternId === PLAYBOOK_CONDITIONS_PATTERN ? 'Uses the playbook’s long entry conditions. Edit them in Technical conditions; results may differ from backtests due to timeframe and limited sample history.' : activePattern.pattern === 'custom' ? 'Fit is the percentage of technical rules passed. Rules and parameters are editable in Edit pattern.' : 'Volume and breakout rules set to 0 are skipped.'}</p>}
          {scanError && <p role="alert" className="text-xs text-rose-700">{scanError}</p>}
          <div aria-live="polite">{suggestions === null ? <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">Choose a market and pattern, then scan its covered sample instruments.</p> : <>
            <p className="mb-3 text-[11px] text-slate-500">{suggestions.length} {activePattern ? 'matching' : 'covered'} {market} instruments · latest {activePattern?.lookbackBars || 120} completed {timeframe} candles.</p>
            <div className="space-y-3">{suggestions.map(suggestion => {
              const on = selected.includes(suggestion.symbol);
              const alreadyAdded = savedSymbols.has(suggestion.symbol);
              return <article key={suggestion.symbol} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{suggestion.symbol} <span className="ml-1 text-xs font-normal text-slate-500">{suggestion.name}</span></h3><p className="mt-1 text-[11px] text-slate-500">{suggestion.score >= 60 ? 'Sample pattern match' : 'Exploratory candidate'} · {activePattern?.patternType || PATTERN_LABELS[suggestion.pattern]}</p></div><span className="shrink-0 rounded-lg bg-[#F1EDFF] px-2.5 py-1.5 text-xs font-bold text-[#5338ec]">{suggestion.score}/100 fit</span></div><ul className="mt-3 space-y-1 text-xs leading-relaxed text-slate-600">{suggestion.reasons.map(reason => <li key={reason}>• {reason}</li>)}</ul><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] leading-relaxed text-slate-400">Sample source: {suggestion.sourceSymbol}{suggestion.sourceSymbol !== suggestion.symbol ? ' (futures proxy)' : ''} · through {new Date(suggestion.to).toISOString().replace('T',' ').slice(0,16)} UTC<br />{suggestion.journalCount} linked journal records · no historical profitability ranking</p><button type="button" disabled={alreadyAdded} aria-pressed={on} onClick={() => toggle(suggestion.symbol,suggestion.market)} className={secondary}>{on ? <Check size={13} /> : <Plus size={13} />}{alreadyAdded ? 'Already in playbook' : on ? 'Ready to add' : 'Add instrument'}</button></div></article>;
            })}{!suggestions.length && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">{activePattern ? 'No covered sample passes these rules with the required candle history. Adjust your pattern or try another market.' : 'No covered sample has enough completed candles for this market. Try another market.'}</p>}</div>
          </>}</div>
          </>}
        </section>}
        <section className="mt-5 border-t border-slate-100 pt-4" aria-label={isSuggestions ? 'Instruments to add' : 'Selected instruments'}><h3 className="text-xs font-semibold">{isSuggestions ? 'Ready to add' : 'Selected instruments'} · {visibleSelection.length}</h3><div className="mt-2 flex flex-wrap gap-2">{visibleSelection.map(symbol => <span key={symbol} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white py-1 pl-2.5 text-xs"><span>{symbol}<span className="ml-1 text-[10px] text-slate-400">{knownInstrument(symbol)?.market || assignments[symbol] || 'Unclassified'}</span></span><button type="button" aria-label={`${isSuggestions ? 'Undo addition of' : 'Remove'} ${symbol}`} onClick={() => setSelected(prev => prev.filter(s => s !== symbol))} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X size={12} /></button></span>)}{!visibleSelection.length && <p className="text-xs text-slate-400">{isSuggestions ? 'Find matches, then choose instruments to add. Manage existing instruments using Edit instruments.' : 'No instruments selected.'}</p>}</div></section>
        {!!addedMarkets.length && <p className="mt-3 text-[11px] text-slate-500">Saving also adds {addedMarkets.join(', ')} to this playbook’s market types.</p>}
      </div>
      <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-[11px] text-slate-500">{patternForm ? 'Apply or cancel the pattern before saving.' : isSuggestions ? 'Additions and setup patterns apply when you confirm.' : 'Instrument changes apply when you save.'}</span><div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={secondary}>Cancel</button><button type="button" disabled={!!patternForm} onClick={confirm} className="min-h-9 whitespace-nowrap rounded-lg bg-[#5338ec] px-4 text-xs font-semibold text-white disabled:opacity-40">{isSuggestions ? additions.length ? `Add ${additions.length} instrument${additions.length === 1 ? '' : 's'}` : 'Done' : 'Save instruments'}</button></div></footer>
    </div>
  </div>;
};
