// Strategy playbooks for the trading journal: the written rules for each setup.
// A playbook's name matches JournalEntry.strategy, which is how its stats are computed.
import { PortfolioAssetClass } from '../types';

export type PlaybookGrade = 'A+' | 'A' | 'B+' | 'B' | 'C';
export type PlaybookStatus = 'active' | 'testing' | 'archived';

export interface JournalPlaybook {
  id: string;
  name: string;
  grade: PlaybookGrade;
  style: string; // short label e.g. "Momentum"
  status: PlaybookStatus;
  markets: PortfolioAssetClass[];
  /** Session window in UTC hours [start, end); null = any time. */
  window: { start: number; end: number; label: string } | null;
  benchmarkRR: number; // minimum planned reward:risk
  thesis: string;
  rules: { id: string; title: string; detail: string }[];
  entryTrigger: string;
  stopRule: string;
  targetRule: string;
  tags: string[];
  createdAt: string;
  /** Rules: risk limits and no-trade conditions specific to this setup. */
  riskPerTrade?: number; // % of account
  maxTradesPerDay?: number;
  avoid?: string[];
  /** Performance review log. */
  reviews?: PlaybookReview[];
  /** Instruments this setup is traded on. */
  symbols?: string[];
  /** Trade ideas (hypotheses) waiting for this setup to trigger. */
  scenarios?: PlaybookScenario[];
}

export type ScenarioStatus = 'watching' | 'triggered' | 'invalidated' | 'closed';
export interface PlaybookScenario {
  id: string;
  symbol: string;
  bias: 'long' | 'short';
  /** "If ... then ..." statement written by the trader. */
  hypothesis: string;
  /** What has to happen on the chart before entering. */
  trigger: string;
  entry?: number;
  stop?: number;
  target?: number;
  validUntil: string; // YYYY-MM-DD
  status: ScenarioStatus;
  createdAt: string;
}

export type ReviewDecision = 'keep' | 'adjust' | 'pause' | 'retire';
export interface PlaybookReview { id: string; date: string; note: string; decision: ReviewDecision }

const r = (id: string, title: string, detail: string) => ({ id, title, detail });

