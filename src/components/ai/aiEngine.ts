import { Broker, MarketSignal } from '../../types';
import { COURSES } from '../../data/educationData';
import { NEWS_ARTICLES } from '../../data/newsData';
import { ECONOMIC_EVENTS, CALENDAR_NOW } from '../../data/economicCalendarData';
import { JOURNAL_ENTRIES } from '../../data/journalData';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { groupPnl, tradeStats, tradesInRange, totalSeries, maxDrawdown, isClosed } from '../portfolio/portfolioMath';

export interface AiItem {
  title: string;
  sub?: string;
  tab?: string;
  signal?: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'ai';
  text?: string;
  heading?: string;
  paragraphs?: string[];
  items?: AiItem[];
  sources?: string[];
  note?: string;
}

export interface AiContext {
  firstName: string;
  brokers: Broker[];
  signals: MarketSignal[];
  usePersonalData: boolean;
}

export type Surface = 'broker' | 'learn' | 'market' | 'insights' | 'behavior' | 'next';

export interface BrokerPrefs {
  priority: 'cost' | 'safety' | 'cashback' | 'deposit';
  style: 'scalping' | 'swing' | 'crypto';
}

let counter = 0;
const mid = () => `m${Date.now()}_${counter++}`;
const money = (n: number) => `${n < 0 ? '-' : n > 0 ? '+' : ''}$${Math.abs(n).toFixed(0)}`;

/* ───────────── Broker matching ───────────── */

const num = (s: string) => parseFloat((s || '').replace(/[^0-9.]/g, '')) || 0;

