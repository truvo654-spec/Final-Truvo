import { EXPERT_ADVISORS, ExpertAdvisor } from '../../data/expertAdvisorData';
import { PORTFOLIO_ACCOUNTS, PORTFOLIO_TRADES, DEFAULT_GOALS } from '../../data/portfolioData';
import { JOURNAL_ENTRIES } from '../../data/journalData';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import { isClosed, maxDrawdown, sliceSeries, totalSeries, tradeStats, tradesInRange, groupPnl } from '../portfolio/portfolioMath';
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
import { COURSES, CERTIFICATES } from '../../data/educationData';
import { ECONOMIC_EVENTS, CALENDAR_NOW } from '../../data/economicCalendarData';
import { NEWS_ARTICLES } from '../../data/newsData';
import { PROMOTIONS } from '../../data/promotionsData';
import { GAMIFICATION_TIERS, INITIAL_MISSIONS, LEADERBOARD_USERS } from '../../data/mockData';
import { AiSectionData, ACCENT } from './AiSection';
import type { SpotlightData, SpotlightSuggestion } from './AiSpotlightPanel';

const money = (v: number) => `${v < 0 ? '-' : v > 0 ? '+' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;
const pct = (v: number, d = 0) => `${v.toFixed(d)}%`;
const plural = (n: number, w: string) => `${n} ${n === 1 ? w : `${w}s`}`;

/* ───────────── Expert Advisors ───────────── */

export function advisorsRead(list: ExpertAdvisor[] = EXPERT_ADVISORS, tierLevel = 1): AiSectionData {
  if (!list.length) {
    return { eyebrow: 'Expert advisors', headline: 'Nothing to read here yet', overview: '', empty: { text: 'No advisors match the filters you have set. Clear a filter and I will compare them for you.' } };
  }
  const score = (e: ExpertAdvisor) => e.stats.profitFactor * 10 - e.stats.maxDD + e.stats.liveDays / 30;
  const ranked = [...list].sort((a, b) => score(b) - score(a));
  const best = ranked[0];
  const safest = [...list].sort((a, b) => a.stats.maxDD - b.stats.maxDD)[0];
  const riskiest = [...list].sort((a, b) => b.stats.maxDD - a.stats.maxDD)[0];
  const young = list.filter((e) => e.stats.liveDays < 180);
  const locked = list.filter((e) => e.minPlan > Math.max(0, tierLevel - 1));
  const avgDD = list.reduce((a, e) => a + e.stats.maxDD, 0) / list.length;

  return {
    eyebrow: 'Expert advisors',
    reading: `Reading ${plural(list.length, 'advisor')}…`,
    headline: `${best.name} has the steadiest record, ${riskiest.name} the roughest`,
    overview: `Across ${plural(list.length, 'advisor')} the average worst drawdown is ${pct(avgDD, 1)}. ${best.name} pairs a ${best.stats.profitFactor.toFixed(2)} profit factor with ${pct(best.stats.maxDD, 1)} drawdown over ${plural(best.stats.liveDays, 'day')} live, while ${riskiest.name} has given back ${pct(riskiest.stats.maxDD, 1)} at its worst.`,
    chips: [
      { label: 'Advisors', value: String(list.length) },
      { label: 'Best profit factor', value: best.stats.profitFactor.toFixed(2), tone: 'lime' },
      { label: 'Lowest drawdown', value: pct(safest.stats.maxDD, 1), tone: 'lime' },
      { label: 'Highest drawdown', value: pct(riskiest.stats.maxDD, 1), tone: 'pink' },
      { label: 'Under 6 months live', value: String(young.length) },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Worth a closer look',
        items: [
          { title: best.name, text: `${best.strategy} on ${best.pairs.slice(0, 3).join(', ')}. ${pct(best.stats.winRate, 0)} win rate, ${best.stats.profitFactor.toFixed(2)} profit factor and ${pct(best.stats.maxDD, 1)} worst drawdown across ${best.stats.trades.toLocaleString()} trades.` },
          { title: `Gentlest ride: ${safest.name}`, text: `Worst drawdown ${pct(safest.stats.maxDD, 1)} with ${pct(safest.stats.monthly, 1)} a month on the published record. ${safest.risk} risk setting.` },
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'Read the small print',
        items: [
          { title: 'Track record length', text: young.length ? `${plural(young.length, 'advisor')} here has under six months live. Short records flatter a strategy, so size small until you have seen one through a bad month.` : 'Every advisor here has at least six months live, which is the minimum worth judging.' },
          { title: 'Drawdown is the real cost', text: `${riskiest.name} shows ${pct(riskiest.stats.maxDD, 1)} at its worst. On a $5,000 account that is about $${Math.round((riskiest.stats.maxDD / 100) * 5000).toLocaleString()} down before it recovers.` },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Before you run one',
        items: [
          { title: 'Demo first', text: 'Run it on a demo account for a few weeks on the pairs and timeframe it was built for. Published results come from the author, not from your broker and your spreads.' },
          ...(locked.length ? [{ title: 'Locked on your plan', text: `${plural(locked.length, 'advisor')} needs a higher member plan. The rest you can download now.` }] : []),
        ],
      },
    ],
    footnote: 'Built from the advisor listings on this page. Past results are the author’s own and are not a forecast. Not financial advice.',
  };
}

/* ───────────── Alerts ───────────── */

export interface AlertLike { id: string; type: 'price' | 'volatility' | 'news'; symbol: string; condition?: string; value?: number; status: 'active' | 'paused' | string; app?: boolean; email?: boolean; sms?: boolean }

export function alertsRead(alerts: AlertLike[], limit: number, distanceOf?: (a: AlertLike) => number | null): AiSectionData {
  const active = alerts.filter((a) => a.status === 'active');
  if (!alerts.length) {
    return {
      eyebrow: 'Your alerts',
      headline: 'No alerts yet',
      overview: '',
      empty: { text: 'Set a price alert on a level you actually trade and I will tell you how close it is and whether you are over-alerted.' },
    };
  }
  const byType = { price: 0, volatility: 0, news: 0 } as Record<string, number>;
  alerts.forEach((a) => { byType[a.type] = (byType[a.type] ?? 0) + 1; });
  const bySymbol = new Map<string, number>();
  alerts.forEach((a) => bySymbol.set(a.symbol, (bySymbol.get(a.symbol) ?? 0) + 1));
  const crowded = Array.from(bySymbol.entries()).sort((a, b) => b[1] - a[1])[0];
  const distances = distanceOf ? alerts.map((a) => ({ a, d: distanceOf(a) })).filter((x) => x.d != null) as { a: AlertLike; d: number }[] : [];
  const nearest = [...distances].sort((x, y) => Math.abs(x.d) - Math.abs(y.d))[0];
  const far = distances.filter((x) => Math.abs(x.d) > 5);
  const noChannel = alerts.filter((a) => !a.app && !a.email && !a.sms);
  const used = alerts.length;

  return {
    eyebrow: 'Your alerts',
    reading: `Reading ${plural(used, 'alert')}…`,
    headline: nearest && Math.abs(nearest.d) < 1 ? `${nearest.a.symbol} is about to trigger` : `${plural(active.length, 'alert')} armed, ${crowded ? `${crowded[1]} of them on ${crowded[0]}` : 'spread across your watchlist'}`,
    overview: `You have ${plural(used, 'alert')} of the ${limit} your plan allows, ${active.length} armed and ${used - active.length} paused.${nearest ? ` The closest is ${nearest.a.symbol}, ${pct(Math.abs(nearest.d), 2)} away.` : ''}${far.length ? ` ${plural(far.length, 'alert')} sits more than 5% from price, so it may be quiet for a while.` : ''}`,
    chips: [
      { label: 'Armed', value: String(active.length), tone: 'lime' },
      { label: 'Paused', value: String(used - active.length) },
      { label: 'Plan limit', value: `${used}/${limit}` },
      { label: 'Price', value: String(byType.price ?? 0) },
      { label: 'Volatility', value: String(byType.volatility ?? 0) },
      { label: 'News', value: String(byType.news ?? 0) },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Closest to firing',
        items: nearest
          ? [{ title: `${nearest.a.symbol} ${nearest.a.condition ?? ''} ${nearest.a.value ?? ''}`.trim(), text: `About ${pct(Math.abs(nearest.d), 2)} from the current price. Decide now what you will do when it fires, not after.` }]
          : [{ title: 'Nothing imminent', text: 'No price alert is close to its level right now.' }],
      },
      {
        accent: ACCENT.pink,
        title: 'Worth tidying',
        items: [
          ...(far.length ? [{ title: 'Alerts far from price', text: `${plural(far.length, 'alert')} is more than 5% away. Those eat into your plan limit without doing much; delete the ones you set weeks ago.` }] : []),
          ...(crowded && crowded[1] > 2 ? [{ title: `${crowded[1]} alerts on ${crowded[0]}`, text: 'Stacking alerts on one symbol usually means one level you care about and several you do not. Keep the level, drop the noise.' }] : []),
          ...(noChannel.length ? [{ title: 'No delivery channel', text: `${plural(noChannel.length, 'alert')} has app, email and SMS all switched off, so it will fire silently.` }] : []),
          ...(far.length || (crowded && crowded[1] > 2) || noChannel.length ? [] : [{ title: 'Nothing to clean up', text: 'Your alerts are close to price and all have a delivery channel.' }]),
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Room left',
        items: [
          { title: `${Math.max(0, limit - used)} slots free`, text: used >= limit ? 'You are at your plan limit. Delete one before adding another, or upgrade for more.' : `You can add ${plural(Math.max(0, limit - used), 'more alert')} on this plan.` },
          { title: 'An alert is not a plan', text: 'A level firing tells you to look, not to click. Write the entry, stop and size before it fires.' },
        ],
      },
    ],
    footnote: 'Built from the alerts on this page and current demo quotes. Not financial advice.',
  };
}

/* ───────────── Portfolio ───────────── */

export function portfolioRead(accountIds: string[] = [], days = 30): AiSectionData {
  const accounts = accountIds.length ? PORTFOLIO_ACCOUNTS.filter((a) => accountIds.includes(a.id)) : PORTFOLIO_ACCOUNTS;
  const trades = tradesInRange(PORTFOLIO_TRADES, days);
  const s = tradeStats(trades);
  const series = sliceSeries(totalSeries(accountIds), days, 120);
  const dd = maxDrawdown(series);
  const equity = accounts.reduce((a, x) => a + x.endBalance, 0);
  const start = accounts.reduce((a, x) => a + x.startBalance, 0);
  const growth = start ? ((equity - start) / start) * 100 : 0;
  const margin = accounts.reduce((a, x) => a + x.marginUsed, 0);
  const open = PORTFOLIO_TRADES.filter((t) => !isClosed(t));
  const float = open.reduce((a, t) => a + t.pnl, 0);
  const byClass = groupPnl(trades, (t) => t.assetClass);
  const goals = DEFAULT_GOALS.map((g) => ({
    g,
    progress: g.type === 'growth' ? Math.min(100, ((equity - (g.startBalance ?? start)) / Math.max(1, g.target)) * 100) : Math.min(100, (dd / Math.max(0.01, g.target)) * 100),
  }));
  const growthGoal = goals.find((x) => x.g.type === 'growth');
  const ddGoal = goals.find((x) => x.g.type === 'drawdown');

  if (!trades.length && !open.length) {
    return { eyebrow: 'Your portfolio', headline: 'No activity in this window', overview: '', empty: { text: `No trades closed or opened in the last ${days} days on the accounts you picked. Widen the range or pick another account.` } };
  }

  return {
    eyebrow: 'Your portfolio',
    reading: `Reading ${plural(accounts.length, 'account')}…`,
    headline: growth >= 0
      ? `${accounts.length === 1 ? accounts[0].name : `${accounts.length} accounts`} up ${pct(growth, 1)}, drawdown held at ${pct(dd, 1)}`
      : `${accounts.length === 1 ? accounts[0].name : `${accounts.length} accounts`} down ${pct(Math.abs(growth), 1)} with ${pct(dd, 1)} peak drawdown`,
    overview: `Equity across ${plural(accounts.length, 'account')} is $${equity.toLocaleString(undefined, { maximumFractionDigits: 0 })}, ${money(equity - start)} on the starting balance. Over the last ${days} days you closed ${plural(s.closed, 'trade')} for ${money(s.realized)} at a ${pct(s.winRate)} win rate, and ${open.length ? `${plural(open.length, 'position')} ${open.length === 1 ? 'is' : 'are'} still open, floating ${money(float)}` : 'nothing is open right now'}.`,
    chips: [
      { label: 'Equity', value: `$${Math.round(equity).toLocaleString()}` },
      { label: 'Growth', value: pct(growth, 1), tone: growth >= 0 ? 'lime' : 'pink' },
      { label: `${days}d net`, value: money(s.realized), tone: s.realized >= 0 ? 'lime' : 'pink' },
      { label: 'Max drawdown', value: pct(dd, 1), tone: dd > 10 ? 'pink' : 'white' },
      { label: 'Margin used', value: `$${Math.round(margin).toLocaleString()}` },
      { label: 'Open', value: String(open.length) },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'What is working',
        items: [
          byClass[0]
            ? { title: `${byClass[0].name} leads`, text: `${money(byClass[0].pnl)} over ${plural(byClass[0].count, 'trade')} with ${pct((byClass[0].wins / byClass[0].count) * 100)} wins in this window.` }
            : { title: 'Nothing closed yet', text: 'No closed trades in this window to rank.' },
          { title: 'Account spread', text: accounts.length > 1 ? `Your balance sits across ${plural(accounts.length, 'account')}: ${accounts.map((a) => `${a.name} $${Math.round(a.endBalance).toLocaleString()}`).join(', ')}.` : `Everything is on ${accounts[0].name}, last synced ${accounts[0].lastSync.toLowerCase()}.` },
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'What to watch',
        items: [
          { title: 'Drawdown', text: dd > 10 ? `Peak drawdown reached ${pct(dd, 1)} in this window. Recovering that needs about ${pct((dd / (100 - dd)) * 100, 1)} back, so cut risk until it is under control.` : `Peak drawdown was ${pct(dd, 1)}, which is a manageable dip. Keep risk per trade where it is.` },
          ...(byClass.length > 1 && byClass[byClass.length - 1].pnl < 0 ? [{ title: `${byClass[byClass.length - 1].name} is leaking`, text: `${money(byClass[byClass.length - 1].pnl)} over ${plural(byClass[byClass.length - 1].count, 'trade')}. Either halve your size there or leave it alone for a month.` }] : []),
          ...(margin > equity * 0.3 ? [{ title: 'Margin is heavy', text: `$${Math.round(margin).toLocaleString()} of margin against $${Math.round(equity).toLocaleString()} equity is more than 30%. A gap against you gets expensive fast.` }] : []),
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Your goals',
        items: [
          ...(growthGoal ? [{ title: growthGoal.g.label, text: `${pct(Math.max(0, growthGoal.progress), 0)} of the way there${growthGoal.g.deadline ? ` with a ${growthGoal.g.deadline} deadline` : ''}.` }] : []),
          ...(ddGoal ? [{ title: ddGoal.g.label, text: dd >= ddGoal.g.target ? `Breached: drawdown hit ${pct(dd, 1)} against a ${pct(ddGoal.g.target, 0)} limit.` : `Holding: ${pct(dd, 1)} used of the ${pct(ddGoal.g.target, 0)} you allowed yourself.` }] : []),
          { title: 'One thing to do', text: s.closed < 10 ? 'Keep logging. Ten closed trades is the least you need before any of these numbers mean much.' : dd > 10 ? 'Cut risk per trade to 0.5% until drawdown is back under 5%.' : 'Keep sizing as you are and review again at the end of the month.' },
        ],
      },
    ],
    footnote: `Built from your ${plural(accounts.length, 'account')}, trades and goals on this page. Demo data, not financial advice.`,
  };
}

/* ───────────── Backtest / Strategy ───────────── */

export function strategyRead(): AiSectionData {
  const tagged = DEFAULT_PLAYBOOKS.map((p) => {
    const mine = JOURNAL_ENTRIES.filter((e) => e.strategy === p.name);
    const r = mine.map((e) => e.rMultiple).filter((x): x is number => typeof x === 'number');
    return { p, n: mine.length, pnl: mine.reduce((a, e) => a + (e.pnl || 0), 0), hit: r.length ? r.filter((x) => x >= p.benchmarkRR).length / r.length : null };
  });
  const traded = tagged.filter((t) => t.n > 0).sort((a, b) => b.pnl - a.pnl);
  const untested = tagged.filter((t) => t.n === 0);

  if (!traded.length) {
    return { eyebrow: 'Backtesting', headline: 'Nothing to test against yet', overview: '', empty: { text: 'Tag a few journal entries to a playbook and I can compare what you backtested with what you actually traded.' } };
  }
  const best = traded[0];
  const worst = traded[traded.length - 1];
  const weakRules = traded.filter((t) => t.hit != null && t.hit < 0.5);

  return {
    eyebrow: 'Backtesting',
    reading: `Reading ${plural(traded.length, 'playbook')}…`,
    headline: `Test ${worst.pnl < 0 ? worst.p.name : best.p.name} next, and be honest about the assumptions`,
    overview: `${traded.length === 1 ? '1 playbook has' : `${traded.length} playbooks have`} live trades behind ${traded.length === 1 ? 'it' : 'them'}${untested.length ? ` and ${untested.length === 1 ? '1 other has' : `${untested.length} others have`} none` : ''}. ${best.p.name} is your strongest at ${money(best.pnl)}${worst.pnl < 0 ? `, while ${worst.p.name} has cost ${money(worst.pnl)} and is the one worth putting through a backtest before you trade it again` : ''}.`,
    chips: [
      { label: 'Playbooks', value: String(tagged.length) },
      { label: 'With live trades', value: String(traded.length) },
      { label: 'Best net', value: money(best.pnl), tone: 'lime' },
      ...(worst.pnl < 0 ? [{ label: 'Weakest net', value: money(worst.pnl), tone: 'pink' as const }] : []),
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Test this first',
        items: [
          { title: worst.pnl < 0 ? worst.p.name : best.p.name, text: `${(worst.pnl < 0 ? worst : best).p.entryTrigger} Run it over a longer window than you have traded it, then compare the backtest win rate with your live one.` },
          ...(untested.length ? [{ title: 'Untested ideas', text: `${untested.map((t) => t.p.name).slice(0, 3).join(', ')} have no live trades. A backtest is cheaper than finding out with money.` }] : []),
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'Where backtests lie',
        items: [
          { title: 'Costs and slippage', text: 'Spread, commission and slippage usually turn a thin edge into no edge. Put your real broker costs into the run before you believe the curve.' },
          ...(weakRules.length ? [{ title: 'Benchmarks you are missing', text: `${weakRules.map((t) => t.p.name).slice(0, 2).join(' and ')} reach their own reward:risk target less than half the time live. Either the rule is wrong or the execution is.` }] : []),
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'How to read a run',
        items: [
          { title: 'Sample size first', text: 'Under about 100 trades, most of what you see is luck. Widen the window before you tune anything.' },
          { title: 'Change one thing', text: 'Optimising every parameter at once fits the past, not the future. Move one rule, re-run, and keep the change only if it survives a different period.' },
        ],
      },
    ],
    footnote: 'Built from your playbooks and the journal entries tagged to them. A backtest is a hypothesis, not a forecast.',
  };
}

/* ───────────── Community ───────────── */

export interface CommunityPostLike { name: string; text: string; likes: number; saves: number; tags: string[]; own?: boolean; comments: unknown[] }
export interface CommunityArticleLike { title: string; category: string; author: string; views: string; comments: number; saves: number; own?: boolean }

export function communityRead(posts: CommunityPostLike[], articles: CommunityArticleLike[]): AiSectionData {
  if (!posts.length && !articles.length) {
    return { eyebrow: 'The community', headline: 'Quiet in here', overview: '', empty: { text: 'No posts or articles to read yet. Write something and I will tell you how it lands.' } };
  }
  const views = (v: string) => parseFloat(v) * (v.includes('k') ? 1000 : 1);
  const topPost = [...posts].sort((a, b) => b.likes - a.likes)[0];
  const topArticle = [...articles].sort((a, b) => views(b.views) - views(a.views))[0];
  const mine = posts.filter((p) => p.own);
  const myArticles = articles.filter((a) => a.own);
  const tags = new Map<string, number>();
  posts.forEach((p) => p.tags.forEach((t) => tags.set(t, (tags.get(t) ?? 0) + 1)));
  const hot = Array.from(tags.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const categories = new Map<string, number>();
  articles.forEach((a) => categories.set(a.category, (categories.get(a.category) ?? 0) + 1));
  const topCategory = Array.from(categories.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    eyebrow: 'The community',
    reading: `Reading ${plural(posts.length, 'post')} and ${plural(articles.length, 'article')}…`,
    headline: hot.length ? `${hot[0][0]} is what the floor is talking about` : 'What the floor is talking about',
    overview: `${plural(posts.length, 'post')} and ${plural(articles.length, 'article')} on the page right now.${topPost ? ` The post getting the most reaction is ${topPost.name}’s, with ${topPost.likes.toLocaleString()} likes and ${topPost.comments.length} replies.` : ''}${topArticle ? ` The most read article is “${topArticle.title}” at ${topArticle.views} views.` : ''}`,
    chips: [
      { label: 'Posts', value: String(posts.length) },
      { label: 'Articles', value: String(articles.length) },
      { label: 'Yours', value: String(mine.length + myArticles.length), tone: 'lime' },
      ...(hot[0] ? [{ label: 'Top tag', value: hot[0][0] }] : []),
      ...(topCategory ? [{ label: 'Busiest category', value: topCategory[0] }] : []),
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Worth your time',
        items: [
          ...(topArticle ? [{ title: topArticle.title, text: `${topArticle.category} by ${topArticle.author}. ${topArticle.views} views and ${topArticle.comments} comments, the most read on the page.` }] : []),
          ...(topPost ? [{ title: `${topPost.name}’s post`, text: `${topPost.text.slice(0, 140)}${topPost.text.length > 140 ? '…' : ''}` }] : []),
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'Read it carefully',
        items: [
          { title: 'Nobody posts their losses', text: 'Feeds skew to winners. Treat a screenshot as one trade out of a record you cannot see, not as evidence a method works.' },
          { title: 'Conviction is not analysis', text: 'The loudest post is usually the most certain one. Ask what would have to happen for the idea to be wrong before you borrow it.' },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Your corner',
        items: [
          { title: mine.length || myArticles.length ? 'You have published' : 'You have not posted yet', text: mine.length || myArticles.length ? `${plural(mine.length, 'post')} and ${plural(myArticles.length, 'article')} from you. Writing up a trade forces you to say why, which is where most of the value is.` : 'Writing up one trade a week, win or lose, is the cheapest way to improve. It also earns credits.' },
          ...(hot.length ? [{ title: 'Topics moving today', text: `${hot.map(([t, n]) => `${t} (${n})`).join(', ')}. Follow the ones you actually trade and mute the rest.` }] : []),
        ],
      },
    ],
    footnote: 'Built from the posts and articles on this page. Community content is other people’s opinion, not advice.',
  };
}

/* ───────────── Education hub ───────────── */

export function educationRead(courses = COURSES, certificates = CERTIFICATES, tierLevel = 1): AiSectionData {
  if (!courses.length) {
    return { eyebrow: 'Education hub', headline: 'No courses match', overview: '', empty: { text: 'Clear a filter and I will tell you where to start.' } };
  }
  const byLevel = { Beginner: 0, Intermediate: 0, Advanced: 0 } as Record<string, number>;
  courses.forEach((c) => { byLevel[c.level] = (byLevel[c.level] ?? 0) + 1; });
  const lessons = courses.reduce((a, c) => a + c.lessons.length, 0);
  const minutes = courses.reduce((a, c) => a + c.lessons.reduce((m, l) => m + l.durationMinutes, 0), 0);
  const points = courses.reduce((a, c) => a + c.pointsReward, 0);
  const want = tierLevel >= 4 ? 'Advanced' : tierLevel >= 2 ? 'Intermediate' : 'Beginner';
  const start = courses.filter((c) => c.level === want).sort((a, b) => b.rating - a.rating)[0] ?? courses[0];
  const quizzes = courses.filter((c) => c.lessons.some((l) => (l.quizQuestions ?? []).length)).length;
  const locked = courses.filter((c) => c.requiredPlan !== 'Free').length;

  return {
    eyebrow: 'Education hub',
    reading: `Reading ${plural(courses.length, 'course')}…`,
    headline: `Start with ${start.title}`,
    overview: `${plural(courses.length, 'course')} here, ${lessons} lessons and about ${Math.round(minutes / 60)} hours in total, worth up to +${points} points if you finish them all. ${start.title} fits your level and is rated ${start.rating.toFixed(1)} by ${start.enrolledCount.toLocaleString()} traders.`,
    chips: [
      { label: 'Courses', value: String(courses.length) },
      { label: 'Lessons', value: String(lessons) },
      { label: 'Hours', value: String(Math.round(minutes / 60)) },
      { label: 'Points on offer', value: `+${points}`, tone: 'lime' },
      { label: 'Certificates earned', value: String(certificates.length) },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Where to start',
        items: [
          { title: start.title, text: `${start.category}. ${start.lessons.length} lessons, ${start.summary}` },
          { title: 'Then build on it', text: `${byLevel.Beginner} beginner, ${byLevel.Intermediate} intermediate and ${byLevel.Advanced} advanced courses are here. Finish one level before you jump.` },
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'How to actually learn it',
        items: [
          { title: 'Trade it on demo the same week', text: 'A course you did not apply is a course you will forget. Take one idea, size it small and journal the result.' },
          { title: 'Quizzes are the cheap test', text: `${plural(quizzes, 'course')} has a quiz. If you cannot pass it, you have not learned it yet, however good the video felt.` },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Worth knowing',
        items: [
          { title: 'Points come from finishing', text: `Completing a course pays points towards your level. ${start.title} alone is +${start.pointsReward}.` },
          ...(locked ? [{ title: 'Plan-gated content', text: `${plural(locked, 'course')} needs a paid learning plan; the rest you can take now.` }] : []),
        ],
      },
    ],
    footnote: 'Built from the courses on this page. Education, not financial advice.',
  };
}

/* ───────────── Economic calendar ───────────── */

export function calendarRead(events = ECONOMIC_EVENTS, now = Date.parse(CALENDAR_NOW)): AiSectionData {
  const upcoming = events.filter((e) => !e.allDay && Date.parse(e.at) > now).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (!upcoming.length) {
    return { eyebrow: 'The calendar', headline: 'Nothing scheduled ahead', overview: '', empty: { text: 'No releases ahead in this view. Widen the date range or clear a filter.' } };
  }
  const high = upcoming.filter((e) => e.impact === 'High');
  const next24 = upcoming.filter((e) => Date.parse(e.at) < now + 864e5);
  const week = upcoming.filter((e) => Date.parse(e.at) < now + 7 * 864e5);
  const first = high[0] ?? upcoming[0];
  const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  const ccy = new Map<string, number>();
  week.filter((e) => e.impact === 'High').forEach((e) => ccy.set(e.currency, (ccy.get(e.currency) ?? 0) + 1));
  const busiest = Array.from(ccy.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    eyebrow: 'The calendar',
    reading: `Reading ${plural(upcoming.length, 'release')}…`,
    headline: `${first.title} is the one to plan around`,
    overview: `${plural(next24.length, 'release')} in the next 24 hours and ${plural(high.length, 'high-impact print')} ahead in this view. ${first.title} lands ${when(first.at)} for ${first.currency}${first.forecast ? `, forecast ${first.forecast} against ${first.previous ?? 'no prior'}` : ''}.`,
    chips: [
      { label: 'Next 24h', value: String(next24.length) },
      { label: 'High impact', value: String(high.length), tone: 'pink' },
      { label: 'This week', value: String(week.length) },
      ...(busiest ? [{ label: 'Busiest currency', value: `${busiest[0]} (${busiest[1]})` }] : []),
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Next up',
        items: high.slice(0, 2).map((e) => ({ title: e.title, text: `${e.currency} · ${when(e.at)}${e.forecast ? ` · forecast ${e.forecast}, previous ${e.previous ?? '—'}` : ''}. ${e.summary.slice(0, 130)}` })),
      },
      {
        accent: ACCENT.pink,
        title: 'What it does to your orders',
        items: [
          { title: 'Spreads widen at the print', text: 'Costs jump and stops get slipped in the seconds either side. If you are in a position, know what the release can do to it before it lands.' },
          { title: 'The surprise moves price, not the number', text: 'Markets trade the gap between the actual and the forecast. A strong number that was already expected often does nothing.' },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'A simple rule',
        items: [
          { title: 'Decide beforehand', text: 'Stand aside, cut size, or trade the reaction after the first candle. Pick one before the release, not while the chart is moving.' },
          ...(busiest ? [{ title: `${busiest[0]} is loaded this week`, text: `${plural(busiest[1], 'high-impact release')} touches ${busiest[0]}. If most of your positions are in it, that is one bet, not several.` }] : []),
        ],
      },
    ],
    footnote: 'Built from the calendar on this page. Times shown in Bangkok time. Not financial advice.',
  };
}

/* ───────────── Market news ───────────── */

export function newsRead(articles = NEWS_ARTICLES): AiSectionData {
  if (!articles.length) {
    return { eyebrow: 'Market news', headline: 'No stories match', overview: '', empty: { text: 'Clear a filter and I will summarise what the desk is saying.' } };
  }
  const tally = { Bullish: 0, Bearish: 0, Neutral: 0 } as Record<string, number>;
  articles.forEach((a) => { tally[a.sentiment] = (tally[a.sentiment] ?? 0) + 1; });
  const lean = tally.Bullish > tally.Bearish ? 'leaning bullish' : tally.Bearish > tally.Bullish ? 'leaning bearish' : 'split';
  const lead = articles[0];
  const classes = new Map<string, number>();
  articles.forEach((a) => classes.set(a.assetClass, (classes.get(a.assetClass) ?? 0) + 1));
  const top = Array.from(classes.entries()).sort((a, b) => b[1] - a[1])[0];
  const expert = articles.filter((a) => a.expertSummary);

  return {
    eyebrow: 'Market news',
    reading: `Reading ${plural(articles.length, 'story')}…`,
    headline: `The desk is ${lean} today`,
    overview: `${plural(articles.length, 'story')} on the page: ${tally.Bullish} bullish, ${tally.Bearish} bearish and ${tally.Neutral} neutral.${top ? ` ${top[0]} has the most coverage with ${top[1]}.` : ''} Lead story: ${lead.headline}.`,
    chips: [
      { label: 'Stories', value: String(articles.length) },
      { label: 'Bullish', value: String(tally.Bullish), tone: 'lime' },
      { label: 'Bearish', value: String(tally.Bearish), tone: 'pink' },
      { label: 'Neutral', value: String(tally.Neutral) },
      ...(top ? [{ label: 'Most covered', value: top[0] }] : []),
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Read these first',
        items: articles.slice(0, 2).map((a) => ({ title: a.headline, text: `${a.source} · ${a.sentiment} · ${a.readTime}. ${a.excerpt.slice(0, 130)}` })),
      },
      {
        accent: ACCENT.pink,
        title: 'Hold it at arm’s length',
        items: [
          { title: 'Headlines lag price', text: 'By the time a move has a story attached, the market has usually already traded it. Use news for context, not entries.' },
          { title: 'Sentiment counts, it does not predict', text: `${lean === 'split' ? 'Coverage is evenly split' : `Coverage is ${lean}`}, which tells you what is consensus. Crowded views unwind fast when the next number surprises.` },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Make it useful',
        items: [
          ...(expert.length ? [{ title: 'Advisor commentary', text: `${plural(expert.length, 'story')} has an expert summary attached, which is the fastest way to see what a story means for a position.` }] : []),
          { title: 'Tie it to a level', text: 'Pick one instrument from today’s stories, mark the level you would act on, and set an alert. That turns reading into a plan.' },
        ],
      },
    ],
    footnote: 'Built from the stories on this page. Reporting, not advice.',
  };
}

/* ───────────── Trading signals ───────────── */

export function signalsRead(signals: { ticker: string; action: string; confidence: number; timeframe: string; riskReward: string; change24h: number; assetClass: string; analysis?: string }[], tierLevel = 1): AiSectionData {
  const open = signals.filter((s) => s.action !== 'UPGRADE');
  if (!open.length) {
    return { eyebrow: 'Trading signals', headline: 'Signals are locked on your level', overview: '', empty: { text: 'Your level unlocks a confidence band. Earn points or upgrade to see the calls behind the lock.' } };
  }
  const best = [...open].sort((a, b) => b.confidence - a.confidence)[0];
  const buys = open.filter((s) => /buy/i.test(s.action)).length;
  const sells = open.length - buys;
  const avg = open.reduce((a, s) => a + s.confidence, 0) / open.length;
  const locked = signals.length - open.length;
  const rr = (s: string) => parseFloat((s.split(':')[1] ?? '0')) || 0;
  const bestRR = [...open].sort((a, b) => rr(b.riskReward) - rr(a.riskReward))[0];

  return {
    eyebrow: 'Trading signals',
    reading: `Reading ${plural(open.length, 'signal')}…`,
    headline: buys === sells ? 'The book is split between longs and shorts' : buys > sells ? `${buys} of ${open.length} calls lean long` : `${sells} of ${open.length} calls lean short`,
    overview: `Average confidence across ${plural(open.length, 'open signal')} is ${pct(avg, 0)}. The highest is ${best.ticker} ${best.action} at ${pct(best.confidence, 0)} on the ${best.timeframe}, and the widest reward-to-risk is ${bestRR.ticker} at ${bestRR.riskReward}.${locked ? ` ${plural(locked, 'signal')} is still locked on your level.` : ''}`,
    chips: [
      { label: 'Open signals', value: String(open.length) },
      { label: 'Long', value: String(buys), tone: 'lime' },
      { label: 'Short', value: String(sells), tone: 'pink' },
      { label: 'Avg confidence', value: pct(avg, 0) },
      ...(locked ? [{ label: 'Locked', value: String(locked) }] : []),
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Highest conviction',
        items: [
          { title: `${best.ticker} ${best.action}`, text: `${pct(best.confidence, 0)} confidence on the ${best.timeframe}, reward to risk ${best.riskReward}. ${(best.analysis ?? '').slice(0, 130)}` },
          { title: `Widest payoff: ${bestRR.ticker}`, text: `${bestRR.riskReward} at ${pct(bestRR.confidence, 0)} confidence. A wide target only pays if you let it run.` },
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'What confidence is not',
        items: [
          { title: 'It is not a win rate', text: 'A 90% confidence call still loses often enough to hurt if you size it like a certainty. Risk the same amount on every signal you take.' },
          { title: 'Crowded direction', text: buys > sells * 2 || sells > buys * 2 ? 'Most calls point the same way right now, so taking several of them is really one big position.' : 'Calls are spread across both directions, so you can size each one on its own merit.' },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Before you take one',
        items: [
          { title: 'Use the given stop', text: 'The entry, stop and target are a set. Taking the entry and inventing your own stop changes the maths entirely.' },
          { title: 'Check the calendar', text: 'A high-impact release inside your holding window can undo a clean setup. Look before you commit.' },
        ],
      },
    ],
    footnote: 'Built from the signals on this page. Signals are research, not instructions, and are not financial advice.',
  };
}

/* ───────────── Points, credits and missions ───────────── */

export function pointsRead(user: { rankTitle: string; tierLevel: number; currentPoints: number; maxPoints: number; sydeCredits: number; activeStreakDays: number }, missions = INITIAL_MISSIONS): AiSectionData {
  const tierIndex = GAMIFICATION_TIERS.findIndex((t) => t.level === user.tierLevel);
  const next = tierIndex >= 0 ? GAMIFICATION_TIERS[tierIndex + 1] : undefined;
  const toNext = next ? Math.max(0, next.minPoints - user.currentPoints) : 0;
  const openM = missions.filter((m) => m.status !== 'completed' && m.tasks.some((t) => !t.completed));
  const pts = openM.reduce((a, m) => a + m.rewardPoints, 0);
  const creds = openM.reduce((a, m) => a + m.rewardCredits, 0);
  const nearest = [...openM].sort((a, b) => a.tasks.filter((t) => !t.completed).length - b.tasks.filter((t) => !t.completed).length)[0];

  return {
    eyebrow: 'Points and credits',
    reading: 'Reading your level…',
    headline: next ? `${toNext} points from ${next.tier}` : `You are at the top level, ${user.rankTitle}`,
    overview: next
      ? `You are ${user.rankTitle} with ${user.currentPoints} of ${user.maxPoints} points and ${user.sydeCredits.toLocaleString()} credits. Reaching ${next.tier} gives ${next.cashbackBoost} and ${next.signalAccess}. The ${plural(openM.length, 'open mission')} on this page is worth +${pts} points, which ${pts >= toNext ? 'is enough on its own' : `covers ${pct((pts / Math.max(1, toNext)) * 100, 0)} of the gap`}.`
      : `You are ${user.rankTitle} with ${user.currentPoints} points and ${user.sydeCredits.toLocaleString()} credits. There is no level above this one, so the missions are now just credits.`,
    chips: [
      { label: 'Level', value: `${user.tierLevel} · ${user.rankTitle}` },
      { label: 'Points', value: `${user.currentPoints}/${user.maxPoints}` },
      { label: 'Credits', value: user.sydeCredits.toLocaleString() },
      ...(next ? [{ label: 'To next level', value: `${toNext} pts`, tone: 'pink' as const }] : []),
      { label: 'Streak', value: `${user.activeStreakDays} days`, tone: 'lime' },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Quickest points',
        items: [
          ...(nearest ? [{ title: nearest.title, text: `${plural(nearest.tasks.filter((t) => !t.completed).length, 'task')} left for +${nearest.rewardPoints} points and +${nearest.rewardCredits} credits${nearest.expiresIn ? `, ${nearest.expiresIn.toLowerCase()}` : ''}.` }] : []),
          { title: 'Keep the streak', text: `${user.activeStreakDays} days running. A daily check-in is the cheapest points on the board, and the streak resets the moment you skip.` },
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'What the level buys you',
        items: next
          ? [
              { title: next.tier, text: `${next.cashbackBoost} and ${next.signalAccess}. On real volume the cashback boost is the part that compounds.` },
              { title: 'Points are not credits', text: 'Points move your level and never get spent. Credits are the balance you spend on unlocks, so do not confuse the two.' },
            ]
          : [{ title: 'Credits only from here', text: 'Points no longer move your level, so missions are now a credit balance rather than progress.' }],
      },
      {
        accent: ACCENT.violet,
        title: 'Worth remembering',
        items: [
          { title: 'Do not trade for points', text: 'Missions reward activity. Taking a trade you would not otherwise take to finish one costs more than the points are worth.' },
          { title: 'Credits expire quietly', text: 'Check the expiry on anything you are saving credits for; an unspent balance earns you nothing.' },
        ],
      },
    ],
    footnote: 'Built from your level, credits and the missions on this page.',
  };
}

/* ───────────── Promotions ───────────── */

export function promotionsRead(promos = PROMOTIONS, tierLevel = 1): AiSectionData {
  const live = promos.filter((p) => p.startsInDays === 0);
  if (!live.length) {
    return { eyebrow: 'Offers', headline: 'Nothing live right now', overview: '', empty: { text: 'No offers are running in this view. Clear a filter or check back after the next drop.' } };
  }
  const mine = live.filter((p) => p.minLevel <= Math.max(1, tierLevel));
  const locked = live.length - mine.length;
  const ending = [...mine].sort((a, b) => a.endsInDays - b.endsInDays)[0];
  const needConn = mine.filter((p) => p.requiresConnected).length;
  const deposits = mine.filter((p) => p.type === 'deposit').length;
  const byType = new Map<string, number>();
  mine.forEach((p) => byType.set(p.type, (byType.get(p.type) ?? 0) + 1));
  const top = Array.from(byType.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    eyebrow: 'Offers',
    reading: `Reading ${plural(live.length, 'offer')}…`,
    headline: ending ? `${ending.title} closes in ${plural(ending.endsInDays, 'day')}` : 'Offers open to you',
    overview: `${plural(mine.length, 'offer')} is open on your level${locked ? ` and ${plural(locked, 'more')} needs a higher one` : ''}. ${ending ? `${ending.brokerName} is first to close: ${ending.value}, ${ending.valueNote}.` : ''}${top ? ` Most of what is live is ${top[0]}.` : ''}`,
    chips: [
      { label: 'Open to you', value: String(mine.length), tone: 'lime' },
      ...(locked ? [{ label: 'Locked', value: String(locked), tone: 'pink' as const }] : []),
      ...(ending ? [{ label: 'Closes first', value: `${ending.endsInDays}d` }] : []),
      { label: 'Need a connected account', value: String(needConn) },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Worth claiming',
        items: mine.slice(0, 2).map((p) => ({ title: p.title, text: `${p.brokerName} · ${p.value} ${p.valueNote}. ${p.summary.slice(0, 120)}` })),
      },
      {
        accent: ACCENT.pink,
        title: 'Read the terms',
        items: [
          ...(deposits ? [{ title: 'Deposit bonuses have strings', text: `${plural(deposits, 'offer')} here is a deposit bonus. Credit usually cannot be withdrawn and needs a lot requirement cleared first, so count the volume before you take it.` }] : []),
          { title: 'An offer is not a reason to trade', text: 'Extra cashback on volume you would not otherwise trade costs more in spread than the rebate returns.' },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Before you claim',
        items: [
          ...(needConn ? [{ title: 'Connect first', text: `${plural(needConn, 'offer')} only tracks on an account connected to MarketSyde. Connect before you deposit or the offer will not register.` }] : []),
          { title: 'Check the broker, not the banner', text: 'The headline number comes from the provider. Regulation and execution matter more than the size of the bonus.' },
        ],
      },
    ],
    footnote: 'Built from the offers on this page. Terms come from the provider and can change. Not financial advice.',
  };
}

/* ───────────── Leaderboard ───────────── */

export function leaderboardRead(users = LEADERBOARD_USERS): AiSectionData {
  if (!users.length) {
    return { eyebrow: 'The leaderboard', headline: 'No standings yet', overview: '', empty: { text: 'The board is empty for this period.' } };
  }
  const sorted = [...users].sort((a, b) => a.rank - b.rank);
  const me = sorted.find((u) => u.isCurrentUser);
  const top = sorted[0];
  const ahead = me ? sorted.find((u) => u.rank === me.rank - 1) : undefined;
  const avg = sorted.reduce((a, u) => a + u.points, 0) / sorted.length;

  return {
    eyebrow: 'The leaderboard',
    reading: `Reading ${plural(sorted.length, 'trader')}…`,
    headline: me ? `You are #${me.rank} of ${sorted.length}` : `${top.username} leads with ${top.points.toLocaleString()} points`,
    overview: me
      ? `You have ${me.points.toLocaleString()} points and $${me.cashbackEarned.toFixed(2)} cashback, against an average of ${Math.round(avg).toLocaleString()} points on the board.${ahead ? ` ${ahead.username} is one place ahead, ${(ahead.points - me.points).toLocaleString()} points up.` : ''} ${top.username} leads on ${top.points.toLocaleString()}.`
      : `${top.username} leads on ${top.points.toLocaleString()} points and $${top.cashbackEarned.toFixed(2)} cashback, with an average of ${Math.round(avg).toLocaleString()} points across ${plural(sorted.length, 'trader')}.`,
    chips: [
      ...(me ? [{ label: 'Your rank', value: `#${me.rank}`, tone: 'lime' as const }, { label: 'Your points', value: me.points.toLocaleString() }] : []),
      { label: 'Leader', value: top.points.toLocaleString() },
      { label: 'Board average', value: Math.round(avg).toLocaleString() },
      { label: 'Traders', value: String(sorted.length) },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Closing the gap',
        items: [
          ahead && me
            ? { title: `${(ahead.points - me.points).toLocaleString()} points behind ${ahead.username}`, text: 'Missions and finishing a course are the fastest points on the board; trading volume alone moves it slowly.' }
            : { title: 'Points come from habits', text: 'Daily check-ins, missions and finished courses move you up faster than volume does.' },
          { title: `${top.username} sets the pace`, text: `${top.tier} tier with $${top.cashbackEarned.toFixed(2)} cashback earned. The board rewards consistency, not one good week.` },
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'What it does not measure',
        items: [
          { title: 'Not a profit ranking', text: 'Points come from activity and cashback, not from how well anyone trades. A high rank is not a track record.' },
          { title: 'Do not chase volume', text: 'Trading more to climb costs spread on every lot. The rank is not worth the drawdown.' },
        ],
      },
    ],
    footnote: 'Built from the standings on this page. Points measure activity, not trading results.',
  };
}

