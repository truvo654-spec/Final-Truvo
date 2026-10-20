import { PV_PER_POINT } from './rewardRules';

/**
 * One source for how many points a traded lot is worth.
 * The figures match the published table on the Level & Points guide, so the
 * guide and the app can never drift apart again.
 */
export interface InstrumentPointRate {
  symbol: string;
  category: 'forex' | 'indices' | 'commodities' | 'cryptos';
  /** Points for one standard lot before any booster. */
  points: number;
  /** A booster currently running on this instrument. */
  booster?: number;
}

export const POINTS_PER_LOT: InstrumentPointRate[] = [
  { symbol: 'EUR/USD', category: 'forex', points: 50, booster: 1.25 },
  { symbol: 'USD/JPY', category: 'forex', points: 50 },
  { symbol: 'EUR/JPY', category: 'forex', points: 50 },
  { symbol: 'AUD/USD', category: 'forex', points: 50 },
  { symbol: 'CHF/USD', category: 'forex', points: 50, booster: 1.25 },
  { symbol: 'EUR/GBP', category: 'forex', points: 50, booster: 1.25 },
  { symbol: 'GBP/JPY', category: 'forex', points: 50 },
  { symbol: 'CAD/USD', category: 'forex', points: 50, booster: 1.25 },
  { symbol: 'AUD/JPY', category: 'forex', points: 50 },
  { symbol: 'CAD/JPY', category: 'forex', points: 50 },
  { symbol: 'NZD/USD', category: 'forex', points: 50 },
  { symbol: 'USD/CHF', category: 'forex', points: 50, booster: 1.25 },
  { symbol: 'US500', category: 'indices', points: 65, booster: 1.25 },
  { symbol: 'NAS100', category: 'indices', points: 60 },
  { symbol: 'GER40', category: 'indices', points: 55 },
  { symbol: 'XAU/USD', category: 'commodities', points: 70, booster: 1.25 },
  { symbol: 'XAG/USD', category: 'commodities', points: 50 },
  { symbol: 'USOIL', category: 'commodities', points: 55 },
  { symbol: 'BTC/USD', category: 'cryptos', points: 75, booster: 1.25 },
  { symbol: 'ETH/USD', category: 'cryptos', points: 60 },
  { symbol: 'SOL/USD', category: 'cryptos', points: 50 },
];

/** Points for an instrument that is not in the table. */
export const DEFAULT_POINTS_PER_LOT = 50;

/**
 * What a trade is worth in Points.
 *
 * The Final Beta sets one rule for every market: a trade becomes one fair
 * dollar figure, its Point Value, and a dollar of Point Value is a Point. The
 * per-instrument rates below are what a lot is worth in Point Value, so a lot
 * of gold and a lot of a currency pair are compared on the same footing
 * rather than each path inventing its own number.
 *
 * Boosts are deliberately not applied here. Partner, Campaign and Consistency
 * Boosts multiply Points, but the member has to see them separately from Base
 * Points, so whatever awards the trade adds them and says so.
 */
export function pointValueForTrade(symbol: string | undefined, lots: number): number {
  const key = (symbol || '').toUpperCase();
  const row = POINTS_PER_LOT.find((r) => r.symbol.toUpperCase() === key)
    ?? POINTS_PER_LOT.find((r) => key.startsWith(r.symbol.split('/')[0].toUpperCase()));
  const perLot = row ? row.points : DEFAULT_POINTS_PER_LOT;
  return Math.max(0, lots) * perLot;
}

/** Base Points for a trade: one Point for each dollar of Point Value. */
export function pointsForTrade(symbol: string | undefined, lots: number): number {
  return Math.max(1, Math.round(pointValueForTrade(symbol, lots) / PV_PER_POINT));
}
