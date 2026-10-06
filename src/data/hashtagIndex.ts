import { CommunityPost, EconomicEvent, MarketSignal, NewsArticle, Course, Broker } from '../types';
import { COMMUNITY_ARTICLES_TAB, CommunityArticleItem } from './communityArticlesTabData';
import { INITIAL_FEED_POSTS, MORE_FEED_POSTS, CRYPTO_ADVENTURE_POSTS } from './communityData';
import { TRENDING_POSTS, TrendingPost } from './communityTrendingPostsData';
import { NEWS_ARTICLES } from './newsData';
import { INITIAL_SIGNALS, INITIAL_BROKERS } from './mockData';
import { CANONICAL_SCREENSHOT_INSTRUMENTS, InstrumentRow } from '../components/analysis/instrumentAnalysisData';
import { ECONOMIC_EVENTS } from './economicCalendarData';
import { COURSES } from './educationData';
import { PROMOTIONS, Promotion } from './promotionsData';

export type FeatureKind = 'post' | 'news' | 'signal' | 'analysis' | 'event' | 'course' | 'broker' | 'offer';

export const FEATURE_LABEL: Record<FeatureKind, string> = {
  post: 'Community',
  news: 'News',
  signal: 'Signals',
  analysis: 'Analysis',
  event: 'Calendar',
  course: 'Learn',
  broker: 'Brokers',
  offer: 'Offers',
};

export type HashtagItem =
  | { kind: 'post'; id: string; age: number; score: number; tags: string[]; post: CommunityPost; replies: number }
  | { kind: 'trending'; id: string; age: number; score: number; tags: string[]; post: TrendingPost }
  | { kind: 'news'; id: string; age: number; score: number; tags: string[]; article: NewsArticle }
  | { kind: 'signal'; id: string; age: number; score: number; tags: string[]; signal: MarketSignal }
  | { kind: 'analysis'; id: string; age: number; score: number; tags: string[]; row: InstrumentRow }
  | { kind: 'event'; id: string; age: number; score: number; tags: string[]; event: EconomicEvent }
  | { kind: 'article'; id: string; age: number; score: number; tags: string[]; article: CommunityArticleItem }
  | { kind: 'broker'; id: string; age: number; score: number; tags: string[]; broker: Broker }
  | { kind: 'course'; id: string; age: number; score: number; tags: string[]; course: Course }
  | { kind: 'offer'; id: string; age: number; score: number; tags: string[]; promo: Promotion };

/** The feature an item belongs to (trending posts are Community too). */
export const featureOf = (i: HashtagItem): FeatureKind => (i.kind === 'trending' || i.kind === 'article' ? 'post' : i.kind);

/* ───────────── matching ───────────── */

