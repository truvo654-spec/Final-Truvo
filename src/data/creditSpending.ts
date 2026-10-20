import { CREDITS_PER_POINT, CONVERSION_CAP_POINTS, CONVERSION_WINDOW_DAYS } from './rewardRules';

/**
 * What Syde Credits buy, and what they never buy.
 *
 * From the Final Beta workbook, 20 Oct 2026. The last entry matters as much as
 * the rest: Credits cannot buy cash, trade execution, higher leverage or a
 * bigger position. They buy time with a tool, not an advantage in the market.
 */

export interface SpendingRule {
  id: string;
  whatIsBought: string;
  price: string;
  howLong: string;
  /** How the spend behaves, including which Credits go first. */
  spendRule: string;
}

export const SPENDING_RULES: SpendingRule[] = [
  { id: 'S01', whatIsBought: 'A temporary unlock of a next-level tool', price: 'Daily price times the length share times the level discount', howLong: 'One use, one hour, one day or seven days; then the tool returns to the member\u2019s level and saved work becomes read-only', spendRule: 'Oldest Credits first. Only one level above the member\u2019s own.' },
  { id: 'S02', whatIsBought: 'Longer chart intervals or history', price: '120 Credits a day at LV1, standard formula', howLong: 'The same lengths as S01', spendRule: 'Spends from the account balance.' },
  { id: 'S03', whatIsBought: 'Technical indicator period editing only', price: '30 Credits a day at LV1', howLong: 'The same lengths as S01', spendRule: 'Standard.' },
  { id: 'S04', whatIsBought: 'High-precision correlations', price: '140 Credits a day at LV1', howLong: 'The same lengths as S01', spendRule: 'A separate unlock from correlation analytics at 180.' },
  { id: 'S05', whatIsBought: 'One signal above your level', price: 'Not for sale', howLong: '\u2014', spendRule: 'Signals are not sold; the level alone sets the confidence band.' },
  { id: 'S06', whatIsBought: 'Points, through conversion', price: `${CREDITS_PER_POINT} Credits for 1 Point`, howLong: 'The Point counts towards the level for ninety days', spendRule: `Exactly Points times ${CREDITS_PER_POINT}, oldest Credits first. At most ${CONVERSION_CAP_POINTS} Points per ${CONVERSION_WINDOW_DAYS} days. One way.` },
  { id: 'S07', whatIsBought: 'An extra automated backtest run past the monthly allowance', price: '15 Credits each', howLong: 'One run', spendRule: 'Charged only once the allowance is spent, and logged.' },
  { id: 'S08', whatIsBought: 'What Credits can never buy', price: 'Cash, trade execution, higher leverage or bigger positions', howLong: '\u2014', spendRule: 'Credits buy time with a tool, never an advantage in the market.' },
  { id: 'S09', whatIsBought: 'Market News Research for LV1 and LV2', price: '120 Credits a day at LV1, 95 at LV2', howLong: 'One report, one hour, one day or seven days', spendRule: 'Allowed two levels up for LV1: an agreed exception to the one-level-up rule.' },
];

/** Automated backtest runs included each month, by level. */
export const BACKTEST_RUNS_PER_MONTH: Record<number, number> = {
  1: 3,
  2: 5,
  3: 10,
  4: 30,
};

/** What one extra run costs once the allowance is spent. No level discount. */
export const EXTRA_BACKTEST_RUN = 15;

/**
 * What a run costs this member right now.
 *
 * Inside the allowance a run is free; past it every run is the same fifteen
 * Credits whatever the level, because this is usage rather than access.
 */
export function backtestRunCost(level: number, runsUsedThisMonth: number): number {
  const included = BACKTEST_RUNS_PER_MONTH[Math.min(Math.max(level, 1), 4)] ?? 3;
  return runsUsedThisMonth < included ? 0 : EXTRA_BACKTEST_RUN;
}

/** Runs left in the allowance this month. */
export function backtestRunsLeft(level: number, runsUsedThisMonth: number): number {
  const included = BACKTEST_RUNS_PER_MONTH[Math.min(Math.max(level, 1), 4)] ?? 3;
  return Math.max(0, included - runsUsedThisMonth);
}

/** Research is the one tool a LV1 member may reach two levels up. */
export const RESEARCH_EXCEPTION_FEATURE = 'NW03';

export function spendingRule(id: string): SpendingRule | undefined {
  return SPENDING_RULES.find((r) => r.id === id);
}
