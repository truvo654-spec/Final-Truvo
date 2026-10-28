import type { JournalEntry } from '../../types';

export const hasDisciplineEvidence = (entry: JournalEntry) => typeof entry.followedPlan === 'boolean' &&
  (entry.mistakesReviewed === true || (entry.mistakesReviewed === undefined && !!entry.emotionBefore && !!entry.emotionAfter && entry.rating != null));

export function computeDiscipline(entries: JournalEntry[], checklistLength: number) {
  entries = entries.filter(hasDisciplineEvidence);
  if (!entries.length) return null;
  const plan = entries.filter((e) => e.followedPlan).length / entries.length;
  const checklist = checklistLength
    ? entries.reduce((a, e) => a + Math.min(1, e.checklistDone.length / checklistLength), 0) / entries.length
    : 1;
  const clean = entries.filter((e) => e.mistakes.length === 0).length / entries.length;
  const score = Math.round((plan * 0.5 + checklist * 0.3 + clean * 0.2) * 100);
  const newestFirst = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let run = 0;
  for (const e of newestFirst) { if (e.followedPlan) run++; else break; }
  return { score, plan: Math.round(plan * 100), checklist: Math.round(checklist * 100), clean: Math.round(clean * 100), run };
}
