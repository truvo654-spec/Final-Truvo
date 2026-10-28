import { useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '../../../types';
import { aggregateInsights, insightsUrl, readInsightsFilters, zonedParts, type InsightsFilters, type InsightsSettings } from './insightsData';

export function useInsightsData(entries: JournalEntry[], settings: InsightsSettings, checklistLength = 0) {
  const today = zonedParts(Date.now(), settings.timeZone).date;
  const [selection, setSelection] = useState(() => readInsightsFilters(window.location.search, today));
  useEffect(() => {
    const pop = () => setSelection(readInsightsFilters(window.location.search, today));
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, [today]);
  useEffect(() => {
    const url = insightsUrl(new URL(window.location.href), selection.filters);
    window.history.replaceState(window.history.state, '', url);
  }, [selection.filters]);
  const update = (patch: Partial<InsightsFilters>) => {
    const filters = { ...selection.filters, ...patch };
    const url = insightsUrl(new URL(window.location.href), filters);
    window.history.pushState(window.history.state, '', url);
    setSelection({ filters, errors: [] });
  };
  const data = useMemo(() => aggregateInsights(entries, selection.filters, settings, checklistLength), [entries, selection.filters, settings.timeZone, settings.currency, settings.locale, checklistLength]);
  return { data, today, errors: selection.errors, update };
}
