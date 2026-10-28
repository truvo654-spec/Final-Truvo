import React, { useMemo, useRef, useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { PlaybookTechnicalConditions } from '../../data/instrumentPatterns';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { canonicalInstrument, INSTRUMENT_MARKETS, PLAYBOOK_INSTRUMENTS } from './instrumentMatching';
import { defaultPlaybook, nextPlaybookId, PLAYBOOK_STARTERS, popularFromHistory } from './playbookDefaults';
import { useDialogFocus } from './useDialogFocus';
import { PlaybookTechnicalConditionsEditor, validatePlaybookConditions } from './PlaybookTechnicalConditions';

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-[#5338ec] dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const chip = (active: boolean) => `rounded-lg border px-3 py-2 text-xs font-semibold ${active ? 'border-[#5338ec] bg-[#f0edff] text-[#5338ec] dark:bg-violet-950 dark:text-violet-200' : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`;

export function QuickPlaybookCreate({ entries, playbooks, houseLimits, onClose, onCreate }: {
  entries: JournalEntry[];
  playbooks: JournalPlaybook[];
  houseLimits: { maxRisk: number; maxTrades: number };
  onClose: () => void;
  onCreate: (book: JournalPlaybook) => void;
}) {
  const dialog = useDialogFocus(onClose);
  const nameInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [markets, setMarkets] = useState<PortfolioAssetClass[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState(false);
  const [style, setStyle] = useState('');
  const [thesis, setThesis] = useState('');
  const [rr, setRr] = useState('');
  const [session, setSession] = useState<'default' | 'overlap' | 'any'>('default');
  const [technicalConditions, setTechnicalConditions] = useState<PlaybookTechnicalConditions>();
  const [errors, setErrors] = useState<string[]>([]);
  const candidates = useMemo(() => {
    const history = entries.filter(entry => markets.includes(entry.assetClass) && entry.symbol.trim()).map(entry => ({ symbol: canonicalInstrument(entry.symbol), name: 'From your journal', market: entry.assetClass }));
    return [...new Map([...history, ...PLAYBOOK_INSTRUMENTS].filter(item => markets.includes(item.market)).map(item => [item.symbol, item])).values()];
  }, [entries, markets]);
  const chooseMarkets = (next: PortfolioAssetClass[]) => {
    setMarkets(next);
    const available = new Set([...PLAYBOOK_INSTRUMENTS, ...entries.map(entry => ({ symbol: canonicalInstrument(entry.symbol), market: entry.assetClass }))].filter(item => next.includes(item.market)).map(item => item.symbol));
    setSymbols(previous => [...new Set([...previous.filter(symbol => available.has(symbol)), ...popularFromHistory(entries, next).slice(0, 3)])]);
  };
  const create = () => {
    const issues: string[] = [];
    if (!name.trim()) issues.push('Enter a strategy name.');
    if (playbooks.some(book => book.name.trim().toLowerCase() === name.trim().toLowerCase())) issues.push('A playbook with this name already exists.');
    if (!markets.length) issues.push('Choose at least one market.');
    if (!symbols.length) issues.push('Choose at least one instrument.');
    if (rr && (!Number.isFinite(Number(rr)) || Number(rr) <= 0)) issues.push('Minimum reward:risk must be greater than zero.');
    const conditionError = validatePlaybookConditions(technicalConditions);
    if (conditionError) { issues.push(conditionError); setCustom(true); }
    setErrors(issues);
    if (issues.length) return;
    const book = defaultPlaybook(name, markets, symbols, houseLimits, nextPlaybookId(playbooks), new Date());
    book.instrumentMarkets = Object.fromEntries(symbols.flatMap(symbol => {
      const market = candidates.find(item => item.symbol === symbol)?.market;
      return market ? [[symbol, market]] : [];
    }));
    if (style.trim()) book.style = style.trim();
    if (thesis.trim()) book.thesis = thesis.trim();
    if (rr) book.benchmarkRR = Number(rr);
    if (session === 'any') book.window = null;
    if (session === 'overlap') book.window = { start: 12, end: 16, label: 'London / NY overlap' };
    if (technicalConditions) book.technicalConditions = technicalConditions;
    onCreate(book);
  };
  const visible = candidates.filter(item => `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 40);
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/35 sm:items-center sm:p-6">
    <div ref={dialog} role="dialog" aria-modal="true" aria-label="Create playbook" tabIndex={-1} className="flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:max-h-[92dvh] sm:max-w-6xl sm:rounded-2xl">
      <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-7">
        <div><p className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#5338ec] dark:text-violet-300"><Sparkles size={16} aria-hidden="true"/> QUICK SETUP</p><h2 className="text-xl font-bold">Set up a strategy</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Choose a starter or create your own. Only three details are needed.</p></div>
        <button type="button" onClick={onClose} aria-label="Close create playbook" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><X size={20}/></button>
      </header>
      <form noValidate className="flex min-h-0 flex-1 flex-col" onSubmit={event => { event.preventDefault(); create(); }}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid min-h-full grid-cols-1 md:grid-cols-[205px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 md:border-b-0 md:border-r">
              <fieldset><legend className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Market type</legend><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose one or more.</p><div className="mt-3 flex flex-wrap gap-1.5 md:flex-col">{INSTRUMENT_MARKETS.map(market => <button key={market} type="button" aria-pressed={markets.includes(market)} onClick={() => chooseMarkets(markets.includes(market) ? markets.filter(item => item !== market) : [...markets, market])} className={`${chip(markets.includes(market))} text-left`}>{market === 'Commodity' ? 'Commodities' : market}</button>)}</div></fieldset>
              <button type="button" data-keep-button-icons onClick={() => nameInput.current?.focus()} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:border-[#5338ec] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#5338ec] text-white"><Plus size={16} aria-hidden="true"/></span>Create your own</button>
            </aside>
            <div className="min-w-0 space-y-5 p-4 sm:p-5">
              <section aria-label="Strategy starters">
                <h3 className="text-sm font-bold">Choose a starting point <span className="font-normal text-slate-500 dark:text-slate-400">· optional</span></h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A starter suggests markets and rules. You can change them.</p>
                <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">{PLAYBOOK_STARTERS.map(starter => <button key={starter.name} type="button" aria-pressed={name === starter.name} onClick={() => { setName(starter.name); setStyle(''); setThesis(''); setRr(''); chooseMarkets(starter.markets); }} className={`min-w-0 rounded-xl border p-3 text-left shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5338ec] ${name === starter.name ? 'border-[#5338ec] bg-[#f7f5ff] dark:bg-violet-950' : 'border-slate-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-500'}`}><span className="flex flex-wrap items-center justify-between gap-1"><strong className="text-xs text-slate-900 dark:text-white">{starter.name}</strong><span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-[#5338ec] dark:bg-violet-900 dark:text-violet-200">{starter.style}</span></span><span className="mt-2 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{starter.thesis}</span></button>)}</div>
              </section>
              <section className="space-y-4 border-t border-slate-200 pt-4 dark:border-slate-700" aria-label="Quick strategy details">
                <label className="block text-xs font-semibold">Strategy name<input ref={nameInput} list="quick-playbook-names" className={`${field} mt-1`} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Breakout"/></label>
                <datalist id="quick-playbook-names">{PLAYBOOK_STARTERS.map(starter => <option key={starter.name} value={starter.name}/>)}</datalist>
                <div><label className="block text-xs font-semibold">Instrument symbols<input className={`${field} mt-1`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search instruments" /></label>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{markets.length ? 'Popular and your most-traded instruments' : 'Choose a market to see instruments.'}</p>
                  <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">{visible.map(item => <button key={item.symbol} type="button" aria-pressed={symbols.includes(item.symbol)} onClick={() => setSymbols(previous => previous.includes(item.symbol) ? previous.filter(symbol => symbol !== item.symbol) : [...previous, item.symbol])} className={chip(symbols.includes(item.symbol))}>{item.symbol}</button>)}</div>
                  {markets.length > 0 && visible.length === 0 && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No instruments match this search.</p>}
                  <p className="mt-2 break-words text-xs text-slate-500 dark:text-slate-400">Selected: {symbols.join(', ') || 'None'}</p>
                </div>
                <div><button type="button" className="text-xs font-semibold text-[#5338ec] underline dark:text-violet-300" onClick={() => setCustom(!custom)} aria-expanded={custom}>Customize details</button>
                  {custom && <div className="mt-3 space-y-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs">Style<input className={`${field} mt-1`} value={style} onChange={event => setStyle(event.target.value)} placeholder="Inferred from strategy"/></label><label className="text-xs">Minimum R:R<input type="number" min="0.1" step="0.1" className={`${field} mt-1`} value={rr} onChange={event => setRr(event.target.value)} placeholder="Default 1:2"/></label><label className="text-xs">Session<select className={`${field} mt-1`} value={session} onChange={event => setSession(event.target.value as typeof session)}><option value="default">Use market default</option><option value="overlap">London / NY overlap (12:00–16:00 UTC)</option><option value="any">Any time</option></select></label><label className="text-xs sm:col-span-2">Thesis<textarea className={`${field} mt-1`} value={thesis} onChange={event => setThesis(event.target.value)} placeholder="Default from strategy"/></label></div><PlaybookTechnicalConditionsEditor value={technicalConditions} onChange={setTechnicalConditions}/></div>}
                </div>
              </section>
            </div>
          </div>
        </div>
        <footer className="border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-7">
          {errors.length > 0 && <div role="alert" className="mb-2 text-xs text-rose-700 dark:text-rose-300">{errors.map(error => <p key={error}>{error}</p>)}</div>}
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500 dark:text-slate-400">Rules and House limits are added automatically. Review them anytime.</p><button type="submit" className="min-h-11 w-full rounded-xl bg-[#5338ec] px-5 text-sm font-semibold text-white hover:bg-[#4326d8] sm:w-auto">Create playbook</button></div>
        </footer>
      </form>
    </div>
  </div>;
}
