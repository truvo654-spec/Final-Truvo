import { DirectionFilter, BOTH_SIDES } from './DirectionFilter';
import { PlaybookChecklistSelector } from './PlaybookChecklistSelector';
import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { JournalPlaybook, PlaybookGrade, PlaybookStatus } from '../../data/journalPlaybooks';
import { PLAYBOOK_STATUS_LABELS } from '../../data/journalPlaybooks';
import type { JournalChecklistItem, JournalEntry, PortfolioAssetClass } from '../../types';
import { JournalHelp } from './JournalHelp';
import { PlaybookInstruments } from './PlaybookInstruments';
import { PlaybookTechnicalConditions } from './PlaybookTechnicalConditions';
import { PlaybookTradingRulesEditor } from './PlaybookTradingRulesEditor';
import { resolvePlaybookTradingRules, type GlobalTradingRules } from '../../data/tradingRules';

const MARKETS: PortfolioAssetClass[] = ['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks'];
const GRADES: PlaybookGrade[] = ['A+', 'A', 'B+', 'B', 'C'];
const STATUS_LABEL = PLAYBOOK_STATUS_LABELS;
const pad = (n: number) => String(n).padStart(2, '0');
const input = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
const lbl = 'text-[10px] font-bold tracking-wider uppercase text-slate-500';

const FieldGroup: React.FC<{ title: string; grouped: boolean; children: React.ReactNode }> = ({ title, grouped, children }) => grouped ? (
  <details className="group rounded-xl border border-slate-200 bg-white">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#0b1c30] hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5338ec] [&::-webkit-details-marker]:hidden">
      {title}<ChevronDown size={16} aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-slate-100 px-4 py-4">{children}</div>
  </details>
) : <>{children}</>;

interface Props {
  editing: JournalPlaybook;
  setEditing: React.Dispatch<React.SetStateAction<JournalPlaybook>>;
  entries: JournalEntry[];
  globalRules: GlobalTradingRules;
  isNew: boolean;
  tradesCount?: number;
  suggestedGrade?: PlaybookGrade;
  includeSetupFields?: boolean;
  grouped?: boolean;
  houseChecklist?: JournalChecklistItem[];
}

