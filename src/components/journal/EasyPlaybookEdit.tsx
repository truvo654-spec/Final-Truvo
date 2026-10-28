import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { JournalPlaybook, PlaybookStatus } from '../../data/journalPlaybooks';
import { PLAYBOOK_STATUS_LABELS } from '../../data/journalPlaybooks';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { canonicalInstrument, INSTRUMENT_MARKETS, instrumentMarket, knownInstrument, PLAYBOOK_INSTRUMENTS } from './instrumentMatching';
import { useDialogFocus } from './useDialogFocus';
import { copyPlaybookConditions, PlaybookTechnicalConditionsEditor, validatePlaybookConditions } from './PlaybookTechnicalConditions';

type Rule = JournalPlaybook['rules'][number];
export type EasySetupDraft = {
  name: string; style: string; status: PlaybookStatus; markets: PortfolioAssetClass[];
  symbols: string[]; instrumentMarkets: JournalPlaybook['instrumentMarkets'];
  thesis: string; rr: string; window: JournalPlaybook['window']; rules: Rule[];
  technicalConditions: JournalPlaybook['technicalConditions'];
};

export function easySetupDraft(book: JournalPlaybook): EasySetupDraft {
  return {
    name: book.name, style: book.style, status: book.status, markets: [...book.markets],
    symbols: [...(book.symbols || [])], instrumentMarkets: book.instrumentMarkets && { ...book.instrumentMarkets },
    thesis: book.thesis, rr: String(book.benchmarkRR), window: book.window && { ...book.window },
    rules: book.rules.map(rule => ({ ...rule })), technicalConditions: copyPlaybookConditions(book.technicalConditions),
  };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export function easySetupChanges(book: JournalPlaybook, draft: EasySetupDraft): Partial<JournalPlaybook> {
  const patch: Partial<JournalPlaybook> = {};
  const name = draft.name === book.name ? book.name : draft.name.trim();
  if (name !== book.name) patch.name = name;
  if (draft.style !== book.style) patch.style = draft.style;
  if (draft.status !== book.status) patch.status = draft.status;
  if (!same(draft.markets, book.markets)) patch.markets = draft.markets;
  if (!same(draft.symbols, book.symbols || [])) patch.symbols = draft.symbols;
  const instrumentMarkets = !book.instrumentMarkets && draft.instrumentMarkets && !Object.keys(draft.instrumentMarkets).length
    ? undefined : draft.instrumentMarkets;
  if (!same(instrumentMarkets, book.instrumentMarkets)) patch.instrumentMarkets = instrumentMarkets;
  if (draft.thesis !== book.thesis) patch.thesis = draft.thesis;
  if (Number(draft.rr) !== book.benchmarkRR) patch.benchmarkRR = Number(draft.rr);
  if (!same(draft.window, book.window)) patch.window = draft.window;
  if (!same(draft.rules, book.rules)) patch.rules = draft.rules;
  if (!same(draft.technicalConditions, book.technicalConditions)) patch.technicalConditions = draft.technicalConditions;
  return patch;
}

export function easySetupErrors(book: JournalPlaybook, draft: EasySetupDraft, entries: JournalEntry[], playbooks: JournalPlaybook[]): string[] {
  const issues: string[] = [], name = draft.name.trim();
  if (!name) issues.push('Enter a strategy name.');
  if (entries.some(entry => entry.strategy === book.name) && draft.name !== book.name) issues.push('The name cannot change while journal trades use this playbook.');
  if (name !== book.name && playbooks.some(other => other.id !== book.id && other.name.trim().toLowerCase() === name.toLowerCase())) issues.push('A playbook with this name already exists.');
  if (draft.rr !== String(book.benchmarkRR) && (!draft.rr.trim() || !Number.isFinite(Number(draft.rr)) || Number(draft.rr) <= 0)) issues.push('Minimum reward:risk must be greater than zero.');
  if (!same(draft.rules, book.rules) && draft.rules.some(rule => !rule.title.trim())) issues.push('Enter a title for each rule or remove the empty rule.');
  if (!same(draft.technicalConditions, book.technicalConditions)) {
    const conditionError = validatePlaybookConditions(draft.technicalConditions);
    if (conditionError) issues.push(conditionError);
  }
  if (!same(draft.window, book.window) && draft.window && (draft.window.start >= draft.window.end || !draft.window.label.trim())) issues.push('Give the session a label and an end time after its start.');
  const marketsChanged = !same(draft.markets, book.markets);
  if (marketsChanged || !same(draft.symbols, book.symbols || []) || !same(draft.instrumentMarkets, book.instrumentMarkets)) {
    for (const symbol of draft.symbols) {
      const market = knownInstrument(symbol)?.market || draft.instrumentMarkets?.[canonicalInstrument(symbol)] || instrumentMarket(symbol, book);
      if (market && !draft.markets.includes(market)) {
        issues.push(`${symbol} belongs to a market that is not selected. Remove the instrument or select its market.`);
        break;
      }
      if (!market && marketsChanged) {
        issues.push(`The market for ${symbol} is unknown. Keep the existing markets or remove this instrument before changing markets.`);
        break;
      }
    }
  }
  return issues;
}

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-[#5338ec] disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800';
const chip = (active: boolean) => `rounded-lg border px-3 py-2 text-xs font-semibold ${active ? 'border-[#5338ec] bg-[#f0edff] text-[#5338ec] dark:bg-violet-950 dark:text-violet-200' : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`;

export function EasyPlaybookEdit({ book, entries, playbooks, onClose, onSave }: {
  book: JournalPlaybook; entries: JournalEntry[]; playbooks: JournalPlaybook[];
  onClose: () => void; onSave: (patch: Partial<JournalPlaybook>) => void;
}) {
  const dialog = useDialogFocus(onClose);
  const [draft, setDraft] = useState(() => easySetupDraft(book));
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const linked = entries.filter(entry => entry.strategy === book.name).length;
  const candidates = useMemo(() => {
    const history = entries.filter(entry => entry.symbol.trim()).map(entry => ({
      symbol: canonicalInstrument(entry.symbol), name: 'From your journal', market: knownInstrument(entry.symbol)?.market || entry.assetClass,
    }));
    return [...new Map([...history, ...PLAYBOOK_INSTRUMENTS].filter(item => draft.markets.includes(item.market)).map(item => [item.symbol, item])).values()]
      .filter(item => `${item.symbol} ${item.name}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 40);
  }, [entries, draft.markets, query]);
  const selected = (symbol: string) => draft.symbols.some(item => canonicalInstrument(item) === canonicalInstrument(symbol));
  const removeSymbol = (symbol: string) => setDraft(previous => {
    const key = canonicalInstrument(symbol);
    const instrumentMarkets = previous.instrumentMarkets && Object.fromEntries(Object.entries(previous.instrumentMarkets).filter(([item]) => canonicalInstrument(item) !== key));
    return { ...previous, symbols: previous.symbols.filter(item => canonicalInstrument(item) !== key), instrumentMarkets };
  });
  const addSymbol = (symbol: string, market: PortfolioAssetClass) => setDraft(previous => previous.symbols.some(item => canonicalInstrument(item) === canonicalInstrument(symbol)) ? previous : ({
    ...previous, symbols: [...previous.symbols, symbol],
    instrumentMarkets: { ...previous.instrumentMarkets, [canonicalInstrument(symbol)]: market },
  }));
  const restoreSymbol = (symbol: string) => setDraft(previous => {
    const assignments = Object.entries(book.instrumentMarkets || {}).filter(([item]) => canonicalInstrument(item) === canonicalInstrument(symbol));
    return {
      ...previous, symbols: [...previous.symbols, symbol],
      instrumentMarkets: assignments.length ? { ...previous.instrumentMarkets, ...Object.fromEntries(assignments) } : previous.instrumentMarkets,
    };
  });
  const updateRule = (index: number, patch: Partial<Rule>) => setDraft(previous => ({
    ...previous, rules: previous.rules.map((rule, i) => i === index ? { ...rule, ...patch } : rule),
  }));
  const addRule = () => setDraft(previous => {
    let number = 1;
    while (previous.rules.some(rule => rule.id === `r${number}`) || book.rules.some(rule => rule.id === `r${number}`) || book.ruleHistory?.some(version => version.rules.some(rule => rule.id === `r${number}`))) number++;
    return { ...previous, rules: [...previous.rules, { id: `r${number}`, title: '', detail: '' }] };
  });
  const save = () => {
    const issues = easySetupErrors(book, draft, entries, playbooks);
    setErrors(issues);
    if (!issues.length) onSave(easySetupChanges(book, draft));
  };
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/35 sm:items-center sm:p-6">
    <div ref={dialog} role="dialog" aria-modal="true" aria-label="Edit playbook setup" tabIndex={-1} className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <div><h2 className="text-xl font-bold">Edit setup</h2><p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{book.name} · Changes apply only when saved.</p></div>
        <button type="button" aria-label="Close edit setup" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><X size={20}/></button>
      </header>
      <form noValidate className="flex min-h-0 flex-1 flex-col" onSubmit={event => { event.preventDefault(); save(); }}>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold">Strategy name<input className={`${field} mt-1`} value={draft.name} disabled={linked > 0} onChange={event => setDraft({ ...draft, name: event.target.value })}/>{linked > 0 && <span className="mt-1 block font-normal text-slate-500 dark:text-slate-400">Name locked: {linked} journal trade{linked === 1 ? '' : 's'} use this playbook.</span>}</label>
            <label className="block text-xs font-semibold">Style<input className={`${field} mt-1`} value={draft.style} onChange={event => setDraft({ ...draft, style: event.target.value })}/></label>
            <label className="block text-xs font-semibold">Status<select className={`${field} mt-1`} value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as PlaybookStatus })}>{(['active', 'draft', 'testing', 'archived'] as const).map(status => <option key={status} value={status}>{PLAYBOOK_STATUS_LABELS[status]}</option>)}</select></label>
            <label className="block text-xs font-semibold">Minimum reward:risk (1:x)<input type="number" step="any" className={`${field} mt-1`} value={draft.rr} onChange={event => setDraft({ ...draft, rr: event.target.value })}/></label>
          </div>
          <fieldset><legend className="text-xs font-bold">Markets</legend><div className="mt-2 flex flex-wrap gap-2">{INSTRUMENT_MARKETS.map(market => <button key={market} type="button" aria-pressed={draft.markets.includes(market)} onClick={() => setDraft(previous => ({ ...previous, markets: previous.markets.includes(market) ? previous.markets.filter(item => item !== market) : [...previous.markets, market] }))} className={chip(draft.markets.includes(market))}>{market === 'Commodity' ? 'Commodities' : market}</button>)}</div></fieldset>
          <section aria-label="Edit instruments" className="space-y-2">
            <h3 className="text-xs font-bold">Instruments</h3>
            <div className="flex flex-wrap gap-2">{draft.symbols.map(symbol => <button key={symbol} type="button" aria-label={`Remove ${symbol}`} onClick={() => removeSymbol(symbol)} className="rounded-lg border border-violet-200 px-2 py-1.5 text-xs font-semibold text-[#5338ec] dark:border-violet-800 dark:text-violet-200">{symbol} ×</button>)}{!draft.symbols.length && <span className="text-xs text-slate-500 dark:text-slate-400">No instruments selected.</span>}</div>
            {(book.symbols || []).some(symbol => !selected(symbol)) && <div className="flex flex-wrap gap-2">{(book.symbols || []).filter(symbol => !selected(symbol)).map(symbol => <button key={symbol} type="button" onClick={() => restoreSymbol(symbol)} className="rounded-lg border border-dashed border-slate-300 px-2 py-1.5 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300">Restore {symbol}</button>)}</div>}
            <label className="block text-xs font-semibold">Search instruments<input className={`${field} mt-1`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search selected markets"/></label>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">{candidates.map(item => <button key={item.symbol} type="button" aria-pressed={selected(item.symbol)} onClick={() => selected(item.symbol) ? removeSymbol(item.symbol) : addSymbol(item.symbol, item.market)} className={chip(selected(item.symbol))}>{item.symbol}</button>)}</div>
            {!candidates.length && <p className="text-xs text-slate-500 dark:text-slate-400">{draft.markets.length ? 'No matching instruments.' : 'Select a market to browse instruments.'}</p>}
          </section>
          <label className="block text-xs font-semibold">Thesis<textarea className={`${field} mt-1`} rows={3} value={draft.thesis} onChange={event => setDraft({ ...draft, thesis: event.target.value })}/></label>
          <PlaybookTechnicalConditionsEditor value={draft.technicalConditions} onChange={technicalConditions => setDraft(previous => ({ ...previous, technicalConditions }))}/>
          <section aria-label="Edit rules" className="space-y-3"><h3 className="text-xs font-bold">Rules</h3>{draft.rules.map((rule, index) => <div key={rule.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">Rule {index + 1}</span><button type="button" onClick={() => setDraft(previous => ({ ...previous, rules: previous.rules.filter((_, i) => i !== index) }))} className="text-xs font-semibold text-rose-700 dark:text-rose-300">Remove</button></div><label className="mt-2 block text-xs">Rule title<input className={`${field} mt-1`} value={rule.title} onChange={event => updateRule(index, { title: event.target.value })}/></label><label className="mt-2 block text-xs">Details<input className={`${field} mt-1`} value={rule.detail} onChange={event => updateRule(index, { detail: event.target.value })}/></label></div>)}<button type="button" onClick={addRule} className="text-xs font-semibold text-[#5338ec] underline dark:text-violet-300">Add rule</button></section>
          <section aria-label="Session window"><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={!!draft.window} onChange={event => setDraft({ ...draft, window: event.target.checked ? { start: 7, end: 12, label: 'London' } : null })}/>Use a session window</label>{draft.window && <div className="mt-3 grid gap-2 sm:grid-cols-3"><label className="text-xs">From (UTC)<select className={`${field} mt-1`} value={draft.window.start} onChange={event => setDraft(previous => ({ ...previous, window: previous.window && { ...previous.window, start: Number(event.target.value) } }))}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}</select></label><label className="text-xs">To (UTC)<select className={`${field} mt-1`} value={draft.window.end} onChange={event => setDraft(previous => ({ ...previous, window: previous.window && { ...previous.window, end: Number(event.target.value) } }))}>{Array.from({ length: 24 }, (_, hour) => <option key={hour + 1} value={hour + 1}>{String(hour + 1).padStart(2, '0')}:00</option>)}</select></label><label className="text-xs">Session label<input className={`${field} mt-1`} value={draft.window.label} onChange={event => setDraft(previous => ({ ...previous, window: previous.window && { ...previous.window, label: event.target.value } }))}/></label></div>}</section>
        </div>
        <footer className="border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          {errors.length > 0 && <div role="alert" className="mb-2 text-xs text-rose-700 dark:text-rose-300">{errors.map(error => <p key={error}>{error}</p>)}</div>}
          <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-slate-700">Cancel</button><button type="submit" className="min-h-11 rounded-xl bg-[#5338ec] px-5 text-sm font-semibold text-white hover:bg-[#4326d8]">Save changes</button></div>
        </footer>
      </form>
    </div>
  </div>;
}
