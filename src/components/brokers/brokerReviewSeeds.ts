import type { BrokerReview } from './tabs/BrokerReviewsTabContent';

/**
 * A few reviews to read on a broker that has none yet.
 *
 * These are illustrative, not real members, so they are written the way real
 * ones read: specific, mixed, and about execution and withdrawals rather than
 * about profit. None of them claims a return, because a review that promises
 * one is the kind this page exists to keep out.
 */
export function seedReviewsFor(brokerName: string): BrokerReview[] {
  return [
    {
      id: `${brokerName}-s1`,
      rating: 4,
      title: 'Fills are honest, support is slow at the weekend',
      role: 'Forex swing trader',
      relationship: 'Current client',
      location: 'Bangkok',
      recommend: true,
      trustworthy: true,
      wouldFundAgain: true,
      pros: 'Spreads hold through the London open and I have not seen a requote in months. Withdrawals have landed within a day each time, including over a holiday.',
      cons: 'Support is quick on weekdays and almost silent at the weekend, which is awkward if a position is open and something looks wrong.',
      postedOn: '2026-10-02',
      helpful: 12,
      categories: { Execution: 5, 'Spreads and fees': 4, Withdrawals: 5, Platform: 4, Support: 2, Transparency: 4 },
    },
    {
      id: `${brokerName}-s2`,
      rating: 3,
      title: 'Fine for majors, wide on anything else',
      role: 'Index and gold',
      relationship: 'Current client',
      recommend: null,
      trustworthy: true,
      wouldFundAgain: null,
      pros: 'The platform is stable and the cashback is paid without having to chase it.',
      cons: 'Spreads on gold and the indices widen a long way around news, so the cost of a trade is not what the headline number suggests.',
      postedOn: '2026-09-21',
      helpful: 7,
      categories: { Execution: 3, 'Spreads and fees': 2, Withdrawals: 4, Platform: 4, Support: 3, Transparency: 3 },
    },
    {
      id: `${brokerName}-s3`,
      rating: 2,
      title: 'Verification took three weeks',
      role: 'New trader',
      relationship: 'Former client',
      recommend: false,
      trustworthy: null,
      wouldFundAgain: false,
      pros: 'The demo account was easy to set up and behaved like the live one.',
      cons: 'Document verification took three weeks and I had to send the same proof of address twice. I funded elsewhere in the meantime.',
      postedOn: '2026-09-08',
      helpful: 4,
      categories: { Execution: 3, 'Spreads and fees': 3, Withdrawals: 2, Platform: 4, Support: 2, Transparency: 3 },
    },
    {
      id: `${brokerName}-s4`,
      rating: 5,
      title: 'Six months in and nothing to complain about',
      role: 'Scalper, majors only',
      relationship: 'Current client',
      location: 'Singapore',
      recommend: true,
      trustworthy: true,
      wouldFundAgain: true,
      pros: 'Slippage is small even on the minute of a release, and the platform has not dropped once. Two withdrawals, both the same day.',
      cons: 'Nothing worth writing down yet. Ask me again after a bad month.',
      postedOn: '2026-10-05',
      helpful: 9,
      categories: { Execution: 5, 'Spreads and fees': 4, Withdrawals: 5, Platform: 5, Support: 4, Transparency: 5 },
    },
    {
      id: `${brokerName}-s5`,
      rating: 4,
      title: 'Good platform, read the swap rates first',
      role: 'Position trader',
      relationship: 'Current client',
      recommend: true,
      trustworthy: true,
      wouldFundAgain: null,
      pros: 'Everything about the day-to-day is solid and the cashback arrives on time.',
      cons: 'Overnight swaps are higher than I expected and nobody points them out until you hold something for a week.',
      postedOn: '2026-09-29',
      helpful: 6,
      categories: { Execution: 4, 'Spreads and fees': 3, Withdrawals: 4, Platform: 5, Support: 4, Transparency: 3 },
    },
  ];
}