/* ───────────── Dashboard: the daily brief ───────────── */

export function dashboardRead(user: { firstName?: string; rankTitle: string; currentPoints: number; maxPoints: number; sydeCredits: number }, signals: { ticker: string; action: string; confidence: number; timeframe: string }[] = []): AiSectionData {
  const now = Date.parse(CALENDAR_NOW);
  const next = ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > now && e.impact === 'High').sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
  const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  const tone = { Bullish: 0, Bearish: 0 } as Record<string, number>;
  NEWS_ARTICLES.slice(0, 8).forEach((a) => { tone[a.sentiment] = (tone[a.sentiment] ?? 0) + 1; });
  const lean = tone.Bullish > tone.Bearish ? 'leaning bullish' : tone.Bearish > tone.Bullish ? 'leaning bearish' : 'mixed';
  const trades = tradesInRange(PORTFOLIO_TRADES, 7);
  const s = tradeStats(trades);
  const open = PORTFOLIO_TRADES.filter((t) => !isClosed(t));
  const float = open.reduce((a, t) => a + t.pnl, 0);
  const top = [...signals].filter((x) => x.action !== 'UPGRADE').sort((a, b) => b.confidence - a.confidence)[0];
  const dd = maxDrawdown(sliceSeries(totalSeries([]), 30, 120));

  return {
    eyebrow: 'Today',
    reading: 'Reading your morning…',
    headline: open.length ? `${plural(open.length, 'position')} open, ${money(float)} floating` : s.closed ? `${plural(s.closed, 'trade')} closed this week for ${money(s.realized)}` : 'Nothing open, nothing closed this week',
    overview: `News is ${lean} this morning.${next ? ` ${next.title} lands ${when(next.at)} for ${next.currency}.` : ''}${top ? ` Highest-confidence call right now is ${top.ticker} ${top.action} at ${pct(top.confidence, 0)} on the ${top.timeframe}.` : ''} You are ${user.rankTitle} on ${user.currentPoints}/${user.maxPoints} points with ${user.sydeCredits.toLocaleString()} credits.`,
    chips: [
      { label: 'Open', value: String(open.length) },
      { label: 'Floating', value: money(float), tone: float >= 0 ? 'lime' : 'pink' },
      { label: '7d net', value: money(s.realized), tone: s.realized >= 0 ? 'lime' : 'pink' },
      { label: '30d drawdown', value: pct(dd, 1), tone: dd > 10 ? 'pink' : 'white' },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'Today',
        items: [
          ...(next ? [{ title: next.title, text: `${next.currency} · ${when(next.at)}. Decide now whether you stand aside, cut size, or trade the reaction.` }] : []),
          ...(top ? [{ title: `${top.ticker} ${top.action}`, text: `${pct(top.confidence, 0)} confidence on the ${top.timeframe}. Use the stop it comes with or leave it alone.` }] : []),
        ],
      },
      {
        accent: ACCENT.pink,
        title: 'Your book',
        items: [
          { title: open.length ? `${plural(open.length, 'position')} open` : 'Flat', text: open.length ? `Floating ${money(float)}. Largest is ${open.sort((a, b) => b.size - a.size)[0].symbol} at ${open[0].size} lots.` : 'Nothing open, so nothing to manage before the next release.' },
          { title: 'Drawdown', text: dd > 10 ? `${pct(dd, 1)} over 30 days. Cut risk per trade until it is back under 5%.` : `${pct(dd, 1)} over 30 days, which is a manageable dip.` },
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'One thing to do',
        items: [{ title: s.closed ? 'Journal this week' : 'Pick one setup', text: s.closed ? `You closed ${plural(s.closed, 'trade')} this week. Write up the worst one while you still remember why you took it.` : 'No trades this week. Pick one setup from your playbook and wait for it rather than hunting.' }],
      },
    ],
    footnote: 'Built from your trades, the calendar, today’s news and your level. Not financial advice.',
  };
}

