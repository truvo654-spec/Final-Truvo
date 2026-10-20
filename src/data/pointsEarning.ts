import { BOOSTS, CREDITS_PER_POINT, MILESTONE_POINTS, POINT_LIFE_DAYS, PV_PER_POINT } from './rewardRules';

/**
 * Every way Points are earned, and the ways that pay none.
 *
 * From the Final Beta workbook, 20 Oct 2026. The shape of it is the point:
 * Points come from verified trading, from a handful of rare milestones, and
 * from capped conversion. Everything else a member does on the platform pays
 * Credits instead, which is what keeps the level an account of trading rather
 * than of time spent clicking.
 *
 * The zero rows below are deliberate, not omissions. Connecting a broker,
 * finishing a mission, completing a lesson and posting in the community all
 * pay nothing in Points, and screens that promise otherwise are wrong.
 */

export interface PointsSource {
  id: string;
  source: string;
  whatTheMemberDoes: string;
  /** In the workbook's own words, because some are multipliers not amounts. */
  points: string;
  /** The amount, where it is a flat number of Points. */
  flat?: number;
  /** The multiplier range, where it is a boost. */
  multiplier?: readonly [number, number];
}

export const POINTS_SOURCES: PointsSource[] = [
  { id: 'P01', source: 'Trading', whatTheMemberDoes: 'Make a verified trade through a partner broker', points: `1 per $${PV_PER_POINT} of Point Value` },
  { id: 'P02', source: 'Partner Boost', whatTheMemberDoes: 'Trade with a featured, broker-funded partner', points: '1.00 to 1.50 times Base Points', multiplier: BOOSTS.partner },
  { id: 'P03', source: 'Campaign Boost', whatTheMemberDoes: 'Trade a promoted market, instrument or week', points: '1.00 to 2.00 times Base Points', multiplier: BOOSTS.campaign },
  { id: 'P04', source: 'Consistency Boost', whatTheMemberDoes: 'Stay active over time', points: '1.00 to 1.20 times Base Points', multiplier: BOOSTS.consistency },
  { id: 'P05', source: 'Boost cap', whatTheMemberDoes: 'All boosts stacked on one trade', points: 'At most about 2.0 to 2.5 times', multiplier: BOOSTS.combinedCap },
  { id: 'P06', source: 'D6 milestone', whatTheMemberDoes: 'Make a qualified referral who becomes a verified, trading member', points: `${MILESTONE_POINTS}`, flat: MILESTONE_POINTS },
  { id: 'P07', source: 'D6 milestone', whatTheMemberDoes: 'Complete the monthly exploration journey', points: `${MILESTONE_POINTS}`, flat: MILESTONE_POINTS },
  { id: 'P08', source: 'D6 milestone', whatTheMemberDoes: 'Complete the weekly social set four weeks in a row', points: `${MILESTONE_POINTS}`, flat: MILESTONE_POINTS },
  { id: 'P09', source: 'Conversion', whatTheMemberDoes: 'Convert Credits into Points', points: `1 per ${CREDITS_PER_POINT} Credits, no boosts` },
  { id: 'P12', source: 'Brokers', whatTheMemberDoes: 'Connect or verify a broker account', points: '0 \u2014 this pays Credits instead', flat: 0 },
  { id: 'P13', source: 'Missions', whatTheMemberDoes: 'Complete a mission task', points: '0 \u2014 this pays Credits instead', flat: 0 },
  { id: 'P14', source: 'Education', whatTheMemberDoes: 'Finish a lesson or a course', points: '0 \u2014 this pays Credits instead', flat: 0 },
  { id: 'P15', source: 'Community', whatTheMemberDoes: 'Like, reply, post or enrol', points: '0 \u2014 this pays Credits instead', flat: 0 },
];

/** The sentence the member should be told, wherever Points are explained. */
export const POINTS_IN_ONE_LINE =
  'Points come only from verified trading plus its boosts, from rare milestones, and from capped conversion. '
  + `Everyday tasks pay Credits. Each Point counts towards your level for ${POINT_LIFE_DAYS} days.`;

/**
 * Points for a trade, with its boosts applied and the cap respected.
 *
 * Base Points and the boost are returned separately because the member has to
 * be shown which is which: a promotion that ends should not look like the
 * baseline falling.
 */
export function pointsWithBoosts(
  basePoints: number,
  boosts: { partner?: number; campaign?: number; consistency?: number } = {},
): { base: number; multiplier: number; total: number; capped: boolean } {
  const raw = (boosts.partner ?? 1) * (boosts.campaign ?? 1) * (boosts.consistency ?? 1);
  const cap = BOOSTS.combinedCap[1];
  const multiplier = Math.min(raw, cap);
  return {
    base: basePoints,
    multiplier,
    total: Math.round(basePoints * multiplier),
    capped: raw > cap,
  };
}

/** Whether this way of earning pays Points at all. */
export function paysPoints(id: string): boolean {
  const row = POINTS_SOURCES.find((s) => s.id === id);
  return row ? row.flat !== 0 : false;
}
