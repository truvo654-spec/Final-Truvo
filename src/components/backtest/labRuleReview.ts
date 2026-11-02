import type { Condition } from '../../backtest/types';

export interface LabRuleReview { ids: string[]; index: number; drafts: Record<string, Condition[]> }
/** Keep the original review order, including playbooks already applied during this review. */
export function startRuleReview(ids: string[]): LabRuleReview | null {
  const unique = [...new Set(ids)];
  return unique.length ? { ids: unique, index: 0, drafts: {} } : null;
}
export function moveRuleReview(review: LabRuleReview, entries: Condition[], direction: -1 | 1): LabRuleReview | null {
  const index = Math.max(0, review.index + direction);
  if (index >= review.ids.length) return null;
  return { ...review, index, drafts: { ...review.drafts, [review.ids[review.index]]: structuredClone(entries) } };
}
