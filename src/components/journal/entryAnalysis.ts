import { JournalChecklistItem, JournalEmotion, JournalEntry } from '../../types';
import { FocusPlan, Finding, MISTAKE_PLAN } from './journalAnalysis';

/**
 * Reads one journal entry (next to the rest of the journal) and says what happened, what went well,
 * what to fix and what to do next. Rules over the entry's own numbers, nothing predicted.
 */

export interface EntryChip {
  label: string;
  value: string;
  tone: 'lime' | 'pink' | 'white';
}

export interface EntryAnalysis {
  kind: 'clean-win' | 'rough-win' | 'process-loss' | 'sloppy-loss' | 'flat' | 'open';
  headline: string;
  overview: string;
  wentWell: Finding[];
  improve: Finding[];
  focus: FocusPlan;
  chips: EntryChip[];
  caveat: string;
}

const UNSETTLED: JournalEmotion[] = ['FOMO', 'Greedy', 'Frustrated', 'Anxious', 'Bored'];
const SETTLED: JournalEmotion[] = ['Calm', 'Confident'];
const emo = (e: string) => (e === 'FOMO' ? 'FOMO' : e.toLowerCase());
/** The feeling as a noun, for a sentence like 'began with frustration'. */
const EMO_NOUN: Record<string, string> = { FOMO: 'FOMO', Greedy: 'greed', Frustrated: 'frustration', Anxious: 'anxiety', Bored: 'boredom', Calm: 'calm', Confident: 'confidence' };
const money = (v: number) => `${v < 0 ? '-' : v > 0 ? '+' : ''}$${Math.abs(Math.round(v)).toLocaleString()}`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const rFmt = (r: number) => `${r > 0 ? '+' : ''}${(Math.round(r * 10) / 10).toFixed(1)}R`;
const price = (v: number | null) => (v === null ? '' : v >= 100 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v));

const MISTAKE_TIP: Record<string, string> = {
  'Moved stop loss': 'You moved your stop. Set it once before entry and leave it.',
  'Revenge trade': 'This was taken to win back a loss. Step away for 15 minutes after a loss.',
  'Oversized position': 'The size was bigger than your rule. Size from the stop, not from the feeling.',
  'Entered early': 'You entered before the trigger. Write the exact trigger and wait for it.',
  'Ignored plan': 'You dropped your plan. Keep it in view while you trade.',
  'Chased price': 'You chased a move that had already gone. Wait for a pullback or skip it.',
  'Exited too soon': 'You closed before your target. Take partial profit and leave the rest.',
};

const firstSentence = (t: string) => {
  const s = t.trim().split(/(?<=[.!?])\s/)[0] ?? '';
  return s.length > 120 ? `${s.slice(0, 117).trim()}…` : s;
};

