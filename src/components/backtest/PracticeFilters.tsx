// Practice (replay) filters: market type and instrument as separate filters, journal-only filters
// (result, playbook, mistake), and named custom filters the user can save and reuse.
import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { JournalEntry } from '../../types';
import { SYMBOLS, resolveSymbol } from '../../backtest/marketData';
import type { SymbolSpec } from '../../backtest/types';
import { loadPracticeFilters, PracticeFilter, PracticeMarket, savePracticeFilters, SavedPracticeFilter } from '../../backtest/store';
import { Field, Segmented, btnLink, btnSecondary, inputBase, inputCls } from './ui';

export const PRACTICE_MARKETS: PracticeMarket[] = ['Forex', 'Indices', 'Commodities', 'Crypto', 'Stocks'];
export const DEFAULT_FILTER: PracticeFilter = { markets: [], symbols: [], result: 'losses', playbook: '', mistake: '' };

const MARKET_HINT: Record<PracticeMarket, string> = {
  Forex: 'Currency pairs such as EUR/USD',
  Indices: 'Stock-index futures and CFDs (MNQ / NAS100, MES / US500)',
  Commodities: 'Gold and other commodities (MGC / XAU/USD)',
  Crypto: 'Bitcoin and other crypto pairs',
  Stocks: 'Single shares such as NVDA',
};

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
  && (f.result === 'all' || (f.result === 'losses' ? e.pnl < 0 : e.pnl > 0))
  && (!f.playbook || e.strategy === f.playbook)
  && (!f.mistake || e.mistakes.includes(f.mistake) || e.tags.includes(f.mistake));

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
  const closed = useMemo(() => entries.filter((e) => e.outcome !== 'open' && e.exitPrice !== null), [entries]);

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

  const toggleMarket = (m: PracticeMarket) => {
    const markets = f.markets.includes(m) ? f.markets.filter((x) => x !== m) : [...f.markets, m];
    // Drop instruments that no longer belong to a chosen market.
    const keep = (sym: string) => {
      if (!markets.length) return true;
      const spec = SYMBOLS.find((s) => s.symbol === sym || s.aliases.includes(sym));
      const e = closed.find((x) => x.symbol === sym);
      return (spec && markets.includes(feedMarket(spec))) || (e && markets.includes(journalMarket(e)));
    };
    onChange({ ...f, markets, symbols: f.symbols.filter(keep) });
  };
  const toggleSymbol = (s: string) => onChange({ ...f, symbols: f.symbols.includes(s) ? f.symbols.filter((x) => x !== s) : [...f.symbols, s] });

  const save = () => {
    const n = name.trim();
    if (!n) return;
    const next = [{ id: `pf_${Date.now().toString(36)}`, name: n, filter: f }, ...saved.filter((x) => x.name !== n)];
    setSaved(next); savePracticeFilters(next); setNaming(false); setName('');
    onToast(`Filter "${n}" saved`);
  };
  const remove = (id: string) => { const next = saved.filter((x) => x.id !== id); setSaved(next); savePracticeFilters(next); };
  const same = (a: PracticeFilter) => JSON.stringify(a) === JSON.stringify(f);

  return (
    <div className="space-y-4">
      {saved.length > 0 && (
        <Field label="My filters" hint="Filters you saved. Click one to apply it.">
          <div className="flex flex-wrap gap-1.5">
            {saved.map((s) => (
              <span key={s.id} className={`inline-flex items-center ${chip(same(s.filter))} pr-1`}>
                <button type="button" onClick={() => onChange(s.filter)} title="Apply this filter">{s.name}</button>
                <button type="button" aria-label={`Delete filter ${s.name}`} title="Delete this filter" onClick={() => remove(s.id)} className="ml-1 p-0.5 rounded-full hover:bg-black/5"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </Field>
      )}

      <Field label="Market type" hint="Narrow the practice to one or more kinds of market.">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Market type">
          <button type="button" aria-pressed={!f.markets.length} onClick={() => onChange({ ...f, markets: [] })} className={chip(!f.markets.length)}>All</button>
          {PRACTICE_MARKETS.map((m) => {
            const n = marketCount(m);
            return <button key={m} type="button" aria-pressed={f.markets.includes(m)} disabled={!n} title={n ? MARKET_HINT[m] : `No ${journal ? 'journal trades' : 'price data'} for ${m.toLowerCase()}`} onClick={() => toggleMarket(m)} className={`${chip(f.markets.includes(m))} disabled:opacity-40 disabled:cursor-not-allowed`}>{m}</button>;
          })}
        </div>
      </Field>

      <Field label="Instrument" hint={journal ? 'Symbols you traded, with how many trades each.' : 'Pick one or more. With several, one is chosen at random, so blind mode keeps you guessing.'}>
        {instruments.length > 8 && <input type="search" aria-label="Search instruments" placeholder="Search instruments" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} h-8 text-xs mb-1.5`} />}
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto" role="group" aria-label="Instrument">
          <button type="button" aria-pressed={!f.symbols.length} onClick={() => onChange({ ...f, symbols: [] })} className={chip(!f.symbols.length)}>All</button>
          {shown.map((i) => (
            <button key={i.id} type="button" aria-pressed={f.symbols.includes(i.id)} onClick={() => toggleSymbol(i.id)} className={chip(f.symbols.includes(i.id))} title={journal ? `${i.sub} trades` : i.sub ? `Also matches your journal's ${i.sub}` : undefined}>
              {i.label}{i.sub && <span className="ml-1 font-normal opacity-60">{i.sub}</span>}
            </button>
          ))}
        </div>
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