/* ───────────── Instrument analysis ───────────── */

export function instrumentRead(symbol: string, signals: { ticker: string; action: string; confidence: number; timeframe: string; riskReward: string; change24h: number; analysis?: string }[] = []): { title: string; lines: string[]; footnote: string } {
  const now = Date.parse(CALENDAR_NOW);
  const sig = signals.find((s) => s.ticker === symbol && s.action !== 'UPGRADE');
  const hay = (t: string) => t.toLowerCase();
  const base = symbol.split('/')[0];
  const news = NEWS_ARTICLES.filter((a) => hay(`${a.headline} ${a.excerpt} ${a.tags.join(' ')}`).includes(base.toLowerCase())).slice(0, 2);
  const ccy = symbol.split('/').filter(Boolean);
  const events = ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > now && e.impact !== 'Low' && ccy.includes(e.currency))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at)).slice(0, 2);
  const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  const held = PORTFOLIO_TRADES.filter((t) => !isClosed(t) && t.symbol === symbol);

  const lines: string[] = [];
  lines.push(sig
    ? `There is a ${sig.action} call on ${symbol} at ${pct(sig.confidence, 0)} confidence on the ${sig.timeframe}, reward to risk ${sig.riskReward}.`
    : `No active MarketSyde signal on ${symbol} right now, so this is context rather than a call.`);
  if (news.length) lines.push(`Recent coverage: ${news.map((n) => `${n.headline} (${n.sentiment})`).join('; ')}.`);
  if (events.length) lines.push(`Releases that can move it: ${events.map((e) => `${e.title}, ${e.currency}, ${when(e.at)}`).join('; ')}. Expect wider spreads around them.`);
  if (held.length) lines.push(`You hold ${plural(held.length, 'position')} on it, floating ${money(held.reduce((a, t) => a + t.pnl, 0))}.`);
  lines.push('Levels on this page are drawn from past price. They mark where to make a decision, not where price has to turn.');
  return { title: symbol, lines, footnote: 'Built from the signals, news and calendar on this page. Not financial advice.' };
}