export function analyzeEntry(entry: JournalEntry, all: JournalEntry[], checklist: JournalChecklistItem[]): EntryAnalysis {
  const others = all.filter((e) => e.id !== entry.id);
  const rOthers = others.map((e) => e.rMultiple).filter((r): r is number => r !== null);
  const sameStyle = others.filter((e) => e.strategy === entry.strategy && e.outcome !== 'open');
  const total = checklist.length;
  const doneCount = Math.min(entry.checklistDone.length, total);
  const doneIds = new Set(entry.checklistDone);
  const missing = checklist.filter((c) => !doneIds.has(c.id));
  const fullChecklist = total > 0 && doneCount >= total;
  const before = entry.emotionBefore;
  const unsettled = UNSETTLED.includes(before);
  const settled = SETTLED.includes(before);
  const r = entry.rMultiple;
  const win = entry.outcome === 'win';
  const loss = entry.outcome === 'loss';
  const open = entry.outcome === 'open';
  const style = `${entry.strategy.toLowerCase()} trade`;
  const mistakes = entry.mistakes;
  const tags = entry.tags;

  const clean = entry.followedPlan && fullChecklist && mistakes.length === 0 && !unsettled;
  let kind: EntryAnalysis['kind'];
  let headline: string;
  if (open) {
    kind = 'open';
    headline = `A ${style} still in play`;
  } else if (win) {
    kind = clean ? 'clean-win' : 'rough-win';
    headline = clean ? `A clean, on-plan ${style}` : entry.followedPlan && mistakes.length === 0 ? `A solid ${entry.strategy.toLowerCase()} win` : 'A winner that bent the rules';
  } else if (loss) {
    if (entry.followedPlan && mistakes.length === 0 && !unsettled) {
      kind = 'process-loss';
      headline = 'A loss that followed the plan';
    } else {
      kind = 'sloppy-loss';
      headline = unsettled ? `A loss that began with ${EMO_NOUN[before] ?? emo(before)}` : !entry.followedPlan ? 'A loss that left the plan' : 'A loss with a mistake to fix';
    }
  } else {
    kind = 'flat';
    headline = `A flat ${style}, closed near entry`;
  }

  // ───────── overview ─────────
  const sentences: string[] = [];
  const dir = entry.direction === 'BUY' ? 'Bought' : 'Sold';
  if (open) sentences.push(`${dir} ${entry.symbol} at ${price(entry.entryPrice)} and the trade is still open, so there is no result yet.`);
  else sentences.push(`${dir} ${entry.symbol} at ${price(entry.entryPrice)} and closed at ${price(entry.exitPrice)}${entry.size ? ` on ${entry.size} ${entry.assetClass === 'Forex' ? 'lots' : 'units'}` : ''}, for ${money(entry.pnl)}${r !== null ? ` (${rFmt(r)})` : ''}.`);
  sentences.push(
    entry.followedPlan
      ? `You followed your plan${total ? ` and ticked ${doneCount} of ${total} checklist items` : ''}.`
      : `You went off plan${total ? ` and finished ${doneCount} of ${total} checklist items` : ''}.`
  );
  sentences.push(before === entry.emotionAfter ? `You felt ${emo(before)} before and after.` : `You went in feeling ${emo(before)} and came out ${emo(entry.emotionAfter)}.`);
  if (entry.setupNotes.trim()) sentences.push(`Your note on the setup: “${firstSentence(entry.setupNotes)}”`);
  if (!open && r !== null && rOthers.length >= 3) {
    const a = Math.round(avg(rOthers) * 10) / 10;
    const best = r >= Math.max(...rOthers);
    const worst = r <= Math.min(...rOthers);
    sentences.push(best ? `That is the best R in your journal, against an average of ${rFmt(a)}.` : worst ? `That is the lowest R in your journal, against an average of ${rFmt(a)}.` : `Your journal averages ${rFmt(a)} a trade, so this one was ${r >= a ? 'above' : 'below'} par.`);
  } else if (!open && sameStyle.length >= 2) sentences.push(`Your other ${entry.strategy.toLowerCase()} trades averaged ${money(avg(sameStyle.map((e) => e.pnl)))}.`);
  const overview = sentences.slice(0, 5).join(' ');

  // ───────── what went well ─────────
  const good: { score: number; f: Finding }[] = [];
  if (entry.followedPlan) good.push({ score: 90, f: { title: 'You stayed on plan', text: win ? 'The result came from the plan you wrote, not from luck or a change of mind.' : 'The loss happened inside your plan, so the process held even though the trade did not pay.' } });
  if (fullChecklist) good.push({ score: 85, f: { title: 'Checklist complete', text: `All ${total} checks were ticked before you traded.` } });
  else if (total && doneCount / total >= 0.8) good.push({ score: 55, f: { title: 'Checklist mostly done', text: `${doneCount} of ${total} checks were ticked.` } });
  if (r !== null && r >= 2 && win) good.push({ score: 88, f: { title: 'Strong reward for the risk', text: `${rFmt(r)} means the win was ${(Math.round(r * 10) / 10).toFixed(1)} times the money you risked.` } });
  if (loss && r !== null && r >= -1.15) good.push({ score: 80, f: { title: 'The loss stayed small', text: `It closed at ${rFmt(r)}, about the 1R you planned to risk.` } });
  if (settled) good.push({ score: 75, f: { title: `You went in ${emo(before)}`, text: 'A steady head going in is where your best decisions usually start.' } });
  if (tags.includes('Patient entry')) good.push({ score: 72, f: { title: 'Patient entry', text: 'You waited for the level instead of chasing the first move.' } });
  if (tags.includes('A+ setup')) good.push({ score: 66, f: { title: 'An A+ setup', text: 'You rated this one as a top-quality setup, and the journal can now show whether that rating holds up.' } });
  if (tags.includes('Partial profit')) good.push({ score: 58, f: { title: 'You took partial profit', text: 'Locking in part of the move reduces how much a reversal can take back.' } });
  if (unsettled && SETTLED.includes(entry.emotionAfter)) good.push({ score: 60, f: { title: 'You regained your composure', text: `You went in ${emo(before)} and came out ${emo(entry.emotionAfter)}.` } });
  if (entry.lessons.trim()) good.push({ score: 50, f: { title: 'You wrote the lesson down', text: `“${firstSentence(entry.lessons)}”` } });
  const wentWell = good.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.f);
  if (!wentWell.length) wentWell.push({ title: 'You logged it', text: 'Writing the trade down is what lets patterns show up later.' });

  // ───────── what to improve ─────────
  const bad: { score: number; f: Finding; plan: FocusPlan }[] = [];
  mistakes.forEach((m, i) =>
    bad.push({
      score: 100 - i,
      f: { title: m, text: MISTAKE_TIP[m] ?? `You flagged “${m}” on this trade. Look for it in your next three entries.` },
      plan: MISTAKE_PLAN[m] ?? { title: `Fix: ${m.toLowerCase()}`, why: 'You flagged it on this trade.', steps: [`Add "${m}" to your pre-trade checklist.`, 'Look for it in every entry for the next two weeks.', 'Count how often it shows up each week.'] },
    })
  );
  if (!entry.followedPlan)
    bad.push({
      score: 95,
      f: { title: 'You left the plan', text: loss ? 'The loss came from a trade that was not in your plan.' : 'It paid this time, but trades outside the plan do not repeat reliably.' },
      plan: { title: 'Stay on plan', why: 'This trade was outside the plan.', steps: ['Write the entry, stop and target before you click buy or sell.', 'If a setup is not on your list, skip it.', 'Mark the trade on plan or off plan as soon as it closes.'] },
    });
  if (loss && r !== null && r < -1.15)
    bad.push({
      score: 90,
      f: { title: 'The loss ran past 1R', text: `It closed at ${rFmt(r)}, bigger than the 1R you planned. Honour the stop.` },
      plan: { title: 'Cut losses where you planned', why: 'The loss was bigger than planned.', steps: ['Set the stop when you enter, and do not widen it.', 'Size the trade so the stop costs the same amount every time.', 'Review any loss past 1R in your weekly review.'] },
    });
  if (missing.length && total)
    bad.push({
      score: 80,
      f: { title: `${missing.length} checklist ${missing.length === 1 ? 'item' : 'items'} skipped`, text: `Not ticked: ${missing.slice(0, 2).map((c) => c.label.toLowerCase()).join('; ')}${missing.length > 2 ? '; and more' : ''}.` },
      plan: { title: 'Finish the checklist first', why: 'Some checks were skipped on this trade.', steps: ['Open the checklist before you place the order, not after.', 'No tick, no trade. If an item fails, wait.', 'Cut the list to what you really check, so it is quick.'] },
    });
  if (unsettled)
    bad.push({
      score: 70,
      f: { title: `You went in feeling ${emo(before)}`, text: 'That feeling often pushes entries early. Wait 15 minutes or skip when you notice it.' },
      plan: { title: 'Trade only when settled', why: 'This trade started with a rushed or uneasy feeling.', steps: ['Write one line on how you feel before every entry.', `If it is ${emo(before)}, wait 15 minutes or skip the trade.`, 'After a loss, cut your next position size in half.'] },
    });
  if (win && r !== null && r < 1 && r > 0)
    bad.push({ score: 45, f: { title: 'Small reward for the risk', text: `${rFmt(r)} is less than the 1R you risked. Check that your targets sit at 1.5R or more.` }, plan: { title: 'Aim for more than you risk', why: 'The win was smaller than the risk.', steps: ['Place the target at 1.5R or more when you enter.', 'Skip setups where the nearest obstacle is closer than that.', 'Check your average R in the Insights tab each week.'] } });
  if (open)
    bad.push({ score: 60, f: { title: 'Decide the exit now', text: 'While a trade is open, write down where you will take profit and where the idea is wrong.' }, plan: { title: 'Manage the open trade', why: 'The trade is still running.', steps: ['Write the stop and target in the notes.', 'Do not widen the stop.', 'Update this entry when the trade closes.'] } });
  if (!entry.setupNotes.trim())
    bad.push({ score: 42, f: { title: 'No setup note', text: 'Add one line on why you took this trade, so you can judge the reasoning later.' }, plan: { title: 'Write the why', why: 'There is no note on the setup.', steps: ['Write one line on the setup before you enter.', 'Name the trigger you were waiting for.', 'Add what would prove you wrong.'] } });
  if ((loss || entry.outcome === 'breakeven') && !entry.lessons.trim())
    bad.push({ score: 48, f: { title: 'No lesson written', text: 'A losing trade is worth most when you write one thing to do differently.' }, plan: { title: 'Write one lesson', why: 'No lesson is written for this trade.', steps: ['Write one thing you would do differently.', 'Make it something you can check next time.', 'Add it to your checklist if it repeats.'] } });
  const ranked = bad.sort((a, b) => b.score - a.score);
  const improve = ranked.slice(0, 3).map((x) => x.f);
  if (!improve.length) improve.push({ title: 'Nothing stands out', text: 'On plan, checked and settled. The aim now is to repeat it, not to change it.' });

  const focus: FocusPlan =
    ranked[0]?.plan ??
    ({
      title: 'Repeat this one',
      why: 'The process on this trade was sound, so the goal is to make it routine.',
      steps: ['Add this setup to your Playbook with the same checklist.', 'Size the next one the same way: 1% risk or less.', `Take it again only when all ${total || 'your'} checks pass.`],
    } as FocusPlan);

  const chips: EntryChip[] = [
    { label: 'Result', value: open ? 'Open' : money(entry.pnl), tone: open ? 'white' : entry.pnl >= 0 ? 'lime' : 'pink' },
    { label: 'R multiple', value: r === null ? '–' : rFmt(r), tone: r === null ? 'white' : r >= 0 ? 'lime' : 'pink' },
    { label: 'Plan', value: entry.followedPlan ? 'On plan' : 'Off plan', tone: entry.followedPlan ? 'lime' : 'pink' },
    { label: 'Checklist', value: total ? `${doneCount}/${total}` : '–', tone: fullChecklist ? 'lime' : 'white' },
    { label: 'Mood', value: `${before} → ${entry.emotionAfter}`, tone: 'white' },
  ];

  const caveat = others.length >= 3 ? `A read of this one trade next to your other ${others.length}.` : 'A read of this one trade. It gets sharper as your journal grows.';
  return { kind, headline, overview, wentWell, improve, focus, chips, caveat };
}
