export type RuleComparison = 'atMost' | 'atLeast' | 'exactly';

export interface NumericTradingRule {
  kind: 'numeric';
  name: string;
  comparison: RuleComparison;
  value: number;
  unit: string;
}

export type CustomTradingRule = string | NumericTradingRule;

export const RULE_COMPARISON_LABELS: Record<RuleComparison, string> = {
  atMost: 'At most',
  atLeast: 'At least',
  exactly: 'Exactly',
};

export function isCustomTradingRule(rule: unknown): rule is CustomTradingRule {
  if (typeof rule === 'string') return true;
  if (!rule || typeof rule !== 'object') return false;
  const candidate = rule as Record<string, unknown>;
  return candidate.kind === 'numeric'
    && typeof candidate.name === 'string' && candidate.name.trim().length > 0
    && typeof candidate.comparison === 'string' && Object.hasOwn(RULE_COMPARISON_LABELS, candidate.comparison)
    && typeof candidate.value === 'number' && Number.isFinite(candidate.value)
    && typeof candidate.unit === 'string';
}

export function describeCustomTradingRule(rule: CustomTradingRule): string {
  return typeof rule === 'string' ? rule : `${rule.name}: ${RULE_COMPARISON_LABELS[rule.comparison]} ${rule.value}${rule.unit ? ` ${rule.unit}` : ''}`;
}

export interface JournalRules {
  maxRisk: number;
  maxDailyLoss: number;
  maxTrades: number;
  stopAfterLosses: number;
}

export interface GlobalTradingRules extends JournalRules {
  customRules: CustomTradingRule[];
}

export const DEFAULT_JOURNAL_RULES: JournalRules = {
  maxRisk: 1,
  maxDailyLoss: 3,
  maxTrades: 3,
  stopAfterLosses: 2,
};

export interface PlaybookCustomTradingRule {
  id: string;
  rule: CustomTradingRule;
  enabled: boolean;
}

export interface PlaybookTradingRules {
  values: JournalRules;
  enabled: Record<keyof JournalRules, boolean>;
  customRules: PlaybookCustomTradingRule[];
}

function isPlaybookCustomTradingRule(rule: unknown): rule is PlaybookCustomTradingRule {
  if (!rule || typeof rule !== 'object') return false;
  const candidate = rule as Record<string, unknown>;
  return typeof candidate.id === 'string' && candidate.id.length > 0
    && typeof candidate.enabled === 'boolean'
    && !(typeof candidate.rule === 'string' && !candidate.rule.trim())
    && isCustomTradingRule(candidate.rule);
}

export function isPlaybookTradingRules(value: unknown): value is PlaybookTradingRules {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const values = candidate.values;
  const enabled = candidate.enabled;
  const customRules = candidate.customRules;
  if (!values || typeof values !== 'object' || !enabled || typeof enabled !== 'object' || !Array.isArray(customRules)) return false;
  const limits = values as Record<string, unknown>;
  const selections = enabled as Record<string, unknown>;
  const keys: (keyof JournalRules)[] = ['maxRisk', 'maxDailyLoss', 'maxTrades', 'stopAfterLosses'];
  return keys.every(key => {
    const limit = limits[key];
    return typeof limit === 'number' && Number.isFinite(limit) && limit >= 0 && typeof selections[key] === 'boolean';
  }) && customRules.every(isPlaybookCustomTradingRule);
}

export function createPlaybookTradingRules(
  defaults: GlobalTradingRules,
  legacy?: { riskPerTrade?: number; maxTradesPerDay?: number },
): PlaybookTradingRules {
  const validLimit = (value: number, fallback: number) => Number.isFinite(value) && value >= 0 ? value : fallback;
  return {
    values: {
      maxRisk: validLimit(legacy?.riskPerTrade ?? defaults.maxRisk, DEFAULT_JOURNAL_RULES.maxRisk),
      maxDailyLoss: validLimit(defaults.maxDailyLoss, DEFAULT_JOURNAL_RULES.maxDailyLoss),
      maxTrades: validLimit(legacy?.maxTradesPerDay ?? defaults.maxTrades, DEFAULT_JOURNAL_RULES.maxTrades),
      stopAfterLosses: validLimit(defaults.stopAfterLosses, DEFAULT_JOURNAL_RULES.stopAfterLosses),
    },
    enabled: { maxRisk: true, maxDailyLoss: true, maxTrades: true, stopAfterLosses: true },
    customRules: defaults.customRules.filter(rule => typeof rule !== 'string' || !!rule.trim()).map((rule, index) => ({ id: `saved-rule-${index + 1}`, rule, enabled: true })),
  };
}

export function resolvePlaybookTradingRules(
  playbook: { tradingRules?: PlaybookTradingRules; riskPerTrade?: number; maxTradesPerDay?: number },
  defaults: GlobalTradingRules,
): PlaybookTradingRules {
  return isPlaybookTradingRules(playbook.tradingRules) ? playbook.tradingRules : createPlaybookTradingRules(defaults, playbook);
}

export function updatePlaybookTradingRulesFromDefaults(
  existing: PlaybookTradingRules,
  previousDefaults: GlobalTradingRules,
  nextDefaults: GlobalTradingRules,
): PlaybookTradingRules {
  const sharedRules = existing.customRules.filter(rule => rule.id.startsWith('saved-rule-'));
  const localRules = existing.customRules.filter(rule => !rule.id.startsWith('saved-rule-'));
  const nextSharedRules = nextDefaults.customRules.map((rule, index) => {
    const previousIndex = previousDefaults.customRules.findIndex(previous => JSON.stringify(previous) === JSON.stringify(rule));
    const enabled = (previousIndex >= 0 ? sharedRules[previousIndex] : sharedRules[index])?.enabled ?? true;
    return { id: `saved-rule-${index + 1}`, rule, enabled };
  });
  return {
    values: {
      maxRisk: nextDefaults.maxRisk,
      maxDailyLoss: nextDefaults.maxDailyLoss,
      maxTrades: nextDefaults.maxTrades,
      stopAfterLosses: nextDefaults.stopAfterLosses,
    },
    enabled: existing.enabled,
    customRules: [...nextSharedRules, ...localRules],
  };
}
