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
  verified?: boolean;
  badge?: string;
  likes?: number;
  chartSnippet?: string;
  replies?: CommunityComment[];
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

export type CommunitySubTab = 'feeds' | 'topics' | 'lives' | 'media' | 'articles' | 'my-page' | 'profile';

export interface CommunityLiveSession {
  id: string;
  title: string;
  hosts: {
    name: string;
    avatar: string;
    badge?: string;
  }[];
  tokens?: { symbol: string; change: number }[];
  date: string;
  listenersCount: number;
  status: 'upcoming' | 'past' | 'live';
  isReminderSet?: boolean;
  recordingUrl?: string;
  audioDuration?: string;
  tags?: string[];
}

export interface TierUnlockItem {
  level: number;
  title: string;
  minPoints: number;
  badge: string;
  color: string;
  cashbackBoost: number;
  unlockedFeatures: {
    name: string;
    description: string;
    unlocked: boolean;
  }[];
}

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
  description?: string;
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

export type NewsSentiment = 'Bullish' | 'Bearish' | 'Neutral';
export type NewsTier = 'public' | 'basic' | 'intermediate' | 'premium';
export type AdvisorLabel = 'Critical' | 'Long-term' | 'Temporary Noise';

export interface NewsAdvisorPick {
  advisorName: string;
  advisorAvatar: string;
  label: AdvisorLabel;
  commentary: string;
  lessonTitle?: string;
  lessonDuration?: string;
  lessonDate?: string;
}

export interface NewsArticle {
  id: string;
  source: string;
  sourceAvatar: string;
  assetClass: 'Forex' | 'Crypto' | 'Commodity' | 'Indices' | 'Stocks';
  tags: string[];
  headline: string;
  excerpt: string;
  content: string[];
  expertSummary?: string;
  thumbnail: string;
  heroImage: string;
  sentiment: NewsSentiment;
  timestamp: string;
  readTime: string;
  claps: number;
  commentsCount: number;
  minTier: NewsTier;
  followedTopic?: string;
  advisorPick?: NewsAdvisorPick;
}

export interface NewsComment {
  id: string;
  articleId: string;
  author: string;
  avatar: string;
  date: string;
  text: string;
  claps: number;
  repliesCount: number;
}

export type EventImpact = 'Low' | 'Medium' | 'High';
export type EventCategory = 'Central Bank' | 'Employment' | 'Inflation' | 'GDP' | 'Trade' | 'Housing' | 'Sentiment' | 'PMI' | 'Speech' | 'Holiday';
export type EventTimeframe = 'today' | 'week' | 'month';

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  countryFlag: string;
  currency: string;
  region: string;
  assetClass: 'Forex' | 'Crypto' | 'Commodity' | 'Indices' | 'Stocks';
  category: EventCategory;
  impact: EventImpact;
  /** ISO timestamp with offset, e.g. 2026-10-05T05:00:00+07:00. Ignored for all-day rows. */
  at: string;
  /** YYYY-MM-DD, only for all-day rows (holidays). */
  date?: string;
  allDay?: boolean;
  hasSpeech?: boolean;
  forecast?: string;
  previous?: string;
  actual?: string;
  summary: string;
  historicalTrend: number[];
  relatedArticleId?: string;
  relatedSignalTicker?: string;
  aiPrediction?: string;
}

export interface EventNote {
  id: string;
  eventId: string;
  advisorName: string;
  advisorAvatar: string;
  text: string;
}

export interface EventAlert {
  id: string;
  eventId: string;
  leadTimeMinutes: number;
}

export interface BrokerEventTag {
  id: string;
  eventId: string;
  brokerName: string;
  message: string;
}

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseFormat = 'Video' | 'Article' | 'PDF' | 'Quiz';
export type LearningPlan = 'Free' | 'Basic' | 'Advanced' | 'Elite';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  format: CourseFormat;
  durationMinutes: number;
  isPremium: boolean;
  videoDurationLabel?: string;
  articleContent?: string[];
  quizQuestions?: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  thumbnail: string;
  instructorName: string;
  instructorAvatar: string;
  isAdvisorContent: boolean;
  brokerBranding?: string;
  requiredPlan: LearningPlan;
  pointsReward: number;
  lessons: CourseLesson[];
  enrolledCount: number;
  rating: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  trackName: string;
  issuedDate: string;
}

export type LiveClassStatus = 'live' | 'upcoming' | 'replay';
export type LiveClassHostType = 'Advisor' | 'Broker' | 'MarketSyde';

export interface LiveClass {
  id: string;
  title: string;
  description: string;
  category: string;
  hostName: string;
  hostAvatar: string;
  hostType: LiveClassHostType;
  status: LiveClassStatus;
  scheduledLabel: string;
  attendeeCount: number;
  requiredPlan: LearningPlan;
}

export type TradeInputMethod = 'manual' | 'api';
export type TradeOutcome = 'win' | 'loss' | 'neutral';
export type PortfolioAssetClass = 'Forex' | 'Crypto' | 'Stocks' | 'Commodity' | 'Indices';

export interface PortfolioTrade {
  id: string;
  broker: string;
  inputMethod: TradeInputMethod;
  assetClass: PortfolioAssetClass;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number | null;
  size: number;
  pnl: number;
  isRealized: boolean;
  outcome: TradeOutcome;
  riskTag?: 'high-risk' | 'high-reward' | 'low-risk';
  strategyTag?: string;
  riskRewardRatio?: number;
  openedAt: string;
  closedAt: string | null;
  analystNote?: string;
  /** Signal confidence (0-100) when the trade came from a MarketSyde signal. */
  confidence?: number;
}

export interface PortfolioGoal {
  id: string;
  label: string;
  type: 'growth' | 'drawdown-limit';
  targetValue: number;
  currentValue: number;
  unit: '%' | '$';
}

export interface PortfolioBalancePoint {
  label: string;
  balance: number;
}

export interface PortfolioSnapshot {
  totalBalance: number;
  freeMargin: number;
  marginUsagePct: number;
  realizedPnl: number;
  unrealizedPnl: number;
  activeTradesCount: number;
  winRate: number;
  connectedBrokersCount: number;
}

export type JournalEmotion = 'Confident' | 'Calm' | 'Anxious' | 'FOMO' | 'Greedy' | 'Frustrated' | 'Bored';
export type JournalOutcome = 'win' | 'loss' | 'breakeven' | 'open';

export interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  assetClass: PortfolioAssetClass;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number | null;
  size: number;
  pnl: number;
  rMultiple: number | null;
  outcome: JournalOutcome;
  strategy: string;
  tags: string[];
  setupNotes: string;
  emotionBefore: JournalEmotion;
  emotionAfter: JournalEmotion;
  followedPlan: boolean;
  checklistDone: string[];
  mistakes: string[];
  lessons: string;
  rating: number;
  screenshot?: string;
  linkedTradeId?: string;
  source: 'portfolio' | 'manual';
}

export interface JournalChecklistItem {
  id: string;
  label: string;
}

export interface JournalWeeklyReview {
  id: string;
  weekLabel: string;
  bestTrade: string;
  biggestLesson: string;
  focusNextWeek: string;
  entriesCount: number;
  netPnl: number;
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


