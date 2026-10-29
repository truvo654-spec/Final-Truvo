import React, { useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { JournalPlaybook, PlaybookStatus } from '../../data/journalPlaybooks';
import type { JournalEntry } from '../../types';
import { RECOMMENDATION_MARKETS } from './playbookRecommendations';
import { toggleQuickMarket } from './quickPlaybook';
import { useDialogFocus } from './useDialogFocus';
import { PlaybookEditorFields } from './PlaybookEditorFields';
import type { GlobalTradingRules } from './JournalMonitors';
import { PlaybookInstruments } from './PlaybookInstruments';

interface Props {
  draft: JournalPlaybook;
  entries: JournalEntry[];
  globalRules: GlobalTradingRules;
  onChange: React.Dispatch<React.SetStateAction<JournalPlaybook>>;
  onBack: () => void;
  onCreate: (draft: JournalPlaybook, status: PlaybookStatus) => string | null;
}

export const PlaybookSetupDialog: React.FC<Props> = ({ draft, entries, globalRules, onChange, onBack, onCreate }) => {
  const dialog = useDialogFocus(onBack);
  const content = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  useLayoutEffect(() => {
    if (!content.current) return;
    content.current.scrollTop = expanded && details.current
      ? content.current.scrollTop + details.current.getBoundingClientRect().top - content.current.getBoundingClientRect().top
      : 0;
  }, [expanded]);
  const changeDraft: React.Dispatch<React.SetStateAction<JournalPlaybook>> = next => { onChange(next); setError(''); };
  const save = (status: PlaybookStatus, validateSetup: boolean) => {
    if (!draft.name.trim()) { setError('Enter a strategy name.'); return; }
    if (validateSetup && !draft.markets.length) { setError('Choose at least one market type.'); return; }
    if (validateSetup && !draft.symbols?.length) { setError('Choose at least one instrument.'); return; }
    setError(onCreate(draft, status) || '');
  };
  const toggleDetails = () => {
    setExpanded(current => !current);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onBack(); }}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="playbook-setup-title" className={`flex max-h-[92dvh] w-full ${expanded ? 'max-w-5xl' : 'max-w-2xl'} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#0b1c30] shadow-2xl outline-none`}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold text-[#5338ec]">PLAYBOOK SETUP</p>
            <h2 id="playbook-setup-title" className="mt-1 text-xl font-bold">Make it yours</h2>
            <p className="mt-1 text-sm text-slate-600">{expanded ? 'Customize your setup, execution rules and risk limits.' : 'Review your name, markets and instruments before creating.'}</p>
          </div>
          <button type="button" aria-label="Back to recommendations" onClick={onBack} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={content} className="min-h-0 flex-1 overflow-y-auto p-5 sm:px-7">
            <form id="quick-playbook-setup" noValidate onSubmit={event => { event.preventDefault(); save(expanded && draft.status !== 'draft' ? draft.status : 'active', !expanded); }} className="space-y-5">
            <label className="block text-xs font-semibold">Strategy name<input value={draft.name} onChange={event => changeDraft({ ...draft, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-2 focus:outline-[#5338ec]" placeholder="e.g. Breakout" /></label>
            <fieldset>
              <legend className="text-xs font-semibold">Strategy markets</legend>
              <p className="mt-1 text-xs text-slate-500">Removing a market also removes its instruments.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RECOMMENDATION_MARKETS.map(item => <button key={item} type="button" aria-pressed={draft.markets.includes(item)} onClick={() => changeDraft(toggleQuickMarket(draft, item))} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${draft.markets.includes(item) ? 'border-[#CFC5FF] bg-[#F0EDFF] text-[#5338ec]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item === 'Commodity' ? 'Commodities' : item}</button>)}
              </div>
            </fieldset>
            <PlaybookInstruments
              playbook={draft}
              entries={entries}
              inlineSelect
              onSave={selection => changeDraft(current => ({ ...current, ...selection }))}
            />
            <label className="block text-xs font-semibold">Tags (comma separated)
              <input aria-label="Tags (comma separated)" value={draft.tags.join(', ')} onChange={event => changeDraft(current => ({ ...current, tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))} placeholder="e.g. Breakout, London open" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-2 focus:outline-[#5338ec]" />
            </label>
            </form>
            {expanded && <div ref={details} id="playbook-setup-details" className="mt-6 space-y-4 border-t border-slate-200 pt-5">
              <div><h3 className="text-sm font-bold text-[#0b1c30]">Strategy details</h3><p className="mt-1 text-xs text-slate-500">Open a topic to customize its settings.</p></div>
              <PlaybookEditorFields editing={draft} setEditing={changeDraft} entries={entries} globalRules={globalRules} isNew includeSetupFields={false} grouped />
            </div>}
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
            <div>
              <button type="button" aria-expanded={expanded} aria-controls={expanded ? 'playbook-setup-details' : undefined} onClick={toggleDetails} className="text-xs font-semibold text-[#5338ec] hover:underline">{expanded ? 'Back to basic setup' : 'Customize details'}</button>
              <p className="mt-1 text-[11px] text-slate-500">{expanded ? 'Changes stay in this setup until you create or save it.' : 'Review rules and change suggested instruments before creating.'}</p>
              {error && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">{error}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Back</button>
              {expanded && <button type="button" onClick={() => save('draft', false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Save draft</button>}
              {expanded
                ? <button type="button" onClick={() => save(draft.status === 'draft' ? 'active' : draft.status, false)} className="rounded-lg bg-[#5338ec] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4326d8]">Create playbook</button>
                : <button type="submit" form="quick-playbook-setup" className="rounded-lg bg-[#5338ec] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#4326d8]">Create playbook</button>}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
