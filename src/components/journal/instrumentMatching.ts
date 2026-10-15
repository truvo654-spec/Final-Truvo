import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { InstrumentPattern, InstrumentPatternSetup } from '../../data/instrumentPatterns';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { DATA_END } from '../../backtest/config';
import { dayMs, marketData, parseDay, resolveSymbol } from '../../backtest/marketData';
import type { Series, Timeframe } from '../../backtest/types';
import { TF_MS } from '../../backtest/types';
import { evaluateTechnicalRules, validateTechnicalRules } from './technicalPatternRules';

export interface PlaybookInstrument { symbol: string; name: string; market: PortfolioAssetClass }
export const INSTRUMENT_MARKETS: PortfolioAssetClass[] = ['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks'];
const catalog = (market: PortfolioAssetClass, rows: [string, string][]): PlaybookInstrument[] => rows.map(([symbol, name]) => ({ symbol, name, market }));
export const PLAYBOOK_INSTRUMENTS = [
  ...catalog('Forex', [['EUR/USD','Euro / US Dollar'],['GBP/USD','British Pound / US Dollar'],['USD/JPY','US Dollar / Japanese Yen'],['GBP/JPY','British Pound / Japanese Yen'],['USD/CAD','US Dollar / Canadian Dollar'],['AUD/USD','Australian Dollar / US Dollar'],['NZD/USD','New Zealand Dollar / US Dollar'],['USD/CHF','US Dollar / Swiss Franc'],['EUR/JPY','Euro / Japanese Yen']]),
  ...catalog('Indices', [['NAS100','Nasdaq 100'],['US500','S&P 500'],['US30','Dow Jones 30'],['GER40','Germany 40'],['UK100','UK 100'],['JP225','Japan 225']]),
  ...catalog('Commodity', [['XAU/USD','Gold / US Dollar'],['XAG/USD','Silver / US Dollar'],['WTI','WTI crude oil'],['BRENT','Brent crude oil']]),
  ...catalog('Crypto', [['BTC/USDT','Bitcoin / Tether'],['ETH/USDT','Ethereum / Tether'],['SOL/USDT','Solana / Tether'],['XRP/USDT','XRP / Tether']]),
  ...catalog('Stocks', [['NVDA','NVIDIA'],['AAPL','Apple'],['MSFT','Microsoft'],['TSLA','Tesla'],['GOOGL','Alphabet'],['AMZN','Amazon'],['META','Meta Platforms']]),
];
const key = (symbol: string) => symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
export function knownInstrument(symbol: string) {
  const source = resolveSymbol(symbol.trim().toUpperCase());
  return PLAYBOOK_INSTRUMENTS.find(i => key(i.symbol) === key(symbol))
    || (source ? PLAYBOOK_INSTRUMENTS.find(i => resolveSymbol(i.symbol) === source) : undefined);
}
export const canonicalInstrument = (symbol: string) => knownInstrument(symbol)?.symbol || symbol.trim().toUpperCase();
export function instrumentMarket(symbol: string, playbook: JournalPlaybook): PortfolioAssetClass | undefined {
  return knownInstrument(symbol)?.market || playbook.instrumentMarkets?.[canonicalInstrument(symbol)] || (playbook.markets.length === 1 ? playbook.markets[0] : undefined);
}

/** Normalizes and deduplicates while preserving the journal-facing symbol names. */
export function instrumentSelection(symbols: string[], assigned: Record<string, PortfolioAssetClass>) {
  const next = [...new Set(symbols.map(canonicalInstrument))];
  return { symbols: next, instrumentMarkets: Object.fromEntries(next.flatMap(s => {
    const market = knownInstrument(s)?.market || assigned[s];
    return market ? [[s, market]] : [];
  })) as Record<string, PortfolioAssetClass> };
}

/** Add newly selected market categories without discarding the playbook's existing scope. */
export function playbookInstrumentSelection(playbook: JournalPlaybook, symbols: string[], assigned: Record<string, PortfolioAssetClass>) {
  const selection = instrumentSelection(symbols, assigned);
  const included = new Set([...playbook.markets, ...Object.values(selection.instrumentMarkets)]);
  return { ...selection, markets: INSTRUMENT_MARKETS.filter(market => included.has(market)) };
}

