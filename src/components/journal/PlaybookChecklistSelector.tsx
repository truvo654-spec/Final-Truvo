import React from 'react';
import type { JournalChecklistItem } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
export const PlaybookChecklistSelector: React.FC<{ playbook: JournalPlaybook; checklist: JournalChecklistItem[]; onChange: React.Dispatch<React.SetStateAction<JournalPlaybook>> }> = ({playbook, checklist, onChange}) => {
  const selected = playbook.houseChecklistIds ?? checklist.map(item => item.id);
  return <fieldset className="rounded-xl border border-slate-200 bg-white p-4">
    <legend className="px-1 text-sm font-bold">Pre-trade checklist</legend>
    <p className="mb-3 text-xs text-slate-500">Your house rules appear automatically. Select the checks to include in this playbook.</p>
    <div className="space-y-2">{checklist.map(item => <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
      <input type="checkbox" className="accent-[#5338ec]" checked={selected.includes(item.id)} onChange={event => {
        const checked = event.target.checked;
        onChange(current => {
          const ids = current.houseChecklistIds ?? checklist.map(check => check.id);
          return {...current, houseChecklistIds: checked ? [...new Set([...ids, item.id])] : ids.filter(id => id !== item.id)};
        });
      }}/>{item.label}
    </label>)}</div>
    {!checklist.length && <p className="text-xs text-slate-500">Add house checklist rules to see them here.</p>}
  </fieldset>;
};