export const norm = (s: string) => s.replace(/^#/, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** A tag can stand for several spellings. Anything not listed matches itself. */
const ALIASES: Record<string, string[]> = {
  bitcoin: ['bitcoin', 'btc', 'btcusd', 'btcusdt', 'xbt'],
  btc: ['bitcoin', 'btc', 'btcusd', 'btcusdt'],
  ethereum: ['ethereum', 'eth', 'ethusd', 'ethusdt'],
  eth: ['ethereum', 'eth', 'ethusd', 'ethusdt'],
  gold: ['gold', 'xau', 'xauusd'],
  xauusd: ['gold', 'xau', 'xauusd'],
  xau: ['gold', 'xau', 'xauusd'],
  eurusd: ['eurusd', 'eur'],
  usd: ['usd', 'dollar', 'dxy'],
  dollar: ['usd', 'dollar', 'dxy'],
  oil: ['oil', 'wti', 'brent', 'crude'],
  sp500: ['sp500', 'spx', 'us500'],
  nasdaq: ['nasdaq', 'nas100', 'ndx'],
  marketnews: ['news'],
  technicalanalysis: ['technicalanalysis', 'technical', 'breakout', 'rsi'],
  riskmanagement: ['riskmanagement', 'risk'],
  tradingstrategy: ['tradingstrategy', 'strategy'],
};

/** Words that stand for a whole asset class. */
const CLASS_TAGS: Record<string, string> = { forex: 'forex', crypto: 'crypto', stocks: 'stocks', commodities: 'commodity', commodity: 'commodity', indices: 'indices' };

export const keysFor = (tag: string): string[] => ALIASES[norm(tag)] ?? [norm(tag)];

/**
 * Topic tags are ideas, not names. They match whole phrases inside text, so #TradingStrategy
 * finds a post about a breakout setup even if nobody typed the tag.
 */
const PHRASES: Record<string, string[]> = {
  tradingstrategy: ['strategy', 'strategies', 'setup', 'breakout', 'swing', 'scalp', 'playbook', 'trend following', 'pullback'],
  daytrading: ['day trade', 'day trading', 'day trader', 'intraday', 'scalp', 'scalping', 'session'],
  marketnews: ['market news', 'headline', 'headlines', 'breaking'],
  options: ['options', 'implied volatility', 'skew', 'calls and puts', 'put option', 'call option'],
  psychology: ['psychology', 'emotion', 'discipline', 'fomo', 'revenge trad', 'mindset', 'bias'],
  riskmanagement: ['risk management', 'risk per trade', 'stop loss', 'stop-loss', 'position size', 'position sizing', 'drawdown', 'leverage'],
  technicalanalysis: ['technical', 'rsi', 'support', 'resistance', 'moving average', 'candlestick', 'chart pattern'],
  forex: ['forex', 'currency', 'currencies', ' fx '],
  stocks: ['stocks', 'equities', 'earnings', 'shares'],
};

/** Tags that stand for every item of a feature, not a keyword. */
const WHOLE_FEATURE: Record<string, FeatureKind[]> = { marketnews: ['news'] };

const phrasesFor = (tag: string) => PHRASES[norm(tag)] ?? [];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function matches(keys: string[], tagList: string[], text: string, assetClass?: string, phrases: string[] = []): boolean {
  const normTags = tagList.map(norm);
  if (normTags.some((t) => keys.includes(t))) return true;
  if (assetClass && keys.includes(norm(assetClass))) return true;
  const t = ` ${text.toLowerCase()} `;
  if (phrases.some((p) => t.includes(p.startsWith(' ') ? p : p))) return true;
  return keys.some((k) => k.length >= 3 && new RegExp(`(^|[^a-z0-9])${escapeRe(k)}([^a-z0-9]|$)`).test(t));
}

const hashtagsIn = (text: string) => (text.match(/#[A-Za-z][A-Za-z0-9_]*/g) || []).map((h) => h.slice(1));

/** Roughly how old a label like "8 minutes ago", "3h" or "Sep 2" is, in minutes. Smaller is newer. */
export function ageMinutes(label: string | undefined): number {
  if (!label) return 99999;
  const s = label.toLowerCase().trim();
  if (/just now|^now$/.test(s)) return 0;
  const m = s.match(/(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks)\b/);
  if (m) {
    const n = Number(m[1]);
    const u = m[2][0];
    return u === 'm' ? n : u === 'h' ? n * 60 : u === 'd' ? n * 1440 : n * 10080;
  }
  const md = s.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/);
  if (md) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const then = Date.UTC(2026, months.indexOf(md[1]), Number(md[2]));
    return Math.max(0, Math.round((Date.UTC(2026, 9, 5) - then) / 60000));
  }
  return 99999;
}

const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);

/* ───────────── collect ───────────── */

const POSTS: CommunityPost[] = (() => {
  const seen = new Set<string>();
  return [...INITIAL_FEED_POSTS, ...MORE_FEED_POSTS, ...CRYPTO_ADVENTURE_POSTS].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
})();