export const PlaybookEditorFields: React.FC<Props> = ({ editing, setEditing, entries, globalRules, isNew, tradesCount = 0, suggestedGrade, includeSetupFields = true, grouped = false, houseChecklist }) => (
  <>
    <FieldGroup title="Strategy profile" grouped={grouped}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {includeSetupFields && <label className="block"><span className={lbl}>Name<JournalHelp label="Name" /></span>
          <input aria-label="Name" className={`${input} mt-1`} value={editing.name} disabled={!isNew && tradesCount > 0} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. London Breakout" />
          {!isNew && tradesCount > 0 && <span className="text-[10px] text-slate-400">Locked: {tradesCount} journal entries use this name.</span>}
        </label>}
        <label className="block"><span className={lbl}>Style<JournalHelp label="Style" /></span>
          <input aria-label="Style" className={`${input} mt-1`} value={editing.style} onChange={(e) => setEditing({ ...editing, style: e.target.value })} placeholder="Momentum, Mean reversion..." />
        </label>
        <label className="block"><span className={lbl}>Grade<JournalHelp label="Grade" /></span>
          <select aria-label="Grade" className={`${input} mt-1`} value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: e.target.value as PlaybookGrade })}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select>
          {!isNew && suggestedGrade && <span className="text-[10px] text-slate-500">Data suggests {suggestedGrade}. Hover a grade badge to see the criteria.</span>}
        </label>
        <DirectionFilter value={editing.directions ?? BOTH_SIDES} onChange={directions => setEditing({ ...editing, directions })} />
        <label className="block"><span className={lbl}>Status<JournalHelp label="Status" /></span>
          <select aria-label="Status" className={`${input} mt-1`} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as PlaybookStatus })}>
            {(['draft', 'active', 'testing', 'archived'] as const).map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
          </select>
        </label>
      </div>
      {includeSetupFields && <div>
        <span className={lbl}>Markets<JournalHelp label="Markets" /></span>
        <div className="flex flex-wrap gap-3 mt-1">
          {MARKETS.map((m) => (
            <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.markets.includes(m)} onChange={() => setEditing({ ...editing, markets: editing.markets.includes(m) ? editing.markets.filter((x) => x !== m) : [...editing.markets, m] })} />{m}
            </label>
          ))}
        </div>
      </div>}
    </FieldGroup>
    <FieldGroup title="Session and risk" grouped={grouped}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
        <label className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
          <input type="checkbox" aria-label="Session window" checked={!!editing.window} onChange={(e) => setEditing({ ...editing, window: e.target.checked ? { start: 7, end: 12, label: 'London' } : null })} /> Session window<JournalHelp label="Session window" />
        </label>
        {editing.window && (
          <>
            <label className="block"><span className={lbl}>From (UTC)<JournalHelp label="From (UTC)" /></span>
              <select aria-label="From (UTC)" className={`${input} mt-1`} value={editing.window.start} onChange={(e) => setEditing({ ...editing, window: { ...editing.window!, start: Number(e.target.value) } })}>{Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{pad(h)}:00</option>)}</select>
            </label>
            <label className="block"><span className={lbl}>To (UTC)<JournalHelp label="To (UTC)" /></span>
              <select aria-label="To (UTC)" className={`${input} mt-1`} value={editing.window.end} onChange={(e) => setEditing({ ...editing, window: { ...editing.window!, end: Number(e.target.value) } })}>{Array.from({ length: 24 }, (_, h) => h + 1).map((h) => <option key={h} value={h}>{pad(h)}:00</option>)}</select>
            </label>
            <label className="block"><span className={lbl}>Label</span>
              <input className={`${input} mt-1`} value={editing.window.label} onChange={(e) => setEditing({ ...editing, window: { ...editing.window!, label: e.target.value } })} />
            </label>
          </>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-600">Playbook-specific settings</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="block"><span className={lbl}>Min reward:risk (1:x)<JournalHelp label="Min reward:risk (1:x)" /></span>
          <input aria-label="Min reward:risk (1:x)" type="number" min={0.5} step={0.1} className={`${input} mt-1`} value={editing.benchmarkRR} onChange={(e) => setEditing({ ...editing, benchmarkRR: Number(e.target.value) })} />
        </label>
      </div>
      <label className="block"><span className={lbl}>Do not trade when (one per line)<JournalHelp label="Do not trade when (one per line)" /></span>
        <textarea aria-label="Do not trade when (one per line)" rows={3} className={`${input} mt-1`} value={(editing.avoid || []).join('\n')} onChange={(e) => setEditing({ ...editing, avoid: e.target.value.split('\n') })} placeholder="e.g. Within 15 minutes of a tier-1 release" />
      </label>
    </FieldGroup>
    {houseChecklist && <FieldGroup title="Pre-trade checklist" grouped={grouped}>
      <PlaybookChecklistSelector playbook={editing} checklist={houseChecklist} onChange={setEditing} />
    </FieldGroup>}
    <FieldGroup title="Thesis and execution rules" grouped={grouped}>
      <label className="block"><span className={lbl}>Thesis<JournalHelp label="Thesis" /></span>
        <textarea aria-label="Thesis" rows={3} className={`${input} mt-1`} value={editing.thesis} onChange={(e) => setEditing({ ...editing, thesis: e.target.value })} placeholder="Why this setup works and when it does not." />
      </label>
      <PlaybookTradingRulesEditor
        rules={resolvePlaybookTradingRules(editing, globalRules)}
        onChange={tradingRules => setEditing({ ...editing, tradingRules })}
      />
      <div>
        <span className={lbl}>Execution rules<JournalHelp label="Execution rules" /></span>
        <div className="space-y-2 mt-1">
          {editing.rules.map((r, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 items-center sm:grid-cols-[24px_minmax(0,1fr)_minmax(0,2fr)_auto]">
              <span className="text-xs font-bold text-slate-400">{i + 1}.</span>
              <input className={input} value={r.title} placeholder="Rule" onChange={(e) => setEditing({ ...editing, rules: editing.rules.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
              <input className={input} value={r.detail} placeholder="What must be true" onChange={(e) => setEditing({ ...editing, rules: editing.rules.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)) })} />
              <button type="button" aria-label={`Remove rule ${i + 1}`} onClick={() => setEditing({ ...editing, rules: editing.rules.filter((_, j) => j !== i) })} className="text-xs text-slate-400 hover:text-rose-600 px-2">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setEditing({ ...editing, rules: [...editing.rules, { id: `r${editing.rules.length + 1}`, title: '', detail: '' }] })} className="text-xs font-semibold text-[#5338ec] hover:underline">Add rule</button>
        </div>
      </div>
      <label className="block"><span className={lbl}>Strategy notes (optional)</span>
        <textarea aria-label="Strategy notes" rows={3} className={`${input} mt-1`} value={editing.strategyNotes ?? ''} onChange={(e) => setEditing({ ...editing, strategyNotes: e.target.value })} placeholder="Add context or reminders for this playbook." />
        <span className="mt-1 block text-[11px] text-slate-500">Notes are for reference and do not create an automatic trading rule.</span>
      </label>
    </FieldGroup>
    <FieldGroup title="Entry, stop and profit taking" grouped={grouped}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {([['entryTrigger', 'Entry trigger'], ['stopRule', 'Stop / invalidation'], ['targetRule', 'Profit taking']] as const).map(([k, l]) => (
          <label key={k} className="block"><span className={lbl}>{l}<JournalHelp label={l} /></span>
            <textarea aria-label={l} rows={3} className={`${input} mt-1`} value={editing[k]} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
          </label>
        ))}
      </div>
    </FieldGroup>
    <FieldGroup title="Technical conditions" grouped={grouped}>
      <PlaybookTechnicalConditions playbook={editing} onChange={setEditing} />
    </FieldGroup>
    {!grouped && <FieldGroup title="Instrument tools and tags" grouped={grouped}>
      <PlaybookInstruments playbook={editing} entries={entries} onSave={selection => setEditing(current => ({ ...current, ...selection }))} />
      <label className="block"><span className={lbl}>Tags (comma separated)<JournalHelp label="Tags (comma separated)" /></span>
        <input aria-label="Tags (comma separated)" className={`${input} mt-1`} value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
      </label>
    </FieldGroup>}
  </>
);