export type { InstrumentPattern, InstrumentPatternSetup } from '../../data/instrumentPatterns';
export const PATTERN_LABELS: Record<InstrumentPattern, string> = { trend: 'Trend continuation', breakout: 'Range breakout', range: 'Mean reversion', custom: 'Custom technical setup' };
export function newInstrumentPattern(pattern: InstrumentPattern): InstrumentPatternSetup {
  return { id: '', name: '', pattern, direction: 'either', lookbackBars: 120, minFit: 60, minVolumeRatio: 0, minBreakoutAtr: 0 };
}
export function validateInstrumentPattern(setup: InstrumentPatternSetup, others: InstrumentPatternSetup[] = []): string | null {
  if (!setup.name.trim() || setup.name.trim().length > 60) return 'Enter a pattern name of 1–60 characters.';
  if (others.some(other => other.id !== setup.id && other.name.trim().toLowerCase() === setup.name.trim().toLowerCase())) return 'A setup pattern with this name already exists.';
  if (!Object.hasOwn(PATTERN_LABELS, setup.pattern)) return 'Choose a pattern type.';
  if (!Number.isInteger(setup.lookbackBars) || setup.lookbackBars < 60 || setup.lookbackBars > 240) return 'Use a sample window of 60–240 whole candles.';
  if (!Number.isFinite(setup.minFit) || setup.minFit < 0 || setup.minFit > 100) return 'Minimum fit must be between 0 and 100.';
  if (setup.pattern === 'custom') return validateTechnicalRules(setup);
  if (!['either', 'bullish', 'bearish'].includes(setup.direction)) return 'Choose an EMA direction.';
  if (!Number.isFinite(setup.minVolumeRatio) || setup.minVolumeRatio < 0 || setup.minVolumeRatio > 5) return 'Minimum volume must be between 0 and 5× the preceding 20-candle average.';
  if (!Number.isFinite(setup.minBreakoutAtr) || setup.minBreakoutAtr < 0 || setup.minBreakoutAtr > 3) return 'The breakout buffer must be between 0 and 3 ATR.';
  return null;
}
export function playbookPattern(playbook: JournalPlaybook): InstrumentPattern {
  const identity = `${playbook.name} ${playbook.style}`.toLowerCase();
  if (/mean.rever|range.fade/.test(identity)) return 'range';
  if (/breakout|momentum|scalp/.test(identity)) return 'breakout';
  if (/trend|pullback|swing/.test(identity)) return 'trend';
  const text = `${playbook.name} ${playbook.style} ${playbook.thesis} ${playbook.tags.join(' ')}`.toLowerCase();
  if (/mean.rever|range.fade|fade the|range extremes/.test(text)) return 'range';
  if (/breakout|momentum|displacement|range break/.test(text)) return 'breakout';
  return 'trend';
}
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const avg = (values: number[]) => values.reduce((a,b) => a+b, 0) / values.length;

