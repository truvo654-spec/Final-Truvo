/// <reference types="vite/client" />
/** Demo content for the redesigned Community (Feed, Article, My Page). Images live in src/assets/community. */
const files = import.meta.glob('../../../assets/community/*.{jpg,png}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const img = (name: string, ext: 'jpg' | 'png' = 'jpg') => files[`../../../assets/community/${name}.${ext}`] ?? '';

export const IMG = {
  josh: img('av-josh-big'),
  daniel: img('av-daniel'),
  joshSmall: img('av-josh-small'),
  scorpion: img('av-scorpion'),
  raiden: img('av-raiden'),
  shangTsung: img('av-shangtsung'),
  reptile: img('av-reptile'),
  johnny: img('av-johnny'),
  btcResearch: img('av-btc-research'),
  postBtc: img('post-btc'),
  postGold: img('post-gold'),
  bannerArt: img('banner-art'),
  writing: img('writing-cover'),
  ad: img('ad-pepperstone'),
  readHero: img('read-hero'),
  creditBox: img('credit-box'),
  emptyDebates: img('empty-debates', 'png'),
  emptyStories: img('empty-stories', 'png'),
  emptyQuiet: img('empty-quiet', 'png'),
  emptyError: img('empty-error', 'png'),
  emptyArticles: img('empty-articles', 'png'),
  errDiscussion: img('err-discussion', 'png'),
  errStories: img('err-stories', 'png'),
  errContributors: img('err-contributors', 'png'),
  errSignals: img('err-signals', 'png'),
  errCourses: img('err-courses', 'png'),
  errFeed: img('err-feed', 'png'),
};

/** Copy for every empty / failed state, taken from the design. */
export const STATE_COPY = {
  topicsEmpty: { title: 'No Debates Yet', text: 'Strange, for traders. Check back soon.' },
  topicsError: { title: 'Discussion Failed to load', text: 'Topics are still there. Refresh to catch up.' },
  suggestedEmpty: { title: 'Still Getting to Know You', text: 'It’s too early for us to guess. Explore a bit first.' },
  suggestedError: { title: 'Suggestions Failed to load', text: 'Topics are still there. Refresh to catch up.' },
  storiesEmpty: { title: 'No Stories Today', text: 'Everyone’s shy. Show them how it’s done.' },
  storiesError: { title: 'Stories Failed to load', text: 'Stories are still there. Refresh to catch up.' },
  feedEmpty: { title: 'It’s Quiet in Here', text: 'A bit too peaceful. Say something!' },
  feedError: { title: 'Discussion Failed to load', text: 'Topics are still there. Refresh to catch up.' },
  contributorsError: { title: 'Contributors Failed to load', text: 'Top Contributors are still there. Refresh to catch up.' },
  signalsError: { title: 'The Signals Aren’t Here', text: 'Come back and try again. They will return.' },
  coursesError: { title: 'Discussion Failed to load', text: 'Topics are still there. Refresh to catch up.' },
} as const;

export const KEY_TOPICS = [
  { tag: '#Bitcoin', posts: '12.4K' },
  { tag: '#TradingStrategy', posts: '8.1K' },
  { tag: '#RiskManagement', posts: '6.5K' },
  { tag: '#XAUUSD', posts: '5.2K' },
  { tag: '#DayTrading', posts: '4.8K' },
  { tag: '#TechnicalAnalysis', posts: '4.1K' },
  { tag: '#MarketNews', posts: '3.9K' },
  { tag: '#Forex', posts: '3.4K' },
  { tag: '#Options', posts: '2.8K' },
  { tag: '#Psychology', posts: '2.6K' },
];

export type SuggestIcon = 'btc' | 'chart' | 'shield' | 'alert' | 'crown';
export const SUGGESTED: { title: string; comments: string; icon: SuggestIcon }[] = [
  { title: 'BTC to $120K this year?', comments: '1.2K', icon: 'btc' },
  { title: 'Best brokers for low spreads?', comments: '892', icon: 'chart' },
  { title: 'Your risk management rules', comments: '645', icon: 'shield' },
  { title: 'Gold breakout soon?', comments: '533', icon: 'alert' },
  { title: 'Prop firm experiences', comments: '421', icon: 'crown' },
  { title: 'Trading strategies explored', comments: '312', icon: 'crown' },
  { title: 'Risk management techniques', comments: '278', icon: 'chart' },
  { title: 'Daily market analysis', comments: '389', icon: 'alert' },
  { title: 'Mentorship and coaching', comments: '198', icon: 'alert' },
  { title: 'Profit withdrawal tips', comments: '157', icon: 'btc' },
  { title: 'Psychology of trading', comments: '432', icon: 'alert' },
  { title: 'Scaling up accounts', comments: '265', icon: 'crown' },
];

export const CONTRIBUTORS = [
  { rank: 1, name: 'Scorpion', articles: 12, avatar: IMG.scorpion, color: 'text-[#5945F1]', badge: 'bg-[#EEF0FE] text-[#5945F1]' },
  { rank: 2, name: 'Raiden', articles: 10, avatar: IMG.raiden, color: 'text-[#8a9a1c]', badge: 'bg-[#eaf5a8] text-[#6c7a10]' },
  { rank: 3, name: 'Shang Tsung', articles: 9, avatar: IMG.shangTsung, color: 'text-[#fd02b0]', badge: 'bg-[#ff8fd8] text-white' },
  { rank: 4, name: 'Reptile', articles: 6, avatar: IMG.reptile, color: 'text-[#0b1c30]', badge: 'bg-slate-100 text-[#0b1c30]' },
  { rank: 5, name: 'Johnny Cage', articles: 5, avatar: IMG.johnny, color: 'text-[#0b1c30]', badge: 'bg-slate-100 text-[#0b1c30]' },
];

export const SIGNALS = [
  { name: 'EUR/USD', change: '+0.33%', up: true, action: 'Buy' as const, icon: img('sig-eurusd', 'png'), path: 'M0 14 L8 12 L14 15 L20 10 L28 13 L36 9 L44 12 L52 8 L60 11 L68 9' },
  { name: 'GOOGL', change: '-0.11%', up: false, action: 'Sell' as const, icon: img('sig-googl', 'png'), path: 'M0 6 L8 10 L14 7 L20 12 L28 9 L36 13 L44 10 L52 14 L60 11 L68 13' },
  { name: 'BTC/USD', change: '', up: true, action: 'Upgrade' as const, icon: img('sig-btc', 'png'), path: '' },
  { name: 'S&P 500', change: '+0.44%', up: true, action: 'Buy' as const, icon: img('sig-sp500', 'png'), path: 'M0 15 L8 11 L14 13 L20 9 L28 12 L36 8 L44 10 L52 7 L60 9 L68 6' },
  { name: 'XAU/USD', change: '+0.24%', up: true, action: 'Buy' as const, icon: img('sig-xau', 'png'), path: 'M0 12 L8 13 L14 10 L20 12 L28 9 L36 11 L44 8 L52 10 L60 8 L68 9' },
];

export const COURSES = [
  { title: 'Technical Analysis for Beginners', meta: '12 Lessons · 1.5h', image: img('course1') },
  { title: 'Price Action Strategy Masterclass', meta: '18 Lessons · 3.2h', image: img('course2') },
  { title: 'Gold Trading Fundamentals', meta: '10 Lessons · 2h', image: img('course3') },
];

export const STORIES = [
  { id: 's1', title: 'Technical Analysis', time: '2h ago', image: img('story1') },
  { id: 's2', title: 'Trading Setup', time: '4h ago', image: img('story2') },
  { id: 's3', title: 'Life As a Trader', time: '6h ago', image: img('story3') },
  { id: 's4', title: 'Event Highlights', time: '12h ago', image: img('story4') },
];

export interface ReplyItem { id: string; name: string; handle: string; time: string; text: string; likes: number; avatar: string }
export interface CommentItem extends ReplyItem { replies: ReplyItem[] }

export interface FeedPost {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  time: string;
  precision?: number;
  text: string;
  image?: string;
  tags: string[];
  likes: number;
  views: string;
  saves: number;
  liked?: boolean;
  saved?: boolean;
  following?: boolean;
  own?: boolean;
  /** Comments not shown in the thread (demo totals). */
  commentBase?: number;
  comments: CommentItem[];
}

const rep = (id: string): ReplyItem => ({ id, name: 'Sarah Kim', handle: '@sarahkim', time: '1 hour ago', avatar: IMG.reptile, likes: 5, text: 'Agree on AI-powered insights. The next step is making those signals actionable without adding noise to the trading view.' });

export const SEED_COMMENTS: CommentItem[] = [
  { id: 'cm1', name: 'Daniel Tan', handle: '@sarahkim', time: '1 hour ago', avatar: IMG.daniel, likes: 5, text: 'Great breakdown on cleaner interfaces. I’ve been seeing the same trend in mobile trading apps — less clutter makes it easier to scan the market quickly.', replies: [rep('r1'), rep('r2'), rep('r4')] },
  { id: 'cm2', name: 'Sarah Kim', handle: '@sarahkim', time: '1 hour ago', avatar: IMG.reptile, likes: 5, text: 'Agree on AI-powered insights. The next step is making those signals actionable without adding noise to the trading view.', replies: [rep('r3')] },
  { id: 'cm3', name: 'Josh', handle: '@joshtrades', time: '2 hours ago', avatar: IMG.josh, likes: 5, text: 'Agree on AI-powered insights. The next step is making those signals actionable without adding noise to the trading view.', replies: [] },
];

export const SEED_POSTS: FeedPost[] = [
  {
    id: 'fp1', name: 'BTC Research', handle: '@btc_research', avatar: IMG.btcResearch, verified: true, time: '12 min ago', precision: 87,
    text: 'Bitcoin watchlist: look for a confirmed breakout, not just a spike. Volume, liquidity and a retest of resistance matter more than a single green candle. What would confirm your BTC thesis?',
    image: IMG.postBtc, tags: ['#Bitcoin', '#BTC', '#Crypto', '#MarketWatch'], likes: 1200, views: '24.8k', saves: 214, liked: true, saved: true, commentBase: 83, comments: SEED_COMMENTS,
  },
  {
    id: 'fp2', name: 'Josh', handle: '@joshtrades', avatar: IMG.josh, verified: true, time: '45 min ago', precision: 87, own: true,
    text: 'Gold is more than a safe-haven trade. For XAU/USD, I watch real yields, the US dollar and central-bank demand together. A softer dollar can help, but rising real yields may still create a headwind.',
    image: IMG.postGold, tags: ['#XAUUSD', '#Gold', '#Macro'], likes: 640, views: '9.2k', saves: 88, comments: SEED_COMMENTS.slice(1, 2),
  },
  {
    id: 'fp3', name: 'Raiden', handle: '@raiden_fx', avatar: IMG.raiden, verified: true, time: '2 hours ago', precision: 81,
    text: 'Risk first, entries second. Before you click buy, write down where the idea is wrong and what that costs you. If the number is bigger than 1% of the account, the position is too big.',
    tags: ['#RiskManagement', '#TradingStrategy', '#Forex'], likes: 482, views: '12.1k', saves: 143, comments: [],
  },
];

/* ───────────── Articles ───────────── */

export type ArticleCategory = 'Market News' | 'Technical Analysis' | 'Education' | 'Trading Strategy' | 'Platform Tutorials';

export const CATEGORY_STYLE: Record<ArticleCategory, string> = {
  'Market News': 'bg-[#fff1e0] text-[#c2610c]',
  'Technical Analysis': 'bg-[#e0f2fe] text-[#0369a1]',
  Education: 'bg-[#ffeedd] text-[#c2410c]',
  'Trading Strategy': 'bg-[#dcfce7] text-[#15803d]',
  'Platform Tutorials': 'bg-[#fee2e2] text-[#b91c1c]',
};

export interface Article {
  id: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  handle: string;
  avatar: string;
  date: string;
  views: string;
  comments: number;
  saves: number;
  liked?: boolean;
  saved?: boolean;
  following?: boolean;
  own?: boolean;
}

export const ARTICLES: Article[] = [
  { id: 'a1', category: 'Market News', title: 'BTC breaks above $70K – What’s next?', excerpt: 'Bitcoin has surged past the $70,000 resistance level, reigniting bullish sentiment across the market. Here’s what to watch next.', cover: img('cover1'), author: 'Josh', handle: '@joshtrades', avatar: IMG.josh, date: 'Oct 5', views: '12.4k', comments: 86, saves: 142, liked: true, own: true },
  { id: 'a2', category: 'Technical Analysis', title: 'How I Use Trend Channels for Better Entries', excerpt: 'This article covers one of the simplest yet most effective tools in technical analysis. In this article, I’ll show how I draw and trade them.', cover: img('cover2'), author: 'James', handle: '@joshtrades', avatar: IMG.reptile, date: 'Oct 5', views: '3.7k', comments: 24, saves: 98 },
  { id: 'a3', category: 'Education', title: 'Best Low Spread Brokers of 2027 (Comparison)', excerpt: 'We compare the top low spread brokers based on fees, execution speed, regulation, and platform features.', cover: img('cover3'), author: 'James', handle: '@joshtrades', avatar: IMG.reptile, date: 'Oct 5', views: '6.2k', comments: 41, saves: 127 },
  { id: 'a4', category: 'Trading Strategy', title: 'A Beginner’s Guide to RSI (With Examples)', excerpt: 'The Relative Strength Index (RSI) is a powerful momentum indicator. In this guide, you’ll learn what it is and how to read it.', cover: img('cover4'), author: 'Josh', handle: '@joshtrades', avatar: IMG.josh, date: 'Oct 5', views: '5.1k', comments: 32, saves: 116, liked: true, own: true },
  { id: 'a5', category: 'Trading Strategy', title: 'Position Sizing: Risk Before Reward', excerpt: 'Trade size matters. Learn how your stop-loss distance and risk budget shape each position.', cover: img('cover5'), author: 'Josh', handle: '@joshtrades', avatar: IMG.josh, date: 'Oct 4', views: '4.4k', comments: 19, saves: 73, own: true },
  { id: 'a6', category: 'Technical Analysis', title: 'Breakout or Fakeout? What to Watch', excerpt: 'Not every break of a level is real. Here are the signs I look for before trusting a breakout.', cover: img('cover6'), author: 'James', handle: '@joshtrades', avatar: IMG.reptile, date: 'Oct 4', views: '3.1k', comments: 15, saves: 61 },
];

export const ARTICLE_FILTERS = [
  { id: 'all', label: 'All Articles', count: '1.2K' },
  { id: 'Market News', label: 'Market News', count: '324' },
  { id: 'Trading Strategy', label: 'Trading Strategy', count: '188' },
  { id: 'Technical Analysis', label: 'Technical Analysis', count: '142' },
  { id: 'Education', label: 'Education', count: '68' },
  { id: 'Platform Tutorials', label: 'Platform Tutorials', count: '56' },
] as const;

export const INTEREST_STYLES = [
  'bg-[#ffecd4] text-[#c2610c]', 'bg-[#dbeafe] text-[#1d4ed8]', 'bg-[#fee2e2] text-[#dc2626]', 'bg-[#e9e5ff] text-[#5945F1]',
  'bg-[#d6f5e0] text-[#15803d]', 'bg-[#ffecd4] text-[#c2610c]', 'bg-[#ebe8ff] text-[#5945F1]', 'bg-[#fee2e2] text-[#dc2626]', 'bg-[#d6f5e0] text-[#15803d]',
];
export const DEFAULT_INTERESTS = ['#Bitcoin', '#TradingStrategy', '#RiskManagement', '#TechnicalAnalysis', '#Forex', '#MarketNews', '#Options', '#TradingPsychology', '#Education'];

export const READ_BODY: { h?: string; p: string[] }[] = [
  { h: 'The next chapter of trading platforms', p: ['The trading space is evolving rapidly, and with it, user expectations for cleaner, smarter and more intuitive experiences. As we move into 2026–2027, UI design isn’t just about aesthetics — it’s about helping traders make better decisions, faster, with less friction.', 'In this article, I’ll share key UI trends, design principles and opportunities that can shape the next generation of trading platforms, combining insights from current products, user behaviour and the broader design industry.'] },
  { h: '1. Cleaner and more focused interfaces', p: ['Traders deal with a lot of information. The trend is moving towards cleaner, more focused interfaces that surface the most important data without overwhelming the user. This means better use of hierarchy, whitespace and progressive disclosure.'] },
  { h: '2. Personalisation through modular design', p: ['Every trader is different. Modular dashboards and customisable widgets allow users to create a workspace that fits their strategy and goals. In 2026, we’ll see more platforms giving users control over what they see, how they see it, and how they interact with it.'] },
  { h: '3. AI-powered insights', p: ['AI is becoming a core part of the trading experience, from personalised insights to real-time market summaries. The key is to present AI-driven information in a way that feels helpful and trustworthy, not overwhelming.'] },
  { h: 'The next chapter of trading platforms', p: ['Good UI doesn’t just provide information — it builds confidence. Through clear visualisations, consistent patterns and thoughtful feedback, we can help traders feel more in control, especially in volatile markets.'] },
];

export const ME = { name: 'Josh', handle: '@joshtrades', rank: 'Rookie', following: 128, followers: '3.4k', bio: ['Retail trader sharing my learning journey.', 'Focus on price action, risk management and long-term growth.'], location: 'Bangkok, Thailand', joined: 'Mar 2024', posts: 42, articles: 24, activity: '3.2k' };
