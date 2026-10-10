import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { JournalEntry } from '../../types';
import { addDays, addMonth, monthCells, monthLabel } from './journalOverview';
import { DateRange, presetRange, RANGE_PRESETS, validDate, validRange } from './journalDay';
import { useDialogFocus } from './useDialogFocus';

const button = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#5338ec]';
const calendarMonth = (date: string) => date.slice(0, 7) > '9999-11' ? '9999-11' : date.slice(0, 7);

function RangeDialog({ initial, initialAll, today, entries, onApply, onClose }: { initial: DateRange; initialAll: boolean; today: string; entries: JournalEntry[]; onApply: (range: DateRange, all: boolean) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [month, setMonth] = useState(calendarMonth(initial.from));
  const [endpoint, setEndpoint] = useState<'from' | 'to'>('from');
  const [all, setAll] = useState(initialAll);
  const [preset, setPreset] = useState(initialAll ? 'All time' : '');
  const ref = useDialogFocus(onClose);
  const editDate = (key: 'from' | 'to', value: string) => {
    setDraft(d => ({ ...d, [key]: value })); setAll(false); setPreset('');
    if (validDate(value)) setMonth(calendarMonth(value));
  };
  const days = new Set(entries.filter(e => e.date >= draft.from && e.date <= draft.to).map(e => e.date)).size;
  const choose = (date: string) => {
    setAll(false); setPreset('');
    if (endpoint === 'from') { setDraft({ from: date, to: date }); setEndpoint('to'); }
    else if (date < draft.from) { setDraft({ from: date, to: draft.from }); setEndpoint('from'); }
    else { setDraft(d => ({ ...d, to: date })); setEndpoint('from'); }
  };
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b1c30]/35 p-3 sm:p-6" onClick={e => e.target === e.currentTarget && onClose()}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="journal-range-title" tabIndex={-1} className="w-full max-w-4xl max-h-[90dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white text-[#0b1c30] shadow-2xl focus:outline-none">
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div><h2 id="journal-range-title" className="text-lg font-bold">Choose your date range</h2><p className="text-xs text-slate-500 mt-1">Recorded entry dates · UTC · applies to the shared journal scope</p></div>
        <button className={button} aria-label="Close date range" onClick={onClose}><X size={16}/></button>
      </div>
      <div className="flex flex-wrap gap-3 items-end p-5 bg-slate-50">
        {(['from', 'to'] as const).map(key => <label key={key} className="text-xs font-semibold">{key === 'from' ? 'Start date' : 'End date'}<input type="date" aria-label={key === 'from' ? 'Start date' : 'End date'} aria-invalid={!validDate(draft[key]) || draft.from > draft.to} aria-describedby="journal-range-validation" value={draft[key]} onFocus={() => setEndpoint(key)} onInput={e => editDate(key, e.currentTarget.value)} onChange={e => editDate(key, e.target.value)} className="block mt-1 rounded-lg border border-slate-200 bg-white p-2 text-sm"/></label>)}
        <p className="text-xs text-slate-500 pb-2" aria-live="polite">{all ? 'All recorded dates' : `${days} recorded trading day${days === 1 ? '' : 's'}`} · select {endpoint === 'from' ? 'start' : 'end'} date</p>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="grid sm:grid-cols-2 gap-5 p-5">
          {[month, addMonth(month, 1)].map((ym, index) => <section key={index} aria-label={monthLabel(ym)}>
            <div className="flex items-center justify-between mb-4"><button className={button} aria-label={`Previous month in calendar ${index + 1}`} disabled={month <= '0001-01'} onClick={() => setMonth(addMonth(month, -1))}><ChevronLeft size={15}/></button><h3 className="text-sm font-bold">{monthLabel(ym)}</h3><button className={button} aria-label={`Next month in calendar ${index + 1}`} disabled={month >= '9999-11'} onClick={() => setMonth(addMonth(month, 1))}><ChevronRight size={15}/></button></div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}</div>
            <div className="grid grid-cols-7 gap-y-1">{monthCells(ym).map((day, i) => {
              if (!day) return <span key={i}/>;
              const date = day;
              const edge = date === draft.from || date === draft.to;
              const inside = date >= draft.from && date <= draft.to;
              return <button key={date} aria-label={`Choose ${date}`} aria-pressed={inside} aria-current={date === today ? 'date' : undefined} onClick={() => choose(date)} onKeyDown={ev => {
                const offset = ({ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7} as Record<string,number>)[ev.key];
                if (offset === undefined) return;
                ev.preventDefault(); const next = addDays(date, offset); if (!validDate(next)) return;
                if (next.slice(0,7) < month || next.slice(0,7) > addMonth(month,1)) setMonth(calendarMonth(next));
                requestAnimationFrame(() => ref.current?.querySelector<HTMLButtonElement>(`[aria-label="Choose ${next}"]`)?.focus());
              }} className={`h-9 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-[#5338ec] ${edge ? 'rounded-lg bg-[#5338ec] text-white' : inside ? 'bg-[#f0edff] text-[#5338ec]' : 'rounded-lg hover:bg-slate-100'}`}>{Number(day.slice(8))}</button>;
            })}</div>
          </section>)}
        </div>
        <aside className="border-t lg:border-t-0 lg:border-l border-slate-200 p-4 bg-slate-50"><h3 className="text-[11px] uppercase tracking-wide font-bold text-slate-500 mb-2">Presets</h3><div className="grid grid-cols-2 lg:grid-cols-1 gap-1">{[...RANGE_PRESETS, 'All time'].map(label => <button key={label} aria-pressed={preset === label} onClick={() => {
          const range = label === 'All time' ? { from: [...entries.map(e => e.date), today].sort()[0], to: [...entries.map(e => e.date), today].sort().at(-1)! } : presetRange(label as typeof RANGE_PRESETS[number], today);
          setDraft(range); setMonth(calendarMonth(range.from)); setPreset(label); setAll(label === 'All time'); setEndpoint('from');
        }} className={`text-left rounded-lg px-3 py-2 text-xs ${preset === label ? 'bg-[#f0edff] text-[#5338ec] font-semibold' : 'hover:bg-white'}`}>{label}</button>)}</div><p className="text-[10px] text-slate-500 mt-3">Presets use the journal demo date: {today}. No exchange-session calendar is assumed.</p></aside>
      </div>
      <div className="sticky bottom-0 z-10 bg-white flex flex-wrap justify-between items-center gap-3 border-t border-slate-200 p-5"><p id="journal-range-validation" className="text-xs text-slate-500" role={!validRange(draft) ? 'alert' : undefined}>{validRange(draft) ? 'Changes apply only when you confirm.' : 'Enter valid dates with the end on or after the start.'}</p><div className="flex gap-2"><button className={button} onClick={onClose}>Cancel</button><button className="rounded-lg bg-[#5338ec] text-white text-xs font-semibold px-4 py-2 disabled:opacity-40" disabled={!validRange(draft)} onClick={() => onApply(draft, all)}>Apply range</button></div></div>
    </div>
  </div>;
}

export function JournalDateRange({ from, to, label, today, entries, onApply }: { from: string; to: string; label: string; today: string; entries: JournalEntry[]; onApply: (range: DateRange, all: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const initial = { from: label !== 'All time' && validDate(from) ? from : [...entries.map(e => e.date), today].sort()[0], to: label !== 'All time' && validDate(to) ? to : [...entries.map(e => e.date), today].sort().at(-1)! };
  return <><button className={`${button} inline-flex items-center gap-2 h-9`} aria-label={`Date range: ${label}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><CalendarDays size={15} className="text-[#5338ec]"/>{label}</button>{open && <RangeDialog initial={initial} initialAll={label === 'All time'} today={today} entries={entries} onClose={() => setOpen(false)} onApply={(range, all) => { onApply(range, all); setOpen(false); }}/>}</>;
}
