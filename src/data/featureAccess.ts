import { UNLOCK_DISCOUNT, UNLOCK_LEVELS_ABOVE, UNLOCK_ROUNDING } from './rewardRules';
import { RESEARCH_EXCEPTION_FEATURE } from './creditSpending';

/**
 * Who can reach each feature, and what a temporary unlock costs.
 *
 * From the Final Beta workbook, 20 Oct 2026, one entry per feature. Two
 * numbers decide access: the level that includes it, and the lowest level
 * allowed to buy it with Credits. A feature with no unlock level cannot be
 * bought at all, only reached by levelling up.
 *
 * The per-length prices are the workbook's own, not the formula's output,
 * because the workbook rounds some of them by hand. Where a length is absent
 * that length is not sold.
 */

export interface FeatureAccess {
  id: string;
  area: string;
  feature: string;
  /** The level that includes it at no cost. */
  includedFrom: number;
  /** The lowest level that may buy it, or null if it is never for sale. */
  unlockFrom: number | null;
  /** Credits a day at full price, before the level discount. */
  dailyPrice: number | null;
  oneUse: number | null;
  oneHour: number | null;
  oneDay: number | null;
  sevenDays: number | null;
}

export const FEATURE_ACCESS: FeatureAccess[] = [
  { id: 'IA01', area: 'Instrument Analysis', feature: 'Heatmap', includedFrom: 2, unlockFrom: 1, dailyPrice: 100, oneUse: 25, oneHour: 40, oneDay: 100, sevenDays: 450 },
  { id: 'IA02', area: 'Instrument Analysis', feature: 'Scatter plot', includedFrom: 3, unlockFrom: 2, dailyPrice: 120, oneUse: 25, oneHour: 40, oneDay: 95, sevenDays: 430 },
  { id: 'IA03', area: 'Instrument Analysis', feature: 'Correlation analytics', includedFrom: 3, unlockFrom: 2, dailyPrice: 180, oneUse: 35, oneHour: 60, oneDay: 145, sevenDays: 650 },
  { id: 'IA04', area: 'Instrument Analysis', feature: 'High-precision correlations', includedFrom: 4, unlockFrom: null, dailyPrice: 140, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA05', area: 'Instrument Analysis', feature: 'Cross-market volume widget', includedFrom: 3, unlockFrom: 2, dailyPrice: 100, oneUse: 20, oneHour: 30, oneDay: 80, sevenDays: 360 },
  { id: 'IA06', area: 'Instrument Analysis', feature: 'Market news and recap widget', includedFrom: 3, unlockFrom: 2, dailyPrice: 120, oneUse: 25, oneHour: 40, oneDay: 95, sevenDays: 430 },
  { id: 'IA07', area: 'Instrument Analysis', feature: 'Watchlist: 20 symbols', includedFrom: 2, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA08', area: 'Instrument Analysis', feature: 'Watchlist: unlimited', includedFrom: 3, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA09', area: 'Instrument detail', feature: 'Advanced chart', includedFrom: 2, unlockFrom: 1, dailyPrice: 120, oneUse: 30, oneHour: 50, oneDay: 120, sevenDays: 540 },
  { id: 'IA10', area: 'Instrument detail', feature: 'Historical data: 1 week', includedFrom: 2, unlockFrom: 1, dailyPrice: 120, oneUse: 30, oneHour: 50, oneDay: 120, sevenDays: 540 },
  { id: 'IA11', area: 'Instrument detail', feature: 'Historical data: 1-6 months', includedFrom: 3, unlockFrom: 2, dailyPrice: 120, oneUse: 25, oneHour: 40, oneDay: 95, sevenDays: 430 },
  { id: 'IA12', area: 'Instrument detail', feature: 'Historical data: 1 year to max', includedFrom: 4, unlockFrom: 3, dailyPrice: 120, oneUse: 15, oneHour: 25, oneDay: 60, sevenDays: 270 },
  { id: 'IA13', area: 'Instrument detail', feature: 'Chart interval: 1 week', includedFrom: 2, unlockFrom: 1, dailyPrice: 120, oneUse: 30, oneHour: 50, oneDay: 120, sevenDays: 540 },
  { id: 'IA14', area: 'Instrument detail', feature: 'Chart intervals: 1-30 min and 1 month', includedFrom: 3, unlockFrom: 2, dailyPrice: 120, oneUse: 25, oneHour: 40, oneDay: 95, sevenDays: 430 },
  { id: 'IA15', area: 'Instrument detail', feature: 'Chart intervals: all', includedFrom: 4, unlockFrom: null, dailyPrice: 120, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA16', area: 'Instrument detail', feature: 'Technical indicators: 7 shown', includedFrom: 2, unlockFrom: 1, dailyPrice: 120, oneUse: 30, oneHour: 50, oneDay: 120, sevenDays: 540 },
  { id: 'IA17', area: 'Instrument detail', feature: 'Technical indicators: all, editable', includedFrom: 3, unlockFrom: 2, dailyPrice: 120, oneUse: 25, oneHour: 40, oneDay: 95, sevenDays: 430 },
  { id: 'IA18', area: 'Instrument detail', feature: 'Indicator period editing only', includedFrom: 3, unlockFrom: null, dailyPrice: 30, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA19', area: 'Instrument detail', feature: 'Financial analysis', includedFrom: 3, unlockFrom: 2, dailyPrice: 180, oneUse: 35, oneHour: 60, oneDay: 145, sevenDays: 650 },
  { id: 'IA20', area: 'Instrument detail', feature: 'Seasonal performance', includedFrom: 3, unlockFrom: null, dailyPrice: 180, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA21', area: 'Instrument detail', feature: 'Weekly community vote: 1-month range', includedFrom: 2, unlockFrom: 1, dailyPrice: 30, oneUse: 10, oneHour: 10, oneDay: 30, sevenDays: 135 },
  { id: 'IA22', area: 'Instrument detail', feature: 'Market screener: advanced filters', includedFrom: 2, unlockFrom: 1, dailyPrice: 100, oneUse: 25, oneHour: 40, oneDay: 100, sevenDays: 450 },
  { id: 'IA23', area: 'Instrument detail', feature: 'Market screener: Pro', includedFrom: 3, unlockFrom: 2, dailyPrice: 120, oneUse: 25, oneHour: 40, oneDay: 95, sevenDays: 430 },
  { id: 'IA24', area: 'Instrument detail', feature: 'Market screener: Full', includedFrom: 4, unlockFrom: null, dailyPrice: 120, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA25', area: 'Instrument detail', feature: 'Saved screener presets', includedFrom: 2, unlockFrom: 1, dailyPrice: 60, oneUse: 15, oneHour: 25, oneDay: 60, sevenDays: 270 },
  { id: 'IA26', area: 'Instrument detail', feature: 'Data export: CSV', includedFrom: 3, unlockFrom: null, dailyPrice: 60, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA27', area: 'Instrument detail', feature: 'Data export: advanced / API', includedFrom: 4, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA28', area: 'Instrument detail', feature: 'Price alerts (advanced)', includedFrom: 2, unlockFrom: 1, dailyPrice: 140, oneUse: 35, oneHour: 55, oneDay: 140, sevenDays: 630 },
  { id: 'IA29', area: 'Instrument detail', feature: 'Broker comparison report', includedFrom: 2, unlockFrom: 1, dailyPrice: 100, oneUse: 25, oneHour: 40, oneDay: 100, sevenDays: 450 },
  { id: 'IA30', area: 'Instrument detail', feature: 'Trading calculator (advanced)', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA31', area: 'Instrument detail', feature: 'Signal precision', includedFrom: 3, unlockFrom: null, dailyPrice: 140, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA32', area: 'Instrument detail', feature: 'Event intelligence', includedFrom: 3, unlockFrom: null, dailyPrice: 120, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA33', area: 'Instrument detail', feature: 'Order flow', includedFrom: 4, unlockFrom: null, dailyPrice: 180, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA34', area: 'Instrument detail', feature: 'Institutional research news', includedFrom: 3, unlockFrom: 1, dailyPrice: 120, oneUse: 30, oneHour: 50, oneDay: 120, sevenDays: 540 },
  { id: 'IA35', area: 'Instrument detail', feature: 'Custom visualisation / dashboard', includedFrom: 4, unlockFrom: null, dailyPrice: 120, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'IA36', area: 'Instrument detail', feature: 'Advanced Risk Analytics', includedFrom: 4, unlockFrom: 3, dailyPrice: 180, oneUse: 25, oneHour: 35, oneDay: 90, sevenDays: 405 },
  { id: 'TJ01', area: 'Trading Journal', feature: 'Journal core: Overview, Trade Log, Insights, import, review', includedFrom: 2, unlockFrom: 1, dailyPrice: 140, oneUse: 35, oneHour: 55, oneDay: 140, sevenDays: 630 },
  { id: 'TJ02', area: 'Trading Journal', feature: 'Advanced insights (emotion and mistake patterns)', includedFrom: 3, unlockFrom: null, dailyPrice: 140, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'TJ03', area: 'Trading Journal', feature: 'Playbook (create and manage strategies)', includedFrom: 3, unlockFrom: null, dailyPrice: 180, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'TJ04', area: 'Trading Journal', feature: 'Journal backtest and replay', includedFrom: 3, unlockFrom: null, dailyPrice: 180, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'TJ05', area: 'Trading Journal', feature: 'Advanced AI Coach scenarios', includedFrom: 4, unlockFrom: null, dailyPrice: 180, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'EC01', area: 'Economic Calendar', feature: 'Calendar AI assistant', includedFrom: 3, unlockFrom: null, dailyPrice: 100, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'EC02', area: 'Economic Calendar', feature: 'More than 3 event alerts', includedFrom: 3, unlockFrom: null, dailyPrice: 60, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'SG01', area: 'Trading Signals', feature: 'Signals up to 79% confidence', includedFrom: 2, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'SG02', area: 'Trading Signals', feature: 'Signals up to 89% confidence', includedFrom: 3, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'SG03', area: 'Trading Signals', feature: 'Signals 90%+ confidence', includedFrom: 4, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'NW01', area: 'News', feature: 'Intermediate articles', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'NW02', area: 'News', feature: 'Premium articles', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'NW03', area: 'News', feature: 'Market News: Research (institutional and analyst research reports)', includedFrom: 3, unlockFrom: 1, dailyPrice: 120, oneUse: 30, oneHour: 50, oneDay: 120, sevenDays: 540 },
  { id: 'ED01', area: 'Education', feature: 'Premium lessons', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'ED02', area: 'Education', feature: 'Advanced courses', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'ED03', area: 'Education', feature: 'Elite courses', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'ED04', area: 'Education', feature: 'Live classes and certificates', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CA01', area: 'Calculators', feature: 'Forex calculator: spread, pip, margin, rebate', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CA02', area: 'Calculators', feature: 'Trade planning calculator: position size, stop-out, SL/TP', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CA03', area: 'Calculators', feature: 'Technical calculator: Fibonacci, pivot points', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CA04', area: 'Calculators', feature: 'Performance calculator: P&L, drawdown, compound', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CV01', area: 'Converters', feature: 'Trading timezone converter', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CV02', area: 'Converters', feature: 'Currency converter', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'AL01', area: 'Alerts', feature: '25 active alerts', includedFrom: 3, unlockFrom: null, dailyPrice: 60, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'AL02', area: 'Alerts', feature: 'Unlimited alerts', includedFrom: 4, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'PF01', area: 'Portfolio', feature: '90-day history', includedFrom: 3, unlockFrom: null, dailyPrice: 60, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'PF02', area: 'Portfolio', feature: 'Full history', includedFrom: 4, unlockFrom: null, dailyPrice: 60, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CM02', area: 'Community', feature: 'Host a community live session', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'PR01', area: 'Promotions', feature: 'Offers carrying a minimum level', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CA05', area: 'Calculators', feature: 'Saved-result slots', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'NW04', area: 'News', feature: 'Expert summaries, topic follows, comments', includedFrom: 1, unlockFrom: null, dailyPrice: null, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
  { id: 'CM01', area: 'Community', feature: 'Premium community analytics', includedFrom: 3, unlockFrom: null, dailyPrice: 100, oneUse: null, oneHour: null, oneDay: null, sevenDays: null },
];

/** Can this level reach the feature without paying? */
export function isIncluded(id: string, level: number): boolean {
  const f = FEATURE_ACCESS.find((x) => x.id === id);
  return f ? level >= f.includedFrom : true;
}

/**
 * May this level buy it?
 *
 * Two rules at once: the feature has to be for sale at all, and the member has
 * to be within one level of it, so a Rookie can try a Climber tool but not an
 * Elite one.
 */
export function canUnlock(id: string, level: number): boolean {
  const f = FEATURE_ACCESS.find((x) => x.id === id);
  if (!f || f.unlockFrom === null) return false;
  if (level >= f.includedFrom) return false;
  if (level < f.unlockFrom) return false;

  // Market News Research is the agreed exception: a LV1 member may reach it
  // two levels up, where everything else stops at one.
  const reach = f.id === RESEARCH_EXCEPTION_FEATURE ? 2 : UNLOCK_LEVELS_ABOVE;
  return f.includedFrom - level <= reach;
}

/** What this member pays for this length, after their level's discount. */
export function priceFor(id: string, length: 'oneUse' | 'oneHour' | 'oneDay' | 'sevenDays', level: number): number | null {
  const f = FEATURE_ACCESS.find((x) => x.id === id);
  if (!f) return null;
  const listed = f[length];
  if (listed === null) return null;
  const share = UNLOCK_DISCOUNT[Math.min(Math.max(level, 1), 4) - 1];
  return Math.round((listed * share) / UNLOCK_ROUNDING) * UNLOCK_ROUNDING;
}

export function featureById(id: string): FeatureAccess | undefined {
  return FEATURE_ACCESS.find((f) => f.id === id);
}
