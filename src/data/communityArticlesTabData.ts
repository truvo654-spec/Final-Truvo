import {
  ART_BTC,
  ART_CANDLES,
  ART_PSYCHOLOGY,
  ART_BROKERS,
  ART_RSI,
} from './communityArticleImagePlaceholders';
import { INSTRUCTOR_ACADEMY } from './educationImagePlaceholders';
import { AVATAR_ADVISOR_SARAH, AVATAR_COMMENTER_ULISSES } from './newsImagePlaceholders';

export const ARTICLE_CATEGORIES = [
  { id: 'all', label: 'All Articles', count: '1.2K' },
  { id: 'market-news', label: 'Market News', count: 324 },
  { id: 'trading-strategy', label: 'Trading Strategy', count: 188 },
  { id: 'technical-analysis', label: 'Technical Analysis', count: 142 },
  { id: 'risk-management', label: 'Risk Management', count: 96 },
  { id: 'broker-reviews', label: 'Broker Reviews', count: 84 },
  { id: 'trading-psychology', label: 'Trading Psychology', count: 71 },
  { id: 'education', label: 'Education', count: 68 },
  { id: 'platform-tutorials', label: 'Platform Tutorials', count: 56 },
  { id: 'industry-insights', label: 'Industry Insights', count: 48 },
] as const;

export type ArticleCategoryId = (typeof ARTICLE_CATEGORIES)[number]['id'];

export interface CommunityArticleItem {
  id: string;
  category: Exclude<ArticleCategoryId, 'all'>;
  categoryLabel: string;
  categoryClass: string;
  thumbnail: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  verified: boolean;
  timeAgo: string;
  readTime: string;
  views: number;
  likes: number;
  comments: number;
}

export const COMMUNITY_ARTICLES_TAB: CommunityArticleItem[] = [
  {
    id: 'cart_1',
    category: 'market-news',
    categoryLabel: 'Market News',
    categoryClass: 'bg-sky-50 text-sky-700',
    thumbnail: ART_BTC,
    title: 'BTC Breaks Above $70K — What\u2019s Next?',
    excerpt:
      'Bitcoin has surged past the $70,000 resistance level, reigniting bullish sentiment across the market. Here\u2019s a look at the key factors...',
    authorName: 'Daniel Tan',
    authorAvatar: INSTRUCTOR_ACADEMY,
    verified: true,
    timeAgo: '2 hours ago',
    readTime: '5 min read',
    views: 4200,
    likes: 320,
    comments: 48,
  },
  {
    id: 'cart_2',
    category: 'technical-analysis',
    categoryLabel: 'Technical Analysis',
    categoryClass: 'bg-violet-50 text-violet-700',
    thumbnail: ART_CANDLES,
    title: 'How I Use Trend Channels for Better Entries',
    excerpt:
      'Trend channels are one of the simplest yet most effective tools in technical analysis. In this article, I\u2019ll show you how I use them...',
    authorName: 'Sarah Kim',
    authorAvatar: AVATAR_COMMENTER_ULISSES,
    verified: false,
    timeAgo: '6 hours ago',
    readTime: '8 min read',
    views: 2100,
    likes: 210,
    comments: 34,
  },
  {
    id: 'cart_3',
    category: 'trading-psychology',
    categoryLabel: 'Trading Psychology',
    categoryClass: 'bg-pink-50 text-pink-700',
    thumbnail: ART_PSYCHOLOGY,
    title: 'Staying Disciplined During a Losing Streak',
    excerpt:
      'Losing streaks happen to every trader. Here\u2019s how to manage your mindset, stay disciplined, and avoid common emotional traps.',
    authorName: 'Alex Chen',
    authorAvatar: AVATAR_ADVISOR_SARAH,
    verified: true,
    timeAgo: '1 day ago',
    readTime: '6 min read',
    views: 3700,
    likes: 420,
    comments: 62,
  },
  {
    id: 'cart_4',
    category: 'broker-reviews',
    categoryLabel: 'Broker Reviews',
    categoryClass: 'bg-amber-50 text-amber-700',
    thumbnail: ART_BROKERS,
    title: 'Best Low Spread Brokers in 2024 (Comparison)',
    excerpt:
      'We compare the top low spread brokers based on fees, execution speed, regulation and platform features to help you choose the right one.',
    authorName: 'Mike Wong',
    authorAvatar: INSTRUCTOR_ACADEMY,
    verified: false,
    timeAgo: '2 days ago',
    readTime: '7 min read',
    views: 5100,
    likes: 510,
    comments: 86,
  },
  {
    id: 'cart_5',
    category: 'education',
    categoryLabel: 'Education',
    categoryClass: 'bg-emerald-50 text-emerald-700',
    thumbnail: ART_RSI,
    title: 'A Beginner\u2019s Guide to RSI (With Examples)',
    excerpt:
      'The Relative Strength Index (RSI) is a powerful momentum indicator. In this guide, you\u2019ll cover what RSI is, how to use it, and real examples...',
    authorName: 'Emma Roberts',
    authorAvatar: AVATAR_COMMENTER_ULISSES,
    verified: false,
    timeAgo: '3 days ago',
    readTime: '10 min read',
    views: 2900,
    likes: 340,
    comments: 51,
  },
];

export const ARTICLE_RECOMMENDED_TOPICS = [
  '#Bitcoin',
  '#TradingStrategy',
  '#RiskManagement',
  '#TechnicalAnalysis',
  '#Forex',
  '#MarketNews',
  '#Options',
  '#TradingPsychology',
  '#Education',
  '#BrokerReview',
];

export const TOP_ARTICLE_AUTHORS = [
  { rank: 1, name: 'Alex Chen', verified: true, articles: 42, avatar: AVATAR_ADVISOR_SARAH },
  { rank: 2, name: 'Sarah Kim', verified: false, articles: 35, avatar: AVATAR_COMMENTER_ULISSES },
  { rank: 3, name: 'Daniel Tan', verified: true, articles: 28, avatar: INSTRUCTOR_ACADEMY },
  { rank: 4, name: 'Mike Wong', verified: false, articles: 24, avatar: INSTRUCTOR_ACADEMY },
  { rank: 5, name: 'Emma Roberts', verified: false, articles: 18, avatar: AVATAR_COMMENTER_ULISSES },
];
