import { COURSES } from '../../data/educationData';
import { NEWS_ARTICLES } from '../../data/newsData';
import { ECONOMIC_EVENTS, CALENDAR_NOW } from '../../data/economicCalendarData';
import { JOURNAL_ENTRIES, JOURNAL_TODAY } from '../../data/journalData';
import { PORTFOLIO_TRADES } from '../../data/portfolioData';
import { INITIAL_MISSIONS } from '../../data/mockData';
import { isClosed, maxDrawdown, sliceSeries, totalSeries } from '../portfolio/portfolioMath';
import { AiContext, AiItem, AiReply } from './aiTypes';
import { instrumentBySymbol, levelIndex, mid, whenBkk } from './aiUtil';

interface Cand { score: number; item: AiItem; source: string }

export function recommendations(ctx: AiContext): AiReply {
  const cands: Cand[] = [];
  const used = new Set<string>();
  const lvl = levelIndex(ctx.level);
  const courseFor = (category: string) =>
    [...COURSES.filter((c) => c.category === category)].sort((a, b) => Math.abs(levelIndex(a.level) - lvl) - Math.abs(levelIndex(b.level) - lvl))[0];

  const entries = ctx.allowJournal ? JOURNAL_ENTRIES : [];
  const planRate = entries.length ? entries.filter((e) => e.followedPlan).length / entries.length : 1;
  const mistakes = new Map<string, number>();
  entries.forEach((e) => e.mistakes.forEach((m) => mistakes.set(m, (mistakes.get(m) ?? 0) + 1)));
  const dd = ctx.allowTrades ? maxDrawdown(sliceSeries(totalSeries([]), 30, 120)) : 0;

  // Psychology
  if (entries.length && (planRate < 0.7 || mistakes.has('Revenge trade') || mistakes.has('Ignored plan'))) {
    const c = courseFor('Trading Psychology');
    if (c) {
      cands.push({ score: 85, source: 'Your journal', item: { title: `Learn: ${c.title}`, sub: `Why: you followed your plan on ${Math.round(planRate * 100)}% of entries${mistakes.has('Revenge trade') ? ' and logged revenge trades' : ''}. ${c.level} · +${c.pointsReward} pts`, badge: 'Learn', tab: 'education-hub' } });
      used.add(c.id);
    }
  }
  // Risk
  if (mistakes.has('Oversized position') || dd > 8) {
    const c = courseFor('Risk Management');
    if (c && !used.has(c.id)) {
      cands.push({ score: 90, source: 'Your journal and equity curve', item: { title: `Learn: ${c.title}`, sub: `Why: ${mistakes.has('Oversized position') ? 'you logged oversized positions' : `drawdown reached ${dd.toFixed(1)}% in 30 days`}. ${c.level} · +${c.pointsReward} pts`, badge: 'Learn', tab: 'education-hub' } });
      used.add(c.id);
    }
    cands.push({ score: 88, source: 'Your journal and equity curve', item: { title: 'Size your next trade with the Pip calculator', sub: 'Risk a fixed 1% instead of guessing the lot size', badge: 'Tool', tab: 'pip-calculator' } });
  }
  // Journal habit
  if (ctx.allowJournal && !JOURNAL_ENTRIES.some((e) => e.date === JOURNAL_TODAY)) {
    cands.push({ score: 70, source: 'Your journal', item: { title: 'Log today’s journal entry', sub: 'Why: nothing is logged for today yet. Two minutes while it is fresh', badge: 'Habit', tab: 'trading-journal' } });
  }
  // Next course at your level
  const next = COURSES.find((c) => !used.has(c.id) && levelIndex(c.level) === lvl) ?? COURSES.find((c) => !used.has(c.id));
  if (next) cands.push({ score: 50, source: 'Education Hub', item: { title: `Learn: ${next.title}`, sub: `Why: matches your ${ctx.level} level. ${next.lessons.length} lessons · +${next.pointsReward} pts`, badge: 'Learn', tab: 'education-hub' } });

  // Market: event that touches what you hold
  const NOW = Date.parse(CALENDAR_NOW);
  const held = ctx.allowTrades ? PORTFOLIO_TRADES.filter((t) => !isClosed(t)) : [];
  const heldCcy = new Set(held.flatMap((t) => instrumentBySymbol(t.symbol)?.ccy ?? []));
  const high = ECONOMIC_EVENTS.filter((e) => !e.allDay && Date.parse(e.at) > NOW && e.impact === 'High').sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const ev = high.find((e) => heldCcy.has(e.currency)) ?? high[0];
  if (ev) cands.push({ score: heldCcy.has(ev.currency) ? 75 : 55, source: 'Economic calendar', item: { title: `Prepare for ${ev.title}`, sub: `${ev.currency} · ${whenBkk(ev.at)}${heldCcy.has(ev.currency) ? ' · Why: it touches a position you hold' : ' · high impact'}`, badge: 'Market', tab: 'economic-calendar' } });

  // Signal
  const sig = [...ctx.signals].filter((s) => s.action !== 'UPGRADE').sort((a, b) => b.confidence - a.confidence)[0];
  if (sig) {
    const holds = held.some((t) => t.symbol === sig.ticker);
    cands.push({ score: 55, source: 'Trading signals', item: { title: `Watch: ${sig.ticker} ${sig.action}`, sub: `${sig.confidence}% confidence · ${sig.timeframe}${holds ? ' · you already hold it' : ''}`, badge: 'Signal', signal: sig.ticker } });
  }

  // Broker cashback gap
  const connectedBest = ctx.brokers.filter((b) => b.connected).sort((a, b) => b.cashbackPerLot - a.cashbackPerLot)[0];
  const better = ctx.brokers.filter((b) => !b.connected && (!connectedBest || b.cashbackPerLot > connectedBest.cashbackPerLot)).sort((a, b) => b.cashbackPerLot - a.cashbackPerLot)[0];
  if (better) cands.push({ score: 62, source: 'Broker directory', item: { title: `Compare ${better.name}`, sub: `Why: up to $${better.cashbackPerLot.toFixed(2)} per lot${connectedBest ? ` versus $${connectedBest.cashbackPerLot.toFixed(2)} on ${connectedBest.name}` : ''}`, badge: 'Broker', broker: better.id } });

  // Mission
  const mission = INITIAL_MISSIONS.find((m) => m.status === 'active' && m.tasks.some((t) => !t.completed));
  if (mission) {
    const left = mission.tasks.filter((t) => !t.completed).length;
    cands.push({ score: 45, source: 'Missions', item: { title: `Mission: ${mission.title}`, sub: `${left} task${left === 1 ? '' : 's'} left · +${mission.rewardPoints} pts · +${mission.rewardCredits} credits`, badge: 'Mission', tab: 'points-credits' } });
  }

  // Reading
  const article = NEWS_ARTICLES.find((n) => n.expertSummary) ?? NEWS_ARTICLES[0];
  if (article) cands.push({ score: 40, source: 'Market News', item: { title: `Read: ${article.headline}`, sub: `${article.source} · ${article.readTime}`, badge: 'Read', tab: 'news' } });

  const top = cands.sort((a, b) => b.score - a.score).slice(0, 6);
  const personalised = top.some((c) => /journal|equity|calendar/i.test(c.source) && c.score >= 70);
  return {
    msg: {
      id: mid(), role: 'ai', surface: 'next',
      heading: 'What to do next',
      paragraphs: [personalised ? `${top.length} things, ranked by what looks most useful for you right now. The first ones come from your own trades and journal.` : `${top.length} things, in the order I would do them.`],
      items: top.map((c) => c.item),
      sources: Array.from(new Set(top.map((c) => c.source))),
      note: !ctx.allowTrades || !ctx.allowJournal ? 'Some personal data is switched off, so these picks are more general. Turn it on for tailored ones.' : undefined,
      followUps: ['Learning path', 'Any habits I should watch?', 'Give me today’s briefing'],
    },
    mem: { surface: 'next' },
  };
}
