import type { JournalChecklistItem } from '../../types';
import React, { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import type { JournalPlaybook, PlaybookStatus } from '../../data/journalPlaybooks';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { RECOMMENDATION_MARKETS, type PlaybookRecommendation } from './playbookRecommendations';
import { recommendationQuickDraft } from './quickPlaybook';
import { PlaybookSetupDialog } from './PlaybookSetupDialog';
import { useDialogFocus } from './useDialogFocus';
import type { GlobalTradingRules } from './JournalMonitors';

interface Props {
  recommendations: PlaybookRecommendation[];
  blankDraft: JournalPlaybook;
  entries: JournalEntry[];
  globalRules: GlobalTradingRules;
  houseChecklist: JournalChecklistItem[];
  existingNames: string[];
  createdAt: string;
  onClose: () => void;
  onCreate: (draft: JournalPlaybook, status: PlaybookStatus) => string | null;
}

export const StrategyRecommendationDialog: React.FC<Props> = ({ recommendations, blankDraft, entries, globalRules, houseChecklist, existingNames, createdAt, onClose, onCreate }) => {
  const [draft, setDraft] = useState(blankDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasSetup, setHasSetup] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [edited, setEdited] = useState(false);
  const [pending, setPending] = useState<PlaybookRecommendation | 'blank' | 'close' | null>(null);
  const [market, setMarket] = useState<'all' | PortfolioAssetClass>('all');
  const [search, setSearch] = useState('');
  const requestClose = () => { if (edited) setPending('close'); else onClose(); };
  const dialog = useDialogFocus(requestClose);
  const shown = recommendations.filter(item =>
    (market === 'all' || item.market === market) &&
    (!search.trim() || `${item.title} ${item.description} ${item.market} ${item.tools.join(' ')}`.toLowerCase().includes(search.trim().toLowerCase())),
  );

  const applySelection = (selection: PlaybookRecommendation | 'blank') => {
    setDraft(selection === 'blank' ? blankDraft : recommendationQuickDraft(selection, entries, existingNames, createdAt));
    setSelectedId(selection === 'blank' ? null : selection.id);
    setHasSetup(true);
    setEdited(false);
    setPending(null);
    setSetupOpen(true);
  };
  const requestSelection = (selection: PlaybookRecommendation | 'blank') => {
    const sameSetup = hasSetup && (selection === 'blank' ? selectedId === null : selection.id === selectedId);
    if (sameSetup) { setPending(null); setSetupOpen(true); }
    else if (edited) setPending(selection);
    else applySelection(selection);
  };
  const backToRecommendations = () => {
    setSetupOpen(false);
    window.requestAnimationFrame(() => dialog.current?.focus());
  };

  return <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !setupOpen) requestClose(); }}>
      <div ref={dialog} tabIndex={-1} inert={setupOpen} aria-hidden={setupOpen || undefined} className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#0b1c30] shadow-2xl outline-none" role="dialog" aria-modal="true" aria-labelledby="strategy-recommendation-title">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#5338ec]"><Sparkles className="h-4 w-4" /> MARKETSYDE AI</div>
            <h2 id="strategy-recommendation-title" className="text-xl font-bold">Set up a strategy</h2>
            <p className="mt-1 text-sm text-slate-600">Choose a recommendation or start with your own rules.</p>
          </div>
          <button type="button" aria-label="Close strategy recommendations" onClick={requestClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0b1c30]"><X className="h-5 w-5" /></button>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[205px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden">
            <aside className="flex flex-col border-b border-slate-200 bg-slate-50 p-4 md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r">
              <p className="text-[10px] font-bold tracking-wider text-slate-500">BROWSE MARKETS</p>
              <div role="group" aria-label="Browse recommendation markets" className="mt-2 flex flex-wrap gap-1 md:flex-col">
                {(['all', ...RECOMMENDATION_MARKETS] as const).map(item => <button key={item} type="button" aria-pressed={market === item} onClick={() => setMarket(item)} className={`rounded-lg px-3 py-2 text-left text-xs font-semibold ${market === item ? 'bg-[#F0EDFF] text-[#5338ec]' : 'text-slate-700 hover:bg-white'}`}>{item === 'all' ? 'All markets' : item === 'Commodity' ? 'Commodities' : item}</button>)}
              </div>
              <button type="button" onClick={() => requestSelection('blank')} className="mt-4 flex items-center gap-2 rounded-xl bg-[#5338ec] px-3 py-3 text-left text-xs font-semibold text-white hover:bg-[#4326d8] md:mt-auto"><span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 text-base">+</span>Create your own</button>
            </aside>
            <div className="flex min-h-0 flex-col">
              <div className="border-b border-slate-200 p-4 sm:px-5">
                <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-[#5338ec] focus-within:ring-2 focus-within:ring-[#5338ec]/15">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search scenarios, indicators, or asset class" aria-label="Search strategy recommendations" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
                </label>
              </div>
              <div role="region" aria-label="Strategy recommendations" tabIndex={0} className="min-h-0 flex-1 p-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5338ec] md:overflow-y-auto sm:p-5">
                <p className="mb-3 text-xs text-slate-500">Journal patterns use your full saved history. Technical scenarios use the same computed tools available in the backtest rule builder. Review your setup before creating.</p>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {shown.map(recommendation => <article key={recommendation.id} className={`flex min-h-48 flex-col rounded-xl border bg-white p-4 shadow-sm ${hasSetup && selectedId === recommendation.id ? 'border-[#5338ec] ring-1 ring-[#5338ec]' : 'border-slate-200'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#0b1c30]">{recommendation.title}</h3>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${recommendation.personalized ? 'bg-emerald-50 text-emerald-700' : recommendation.kind === 'technical' ? 'bg-[#F0EDFF] text-[#5338ec]' : 'bg-slate-100 text-slate-600'}`}>{recommendation.personalized ? 'Journal-guided' : recommendation.kind === 'technical' ? 'Technical scenario' : 'Starter framework'}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5"><span className="rounded-full border border-[#5338ec]/25 bg-[#F7F5FF] px-2 py-0.5 text-[10px] font-semibold text-[#5338ec]">{recommendation.market === 'Commodity' ? 'Commodities' : recommendation.market}</span><span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">{recommendation.evidence}</span></div>
                    {recommendation.tools.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{recommendation.tools.map(tool => <span key={tool} className="rounded border border-violet-100 bg-violet-50 px-1.5 py-0.5 text-[9px] font-medium text-violet-700">{tool}</span>)}</div>}
                    <p className="mt-3 text-xs leading-relaxed text-slate-600">{recommendation.description}</p>
                    <div className="mt-auto pt-4"><button type="button" aria-label={`Create playbook from ${recommendation.title}`} onClick={() => requestSelection(recommendation)} className="rounded-lg bg-[#5338ec] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4326d8]">Create playbook</button></div>
                  </article>)}
                  {shown.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No recommendations match that search.</p>}
                </div>
                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
                  This chooser is local and rule-based, not generated by a connected AI model or a source of live signals or forecasts. Journal rankings require at least 5 eligible closed trades and 5 recorded R results for a setup; technical scenarios are hypotheses, not performance rankings. A technical draft retains its computed indicators for Backtest. Review every rule and test costs, gaps, and market conditions before trading.
                </p>
            </div>
          </div>
        </div>
        {pending && <footer role="alert" className="shrink-0 border-t border-slate-200 bg-amber-50 px-5 py-3 text-xs text-amber-900 sm:px-7"><p>{pending === 'close' ? 'Discard your edited setup?' : 'Replace your edited setup?'}</p><div className="mt-2 flex gap-3"><button type="button" className="font-semibold underline" onClick={() => pending === 'close' ? onClose() : applySelection(pending)}>{pending === 'close' ? 'Discard setup' : 'Replace setup'}</button><button type="button" className="font-semibold underline" onClick={() => setPending(null)}>Keep setup</button></div></footer>}
      </div>
    </div>
    {setupOpen && <PlaybookSetupDialog
      draft={draft}
      entries={entries}
      globalRules={globalRules}
      houseChecklist={houseChecklist}
      onChange={next => { setDraft(next); setEdited(true); }}
      onBack={backToRecommendations}
      onCreate={onCreate}
    />}
  </>;
};
