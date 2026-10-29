import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { InstrumentPatternSetup, TechnicalOperand } from '../../data/instrumentPatterns';
import { playbookConditions, validatePlaybookConditions } from '../../backtest/playbookConditions';
import { IND_DEFAULT_PERIOD, type Operand } from '../../backtest/types';
import { operand } from './technicalPatternRules';

export const PLAYBOOK_CONDITIONS_PATTERN = '__playbook_entry_conditions__';

export function playbookConditionPattern(playbook: JournalPlaybook): InstrumentPatternSetup | null {
  const conditions = playbookConditions(playbook).map(condition => ({
    ...condition,
    left: normalize(condition.left),
    right: normalize(condition.right),
  }));
  if (!conditions.length || validatePlaybookConditions(conditions)) return null;
  const convert = (side: Operand): TechnicalOperand => {
    if (side.kind === 'value') return operand('number', side.value);
    if (side.kind === 'price') return operand(side.field);
    return { ...operand(side.ind.type), period: side.ind.period ?? 14, session: side.ind.session ?? 'asia' };
  };
  return {
    id: PLAYBOOK_CONDITIONS_PATTERN, name: 'Playbook entry conditions', pattern: 'custom',
    direction: 'either', lookbackBars: 240, minFit: 100, minVolumeRatio: 0, minBreakoutAtr: 0,
    patternType: 'Playbook entry conditions', matchMode: 'all',
    technicalRules: conditions.map(condition => ({
      id: condition.id, left: convert(condition.left), right: convert(condition.right),
      operator: condition.op === 'gt' ? 'above' : condition.op === 'lt' ? 'below' : condition.op,
    })),
  };
}

function normalize(side: Operand): Operand {
  if (side.kind !== 'ind') return side;
  return { ...side, ind: { ...side.ind, period: side.ind.period ?? IND_DEFAULT_PERIOD[side.ind.type], session: side.ind.session ?? 'asia' } };
}
