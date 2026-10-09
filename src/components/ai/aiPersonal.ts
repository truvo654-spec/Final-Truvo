import { PortfolioTrade } from '../../types';
import { PORTFOLIO_TRADES, PORTFOLIO_NOW, DAY } from '../../data/portfolioData';
import { JOURNAL_ENTRIES, JOURNAL_TODAY, DEFAULT_CHECKLIST } from '../../data/journalData';
import { closedMs, groupPnl, isClosed, maxDrawdown, sliceSeries, totalSeries, tradeStats, tradesInRange } from '../portfolio/portfolioMath';
import { AiBars, AiContext, AiMessage, AiReply, AiStat, RangeDays } from './aiTypes';
import { avg, mid, money, pct, plural, tone } from './aiUtil';

/* ═════════════════════ Trading insights ═════════════════════ */

export type InsightFocus = 'strategy' | 'instrument' | 'session' | 'weekday' | 'direction' | 'broker' | 'open' | 'assetClass';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const sessionOf = (t: PortfolioTrade) => {
  const h = new Date(t.openedAt).getUTCHours();
  return h >= 7 && h < 13 ? 'London' : h >= 13 && h < 21 ? 'New York' : 'Asia';
};

const barsOf = (title: string, rows: ReturnType<typeof groupPnl>, take = 5): AiBars => ({
  title,
  rows: rows.slice(0, take).map((r) => ({ label: `${r.name} (${r.count})`, value: r.pnl, display: money(r.pnl) })),
});

export function detectFocus(q: string): InsightFocus | undefined {
  const t = q.toLowerCase();
  if (/open (positions?|trades?)|exposure|floating|unrealized|unrealised/.test(t)) return 'open';
  if (/strateg|setup/.test(t)) return 'strategy';
  if (/session|time of day|when do i|london|new york|asia|hour/.test(t)) return 'session';
  if (/day of (the )?week|weekday|which day|monday|tuesday|wednesday|thursday|friday/.test(t)) return 'weekday';
  if (/long vs short|buy vs sell|direction|longs?\b|shorts?\b/.test(t)) return 'direction';
  if (/broker|account/.test(t)) return 'broker';
  if (/asset class|forex vs|crypto vs/.test(t)) return 'assetClass';
  if (/pair|instrument|symbol|asset|which (market|one)/.test(t)) return 'instrument';
  return undefined;
}

