/**
 * Social quests: what each one pays, and how often it can pay.
 *
 * From the Final Beta workbook, 20 Oct 2026. Rewards here are the already
 * halved platform-activity figures; the sixty-Credit daily social cap and the
 * two-hundred per task cap sit on top, enforced by the ledger.
 *
 * The guardrails are part of the rule, not decoration: liking your own posts,
 * like-for-like rings and duplicate accounts earn nothing and can be reversed,
 * an external share pays only when a real person visits, and shared content
 * cannot promise profits or present a signal as guaranteed.
 */

export type QuestWhere = 'Internal' | 'External' | 'Both';
export type QuestPeriod = 'day' | 'week';

export interface SocialQuest {
  id: string;
  /** Effort grade, D1 the lightest. */
  difficulty: 'D1' | 'D2' | 'D3' | 'D4';
  quest: string;
  where: QuestWhere;
  /** Credits before the decay and the caps. */
  reward: number;
  /** How many times it can pay in the period. */
  limit: number;
  period: QuestPeriod;
  /** What the server has to see before it pays. Browser timers never count. */
  verifiedBy: string;
  /** Anything paid on top of the base reward. */
  extra?: string;
}

export const SOCIAL_QUESTS: SocialQuest[] = [
  { id: 'Q01', difficulty: 'D1', quest: 'Like or react to 5 community posts', where: 'Internal', reward: 3, limit: 1, period: 'day', verifiedBy: 'Five different posts, not your own' },
  { id: 'Q02', difficulty: 'D1', quest: 'Watch a member video for 60+ seconds', where: 'Internal', reward: 3, limit: 3, period: 'day', verifiedBy: 'Watch time is tracked' },
  { id: 'Q03', difficulty: 'D1', quest: 'Follow a new creator', where: 'Internal', reward: 3, limit: 3, period: 'week', verifiedBy: 'Reversed if unfollowed within 7 days' },
  { id: 'Q04', difficulty: 'D2', quest: 'Share a post inside the platform with your own note', where: 'Internal', reward: 8, limit: 2, period: 'day', verifiedBy: 'Note of 30+ characters' },
  { id: 'Q05', difficulty: 'D2', quest: 'Share MarketSyde content to external media', where: 'External', reward: 10, limit: 1, period: 'day', verifiedBy: 'Tracked link gets at least one real visit' },
  { id: 'Q06', difficulty: 'D2', quest: 'Watch a full educational video and answer a short quiz', where: 'Internal', reward: 10, limit: 1, period: 'day', verifiedBy: 'Quiz passed' },
  { id: 'Q07', difficulty: 'D2', quest: 'Write a quality comment', where: 'Internal', reward: 5, limit: 2, period: 'day', verifiedBy: 'Passes moderation' },
  { id: 'Q08', difficulty: 'D3', quest: 'Publish an approved market post', where: 'Internal', reward: 20, limit: 2, period: 'week', verifiedBy: 'Moderator approval' },
  { id: 'Q09', difficulty: 'D3', quest: 'Post a short video or chart analysis', where: 'Internal', reward: 25, limit: 2, period: 'week', verifiedBy: 'Moderator approval' },
  { id: 'Q10', difficulty: 'D3', quest: 'Join a live session or voice room for 15+ minutes', where: 'Internal', reward: 15, limit: 2, period: 'week', verifiedBy: 'Attendance time tracked' },
  { id: 'Q11', difficulty: 'D3', quest: 'External share that brings a new visitor who registers', where: 'External', reward: 25, limit: 3, period: 'week', verifiedBy: 'Sign-up comes through your link' },
  { id: 'Q12', difficulty: 'D4', quest: 'Complete the weekly social set: likes on 5 days, 3 shares, 1 approved post', where: 'Both', reward: 50, limit: 1, period: 'week', verifiedBy: 'All parts verified', extra: 'Streak bonus +13 C per week in a row, up to +50 C' },
  { id: 'Q13', difficulty: 'D4', quest: 'Earn "Top post of the week" (50+ genuine reactions)', where: 'Internal', reward: 40, limit: 1, period: 'week', verifiedBy: 'Reactions checked for rings and fake accounts', extra: '"Top Creator" badge' },
  { id: 'Q14', difficulty: 'D4', quest: 'Host an approved community live session', where: 'Internal', reward: 50, limit: 1, period: 'week', verifiedBy: 'Approved creators only', extra: '+0.5 C per attendee staying 15+ minutes, up to +50 C' },
];

/** The weekly set's streak bonus, which tops out at fifty. */
export const STREAK_BONUS_PER_WEEK = 13;
export const STREAK_BONUS_MAX = 50;
/** Weeks in a row that earn a D6 milestone instead of Credits. */
export const STREAK_WEEKS_FOR_MILESTONE = 4;

/** A hosted session pays per attendee who stays, rounded to whole Credits. */
export const LIVE_BONUS_PER_ATTENDEE = 0.5;
export const LIVE_BONUS_MAX = 50;

export function liveSessionBonus(attendeesStaying: number): number {
  return Math.min(LIVE_BONUS_MAX, Math.round(attendeesStaying * LIVE_BONUS_PER_ATTENDEE));
}

export function questById(id: string): SocialQuest | undefined {
  return SOCIAL_QUESTS.find((q) => q.id === id);
}
