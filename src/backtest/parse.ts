// Reads a strategy written in plain English and turns it into rules the user can check before running.
// Local pattern matching (no network); unknown phrases are reported instead of guessed.
import { cond, ind, mirrorCondition, price, val } from './rules';
import { BacktestSettings, Condition, StrategyRules, Timeframe } from './types';

export type ParseResult =
  | { ok: true; rules: StrategyRules; notes: string[]; extras: { session?: BacktestSettings['session']; timeframe?: Timeframe; news?: BacktestSettings['news'] } }
  | { ok: false; message: string };

const NUM = '(\\d+(?:\\.\\d+)?)';
const EXAMPLE = 'Buy when RSI(14) crosses above 30 and price is above the 200 EMA. Stop 1.5 ATR, target 2R, breakeven at 1R. London session only.';

export function parseStrategy(input: string): ParseResult {
  const t = ` ${input.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')} `;
  if (t.trim().length < 8) return { ok: false, message: `Describe when to enter and exit, for example: "${EXAMPLE}"` };
  const tradeWords = /\b(buy|sell|long|short|enter|entry|break|cross|rsi|ema|sma|vwap|stop|target|fvg|fair value)\b/;
  if (!tradeWords.test(t)) return { ok: false, message: `That doesn't read like a trading strategy. Say when to buy or sell and where the stop and target go, for example: "${EXAMPLE}"` };

  const notes: string[] = [];
  const conds: Condition[] = [];
  const wantsLong = /\b(buy|long|go long)\b/.test(t);
  const wantsShort = /\b(sell|short|go short)\b/.test(t);
  const direction: StrategyRules['direction'] = /\bboth\b|long and short|buy and sell/.test(t) || (wantsLong && wantsShort) ? 'both' : wantsShort ? 'short' : 'long';
  const up = (w: string) => /above|over|>/.test(w);

  // Moving average crosses: "EMA 9 crosses above EMA 21", "20 EMA crosses over the 50 EMA"
  for (const m of t.matchAll(new RegExp(`(?:(ema|sma|ma)\\s*\\(?(\\d+)\\)?|(\\d+)\\s*(ema|sma|ma))\\s*(?:crosses|cross|crossing)\\s*(above|over|below|under)\\s*(?:the\\s*)?(?:(ema|sma|ma)\\s*\\(?(\\d+)\\)?|(\\d+)\\s*(ema|sma|ma))`, 'g'))) {
    const k1 = (m[1] || m[4]) === 'ema' ? 'EMA' : 'SMA', p1 = +(m[2] || m[3]);
    const k2 = (m[6] || m[9]) === 'ema' ? 'EMA' : 'SMA', p2 = +(m[7] || m[8]);
    conds.push(cond(ind(k1, p1), up(m[5]) ? 'crossAbove' : 'crossBelow', ind(k2, p2)));
  }
  // RSI: "RSI(14) crosses above 30", "RSI below 30"
  for (const m of t.matchAll(new RegExp(`rsi\\s*\\(?(\\d+)?\\)?\\s*(?:is\\s*)?(crosses\\s*|drops\\s*|falls\\s*|rises\\s*)?(below|under|above|over|<|>)\\s*${NUM}`, 'g'))) {
    const crossing = !!m[2] && /cross|drop|fall|rise/.test(m[2]);
    conds.push(cond(ind('RSI', m[1] ? +m[1] : 14), crossing ? (up(m[3]) ? 'crossAbove' : 'crossBelow') : up(m[3]) ? 'gt' : 'lt', val(+m[4])));
  }
  // Price vs moving average: "price is above the 200 EMA", "close crosses above the 20 EMA"
  for (const m of t.matchAll(/(?:price|close|it)\s*(?:is\s*)?(crosses\s*|closes\s*)?(above|over|below|under)\s*(?:the\s*)?(?:(\d+)\s*(ema|sma|ma)|(ema|sma|ma)\s*\(?(\d+)\)?)/g)) {
    const kind = (m[4] || m[5]) === 'ema' ? 'EMA' : 'SMA', p = +(m[3] || m[6]);
    conds.push(cond(price(), m[1] && /cross/.test(m[1]) ? (up(m[2]) ? 'crossAbove' : 'crossBelow') : up(m[2]) ? 'gt' : 'lt', ind(kind, p)));
  }
  // VWAP
  for (const m of t.matchAll(/(crosses\s*)?(above|over|below|under)\s*(?:the\s*)?vwap/g)) {
    conds.push(cond(price(), m[1] ? (up(m[2]) ? 'crossAbove' : 'crossBelow') : up(m[2]) ? 'gt' : 'lt', ind('VWAP')));
  }
  // Yesterday's high / low
  const pd = t.match(/(previous|prior|yesterday'?s?)\s*(?:day'?s?\s*)?(high|low)/);
  if (pd) conds.push(pd[2] === 'high' ? cond(price(), 'crossAbove', ind('PDH')) : cond(price(), 'crossBelow', ind('PDL')));
  // Session range: "Asian range high", "London session high"
  const sr = t.match(/(asia|asian|london|new york|ny)\s*(?:session\s*)?(?:range\s*)?(high|low)/);
  if (sr) {
    const s = /asia/.test(sr[1]) ? 'asia' : /london/.test(sr[1]) ? 'london' : 'ny';
    conds.push(sr[2] === 'high' ? cond(price(), 'crossAbove', ind('SESSION_HIGH', undefined, s)) : cond(price(), 'crossBelow', ind('SESSION_LOW', undefined, s)));
  }
  // N-bar breakout: "20-bar high", "breaks the 10 candle low"
  const nb = t.match(/(\d+)[\s-]*(?:bar|candle|period)s?\s*(high|low)/);
  if (nb) conds.push(nb[2] === 'high' ? cond(price(), 'crossAbove', ind('HIGHEST', +nb[1])) : cond(price(), 'crossBelow', ind('LOWEST', +nb[1])));
  // Fair value gap
  if (/fair value gap|\bfvg\b/.test(t)) conds.push(cond(ind(/bearish/.test(t) ? 'FVG_BEAR' : 'FVG_BULL'), 'gt', val(0.5)));

  if (!conds.length) return { ok: false, message: `I couldn't find an entry rule. Name an indicator or level to watch, for example: "${EXAMPLE}"` };

  // Rules describe the long side; if the user only wrote short rules, store their mirror.
  const entry = direction === 'short' ? conds.map(mirrorCondition) : conds;

  const stopAtr = t.match(new RegExp(`stop(?:\\s*loss)?\\s*(?:at|of|=)?\\s*${NUM}\\s*(?:x\\s*|×\\s*)?atr`));
  const stopPts = t.match(new RegExp(`stop(?:\\s*loss)?\\s*(?:at|of|=)?\\s*${NUM}\\s*(pips?|ticks?|points?)`));
  const stop: StrategyRules['exits']['stop'] = stopAtr ? { type: 'atr', mult: +stopAtr[1] } : stopPts ? { type: 'points', value: +stopPts[1] } : /swing/.test(t) ? { type: 'swing', lookback: 10 } : { type: 'atr', mult: 1.5 };
  if (!stopAtr && !stopPts && !/swing/.test(t)) notes.push('No stop loss given, so I used 1.5 × ATR. Change it in the rule builder if you like.');

  const tgt = t.match(new RegExp(`(?:target|take profit|tp)\\s*(?:at|of|=)?\\s*${NUM}\\s*r\\b`)) || t.match(new RegExp(`${NUM}\\s*r\\s*(?:target|take profit)`));
  const rr = t.match(/1\s*:\s*(\d+(?:\.\d+)?)/);
  const targetR = tgt ? +tgt[1] : rr ? +rr[1] : /no target|without a target/.test(t) ? null : 2;
  if (!tgt && !rr && targetR === 2) notes.push('No target given, so I used 2R.');

  const be = t.match(new RegExp(`breakeven\\s*(?:at|after)?\\s*\\+?${NUM}\\s*r`)) || t.match(new RegExp(`${NUM}\\s*r[^.]*break\\s?even`));
  const part = t.match(new RegExp(`(?:close|take|scale out)\\s*(half|${NUM}%)\\s*(?:of the position\\s*)?(?:at)?\\s*${NUM}\\s*r`));
  const timeEx = t.match(/after\s*(\d+)\s*(?:bars|candles)/);
  const perDay = t.match(/(\d+)\s*trades?\s*(?:a|per)\s*day/);

  const rules: StrategyRules = {
    direction,
    entry,
    entryOrder: /limit/.test(t) ? { type: 'limit', offsetAtr: 0.3, validBars: 3 } : { type: 'market' },
    exits: {
      stop,
      targetR,
      breakevenAtR: be ? +be[1] : null,
      breakevenLockR: 0,
      trailing: /trail/.test(t) ? { atrMult: 2, startR: 1 } : null,
      partial: part ? { atR: +part[3], fraction: part[1] === 'half' ? 0.5 : +part[2] / 100 } : null,
      timeExitBars: timeEx ? +timeEx[1] : null,
      sessionEndExit: /session end|end of (?:the )?session|end of (?:the )?day|before the close|close by/.test(t),
    },
    maxTradesPerDay: perDay ? +perDay[1] : null,
  };

  const extras: Extract<ParseResult, { ok: true }>['extras'] = {};
  if (/london/.test(t) && !sr) extras.session = { id: 'london', start: 7, end: 16 };
  else if (/new york|\bny\b/.test(t) && !sr) extras.session = { id: 'ny', start: 12, end: 21 };
  else if (/\basia/.test(t) && !sr) extras.session = { id: 'asia', start: 0, end: 7 };
  const tf = t.match(/\b(5|15)\s*(?:m|min|minute)\b|\b(1|4)\s*(?:h|hr|hour)\b|\b(daily|1d)\b/);
  if (tf) extras.timeframe = tf[1] ? (tf[1] === '5' ? '5m' : '15m') : tf[2] ? (tf[2] === '1' ? '1h' : '4h') : '1D';
  if (/(skip|avoid|no)\s*(high[- ]impact\s*)?news/.test(t)) extras.news = 'skip';
  else if (/news (days )?only|only on news|trade the news/.test(t)) extras.news = 'only';
  return { ok: true, rules, notes, extras };
}

export const PARSE_EXAMPLE = EXAMPLE;
