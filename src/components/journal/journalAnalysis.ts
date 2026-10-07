import { JournalEntry, JournalEmotion } from '../../types';

/**
 * Reads a trader's journal and writes a short, plain-language summary.
 * Rules only: every sentence comes from a number in the entries below, nothing is predicted.
 */

export interface Finding {
  title: string;
  text: string;
}

export interface FocusPlan {
  title: string;
  why: string;
  steps: string[];
}

export interface JournalAnalysis {
  /** How much the journal can support. 'none' means too few entries to say anything. */
  sample: 'none' | 'early' | 'fair' | 'solid';
  n: number;
  closed: number;
  open: number;
  netPnl: number;
  winRate: number;
  avgR: number;
  planRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  styleLabel: string;
  headline: string;
  overview: string;
  strengths: Finding[];
  improvements: Finding[];
  focus: FocusPlan | null;
  caveat: string;
}

const UNSETTLED: JournalEmotion[] = ['FOMO', 'Greedy', 'Frustrated', 'Anxious', 'Bored'];
const SETTLED: JournalEmotion[] = ['Calm', 'Confident'];

const STYLE: Record<string, string> = {
  Swing: 'swing trader',
  Scalping: 'scalper',
  Breakout: 'breakout trader',
  'Trend Pullback': 'trend follower',
  'Range Fade': 'range trader',
  'News Event': 'news trader',
  Position: 'position trader',
};

const HABIT: Record<string, string> = {
  'Moved stop loss': 'stop-moving habit',
  'Revenge trade': 'revenge-trading streak',
  'Oversized position': 'sizing problem',
  'Entered early': 'early-entry habit',
  'Ignored plan': 'habit of dropping the plan',
  'Chased price': 'habit of chasing price',
  'Exited too soon': 'habit of cutting winners short',
};

const emo = (e: string) => (e === 'FOMO' ? 'FOMO' : e.toLowerCase());
const money = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

interface Candidate {
  /** Rough money at stake. Used to rank. */
  weight: number;
  key: string;
  /** The entries this finding is about, so we do not list three findings that describe the same trades. */
  ids: Set<string>;
  finding: Finding;
  plan: FocusPlan;
}

