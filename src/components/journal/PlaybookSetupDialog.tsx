import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { canonicalInstrument, instrumentSelection } from './instrumentMatching';
import { RECOMMENDATION_MARKETS } from './playbookRecommendations';
import { quickInstrumentCandidates, toggleQuickMarket } from './quickPlaybook';
import { useDialogFocus } from './useDialogFocus';

interface Props {
  draft: JournalPlaybook;
  entries: JournalEntry[];
  onChange: (draft: JournalPlaybook) => void;
  onBack: () => void;
  onCustomize: (draft: JournalPlaybook) => void;
  onCreate: (draft: JournalPlaybook) => string | null;
}

export const PlaybookSetupDialog: React.FC<Props> = ({ draft, entries, onChange, onBack, onCustomize, onCreate }) => {
  const dialog = useDialogFocus(onBack);
  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [error, setError] = useState('');
  const chosen = draft.symbols || [];
  const candidates = useMemo(() => quickInstrumentCandidates(draft.markets, entries), [draft.markets, entries]);
  const visible = candidates.filter(item => `${item.symbol} ${item.name}`.toLowerCase().includes(instrumentSearch.trim().toLowerCase()));
  const changeDraft = (next: JournalPlaybook) => { onChange(next); setError(''); };
  const toggleSymbol = (symbol: string, market: PortfolioAssetClass) => {
    const normalized = canonicalInstrument(symbol);
    const symbols = chosen.includes(normalized) ? chosen.filter(item => item !== normalized) : [...chosen, normalized];
    changeDraft({ ...draft, ...instrumentSelection(symbols, { ...draft.instrumentMarkets, [normalized]: market }) });
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) { setError('Enter a strategy name.'); return; }
    if (!draft.markets.length) { setError('Choose at least one market type.'); return; }
    if (!chosen.length) { setError('Choose at least one instrument.'); return; }
    setError(onCreate(draft) || '');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onBack(); }}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="playbook-setup-title" className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#0b1c30] shadow-2xl outline-none">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold text-[#5338ec]">PLAYBOOK SETUP</p>
            <h2 id="playbook-setup-title" className="mt-1 text-xl font-bold">Make it yours</h2>
            <p className="mt-1 text-sm text-slate-600">Review your name, markets and instruments before creating.</p>
          </div>
          <button type="button" aria-label="Back to recommendations" onClick={onBack} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </header>
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:px-7">
            <label className="block text-xs font-semibold">Strategy name<input value={draft.name} onChange={event => changeDraft({ ...draft, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-2 focus:outline-[#5338ec]" placeholder="e.g. Breakout" /></label>
            <fieldset>
              <legend className="text-xs font-semibold">Strategy markets</legend>
              <p className="mt-1 text-xs text-slate-500">Removing a market also removes its instruments.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RECOMMENDATION_MARKETS.map(item => <button key={item} type="button" aria-pressed={draft.markets.includes(item)} onClick={() => changeDraft(toggleQuickMarket(draft, item))} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${draft.markets.includes(item) ? 'border-[#CFC5FF] bg-[#F0EDFF] text-[#5338ec]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item === 'Commodity' ? 'Commodities' : item}</button>)}
              </div>
            </fieldset>
            <div>
              <label className="block text-xs font-semibold" htmlFor="setup-instruments">Instrument symbols</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Search size={16} className="shrink-0 text-slate-400" /><input id="setup-instruments" value={instrumentSearch} onChange={event => setInstrumentSearch(event.target.value)} placeholder="Search instruments" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
              <p className="mt-2 text-xs text-slate-500">{draft.markets.length ? 'Popular and journal instruments. Check any suggested selection.' : 'Choose a strategy market to see instruments.'}</p>
              <div role="group" aria-label="Instrument symbols" className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                {visible.map(item => <button key={item.symbol} type="button" aria-pressed={chosen.includes(item.symbol)} onClick={() => toggleSymbol(item.symbol, item.market)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${chosen.includes(item.symbol) ? 'border-[#5338ec] bg-[#F0EDFF] text-[#5338ec]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item.symbol}</button>)}
              </div>
              {draft.markets.length > 0 && !visible.length && <p className="mt-2 text-xs text-slate-500">No matching instruments.</p>}
              <p className="mt-3 text-xs text-slate-500" aria-live="polite">Selected: {chosen.length ? chosen.join(', ') : 'None'}</p>
              {chosen.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected instruments">
                {chosen.map(symbol => <button key={symbol} type="button" aria-label={`Remove ${symbol}`} onClick={() => changeDraft({ ...draft, ...instrumentSelection(chosen.filter(item => item !== symbol), draft.instrumentMarkets || {}) })} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:border-rose-300">{symbol}<X size={12} /></button>)}
              </div>}
            </div>
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
            <div>
              <button type="button" onClick={() => onCustomize(draft)} className="text-xs font-semibold text-[#5338ec] hover:underline">Customize details</button>
              <p className="mt-1 text-[11px] text-slate-500">Review rules and change suggested instruments before creating.</p>
              {error && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{error}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Back</button>
              <button type="submit" className="rounded-lg bg-[#5338ec] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4326d8]">Create playbook</button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};