/* ───────────── Calculator result ───────────── */

export function calculatorNote(input: { lots?: number; riskUsd?: number; equity?: number; leverage?: number; marginUsd?: number; stopPips?: number }): { text: string; tone: 'neutral' | 'warn' | 'good' } | null {
  const { lots, riskUsd, equity, leverage, marginUsd, stopPips } = input;
  if (equity && riskUsd) {
    const share = (riskUsd / equity) * 100;
    if (share > 2) return { text: `That risks ${pct(share, 1)} of your account on one trade. Most traders cap a single trade at 1–2%; at this size six losses in a row would cost about ${pct(Math.min(99, share * 6), 0)}.`, tone: 'warn' };
    return { text: `That risks ${pct(share, 1)} of your account, which sits inside the usual 1–2% cap. Keep the same percentage on every trade and the maths stays comparable.`, tone: 'good' };
  }
  if (equity && marginUsd) {
    const share = (marginUsd / equity) * 100;
    if (share > 30) return { text: `This ties up ${pct(share, 0)} of your equity as margin. A gap against you gets close to a margin call fast, so size down or add headroom.`, tone: 'warn' };
    return { text: `This uses ${pct(share, 0)} of your equity as margin, which leaves room for the position to breathe.`, tone: 'good' };
  }
  if (lots && stopPips) return { text: `${lots.toFixed(2)} lots with a ${stopPips} pip stop is about $${(lots * 10 * stopPips).toFixed(0)} at risk on a USD-quoted pair. Check the pair's pip value before you trade it.`, tone: 'neutral' };
  if (leverage && leverage > 100) return { text: `1:${leverage} is a ceiling, not a target. What matters is effective leverage: position value divided by equity. Most careful traders stay under 10:1.`, tone: 'warn' };
  return null;
}

