import { PORTFOLIO_NOW, DAY, EquityPoint } from './portfolioData';

export interface EaVersion { v: string; date: string; notes: string }
export interface EaReview { id: string; who: string; rating: number; text: string; date: string }

export interface ExpertAdvisor {
  id: string;
  name: string;
  author: string;
  authorType: 'Advisor' | 'Broker' | 'MarketSyde';
  platform: 'MT4' | 'MT5' | 'cTrader';
  strategy: string;
  pairs: string[];
  risk: 'Low' | 'Medium' | 'High';
  /** 0 = every plan, 1 = Intermediate and up, 2 = Premium only */
  minPlan: 0 | 1 | 2;
  description: string;
  settings: string[];
  stats: { monthly: number; maxDD: number; winRate: number; profitFactor: number; trades: number; liveDays: number };
  versions: EaVersion[];
  downloads: number;
  reviews: EaReview[];
  seed: number;
  totalReturn: number;
}

export const EXPERT_ADVISORS: ExpertAdvisor[] = [
  {
    id: 'ea_steady', name: 'Steady Majors', author: 'MarketSyde Labs', authorType: 'MarketSyde', platform: 'MT5', strategy: 'Trend pullback',
    pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY'], risk: 'Low', minPlan: 0,
    description: 'Trades pullbacks inside the daily trend on three majors. One position per pair, fixed 0.75% risk, no martingale and no grid.',
    settings: ['Risk per trade 0.75%', 'Timeframe H1', 'Max 3 open positions', 'Stop loss ATR x 1.8'],
    stats: { monthly: 2.1, maxDD: 6.4, winRate: 58, profitFactor: 1.42, trades: 412, liveDays: 214 },
    versions: [{ v: '2.1.0', date: '2026-09-18', notes: 'Added news filter around high-impact releases.' }, { v: '2.0.2', date: '2026-08-02', notes: 'Fixed lot rounding on 5-digit brokers.' }, { v: '2.0.0', date: '2026-06-11', notes: 'Rewrote entry logic, removed averaging.' }],
    downloads: 3820, seed: 4, totalReturn: 18.4,
    reviews: [{ id: 'r1', who: 'Pip Hunter', rating: 5, text: 'Boring in the best way. Drawdown stayed under what the page says.', date: '2026-09-25' }, { id: 'r2', who: 'Nina Park', rating: 4, text: 'Works well on my IC Markets account. Wish it had a session filter.', date: '2026-09-10' }],
  },
  {
    id: 'ea_gold', name: 'Gold Breakout Scout', author: 'Sarah K.', authorType: 'Advisor', platform: 'MT4', strategy: 'Breakout',
    pairs: ['XAU/USD'], risk: 'Medium', minPlan: 1,
    description: 'Trades the London open range break on gold with a hard daily loss cap. Skips days with high-impact USD news.',
    settings: ['Risk per trade 1%', 'Timeframe M15', 'Daily loss cap 2%', 'Session 07:00–11:00 GMT'],
    stats: { monthly: 3.4, maxDD: 11.2, winRate: 47, profitFactor: 1.31, trades: 268, liveDays: 156 },
    versions: [{ v: '1.4.0', date: '2026-09-02', notes: 'Spread filter so it skips wide-spread opens.' }, { v: '1.3.1', date: '2026-07-20', notes: 'Fixed weekend gap handling.' }],
    downloads: 1976, seed: 8, totalReturn: 19.9,
    reviews: [{ id: 'r3', who: 'Arun Mehta', rating: 4, text: 'Two losing weeks in a row happens, the cap does its job.', date: '2026-09-21' }],
  },
  {
    id: 'ea_range', name: 'Range Fader', author: 'HFM Strategy Desk', authorType: 'Broker', platform: 'MT5', strategy: 'Mean reversion',
    pairs: ['EUR/GBP', 'AUD/NZD', 'EUR/CHF'], risk: 'Low', minPlan: 0,
    description: 'Fades range extremes on quiet crosses. Closes everything before major central-bank events.',
    settings: ['Risk per trade 0.5%', 'Timeframe M30', 'Event blackout 2 hours', 'Max spread 1.5 pips'],
    stats: { monthly: 1.6, maxDD: 5.1, winRate: 66, profitFactor: 1.28, trades: 530, liveDays: 301 },
    versions: [{ v: '3.0.1', date: '2026-08-28', notes: 'Event blackout now reads the MarketSyde calendar feed.' }, { v: '3.0.0', date: '2026-07-01', notes: 'New range detection.' }],
    downloads: 2450, seed: 12, totalReturn: 14.7,
    reviews: [{ id: 'r4', who: 'Lina Chen', rating: 5, text: 'Smooth equity. I paired it with a trend EA.', date: '2026-09-14' }],
  },
  {
    id: 'ea_crypto', name: 'Momentum Pulse', author: 'Volatix Labs', authorType: 'Advisor', platform: 'cTrader', strategy: 'Momentum',
    pairs: ['BTC/USD', 'ETH/USD'], risk: 'High', minPlan: 2,
    description: 'Rides intraday momentum bursts on the two largest crypto CFDs. High variance by design, so size it small.',
    settings: ['Risk per trade 1.5%', 'Timeframe M5', 'Trailing stop on', 'Weekend trading off'],
    stats: { monthly: 5.8, maxDD: 21.6, winRate: 43, profitFactor: 1.36, trades: 744, liveDays: 98 },
    versions: [{ v: '0.9.3', date: '2026-09-29', notes: 'Weekend filter added after the last gap.' }],
    downloads: 812, seed: 16, totalReturn: 24.1,
    reviews: [{ id: 'r5', who: 'Kai Tanaka', rating: 3, text: 'Great month, brutal week. Know what 20% drawdown feels like first.', date: '2026-09-27' }],
  },
  {
    id: 'ea_news', name: 'Calendar Sniper', author: 'Exness Quant Team', authorType: 'Broker', platform: 'MT4', strategy: 'News event',
    pairs: ['EUR/USD', 'GBP/USD', 'USD/CAD'], risk: 'High', minPlan: 1,
    description: 'Places bracket orders ahead of three-star events. Needs a low-latency account and a tight spread. Not for beginners.',
    settings: ['Risk per trade 0.8%', 'Event impact: High only', 'Bracket 12 pips', 'Cancel after 90 seconds'],
    stats: { monthly: 2.9, maxDD: 15.8, winRate: 39, profitFactor: 1.22, trades: 188, liveDays: 120 },
    versions: [{ v: '1.1.0', date: '2026-09-09', notes: 'Slippage guard.' }, { v: '1.0.0', date: '2026-06-30', notes: 'First public release.' }],
    downloads: 1304, seed: 20, totalReturn: 12.2,
    reviews: [],
  },
  {
    id: 'ea_swing', name: 'Slow Money Swing', author: 'Priya Shah', authorType: 'Advisor', platform: 'MT5', strategy: 'Swing',
    pairs: ['USD/JPY', 'AUD/USD', 'XAU/USD'], risk: 'Medium', minPlan: 1,
    description: 'Holds positions for days. Enters on weekly-level retests, exits on structure breaks. Few trades, wide stops.',
    settings: ['Risk per trade 1%', 'Timeframe H4', 'Max 2 open positions', 'Breakeven after 1R'],
    stats: { monthly: 2.4, maxDD: 9.3, winRate: 52, profitFactor: 1.47, trades: 96, liveDays: 340 },
    versions: [{ v: '2.2.0', date: '2026-08-15', notes: 'Added partial profit at 2R.' }],
    downloads: 1688, seed: 24, totalReturn: 21.6,
    reviews: [{ id: 'r6', who: 'Omar Haddad', rating: 5, text: 'Patience required, results show up.', date: '2026-09-05' }],
  },
];

export function eaSeries(ea: ExpertAdvisor, days = 180): EquityPoint[] {
  let a = ea.seed * 7919 + 13;
  const rnd = () => ((a = (a * 9301 + 49297) % 233280) / 233280);
  const walk = [0];
  for (let i = 1; i <= days; i++) walk.push(walk[i - 1] + (rnd() - 0.5) * 2);
  const vol = ea.risk === 'Low' ? 0.006 : ea.risk === 'Medium' ? 0.011 : 0.018;
  const start = 10000;
  const end = start * (1 + ea.totalReturn / 100);
  return walk.map((w, i) => {
    const bridge = w - (i / days) * walk[days];
    const v = start + (end - start) * (i / days) + bridge * start * vol;
    return { date: new Date(PORTFOLIO_NOW - (days - i) * DAY).toISOString().slice(0, 10), value: Math.round(v * 100) / 100 };
  });
}
