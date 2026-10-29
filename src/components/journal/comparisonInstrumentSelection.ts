import { instrumentKey } from './playbookExecution';

/** Keep the playbook's display names ahead of equivalent historical journal aliases. */
export function comparisonInstrumentOptions(configured: string[], journal: string[]) {
  const unique = new Map<string, string>();
  for (const symbol of [...configured, ...journal]) {
    const key = instrumentKey(symbol);
    if (!unique.has(key)) unique.set(key, symbol);
  }
  return [...unique.values()];
}

/** Retain manual opt-outs; select newly configured instruments and drop removed ones. */
export function syncComparisonInstruments(selection: string[] | null, previous: string[], current: string[], available: string[]): string[] | null {
  if (selection === null) return null;
  const before = new Set(previous.map(instrumentKey));
  const now = new Set(current.map(instrumentKey));
  const names = new Map(comparisonInstrumentOptions(current, available).map(symbol => [instrumentKey(symbol), symbol]));
  const selected = new Set(selection.map(instrumentKey).filter(key => names.has(key) && (!before.has(key) || now.has(key))));
  for (const symbol of current) {
    const key = instrumentKey(symbol);
    if (!before.has(key)) selected.add(key);
  }
  return [...selected].map(key => names.get(key)!);
}