/* ───────────── Broker list and comparison ───────────── */

export function brokerListStrip(brokers: { name: string; spreadFrom: string; minDeposit: string; cashbackPerLot: number; regulations: string[]; connected?: boolean }[]): string {
  if (!brokers.length) return 'No brokers match those filters. Clear one and I will rank what is left.';
  const num = (s: string) => parseFloat((s || '').replace(/[^0-9.]/g, '')) || 0;
  const cheap = [...brokers].sort((a, b) => num(a.spreadFrom) - num(b.spreadFrom))[0];
  const rich = [...brokers].sort((a, b) => b.cashbackPerLot - a.cashbackPerLot)[0];
  const low = [...brokers].sort((a, b) => num(a.minDeposit) - num(b.minDeposit))[0];
  const connected = brokers.filter((b) => b.connected).length;
  return `${brokers.length} brokers here. Lowest starting spread is ${cheap.name} at ${cheap.spreadFrom}, highest cashback is ${rich.name} at $${rich.cashbackPerLot.toFixed(2)} a lot, and ${low.name} opens from ${low.minDeposit}.${connected ? ` ${connected} already connected to you.` : ''} Regulation and execution matter more than any of those three.`;
}

export function brokerCompareNote(list: { name: string; spreadFrom: string; cashbackPerLot: number; minDeposit: string; regulations: string[]; maxLeverage: string }[], lotsPerMonth = 20): { text: string; tone: 'neutral' | 'warn' | 'good' } | null {
  if (list.length < 2) return null;
  const num = (s: string) => parseFloat((s || '').replace(/[^0-9.]/g, '')) || 0;
  const cost = (b: typeof list[number]) => num(b.spreadFrom) * 10 * lotsPerMonth - b.cashbackPerLot * lotsPerMonth;
  const ranked = [...list].sort((a, b) => cost(a) - cost(b));
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const gap = Math.abs(cost(worst) - cost(best));
  const safest = [...list].sort((a, b) => b.regulations.length - a.regulations.length)[0];
  const tail = safest.name !== best.name ? ` ${safest.name} lists more regulators, which is the trade-off against the cheaper bill.` : '';
  return { text: `At ${lotsPerMonth} lots a month, ${best.name} works out about $${gap.toFixed(0)} cheaper than ${worst.name} once cashback is counted against the starting spread.${tail} Commission tiers and execution are not in this number.`, tone: 'neutral' };
}