export function tradingInsights(ctx: AiContext, opts: { days?: RangeDays; focus?: InsightFocus; symbol?: string } = {}): AiReply {
  const days = opts.days ?? ctx.range;
  const symbol = opts.symbol;
  const keep = (t: PortfolioTrade) => !symbol || t.symbol === symbol;
  const w = tradesInRange(PORTFOLIO_TRADES, days).filter(keep);
  const closed = w.filter(isClosed);
  const s = tradeStats(w);
  const prior = PORTFOLIO_TRADES.filter((t) => keep(t) && isClosed(t) && closedMs(t) >= PORTFOLIO_NOW - 2 * days * DAY && closedMs(t) < PORTFOLIO_NOW - days * DAY);
  const ps = tradeStats(prior);
  const open = PORTFOLIO_TRADES.filter((t) => !isClosed(t) && keep(t));
  const label = `last ${days} days`;
  const mem = { surface: 'insights' as const, range: days, symbol };

  if (!closed.length && opts.focus !== 'open') {
    return {
      msg: {
        id: mid(), role: 'ai', surface: 'insights',
        heading: `No closed trades (${symbol ? `${symbol}, ` : ''}${label})`,
        paragraphs: [`I do not see any closed${symbol ? ` ${symbol}` : ''} trades in that window${open.length ? `, only ${plural(open.length, 'open position')}` : ''}. Try a longer range.`],
        followUps: ['Show my last 90 days', 'Any habits I should watch?'],
      },
      mem,
    };
  }

  const series = sliceSeries(totalSeries([]), days, 120);
  const dd = maxDrawdown(series);
  const stats: AiStat[] = [
    { label: 'Closed trades', value: String(s.closed) },
    { label: 'Win rate', value: pct(s.winRate), tone: s.winRate >= 50 ? 'good' : s.winRate < 40 ? 'bad' : 'neutral' },
    { label: 'Profit factor', value: s.profitFactor >= 99 ? 'n/a' : s.profitFactor.toFixed(2), tone: s.profitFactor >= 1.3 ? 'good' : s.profitFactor < 1 ? 'bad' : 'neutral' },
    { label: 'Net P/L', value: money(s.realized), tone: tone(s.realized) },
    { label: 'Average R', value: `${s.avgR >= 0 ? '+' : ''}${s.avgR.toFixed(2)}R`, tone: tone(s.avgR) },
    ...(symbol ? [] : [{ label: 'Max drawdown', value: pct(dd, 1), tone: (dd > 8 ? 'bad' : dd < 4 ? 'good' : 'neutral') as 'good' | 'bad' | 'neutral' }]),
  ];

  const byClass = groupPnl(w, (t) => t.assetClass);
  const byStrat = groupPnl(w, (t) => t.strategyTag || 'Untagged');
  const byInst = groupPnl(w, (t) => t.symbol);
  const byDir = groupPnl(w, (t) => (t.direction === 'BUY' ? 'Long' : 'Short'));
  const bySession = groupPnl(w, sessionOf);
  const byDay = groupPnl(w, (t) => WEEKDAY[new Date(t.closedAt ?? t.openedAt).getUTCDay()]);
  const byBroker = groupPnl(w, (t) => t.broker);

  const bars: AiBars[] = [];
  const focus = opts.focus;
  if (focus === 'strategy') bars.push(barsOf('P/L by strategy', byStrat));
  else if (focus === 'instrument') bars.push(barsOf('P/L by instrument', byInst, 6));
  else if (focus === 'session') bars.push(barsOf('P/L by session you opened in', bySession));
  else if (focus === 'weekday') bars.push(barsOf('P/L by weekday of close', byDay, 7));
  else if (focus === 'direction') bars.push(barsOf('P/L long vs short', byDir));
  else if (focus === 'broker') bars.push(barsOf('P/L by broker account', byBroker));
  else if (focus === 'assetClass') bars.push(barsOf('P/L by asset class', byClass));
  else if (focus !== 'open') {
    if (!symbol) bars.push(barsOf('P/L by asset class', byClass));
    if (byStrat.length > 1 || !symbol) bars.push(barsOf('P/L by strategy', byStrat));
  }

  const primary = focus === 'strategy' ? byStrat : focus === 'instrument' ? byInst : focus === 'session' ? bySession : focus === 'weekday' ? byDay : focus === 'direction' ? byDir : focus === 'broker' ? byBroker : byClass;
  const dim = focus === 'strategy' ? 'strategy' : focus === 'instrument' ? 'instrument' : focus === 'session' ? 'session' : focus === 'weekday' ? 'weekday' : focus === 'direction' ? 'direction' : focus === 'broker' ? 'broker' : 'asset class';
  const dimPlural = dim === 'strategy' ? 'strategies' : dim === 'asset class' ? 'asset classes' : `${dim}s`;

  const paragraphs: string[] = [];
  const dWin = s.winRate - ps.winRate;
  const dNet = s.realized - ps.realized;
  paragraphs.push(
    `${symbol ? `On ${symbol}, over` : 'Over'} the ${label} you closed ${plural(s.closed, 'trade')} with a ${pct(s.winRate)} win rate and ${s.profitFactor >= 99 ? 'no losing trades' : `a profit factor of ${s.profitFactor.toFixed(2)}`}. Net ${money(s.realized)}.` +
      (ps.closed >= 3 ? ` Versus the previous ${days} days that is ${dWin >= 0 ? 'up' : 'down'} ${Math.abs(dWin).toFixed(0)} points on win rate and ${money(dNet)} on net.` : ''),
  );
  if (focus !== 'open') {
    const best = primary[0];
    const worst = primary[primary.length - 1];
    if (best) paragraphs.push(`Best ${dim}: ${best.name} (${money(best.pnl)} over ${plural(best.count, 'trade')}, ${pct((best.wins / best.count) * 100)} wins).${primary.length > 1 && worst.pnl < 0 ? ` Weakest: ${worst.name} (${money(worst.pnl)} over ${plural(worst.count, 'trade')}).` : ''}`);
  }
  if (focus !== 'open' && s.best && s.best.pnl > 0) {
    const bits = [`Biggest win ${s.best.symbol} ${money(s.best.pnl)}`];
    if (s.worst && s.worst.pnl < 0) bits.push(`biggest loss ${s.worst.symbol} ${money(s.worst.pnl)}`);
    paragraphs.push(`${bits.join(', ')}.${s.losses ? ` Average win ${money(s.avgWin)} against average loss ${money(-s.avgLoss)}.` : ''}`);
  }
  if (s.streak.n >= 2) paragraphs.push(`Current streak: ${s.streak.n} ${s.streak.type}s in a row.`);
  if (open.length) {
    const float = open.reduce((a, t) => a + t.pnl, 0);
    const bySym = new Map<string, number>();
    open.forEach((t) => bySym.set(t.symbol, (bySym.get(t.symbol) ?? 0) + t.size));
    const biggest = Array.from(bySym.entries()).sort((a, b) => b[1] - a[1])[0];
    paragraphs.push(`${plural(open.length, 'position')} open, floating ${money(float)}. Largest by size: ${biggest[0]} (${biggest[1]} lots).${open.some((t) => t.riskTag === 'high-risk') ? ' At least one is tagged high-risk, so check its stop.' : ''}`);
  } else if (focus === 'open') {
    paragraphs.push('You have no open positions right now.');
  }

  // One data-driven experiment, always hedged.
  const weakStrat = byStrat[byStrat.length - 1];
  let test = 'Review your largest loss and check whether it followed your plan before changing anything else.';
  if (weakStrat && weakStrat.pnl < 0 && weakStrat.count >= 2) test = `Halve your size on “${weakStrat.name}” for a week and see whether the result improves.`;
  else if (s.winRate < 45 && s.avgR < 1) test = 'Wait for one more confirmation before entry, or move your target so average win is at least 1.5 times average loss.';
  else if (dd > 8) test = 'Cut risk per trade to 0.5% until drawdown is back under 5%.';
  paragraphs.push(`One thing to test: ${test}`);

  const msg: AiMessage = {
    id: mid(), role: 'ai', surface: 'insights',
    heading: focus === 'open' ? 'Your open positions' : focus ? `Your ${dimPlural}, ${label}` : symbol ? `Your ${symbol} trades, ${label}` : `What your ${label} say`,
    paragraphs,
    stats,
    bars,
    items: [{ title: 'Open the Portfolio Tracker', sub: 'Analytics, heatmap and drill-down', tab: 'portfolio-tracker' }],
    sources: [`Your trades (${days} days)`, 'Your equity curve'],
    note: s.closed < 10 ? `Only ${s.closed} closed trades in this window, so treat this as a hint rather than a finding.` : 'Patterns in a small sample can be noise. Use this as a prompt to look closer.',
    followUps: [
      days !== 7 ? 'Show my last 7 days' : 'Show my last 30 days',
      days !== 90 ? 'Show my last 90 days' : 'Show my last 30 days',
      focus !== 'strategy' ? 'Which strategy works best for me?' : 'Which session do I trade best?',
      focus !== 'open' ? 'What are my open positions doing?' : 'Which pair do I trade best?',
    ],
  };
  return { msg, mem };
}

