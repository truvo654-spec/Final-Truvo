import type { JournalEntry } from '../types';
import { runWhatIf, toMs, type WhatIfRule } from './whatif';
import type { JournalPlaybook } from '../data/journalPlaybooks';
import { currencyOf } from '../components/journal/journalMath';

/** Benchmarks are live views of the journal, including history imported through the journal. */
export function selectWhatIfBenchmark(selection: JournalEntry[], all: JournalEntry[], benchmark: string, currency: string, playbookName?: string) {
  const history = all.filter(e => currencyOf(e) === currency);
  if (benchmark === 'history') return history;
  if (benchmark === 'playbook') return playbookName ? history.filter(e => e.strategy === playbookName) : [];
  if (benchmark.startsWith('account:')) return history.filter(e => (e.accountId || 'legacy-demo') === benchmark.slice(8));
  return selection.filter(e => currencyOf(e) === currency);
}

export function playbookWhatIfSetup(playbook: JournalPlaybook, scenarioId = '') {
  const idea = playbook.scenarios?.find(s => s.id === scenarioId);
  const priced = idea?.entry != null && idea.stop != null && idea.target != null &&
    [idea.entry, idea.stop, idea.target].every(Number.isFinite) &&
    (idea.bias === 'long' ? idea.stop < idea.entry && idea.target > idea.entry : idea.stop > idea.entry && idea.target < idea.entry);
  const target = priced ? Math.abs(idea!.target! - idea!.entry!) / Math.abs(idea!.entry! - idea!.stop!) : playbook.benchmarkRR;
  return { target: Math.max(0.1, Math.round(target * 100) / 100), symbols: idea ? [idea.symbol] : [...(playbook.symbols || [])],
    direction: idea ? idea.bias === 'long' ? 'BUY' : 'SELL' : 'all',
    start: playbook.window?.start ?? 0, end: playbook.window?.end ?? 24, sessionOnly: !!playbook.window,
    markets: [...playbook.markets], market: playbook.markets.length === 1 ? playbook.markets[0] : playbook.markets.length ? 'playbook' : 'all' };
}

/** A bounded, reproducible sweep over one parameter; never silently clips a range. */
export function parameterRules(rule: WhatIfRule, min: number, max: number, step: number): WhatIfRule[] {
  if (rule.kind === 'mistakes') {
    if (rule.tags.length > 12) throw new Error('Choose up to 12 tags to compare at a time.');
    return [rule, ...rule.tags.map(tag => ({ kind: 'mistakes' as const, tags: [tag] }))]
      .filter((item, i, all) => all.findIndex(x => JSON.stringify(x) === JSON.stringify(item)) === i);
  }
  if (![min, max, step].every(Number.isFinite) || min <= 0 || max < min || step <= 0) throw new Error('Use positive values with maximum ≥ minimum.');
  const count = Math.floor((max - min) / step + 1e-8) + 1;
  if (count > 12) throw new Error('Choose a larger step: compare up to 12 parameter values at a time.');
  const values = Array.from({ length: count }, (_, i) => Math.round((min + i * step) * 10000) / 10000);
  if (rule.kind === 'lossesPerDay' && values.some(x => !Number.isInteger(x))) throw new Error('Loss counts must be whole numbers.');
  if (rule.kind === 'stop' && max > 1) throw new Error('Tighter stops must be between 0 and 1R.');
  if (rule.kind === 'hours' && (max > 24 || values.some(x => !Number.isInteger(x)))) throw new Error('Session duration must be 1–24 whole hours.');
  const candidates = values.map((value): WhatIfRule => {
    switch (rule.kind) {
      case 'target': case 'breakeven': return { ...rule, r: value };
      case 'stop': return { ...rule, mult: value };
      case 'dailyLoss': return { ...rule, usd: value };
      case 'lossesPerDay': return { ...rule, n: value };
      case 'hours': return { ...rule, end: (rule.start + value) % 24 };
    }
  });
  return [rule, ...candidates].filter((item, i, all) => all.findIndex(x => JSON.stringify(x) === JSON.stringify(item)) === i);
}

export function splitWhatIfHistory(entries: JournalEntry[]) {
  const sorted = [...entries].sort((a, b) => toMs(a.entryTime, a.date) - toMs(b.entryTime, b.date));
  // Keep a UTC entry day intact so daily guardrails cannot leak across the split.
  const days = [...new Set(sorted.map(e => e.date))];
  const splitDay = days[Math.max(1, Math.floor(days.length * 0.7))];
  const cutoff = splitDay ? Date.parse(`${splitDay}T00:00:00Z`) : Infinity;
  const train = sorted.filter(e => (!splitDay || e.date < splitDay) && toMs(e.exitTime, e.date, 13) < cutoff);
  const validation = sorted.filter(e => splitDay && e.date >= splitDay);
  return { sorted, train, validation, crossingCount: sorted.length - train.length - validation.length };
}

export function compareParameters(entries: JournalEntry[], rules: WhatIfRule[]) {
  const { sorted, train, validation, crossingCount } = splitWhatIfHistory(entries);
  return rules.map(rule => ({
    id: JSON.stringify(rule), rule, output: runWhatIf(sorted, rule),
    training: runWhatIf(train, rule), validation: validation.length ? runWhatIf(validation, rule) : null,
    trainingCount: train.length, validationCount: validation.length,
    crossingCount,
  }));
}
