export interface TrendingPostTokenMention {
  symbol: string;
  change: number;
  sentiment: 'Bullish' | 'Bearish';
}

export interface TrendingPost {
  id: string;
  postType: string;
  market: 'Crypto' | 'Forex' | 'Stocks' | 'Commodities';
  categoryLabel: string;
  categoryClass: string;
  title: string;
  authorName: string;
  authorHandle: string;
  authorInitials?: string;
  authorColor?: string;
  authorAvatar?: string;
  verified: boolean;
  timeAgo: string;
  influenceScore: number;
  predictPrecision: number;
  body: string;
  chartImage?: string;
  tokenMentions: TrendingPostTokenMention[];
  hashtags?: string[];
  pollAgreePct?: number;
  pollDisagreePct?: number;
}

import { AVATAR_DANIEL_TAN, CHART_BTC_4H } from './communityDemoPostAssets';

export const TRENDING_POSTS: TrendingPost[] = [
  {
    id: 'tp_0',
    postType: 'Technical',
    market: 'Crypto',
    categoryLabel: 'MARKETS · TECHNICAL SETUP',
    categoryClass: 'bg-violet-50 text-violet-700',
    title: 'BTC showing strong structure on the 4H',
    authorName: 'Daniel Tan',
    authorHandle: '@danieltan',
    authorAvatar: AVATAR_DANIEL_TAN,
    verified: true,
    timeAgo: '2h ago',
    influenceScore: 96.4,
    predictPrecision: 86,
    body:
      "We're holding the higher low and looking like a breakout above this range. If volume continues, I'm watching the $110K – $112K zone next.",
    chartImage: CHART_BTC_4H,
    tokenMentions: [{ symbol: 'BTC/USD', change: 2.1, sentiment: 'Bullish' }],
  },
  {
    id: 'tp_1',
    postType: 'Blog',
    market: 'Crypto',
    categoryLabel: 'CRYPTO · MARKET BRIEF',
    categoryClass: 'bg-sky-50 text-sky-700',
    title: 'No More Guessing on Altcoin Rotations',
    authorName: 'ChainWatcher_X',
    authorHandle: '@ChainWatcher_X',
    authorInitials: 'CW',
    authorColor: '#5338ec',
    verified: true,
    timeAgo: '17h ago',
    influenceScore: 109.74,
    predictPrecision: 75,
    body: "No more guessing where the rotation goes next. 🔥\n\nI've been tracking cross-pair flow since the last BNB breakout — once majors stall, liquidity usually rotates into mid-caps within 24 to 48 hours.",
    tokenMentions: [
      { symbol: 'BNB', change: 4.09, sentiment: 'Bullish' },
      { symbol: 'SOL', change: 1.54, sentiment: 'Bullish' },
    ],
  },
  {
    id: 'tp_2',
    postType: 'Poll',
    market: 'Crypto',
    categoryLabel: 'CRYPTO · COMMUNITY POLL',
    categoryClass: 'bg-amber-50 text-amber-700',
    title: 'Poll: Does Bitcoin Hold the Line?',
    authorName: 'Bitcoin Research',
    authorHandle: '@bitcoinresearch',
    authorInitials: 'BR',
    authorColor: '#D97706',
    verified: true,
    timeAgo: '18h ago',
    influenceScore: 99.35,
    predictPrecision: 84.7,
    body: 'Community question: BTC is sitting at a decision point after a volatile week. Vote for a support hold or a deeper reset, then share the level that changes your thesis.',
    tokenMentions: [{ symbol: 'BTC/USD', change: 3.21, sentiment: 'Bullish' }],
    hashtags: ['#BTC', '#Poll', '#Support', '#Crypto'],
    pollAgreePct: 63,
    pollDisagreePct: 37,
  },
  {
    id: 'tp_3',
    postType: 'Blog',
    market: 'Forex',
    categoryLabel: 'FOREX · MARKET BRIEF',
    categoryClass: 'bg-violet-50 text-violet-700',
    title: 'Why the Dollar Smile Is Breaking Down',
    authorName: 'MacroAlpha',
    authorHandle: '@macro_alpha',
    authorInitials: 'MA',
    authorColor: '#0EA5E9',
    verified: false,
    timeAgo: '21h ago',
    influenceScore: 87.12,
    predictPrecision: 68,
    body: 'The classic dollar-smile framework is getting tested as growth and rate-cut narratives move in the same direction for once. Watching DXY 103.20 as the level that confirms the regime shift.',
    tokenMentions: [{ symbol: 'EUR/USD', change: 0.62, sentiment: 'Bullish' }],
  },
  {
    id: 'tp_4',
    postType: 'Poll',
    market: 'Commodities',
    categoryLabel: 'COMMODITIES · COMMUNITY POLL',
    categoryClass: 'bg-amber-50 text-amber-700',
    title: 'Poll: Is Gold Due for a Pullback?',
    authorName: 'GoldenCross99',
    authorHandle: '@goldencross99',
    authorInitials: 'GC',
    authorColor: '#CA8A04',
    verified: false,
    timeAgo: '1d ago',
    influenceScore: 74.5,
    predictPrecision: 71.3,
    body: 'Gold just posted its fourth consecutive up week. Healthy continuation, or stretched and due for a reset back toward $2,600?',
    tokenMentions: [{ symbol: 'XAU/USD', change: -0.8, sentiment: 'Bearish' }],
    hashtags: ['#Gold', '#Poll', '#Commodities'],
    pollAgreePct: 41,
    pollDisagreePct: 59,
  },
];