export function analyzeJournal(entries: JournalEntry[], opts: { checklistSize: number; today: string }): JournalAnalysis {
  const n = entries.length;
  const closed = entries.filter((e) => e.outcome !== 'open');
  const open = n - closed.length;
  const decided = entries.filter((e) => e.outcome === 'win' || e.outcome === 'loss');
  const wins = decided.filter((e) => e.outcome === 'win');
  const losses = decided.filter((e) => e.outcome === 'loss');
  const rs = entries.map((e) => e.rMultiple).filter((r): r is number => r !== null);

  const netPnl = sum(closed.map((e) => e.pnl));
  const winRate = decided.length ? Math.round((wins.length / decided.length) * 100) : 0;
  const avgR = Math.round(avg(rs) * 10) / 10;
  const planRate = n ? Math.round((entries.filter((e) => e.followedPlan).length / n) * 100) : 0;
  const grossWin = sum(wins.map((e) => e.pnl));
  const grossLoss = Math.abs(sum(losses.map((e) => e.pnl)));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0;
  const avgWin = avg(wins.map((e) => e.pnl));
  const avgLoss = avg(losses.map((e) => e.pnl));

  const sample: JournalAnalysis['sample'] = n < 5 ? 'none' : n < 12 ? 'early' : n < 30 ? 'fair' : 'solid';
  const base = { n, closed: closed.length, open, netPnl, winRate, avgR, planRate, profitFactor, avgWin, avgLoss };
  if (sample === 'none') {
    return { ...base, sample, styleLabel: '', headline: 'Not enough trades to read yet', overview: `You have ${plural(n, 'entry', 'entries')} so far. A few more and MarketSyde can start reading your habits. Aim for at least 5.`, strengths: [], improvements: [], focus: null, caveat: '' };
  }

  // ───────── who you are as a trader ─────────
  const byStrategy = new Map<string, JournalEntry[]>();
  entries.forEach((e) => byStrategy.set(e.strategy, [...(byStrategy.get(e.strategy) ?? []), e]));
  const strategies = Array.from(byStrategy.entries()).map(([name, list]) => ({ name, list, pnl: sum(list.filter((e) => e.outcome !== 'open').map((e) => e.pnl)) })).sort((a, b) => b.list.length - a.list.length);
  const top = strategies[0];
  const topShare = top ? top.list.length / n : 0;
  const style = top && topShare >= 0.3 ? STYLE[top.name] ?? 'trader' : 'multi-style trader';

  const unsettled = entries.filter((e) => UNSETTLED.includes(e.emotionBefore));
  const settled = entries.filter((e) => SETTLED.includes(e.emotionBefore));
  const discipline = planRate >= 80 ? 'disciplined' : planRate >= 60 ? 'mostly disciplined' : 'still-building';

  // mistakes
  const mistakeMap = new Map<string, JournalEntry[]>();
  entries.forEach((e) => e.mistakes.forEach((m) => mistakeMap.set(m, [...(mistakeMap.get(m) ?? []), e])));
  const mistakes = Array.from(mistakeMap.entries()).map(([name, list]) => ({ name, list, pnl: sum(list.filter((e) => e.outcome !== 'open').map((e) => e.pnl)) })).sort((a, b) => b.list.length - a.list.length || a.pnl - b.pnl);
  const withMistakes = entries.filter((e) => e.mistakes.length > 0);
  const topMistake = mistakes[0];

  // a habit needs to repeat: at least twice, or a quarter of the journal
  const habit = topMistake && (topMistake.list.length >= 2 || topMistake.list.length / n >= 0.25) ? HABIT[topMistake.name] : undefined;
  const styleLabel = `A ${discipline} ${style}`;
  const headline = habit ? `${styleLabel}, with a ${habit}` : `${styleLabel}`;

  // ───────── the overview paragraph ─────────
  const sentences: string[] = [];
  const result = netPnl >= 0 ? `ahead ${money(netPnl)}` : `down ${money(Math.abs(netPnl))}`;
  sentences.push(
    `Across ${plural(closed.length, 'closed trade')}, you are ${result}, winning ${winRate}% of the trades that had a clear result, with an average of ${avgR >= 0 ? '+' : ''}${avgR}R per trade${open ? ` (${plural(open, 'trade')} still open and not counted in the money)` : ''}.`
  );
  if (isFinite(profitFactor) && decided.length >= 3) {
    sentences.push(profitFactor >= 1.5 ? `Winners have paid for losers comfortably: every $1 lost was matched by $${profitFactor.toFixed(2)} won.` : profitFactor >= 1 ? `Winners only just outweigh losers, at $${profitFactor.toFixed(2)} won for every $1 lost.` : `Losers have outweighed winners, at $${profitFactor.toFixed(2)} won for every $1 lost.`);
  }
  if (top && topShare >= 0.3) sentences.push(`Most of your trades are ${top.name.toLowerCase()} setups (${Math.round(topShare * 100)}%).`);
  else sentences.push(`Your trades are spread across ${strategies.length} different styles, so no single approach has enough history yet to judge.`);
  const planned = entries.filter((e) => e.followedPlan);
  const unplanned = entries.filter((e) => !e.followedPlan);
  if (planned.length && unplanned.length) {
    const pa = avg(planned.filter((e) => e.outcome !== 'open').map((e) => e.pnl));
    const ua = avg(unplanned.filter((e) => e.outcome !== 'open').map((e) => e.pnl));
    sentences.push(`You stuck to your plan on ${planRate}% of trades. On-plan trades averaged ${money(pa)}, off-plan ones ${money(ua)}.`);
  } else if (planned.length === n) sentences.push(`You stuck to your plan on every trade, which is rare.`);
  const overview = sentences.join(' ');

  // ───────── strengths ─────────
  const strengthPool: { score: number; f: Finding }[] = [];
  if (planned.length >= 2) {
    const pa = avg(planned.filter((e) => e.outcome !== 'open').map((e) => e.pnl));
    if (planRate >= 70 && pa > 0) strengthPool.push({ score: 90 + planRate / 10, f: { title: 'You follow your plan', text: `${planRate}% of your trades were on plan, and those averaged ${money(pa)} each.` } });
  }
  const settledClosed = settled.filter((e) => e.outcome !== 'open');
  if (settledClosed.length >= 2 && avg(settledClosed.map((e) => e.pnl)) > 0) {
    const top3 = settled.length >= 3 ? ` across ${settled.length} trades` : '';
    strengthPool.push({ score: 80, f: { title: 'You trade best when calm', text: `When you felt calm or confident going in, trades averaged ${money(avg(settledClosed.map((e) => e.pnl)))}${top3}.` } });
  }
  const goodStrategy = strategies.filter((s) => s.list.length >= 2 && s.pnl > 0).sort((a, b) => b.pnl - a.pnl)[0] ?? (sample !== 'early' ? undefined : strategies.filter((s) => s.pnl > 0).sort((a, b) => b.pnl - a.pnl)[0]);
  if (goodStrategy) strengthPool.push({ score: 70 + Math.min(20, goodStrategy.pnl / 50), f: { title: `${goodStrategy.name} is working`, text: `${plural(goodStrategy.list.length, 'trade')} netted ${money(goodStrategy.pnl)}. Keep it as your core setup while you test others.` } });
  if (decided.length >= 3 && avgWin > 0 && avgLoss < 0 && avgWin / Math.abs(avgLoss) >= 1.5) strengthPool.push({ score: 85, f: { title: 'Winners are bigger than losers', text: `Your average win is ${money(avgWin)} against an average loss of ${money(avgLoss)}, so you can be wrong often and still come out ahead.` } });
  const fullList = entries.filter((e) => e.checklistDone.length >= opts.checklistSize && e.outcome !== 'open');
  const partial = entries.filter((e) => e.checklistDone.length < opts.checklistSize && e.outcome !== 'open');
  if (fullList.length >= 2 && avg(fullList.map((e) => e.pnl)) > avg(partial.map((e) => e.pnl))) strengthPool.push({ score: 75, f: { title: 'The checklist pays off', text: `Trades where you ticked every checklist item averaged ${money(avg(fullList.map((e) => e.pnl)))}, against ${money(avg(partial.map((e) => e.pnl)))} for the rest.` } });
  const days = new Set(entries.map((e) => e.date));
  const last14 = Array.from(days).filter((d) => d >= shiftDay(opts.today, -13)).length;
  if (last14 >= 4) strengthPool.push({ score: 60, f: { title: 'You journal consistently', text: `You logged trades on ${last14} of the last 14 days. That record is what makes this summary possible.` } });
  if (netPnl > 0 && profitFactor > 1) strengthPool.push({ score: 50, f: { title: 'Net positive so far', text: `${money(netPnl)} across ${plural(closed.length, 'closed trade')}. A small sample, but a good start.` } });
  const strengths = strengthPool.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.f);

  // ───────── things to work on, ranked by money at stake ─────────
  const cands: Candidate[] = [];
  const unplannedClosed = unplanned.filter((e) => e.outcome !== 'open');
  if (unplanned.length >= 1) {
    const cost = Math.max(0, -sum(unplannedClosed.map((e) => e.pnl)), planned.length ? (avg(planned.filter((e) => e.outcome !== 'open').map((e) => e.pnl)) - avg(unplannedClosed.map((e) => e.pnl))) * unplannedClosed.length : 0);
    cands.push({
      weight: cost + unplanned.length * 5,
      key: 'plan',
      ids: new Set(unplanned.map((e) => e.id)),
      finding: { title: 'Leaving the plan', text: `${plural(unplanned.length, 'trade')} went off plan${unplannedClosed.length ? `, and ${unplannedClosed.length === unplanned.length ? (unplanned.length === 1 ? 'it' : 'they') : `the ${unplannedClosed.length} that closed`} ${unplannedClosed.length === 1 ? (unplannedClosed[0].pnl < 0 ? 'lost' : 'made') : 'averaged'} ${money(unplannedClosed.length === 1 ? Math.abs(unplannedClosed[0].pnl) : avg(unplannedClosed.map((e) => e.pnl)))}` : ''}.` },
      plan: { title: 'Stay on plan', why: `Off-plan trades are where the journal shows the most money leaking.`, steps: ['Write the entry, stop and target before you click buy or sell.', 'If a setup is not on your list, skip it. Another will come.', 'Mark every trade on plan or off plan the moment it closes.'] },
    });
  }
  const unsettledClosed = unsettled.filter((e) => e.outcome !== 'open');
  if (unsettled.length >= 2) {
    const worst = mostCommon(unsettled.map((e) => e.emotionBefore));
    cands.push({
      weight: Math.max(0, -sum(unsettledClosed.map((e) => e.pnl))) + unsettled.length * 4,
      key: 'emotion',
      ids: new Set(unsettled.map((e) => e.id)),
      finding: { title: 'Trading while unsettled', text: `${plural(unsettled.length, 'trade')} began with ${emo(worst)} or a similar feeling${unsettledClosed.length ? `, averaging ${money(avg(unsettledClosed.map((e) => e.pnl)))}` : ''}.` },
      plan: { title: 'Trade only when settled', why: 'The trades that started with a rushed or uneasy feeling were weaker than the rest.', steps: ['Write one line on how you feel before every entry.', `If it is ${emo(worst)}, wait 15 minutes or skip the trade.`, 'After a loss, cut your next position size in half.'] },
    });
  }
  if (topMistake) {
    const m = topMistake.name;
    cands.push({
      weight: Math.max(0, -topMistake.pnl) + topMistake.list.length * 6,
      key: `mistake:${m}`,
      ids: new Set(topMistake.list.map((e) => e.id)),
      finding: { title: `Watch for: ${m.toLowerCase()}`, text: `${plural(topMistake.list.length, 'trade')} carried this mistake${topMistake.list.some((e) => e.outcome !== 'open') ? ` and netted ${money(topMistake.pnl)}` : ''}.` },
      plan: MISTAKE_PLAN[m] ?? { title: `Fix: ${m.toLowerCase()}`, why: `It is the mistake you flagged most.`, steps: [`Add "${m}" to your pre-trade checklist.`, 'Look for it in every journal entry for the next two weeks.', 'Count how many trades it shows up in each week.'] },
    });
  }
  const lossBreach = losses.filter((e) => e.rMultiple !== null && e.rMultiple < -1.15);
  if (decided.length >= 3 && ((avgLoss < 0 && avgWin > 0 && avgWin / Math.abs(avgLoss) < 1) || lossBreach.length >= 1)) {
    const excess = sum(lossBreach.map((e) => Math.abs(e.pnl) * (1 - 1 / Math.abs(e.rMultiple as number))));
    cands.push({
      weight: excess + (avgWin / Math.max(1, Math.abs(avgLoss)) < 1 ? 30 : 0),
      key: 'losses',
      ids: new Set(losses.filter((e) => e.rMultiple !== null && (e.rMultiple < -1.15)).map((e) => e.id)),
      finding: { title: 'Losses run bigger than planned', text: lossBreach.length ? `${plural(lossBreach.length, 'loss', 'losses')} went past 1R. Your average loss is ${money(avgLoss)} against an average win of ${money(avgWin)}.` : `Your average loss (${money(avgLoss)}) is bigger than your average win (${money(avgWin)}).` },
      plan: { title: 'Cut losses where you planned', why: 'A few oversized losses are doing most of the damage.', steps: ['Set the stop when you enter, and do not widen it.', 'Size each trade so the stop costs the same amount every time.', 'Review every loss that went past 1R in your weekly review.'] },
    });
  }
  if (fullList.length + partial.length >= 4 && partial.length >= 2 && avg(fullList.map((e) => e.pnl)) > avg(partial.map((e) => e.pnl))) {
    cands.push({
      weight: (avg(fullList.map((e) => e.pnl)) - avg(partial.map((e) => e.pnl))) * partial.length * 0.5,
      key: 'checklist',
      ids: new Set(partial.map((e) => e.id)),
      finding: { title: 'Skipping the checklist', text: `${plural(partial.length, 'trade')} were taken without finishing the checklist.` },
      plan: { title: 'Finish the checklist first', why: 'Trades with a full checklist did better than the rest.', steps: ['Open the checklist before you place the order, not after.', 'No tick, no trade. If an item fails, wait.', 'Cut the list to what you really check, so it is quick.'] },
    });
  }
  const weakStrategy = strategies.filter((s) => s.list.length >= 2 && s.pnl < 0).sort((a, b) => a.pnl - b.pnl)[0];
  if (weakStrategy) cands.push({ weight: Math.abs(weakStrategy.pnl), key: 'strategy', ids: new Set(weakStrategy.list.map((e) => e.id)), finding: { title: `${weakStrategy.name} is costing you`, text: `${plural(weakStrategy.list.length, 'trade')} netted ${money(weakStrategy.pnl)}.` }, plan: { title: `Pause ${weakStrategy.name.toLowerCase()} for now`, why: 'It is your weakest setup in this journal.', steps: [`Skip ${weakStrategy.name.toLowerCase()} trades for the next two weeks.`, 'Review the losing entries for what they had in common.', 'Come back with a written rule that fixes it.'] } });
  const dayStats = [0, 1, 2, 3, 4, 5, 6].map((d) => ({ d, list: entries.filter((e) => e.outcome !== 'open' && new Date(`${e.date}T00:00:00Z`).getUTCDay() === d) })).filter((x) => x.list.length >= 2);
  const badDay = dayStats.map((x) => ({ ...x, pnl: sum(x.list.map((e) => e.pnl)) })).sort((a, b) => a.pnl - b.pnl)[0];
  if (badDay && badDay.pnl < 0) cands.push({ weight: Math.abs(badDay.pnl), key: 'day', ids: new Set(badDay.list.map((e) => e.id)), finding: { title: `${DAYS[badDay.d]} is your weak day`, text: `${plural(badDay.list.length, 'trade')} on ${DAYS[badDay.d]}s netted ${money(badDay.pnl)}.` }, plan: { title: `Go easy on ${DAYS[badDay.d]}s`, why: 'Your results on that day are well below the rest.', steps: [`Cut your size on ${DAYS[badDay.d]}s until the pattern changes.`, 'Check whether it is the market or your routine that day.', 'Set a trade limit for the day.'] } });

  // Pick greedily by money at stake, but discount a finding that is mostly about trades already covered.
  const ranked: Candidate[] = [];
  const covered = new Set<string>();
  const pool = [...cands].sort((a, b) => b.weight - a.weight);
  while (pool.length && ranked.length < 3) {
    let bestI = 0;
    let bestScore = -1;
    pool.forEach((c, i) => {
      const overlap = c.ids.size ? Array.from(c.ids).filter((id) => covered.has(id)).length / c.ids.size : 0;
      const score = c.weight * (1 - 0.75 * overlap);
      if (score > bestScore) {
        bestScore = score;
        bestI = i;
      }
    });
    const [pick] = pool.splice(bestI, 1);
    ranked.push(pick);
    pick.ids.forEach((id) => covered.add(id));
  }
  const improvements = ranked.map((c) => c.finding);
  if (improvements.length < 2 && last14 < 4) improvements.push({ title: 'Journal a little more often', text: `Only ${plural(last14, 'day')} in the last 14 have an entry. More entries make this summary sharper.` });
  const focus = ranked[0]?.plan ?? { title: 'Keep logging, and look for patterns', why: 'Nothing stands out as a problem yet.', steps: ['Log every trade, including the boring ones.', 'Tag your mistakes honestly.', 'Review the week every Friday.'] };

  const caveat =
    sample === 'early'
      ? `Early read: this is based on only ${n} entries, so treat it as a first look. It gets sharper with more.`
      : sample === 'fair'
      ? `Based on ${n} entries. A fair sample, but still worth checking against your own memory.`
      : `Based on ${n} entries.`;

  return { ...base, sample, styleLabel, headline, overview, strengths, improvements, focus, caveat };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function shiftDay(iso: string, delta: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function mostCommon(xs: string[]) {
  const m = new Map<string, number>();
  xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0][0];
}

