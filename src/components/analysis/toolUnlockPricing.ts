export type UnlockDurationOption = '1d' | '7d' | '30d';

export const TOOL_UNLOCK_DURATIONS: Record<UnlockDurationOption, { label: string; ms: number; multiplier: number }> = {
  '1d': { label: '1 day', ms: 24 * 60 * 60 * 1000, multiplier: 1 },
  '7d': { label: '7 days', ms: 7 * 24 * 60 * 60 * 1000, multiplier: 5 },
  '30d': { label: '30 days', ms: 30 * 24 * 60 * 60 * 1000, multiplier: 15.5 },
};

export function toolUnlockCost(dailyPrice: number, level: number, duration: UnlockDurationOption): number {
  const discount = level >= 4 ? 0 : level === 3 ? 0.5 : level === 2 ? 0.8 : 1;
  return Math.round(dailyPrice * TOOL_UNLOCK_DURATIONS[duration].multiplier * discount);
}
