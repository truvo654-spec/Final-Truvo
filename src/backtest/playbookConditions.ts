import type { JournalPlaybook } from '../data/journalPlaybooks';
import { getTechnicalStrategyRecipe } from './technicalStrategies';
import { IND_DEFAULT_PERIOD, type Condition, type Operand } from './types';
import { IND_LABEL } from './rules';

export const MAX_PLAYBOOK_CONDITIONS = 12;
export const MAX_CONDITION_PERIOD = 238;

export function playbookConditions(playbook: JournalPlaybook): Condition[] {
  const conditions = playbook.technicalEntryConditions ?? getTechnicalStrategyRecipe(playbook.technicalRecipeId)?.rules.entry ?? [];
  const copy = (side: Operand): Operand => side.kind === 'ind'
    ? { ...side, ind: { ...side.ind, period: side.ind.period ?? IND_DEFAULT_PERIOD[side.ind.type], session: side.ind.session ?? 'asia' } }
    : { ...side };
  return conditions.map(condition => ({
    ...condition,
    left: copy(condition.left),
    right: copy(condition.right),
  }));
}

function validOperand(value: Operand): boolean {
  if (!value || typeof value !== 'object') return false;
  if (value.kind === 'value') return Number.isFinite(value.value);
  if (value.kind === 'price') return ['open', 'high', 'low', 'close'].includes(value.field);
  if (value.kind !== 'ind' || !value.ind || !Object.hasOwn(IND_LABEL, value.ind.type)) return false;
  if (Object.hasOwn(IND_DEFAULT_PERIOD, value.ind.type) && (!Number.isInteger(value.ind.period) || value.ind.period! < 2 || value.ind.period! > MAX_CONDITION_PERIOD)) return false;
  if (['SESSION_HIGH', 'SESSION_LOW'].includes(value.ind.type) && !['asia', 'london', 'ny'].includes(value.ind.session || '')) return false;
  return true;
}

export function validatePlaybookConditions(conditions: Condition[]): string | null {
  if (!conditions.length || conditions.length > MAX_PLAYBOOK_CONDITIONS) return `Add between 1 and ${MAX_PLAYBOOK_CONDITIONS} technical conditions, or restore the default.`;
  const ids = new Set<string>();
  for (const [index, condition] of conditions.entries()) {
    if (!condition.id || ids.has(condition.id)) return `Condition ${index + 1} needs a unique ID.`;
    ids.add(condition.id);
    if (!['gt', 'lt', 'crossAbove', 'crossBelow'].includes(condition.op) || !validOperand(condition.left) || !validOperand(condition.right)) return `Condition ${index + 1} needs valid tools, numbers and periods (2–${MAX_CONDITION_PERIOD}).`;
  }
  return null;
}
