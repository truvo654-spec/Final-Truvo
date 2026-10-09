import { EXPERT_ADVISORS, ExpertAdvisor } from '../../data/expertAdvisorData';
import { PORTFOLIO_ACCOUNTS, PORTFOLIO_TRADES, DEFAULT_GOALS } from '../../data/portfolioData';
import { JOURNAL_ENTRIES } from '../../data/journalData';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import { isClosed, maxDrawdown, sliceSeries, totalSeries, tradeStats, tradesInRange, groupPnl } from '../portfolio/portfolioMath';
import { COURSES, CERTIFICATES } from '../../data/educationData';
import { ECONOMIC_EVENTS, CALENDAR_NOW } from '../../data/economicCalendarData';
import { NEWS_ARTICLES } from '../../data/newsData';
import { PROMOTIONS } from '../../data/promotionsData';
import { GAMIFICATION_TIERS, INITIAL_MISSIONS, LEADERBOARD_USERS } from '../../data/mockData';
import { AiSectionData, ACCENT } from './AiSection';

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
