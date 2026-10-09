import { EconomicEvent, MarketSignal, NewsArticle } from '../../types';
import { NEWS_ARTICLES } from '../../data/newsData';
import { ECONOMIC_EVENTS, CALENDAR_NOW } from '../../data/economicCalendarData';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { AiContext, AiItem, AiMessage, AiReply, AiStat } from './aiTypes';
import { Instrument, mid, money, plural, whenBkk } from './aiUtil';

const NOW = () => Date.parse(CALENDAR_NOW);

const upcoming = (filter: (e: EconomicEvent) => boolean = () => true) =>
  ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > NOW() && filter(e)).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

function tally(articles: NewsArticle[]) {
  const c = { Bullish: 0, Bearish: 0, Neutral: 0 };
  articles.forEach((a) => { c[a.sentiment] += 1; });
  const lean = c.Bullish > c.Bearish ? 'leaning bullish' : c.Bearish > c.Bullish ? 'leaning bearish' : 'mixed';
  const stats: AiStat[] = [
    { label: 'Bullish stories', value: String(c.Bullish), tone: 'good' },
    { label: 'Bearish stories', value: String(c.Bearish), tone: 'bad' },
    { label: 'Neutral', value: String(c.Neutral), tone: 'neutral' },
  ];
  return { c, lean, stats };
}

const newsItem = (n: NewsArticle): AiItem => ({ title: n.headline, sub: `${n.source} · ${n.sentiment} · ${n.timestamp}`, badge: 'News', tab: 'news' });
const eventItem = (e: EconomicEvent, label = ''): AiItem => ({
  title: `${label}${e.title}`,
  sub: `${e.currency} · ${whenBkk(e.at)} · ${e.impact} impact${e.forecast ? ` · forecast ${e.forecast}` : ''}${e.previous ? ` · prev ${e.previous}` : ''}`,
  badge: 'Event',
  tab: 'economic-calendar',
});
const signalItem = (s: MarketSignal): AiItem => ({ title: `${s.ticker} ${s.action}`, sub: `${s.confidence}% confidence · ${s.timeframe} · R:R ${s.riskReward}`, badge: 'Signal', signal: s.ticker });

const SRC = ['Market News', 'Economic calendar', 'Trading signals'];
const NOTE = 'This summarises what is on the page. It does not predict where prices go.';

/* ───────────── Today ───────────── */

function today(ctx: AiContext): AiMessage {
  const articles = NEWS_ARTICLES.slice(0, 3);
  const next24 = upcoming((e) => e.impact !== 'Low' && Date.parse(e.at) < NOW() + 24 * 3600000).slice(0, 3);
  const high = upcoming((e) => e.impact === 'High').slice(0, 2);
  const top = [...ctx.signals].filter((s) => s.action !== 'UPGRADE').sort((a, b) => b.confidence - a.confidence).slice(0, 2);
  const t = tally(NEWS_ARTICLES.slice(0, 8));
  return {
    id: mid(), role: 'ai', surface: 'market',
    heading: 'Your briefing, in about a minute',
    paragraphs: [
      `Across the latest ${NEWS_ARTICLES.slice(0, 8).length} stories the tone is ${t.lean}.${articles[0] ? ` Lead story: ${articles[0].headline}.` : ''}`,
      next24.length ? `Next 24 hours: ${next24.map((e) => `${e.title} (${e.currency}, ${whenBkk(e.at)})`).join('; ')}.` : 'No medium or high impact releases in the next 24 hours.',
    ],
    stats: t.stats,
    items: [...articles.map(newsItem), ...high.map((e) => eventItem(e, 'Later: ')), ...top.map(signalItem)],
    sources: SRC,
    note: NOTE,
    followUps: ['Week ahead', 'Crypto summary', 'Gold outlook', 'Market sentiment by asset class'],
  };
}

/* ───────────── Week ahead ───────────── */