export const DEFAULT_PLAYBOOKS: JournalPlaybook[] = [
  {
    id: 'PB-001', name: 'Breakout', grade: 'A', style: 'Momentum', status: 'active',
    markets: ['Indices', 'Forex', 'Commodity'],
    window: { start: 12, end: 16, label: 'London / NY overlap' }, benchmarkRR: 2,
    thesis: 'Trade the first clean break of a well-defined range once liquidity arrives. A range that has been tested at least twice holds resting orders on both sides; when price closes outside it with expanding volume, the move usually extends far enough to pay 2R before the range is retested.',
    rules: [
      r('r1', 'Defined range', 'Range has at least two touches on each side on the 15m chart.'),
      r('r2', 'Session timing', 'Break happens inside the London / NY overlap, not in the last hour.'),
      r('r3', 'Close outside', 'A full candle body closes outside the range; no wick-only breaks.'),
      r('r4', 'Volume expansion', 'Breakout candle volume is above the 20-bar average.'),
      r('r5', 'Room to target', 'Next higher-timeframe level is at least 2R away.'),
    ],
    entryTrigger: 'Limit order on the first retest of the broken range edge, or market on a second close outside if no retest within 3 candles.',
    stopRule: 'Back inside the range: stop a few ticks beyond the midpoint of the range.',
    targetRule: 'Take half at 2R, move stop to breakeven, trail the rest behind 15m swing points.',
    tags: ['Range', 'Volume', 'NY open'], createdAt: '2026-06-02',
    symbols: ['US500', 'NAS100', 'XAU/USD', 'GBP/USD'],
    scenarios: [
      { id: 'sc1', symbol: 'NAS100', bias: 'long', hypothesis: 'If NAS100 holds above yesterday\'s high into the NY open and breaks the 19,900–19,980 range with volume, then it should run to the 20,150 weekly level.', trigger: 'A 15m candle closes above 19,980 with volume above the 20-bar average.', entry: 19985, stop: 19930, target: 20150, validUntil: '2026-10-09', status: 'watching', createdAt: '2026-10-05' },
      { id: 'sc2', symbol: 'XAU/USD', bias: 'short', hypothesis: 'If gold loses the 2,600 shelf after US data, then the range breaks down toward 2,570.', trigger: 'Full 15m body close below 2,600, then a retest that fails.', entry: 2598, stop: 2609, target: 2570, validUntil: '2026-10-07', status: 'watching', createdAt: '2026-10-04' },
    ],
    riskPerTrade: 1, maxTradesPerDay: 2, avoid: ['Range narrower than 1× ATR', 'Within 15 minutes of a tier-1 release', 'Third test of the same level'],
    reviews: [{ id: 'rv1', date: '2026-09-28', note: 'Best results on indices at the NY open. Failed breaks mostly came from entries before a full candle close.', decision: 'keep' }],
  },
  {
    id: 'PB-002', name: 'Swing', grade: 'A+', style: 'Swing', status: 'active',
    markets: ['Forex', 'Indices', 'Crypto'],
    window: null, benchmarkRR: 2.5,
    thesis: 'Join the higher-timeframe trend on a pullback into value. When the 4H and daily agree on direction, a pullback to a prior structure level gives a tight invalidation with multi-day upside.',
    rules: [
      r('r1', 'HTF alignment', 'Daily and 4H structure point the same way (higher highs and lows or the opposite).'),
      r('r2', 'Pullback into value', 'Price retraces into a prior breakout level or the 38–62% zone of the last leg.'),
      r('r3', 'Rejection', 'A 4H rejection candle forms at the level.'),
      r('r4', 'No major news', 'No tier-1 event for the pair in the next 12 hours.'),
    ],
    entryTrigger: 'Enter on the close of the 4H rejection candle or a limit at its 50% level.',
    stopRule: 'Beyond the pullback extreme plus a spread buffer.',
    targetRule: 'First target at the previous swing high/low, runner to the next daily level.',
    tags: ['Trend', 'HTF', 'Patient entry'], createdAt: '2026-05-18',
    symbols: ['EUR/USD', 'GBP/JPY', 'BTC/USDT', 'US500'],
    scenarios: [
      { id: 'sc1', symbol: 'GBP/JPY', bias: 'short', hypothesis: 'If GBP/JPY rejects the 199.00 daily supply again, then the 4H downtrend resumes toward 195.50.', trigger: '4H rejection candle at 198.80–199.10.', entry: 198.7, stop: 199.4, target: 195.5, validUntil: '2026-10-12', status: 'triggered', createdAt: '2026-10-02' },
    ],
    riskPerTrade: 1, maxTradesPerDay: 1, avoid: ['Daily and 4H disagree', 'Friday after 16:00 UTC'],
  },
  {
    id: 'PB-003', name: 'Scalping', grade: 'B+', style: 'Intraday', status: 'active',
    markets: ['Forex', 'Indices'],
    window: { start: 7, end: 10, label: 'London open' }, benchmarkRR: 1.5,
    thesis: 'Capture the first impulsive leg after the London open. Liquidity resets at the open and the first displacement often runs to the Asian range extremes.',
    rules: [
      r('r1', 'Asian range marked', 'Asian high and low are marked before the open.'),
      r('r2', 'Displacement', 'A strong 5m candle breaks one side of the Asian range.'),
      r('r3', 'Spread check', 'Spread is normal (no widening after the open).'),
      r('r4', 'Max two attempts', 'No more than two scalps per session.'),
    ],
    entryTrigger: 'Pullback to the 5m breakout candle open.',
    stopRule: 'Below/above the displacement candle.',
    targetRule: 'Fixed 1.5R; close everything by 10:00 UTC.',
    tags: ['London', 'Asian range'], createdAt: '2026-07-01',
    symbols: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    riskPerTrade: 0.5, maxTradesPerDay: 2, avoid: ['Spread above normal', 'Bank holiday in London'],
  },
  {
    id: 'PB-004', name: 'Trend Pullback', grade: 'A', style: 'Trend', status: 'active',
    markets: ['Forex', 'Indices', 'Commodity', 'Stocks'],
    window: { start: 7, end: 16, label: 'London + NY morning' }, benchmarkRR: 2,
    thesis: 'In an established intraday trend, the first pullback to the 20 EMA offers the best risk:reward continuation.',
    rules: [
      r('r1', 'Trend defined', '1H shows at least two higher highs/lows (or the reverse) above/below the 20 EMA.'),
      r('r2', 'First pullback', 'This is the first touch of the 20 EMA since the trend began.'),
      r('r3', 'Momentum shift', '5m prints a higher low (or lower high) at the EMA.'),
      r('r4', 'Risk sized', 'Position sized to 1% risk from the planned stop.'),
    ],
    entryTrigger: 'Break of the 5m higher-low candle high (or lower-high candle low).',
    stopRule: 'Beyond the pullback extreme.',
    targetRule: 'Prior trend extreme, then trail on 1H swings.',
    tags: ['EMA', 'Continuation'], createdAt: '2026-05-25',
    symbols: ['EUR/USD', 'XAU/USD', 'NAS100', 'NVDA'],
    scenarios: [
      { id: 'sc1', symbol: 'EUR/USD', bias: 'long', hypothesis: 'If EUR/USD keeps making higher lows on the 1H, then the first pullback to the 20 EMA near 1.0880 is a buy for a retest of 1.0950.', trigger: '5m higher low at the 20 EMA, then a break of that candle high.', entry: 1.0885, stop: 1.0858, target: 1.095, validUntil: '2026-10-08', status: 'watching', createdAt: '2026-10-05' },
    ],
    riskPerTrade: 1, maxTradesPerDay: 3, avoid: ['Second or later pullback in the same trend', 'Choppy, overlapping 1H candles'],
    reviews: [{ id: 'rv1', date: '2026-09-21', note: 'Win rate is low because I keep taking the second and third pullbacks. Adding a rule to take only the first one.', decision: 'adjust' }],
  },
  {
    id: 'PB-005', name: 'Range Fade', grade: 'B', style: 'Mean reversion', status: 'testing',
    markets: ['Forex', 'Crypto'],
    window: { start: 0, end: 7, label: 'Asia session' }, benchmarkRR: 1.5,
    thesis: 'Low-volume sessions tend to revert from range extremes. Fade the edges of a mature range when there is no catalyst to break it.',
    rules: [
      r('r1', 'Mature range', 'Range has held for at least 6 hours.'),
      r('r2', 'No catalyst', 'No scheduled news until the London open.'),
      r('r3', 'Rejection wick', 'A rejection wick forms at the range edge.'),
    ],
    entryTrigger: 'Limit order a few pips inside the range edge after the rejection.',
    stopRule: 'Outside the range by 1× average spread plus 5 pips.',
    targetRule: 'Range midpoint; close before the London open.',
    tags: ['Asia', 'Mean reversion'], createdAt: '2026-08-10',
    symbols: ['USD/JPY', 'ETH/USDT'],
    riskPerTrade: 0.5, maxTradesPerDay: 2, avoid: ['News scheduled before London open', 'Range already broken once today'],
  },
  {
    id: 'PB-006', name: 'News Event', grade: 'B', style: 'Event', status: 'testing',
    markets: ['Forex', 'Indices', 'Commodity'],
    window: { start: 12, end: 15, label: 'US data releases' }, benchmarkRR: 2,
    thesis: 'Trade the second move after a tier-1 release, once the initial spike has shown which side the market accepts.',
    rules: [
      r('r1', 'Tier-1 event', 'CPI, NFP, FOMC or equivalent on the economic calendar.'),
      r('r2', 'Wait 5 minutes', 'No entry in the first 5 minutes after the release.'),
      r('r3', 'Acceptance', 'Price holds beyond the spike midpoint for two 1m closes.'),
      r('r4', 'Half size', 'Risk is half the normal size.'),
    ],
    entryTrigger: 'Break of the 5-minute post-release range in the accepted direction.',
    stopRule: 'Opposite side of the 5-minute range.',
    targetRule: '2R or the pre-release high/low, whichever comes first.',
    tags: ['Economic calendar', 'Volatility'], createdAt: '2026-07-20',
    symbols: ['EUR/USD', 'XAU/USD', 'US500'],
    riskPerTrade: 0.5, maxTradesPerDay: 1, avoid: ['Spread still wide after 5 minutes', 'Mixed data (headline vs core disagree)'],
  },
  {
    id: 'PB-007', name: 'Position', grade: 'C', style: 'Long-term', status: 'archived',
    markets: ['Stocks', 'Crypto'],
    window: null, benchmarkRR: 3,
    thesis: 'Multi-week holds on assets with a clear macro or fundamental catalyst.',
    rules: [
      r('r1', 'Catalyst', 'A written fundamental or macro reason for the hold.'),
      r('r2', 'Weekly trend', 'Weekly chart is trending in the trade direction.'),
    ],
    entryTrigger: 'Scale in over three entries on daily pullbacks.',
    stopRule: 'Weekly close beyond the last weekly swing.',
    targetRule: 'Review weekly; exit when the thesis is invalid.',
    tags: ['Macro'], createdAt: '2026-04-01',
    symbols: ['NVDA', 'BTC/USDT'],
    riskPerTrade: 2, maxTradesPerDay: 1, avoid: ['No written catalyst'],
    reviews: [{ id: 'rv1', date: '2026-08-30', note: 'Not enough capital or patience for multi-week holds right now.', decision: 'retire' }],
  },
];

