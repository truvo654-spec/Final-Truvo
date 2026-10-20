/**
 * Social quests moved into the mission catalogue.
 *
 * v2.9 folded Q01 to Q14 into Credit Missions, where they appear with Type
 * "Social quest", so there is no separate list any more. What is left here is
 * the handful of social numbers the workbook keeps in Settings, and a pointer
 * for anything that still reaches for the old export.
 */

import { CREDIT_MISSIONS } from './creditMissions';

/** The quests, read from the one catalogue rather than kept twice. */
export const SOCIAL_QUESTS = CREDIT_MISSIONS.filter((m) => m.type === 'Social quest');

/** The weekly set's streak bonus, which tops the set out at a hundred. */
export const STREAK_BONUS_PER_WEEK = 13;
export const STREAK_BONUS_MAX = 50;
/** Weeks in a row that earn a D6 milestone instead of Credits. */
export const STREAK_WEEKS_FOR_MILESTONE = 4;

/** A hosted session pays per attendee who stays, rounded once. */
export const LIVE_BONUS_PER_ATTENDEE = 0.5;
export const LIVE_BONUS_MAX = 50;

export function liveSessionBonus(attendeesStaying: number): number {
  return Math.min(LIVE_BONUS_MAX, Math.round(attendeesStaying * LIVE_BONUS_PER_ATTENDEE));
}

export function questById(id: string) {
  return SOCIAL_QUESTS.find((q) => q.id === id);
}
