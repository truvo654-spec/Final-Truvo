import type { JournalEntry } from '../../types';
import type { JournalPlaybook, PlaybookScenario } from '../../data/journalPlaybooks';

export const matchesPlaybook = (entry: JournalEntry, book: Pick<JournalPlaybook, 'id' | 'name'>) =>
  entry.playbookId ? entry.playbookId === book.id : entry.strategy === book.name;

export const attributionSnapshot = (entry:JournalEntry) => ({
  at:new Date().toISOString(),strategy:entry.strategy,playbookId:entry.playbookId,playbookVersion:entry.playbookVersion,scenarioId:entry.scenarioId,
});

export const isActiveScenario = (scenario:Pick<PlaybookScenario,'status'|'validUntil'>,today=new Date().toISOString().slice(0,10)) =>
  scenario.status==='triggered' || (scenario.status==='watching' && scenario.validUntil>=today);

export const playbookVersion = (book: JournalPlaybook) => JSON.stringify({
  rules: book.rules, entry: book.entryTrigger, stop: book.stopRule, target: book.targetRule,
  recipe: book.technicalRecipeId, window: book.window, risk: book.riskPerTrade,
  maxTrades: book.maxTradesPerDay, avoid: book.avoid,
  symbols:book.symbols, markets:book.markets, style:book.style, thesis:book.thesis, benchmarkRR:book.benchmarkRR,
  pattern:book.instrumentPatternId, patterns:book.instrumentPatterns, timeframe:book.instrumentTimeframe,
  starterTemplateName:book.technicalRecipeId ? undefined : book.name,
});

export function scenarioProblem(scenario: Pick<PlaybookScenario, 'bias' | 'entry' | 'stop' | 'target'>): string | null {
  for (const field of ['entry', 'stop', 'target'] as const) {
    const value = scenario[field];
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) return `${field} must be a positive finite price.`;
  }
  if (scenario.entry === undefined) return null;
  const direction = scenario.bias === 'long' ? 1 : -1;
  if (scenario.stop !== undefined && direction * (scenario.entry - scenario.stop) <= 0) return `Stop must be ${direction === 1 ? 'below' : 'above'} entry.`;
  if (scenario.target !== undefined && direction * (scenario.target - scenario.entry) <= 0) return `Target must be ${direction === 1 ? 'above' : 'below'} entry.`;
  return null;
}

export function scenarioRR(scenario: Pick<PlaybookScenario, 'bias' | 'entry' | 'stop' | 'target'>) {
  return scenarioProblem(scenario) || scenario.entry === undefined || scenario.stop === undefined || scenario.target === undefined
    ? null : Math.abs(scenario.target - scenario.entry) / Math.abs(scenario.entry - scenario.stop);
}

export const setupCheckKey = (book: JournalPlaybook, scenarioId?: string) =>
  `${book.id}:${scenarioId || 'general'}:${playbookVersion(book)}`;