export function itemsForHashtag(tag: string): HashtagItem[] {
  const keys = keysFor(tag);
  const phrases = phrasesFor(tag);
  const whole = WHOLE_FEATURE[norm(tag)] ?? [];
  const out: HashtagItem[] = [];

  POSTS.forEach((p) => {
    const text = `${p.title} ${p.content} ${p.ticker ?? ''}`;
    const tags = [...p.tags, ...hashtagsIn(p.content), p.ticker ?? ''];
    if (matches(keys, tags, text, undefined, phrases)) {
      out.push({ kind: 'post', id: `post_${p.id}`, age: ageMinutes(p.timestamp), score: num(p.likes) + p.commentsCount * 3 + num(p.repostsCount) * 2, tags, post: p, replies: p.commentsCount });
    }
  });

  TRENDING_POSTS.forEach((p) => {
    const tags = [...(p.hashtags ?? []), ...p.tokenMentions.map((t) => t.symbol)];
    if (matches(keys, tags, `${p.title} ${p.body}`, p.market, phrases)) {
      out.push({ kind: 'trending', id: `trend_${p.id}`, age: ageMinutes(p.timeAgo), score: p.influenceScore * 6 + p.predictPrecision * 3, tags, post: p });
    }
  });

  NEWS_ARTICLES.forEach((a) => {
    if (whole.includes('news') || matches(keys, a.tags, `${a.headline} ${a.excerpt}`, a.assetClass, phrases)) {
      out.push({ kind: 'news', id: `news_${a.id}`, age: ageMinutes(a.timestamp), score: a.claps + a.commentsCount * 3, tags: a.tags, article: a });
    }
  });

  INITIAL_SIGNALS.forEach((s) => {
    if (matches(keys, [s.ticker, s.name], `${s.ticker} ${s.name} ${s.analysis}`, s.assetClass, phrases)) {
      out.push({ kind: 'signal', id: `sig_${s.id}`, age: ageMinutes(s.timestamp), score: s.confidence * 8, tags: [s.ticker, s.assetClass], signal: s });
    }
  });

  CANONICAL_SCREENSHOT_INSTRUMENTS.forEach((r) => {
    if (matches(keys, [r.symbol, r.name], `${r.name} ${r.symbol}`, undefined, [])) {
      out.push({ kind: 'analysis', id: `inst_${r.id}`, age: 30, score: Math.abs(r.change) * 200 + 400, tags: [r.symbol, r.name], row: r });
    }
  });

  ECONOMIC_EVENTS.forEach((e) => {
    // Only what matters now: within about two weeks, and not low impact, so a broad tag like #Forex is not 40 calendar rows
    const days = (Date.parse(e.at) - Date.UTC(2026, 9, 5)) / 86400000;
    const soon = days >= -3 && days <= 14 && e.impact !== 'Low';
    if (!e.allDay && (soon || whole.includes('event')) && matches(keys, [e.currency, e.category, e.country], `${e.title} ${e.summary}`, e.assetClass, phrases)) {
      out.push({ kind: 'event', id: `evt_${e.id}`, age: Math.max(0, Math.round(Math.abs(days) * 1440)), score: e.impact === 'High' ? 500 : e.impact === 'Medium' ? 250 : 80, tags: [e.currency, e.category], event: e });
    }
  });

  COURSES.forEach((c) => {
    if (matches(keys, [c.category], `${c.title} ${c.summary}`, undefined, phrases)) {
      out.push({ kind: 'course', id: `course_${c.id}`, age: 5000, score: c.enrolledCount / 4 + c.rating * 60, tags: [c.category], course: c });
    }
  });

  PROMOTIONS.forEach((p) => {
    if (p.source === 'broker' && matches(keys, [p.kind, p.brokerName], `${p.title} ${p.summary}`, undefined, phrases)) {
      out.push({ kind: 'offer', id: `offer_${p.id}`, age: p.addedDaysAgo * 1440, score: 300 - p.endsInDays, tags: [p.kind, p.brokerName], promo: p });
    }
  });

  COMMUNITY_ARTICLES_TAB.forEach((a) => {
    const tags = [a.category, a.categoryLabel];
    if (matches(keys, tags, `${a.title} ${a.excerpt}`, undefined, phrases)) {
      out.push({ kind: 'article', id: `art_${a.id}`, age: ageMinutes(a.timeAgo), score: a.likes + a.comments * 3 + a.views / 20, tags, article: a });
    }
  });

  INITIAL_BROKERS.forEach((b) => {
    // A broker is relevant to the markets it offers
    const markets = [b.category, ...(b.category === 'Multi-Asset' ? ['forex', 'stocks', 'commodities', 'indices', 'crypto', 'gold'] : []), ...(b.category === 'Raw Spread' || b.category === 'Forex' ? ['forex'] : []), ...(b.category === 'Crypto' ? ['crypto', 'bitcoin'] : [])];
    const tags = [b.name, ...markets, ...b.platforms, ...b.regulations];
    if (matches(keys, tags, `${b.highlights ?? ''}`, undefined, [])) {
      out.push({ kind: 'broker', id: `broker_${b.id}`, age: 9000, score: (b.score ?? 8) * 40 + b.cashbackPerLot * 10, tags, broker: b });
    }
  });

  return out;
}

