import React, { useState } from 'react';
import { ArrowLeft, Star, Check, X as XIcon, Trash2, Pencil, Link2, AlertTriangle } from 'lucide-react';
import { JournalEntry, JournalChecklistItem } from '../../types';
import { AiEntrySummary } from './AiEntrySummary';
import { TradeLogSection } from './TradeLogSection';

interface JournalEntryDetailProps {
  entry: JournalEntry;
  checklist: JournalChecklistItem[];
  /** The rest of the journal, so the summary can compare this trade with it. */
  allEntries?: JournalEntry[];
  onBack: () => void;
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const OUTCOME_STYLE: Record<JournalEntry['outcome'], string> = {
  win: 'bg-emerald-50 text-emerald-600',
  loss: 'bg-rose-50 text-rose-600',
  breakeven: 'bg-slate-100 text-slate-500',
  open: 'bg-amber-50 text-amber-600',
};

const money = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toFixed(2)}`;

export const JournalEntryDetail: React.FC<JournalEntryDetailProps> = ({
  entry,
  checklist,
  allEntries,
  onBack,
  onUpdate,
  onDelete,
  onShowToast,
}) => {
  const [editing, setEditing] = useState(false);
  const [lessons, setLessons] = useState(entry.lessons);
  const [rating, setRating] = useState(entry.rating);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveReview = () => {
    onUpdate({ ...entry, lessons, rating });
    setEditing(false);
    onShowToast('Review updated');
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 sm:px-8 py-8 sm:py-10 pb-24">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-[#474556] hover:text-[#5338ec] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to journal
      </button>

      {/* Header */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-display font-bold text-[#0b1c30]">{entry.symbol}</h1>
              <span className={`text-sm font-bold ${entry.direction === 'BUY' ? 'text-emerald-600' : 'text-rose-600'}`}>{entry.direction}</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold capitalize ${OUTCOME_STYLE[entry.outcome]}`}>{entry.outcome}</span>
            </div>
            <p className="text-xs text-[#94a3b8]">
              {entry.date} · {entry.assetClass} · {entry.strategy}
              {entry.linkedTradeId && (
                <span className="inline-flex items-center gap-1 ml-2 text-[#5338ec] font-semibold">
                  <Link2 className="w-3 h-3" /> Linked to Portfolio trade
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold font-mono ${entry.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{money(entry.pnl)}</p>
            <p className="text-xs text-[#474556] font-semibold">{entry.rMultiple !== null ? `${entry.rMultiple > 0 ? '+' : ''}${entry.rMultiple}R` : 'R not set'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[11px] text-[#474556] mb-0.5">Entry</p>
            <p className="text-sm font-bold font-mono">{entry.entryPrice}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[11px] text-[#474556] mb-0.5">Exit</p>
            <p className="text-sm font-bold font-mono">{entry.exitPrice ?? 'Open'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[11px] text-[#474556] mb-0.5">Size</p>
            <p className="text-sm font-bold font-mono">{entry.size} lots</p>
          </div>
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {entry.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold">{t}</span>
            ))}
          </div>
        )}
      </div>

      <AiEntrySummary entry={entry} allEntries={allEntries ?? [entry]} checklist={checklist} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        <div className="space-y-5">
          {entry.screenshot && (
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Chart</p>
              <img src={entry.screenshot} alt="Trade screenshot" className="w-full rounded-xl border border-slate-200" />
            </div>
          )}

          <TradeLogSection entry={entry} checklist={checklist} onShowToast={onShowToast} />

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Setup</p>
            <p className="text-sm leading-relaxed text-[#0b1c30]">{entry.setupNotes || 'No setup notes were written for this trade.'}</p>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wide text-[#474556]">Review</p>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8]">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => { setEditing(false); setLessons(entry.lessons); setRating(entry.rating); }} className="text-xs font-semibold text-[#474556]">Cancel</button>
                  <button onClick={saveReview} className="text-xs font-bold text-white bg-[#5338ec] hover:bg-[#4326d8] px-3 py-1.5 rounded-lg">Save</button>
                </div>
              )}
            </div>
            {editing ? (
              <textarea value={lessons} onChange={(e) => setLessons(e.target.value)} rows={4} className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30 mb-3" />
            ) : (
              <p className="text-sm leading-relaxed text-[#0b1c30] mb-3">{entry.lessons || 'No lesson written yet.'}</p>
            )}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#474556] mr-2">Execution</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} disabled={!editing} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={`w-5 h-5 ${n <= (editing ? rating : entry.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-3">Psychology</p>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[#474556]">Before</span>
              <span className="font-bold">{entry.emotionBefore}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-[#474556]">After</span>
              <span className="font-bold">{entry.emotionAfter}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl ${entry.followedPlan ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {entry.followedPlan ? <Check className="w-3.5 h-3.5" /> : <XIcon className="w-3.5 h-3.5" />}
              {entry.followedPlan ? 'Plan followed' : 'Plan not followed'}
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-3">
              Checklist · {entry.checklistDone.length}/{checklist.length}
            </p>
            <div className="space-y-2">
              {checklist.map((c) => {
                const done = entry.checklistDone.includes(c.id);
                return (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    {done ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> : <XIcon className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />}
                    <span className={done ? 'text-[#0b1c30]' : 'text-[#94a3b8]'}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {entry.mistakes.length > 0 && (
            <div className="bg-white border border-rose-100 rounded-2xl p-5">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-600 mb-3">
                <AlertTriangle className="w-3.5 h-3.5" /> Mistakes
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.mistakes.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">{m}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete entry
              </button>
            ) : (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#474556]">Delete this entry?</span>
                <button onClick={() => onDelete(entry.id)} className="font-bold text-rose-600">Yes, delete</button>
                <button onClick={() => setConfirmDelete(false)} className="font-semibold text-[#474556]">Keep</button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
