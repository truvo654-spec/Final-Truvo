import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { canonicalInstrument, INSTRUMENT_MARKETS, PLAYBOOK_INSTRUMENTS } from './instrumentMatching';
import { defaultPlaybook, nextPlaybookId, PLAYBOOK_STARTERS, popularFromHistory } from './playbookDefaults';
import { useDialogFocus } from './useDialogFocus';

const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-2 focus:outline-[#5338ec] dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const chip = (active: boolean) => `rounded-lg border px-3 py-2 text-xs font-semibold ${active ? 'border-[#5338ec] text-[#5338ec]' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`;

export function QuickPlaybookCreate({ entries, playbooks, houseLimits, onClose, onCreate }: {
  entries: JournalEntry[];
  playbooks: JournalPlaybook[];
  houseLimits: { maxRisk: number; maxTrades: number };
  onClose: () => void;
  onCreate: (book: JournalPlaybook) => void;
}) {
  const dialog = useDialogFocus(onClose);
  const [name, setName] = useState('');
  const [markets, setMarkets] = useState<PortfolioAssetClass[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [custom, setCustom] = useState(false);
  const [style, setStyle] = useState('');
  const [thesis, setThesis] = useState('');
  const [rr, setRr] = useState('');
  const [session, setSession] = useState<'default' | 'overlap' | 'any'>('default');
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
    onCreate(book);
  };
  const visible = candidates.filter(item => `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 40);
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4">
    <div ref={dialog} role="dialog" aria-modal="true" aria-label="Create playbook" tabIndex={-1} className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 text-slate-900 shadow-xl dark:bg-slate-900 dark:text-white sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-2xl">
      <header className="flex items-center justify-between"><h2 className="text-lg font-bold">Create new playbook</h2><button type="button" onClick={onClose} aria-label="Close create playbook"><X size={20}/></button></header>
      <p className="mt-1 text-xs text-slate-500">Choose a template or start with your own idea. Review the defaults after creating.</p>
      <div className="mt-4 flex flex-wrap gap-2">{PLAYBOOK_STARTERS.map(starter => <button key={starter.name} type="button" className={chip(name === starter.name)} onClick={() => { setName(starter.name); setStyle(''); setThesis(''); setRr(''); chooseMarkets(starter.markets); }}>{starter.name}</button>)}</div>
      <label className="mt-4 block text-xs font-semibold">Strategy name<input list="quick-playbook-names" className={`${field} mt-1`} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Breakout"/></label>
      <datalist id="quick-playbook-names">{PLAYBOOK_STARTERS.map(starter => <option key={starter.name} value={starter.name}/>)}</datalist>
      <fieldset className="mt-4"><legend className="text-xs font-semibold">Market type</legend><div className="mt-2 flex flex-wrap gap-2">{INSTRUMENT_MARKETS.map(market => <button key={market} type="button" aria-pressed={markets.includes(market)} onClick={() => chooseMarkets(markets.includes(market) ? markets.filter(item => item !== market) : [...markets, market])} className={chip(markets.includes(market))}>{market === 'Commodity' ? 'Commodities' : market}</button>)}</div></fieldset>
      <label className="mt-4 block text-xs font-semibold">Instrument symbols<input className={`${field} mt-1`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search instruments" /></label>
      <p className="mt-2 text-xs text-slate-500">Popular and your most-traded instruments</p>
      <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">{visible.map(item => <button key={item.symbol} type="button" aria-pressed={symbols.includes(item.symbol)} onClick={() => setSymbols(previous => previous.includes(item.symbol) ? previous.filter(symbol => symbol !== item.symbol) : [...previous, item.symbol])} className={chip(symbols.includes(item.symbol))}>{item.symbol}</button>)}</div>
      <p className="mt-2 text-xs text-slate-500">Selected: {symbols.join(', ') || 'None'}</p>
      <button type="button" className="mt-4 text-xs font-semibold text-[#5338ec] underline" onClick={() => setCustom(!custom)} aria-expanded={custom}>Customize details</button>
      {custom && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs">Style<input className={`${field} mt-1`} value={style} onChange={event => setStyle(event.target.value)} placeholder="Inferred from strategy"/></label><label className="text-xs">Minimum R:R<input type="number" min="0.1" step="0.1" className={`${field} mt-1`} value={rr} onChange={event => setRr(event.target.value)} placeholder="Default 1:2"/></label><label className="text-xs">Session<select className={`${field} mt-1`} value={session} onChange={event => setSession(event.target.value as typeof session)}><option value="default">Use market default</option><option value="overlap">London / NY overlap (12:00–16:00 UTC)</option><option value="any">Any time</option></select></label><label className="text-xs sm:col-span-2">Thesis<textarea className={`${field} mt-1`} value={thesis} onChange={event => setThesis(event.target.value)} placeholder="Default from strategy"/></label></div>}
      {errors.length > 0 && <div role="alert" className="mt-3 text-xs text-rose-700">{errors.map(error => <p key={error}>{error}</p>)}</div>}
      <button type="button" onClick={create} className="mt-4 min-h-11 w-full rounded-xl bg-[#5338ec] px-4 font-semibold text-white hover:bg-[#4326d8]">Create playbook</button>
    </div>
  </div>;
}
