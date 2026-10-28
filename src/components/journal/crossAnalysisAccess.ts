import type { UserProfile } from '../../types';
import type { UnlockableTool } from '../analysis/ToolCreditUnlockModal';
import { TOOL_UNLOCK_DURATIONS, toolUnlockCost, type UnlockDurationOption } from '../analysis/toolUnlockPricing';

export const CROSS_ANALYSIS_TOOL: UnlockableTool = {
  id: 'journal-cross-analysis',
  title: 'Cross analysis matrix',
  shortDescription: 'Compare closed trade results across dimensions and time.',
  dailyPrice: 120,
  minLevel: 4,
};

export function hasCrossAnalysisAccess(user: UserProfile, isLoggedIn: boolean, now = Date.now()): boolean {
  return isLoggedIn && (user.tierLevel >= 4 ||
    (typeof user.journalCrossAnalysisUntil === 'number' && Number.isFinite(user.journalCrossAnalysisUntil) && user.journalCrossAnalysisUntil > now));
}

export function crossAnalysisPurchase(user: UserProfile, duration: UnlockDurationOption, now = Date.now()):
  | { ok: true; user: UserProfile; cost: number }
  | { ok: false; reason: 'included' | 'active' | 'insufficient' | 'invalid' } {
  if (!Object.hasOwn(TOOL_UNLOCK_DURATIONS, duration)) return { ok: false, reason: 'invalid' };
  if (user.tierLevel >= 4) return { ok: false, reason: 'included' };
  if (hasCrossAnalysisAccess(user, true, now)) return { ok: false, reason: 'active' };
  const cost = toolUnlockCost(CROSS_ANALYSIS_TOOL.dailyPrice, user.tierLevel, duration);
  if (!Number.isFinite(user.sydeCredits) || user.sydeCredits < cost) return { ok: false, reason: 'insufficient' };
  return {
    ok: true,
    cost,
    user: { ...user, sydeCredits: user.sydeCredits - cost, journalCrossAnalysisUntil: now + TOOL_UNLOCK_DURATIONS[duration].ms },
  };
}
