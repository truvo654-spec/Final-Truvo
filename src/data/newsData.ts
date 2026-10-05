import { NewsArticle, NewsComment } from '../types';
import {
  SOURCE_REUTERS,
  SOURCE_DOWJONES,
  SOURCE_BLOOMBERG,
  SOURCE_ACUITY,
  AVATAR_ADVISOR_SARAH,
  AVATAR_COMMENTER_ULISSES,
  THUMB_USD,
  THUMB_GOLD,
  THUMB_BANKS,
  THUMB_SPX,
  THUMB_ETH,
  THUMB_EUR,
  THUMB_JPY,
} from './newsImagePlaceholders';

export const NEWS_CATEGORIES = ['All', 'Forex', 'Crypto', 'Stocks', 'Commodities', 'Indices'] as const;

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news_1',
    source: 'Reuters',
    sourceAvatar: SOURCE_REUTERS,
    assetClass: 'Forex',
    tags: ['Forex', 'Central Banks', 'USD'],
    headline: 'Dollar slips as rate-cut odds firm up after soft payrolls print',
    excerpt:
      'Markets quickly repriced the policy path after a weaker-than-expected jobs report, with the dollar index sliding to a two-month low against a basket of major peers.',
    content: [
      'The dollar index fell as much as 0.6% on Thursday after the latest payrolls report came in well below consensus, reviving bets that policymakers will move sooner rather than later on rate cuts.',
      'Futures markets now price in a cut at the next meeting with roughly 70% probability, up from under 40% a week ago. The move was broad-based, with the dollar losing ground against the euro, yen and sterling alike.',
      'Traders say the reaction reflects how sensitive positioning has become to labour-market data specifically, rather than inflation prints, which had dominated the narrative for most of the year.',
    ],
    expertSummary:
      'Rate-cut odds for the next meeting jumped from 38% to 70% on this single print. Watch the dollar index at 103.20 — a break below confirms the move has legs.',
    thumbnail: THUMB_USD,
    heroImage: THUMB_USD,
    sentiment: 'Bullish',
    timestamp: '8 minutes ago',
    readTime: '3 min read',
    claps: 412,
    commentsCount: 28,
    minTier: 'intermediate',
    followedTopic: 'Central Banks',
  },
  {
    id: 'news_2',
    source: 'Dow Jones',
    sourceAvatar: SOURCE_DOWJONES,
    assetClass: 'Commodity',
    tags: ['Commodities', 'Gold', 'Rates'],
    headline: 'Gold holds near record highs as real yields keep falling',
    excerpt:
      'Spot gold stays bid above $2,650 as traders rotate out of short-duration Treasuries ahead of this week\u2019s inflation data.',
    content: [
      'Spot gold held above $2,650 on Thursday as real Treasury yields extended their slide for a fourth straight session. The move tracks closely with growing conviction that the next policy move is a cut rather than a pause, which has pulled capital out of short-duration government debt and back into non-yielding assets.',
      'Options desks note that skew has flattened over the past week, suggesting positioning is no longer as one-sided as it was heading into the last inflation print. That makes the upcoming CPI release the cleaner catalyst to watch, rather than any single central-bank comment.',
      'Physical demand out of Asia has also picked up modestly, though dealers caution that the move so far has been almost entirely a paper-market story driven by futures and ETF flows.',
    ],
    expertSummary: 'Real yields, not the dollar, are driving this move. Below $2,600 would be the first sign the trade is unwinding.',
    thumbnail: THUMB_GOLD,
    heroImage: THUMB_GOLD,
    sentiment: 'Bullish',
    timestamp: '31 minutes ago',
    readTime: '4 min read',
    claps: 876,
    commentsCount: 94,
    minTier: 'basic',
    advisorPick: {
      advisorName: 'Sarah K.',
      advisorAvatar: AVATAR_ADVISOR_SARAH,
      label: 'Critical',
      commentary:
        "This is the setup I flagged in Monday's class — the real-yield breakdown is the whole trade. If you're short gold here, this is your invalidation level.",
      lessonTitle: 'Reading real yields vs. gold',
      lessonDuration: '18 min',
      lessonDate: "Monday's class",
    },
  },
  {
    id: 'news_3',
    source: 'Bloomberg',
    sourceAvatar: SOURCE_BLOOMBERG,
    assetClass: 'Stocks',
    tags: ['Stocks', 'Banks', 'Credit'],
    headline: 'Why three regional banks just quietly hedged their bond books',
    excerpt:
      "A review of call-report filings shows a pattern that only shows up once you line up duration against deposit flight risk, and it is not the banks you'd expect.",
    content: [
      'A review of recent call-report filings shows at least three mid-sized regional lenders adding meaningful interest-rate hedges to their available-for-sale portfolios over the past quarter, a shift from the largely unhedged stance most had held since the 2023 regional-bank stress.',
      'The filings do not name a single trigger, but the timing lines up with renewed deposit-flight concerns at smaller institutions as money-market yields stay attractive relative to savings accounts.',
      'Analysts covering the sector say the hedges, while modest in notional terms, mark a meaningful change in risk posture — and may be a leading indicator for the sector\u2019s next round of earnings commentary.',
    ],
    thumbnail: THUMB_BANKS,
    heroImage: THUMB_BANKS,
    sentiment: 'Neutral',
    timestamp: '1 hour ago',
    readTime: '5 min read',
    claps: 203,
    commentsCount: 17,
    minTier: 'premium',
  },
  {
    id: 'news_4',
    source: 'Acuity',
    sourceAvatar: SOURCE_ACUITY,
    assetClass: 'Indices',
    tags: ['Indices', 'S&P 500', 'CPI'],
    headline: "S&P 500 holds the 50-day average into tomorrow's CPI print",
    excerpt:
      'Index futures were little changed in early trade, with positioning data pointing to a crowded wait-and-see stance ahead of the inflation release.',
    content: [
      'S&P 500 futures traded in a tight range through the session as traders squared up positions ahead of tomorrow\u2019s inflation print, widely seen as the next major catalyst for rate expectations.',
      'Options-implied volatility for the release has climbed to its highest level in six weeks, suggesting the market is bracing for a larger-than-usual reaction either way.',
    ],
    thumbnail: THUMB_SPX,
    heroImage: THUMB_SPX,
    sentiment: 'Neutral',
    timestamp: '41 minutes ago',
    readTime: '2 min read',
    claps: 128,
    commentsCount: 9,
    minTier: 'public',
  },
  {
    id: 'news_5',
    source: 'Dow Jones',
    sourceAvatar: SOURCE_DOWJONES,
    assetClass: 'Crypto',
    tags: ['Crypto', 'Ethereum', 'Derivatives'],
    headline: 'ETH funding rates turn negative across major venues',
    excerpt:
      'Perpetual funding flipped negative for the first time in six weeks, a sign that leveraged long positioning has been flushed out of the market.',
    content: [
      'Funding rates on Ethereum perpetual futures turned negative across the largest venues on Thursday, the first such reading in six weeks, as a wave of long liquidations cleared out crowded positioning.',
      'The move follows a sharp pullback in spot price over the past 48 hours, with open interest down roughly 18% from its recent peak.',
    ],
    thumbnail: THUMB_ETH,
    heroImage: THUMB_ETH,
    sentiment: 'Bearish',
    timestamp: '24 minutes ago',
    readTime: '3 min read',
    claps: 341,
    commentsCount: 41,
    minTier: 'basic',
  },
  {
    id: 'news_6',
    source: 'Reuters',
    sourceAvatar: SOURCE_REUTERS,
    assetClass: 'Forex',
    tags: ['Forex', 'EUR', 'ECB'],
    headline: 'EUR/USD breaks above 1.09 as ECB signals a longer pause',
    excerpt:
      "The pair cleared its three-week range after policymakers pushed back on near-term cut pricing, with options flow now favouring a grind toward 1.095.",
    content: [
      'EUR/USD cleared its three-week range on Thursday after European Central Bank officials pushed back on market pricing for a near-term rate cut, with several members noting that underlying inflation remains too sticky to declare victory.',
      'Options flow has shifted meaningfully over the past 24 hours, with risk reversals now favouring further euro upside into next week\u2019s data calendar.',
    ],
    expertSummary:
      'Rate-cut odds for the next ECB meeting fell from 61% to 38%. Watch 1.0950 as the next resistance; a close above opens room toward 1.10.',
    thumbnail: THUMB_EUR,
    heroImage: THUMB_EUR,
    sentiment: 'Bullish',
    timestamp: '18 minutes ago',
    readTime: '3 min read',
    claps: 288,
    commentsCount: 22,
    minTier: 'intermediate',
  },
  {
    id: 'news_7',
    source: 'Reuters',
    sourceAvatar: SOURCE_REUTERS,
    assetClass: 'Forex',
    tags: ['Forex', 'JPY', 'Bank of Japan'],
    headline: 'Yen slides past 155 as traders test the Bank of Japan\u2019s patience',
    excerpt:
      'USD/JPY pushed through a closely watched level overnight, reviving intervention chatter out of Tokyo as the rate gap with the US stays wide.',
    content: [
      'USD/JPY traded through 155.00 in early Asia hours on Thursday, a level that has previously drawn verbal warnings from Japanese officials about "excessive" currency moves.',
      'The move tracks a widening gap between US and Japanese policy rates, with carry trades continuing to pressure the yen even as officials signal discomfort with the pace of the decline.',
      'Options markets are pricing a pickup in realized volatility over the coming week, with traders watching for any sign of actual intervention rather than just jawboning from the Ministry of Finance.',
    ],
    expertSummary:
      'Rhetoric alone has not been enough to stem the slide the last three times this level was tested. Watch for actual BOJ spot intervention, not just statements, as the real turning signal.',
    thumbnail: THUMB_JPY,
    heroImage: THUMB_JPY,
    sentiment: 'Bearish',
    timestamp: '19 minutes ago',
    readTime: '3 min read',
    claps: 356,
    commentsCount: 31,
    minTier: 'basic',
    followedTopic: 'Bank of Japan',
  },
];