function week(): AiMessage {
  const list = upcoming((e) => e.impact === 'High' && Date.parse(e.at) < NOW() + 7 * 86400000);
  const days = new Map<string, EconomicEvent[]>();
  list.forEach((e) => {
    const k = new Date(e.at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok' });
    days.set(k, [...(days.get(k) ?? []), e]);
  });
  const busiest = Array.from(days.entries()).sort((a, b) => b[1].length - a[1].length)[0];
  const ccys = Array.from(new Set(list.map((e) => e.currency)));
  return {
    id: mid(), role: 'ai', surface: 'market',
    heading: 'The week ahead',
    paragraphs: [
      list.length ? `${plural(list.length, 'high-impact release')} in the next 7 days, touching ${ccys.slice(0, 5).join(', ')}.${busiest ? ` Busiest day: ${busiest[0]} with ${busiest[1].length}.` : ''}` : 'No high-impact releases are scheduled in the next 7 days.',
      'Spreads widen and slippage is common right at a release, so many traders cut size or stand aside around these times.',
    ],
    bars: busiest ? [{ title: 'High-impact releases per day', rows: Array.from(days.entries()).map(([label, evs]) => ({ label, value: evs.length, display: String(evs.length) })) }] : undefined,
    items: list.slice(0, 7).map((e) => eventItem(e)),
    sources: ['Economic calendar'],
    note: NOTE,
    followUps: ['Give me today’s briefing', 'What is NFP?', 'Gold outlook'],
  };
}

/* ───────────── Asset class ───────────── */

function asset(ctx: AiContext, cls: Instrument['cls']): AiMessage {
  const articles = NEWS_ARTICLES.filter((n) => n.assetClass === cls);
  const t = tally(articles);
  const sigs = ctx.signals.filter((s) => s.assetClass === cls && s.action !== 'UPGRADE').sort((a, b) => b.confidence - a.confidence).slice(0, 2);
  const evs = upcoming((e) => e.assetClass === cls && e.impact !== 'Low').slice(0, 2);
  return {
    id: mid(), role: 'ai', surface: 'market',
    heading: `${cls} summary`,
    paragraphs: [
      articles.length ? `${plural(articles.length, 'story')} on ${cls}, ${t.lean}. ${articles[0].headline}.` : `I have no ${cls} stories on the page right now.`,
      sigs.length
        ? `Top signal: ${sigs[0].ticker} ${sigs[0].action} at ${sigs[0].confidence}% confidence on the ${sigs[0].timeframe}.`
        : ctx.signals.some((s) => s.assetClass === cls && s.action === 'UPGRADE')
          ? `The ${cls} signals are locked at your current level.`
          : `No ${cls} signals at the moment.`,
    ],
    stats: articles.length ? t.stats : undefined,
    items: [...articles.slice(0, 3).map(newsItem), ...evs.map((e) => eventItem(e)), ...sigs.map(signalItem)],
    sources: SRC,
    note: NOTE,
    followUps: ['Give me today’s briefing', 'Week ahead', 'Market sentiment by asset class'],
  };
}

/* ───────────── Instrument ───────────── */

function symbol(ctx: AiContext, inst: Instrument): AiMessage {
  const hay = (a: NewsArticle) => `${a.headline} ${a.excerpt} ${a.tags.join(' ')}`.toLowerCase();
  const direct = NEWS_ARTICLES.filter((a) => inst.aliases.some((al) => hay(a).includes(al)));
  const articles = (direct.length ? direct : NEWS_ARTICLES.filter((a) => a.assetClass === inst.cls)).slice(0, 3);
  const sig = ctx.signals.find((s) => s.ticker === inst.symbol);
  const evs = upcoming((e) => e.impact !== 'Low' && inst.ccy.includes(e.currency)).slice(0, 3);
  const t = tally(articles);
  const open = ctx.allowTrades ? PORTFOLIO_TRADES.filter((p) => !p.isRealized && p.symbol === inst.symbol) : [];
  const paragraphs: string[] = [];
  const locked = sig?.action === 'UPGRADE';
  if (sig && locked) {
    paragraphs.push(`The ${inst.label} signal is locked at your current level${sig.minLevel ? ` (it opens at level ${sig.minLevel})` : ''}.`);
  } else if (sig) {
    paragraphs.push(`${inst.label} has a ${sig.action} signal at ${sig.confidence}% confidence on the ${sig.timeframe}. Entry ${sig.entryPrice}, stop ${sig.stopLoss}, first target ${sig.takeProfit1} (R:R ${sig.riskReward}).`);
    if (sig.analysis) paragraphs.push(sig.analysis.length > 220 ? `${sig.analysis.slice(0, 217).trimEnd()}...` : sig.analysis);
  } else {
    paragraphs.push(`There is no active MarketSyde signal on ${inst.label} right now.`);
  }
  paragraphs.push(articles.length ? `Related coverage is ${t.lean}.` : 'I found no stories that name this instrument directly.');
  paragraphs.push(evs.length ? `Next releases that can move it: ${evs.map((e) => `${e.title} (${e.currency}, ${whenBkk(e.at)})`).join('; ')}.` : 'No medium or high impact releases that touch it in the calendar.');
  if (open.length) {
    const pnl = open.reduce((s, p) => s + p.pnl, 0);
    paragraphs.push(`You have ${plural(open.length, 'open position')} on it, floating ${money(pnl)}.`);
  }
  return {
    id: mid(), role: 'ai', surface: 'market',
    heading: `${inst.label} at a glance`,
    paragraphs,
    stats: sig && !locked
      ? [
          { label: 'Signal', value: sig.action, tone: /buy|long/i.test(sig.action) ? 'good' : /sell|short/i.test(sig.action) ? 'bad' : 'neutral' },
          { label: 'Confidence', value: `${sig.confidence}%` },
          { label: '24h change', value: `${sig.change24h > 0 ? '+' : ''}${sig.change24h}%`, tone: sig.change24h > 0 ? 'good' : sig.change24h < 0 ? 'bad' : 'neutral' },
        ]
      : undefined,
    items: [...(sig && !locked ? [signalItem(sig)] : []), ...articles.map(newsItem), ...evs.map((e) => eventItem(e))],
    sources: SRC,
    note: NOTE,
    followUps: [`How are my ${inst.symbol} trades doing?`, 'Give me today’s briefing', 'Week ahead'],
  };
}

/* ───────────── Sentiment ───────────── */

function sentiment(): AiMessage {
  const classes = Array.from(new Set(NEWS_ARTICLES.map((n) => n.assetClass)));
  const rows = classes.map((c) => {
    const a = NEWS_ARTICLES.filter((n) => n.assetClass === c);
    const bull = a.filter((n) => n.sentiment === 'Bullish').length;
    return { label: c, value: (bull / a.length) * 100, display: `${bull}/${a.length} bullish` };
  });
  const t = tally(NEWS_ARTICLES);
  return {
    id: mid(), role: 'ai', surface: 'market',
    heading: 'Sentiment by asset class',
    paragraphs: [`Across ${NEWS_ARTICLES.length} stories the overall tone is ${t.lean}. The bars show the share of bullish stories per asset class.`],
    stats: t.stats,
    bars: [{ title: 'Share of bullish stories', rows }],
    sources: ['Market News'],
    note: 'Sentiment is context for risk, not an entry signal. One-sided mood can reverse.',
    followUps: ['Crypto summary', 'Forex summary', 'Give me today’s briefing'],
  };
}

export type MarketMode = 'today' | 'week' | 'asset' | 'symbol' | 'sentiment';

export function marketSummary(ctx: AiContext, mode: MarketMode = 'today', opts: { cls?: Instrument['cls']; inst?: Instrument } = {}): AiReply {
  if (mode === 'week') return { msg: week(), mem: { surface: 'market' } };
  if (mode === 'sentiment') return { msg: sentiment(), mem: { surface: 'market' } };
  if (mode === 'asset' && opts.cls) return { msg: asset(ctx, opts.cls), mem: { surface: 'market', assetClass: opts.cls } };
  if (mode === 'symbol' && opts.inst) return { msg: symbol(ctx, opts.inst), mem: { surface: 'market', symbol: opts.inst.symbol, assetClass: opts.inst.cls } };
  return { msg: today(ctx), mem: { surface: 'market' } };
}
