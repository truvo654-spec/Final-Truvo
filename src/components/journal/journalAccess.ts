import type { UnlockDurationOption, UnlockableTool } from '../analysis/ToolCreditUnlockModal';

export type JournalAccessFeature =
  | 'journalCore'
  | 'advancedInsights'
  | 'playbook'
  | 'backtest'
  | 'advancedCoach';

export type JournalEntitlements = Partial<Record<JournalAccessFeature, string>>;

// These are the 80th-percentile and highest daily prices in Instrument Analysis.
export const JOURNAL_ACCESS_FEATURES: Record<JournalAccessFeature, UnlockableTool> = {
  journalCore: {
    id: 'journalCore',
    title: 'Trading Journal core',
    shortDescription: 'Overview, Trade Log and standard journal analysis.',
    categoryName: 'Trading Journal',
    dailyPrice: 140,
    minLevel: 2,
  },
  advancedInsights: {
    id: 'advancedInsights',
    title: 'Advanced journal insights',
    shortDescription: 'Emotion and mistake-pattern analysis across your trades.',
    categoryName: 'Trading Journal',
    dailyPrice: 140,
    minLevel: 3,
  },
  playbook: {
    id: 'playbook',
    title: 'Trading Playbook',
    shortDescription: 'Create, manage and review structured trading strategies.',
    categoryName: 'Trading Journal',
    dailyPrice: 180,
    minLevel: 3,
  },
  backtest: {
    id: 'backtest',
    title: 'Backtest and replay',
    shortDescription: 'Test playbooks, compare scenarios and replay trades.',
    categoryName: 'Trading Journal',
    dailyPrice: 180,
    minLevel: 3,
  },
  advancedCoach: {
    id: 'advancedCoach',
    title: 'Advanced AI Coach scenarios',
    shortDescription: 'Scenario lab, strategy alternatives and advanced experiments.',
    categoryName: 'Trading Journal',
    dailyPrice: 180,
    minLevel: 4,
  },
};

const UNLOCK_DURATION_MS: Record<UnlockDurationOption, number> = {
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export function isJournalAccessFeature(value: string): value is JournalAccessFeature {
  return Object.prototype.hasOwnProperty.call(JOURNAL_ACCESS_FEATURES, value);
}

export function hasJournalFeatureAccess(
  feature: JournalAccessFeature,
  level: number,
  entitlements: JournalEntitlements,
  now = Date.now()
): boolean {
  if (level >= (JOURNAL_ACCESS_FEATURES[feature].minLevel ?? 1)) return true;
  const expiry = entitlements[feature];
  return typeof expiry === 'string' && new Date(expiry).getTime() > now;
}

export function journalUnlockExpiry(duration: UnlockDurationOption, now = Date.now()): string {
  return new Date(now + UNLOCK_DURATION_MS[duration]).toISOString();
}
