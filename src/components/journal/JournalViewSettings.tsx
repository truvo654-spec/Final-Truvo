import React from 'react';
import { useJournalPreferences } from './useJournalCards';
import { JOURNAL_LEVELS, JOURNAL_TABS, isJournalLevel, tabPreference, type JournalTab } from './journalViews';
import { journalButton } from './JournalCards';

export function JournalViewSettings() {
  const { preferences, dispatch, error } = useJournalPreferences();
  return <section aria-label="Journal view settings" className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-sm font-bold">Journal view</h3>
    <p className="my-2 text-xs text-slate-500">Choose how much detail you see. Saved in this browser, just like your journal. Changing the default resets per-tab customizations.</p>
    {error && <p role="alert" className="my-2 text-xs text-rose-700">{error}</p>}
    <label className="block text-sm">Default level for all tabs
      <select aria-label="Default journal level" className="ml-3 rounded-lg border border-slate-200 p-2 capitalize" value={preferences.defaultLevel} onChange={event => {
        if (isJournalLevel(event.target.value) && window.confirm('Apply this default to all journal tabs and reset their card customizations?')) dispatch({ type: 'default', level: event.target.value });
      }}>{JOURNAL_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}</select>
    </label>
    <div className="my-4 grid gap-3 sm:grid-cols-2">{(Object.keys(JOURNAL_TABS) as JournalTab[]).map(tab => <label key={tab} className="flex items-center justify-between gap-2 text-xs">{JOURNAL_TABS[tab]}
      <select aria-label={`${JOURNAL_TABS[tab]} view level`} className="rounded-lg border border-slate-200 p-2 capitalize" value={tabPreference(preferences, tab).level} onChange={event => {
        if (isJournalLevel(event.target.value)) dispatch({ type: 'level', tab, level: event.target.value });
      }}>{JOURNAL_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}</select>
    </label>)}</div>
    <button className={journalButton} onClick={() => { if (window.confirm('Reset all journal views to Easy and restore their cards? Your trades will not change.')) dispatch({ type: 'reset' }); }}>Reset all journal views</button>
  </section>;
}