const MISTAKE_PLAN: Record<string, FocusPlan> = {
  'Moved stop loss': { title: 'Set the stop once and leave it', why: 'Moving the stop is the mistake that shows up most in your journal.', steps: ['Place the stop before entry and write down its price.', 'You may tighten a stop in profit. Never widen it.', 'Add "stop untouched" to your checklist.'] },
  'Revenge trade': { title: 'Break the revenge loop', why: 'Revenge trades are the mistake you flag most often.', steps: ['After a loss, step away for 15 minutes before the next order.', 'Set a hard stop for the day after two losses in a row.', 'Write what you felt in the journal before the next trade.'] },
  'Oversized position': { title: 'Size every trade by the stop', why: 'Oversized positions are your most repeated mistake.', steps: ['Decide the risk in dollars first (for example 1% of the account).', 'Use the position calculator before every entry.', 'Never add to a loser.'] },
  'Entered early': { title: 'Wait for the trigger', why: 'Entering before your signal is the mistake you flag most.', steps: ['Write the exact trigger in the setup notes before you trade.', 'Set an alert at the trigger price and wait for it.', 'If you missed it, skip the trade.'] },
  'Ignored plan': { title: 'Make the plan hard to ignore', why: 'Dropping the plan is your most repeated mistake.', steps: ['Keep the written plan visible while you trade.', 'Take only setups from your playbook.', 'Review off-plan trades every Friday.'] },
  'Chased price': { title: 'Stop chasing', why: 'Chasing price is the mistake you flag most often.', steps: ['If price already moved, wait for a pullback or skip it.', 'Use limit orders at your planned level.', 'Count how many trades you skipped, as a win.'] },
  'Exited too soon': { title: 'Let planned targets work', why: 'Cutting winners short is your most repeated mistake.', steps: ['Place the take profit when you enter.', 'If you want out early, take partial profit and leave the rest.', 'Check after each trade whether price reached your target anyway.'] },
};