/* ═════════════════════ Behavioral observation ═════════════════════ */

export type BehaviorFocus = 'emotion' | 'mistakes' | 'afterloss' | 'plan' | 'checklist' | 'overall';

export function detectBehaviorFocus(q: string): BehaviorFocus {
  const t = q.toLowerCase();
  if (/after (a )?loss|losing streak|revenge|tilt|bounce back/.test(t)) return 'afterloss';
  if (/emotion|mood|feel|fomo|greed|fear|anxi|frustrat/.test(t)) return 'emotion';
  if (/mistake|error|wrong/.test(t)) return 'mistakes';
  if (/checklist/.test(t)) return 'checklist';
  if (/plan|disciplin|rules?/.test(t)) return 'plan';
  return 'overall';
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

export function behaviorObservation(ctx: AiContext, focus: BehaviorFocus = 'overall'): AiReply {
  const all = [...JOURNAL_ENTRIES].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const inRange = all.filter((e) => daysBetween(e.date, JOURNAL_TODAY) <= ctx.range);
  const e = inRange.length >= 4 ? inRange : all;
  const usedAll = e === all && inRange.length < 4;
  const total = e.length;
  const mem = { surface: 'behavior' as const };
  if (!total) {
    return { msg: { id: mid(), role: 'ai', surface: 'behavior', heading: 'Your journal is empty', paragraphs: ['Log a few trades with your mood and whether you followed the plan, and I can start spotting patterns.'], items: [{ title: 'Open the journal', tab: 'trading-journal' }], followUps: ['What should I do next?'] }, mem };
  }

  const on = e.filter((x) => x.followedPlan);
  const off = e.filter((x) => !x.followedPlan);
  const planRate = on.length / total;
  const chkRate = avg(e.map((x) => Math.min(1, x.checklistDone.length / DEFAULT_CHECKLIST.length)));
  const mistakeRate = e.filter((x) => x.mistakes.length).length / total;
  const score = Math.round(100 * (0.45 * planRate + 0.3 * chkRate + 0.25 * (1 - mistakeRate)));

  const emo = new Map<string, number[]>();
  e.forEach((x) => emo.set(x.emotionBefore, [...(emo.get(x.emotionBefore) ?? []), x.pnl]));
  const emoAll = Array.from(emo.entries()).map(([k, v]) => ({ label: `${k} (${v.length})`, name: k, n: v.length, value: avg(v), display: `${money(avg(v))} avg` })).sort((a, b) => a.value - b.value);
  const emoSolid = emoAll.filter((r) => r.n >= 2);
  const emoRows = emoSolid.length >= 2 ? emoSolid : emoAll;

  const mis = new Map<string, number[]>();
  e.forEach((x) => x.mistakes.forEach((m) => mis.set(m, [...(mis.get(m) ?? []), x.pnl])));
  const misRows = Array.from(mis.entries()).map(([k, v]) => ({ label: `${k} (${v.length}×)`, name: k, n: v.length, value: v.reduce((a, b) => a + b, 0), display: money(v.reduce((a, b) => a + b, 0)) })).sort((a, b) => a.value - b.value);

  // What happens after a loss
  const afterLoss = e.filter((x, i) => i > 0 && e[i - 1].pnl < 0);
  const afterWin = e.filter((x, i) => i > 0 && e[i - 1].pnl > 0);
  const escalated = e.filter((x, i) => i > 0 && e[i - 1].pnl < 0 && x.size > e[i - 1].size * 1.25);
  const alPlan = afterLoss.length ? afterLoss.filter((x) => x.followedPlan).length / afterLoss.length : null;

  const fullChk = e.filter((x) => x.checklistDone.length >= DEFAULT_CHECKLIST.length - 1);
  const partChk = e.filter((x) => x.checklistDone.length < DEFAULT_CHECKLIST.length - 1);
  const hiRate = e.filter((x) => x.rating >= 4);
  const loRate = e.filter((x) => x.rating <= 2);

  // Cross-check with the real portfolio (only when trades are allowed)
  let reentry: { n: number; pnl: number } | null = null;
  if (ctx.allowTrades) {
    const trades = [...PORTFOLIO_TRADES].sort((a, b) => Date.parse(a.openedAt) - Date.parse(b.openedAt));
    const hits = new Set<string>();
    trades.filter((t) => isClosed(t) && t.outcome === 'loss').forEach((l) => {
      const next = trades.find((t) => t.id !== l.id && Date.parse(t.openedAt) > closedMs(l) && Date.parse(t.openedAt) - closedMs(l) <= 2 * 3600000 && t.size >= l.size * 1.2);
      if (next) hits.add(next.id);
    });
    const list = trades.filter((t) => hits.has(t.id) && isClosed(t));
    if (list.length) reentry = { n: list.length, pnl: list.reduce((a, t) => a + t.pnl, 0) };
  }

  const stats: AiStat[] = [
    { label: 'Discipline score', value: `${score}/100`, tone: score >= 75 ? 'good' : score < 50 ? 'bad' : 'neutral' },
    { label: 'Followed the plan', value: pct(planRate * 100), tone: planRate >= 0.75 ? 'good' : planRate < 0.5 ? 'bad' : 'neutral' },
    { label: 'Checklist completed', value: pct(chkRate * 100), tone: chkRate >= 0.8 ? 'good' : chkRate < 0.5 ? 'bad' : 'neutral' },
    { label: 'Entries with a mistake', value: pct(mistakeRate * 100), tone: mistakeRate > 0.4 ? 'bad' : mistakeRate < 0.2 ? 'good' : 'neutral' },
  ];

  const paragraphs: string[] = [];
  const bars: AiBars[] = [];
  const planLine = `When you followed your plan (${on.length} entries) you averaged ${money(avg(on.map((x) => x.pnl)))} a trade. Off-plan (${off.length}) it was ${money(avg(off.map((x) => x.pnl)))}.`;
  const emoLine = emoRows[0] ? `Your weakest starting mood is “${emoRows[0].name}”: ${money(emoRows[0].value)} on average over ${plural(emoRows[0].n, 'trade')}.${emoRows.length > 1 ? ` Your best is “${emoRows[emoRows.length - 1].name}” at ${money(emoRows[emoRows.length - 1].value)}.` : ''}` : '';
  const misLine = misRows[0] ? `Costliest mistake: ${misRows[0].name} (${misRows[0].n}×, ${money(misRows[0].value)} in total).` : 'No mistakes were logged in this period.';
  const alLine = afterLoss.length
    ? `After a losing trade you followed the plan ${pct((alPlan ?? 0) * 100)} of the time${afterWin.length ? ` versus ${pct((afterWin.filter((x) => x.followedPlan).length / afterWin.length) * 100)} after a win` : ''}, and averaged ${money(avg(afterLoss.map((x) => x.pnl)))} on the next trade.${escalated.length ? ` You increased size on ${plural(escalated.length, 'next trade')} after a loss.` : ''}`
    : 'I do not see enough back-to-back trades to read what you do after a loss.';

  if (focus === 'overall') {
    paragraphs.push(planLine, emoLine, misLine, alLine);
    if (emoRows.length) bars.push({ title: 'Average P/L by mood before the trade', rows: emoRows });
    if (misRows.length) bars.push({ title: 'Cost of each mistake', rows: misRows.slice(0, 4) });
  } else if (focus === 'emotion') {
    paragraphs.push(emoLine, `You also rated your own execution 4 or 5 stars on ${hiRate.length} entries, which averaged ${money(avg(hiRate.map((x) => x.pnl)))}${loRate.length ? `, against ${money(avg(loRate.map((x) => x.pnl)))} on the ${loRate.length} you rated 2 or lower` : ''}.`);
    bars.push({ title: 'Average P/L by mood before the trade', rows: emoRows });
  } else if (focus === 'mistakes') {
    paragraphs.push(misLine, misRows[1] ? `Next: ${misRows[1].name} (${misRows[1].n}×, ${money(misRows[1].value)}).` : '');
    if (misRows.length) bars.push({ title: 'Cost of each mistake', rows: misRows.slice(0, 6) });
  } else if (focus === 'afterloss') {
    paragraphs.push(alLine);
    if (reentry) paragraphs.push(`In your portfolio, ${plural(reentry.n, 'trade')} reopened within 2 hours of a loss at a larger size and finished ${money(reentry.pnl)} combined. That is the classic revenge pattern.`);
  } else if (focus === 'plan') {
    paragraphs.push(planLine, `Plan adherence is ${pct(planRate * 100)} across ${plural(total, 'entry')}.`);
  } else if (focus === 'checklist') {
    paragraphs.push(`Entries with nearly the whole checklist done (${fullChk.length}) averaged ${money(avg(fullChk.map((x) => x.pnl)))}. With a lot skipped (${partChk.length}) they averaged ${money(avg(partChk.map((x) => x.pnl)))}.`);
  }
  if (focus === 'overall' && reentry) paragraphs.push(`Portfolio cross-check: ${plural(reentry.n, 'trade')} reopened within 2 hours of a loss at a bigger size, combined ${money(reentry.pnl)}.`);

  // Suggest one concrete rule
  let rule = 'Write the journal entry before you place the next trade, so the plan is in front of you.';
  if (alPlan !== null && afterLoss.length >= 2 && alPlan < planRate - 0.15) rule = 'After any loss, wait 30 minutes and re-read your checklist before the next entry.';
  else if (escalated.length >= 1) rule = 'Cap size after a loss: the next trade may not be larger than the one that just lost.';
  else if (misRows[0] && misRows[0].value < 0) rule = /stop/i.test(misRows[0].name) ? 'Set your stop once, at entry, and only ever move it to reduce risk.' : `Add a checklist line that guards against “${misRows[0].name.toLowerCase()}” and read it before each trade.`;
  else if (emoRows[0] && emoRows[0].value < 0 && emoRows[0].n >= 2) rule = `When you notice you feel ${emoRows[0].name.toLowerCase()}, halve your size or skip the setup.`;
  paragraphs.push(`A rule you could test this week: ${rule}`);

  const wroteToday = e.some((x) => x.date === JOURNAL_TODAY);
  const msg: AiMessage = {
    id: mid(), role: 'ai', surface: 'behavior',
    heading: focus === 'overall' ? 'A habit worth catching early' : focus === 'afterloss' ? 'What you do after a loss' : focus === 'emotion' ? 'How your mood shows up in results' : focus === 'mistakes' ? 'Your repeated mistakes' : focus === 'plan' ? 'How closely you follow your plan' : 'What the checklist does for you',
    paragraphs: paragraphs.filter(Boolean),
    stats: focus === 'overall' || focus === 'plan' ? stats : undefined,
    bars,
    items: [{ title: wroteToday ? 'Review today’s journal entry' : 'Write today’s journal entry', sub: wroteToday ? 'See what you noted' : 'Two minutes, while it is fresh', tab: 'trading-journal' }],
    sources: ['Your trading journal', ...(reentry || (ctx.allowTrades && focus === 'afterloss') ? ['Your trades'] : [])],
    note: `${usedAll ? 'The window was too short to read, so I used all your entries. ' : ''}This is an observation about your own notes, not a diagnosis. You know your trading best.`,
    followUps: [
      focus !== 'afterloss' ? 'What do I do after a loss?' : 'How does my mood affect results?',
      focus !== 'mistakes' ? 'Which mistakes cost me most?' : 'How closely do I follow my plan?',
      focus !== 'emotion' ? 'How does my mood affect results?' : 'Does the checklist help me?',
      'What should I do next?',
    ],
  };
  return { msg, mem };
}
