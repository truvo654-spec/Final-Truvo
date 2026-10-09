import { AiContext, AiMessage, AiReply, AiStat } from './aiTypes';
import { AiSectionData } from './AiSection';
import { advisorsRead, communityRead, portfolioRead, strategyRead } from './aiFeature';
import { INITIAL_FEED_POSTS, MORE_FEED_POSTS, COMMUNITY_ARTICLES } from '../../data/communityData';
import { mid } from './aiUtil';

const toMessage = (d: AiSectionData, surface: AiMessage['surface'], items: AiMessage['items'], sources: string[]): AiMessage => ({
  id: mid(),
  role: 'ai',
  surface,
  heading: d.headline,
  paragraphs: [d.overview, ...(d.columns ?? []).flatMap((c) => c.items.map((i) => `${i.title}: ${i.text}`))].filter(Boolean),
  stats: (d.chips ?? []).map((c): AiStat => ({ label: c.label, value: c.value, tone: c.tone === 'lime' ? 'good' : c.tone === 'pink' ? 'bad' : 'neutral' })),
  items,
  sources,
  note: d.footnote,
});

/** Accounts, equity, drawdown and goals. */
export function portfolioAnswer(ctx: AiContext, days = 30): AiReply {
  if (!ctx.allowTrades) {
    return { msg: { id: mid(), role: 'ai', surface: 'portfolio', heading: 'Your trades are switched off', paragraphs: ['Turn “Use my portfolio trades” on in the panel and I can read your accounts, drawdown and goals.'], followUps: ['Give me today’s briefing'] }, mem: { surface: 'portfolio' } };
  }
  const d = portfolioRead([], days);
  return {
    msg: {
      ...toMessage(d, 'portfolio', [
        { title: 'Open the Portfolio Tracker', sub: 'Accounts, analytics and goals', tab: 'portfolio-tracker' },
        { title: 'Connect another account', sub: 'Sync a broker to track it here', tab: 'connect-to-truvo' },
      ], ['Your accounts', 'Your trades', 'Your goals']),
      followUps: ['How are my trades doing?', 'Show my last 90 days', 'Am I close to my goals?', 'What should I do next?'],
    },
    mem: { surface: 'portfolio', range: days === 7 || days === 90 ? days : 30 },
  };
}

/** Backtesting and the strategy builder. */
export function strategyAnswer(): AiReply {
  const d = strategyRead();
  return {
    msg: {
      ...toMessage(d, 'strategy', [
        { title: 'Open the Backtest tab', sub: 'In the Trading Journal', tab: 'trading-journal' },
        { title: 'Open the Strategy Builder', sub: 'Build and test a rule set', tab: 'strategy-builder' },
      ], ['Your playbooks', 'Your journal']),
      followUps: ['How do my playbooks compare?', 'What should I backtest first?', 'Any habits I should watch?'],
    },
    mem: { surface: 'strategy' },
  };
}

/** Expert advisors and alerts. */
export function toolsAnswer(ctx: AiContext, focus: 'advisors' | 'alerts' | 'all' = 'all'): AiReply {
  const d = advisorsRead(undefined, ctx.user.tierLevel);
  const alertLimit = ctx.user.tierLevel >= 3 ? 999 : ctx.user.tierLevel === 2 ? 25 : 5;
  const base = toMessage(d, 'tools', [
    { title: 'Browse Expert Advisors', sub: 'Versioned, tiered, drawdown shown', tab: 'expert-advisors' },
    { title: 'Set up alerts', sub: `Your plan allows ${alertLimit === 999 ? 'unlimited' : alertLimit} alerts`, tab: 'alerts' },
  ], ['Advisor listings', 'Your plan']);
  if (focus === 'alerts') {
    return {
      msg: {
        id: mid(), role: 'ai', surface: 'tools',
        heading: 'Alerts on your plan',
        paragraphs: [
          `Your ${ctx.user.rankTitle} plan allows ${alertLimit === 999 ? 'unlimited' : alertLimit} alerts. Price, volatility and news alerts all count towards it.`,
          'A good alert marks a level you would actually trade. If it is more than about 5% away it will sit quiet and use up a slot.',
          'Set the delivery channel when you create it: an alert with app, email and SMS all off fires silently.',
          'An alert tells you to look, not to click. Decide the entry, stop and size before it fires.',
        ],
        items: [{ title: 'Open Alerts', tab: 'alerts' }, { title: 'See plan limits', tab: 'member-plan' }],
        sources: ['Your plan'],
        followUps: ['Which expert advisor is safest?', 'What should I do next?'],
      },
      mem: { surface: 'tools' },
    };
  }
  return { msg: { ...base, followUps: ['Which expert advisor is safest?', 'How many alerts can I set?', 'What should I backtest first?'] }, mem: { surface: 'tools' } };
}

/** The community feed and articles. */
export function communityAnswer(): AiReply {
  const posts = [...INITIAL_FEED_POSTS, ...MORE_FEED_POSTS].map((p) => ({
    name: p.author.name, text: p.content, likes: p.likes, saves: p.bookmarksCount ?? 0,
    tags: (p.tags ?? []).map((t) => (t.startsWith('#') ? t : `#${t}`)), own: p.isCurrentUser, comments: p.comments ?? [],
  }));
  const articles = COMMUNITY_ARTICLES.map((a) => ({
    title: a.title, category: a.tickerBadge, author: a.publisher.name,
    views: a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}k` : String(a.views), comments: a.likes, saves: a.likes,
  }));
  const d = communityRead(posts, articles);
  return {
    msg: {
      ...toMessage(d, 'community', [
        { title: 'Open the Community feed', tab: 'community' },
        { title: 'Read the articles', tab: 'community' },
      ], ['Community posts', 'Community articles']),
      followUps: ['What should I read?', 'What should I do next?', 'Give me today’s briefing'],
    },
    mem: { surface: 'community' },
  };
}
