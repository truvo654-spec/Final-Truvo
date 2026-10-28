import React, { useState } from 'react';
import type { JournalEntry } from '../../types';
import { JOURNAL_EMOTIONS } from '../../data/journalData';
import { planAnswer, quickReviewPatch, type QuickReviewAnswers } from './journalTradeLogModel';
import { journalButton } from './JournalCards';
import { useDialogFocus } from './useDialogFocus';

interface Props {
  entry: JournalEntry;
  onClose: () => void;
  onSave: (id: string, patch: Partial<JournalEntry>) => void;
  onFullReview: () => void;
  onDelete: () => void;
}
export function JournalQuickReview({ entry, onClose, onSave, onFullReview, onDelete }: Props) {
  const [answers, setAnswers] = useState<QuickReviewAnswers>({
    emotionAfter: entry.emotionAfter, plan: planAnswer(entry), lessons: entry.lessons, screenshot: entry.screenshot,
  });
  const [error, setError] = useState('');
  const [readingImage, setReadingImage] = useState(false);
  const dirty = JSON.stringify(quickReviewPatch(answers)) !== JSON.stringify(quickReviewPatch({
    emotionAfter: entry.emotionAfter, plan: planAnswer(entry), lessons: entry.lessons, screenshot: entry.screenshot,
  }));
  const leave = () => { if (!dirty || window.confirm('Discard your unsaved quick review?')) onClose(); };
  const ref = useDialogFocus(leave);
  return <div className="fixed inset-0 z-[70] flex justify-end bg-slate-900/35" onClick={event => { if (event.target === event.currentTarget) leave(); }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-label={`Quick review ${entry.symbol}`} tabIndex={-1} className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 text-sm outline-none">
      <header className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Quick review · {entry.symbol}</h2>
        <button className={journalButton} aria-label="Close quick review" onClick={leave}>Close</button>
      </header>
      <p className="mt-2 text-sm text-slate-500">{entry.date} · {entry.direction === 'BUY' ? 'Long' : 'Short'}</p>
      {error && <p role="alert" className="my-4 text-rose-700">{error}</p>}
      <form className="mt-6 space-y-6" onSubmit={event => { event.preventDefault(); onSave(entry.id, quickReviewPatch(answers)); onClose(); }}>
        <fieldset><legend className="mb-3 font-semibold">How did you feel?</legend><p className="mb-3 text-slate-500">Your feeling after this trade.</p>
          <div className="flex flex-wrap gap-2">{JOURNAL_EMOTIONS.map(emotion => <button key={emotion} type="button" aria-pressed={answers.emotionAfter === emotion} className={`${journalButton} ${answers.emotionAfter === emotion ? 'border-[#5338ec] text-[#5338ec]' : ''}`} onClick={() => setAnswers(current => ({ ...current, emotionAfter: current.emotionAfter === emotion ? null : emotion }))}>{emotion}</button>)}</div>
        </fieldset>
        <fieldset><legend className="mb-3 font-semibold">Did you follow your plan?</legend>
          <div className="flex gap-2">{(['yes', 'partly', 'no'] as const).map(plan => <button key={plan} type="button" aria-pressed={answers.plan === plan} className={`${journalButton} capitalize ${answers.plan === plan ? 'border-[#5338ec] text-[#5338ec]' : ''}`} onClick={() => setAnswers(current => ({ ...current, plan: current.plan === plan ? '' : plan }))}>{plan}</button>)}</div>
        </fieldset>
        <label className="block font-semibold">One lesson
          <textarea aria-label="One lesson" rows={4} value={answers.lessons} onChange={event => setAnswers(current => ({ ...current, lessons: event.target.value }))} className="mt-3 block w-full rounded-xl border border-slate-200 p-3 font-normal"/>
        </label>
        <label className="block text-slate-600">Add chart image <span className="text-slate-500">(optional, up to 3 MB)</span>
          <input type="file" aria-label="Add chart image" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-sm" onChange={event => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 3 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Use a PNG, JPEG or WebP image up to 3 MB.'); return; }
            setReadingImage(true); setError('');
            const reader = new FileReader();
            reader.onload = () => { setAnswers(current => ({ ...current, screenshot: String(reader.result) })); setReadingImage(false); };
            reader.onerror = () => { setError('The chart image could not be read. Please choose it again.'); setReadingImage(false); };
            reader.readAsDataURL(file);
          }}/>
        </label>
        {answers.screenshot && <img src={answers.screenshot} alt={`Chart for ${entry.symbol}`} className="w-full rounded-xl border border-slate-200"/>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={readingImage} className="rounded-lg bg-[#5338ec] px-5 py-2 font-semibold text-white disabled:opacity-40">Save</button>
          <button type="button" className="text-[#5338ec] underline" disabled={readingImage} onClick={() => { if (dirty) onSave(entry.id, quickReviewPatch(answers)); onFullReview(); }}>Open full review</button>
          <details className="relative ml-auto"><summary aria-label="Trade review options" className={journalButton+' cursor-pointer'}>⋯</summary>
            <button type="button" className="absolute right-0 mt-1 w-40 rounded-lg border bg-white p-3 text-left" onClick={() => { if (window.confirm(`Delete ${entry.symbol} on ${entry.date}? This cannot be undone.`)) onDelete(); }}>Delete trade</button>
          </details>
        </div>
        <p className="text-slate-500">Save keeps every other trade field unchanged. Use the full review to complete any remaining questions.</p>
      </form>
    </div>
  </div>;
}