export function matchBrokers(brokers: Broker[], prefs: BrokerPrefs): AiMessage {
  const scored = brokers.map((b) => {
    const spread = num(b.spreadFrom);
    const dep = num(b.minDeposit);
    const tier1 = b.regulations.filter((r) => /tier 1|fca|asic|cysec/i.test(r)).length;
    let score = (b.score ?? 8) * 4;
    const why: string[] = [];
    if (prefs.priority === 'cost') { score += (1 - Math.min(spread, 1.5) / 1.5) * 20; why.push(`spreads from ${b.spreadFrom}`); }
    if (prefs.priority === 'safety') { score += tier1 * 7; why.push(`${b.regulations.length} regulators including ${b.regulations.slice(0, 2).join(', ')}`); }
    if (prefs.priority === 'cashback') { score += b.cashbackPerLot * 3; why.push(`up to $${b.cashbackPerLot.toFixed(2)} cashback per lot`); }
    if (prefs.priority === 'deposit') { score += (1 - Math.min(dep, 200) / 200) * 20; why.push(`minimum deposit ${b.minDeposit}`); }
    if (prefs.style === 'scalping') { score += (1 - Math.min(spread, 1.5) / 1.5) * 8; if (/raw|zero|ecn/i.test(b.spreadType || '')) { score += 5; why.push('raw or zero-spread accounts for tight entries'); } }
    if (prefs.style === 'crypto') { const c = b.category === 'Crypto' || b.category === 'Multi-Asset'; score += c ? 10 : 0; if (c) why.push('multi-asset coverage that includes crypto'); }
    if (prefs.style === 'swing') { if (b.platforms.includes('cTrader') || b.platforms.includes('MT5')) { score += 4; why.push('MT5 or cTrader for swing charting'); } }
    return { b, score, why };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  const label = { cost: 'low trading costs', safety: 'regulation and safety', cashback: 'cashback', deposit: 'a small starting deposit' }[prefs.priority];
  return {
    id: mid(),
    role: 'ai',
    heading: 'Your top three brokers',
    paragraphs: [`You told me ${label} matters most and you trade ${prefs.style === 'crypto' ? 'crypto' : prefs.style}. Here is how the directory ranks for that.`],
    items: scored.map(({ b, why }, i) => ({ title: `${i + 1}. ${b.name}`, sub: `${why.slice(0, 2).join(' · ')}${b.connected ? ' · already connected' : ''}`, tab: 'brokers' })),
    sources: ['Broker directory', 'Your answers'],
    note: 'This ranks listed data, not a promise of execution quality. Open the comparison to check the full account types before you fund.',
  };
}

/* ───────────── Learning assistant ───────────── */

const GLOSSARY: { keys: string[]; title: string; text: string }[] = [
  { keys: ['pip'], title: 'Pip', text: 'A pip is the usual smallest price move in a currency pair, 0.0001 for most pairs and 0.01 for yen pairs. Your profit or loss per pip depends on your lot size.' },
  { keys: ['leverage'], title: 'Leverage', text: 'Leverage lets you control a bigger position than your deposit. It magnifies gains and losses equally, so the safe way to use it is to size by risk, not by the maximum your broker allows.' },
  { keys: ['margin'], title: 'Margin', text: 'Margin is the part of your balance a broker holds to keep your positions open. If equity falls too far below it, positions are closed automatically (a stop-out).' },
  { keys: ['drawdown'], title: 'Drawdown', text: 'Drawdown is how far your equity has fallen from its previous high. A 20% drawdown needs a 25% gain to get back, which is why capping it matters more than chasing returns.' },
  { keys: ['stop loss', 'stop-loss', 'stoploss'], title: 'Stop loss', text: 'A stop loss closes a trade at a price you chose in advance. Set it where your idea is wrong, then size the position so that loss is small enough to accept.' },
  { keys: ['risk reward', 'risk/reward', 'risk-reward', 'r multiple'], title: 'Risk / reward', text: 'Risk/reward compares what you could lose with what you aim to gain. Risking 1 to make 2 means you can be right less than half the time and still come out ahead.' },
  { keys: ['spread'], title: 'Spread', text: 'The spread is the gap between the buy and sell price. It is a cost you pay on every trade, so it matters most if you trade often.' },
  { keys: ['lot'], title: 'Lot', text: 'A lot is a standard trade size. 1 standard lot is 100,000 units of the base currency, a mini is 0.1 and a micro is 0.01. Start with micro sizes while you learn.' },
  { keys: ['rsi'], title: 'RSI', text: 'RSI is a momentum gauge from 0 to 100. Above 70 is often called overbought and below 30 oversold, but strong trends can stay there for a long time, so use it with structure.' },
  { keys: ['support', 'resistance'], title: 'Support and resistance', text: 'These are price areas where buyers or sellers have stepped in before. The more times a level held, the more attention it gets, and the more it can matter when it finally breaks.' },
];

export function learnAnswer(question: string): AiMessage {
  const q = question.toLowerCase();
  const hit = GLOSSARY.find((g) => g.keys.some((k) => q.includes(k)));
  const words = q.split(/[^a-z]+/).filter((w) => w.length > 3);
  const courses = COURSES.map((c) => ({ c, s: words.reduce((a, w) => a + (`${c.title} ${c.summary} ${c.category}`.toLowerCase().includes(w) ? 1 : 0), 0) }))
    .filter((x) => x.s > 0 || !!hit)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map((x) => x.c);
  const pool = courses.length ? courses : COURSES.slice(0, 2);
  return {
    id: mid(),
    role: 'ai',
    heading: hit ? hit.title : 'Where to start',
    paragraphs: hit
      ? [hit.text]
      : ['I do not have a one-line answer for that, but these lessons cover the ground. Tell me the exact term and I will explain it plainly.'],
    items: pool.map((c) => ({ title: c.title, sub: `${c.level} · ${c.lessons.length} lessons · +${c.pointsReward} pts`, tab: 'education-hub' })),
    sources: ['Education Hub', hit ? 'Trading glossary' : 'Course catalog'],
  };
}

/* ───────────── Market summary ───────────── */

export function marketSummary(signals: MarketSignal[]): AiMessage {
  const now = Date.parse(CALENDAR_NOW);
  const upcoming = ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > now && e.impact !== 'Low').sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const today = upcoming.filter((e) => Date.parse(e.at) < now + 24 * 3600000).slice(0, 3);
  const week = upcoming.filter((e) => e.impact === 'High').slice(0, 2);
  const news = NEWS_ARTICLES.slice(0, 3);
  const top = [...signals].sort((a, b) => b.confidence - a.confidence).slice(0, 2);
  const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  return {
    id: mid(),
    role: 'ai',
    heading: 'Your briefing, in about a minute',
    paragraphs: [
      `${news.length} stories matter most right now. ${news[0] ? `Lead: ${news[0].headline}.` : ''}`,
      today.length ? `Next 24 hours: ${today.map((e) => `${e.title} (${e.currency}, ${when(e.at)})`).join('; ')}.` : 'No medium or high impact releases in the next 24 hours.',
    ],
    items: [
      ...news.map((n) => ({ title: n.headline, sub: `${n.source} · ${n.sentiment} · ${n.timestamp}`, tab: 'news' })),
      ...week.map((e) => ({ title: `Later: ${e.title}`, sub: `${e.currency} · ${when(e.at)} · high impact`, tab: 'economic-calendar' })),
      ...top.map((s) => ({ title: `Signal: ${s.ticker} ${s.action}`, sub: `${s.confidence}% confidence · ${s.timeframe}`, signal: s.ticker })),
    ],
    sources: ['Market News', 'Economic calendar', 'Trading signals'],
    note: 'This summarises what is on the page. It does not predict where prices go.',
  };
}

/* ───────────── Trading insights (your trades) ───────────── */

export function tradingInsights(): AiMessage {
  const w = tradesInRange(PORTFOLIO_TRADES, 30);
  const s = tradeStats(w);
  const cls = groupPnl(w, (t) => t.assetClass);
  const strat = groupPnl(w, (t) => t.strategyTag || 'Untagged');
  const series = totalSeries([]).slice(-31);
  const dd = maxDrawdown(series);
  const open = PORTFOLIO_TRADES.filter((t) => !isClosed(t));
  const para: string[] = [
    `Over the last 30 days you closed ${s.closed} trades with a ${s.winRate.toFixed(0)}% win rate and a profit factor of ${s.profitFactor >= 99 ? 'n/a' : s.profitFactor.toFixed(2)}. Net result ${money(s.realized)}.`,
  ];
  if (cls[0]) para.push(`${cls[0].name} did the most work (${money(cls[0].pnl)} over ${cls[0].count} trades).${cls.length > 1 && cls[cls.length - 1].pnl < 0 ? ` ${cls[cls.length - 1].name} took ${money(cls[cls.length - 1].pnl)} back.` : ''}`);
  if (strat[0]) para.push(`Best strategy tag: ${strat[0].name} (${money(strat[0].pnl)}).${strat.length > 1 && strat[strat.length - 1].pnl < 0 ? ` Weakest: ${strat[strat.length - 1].name} (${money(strat[strat.length - 1].pnl)}).` : ''}`);
  para.push(`Equity drawdown in the window peaked at ${dd.toFixed(1)}%, and you have ${open.length} position${open.length === 1 ? '' : 's'} open.`);
  return {
    id: mid(),
    role: 'ai',
    heading: 'What your last 30 days say',
    paragraphs: para,
    items: [{ title: 'Open the Portfolio Tracker', sub: 'Analytics, heatmap and drill-down', tab: 'portfolio-tracker' }],
    sources: ['Your trades (30 days)', 'Your equity curve'],
    note: 'Patterns in a small sample can be noise. Treat this as a prompt to look closer.',
  };
}

/* ───────────── Behavioral observation (your journal) ───────────── */

export function behaviorObservation(): AiMessage {
  const e = JOURNAL_ENTRIES;
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const on = e.filter((x) => x.followedPlan);
  const off = e.filter((x) => !x.followedPlan);
  const emotions = new Map<string, number[]>();
  e.forEach((x) => emotions.set(x.emotionBefore, [...(emotions.get(x.emotionBefore) || []), x.pnl]));
  const worst = Array.from(emotions.entries()).filter(([, v]) => v.length >= 1).sort((a, b) => avg(a[1]) - avg(b[1]))[0];
  const mistakes = new Map<string, number>();
  e.forEach((x) => x.mistakes.forEach((m) => mistakes.set(m, (mistakes.get(m) || 0) + 1)));
  const topMistake = Array.from(mistakes.entries()).sort((a, b) => b[1] - a[1])[0];
  const para = [
    `When you followed your plan (${on.length} entries) you averaged ${money(avg(on.map((x) => x.pnl)))} a trade. Off-plan (${off.length}) it was ${money(avg(off.map((x) => x.pnl)))}.`,
  ];
  if (worst) para.push(`Your weakest starting mood is “${worst[0]}”: ${money(avg(worst[1]))} on average over ${worst[1].length} trade${worst[1].length === 1 ? '' : 's'}.`);
  if (topMistake) para.push(`Most repeated mistake: ${topMistake[0]} (${topMistake[1]}×).`);
  para.push('A rule you could test this week: after two losses in a row, stop for the day and write the journal entry before the next trade.');
  return {
    id: mid(),
    role: 'ai',
    heading: 'A habit worth catching early',
    paragraphs: para,
    items: [{ title: 'Write today’s journal entry', sub: 'Two minutes, while it is fresh', tab: 'trading-journal' }],
    sources: ['Your trading journal'],
    note: 'This is an observation about your own notes, not a diagnosis. You know your trading best.',
  };
}

/* ───────────── Recommendations ───────────── */

export function recommendations(signals: MarketSignal[]): AiMessage {
  const course = COURSES.find((c) => c.level === 'Beginner') || COURSES[0];
  const article = NEWS_ARTICLES.find((n) => n.expertSummary) || NEWS_ARTICLES[0];
  const sig = [...signals].sort((a, b) => b.confidence - a.confidence)[0];
  const now = Date.parse(CALENDAR_NOW);
  const ev = ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > now && e.impact === 'High').sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
  return {
    id: mid(),
    role: 'ai',
    heading: 'What to do next',
    paragraphs: ['Four things, in the order I would do them.'],
    items: [
      { title: `Read: ${article.headline}`, sub: `${article.source} · ${article.readTime}`, tab: 'news' },
      { title: `Learn: ${course.title}`, sub: `${course.level} · +${course.pointsReward} pts`, tab: 'education-hub' },
      ...(sig ? [{ title: `Watch: ${sig.ticker} ${sig.action}`, sub: `${sig.confidence}% confidence`, signal: sig.ticker }] : []),
      ...(ev ? [{ title: `Prepare for: ${ev.title}`, sub: `${ev.currency} · high impact`, tab: 'economic-calendar' }] : []),
    ],
    sources: ['Market News', 'Education Hub', 'Signals', 'Economic calendar'],
  };
}

