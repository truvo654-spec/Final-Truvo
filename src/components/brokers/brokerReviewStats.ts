import type { BrokerReview } from './tabs/BrokerReviewsTabContent';
import { seedReviewsFor } from './brokerReviewSeeds';

/**
 * What members have said about a broker, as one set of figures.
 *
 * The reviews tab, the broker list and the AI panel all need the same average
 * out of the same reviews, so it is worked out here once. Reading it anywhere
 * else would let the list and the detail page disagree, which is the kind of
 * difference people notice and stop trusting.
 */

export interface ReviewStats {
  /** Out of five, to one decimal place. */
  average: number;
  count: number;
  /** Share who would recommend, or null when nobody answered. */
  recommend: number | null;
}

const STORE_KEY = (brokerId: string) => `marketsyde_reviews_${brokerId}`;

function stored(brokerId: string): BrokerReview[] {
  try {
    const raw = window.localStorage.getItem(STORE_KEY(brokerId));
    return raw ? (JSON.parse(raw) as BrokerReview[]) : [];
  } catch {
    return [];
  }
}

export function reviewsFor(brokerId: string, brokerName: string): BrokerReview[] {
  return [...stored(brokerId), ...seedReviewsFor(brokerName)];
}

export function reviewStats(brokerId: string, brokerName: string): ReviewStats | null {
  const list = reviewsFor(brokerId, brokerName);
  if (list.length === 0) return null;

  const total = list.reduce((sum, r) => sum + r.rating, 0);
  const answered = list.filter((r) => r.recommend !== null);
  const yes = answered.filter((r) => r.recommend === true).length;

  return {
    average: Math.round((total / list.length) * 10) / 10,
    count: list.length,
    recommend: answered.length ? Math.round((yes / answered.length) * 100) : null,
  };
}

/**
 * Brokers ordered by what members said, best first.
 *
 * A broker with very few reviews is not ranked above one with many on the
 * strength of two opinions, so the average is pulled towards the middle until
 * there are enough of them to mean something.
 */
export function byRating<T extends { id: string; name: string }>(brokers: T[]): (T & { stats: ReviewStats })[] {
  const PRIOR = 3.5;
  const PRIOR_WEIGHT = 5;

  return brokers
    .map((b) => ({ broker: b, stats: reviewStats(b.id, b.name) }))
    .filter((x): x is { broker: T; stats: ReviewStats } => x.stats !== null)
    .map((x) => ({
      ...x,
      weighted: (x.stats.average * x.stats.count + PRIOR * PRIOR_WEIGHT) / (x.stats.count + PRIOR_WEIGHT),
    }))
    .sort((a, b) => b.weighted - a.weighted)
    .map((x) => ({ ...x.broker, stats: x.stats }));
}
