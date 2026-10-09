import { EXPERT_ADVISORS, ExpertAdvisor } from '../../data/expertAdvisorData';
import { PORTFOLIO_ACCOUNTS, PORTFOLIO_TRADES, DEFAULT_GOALS } from '../../data/portfolioData';
import { JOURNAL_ENTRIES } from '../../data/journalData';
import { DEFAULT_PLAYBOOKS } from '../../data/journalPlaybooks';
import { isClosed, maxDrawdown, sliceSeries, totalSeries, tradeStats, tradesInRange, groupPnl } from '../portfolio/portfolioMath';
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