/* ───────────── summary ───────────── */

export interface HashtagSummary {
  total: number;
  features: number;
  counts: Record<FeatureKind, number>;
  buy: number;
  sell: number;
  avgConfidence: number;
  bullishPct: number | null;
  instrument?: InstrumentRow;
  topPost?: CommunityPost | TrendingPost;
  latestNews?: NewsArticle;
  nextEvent?: EconomicEvent;
  text: string;
  points: string[];
}

export const prettyTag = (tag: string) => {
  const t = tag.replace(/^#/, '');
  return t.length <= 4 ? t.toUpperCase() : t.charAt(0).toUpperCase() + t.slice(1);
};

export function summarize(tag: string, items: HashtagItem[]): HashtagSummary {
  const counts: Record<FeatureKind, number> = { post: 0, news: 0, signal: 0, analysis: 0, event: 0, course: 0, broker: 0, offer: 0 };
  items.forEach((i) => (counts[featureOf(i)] += 1));

  const signals = items.filter((i): i is Extract<HashtagItem, { kind: 'signal' }> => i.kind === 'signal');
  const buy = signals.filter((s) => s.signal.action === 'BUY').length;
  const sell = signals.length - buy;
  const avgConfidence = signals.length ? Math.round(signals.reduce((a, s) => a + s.signal.confidence, 0) / signals.length) : 0;

  // Sentiment: news tone, signal direction, tagged community tokens and the instrument move
  let bull = 0;
  let bear = 0;
  items.forEach((i) => {
    if (i.kind === 'news') {
      if (i.article.sentiment === 'Bullish') bull++;
      if (i.article.sentiment === 'Bearish') bear++;
    } else if (i.kind === 'signal') {
      if (i.signal.action === 'BUY') bull++;
      else bear++;
    } else if (i.kind === 'trending') {
      i.post.tokenMentions.forEach((t) => (t.sentiment === 'Bullish' ? bull++ : bear++));
    } else if (i.kind === 'post') {
      i.post.tokenMentions?.forEach((t) => (t.sentiment === 'Bullish' ? bull++ : t.sentiment === 'Bearish' ? bear++ : 0));
    } else if (i.kind === 'analysis') {
      if (i.row.change >= 0) bull++;
      else bear++;
    }
  });
  const bullishPct = bull + bear ? Math.round((bull / (bull + bear)) * 100) : null;

  const instrument = items.find((i): i is Extract<HashtagItem, { kind: 'analysis' }> => i.kind === 'analysis')?.row;
  const posts = items.filter((i) => i.kind === 'post' || i.kind === 'trending').sort((a, b) => b.score - a.score);
  const topPost = posts[0] ? (posts[0].kind === 'post' ? (posts[0] as Extract<HashtagItem, { kind: 'post' }>).post : (posts[0] as Extract<HashtagItem, { kind: 'trending' }>).post) : undefined;
  const latestNews = items.filter((i): i is Extract<HashtagItem, { kind: 'news' }> => i.kind === 'news').sort((a, b) => a.age - b.age)[0]?.article;
  const nextEvent = items.filter((i): i is Extract<HashtagItem, { kind: 'event' }> => i.kind === 'event').sort((a, b) => a.age - b.age)[0]?.event;

  const name = prettyTag(tag);
  const features = (Object.keys(counts) as FeatureKind[]).filter((k) => counts[k] > 0).length;
  const points: string[] = [];
  const articleCount = items.filter((i) => i.kind === 'article').length;
  const postCount = counts.post - articleCount;
  if (postCount) points.push(`${postCount} community ${postCount === 1 ? 'post' : 'posts'}${topPost ? `, led by ${'author' in topPost ? topPost.author.name : topPost.authorName}` : ''}.`);
  if (articleCount) points.push(`${articleCount} community ${articleCount === 1 ? 'article' : 'articles'}.`);
  if (counts.news) points.push(`${counts.news} news ${counts.news === 1 ? 'story' : 'stories'}${latestNews ? `. Latest: “${latestNews.headline}” (${latestNews.source}).` : '.'}`);
  if (signals.length) points.push(`${signals.length} trading ${signals.length === 1 ? 'signal' : 'signals'}: ${buy} buy, ${sell} sell, ${avgConfidence}% average confidence.`);
  if (instrument) points.push(`${instrument.name} is ${instrument.change >= 0 ? 'up' : 'down'} ${Math.abs(instrument.change).toFixed(2)}% today and ${instrument.return1M >= 0 ? 'up' : 'down'} ${Math.abs(instrument.return1M).toFixed(1)}% over a month, RSI ${instrument.rsi}.`);
  if (nextEvent) points.push(`On the calendar: ${nextEvent.title} (${nextEvent.currency}, ${nextEvent.impact.toLowerCase()} impact).`);
  if (counts.course) points.push(`${counts.course} ${counts.course === 1 ? 'lesson' : 'lessons'} to learn more.`);
  if (counts.broker) points.push(`${counts.broker} ${counts.broker === 1 ? 'broker covers' : 'brokers cover'} this market.`);
  if (counts.offer) points.push(`${counts.offer} broker ${counts.offer === 1 ? 'offer mentions' : 'offers mention'} it.`);

  const lean = bullishPct === null ? '' : bullishPct >= 60 ? ` The mood leans bullish (${bullishPct}%).` : bullishPct <= 40 ? ` The mood leans bearish (${100 - bullishPct}%).` : ` The mood is mixed (${bullishPct}% bullish).`;
  const text = items.length
    ? `#${name} shows up in ${items.length} ${items.length === 1 ? 'item' : 'items'} across ${features} ${features === 1 ? 'feature' : 'features'}.${lean}`
    : `Nothing on #${name} yet.`;

  return { total: items.length, features, counts, buy, sell, avgConfidence, bullishPct, instrument, topPost, latestNews, nextEvent, text, points };
}

/** Other tags that appear alongside this one. */
export function relatedTags(tag: string, items: HashtagItem[], limit = 8): { tag: string; count: number }[] {
  const self = new Set(keysFor(tag));
  const counts = new Map<string, { tag: string; count: number }>();
  items.forEach((i) => {
    new Set(i.tags.filter(Boolean)).forEach((t) => {
      const clean = t.replace(/^#/, '');
      const n = norm(clean);
      if (!n || self.has(n) || n.length < 3 || /^\d/.test(n)) return;
      const e = counts.get(n) || { tag: clean, count: 0 };
      e.count += 1;
      counts.set(n, e);
    });
  });
  return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Tags worth showing as suggestions or trending. */
export const TRENDING_TAGS = ['Bitcoin', 'XAUUSD', 'Forex', 'Ethereum', 'TechnicalAnalysis', 'RiskManagement', 'MarketNews', 'Crypto'];