/** Starter templates for "Import template". */
export const PLAYBOOK_TEMPLATES: Omit<JournalPlaybook, 'id' | 'createdAt'>[] = [
  {
    name: 'Silver Bullet 15m FVG', grade: 'B', style: 'Liquidity', status: 'testing',
    markets: ['Indices', 'Forex'], window: { start: 14, end: 15, label: 'NY 10:00–11:00 (UTC-4)' }, benchmarkRR: 2,
    thesis: 'After a sweep of nearby session liquidity, price displaces and leaves a fair value gap. Enter on the return into the gap during the one-hour delivery window.',
    rules: [
      r('r1', 'Market context', 'Daily bias agrees with higher-timeframe order flow.'),
      r('r2', 'Liquidity event', 'A previous session high/low or the Asian range was swept.'),
      r('r3', 'Timing window', 'Entry only inside the one-hour delivery window.'),
      r('r4', 'Displacement', 'A clear 15m/5m fair value gap forms with momentum.'),
      r('r5', 'Stop placement', 'Stop beyond the swing that created the displacement.'),
      r('r6', 'Target', 'At least 2R or the opposing internal liquidity.'),
    ],
    entryTrigger: 'Limit order at the 50% level of the fair value gap.',
    stopRule: 'Beyond the displacement swing plus a 2-tick buffer.',
    targetRule: 'Close 50% at 2R, move stop to breakeven, trail the rest.',
    tags: ['FVG', 'Liquidity sweep'],
    symbols: ['NAS100', 'US500', 'EUR/USD'],
  },
  {
    name: 'Opening Range Breakout (5m)', grade: 'B', style: 'Momentum', status: 'testing',
    markets: ['Indices', 'Stocks'], window: { start: 13, end: 15, label: 'US cash open' }, benchmarkRR: 1.8,
    thesis: 'The first five minutes of the US cash session set a range that often decides the morning direction.',
    rules: [
      r('r1', 'Mark the range', 'High and low of the first 5m candle after the cash open.'),
      r('r2', 'Close outside', 'A 5m candle closes outside the opening range.'),
      r('r3', 'Relative volume', 'Volume is above the 10-day average for that time.'),
    ],
    entryTrigger: 'Stop order one tick beyond the opening range after the close outside.',
    stopRule: 'Opposite side of the opening range.',
    targetRule: '1.8R or the previous day high/low.',
    tags: ['ORB', 'US open'],
    symbols: ['US500', 'NAS100', 'NVDA'],
  },
  {
    name: 'VWAP Mean Reversion', grade: 'B', style: 'Mean reversion', status: 'testing',
    markets: ['Indices', 'Stocks'], window: { start: 15, end: 18, label: 'NY lunch' }, benchmarkRR: 1.5,
    thesis: 'During the quieter midday session, extended moves away from VWAP tend to revert.',
    rules: [
      r('r1', 'Extension', 'Price is beyond the 2nd VWAP standard deviation band.'),
      r('r2', 'Divergence', 'Delta or RSI shows divergence at the extreme.'),
      r('r3', 'No trend day', 'The session is not a clear trend day.'),
    ],
    entryTrigger: 'Reversal candle close back inside the band.',
    stopRule: 'Beyond the session extreme.',
    targetRule: 'VWAP.',
    tags: ['VWAP', 'Lunch'],
    symbols: ['US500', 'NAS100'],
  },
];
