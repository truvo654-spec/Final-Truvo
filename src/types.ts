export type MarketAction = 'BUY' | 'SELL' | 'UPGRADE';

export interface MarketSignal {
  id: string;
  ticker: string;
  assetClass: 'Forex' | 'Crypto' | 'Commodity' | 'Indices' | 'Stocks';
  name: string;
  flag: string;
  price: number;
  change24h: number;
  sparkline: number[];
  action: MarketAction;
  timeframe: string;
  confidence: number;
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  stopLoss: number;
  riskReward: string;
  analysis: string;
  timestamp: string;
  minLevel?: number;
  period?: string;
  validity?: string;
  type?: string;
  group?: string;
}

export interface Broker {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  maxCashback: string;
  cashbackPerLot: number;
  spreadFrom: string;
  maxLeverage: string;
  regulations: string[];
  platforms: string[];
  minDeposit: string;
  featured: boolean;
  connected: boolean;
  connectedAccountId?: string;
  category: 'Forex' | 'Multi-Asset' | 'Crypto' | 'Raw Spread';
  score?: number;
  isTopPick?: boolean;
  hasCashback?: boolean;
  headquarters?: string;
  founded?: number;
  highlights?: string;
  spreadType?: string;
  supportedCurrencies?: string[];
  accountTypes?: Array<{
    name: string;
    spreadType: string;
    commission: string;
    minDeposit: string;
    minTradeVolume: string;
    maxLeverage: string;
    tradingPlatforms: string;
    cashbackForex?: string;
    isHighestCashback?: boolean;
  }>;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  avatar: string;
  rankTitle: string;
  tierLevel: number;
  currentPoints: number;
  maxPoints: number;
  sydeCredits: number;
  lastWeekCredits: number;
  perks: string[];
  boostPercentage: number;
  totalCashbackEarned: number;
  pendingPayout: number;
  lotsTradedTotal: number;
  connectedBrokersCount: number;
  activeStreakDays: number;
  slotsSaved?: number;
  slotsTotal?: number;
  tradingAccountsCount?: number;
  followingCount?: number;
  followersCount?: number;
}

export type UserTierType = 'tier-1' | 'tier-2' | 'offshore';

export interface MissionTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionLabel?: string;
  category?: string;
}

export interface Mission {
  id: string;
  title: string;
  coloredSuffix?: {
    text: string;
    color: string;
  };
  subtitle: string;
  status: 'active' | 'available' | 'completed';
  expiresIn?: string;
  isDaily?: boolean;
  rewardPoints: number;
  rewardCredits: number;
  tasks: MissionTask[];
  theme: 'purple' | 'pink' | 'lime';
}

export interface ActivityLogItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'points' | 'credits' | 'both';
  pointsChange?: number;
  creditsChange?: number;
  category: 'Mission' | 'Rebate' | 'Conversion' | 'Streak' | 'Bonus';
}

export interface PerformanceTimeframeData {
  timeframe: '1D' | '1W' | '1M' | 'All';
  totalCashback: number;
  lotsTraded: number;
  avgCashbackPerLot: number;
  bestDay: number;
  pendingPayout: number;
  history: {
    date: string;
    cashback: number;
    lots: number;
    trades: number;
  }[];
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  cashbackEarned: number;
  tier: string;
  isCurrentUser?: boolean;
}

export interface CashbackTrade {
  id: string;
  date: string;
  broker: string;
  symbol: string;
  lots: number;
  type: 'BUY' | 'SELL';
  cashbackEarned: number;
  status: 'Credited' | 'Pending' | 'Processed';
}

export interface QuickStep {
  step: number;
  title: string;
  desc: string;
  completed: boolean;
  actionText: string;
}

export interface CommunityComment {
  id: string;
  author: string;
  avatar: string;
  tier: string;
  time: string;
  text: string;
}

export interface PostReaction {
  emoji: string;
  count: number;
  active?: boolean;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    tier?: string;
    verified: boolean;
    winRate?: string;
    influenceScore?: number;
  };
  timestamp: string;
  category?: 'Alpha' | 'Discussion' | 'Review' | 'Educational';
  ticker?: string;
  side?: 'BUY' | 'SELL';
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  projectedRebate?: string;
  title: string;
  content: string;
  image?: string;
  chartSnippet?: string;
  tokenMentions?: {
    symbol: string;
    change: number;
    sentiment?: 'Bullish' | 'Bearish';
  }[];
  tags: string[];
  likes: number;
  hasLiked?: boolean;
  commentsCount: number;
  comments: CommunityComment[];
  reactions?: PostReaction[];
  viewsCount?: string;
  repostsCount?: number;
  bookmarksCount?: number;
  isFollowingAuthor?: boolean;
  isCurrentUser?: boolean;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  prize: string;
  endsIn: string;
  progress: number;
  target: string;
  joined: boolean;
}

export interface TopContributor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  tier: string;
  winRate: string;
  followers: number;
  isFollowing: boolean;
  alphaCalls: number;
}

export type CommunitySubTab = 'feeds' | 'topics' | 'articles' | 'my-page' | 'profile';

export interface TokenMarketItem {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  marketCap: string;
  price: string;
  change24h: number;
  icon: string;
}

export interface CommunityTopic {
  id: string;
  title: string;
  tokens: { symbol: string; change: number }[];
  answersCount: number;
  image?: string;
  featured?: boolean;
  category?: string;
  userAnswer?: string;
}

export interface CommunityArticle {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  publisher: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  views: number;
  likes: number;
  tickerBadge: string;
  badgeColor?: string;
  date: string;
  readTime?: string;
  content?: string;
}

export interface CommunityInfluencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  influenceScore: number;
  analyticalDepth?: string;
  sentiment: 'Neutral' | 'Bullish' | 'Bearish';
  sentimentScore?: number;
  rank?: number;
  bio?: string;
  website?: string;
  isFollowing?: boolean;
  followersCount?: number;
  postsCount?: number;
}


