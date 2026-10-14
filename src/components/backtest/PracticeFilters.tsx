// Practice (replay) filters: market type and instrument as separate filters, journal-only filters
// (result, playbook, mistake), and named custom filters the user can save and reuse.
import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { JournalEntry } from '../../types';
import { eligible, resultOf } from '../journal/journalMath';
import { DATA_END, DATA_START } from '../../backtest/config';
import { SYMBOLS, resolveSymbol } from '../../backtest/marketData';
import type { SymbolSpec } from '../../backtest/types';
import { loadPracticeFilters, PracticeFilter, PracticeMarket, savePracticeFilters, SavedPracticeFilter } from '../../backtest/store';
import { Field, Segmented, btnLink, btnSecondary, inputBase, inputCls } from './ui';

export const PRACTICE_MARKETS: PracticeMarket[] = ['Forex', 'Indices', 'Commodities', 'Crypto', 'Stocks'];
export const DEFAULT_FILTER: PracticeFilter = { markets: [], symbols: [], result: 'losses', playbook: '', mistake: '', from: '', to: '' };

export const feedMarket = (s: SymbolSpec): PracticeMarket =>
  s.assetClass === 'Futures' ? (s.symbol === 'MGC' ? 'Commodities' : 'Indices') : s.assetClass === 'Forex' ? 'Forex' : s.assetClass === 'Crypto' ? 'Crypto' : 'Stocks';
export const journalMarket = (e: JournalEntry): PracticeMarket => (e.assetClass === 'Commodity' ? 'Commodities' : (e.assetClass as PracticeMarket));

/** Instruments from the demo feed that match the filter (journal names such as NAS100 also select MNQ). */
export const practiceInstruments = (f: PracticeFilter): SymbolSpec[] =>
  SYMBOLS.filter((s) => (!f.markets.length || f.markets.includes(feedMarket(s)))
    && (!f.symbols.length || f.symbols.includes(s.symbol) || s.aliases.some((a) => f.symbols.includes(a))));

export const matchesJournal = (e: JournalEntry, f: PracticeFilter): boolean =>
  (!f.markets.length || f.markets.includes(journalMarket(e)))
  && (!f.symbols.length || f.symbols.includes(e.symbol) || f.symbols.includes(resolveSymbol(e.symbol) ?? ''))
  && (!f.from || e.date >= f.from)
  && (!f.to || e.date <= f.to)
  && eligible(e) && (f.result === 'all' || (f.result === 'losses' ? resultOf(e)==='loss' : resultOf(e)==='win'))
  && (!f.playbook || e.strategy === f.playbook)
  && (!f.mistake || e.mistakes.includes(f.mistake) || e.tags.includes(f.mistake));

export const practiceDateRangeError = (source: Props['source'], filter: PracticeFilter): string | null => {
  const from = filter.from ?? '';
  const to = filter.to ?? '';
  if (from && to && from > to) return 'Start date must be on or before end date.';
  if (source !== 'journal' && from && (from < DATA_START || from > DATA_END)) return `Choose a start date from ${DATA_START} to ${DATA_END}.`;
  if (source !== 'journal' && to && (to < DATA_START || to > DATA_END)) return `Choose an end date from ${DATA_START} to ${DATA_END}.`;
  return null;
};

const sameSymbol=(a:string,b:string)=>(resolveSymbol(a)||a)===(resolveSymbol(b)||b);
const chip = (on: boolean) => `h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-colors ${on ? 'bg-[#EEF0FE] border-[#5338ec]/40 text-[#5338ec]' : 'bg-white border-slate-200 text-[#474556] hover:bg-slate-50'}`;

interface Props {
  source: 'random' | 'similar' | 'journal';
  value: PracticeFilter;
  onChange: (f: PracticeFilter) => void;
  entries: JournalEntry[];
  matchCount: number;
  onToast: (m: string) => void;
}

