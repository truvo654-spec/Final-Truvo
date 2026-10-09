// Deterministic sample history for the trading journal demo (Aug–Sep 2026).
// Gives the Insights reports (day/time, sessions, durations, matrix) enough trades to be meaningful.
// Seeded so every load produces the same data.
import { JournalEntry, JournalEmotion, PortfolioAssetClass } from '../types';

interface Instrument { symbol: string; assetClass: PortfolioAssetClass; price: number; stopPct: number; sizes: number[] }

const INSTRUMENTS: Instrument[] = [
  { symbol: 'EUR/USD', assetClass: 'Forex', price: 1.0875, stopPct: 0.0025, sizes: [0.5, 1, 1.5, 2] },
  { symbol: 'GBP/USD', assetClass: 'Forex', price: 1.2705, stopPct: 0.003, sizes: [0.5, 1, 2] },
  { symbol: 'USD/JPY', assetClass: 'Forex', price: 146.8, stopPct: 0.003, sizes: [0.5, 1, 1.5] },
  { symbol: 'GBP/JPY', assetClass: 'Forex', price: 197.2, stopPct: 0.004, sizes: [0.3, 0.5, 1] },
  { symbol: 'XAU/USD', assetClass: 'Commodity', price: 2560, stopPct: 0.004, sizes: [0.2, 0.5, 1] },
  { symbol: 'US500', assetClass: 'Indices', price: 5680, stopPct: 0.004, sizes: [1, 2] },
  { symbol: 'NAS100', assetClass: 'Indices', price: 19850, stopPct: 0.005, sizes: [1, 2] },
  { symbol: 'BTC/USDT', assetClass: 'Crypto', price: 62400, stopPct: 0.012, sizes: [0.1, 0.2, 0.3] },
  { symbol: 'ETH/USDT', assetClass: 'Crypto', price: 2560, stopPct: 0.015, sizes: [1, 2] },
  { symbol: 'NVDA', assetClass: 'Stocks', price: 116, stopPct: 0.012, sizes: [20, 40, 60] },
];

const BROKERS = ['exness', 'hfm', 'xm', 'ic-markets', 'pepperstone'];
const STRATEGIES = ['Breakout', 'Swing', 'Scalping', 'Trend Pullback', 'Range Fade', 'News Event'];
const GOOD_TAGS = ['A+ setup', 'Patient entry', 'High conviction', 'Partial profit'];
const BAD_TAGS = ['Overtraded', 'Revenge', 'Counter-trend', 'News driven'];
const MISTAKES = ['Moved stop loss', 'Entered early', 'Chased price', 'Exited too soon', 'Oversized position', 'Ignored plan'];
const CALM: JournalEmotion[] = ['Calm', 'Confident'];
const STRESSED: JournalEmotion[] = ['Anxious', 'FOMO', 'Frustrated', 'Bored', 'Greedy'];

/** Small seeded PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, '0');
const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;
const dpFor = (price: number) => (price < 10 ? 4 : price < 500 ? 2 : 1);

export function generateJournalHistory(): JournalEntry[] {
  const r = rng(20260807);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const out: JournalEntry[] = [];
  const start = Date.UTC(2026, 7, 3); // Mon 3 Aug 2026
  const end = Date.UTC(2026, 8, 17); // Thu 17 Sep 2026
  let n = 0;
  for (let t = start; t <= end; t += 86400000) {
    const d = new Date(t);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const roll = r();
    const trades = roll < 0.12 ? 0 : roll < 0.45 ? 1 : roll < 0.85 ? 2 : 3;
    for (let k = 0; k < trades; k++) {
      n += 1;
      // Session: London 07–12, overlap 12–16, NY PM 16–21, Asia 00–07
      const sRoll = r();
      const hour = sRoll < 0.15 ? 1 + Math.floor(r() * 5) : sRoll < 0.55 ? 7 + Math.floor(r() * 5) : sRoll < 0.85 ? 12 + Math.floor(r() * 4) : 16 + Math.floor(r() * 4);
      const minute = Math.floor(r() * 60);
      const second = Math.floor(r() * 60);
      // Built-in patterns: Tuesday/London mornings run best, Thursday midday and late NY leak.
      let edge = 0.15;
      if (dow === 2 && hour >= 7 && hour < 12) edge = 0.75;
      else if (dow === 4 && hour >= 12 && hour < 16) edge = -0.85;
      else if (hour >= 16) edge = -0.45;
      else if (dow === 4) edge = -0.2;
      else if (hour < 7) edge = -0.1;
      else if (dow === 3) edge = 0.35;
      const win = r() < 0.5 + edge * 0.4;
      const be = !win && r() < 0.1;
      const R = be ? 0 : win ? round(0.8 + r() * 2.4, 2) : round(-(0.85 + r() * 0.3), 2);
      const inst = pick(INSTRUMENTS);
      const size = pick(inst.sizes);
      const side: 'BUY' | 'SELL' = r() < 0.55 ? 'BUY' : 'SELL';
      const entry = round(inst.price * (1 + (r() - 0.5) * 0.04), dpFor(inst.price));
      const stopDist = entry * inst.stopPct;
      const move = R * stopDist * (side === 'BUY' ? 1 : -1);
      const exit = round(entry + move, dpFor(inst.price));
      const risk = 80 + Math.floor(r() * 140);
      const pnl = round(R * risk, 2);
      const durMin = hour < 7 ? 30 + Math.floor(r() * 300) : pick([4, 9, 14, 22, 35, 48, 75, 110, 160, 240, 320]) + Math.floor(r() * 10);
      const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      const entryTime = `${date}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
      const exitMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hour, minute + durMin, second);
      const ex = new Date(exitMs);
      const exitTime = `${ex.getUTCFullYear()}-${pad(ex.getUTCMonth() + 1)}-${pad(ex.getUTCDate())}T${pad(ex.getUTCHours())}:${pad(ex.getUTCMinutes())}:${pad(ex.getUTCSeconds())}`;
      const followedPlan = win ? r() < 0.9 : r() < 0.45;
      const mistakes = followedPlan ? [] : [pick(MISTAKES)];
      const lotClass = inst.assetClass === 'Forex' || inst.assetClass === 'Commodity' || inst.assetClass === 'Indices';
      out.push({
        id: `jr_h${n}`,
        date,
        entryTime,
        exitTime,
        symbol: inst.symbol,
        assetClass: inst.assetClass,
        direction: side,
        entryPrice: entry,
        exitPrice: exit,
        stopPrice: round(side === 'BUY' ? entry - stopDist : entry + stopDist, dpFor(inst.price)),
        size,
        pnl,
        rMultiple: R,
        outcome: be ? 'breakeven' : win ? 'win' : 'loss',
        strategy: pick(STRATEGIES),
        tags: [win ? pick(GOOD_TAGS) : pick(BAD_TAGS)],
        setupNotes: '',
        emotionBefore: followedPlan ? pick(CALM) : pick(STRESSED),
        emotionAfter: win ? pick(CALM) : pick(STRESSED),
        followedPlan,
        checklistDone: followedPlan ? ['chk_1', 'chk_2', 'chk_3', 'chk_5'] : ['chk_1'],
        mistakes,
        lessons: '',
        rating: win ? 4 : followedPlan ? 3 : 2,
        source: 'manual',
        brokerId: pick(BROKERS),
        commission: round(lotClass ? size * 3.5 : inst.assetClass === 'Stocks' ? 1 : size * 2, 2),
      });
    }
  }
  return out;
}