/* ───────────── Community article ───────────── */

export function articleNote(article: { title: string; excerpt?: string; summary?: string; category?: string; author?: string }): { title: string; lines: string[]; footnote: string } {
  const body = article.excerpt ?? article.summary ?? '';
  const sentences = body.split(/(?<=\.)\s+/).filter((x) => x.trim().length > 25).slice(0, 2);
  const lines = sentences.length ? sentences : ['This piece has no preview text to summarise, so read it in full.'];
  lines.push('It is one trader’s view. Treat the method as a hypothesis to test in your journal, not as a signal.');
  return { title: 'Before you read', lines, footnote: `Summarised from the opening of “${article.title}”. Community content is opinion, not advice.` };
}

/** One line above the instrument list: what is moving and what is due. */
export function instrumentListStrip(signals: { ticker: string; action: string; confidence: number; change24h: number; assetClass: string }[] = []): string {
  const live = signals.filter((s) => s.action !== 'UPGRADE');
  const now = Date.parse(CALENDAR_NOW);
  const next = ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > now && e.impact === 'High').sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
  if (!live.length) return 'No open signals to compare right now. Pick an instrument and I will pull its news and upcoming releases.';
  const mover = [...live].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0];
  const conviction = [...live].sort((a, b) => b.confidence - a.confidence)[0];
  const when = next ? new Date(next.at).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' }) : '';
  return `Biggest 24h move is ${mover.ticker} at ${mover.change24h > 0 ? '+' : ''}${mover.change24h}%, and the highest-conviction call is ${conviction.ticker} ${conviction.action} at ${Math.round(conviction.confidence)}%.${next ? ` ${next.title} lands ${when} and can move ${next.currency} pairs.` : ''} A big move is not an entry on its own.`;
}

/* ═══════════ Props for the lighter widgets ═══════════ */

export function signalsVerdict(signals: { ticker: string; action: string; confidence: number; timeframe: string; riskReward: string }[]) {
  const live = signals.filter((s) => s.action !== 'UPGRADE');
  const buys = live.filter((s) => /buy/i.test(s.action)).length;
  const sells = live.length - buys;
  const best = [...live].sort((a, b) => b.confidence - a.confidence)[0];
  const avg = live.length ? live.reduce((a, s) => a + s.confidence, 0) / live.length : 0;
  return {
    headline: !live.length ? 'Signals are locked on your level' : buys === sells ? 'The book is split between longs and shorts' : buys > sells ? `${buys} of ${live.length} calls lean long` : `${sells} of ${live.length} calls lean short`,
    note: best
      ? `Highest conviction is ${best.ticker} ${best.action} at ${pct(best.confidence, 0)} on the ${best.timeframe}, reward to risk ${best.riskReward}. Confidence is not a win rate: risk the same amount on every signal you take, and use the stop it comes with.`
      : 'Earn points or upgrade to see the calls behind the lock.',
    left: { label: 'Long', value: buys },
    right: { label: 'Short', value: sells },
    stats: [
      { label: 'Open', value: String(live.length) },
      { label: 'Avg confidence', value: pct(avg, 0) },
    ],
  };
}

export function newsVerdict(articles = NEWS_ARTICLES) {
  const t = { Bullish: 0, Bearish: 0, Neutral: 0 } as Record<string, number>;
  articles.forEach((a) => { t[a.sentiment] = (t[a.sentiment] ?? 0) + 1; });
  const lead = articles[0];
  return {
    headline: t.Bullish > t.Bearish ? 'Coverage is leaning bullish today' : t.Bearish > t.Bullish ? 'Coverage is leaning bearish today' : 'Coverage is split today',
    note: lead ? `Lead story: ${lead.headline} (${lead.source}, ${lead.readTime}). Headlines lag price, so read this for context and tie it to a level before you act on it.` : 'No stories match these filters.',
    left: { label: 'Bullish', value: t.Bullish },
    right: { label: 'Bearish', value: t.Bearish },
    neutral: { label: 'Neutral', value: t.Neutral },
    stats: [{ label: 'Stories', value: String(articles.length) }],
  };
}