const NEWS_TIER_RANK: Record<NewsArticle['minTier'], number> = {
  public: 0,
  basic: 1,
  intermediate: 2,
  premium: 3,
};

/** tierLevel is UserProfile.tierLevel (1 Rookie .. 4 Boss); logged-out users see only 'public' articles. */
export function canAccessNews(article: NewsArticle, tierLevel: number, isLoggedIn: boolean): boolean {
  const userRank = isLoggedIn ? Math.max(tierLevel - 1, 0) : -1;
  return userRank >= NEWS_TIER_RANK[article.minTier];
}

export const NEWS_COMMENTS: NewsComment[] = [
  {
    id: 'cmt_1',
    articleId: 'news_2',
    author: 'Wtechaboontam',
    avatar: '',
    date: 'Sep 2',
    text: 'What are your thoughts on the 2,600 level holding through the CPI print tomorrow?',
    claps: 4,
    repliesCount: 0,
  },
  {
    id: 'cmt_2',
    articleId: 'news_2',
    author: 'Ulisses Dantas',
    avatar: AVATAR_COMMENTER_ULISSES,
    date: 'Sep 2',
    text: "Been watching real yields all week — this lines up with what the advisor flagged in Monday's class almost exactly.",
    claps: 229,
    repliesCount: 7,
  },
];
