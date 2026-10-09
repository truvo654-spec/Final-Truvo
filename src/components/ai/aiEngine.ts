import { AiContext, AiMessage, AiReply, Surface } from './aiTypes';
import { calculate, detectCalc } from './aiCalc';
import { cashbackEstimate, compareBrokers, matchBrokers, prefsFromText, whyNotBroker } from './aiBroker';
import { explainTerm, learnAnswer, learnHome, learningPath, oneLiner, quizReply } from './aiLearn';
import { findTerm, termByTitle } from './aiKnowledge';
import { marketSummary } from './aiMarket';
import { behaviorObservation, detectBehaviorFocus, detectFocus, tradingInsights } from './aiPersonal';
import { recommendations } from './aiRecs';
import { detectPlaybookFocus, detectRewardFocus, playbooks, rewards } from './aiMore';
import { communityAnswer, portfolioAnswer, strategyAnswer, toolsAnswer } from './aiFeatureBridge';
import { findAssetClass, findInstrument, levenshtein, mid, parseRange, personalOff } from './aiUtil';

export type { AiContext, AiItem, AiMessage, AiReply, AiMemory, BrokerPrefs, Level, RangeDays, Surface } from './aiTypes';

export const SURFACE_PROMPTS: Record<Surface, string[]> = {
  broker: ['Which broker suits me?', 'Brokers with the best cashback', 'Compare these brokers', 'How much cashback for 20 lots?', 'Which broker is safest?'],
  learn: ['What is drawdown?', 'Quiz me', 'Learning path', 'Position size for $5,000 risking 1% with a 25 pip stop', 'How much to recover from a 20% drawdown?'],
  market: ['Give me today’s briefing', 'Week ahead', 'Gold outlook', 'Crypto summary', 'Market sentiment by asset class'],
  insights: ['How are my trades doing?', 'Which strategy works best for me?', 'Which session do I trade best?', 'What are my open positions doing?', 'Show my last 90 days'],
  behavior: ['Any habits I should watch?', 'What do I do after a loss?', 'How does my mood affect results?', 'Which mistakes cost me most?', 'Does the checklist help me?'],
  playbook: ['How do my playbooks compare?', 'Which playbook is weakest?', 'Do my playbooks follow their rules?', 'How are my trades doing?'],
  portfolio: ['How are my accounts doing?', 'What is my drawdown?', 'Am I close to my goals?', 'What is my exposure right now?'],
  strategy: ['What should I backtest first?', 'How do my playbooks compare?', 'How do I read a backtest?'],
  tools: ['Which expert advisor is safest?', 'How many alerts can I set?', 'Are expert advisors worth it?'],
  community: ['What is the community talking about?', 'What should I read?', 'What is the top article?'],
  rewards: ['How much cashback have I earned?', 'How close am I to the next level?', 'What missions are open?', 'What offers are live?', 'Where am I on the leaderboard?'],
  next: ['What should I do next?', 'Learning path', 'Week ahead'],
};

const uniq = (r: AiReply): AiReply => (r.msg.followUps ? { ...r, msg: { ...r.msg, followUps: Array.from(new Set(r.msg.followUps)).slice(0, 5) } } : r);

export function greeting(firstName: string): AiMessage {
  return {
    id: mid(), role: 'ai',
    heading: `Hi ${firstName}.`,
    paragraphs: ['I help you navigate. I do not predict the market, and nothing here is financial advice. Pick a topic on the left or just ask.'],
    followUps: ['Which broker suits me?', 'Give me today’s briefing', 'How are my trades doing?', 'What should I do next?'],
  };
}

const helpMsg = (ctx: AiContext, heading = 'Here is what I can do'): AiMessage => ({
  id: mid(), role: 'ai',
  heading,
  paragraphs: [
    `I can match you with brokers and compare them, explain any trading term at your level (${ctx.level}), quiz you, work out position size and margin, brief you on the market or one instrument, read your trades and accounts, compare your playbooks, say what to backtest, notice habits in your journal, weigh up expert advisors and alerts, tell you what the community is talking about, track your cashback, points, missions and offers, and suggest what to do next.`,
    'Tap a suggestion or write it your own way. I remember what we were just talking about, so “and gold?” or “last 7 days” works.',
  ],
  followUps: ['Which broker suits me?', 'What is leverage?', 'Gold outlook', 'How are my trades doing?', 'How do my playbooks compare?', 'How much cashback have I earned?', 'What should I do next?'],
});