export function calendarNext(events = ECONOMIC_EVENTS, now = Date.parse(CALENDAR_NOW)) {
  const up = events.filter((e) => !e.allDay && Date.parse(e.at) > now).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const high = up.filter((e) => e.impact === 'High');
  const first = high[0] ?? up[0];
  if (!first) return null;
  const when = new Date(first.at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  const hours = Math.round((Date.parse(first.at) - now) / 36e5);
  return {
    kicker: `${first.currency} · ${first.impact} impact`,
    title: first.title,
    meta: `${when}${hours >= 0 && hours < 72 ? ` · in ${plural(hours, 'hour')}` : ''}`,
    note: `${first.forecast ? `Forecast ${first.forecast} against ${first.previous ?? 'no prior'}. ` : ''}Markets trade the gap from the forecast, not the number itself. Spreads widen either side, so decide now whether you stand aside, cut size, or trade the reaction. ${plural(high.length, 'high-impact print')} ahead in this view.`,
  };
}

export function promotionsNext(promos = PROMOTIONS, tierLevel = 1) {
  const mine = promos.filter((p) => p.startsInDays === 0 && p.minLevel <= Math.max(1, tierLevel)).sort((a, b) => a.endsInDays - b.endsInDays);
  const first = mine[0];
  if (!first) return null;
  const locked = promos.filter((p) => p.startsInDays === 0).length - mine.length;
  return {
    kicker: `${first.brokerName} · ${first.type}`,
    title: first.title,
    meta: `Ends in ${plural(first.endsInDays, 'day')}`,
    note: `${first.value} ${first.valueNote}. ${plural(mine.length, 'offer')} is open on your level${locked ? ` and ${locked} needs a higher one` : ''}.${first.requiresConnected ? ' It only tracks on a connected account, so connect before you deposit.' : ''} An offer is not a reason to trade volume you would not otherwise trade.`,
  };
}

export function pointsProgress(user: { rankTitle: string; tierLevel: number; currentPoints: number; maxPoints: number; sydeCredits: number; activeStreakDays: number }, missions = INITIAL_MISSIONS) {
  const i = GAMIFICATION_TIERS.findIndex((t) => t.level === user.tierLevel);
  const next = i >= 0 ? GAMIFICATION_TIERS[i + 1] : undefined;
  const toNext = next ? Math.max(0, next.minPoints - user.currentPoints) : 0;
  const open = missions.filter((m) => m.status !== 'completed' && m.tasks.some((t) => !t.completed));
  const pts = open.reduce((a, m) => a + m.rewardPoints, 0);
  return {
    headline: next ? `${toNext} points from ${next.tier}` : `You are at the top level, ${user.rankTitle}`,
    valueLabel: `${user.currentPoints} / ${user.maxPoints}`,
    value: user.currentPoints,
    max: user.maxPoints,
    targetLabel: next ? next.tier : user.rankTitle,
    note: next
      ? `${next.tier} gives ${next.cashbackBoost} and ${next.signalAccess}. The ${plural(open.length, 'open mission')} here is worth +${pts} points, ${pts >= toNext ? 'enough on its own' : `about ${pct((pts / Math.max(1, toNext)) * 100, 0)} of the gap`}. Your ${user.activeStreakDays}-day streak is the cheapest points on the board, and it resets the moment you skip.`
      : `Missions are now a credit balance rather than progress. You hold ${user.sydeCredits.toLocaleString()} credits.`,
  };
}

export function educationProgress(courses = COURSES, certificates = CERTIFICATES, tierLevel = 1) {
  const want = tierLevel >= 4 ? 'Advanced' : tierLevel >= 2 ? 'Intermediate' : 'Beginner';
  const start = courses.filter((c) => c.level === want).sort((a, b) => b.rating - a.rating)[0] ?? courses[0];
  if (!start) return null;
  const minutes = courses.reduce((a, c) => a + c.lessons.reduce((m, l) => m + l.durationMinutes, 0), 0);
  return {
    headline: `Start with ${start.title}`,
    value: certificates.length,
    max: Math.max(1, courses.length),
    valueLabel: `${certificates.length} / ${courses.length} finished`,
    targetLabel: 'All courses',
    note: `${start.level} · ${start.category} · ${start.lessons.length} lessons for +${start.pointsReward} points, rated ${start.rating.toFixed(1)} by ${start.enrolledCount.toLocaleString()} traders. ${courses.length} courses here, about ${Math.round(minutes / 60)} hours in total. Take one idea onto demo the same week or you will forget it.`,
  };
}

export function advisorsCompare(list = EXPERT_ADVISORS) {
  if (list.length < 2) return null;
  const score = (e: ExpertAdvisor) => e.stats.profitFactor * 10 - e.stats.maxDD + e.stats.liveDays / 30;
  const best = [...list].sort((a, b) => score(b) - score(a))[0];
  const riskiest = [...list].sort((a, b) => b.stats.maxDD - a.stats.maxDD)[0];
  const young = list.filter((e) => e.stats.liveDays < 180).length;
  return {
    headline: `${best.name} has the steadiest record, ${riskiest.name} the roughest`,
    left: {
      badge: 'Steadiest',
      title: best.name,
      text: `${best.strategy} on ${best.pairs.slice(0, 3).join(', ')}. ${best.stats.profitFactor.toFixed(2)} profit factor, ${pct(best.stats.winRate, 0)} wins and ${pct(best.stats.maxDD, 1)} worst drawdown over ${plural(best.stats.liveDays, 'day')} live.`,
    },
    right: {
      badge: 'Roughest ride',
      title: riskiest.name,
      text: `${pct(riskiest.stats.maxDD, 1)} at its worst, about $${Math.round((riskiest.stats.maxDD / 100) * 5000).toLocaleString()} down on a $5,000 account before it recovers.`,
    },
    note: `${young ? `${plural(young, 'advisor')} here has under six months live, and short records flatter a strategy. ` : ''}Demo it on the pairs and timeframe it was built for before you fund it: published results come from the author, not your broker and your spreads.`,
  };
}

export function portfolioMetrics(accountIds: string[] = [], days = 30) {
  const accounts = accountIds.length ? PORTFOLIO_ACCOUNTS.filter((a) => accountIds.includes(a.id)) : PORTFOLIO_ACCOUNTS;
  const trades = tradesInRange(PORTFOLIO_TRADES, days);
  const s = tradeStats(trades);
  const dd = maxDrawdown(sliceSeries(totalSeries(accountIds), days, 120));
  const equity = accounts.reduce((a, x) => a + x.endBalance, 0);
  const start = accounts.reduce((a, x) => a + x.startBalance, 0);
  const growth = start ? ((equity - start) / start) * 100 : 0;
  const open = PORTFOLIO_TRADES.filter((t) => !isClosed(t));
  const float = open.reduce((a, t) => a + t.pnl, 0);
  const margin = accounts.reduce((a, x) => a + x.marginUsed, 0);
  return {
    headline: growth >= 0 ? `Up ${pct(growth, 1)} across ${plural(accounts.length, 'account')}, drawdown held at ${pct(dd, 1)}` : `Down ${pct(Math.abs(growth), 1)} across ${plural(accounts.length, 'account')}, ${pct(dd, 1)} peak drawdown`,
    metrics: [
      { label: 'Equity', value: `$${Math.round(equity).toLocaleString()}` },
      { label: `${days}d net`, value: money(s.realized), tone: (s.realized >= 0 ? 'good' : 'bad') as 'good' | 'bad' },
      { label: 'Max drawdown', value: pct(dd, 1), tone: (dd > 10 ? 'bad' : 'neutral') as 'bad' | 'neutral' },
      { label: 'Floating', value: money(float), tone: (float >= 0 ? 'good' : 'bad') as 'good' | 'bad' },
    ],
    note: `${plural(s.closed, 'trade')} closed in ${days} days at a ${pct(s.winRate)} win rate, ${plural(open.length, 'position')} still open and $${Math.round(margin).toLocaleString()} tied up as margin.${dd > 10 ? ` Recovering a ${pct(dd, 1)} drawdown needs about ${pct((dd / (100 - dd)) * 100, 1)} back, so cut risk until it is under control.` : margin > equity * 0.3 ? ' Margin over 30% of equity leaves little room for a gap against you.' : ' Keep risk per trade where it is and review at month end.'}`,
  };
}

export function backtestChecklist() {
  const tagged = DEFAULT_PLAYBOOKS.map((p) => {
    const mine = JOURNAL_ENTRIES.filter((e) => e.strategy === p.name);
    return { p, n: mine.length, pnl: mine.reduce((a, e) => a + (e.pnl || 0), 0) };
  });
  const traded = tagged.filter((t) => t.n > 0).sort((a, b) => b.pnl - a.pnl);
  const worst = traded[traded.length - 1];
  const untested = tagged.filter((t) => t.n === 0);
  const first = worst && worst.pnl < 0 ? worst.p : (traded[0]?.p ?? DEFAULT_PLAYBOOKS[0]);
  return {
    headline: first ? `Put ${first.name} through a run next` : 'Tag a playbook and I will tell you what to test',
    steps: [
      { title: 'Widen the window first', text: 'Under about 100 trades most of what you see is luck. Test a longer period before you tune anything.' },
      { title: 'Put your real costs in', text: 'Spread, commission and slippage turn a thin edge into no edge. Use your broker’s numbers, not the defaults.' },
      { title: 'Change one rule at a time', text: 'Optimising everything at once fits the past. Move one rule, re-run, and keep it only if it survives a different period.' },
      ...(untested.length ? [{ title: `${plural(untested.length, 'idea')} never traded`, text: `${untested.map((t) => t.p.name).slice(0, 3).join(', ')} have no live trades. A backtest is cheaper than finding out with money.` }] : []),
    ],
    note: 'A backtest is a hypothesis, not a forecast. Compare its win rate with your live one before you trust it.',
  };
}

export function alertsChecklist(alerts: AlertLike[], limit: number, distanceOf?: (a: AlertLike) => number | null) {
  const active = alerts.filter((a) => a.status === 'active');
  const distances = distanceOf ? alerts.map((a) => ({ a, d: distanceOf(a) })).filter((x) => x.d != null) as { a: AlertLike; d: number }[] : [];
  const nearest = [...distances].sort((x, y) => Math.abs(x.d) - Math.abs(y.d))[0];
  const far = distances.filter((x) => Math.abs(x.d) > 5);
  const noChannel = alerts.filter((a) => !a.app && !a.email && !a.sms);
  const steps = [
    nearest
      ? { title: `${nearest.a.symbol} is closest`, text: `About ${pct(Math.abs(nearest.d), 2)} from price. Write the entry, stop and size now, not when it fires.` }
      : { title: 'Nothing imminent', text: 'No price alert is near its level, so nothing needs a decision today.' },
    ...(far.length ? [{ title: `${plural(far.length, 'alert')} more than 5% away`, text: 'Those sit quiet and use up your plan limit. Delete the ones you set weeks ago.' }] : []),
    ...(noChannel.length ? [{ title: `${plural(noChannel.length, 'alert')} fires silently`, text: 'App, email and SMS are all off on those, so nobody will know when they trigger.' }] : []),
    { title: `${Math.max(0, limit - alerts.length)} slots left`, text: alerts.length >= limit ? 'You are at your plan limit. Delete one before adding another, or upgrade.' : `${active.length} armed and ${alerts.length - active.length} paused of the ${limit} your plan allows.` },
  ];
  return { headline: nearest && Math.abs(nearest.d) < 1 ? `${nearest.a.symbol} is about to trigger` : `${plural(active.length, 'alert')} armed`, steps, note: 'An alert tells you to look, not to click.' };
}

/* ───────────── One article, summarised ───────────── */

export interface ReadableArticle {
  headline: string;
  excerpt?: string;
  content?: string[];
  sentiment?: string;
  assetClass?: string;
  tags?: string[];
  source?: string;
  readTime?: string;
  expertSummary?: string;
}

const sentences = (text: string) =>
  text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => x.length > 40);

