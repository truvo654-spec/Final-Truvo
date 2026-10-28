import React, { useMemo } from 'react';
import type { UserProfile } from '../../../types';
import { useJournalState } from '../journalStorage';
import { browserTimeZone, profileCurrencies, profileTimeZones, validCurrency, validTimeZone } from './insightsData';

export function JournalReportingSettings({ user, onUpdate }: { user: Pick<UserProfile, 'timeZone' | 'preferredCurrency'>; onUpdate: (patch: Partial<UserProfile>) => void }) {
  const [journalCurrency, , failed] = useJournalState('currency', 'USD');
  const timeZones = useMemo(profileTimeZones, []), currencies = useMemo(profileCurrencies, []);
  const timeZone = user.timeZone || browserTimeZone(), currency = user.preferredCurrency || journalCurrency;
  return <section aria-label="Journal reporting settings" className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-sm font-bold">Journal reporting</h3>
    <p className="my-2 text-xs text-slate-500">Simple Insights uses these preferences for calendar dates, entry hours and money. Different account currencies are kept separate; no currency conversion is assumed.</p>
    {failed && <p role="alert" className="text-xs text-rose-600">The saved journal currency could not be read. Choose your reporting currency below.</p>}
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-semibold">Timezone<select aria-label="Profile journal timezone" className="mt-2 block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm" value={timeZone} onChange={event => { if (validTimeZone(event.target.value)) onUpdate({ timeZone: event.target.value }); }}>
        {!timeZones.includes(timeZone) && <option value={timeZone}>{timeZone}</option>}{timeZones.map(zone => <option key={zone}>{zone}</option>)}
      </select></label>
      <label className="text-xs font-semibold">Reporting currency<select aria-label="Profile journal currency" className="mt-2 block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm" value={currency} onChange={event => { if (validCurrency(event.target.value)) onUpdate({ preferredCurrency: event.target.value }); }}>
        {!currencies.includes(currency) && <option value={currency}>{currency}</option>}{currencies.map(code => <option key={code}>{code}</option>)}
      </select></label>
    </div>
  </section>;
}