export function runSurface(s: Surface, ctx: AiContext): AiReply {
  return uniq(runSurfaceRaw(s, ctx));
}

function runSurfaceRaw(s: Surface, ctx: AiContext): AiReply {
  switch (s) {
    case 'broker': return matchBrokers(ctx.brokers, ctx.prefs);
    case 'learn': return learnHome(ctx);
    case 'market': return marketSummary(ctx, 'today');
    case 'insights': return ctx.allowTrades ? tradingInsights(ctx) : { msg: personalOff('your trades', 'trades'), mem: { surface: 'insights' } };
    case 'behavior': return ctx.allowJournal ? behaviorObservation(ctx) : { msg: personalOff('your journal', 'journal'), mem: { surface: 'behavior' } };
    case 'playbook': return playbooks(ctx);
    case 'portfolio': return portfolioAnswer(ctx);
    case 'strategy': return strategyAnswer();
    case 'tools': return toolsAnswer(ctx);
    case 'community': return communityAnswer();
    case 'rewards': return rewards(ctx, ctx.user);
    default: return recommendations(ctx);
  }
}

/* ───────────── Intent scoring ───────────── */

type Rule = [RegExp, number];
const RULES: Record<Surface, Rule[]> = {
  broker: [
    [/broker|cashback|rebate|regulat|\bfca\b|\basic\b|cysec|account type|which (account|platform)|\bmt4\b|\bmt5\b|ctrader|min(imum)? deposit|โบรกเกอร์|แคชแบ็ก/, 3],
    [/compare|versus|\bvs\b|side by side/, 1],
  ],
  learn: [
    [/what is|what's|what are|what does|explain|how do(es)?\b|meaning|define|\blearn|course|lesson|teach|glossary|tutorial|อธิบาย|คืออะไร|เรียน/, 2],
  ],
  market: [
    [/briefing|summar|market|news|today|happening|calendar|week ahead|outlook|sentiment|events?\b|release|ข่าว|ตลาด|สรุป/, 3],
    [/\bnfp\b|\bcpi\b|fomc|rate decision/, 2],
  ],
  insights: [
    [/my (trades?|portfolio|performance|results?|p&?l|positions?|statistics|stats)|insights?|win ?rate|how am i|how (is|are|was) my|how.?s my|profit factor|best (strategy|pair|instrument|session)|worst (strategy|pair|instrument)|open positions|exposure|พอร์ต|เทรดของฉัน/, 4],
    [/which (strategy|pair|session|day|instrument)|when do i trade/, 3],
  ],
  behavior: [
    [/habit|behaviou?r|emotion|mistake|disciplin|revenge|journal|mood|psycholog|after (a )?loss|tilt|fomo|checklist|นิสัย|พฤติกรรม|อารมณ์/, 3],
    [/\bplan\b/, 1],
  ],
  playbook: [[/playbook|setup rules|strategy rules|my strategies|which setup/, 4], [/\bgrade\b|benchmark/, 1]],
  portfolio: [[/account|equity|balance|exposure|margin|goal|drawdown|พอร์ต|บัญชี/, 4]],
  strategy: [[/backtest|back ?test|strategy builder|optimi[sz]e|walk.?forward|monte ?carlo|ทดสอบย้อนหลัง/, 5]],
  tools: [[/expert advisor|\bea\b|robot|automat|alert|notification|แจ้งเตือน|บอท/, 4]],
  community: [[/community|feed|post|article|what are (people|traders) (saying|talking)|คอมมูนิตี้|โพสต์|บทความ/, 4]],
  rewards: [[/cashback|rebate|payout|credits?\b|points?\b|level|tier|perk|mission|promo|offer|bonus|leaderboard|rank|แคชแบ็ก|คะแนน|เลเวล/, 4]],
  next: [[/\bnext\b|recommend|what should i|suggest|to ?do list|แนะนำ/, 3], [/what to do|what now/, 3]],
};

function scoreSurfaces(q: string, ctx: AiContext) {
  const score: Record<Surface, number> = { broker: 0, learn: 0, market: 0, insights: 0, behavior: 0, playbook: 0, portfolio: 0, strategy: 0, tools: 0, community: 0, rewards: 0, next: 0 };
  (Object.keys(RULES) as Surface[]).forEach((s) => RULES[s].forEach(([re, w]) => { if (re.test(q)) score[s] += w; }));
  const personal = /\b(my|mine|i've|i have|i am|i'm)\b/.test(q);
  const term = findTerm(q);
  const inst = findInstrument(q, ctx.signals);
  const asks = /what is|what's|what are|what does|explain|how do(es)?\b|meaning|define|คืออะไร|อธิบาย/.test(q);
  if (term) score.learn += personal ? 1 : asks ? 4 : 2;
  if (personal) score.learn -= 3;
  if (/\bbrokers?\b|โบรกเกอร์/.test(q)) score.learn -= 4;
  if (ctx.brokers.some((b) => q.includes(b.name.toLowerCase()))) score.broker += 3;
  if (inst) {
    if (personal || ctx.memory.surface === 'insights') score.insights += 4;
    else score.market += 4;
  }
  if (findAssetClass(q) && !personal && !/broker/.test(q)) score.market += 2;
  if (/cashback|rebate/.test(q) && /\d+\s?lots?/.test(q)) score.broker += 3;
  // "cashback" next to a broker word is a directory question; on its own it is about the person's own rewards.
  if (/broker|compare|directory/.test(q)) score.rewards -= 5;
  if (/\bmy\b|have i|am i|i earned/.test(q) && /cashback|points?|credits?|level|rank/.test(q)) score.rewards += 3;
  if (/playbook/.test(q)) { score.insights -= 3; score.next -= 3; }
  if (/backtest|back ?test/.test(q)) { score.playbook -= 3; score.insights -= 3; }
  if (/drawdown|equity|account|goal/.test(q)) score.insights -= 2;
  if (/alert|advisor/.test(q)) { score.market -= 3; score.next -= 3; }
  if (/article|post\b/.test(q)) score.learn -= 3;
  // Short follow-ups inherit the last surface
  if (/^(and|what about|how about|also|then)\b/.test(q) && ctx.memory.surface && !inst) score[ctx.memory.surface] += 3;
  return score;
}

const GREETING = /^((hi|hello|hey|yo|good (morning|afternoon|evening)|sawasdee)\b|สวัสดี)/;
const THANKS = /^((thanks|thank you|thx|ty|cheers)\b|ขอบคุณ)/;

export function route(text: string, ctx: AiContext): AiReply {
  return uniq(routeRaw(text, ctx));
}

function routeRaw(text: string, ctx: AiContext): AiReply {
  const q = text.toLowerCase().trim();
  const mem = ctx.memory;
  const done = (r: AiReply): AiReply => r;

  if (GREETING.test(q) && q.split(/\s+/).length <= 3) return { msg: greeting(ctx.firstName), mem };
  if (THANKS.test(q)) return { msg: { id: mid(), role: 'ai', heading: 'Any time.', paragraphs: ['If you want a next step, I can suggest one.'], followUps: ['What should I do next?', 'Quiz me'] }, mem };
  if (/^(help|what can you do|\?|menu|commands)$/.test(q) || /what can you (do|help)/.test(q)) return { msg: helpMsg(ctx), mem };

  // Calculators
  const calc = detectCalc(q);
  if (calc) return { msg: calculate(calc, text), mem: { ...mem, surface: 'learn' } };

  // Quiz and learning path
  const quizOn = q.match(/(?:quiz|test|question)\w*\s+(?:me\s+)?on\s+(.+)$/);
  if (/\b(quiz|test me|test my|practice question|next question|another question)\b/.test(q)) {
    const t = quizOn ? findTerm(quizOn[1]) : /^next question|^another question/.test(q) ? undefined : findTerm(q);
    return quizReply(ctx, t);
  }
  if (/learning path|roadmap|curriculum|where (do|should) i (start|begin)|study plan|what (should|do) i (learn|study)/.test(q)) return learningPath(ctx);

  // Depth changes on the last explained term
  const lastTerm = mem.term ? termByTitle(mem.term) : undefined;
  if (lastTerm && !findTerm(q)) {
    if (/simpler|simple terms|eli5|like i'?m (5|five)|easier|plain(er)?|dumb it down/.test(q)) return mem.level === 'Beginner' ? oneLiner(lastTerm) : explainTerm(lastTerm, 'Beginner');
    if (/deeper|more detail|go deeper|in depth|advanced|more advanced|explain more|tell me more/.test(q)) return explainTerm(lastTerm, 'Advanced');
  }

  const score = scoreSurfaces(q, ctx);
  const ranked = (Object.entries(score) as [Surface, number][]).sort((a, b) => b[1] - a[1]);
  const [best, bestScore] = ranked[0];

  if (bestScore >= 2) {
    switch (best) {
      case 'broker': {
        const names = ctx.brokers.filter((b) => q.includes(b.name.toLowerCase()));
        if (/why (not|isn'?t|is not|didn'?t)/.test(q) && names[0]) return whyNotBroker(ctx.brokers, ctx.prefs, names[0].name);
        if (/compare|versus|\bvs\b|side by side/.test(q)) return compareBrokers(ctx.brokers, names.length >= 2 ? names.map((b) => b.id) : mem.brokerIds, ctx.prefs);
        const lots = q.match(/(\d+(?:\.\d+)?)\s?lots?/);
        if (lots && /cashback|rebate|earn|make|get/.test(q)) return cashbackEstimate(ctx.brokers, parseFloat(lots[1]) > 0 ? parseFloat(lots[1]) : ctx.prefs.lots);
        return matchBrokers(ctx.brokers, prefsFromText(q, ctx.prefs));
      }
      case 'learn': return learnAnswer(text, ctx);
      case 'market': {
        const inst = findInstrument(q, ctx.signals);
        const cls = findAssetClass(q);
        if (/week ahead|this week|next week|upcoming|coming up|calendar|schedule/.test(q) && !inst) return marketSummary(ctx, 'week');
        if (inst) return marketSummary(ctx, 'symbol', { inst });
        if (/sentiment|mood of|bullish|bearish/.test(q) && !cls) return marketSummary(ctx, 'sentiment');
        if (cls) return marketSummary(ctx, 'asset', { cls });
        return marketSummary(ctx, 'today');
      }
      case 'insights': {
        if (!ctx.allowTrades) return { msg: personalOff('your trades', 'trades'), mem: { ...mem, surface: 'insights' } };
        const inst = findInstrument(q, ctx.signals);
        return tradingInsights(ctx, { days: parseRange(q) ?? undefined, focus: detectFocus(q), symbol: inst?.symbol });
      }
      case 'behavior': {
        if (!ctx.allowJournal) return { msg: personalOff('your journal', 'journal'), mem: { ...mem, surface: 'behavior' } };
        return behaviorObservation(ctx, detectBehaviorFocus(q));
      }
      case 'playbook': return playbooks(ctx, detectPlaybookFocus(q));
      case 'portfolio': return portfolioAnswer(ctx, parseRange(q) ?? ctx.range);
      case 'strategy': return strategyAnswer();
      case 'tools': return toolsAnswer(ctx, /alert|notification|แจ้งเตือน/.test(q) ? 'alerts' : 'advisors');
      case 'community': return communityAnswer();
      case 'rewards': return rewards(ctx, ctx.user, detectRewardFocus(q));
      default: return recommendations(ctx);
    }
  }

  // Only a range was given ("last 7 days") after a personal answer
  const range = parseRange(q);
  if (range && mem.surface === 'insights' && ctx.allowTrades) return tradingInsights(ctx, { days: range, symbol: mem.symbol });
  if (range && mem.surface === 'behavior' && ctx.allowJournal) return behaviorObservation(ctx);

  // Typos near a glossary term
  const words = q.split(/[^a-z]+/).filter((w) => w.length >= 4);
  for (const w of words) {
    const near = ['drawdown', 'leverage', 'margin', 'spread', 'pip', 'stop loss', 'broker', 'cashback', 'journal', 'breakout'].find((k) => levenshtein(w, k) === 1);
    if (near) return done({ msg: { id: mid(), role: 'ai', heading: `Did you mean “${near}”?`, paragraphs: ['I did not recognise that word exactly.'], followUps: [`What is ${near}?`] }, mem });
  }
  return { msg: helpMsg(ctx, 'I am not sure I got that'), mem };
}