/** Score sentences by how much signal they carry: numbers, levels, named drivers. */
function keySentences(parts: string[], want: number): string[] {
  const all = parts.flatMap(sentences);
  if (!all.length) return [];
  const scored = all.map((s, i) => {
    let score = 0;
    if (/\d/.test(s)) score += 2;
    if (/%|\$|bps|pips?/.test(s)) score += 2;
    if (/\b(said|expects?|forecast|guidance|warned|announced|raised|cut|data|report)\b/i.test(s)) score += 2;
    if (/\b(support|resistance|breakout|level|target|range)\b/i.test(s)) score += 1;
    score -= Math.min(2, Math.floor(i / 4)); // earlier paragraphs carry the news
    if (s.length > 240) score -= 1;
    return { s, score, i };
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).slice(0, want).sort((a, b) => a.i - b.i).map((x) => x.s);
}

/**
 * Three lines on one article: what it says, what moves because of it, and how to read it.
 * Extractive, so every line is the article's own wording rather than something invented.
 */
export function articleSummary(a: ReadableArticle): { title: string; lines: string[]; footnote: string } {
  const body = a.content?.length ? a.content : a.excerpt ? [a.excerpt] : [];
  const key = keySentences(body, 3);
  const lines: string[] = [];

  if (key.length) lines.push(...key);
  else if (a.excerpt) lines.push(a.excerpt);
  else lines.push('This piece has no body text to summarise here, so read it in full.');

  if (a.expertSummary) lines.push(`Expert highlight: ${a.expertSummary}`);

  const lean = a.sentiment === 'Bullish' ? 'reads bullish' : a.sentiment === 'Bearish' ? 'reads bearish' : 'reads neutral';
  const tags = (a.tags ?? []).filter((t) => t && t.toLowerCase() !== (a.assetClass ?? '').toLowerCase()).slice(0, 3);
  const scope = a.assetClass ? `${a.assetClass}${tags.length ? ` (${tags.join(', ')})` : ''}` : tags.join(', ');
  lines.push(`${a.source ? `${a.source} ` : ''}${lean}${scope ? ` and is about ${scope}` : ''}. Coverage follows a move more often than it leads one, so mark the level you would act on rather than trading the headline.`);

  return {
    title: `${a.readTime ? `The ${a.readTime} version` : 'The short version'}`,
    lines,
    footnote: `Pulled from the article’s own sentences, not rewritten. Reporting, not advice.`,
  };
}

/* ═══════════ Spotlight panel data, per feature ═══════════ */


/** Turns one of the reads above into the spotlight panel's shape. */
export function toSpotlight(d: AiSectionData, pretext: string, suggestions: SpotlightSuggestion[] = [], statNotes?: Record<string, string>): SpotlightData {
  return {
    pretext,
    headline: d.headline,
    overview: d.overview,
    stats: (d.chips ?? []).map((c) => ({ label: c.label, value: c.value, tone: c.tone === 'lime' ? 'good' : c.tone === 'pink' ? 'bad' : 'neutral' })),
    // Two tabs only: what the feature says, and what to ask next. The
    // columns that used to be tabs of their own read better underneath the
    // summary than hidden behind headings nobody clicked.
    tabs: [
      {
        id: 'summary',
        label: 'Summary',
        lines: (d.columns ?? []).flatMap((c) =>
          c.items.map((it) => ({ label: it.title, body: it.text })),
        ),
      },
      { id: 'chat', label: 'Chat', lines: [] },
    ],
    suggestions,
    statNotes,
    footnote: d.footnote,
  };
}

/** The signals page as a spotlight panel, with its own pre-text and suggestions. */
export function signalsSpotlight(
  signals: { ticker: string; action: string; confidence: number; timeframe: string; riskReward: string; change24h: number; assetClass: string; analysis?: string }[],
  tierLevel: number,
  onBrokers: () => void,
  onCompare: () => void,
  onUpgrade: () => void,
): SpotlightData {
  const live = signals.filter((s) => s.action !== 'UPGRADE');
  const locked = signals.length - live.length;
  return toSpotlight(signalsRead(signals, tierLevel), `Read ${plural(live.length, 'open signal')}`, [
    { label: 'Find a broker for this', onClick: onBrokers },
    { label: 'Compare execution costs', onClick: onCompare },
    ...(locked ? [{ label: `Unlock ${plural(locked, 'signal')}`, onClick: onUpgrade }] : []),
  ]);
}

/* ───────────── Journal: the whole record ───────────── */

export function journalRead(): AiSectionData {
  const closed = JOURNAL_ENTRIES.filter((e) => e.outcome === 'win' || e.outcome === 'loss');
  if (!closed.length) {
    return { eyebrow: 'Your journal', headline: 'Nothing logged yet', overview: '', empty: { text: 'Write up a few trades and I can read how you trade.' } };
  }
  const wins = closed.filter((e) => e.outcome === 'win');
  const net = closed.reduce((a, e) => a + (e.pnl || 0), 0);
  const rs = closed.map((e) => e.rMultiple).filter((x): x is number => typeof x === 'number');
  const avgR = rs.length ? avg(rs) : 0;
  const planned = closed.filter((e) => e.followedPlan === true).length;
  const byStrategy = Array.from(closed.reduce((m, e) => {
    const k = e.strategy || 'Untagged';
    const v = m.get(k) ?? { n: 0, pnl: 0 };
    return m.set(k, { n: v.n + 1, pnl: v.pnl + (e.pnl || 0) });
  }, new Map<string, { n: number; pnl: number }>()).entries()).sort((a, b) => b[1].pnl - a[1].pnl);
  const best = byStrategy[0];
  const worst = byStrategy[byStrategy.length - 1];
  const mistakes = new Map<string, number>();
  closed.forEach((e) => (e.mistakes ?? []).forEach((m) => mistakes.set(m, (mistakes.get(m) ?? 0) + 1)));
  const topMistake = Array.from(mistakes.entries()).sort((a, b) => b[1] - a[1])[0];

  return {
    eyebrow: 'Your journal',
    reading: `Reading ${plural(closed.length, 'closed trade')}…`,
    headline: net >= 0
      ? `${plural(closed.length, 'closed trade')}, ${money(net)} and ${pct((wins.length / closed.length) * 100)} wins`
      : `${plural(closed.length, 'closed trade')} down ${money(Math.abs(net))} at ${pct((wins.length / closed.length) * 100)} wins`,
    overview: `Your average result is ${avgR.toFixed(2)}R and you followed your plan on ${pct((planned / closed.length) * 100)} of them.${best ? ` ${best[0]} is your strongest at ${money(best[1].pnl)} over ${plural(best[1].n, 'trade')}.` : ''}${worst && worst[1].pnl < 0 ? ` ${worst[0]} has cost ${money(worst[1].pnl)}.` : ''}`,
    chips: [
      { label: 'Closed', value: String(closed.length) },
      { label: 'Net', value: money(net), tone: net >= 0 ? 'lime' : 'pink' },
      { label: 'Win rate', value: pct((wins.length / closed.length) * 100) },
      { label: 'Average R', value: `${avgR.toFixed(2)}R`, tone: avgR >= 0 ? 'lime' : 'pink' },
    ],
    columns: [
      {
        accent: ACCENT.lime,
        title: 'What is working',
        items: best ? [{ title: best[0], text: `${money(best[1].pnl)} over ${plural(best[1].n, 'trade')}. Keep sizing it the same and write up why each one worked.` }] : [],
      },
      {
        accent: ACCENT.pink,
        title: 'What is costing you',
        items: [
          ...(worst && worst[1].pnl < 0 ? [{ title: worst[0], text: `${money(worst[1].pnl)} over ${plural(worst[1].n, 'trade')}. Halve the size there or leave it alone for a month.` }] : []),
          ...(topMistake ? [{ title: `“${topMistake[0]}” ${topMistake[1]} times`, text: 'It is the habit showing up most often in your own notes. Put it on the checklist before you enter.' }] : []),
        ],
      },
      {
        accent: ACCENT.violet,
        title: 'Next',
        items: [{ title: planned / closed.length < 0.7 ? 'Follow the plan more often' : 'Keep the discipline', text: planned / closed.length < 0.7 ? `You stuck to the plan on only ${pct((planned / closed.length) * 100)} of trades. The edge is in the ones you follow.` : 'Plan adherence is high. Review the exits next: that is usually where the rest of the edge is.' }],
      },
    ],
    footnote: 'Built from your journal entries. Not financial advice.',
  };
}

/** Alerts the dock can read without the page's own state. */
export const DEMO_ALERTS: AlertLike[] = [
  { id: 'd1', type: 'price', symbol: 'XAU/USD', condition: 'above', value: 2700, status: 'active', app: true, email: true },
  { id: 'd2', type: 'price', symbol: 'EUR/USD', condition: 'below', value: 1.05, status: 'active', app: true },
  { id: 'd3', type: 'news', symbol: 'USD', status: 'paused', app: false, email: false, sms: false },
];