/* ───────────── Router ───────────── */

export function route(text: string, ctx: AiContext, prefs: BrokerPrefs): AiMessage {
  const q = text.toLowerCase();
  const personalOff = (what: string): AiMessage => ({
    id: mid(), role: 'ai', heading: 'Personal data is switched off',
    paragraphs: [`I can look at ${what}, but you have turned off “Use my portfolio and journal data”. Turn it on in the panel on the right and ask again.`],
  });
  if (/broker|cashback|regulat|which account|account type/.test(q)) return matchBrokers(ctx.brokers, { ...prefs, priority: /cashback/.test(q) ? 'cashback' : /regulat|safe/.test(q) ? 'safety' : /deposit|small/.test(q) ? 'deposit' : prefs.priority, style: /crypto|bitcoin/.test(q) ? 'crypto' : /scalp/.test(q) ? 'scalping' : /swing/.test(q) ? 'swing' : prefs.style });
  if (/habit|behaviou?r|emotion|mistake|disciplin|revenge|journal|mood/.test(q)) return ctx.usePersonalData ? behaviorObservation() : personalOff('your journal');
  if (/my (trades|portfolio|performance|results)|insight|win rate|how am i|how.?s my/.test(q)) return ctx.usePersonalData ? tradingInsights() : personalOff('your trades');
  if (/briefing|summary|market|news|today|happening|calendar/.test(q)) return marketSummary(ctx.signals);
  if (/next|recommend|what should i|suggest/.test(q)) return recommendations(ctx.signals);
  if (/what is|what.?s|explain|how do|how does|learn|meaning|pip|leverage|margin|drawdown|stop.?loss|risk.?reward|spread|lot|rsi|support|resistance/.test(q)) return learnAnswer(text);
  return {
    id: mid(), role: 'ai', heading: 'I can help with six things',
    paragraphs: [`I can match you with brokers, explain a trading term, brief you on the market, read your recent trades, notice habits in your journal, or suggest what to do next. Try one of the prompts on the left, ${ctx.firstName}.`],
  };
}