export const PracticeFilters: React.FC<Props> = ({ source, value: f, onChange, entries, matchCount, onToast }) => {
  const [saved, setSaved] = useState<SavedPracticeFilter[]>(() => loadPracticeFilters());
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const journal = source === 'journal';
  const dateError = practiceDateRangeError(source, f);
  const closed = useMemo(() => entries.filter((e) => eligible(e) && e.exitPrice !== null), [entries]);

  const marketCount = (m: PracticeMarket) => (journal ? closed.filter((e) => journalMarket(e) === m).length : SYMBOLS.filter((s) => feedMarket(s) === m).length);

  // Instruments offered under the chosen market types.
  const instruments = useMemo(() => {
    if (journal) {
      const c = new Map<string, number>();
      closed.filter((e) => !f.markets.length || f.markets.includes(journalMarket(e))).forEach((e) => c.set(e.symbol, (c.get(e.symbol) || 0) + 1));
      return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, label: id, sub: `${n}` }));
    }
    return SYMBOLS.filter((s) => !f.markets.length || f.markets.includes(feedMarket(s))).map((s) => ({ id: s.symbol, label: s.symbol, sub: s.aliases[0] ?? '' }));
  }, [journal, closed, f.markets]);
  const shown = instruments.filter((i) => !q || `${i.label} ${i.sub}`.toLowerCase().includes(q.toLowerCase()));

  const playbooks = useMemo(() => Array.from(new Set(closed.map((e) => e.strategy))).sort(), [closed]);
  const mistakes = useMemo(() => Array.from(new Set(closed.flatMap((e) => e.mistakes))).sort(), [closed]);

  const symbolSelected=(s:string)=>f.symbols.some(x=>sameSymbol(x,s));
  const toggleSymbol = (s: string) => onChange({ ...f, symbols: symbolSelected(s) ? f.symbols.filter((x) => !sameSymbol(x,s)) : [...f.symbols, s] });
  const changeMarket = (market: string) => {
    const markets = market ? [market as PracticeMarket] : [];
    const belongs = (symbol: string) => {
      if (!market) return true;
      const spec = SYMBOLS.find((s) => s.symbol === symbol || s.aliases.includes(symbol));
      const trade = closed.find((e) => e.symbol === symbol);
      return (spec && feedMarket(spec) === market) || (trade && journalMarket(trade) === market);
    };
    onChange({ ...f, markets, symbols: f.symbols.filter(belongs) });
  };

  const save = () => {
    const n = name.trim();
    if (!n) return;
    const next = [{ id: `pf_${Date.now().toString(36)}`, name: n, filter: f }, ...saved.filter((x) => x.name !== n)];
    setSaved(next); savePracticeFilters(next); setNaming(false); setName('');
    onToast(`Filter "${n}" saved`);
  };
  const remove = (id: string) => { const next = saved.filter((x) => x.id !== id); setSaved(next); savePracticeFilters(next); };
  const same = (a: PracticeFilter) => JSON.stringify({ ...DEFAULT_FILTER, ...a }) === JSON.stringify({ ...DEFAULT_FILTER, ...f });

  return (
    <div className="space-y-4">
      {saved.length > 0 && (
        <Field label="My filters" hint="Filters you saved. Click one to apply it.">
          <div className="flex flex-wrap gap-1.5">
            {saved.map((s) => (
              <span key={s.id} className={`inline-flex items-center ${chip(same(s.filter))} pr-1`}>
                <button type="button" onClick={() => onChange({ ...DEFAULT_FILTER, ...s.filter })} title="Apply this filter">{s.name}</button>
                <button type="button" aria-label={`Delete filter ${s.name}`} title="Delete this filter" onClick={() => remove(s.id)} className="ml-1 p-0.5 rounded-full hover:bg-black/5"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </Field>
      )}

      <Field label="Market type" hint="Choose a market to narrow the instrument list.">
        <select aria-label="Market type" value={f.markets.length > 1 ? '__multiple' : f.markets[0] ?? ''} onChange={(e) => changeMarket(e.target.value)} className={`${inputCls} h-9 text-xs`}>
          <option value="">All markets</option>
          {f.markets.length > 1 && <option value="__multiple" disabled>Multiple markets saved</option>}
          {PRACTICE_MARKETS.map((m) => {
            const n = marketCount(m);
            return <option key={m} value={m} disabled={!n}>{m} ({n})</option>;
          })}
        </select>
      </Field>

      <Field label="Instrument" hint={journal ? 'Search your traded symbols and choose one or more.' : 'Search and choose instruments. Replay picks one at random when several are selected.'}>
        <details className="group relative">
          <summary aria-label="Choose instruments" className={`${inputBase} h-9 w-full cursor-pointer list-none flex items-center justify-between gap-2 text-xs hover:border-slate-300 [&::-webkit-details-marker]:hidden`}>
            <span className="truncate text-left">{f.symbols.length === 0 ? `All instruments (${instruments.length})` : f.symbols.length === 1 ? f.symbols[0] : `${f.symbols.length} instruments selected`}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="absolute left-0 top-full z-30 mt-1 w-full min-w-[16rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input type="search" aria-label="Search instruments" placeholder="Search symbols" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} h-8 pl-8 text-xs`} />
              </div>
              <button type="button" onClick={() => onChange({ ...f, symbols: [] })} aria-pressed={!f.symbols.length} className="mt-1.5 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-[#5338ec] hover:bg-[#F7F5FF]">
                <span>All instruments <span className="font-normal text-slate-400">({instruments.length})</span></span>
                {!f.symbols.length && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto p-1.5" role="group" aria-label="Choose instruments">
              {shown.map((i) => {
                const selected = symbolSelected(i.id);
                return <button key={i.id} type="button" aria-pressed={selected} onClick={() => toggleSymbol(i.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec]">
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected ? 'border-[#5338ec] bg-[#5338ec] text-white' : 'border-slate-300 bg-white'}`}>{selected && <Check className="h-3 w-3" aria-hidden="true" />}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#0b1c30]">{i.label}</span>
                  {i.sub && <span className="truncate text-[10px] text-slate-400" title={journal ? `${i.sub} trades` : `Also matches ${i.sub}`}>{journal ? `${i.sub} trades` : i.sub}</span>}
                </button>;
              })}
              {shown.length === 0 && <p className="px-2 py-4 text-center text-xs text-slate-500">No matching instruments.</p>}
            </div>
            {f.symbols.length > 0 && <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-slate-500"><span>{f.symbols.length} selected</span><button type="button" onClick={() => onChange({ ...f, symbols: [] })} className="font-semibold text-[#5338ec] hover:underline">Clear selection</button></div>}
          </div>
        </details>
      </Field>

      <Field label={journal ? 'Trade date range' : 'Replay date range'} hint={journal ? 'Filter journal trades by entry date.' : `Choose dates for the replay chart. Demo data covers ${DATA_START} to ${DATA_END}.`}>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" aria-label="Practice start date" min={journal ? undefined : DATA_START} max={journal ? undefined : DATA_END} value={f.from ?? ''} onChange={(e) => onChange({ ...f, from: e.target.value })} className={`${inputBase} w-full h-8 text-xs`} />
          <input type="date" aria-label="Practice end date" min={journal ? undefined : DATA_START} max={journal ? undefined : DATA_END} value={f.to ?? ''} onChange={(e) => onChange({ ...f, to: e.target.value })} className={`${inputBase} w-full h-8 text-xs`} />
        </div>
        {dateError && <p className="mt-1 text-[11px] text-rose-600" role="alert">{dateError}</p>}
      </Field>

      {journal && (
        <>
          <Field label="Result">
            <Segmented size="sm" label="Result" value={f.result} onChange={(r) => onChange({ ...f, result: r })} options={[{ id: 'losses', label: 'Losses' }, { id: 'wins', label: 'Wins' }, { id: 'all', label: 'All' }]} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Playbook">
              <select aria-label="Playbook" value={f.playbook} onChange={(e) => onChange({ ...f, playbook: e.target.value })} className={`${inputBase} w-full h-8 text-xs`}>
                <option value="">All</option>{playbooks.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Mistake">
              <select aria-label="Mistake tag" value={f.mistake} onChange={(e) => onChange({ ...f, mistake: e.target.value })} className={`${inputBase} w-full h-8 text-xs`}>
                <option value="">Any</option>{mistakes.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
        <span className="text-slate-500 tabular-nums mr-auto" aria-live="polite">{matchCount} {journal ? `trade${matchCount === 1 ? '' : 's'}` : `instrument${matchCount === 1 ? '' : 's'}`} match</span>
        <button type="button" className={btnLink} onClick={() => onChange(DEFAULT_FILTER)}>Reset</button>
        {!naming && <button type="button" className={btnLink} onClick={() => setNaming(true)}>Save as my filter</button>}
      </div>
      {naming && (
        <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <input autoFocus aria-label="Filter name" placeholder="Name, e.g. London FX losses" value={name} onChange={(e) => setName(e.target.value)} className={`${inputBase} flex-1 min-w-0 h-8 text-xs`} />
          <button type="submit" className={`${btnSecondary} h-8`} disabled={!name.trim()}>Save</button>
          <button type="button" className="text-[11px] text-slate-500 hover:underline" onClick={() => { setNaming(false); setName(''); }}>Cancel</button>
        </form>
      )}
    </div>
  );
};
