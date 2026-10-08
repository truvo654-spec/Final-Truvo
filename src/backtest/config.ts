// Every configurable value of the Backtesting module lives here.

/** Automated (AI) backtests included per month, by member level. Levels above the table get the last value. */
export const PLAN_RUN_LIMITS: Record<number, number> = { 1: 3, 2: 5, 3: 10, 4: 30 };
export const runLimitFor = (tierLevel: number): number => {
  const keys = Object.keys(PLAN_RUN_LIMITS).map(Number).sort((a, b) => a - b);
  let limit = PLAN_RUN_LIMITS[keys[0]];
  keys.forEach((k) => { if (tierLevel >= k) limit = PLAN_RUN_LIMITS[k]; });
  return limit;
};

/** Syde Credits spent for one extra automated run once the monthly allowance is used. */
export const EXTRA_RUN_CREDITS = 15;

/** Points awarded (once per replay session / saved run). */
export const POINTS = { replaySession: 10, savedBacktest: 5 };

/** Robustness checks. */
export const OOS_SPLIT = 0.7;
export const WALK_FORWARD_PERIODS = 4;
export const MONTE_CARLO_RUNS = 1000;

/** Warnings. */
export const MIN_TRADES = 30;
export const MAX_RULES = 6;

/** A trade whose result is within ±this many R counts as breakeven. */
export const BREAKEVEN_R = 0.05;

/** Range covered by the mock market data. */
export const DATA_START = '2024-10-01';
export const DATA_END = '2026-10-07';

/** Fixed conversion used when the account currency is not USD (mock until live FX rates are connected). */
export const USD_PER: Record<'USD' | 'EUR' | 'GBP', number> = { USD: 1, EUR: 1.08, GBP: 1.27 };