/** Measures completed sample bars only; fit is a heuristic, never a win probability. */
export function measureInstrumentPattern(series: Series, pattern: InstrumentPattern, cutoffMs: number, setup?: InstrumentPatternSetup) {
  if (setup && (validateInstrumentPattern(setup) || setup.pattern !== pattern)) return null;
  const indices = Array.from({ length: series.length }, (_, i) => i).filter(i => series.t[i] + TF_MS[series.tf] <= cutoffMs).slice(-(setup?.lookbackBars ?? 120));
  if (indices.length < 60) return null;
  if (setup && indices.length < setup.lookbackBars) return null;
  if (indices.some(i => ![series.o[i],series.h[i],series.l[i],series.c[i],series.v[i]].every(Number.isFinite) || series.v[i] < 0 || series.l[i] <= 0 || series.h[i] < Math.max(series.o[i], series.c[i]) || series.l[i] > Math.min(series.o[i], series.c[i]))) return null;
  if (pattern === 'custom') {
    if (!setup) return null;
    const evidence = evaluateTechnicalRules(series,indices,setup);
    return evidence ? {...evidence,bars:indices.length,from:series.t[indices[0]],to:series.t[indices.at(-1)!]+TF_MS[series.tf]} : null;
  }
  const closes = indices.map(i => series.c[i]);
  const trs = indices.slice(1).map((i, j) => Math.max(series.h[i] - series.l[i], Math.abs(series.h[i] - closes[j]), Math.abs(series.l[i] - closes[j])));
  const atr = avg(trs.slice(-14));
  if (!(atr > 0)) return null;
  const ema = (period: number) => closes.reduce((value, close) => value + 2 / (period + 1) * (close - value), closes[0]);
  const fast = ema(20), slow = ema(50), last = closes.at(-1)!;
  const traveled = closes.slice(1).reduce((sum, close, i) => sum + Math.abs(close-closes[i]), 0);
  const efficiency = traveled ? Math.abs(last-closes[0])/traveled : 0;
  const strength = Math.abs(fast-slow)/atr;
  const previous = indices.slice(-21, -1);
  const high = Math.max(...previous.map(i => series.h[i])), low = Math.min(...previous.map(i => series.l[i]));
  const location = high > low ? clamp((last-low)/(high-low)) : 0.5;
  const breakout = Math.max(0, last-high, low-last)/atr;
  const previousAtr = avg(trs.slice(-44,-14));
  const compression = previousAtr > 0 ? atr/previousAtr : 1;
  const volumes = previous.map(i => series.v[i]);
  const volumeRatio = avg(volumes) > 0 ? series.v[indices.at(-1)!]/avg(volumes) : 0;
  const score = Math.round(100 * (pattern === 'trend'
    ? 0.6 * clamp(strength/2) + 0.4 * efficiency
    : pattern === 'range'
      ? 0.55 * (1-efficiency) + 0.25 * (1-clamp(strength/2)) + 0.2 * Math.abs(location-0.5)*2
      : 0.5 * clamp(breakout) + 0.25 * clamp(1-compression) + 0.25 * clamp(volumeRatio/2)));
  if (setup && (score < setup.minFit || volumeRatio < setup.minVolumeRatio
    || (setup.direction === 'bullish' && fast <= slow) || (setup.direction === 'bearish' && fast >= slow)
    || (pattern === 'breakout' && breakout < setup.minBreakoutAtr))) return null;
  const reasons = pattern === 'trend'
    ? [`20/50 EMA separation: ${strength.toFixed(2)} ATR · ${fast >= slow ? 'upward' : 'downward'} structure.`, `Directional efficiency: ${(efficiency*100).toFixed(0)}% over ${indices.length} sample bars.`]
    : pattern === 'range'
      ? [`Range behavior: ${((1-efficiency)*100).toFixed(0)}% path overlap; EMA separation ${strength.toFixed(2)} ATR.`, `Close sits at ${(location*100).toFixed(0)}% of the preceding 20-bar range.`]
      : [breakout > 0 ? `Close extends ${breakout.toFixed(2)} ATR beyond the preceding 20-bar range.` : 'No confirmed range break in the final sample candle.', `Recent / prior ATR: ${compression.toFixed(2)}× · final / average volume: ${volumeRatio.toFixed(2)}×.`];
  if (setup) reasons.push(`“${setup.name.trim()}” rules passed: fit ≥ ${setup.minFit}, EMA direction ${setup.direction}, volume ≥ ${setup.minVolumeRatio}×${pattern === 'breakout' ? `, range break ≥ ${setup.minBreakoutAtr} ATR` : ''}.`);
  return { score, reasons, bars: indices.length, from: series.t[indices[0]], to: series.t[indices.at(-1)!] + TF_MS[series.tf] };
}

export interface InstrumentSuggestion extends PlaybookInstrument {
  sourceSymbol: string; pattern: InstrumentPattern; timeframe: Timeframe;
  score: number; reasons: string[]; bars: number; from: number; to: number; journalCount: number;
}
export async function suggestPlaybookInstruments(playbook: JournalPlaybook, entries: JournalEntry[], options: {
  market: PortfolioAssetClass; pattern: InstrumentPattern; timeframe: '1h' | '4h' | '1D'; asOf: string; setup?: InstrumentPatternSetup;
}, provider: Pick<typeof marketData, 'getSeries'> = marketData): Promise<InstrumentSuggestion[]> {
  if (!INSTRUMENT_MARKETS.includes(options.market)) return [];
  if (options.setup && (validateInstrumentPattern(options.setup) || options.setup.pattern !== options.pattern)) return [];
  const cutoff = Math.min(parseDay(options.asOf) + dayMs, parseDay(DATA_END) + dayMs);
  if (!Number.isFinite(cutoff)) return [];
  const candidates = PLAYBOOK_INSTRUMENTS.filter(i => i.market === options.market && resolveSymbol(i.symbol));
  const result: InstrumentSuggestion[] = [];
  for (const instrument of candidates) {
    const sourceSymbol = resolveSymbol(instrument.symbol)!;
    // Include weekends and closed sessions so long daily windows have enough bars.
    const historyDays = Math.max(180, Math.ceil(((options.setup?.lookbackBars ?? 120) + 20) * TF_MS[options.timeframe] / dayMs * 1.6));
    const series = await provider.getSeries(sourceSymbol, options.timeframe, cutoff-historyDays*dayMs, cutoff);
    const evidence = measureInstrumentPattern(series, options.pattern, cutoff, options.setup);
    if (!evidence) continue;
    const journalCount = entries.filter(e => e.strategy === playbook.name && e.assetClass === instrument.market && canonicalInstrument(e.symbol) === instrument.symbol && e.date <= options.asOf).length;
    result.push({ ...instrument, ...evidence, sourceSymbol, pattern: options.pattern, timeframe: options.timeframe, journalCount });
  }
  return result.sort((a,b) => b.score-a.score || b.journalCount-a.journalCount || a.symbol.localeCompare(b.symbol));
}
