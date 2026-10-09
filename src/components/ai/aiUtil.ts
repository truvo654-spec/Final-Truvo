import { MarketSignal } from '../../types';
import { AiMessage, RangeDays } from './aiTypes';
import { escapeRe } from './aiKnowledge';

let counter = 0;
export const mid = () => `m${Date.now()}_${counter++}`;

export const money = (v: number) => `${v < 0 ? '-' : v > 0 ? '+' : ''}$${Math.abs(v).toFixed(0)}`;
export const pct = (v: number, d = 0) => `${v.toFixed(d)}%`;
export const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const plural = (n: number, w: string) => `${n} ${n === 1 ? w : /[^aeiou]y$/.test(w) ? `${w.slice(0, -1)}ies` : `${w}s`}`;
export const tone = (v: number): 'good' | 'bad' | 'neutral' => (v > 0 ? 'good' : v < 0 ? 'bad' : 'neutral');

export const whenBkk = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });

/* ───────────── Instruments ───────────── */

export interface Instrument {
  symbol: string;
  label: string;
  aliases: string[];
  ccy: string[];
  cls: 'Forex' | 'Crypto' | 'Commodity' | 'Indices' | 'Stocks';
}

export const INSTRUMENTS: Instrument[] = [
  { symbol: 'EUR/USD', label: 'EUR/USD', aliases: ['eurusd', 'eur/usd', 'eur usd', 'euro', 'fiber'], ccy: ['EUR', 'USD'], cls: 'Forex' },
  { symbol: 'GBP/USD', label: 'GBP/USD', aliases: ['gbpusd', 'gbp/usd', 'gbp usd', 'cable', 'sterling'], ccy: ['GBP', 'USD'], cls: 'Forex' },
  { symbol: 'USD/JPY', label: 'USD/JPY', aliases: ['usdjpy', 'usd/jpy', 'usd jpy', 'yen'], ccy: ['USD', 'JPY'], cls: 'Forex' },
  { symbol: 'GBP/JPY', label: 'GBP/JPY', aliases: ['gbpjpy', 'gbp/jpy', 'gbp jpy'], ccy: ['GBP', 'JPY'], cls: 'Forex' },
  { symbol: 'USD/CAD', label: 'USD/CAD', aliases: ['usdcad', 'usd/cad', 'usd cad', 'loonie'], ccy: ['USD', 'CAD'], cls: 'Forex' },
  { symbol: 'XAU/USD', label: 'Gold (XAU/USD)', aliases: ['xauusd', 'xau/usd', 'xau', 'gold'], ccy: ['USD'], cls: 'Commodity' },
  { symbol: 'BTC/USDT', label: 'Bitcoin (BTC)', aliases: ['btcusdt', 'btc/usdt', 'btc', 'bitcoin'], ccy: [], cls: 'Crypto' },
  { symbol: 'ETH/USDT', label: 'Ethereum (ETH)', aliases: ['ethusdt', 'eth/usdt', 'eth', 'ethereum', 'ether'], ccy: [], cls: 'Crypto' },
  { symbol: 'SOL/USDT', label: 'Solana (SOL)', aliases: ['solusdt', 'sol/usdt', 'solana'], ccy: [], cls: 'Crypto' },
  { symbol: 'NVDA', label: 'NVIDIA (NVDA)', aliases: ['nvda', 'nvidia'], ccy: ['USD'], cls: 'Stocks' },
  { symbol: 'US500', label: 'S&P 500 (US500)', aliases: ['us500', 'sp500', 's&p 500', 's&p500', 's&p', 'spx'], ccy: ['USD'], cls: 'Indices' },
];

export function findInstrument(q: string, signals: MarketSignal[] = []): Instrument | undefined {
  const t = q.toLowerCase();
  let best: { i: Instrument; len: number } | undefined;
  for (const i of INSTRUMENTS) {
    for (const a of i.aliases) {
      const re = new RegExp(`(^|[^a-z0-9])${escapeRe(a)}([^a-z0-9]|$)`, 'i');
      if (re.test(t) && (!best || a.length > best.len)) best = { i, len: a.length };
    }
  }
  if (best) return best.i;
  const sig = signals.find((s) => t.includes(s.ticker.toLowerCase().replace('/', '')) || t.includes(s.ticker.toLowerCase()));
  if (sig) return INSTRUMENTS.find((i) => i.symbol === sig.ticker) ?? { symbol: sig.ticker, label: sig.ticker, aliases: [sig.ticker.toLowerCase()], ccy: [], cls: sig.assetClass };
  return undefined;
}

export const instrumentBySymbol = (symbol: string) => INSTRUMENTS.find((i) => i.symbol === symbol);

export function findAssetClass(q: string): Instrument['cls'] | undefined {
  const t = q.toLowerCase();
  if (/\b(forex|fx|currenc(y|ies))\b/.test(t)) return 'Forex';
  if (/\b(crypto|cryptos|cryptocurrenc(y|ies)|coins?)\b/.test(t)) return 'Crypto';
  if (/\b(commodit(y|ies)|metals?|oil)\b/.test(t)) return 'Commodity';
  if (/\b(stocks?|equit(y|ies)|shares)\b/.test(t)) return 'Stocks';
  if (/\b(index|indices|indexes)\b/.test(t)) return 'Indices';
  return undefined;
}

export function parseRange(q: string): RangeDays | null {
  const t = q.toLowerCase();
  if (/\b(7|seven)\s?(-|\s)?(days?|d)\b|\blast week\b|\bthis week\b|\bpast week\b|\b1w\b/.test(t)) return 7;
  if (/\b(90|ninety)\s?(-|\s)?(days?|d)\b|\b3 months?\b|\bthree months?\b|\bquarter\b|\b3m\b/.test(t)) return 90;
  if (/\b(30|thirty)\s?(-|\s)?(days?|d)\b|\blast month\b|\bthis month\b|\bpast month\b|\b1m\b/.test(t)) return 30;
  return null;
}

export const personalOff = (what: string, which: 'trades' | 'journal'): AiMessage => ({
  id: mid(),
  role: 'ai',
  heading: 'That data is switched off',
  paragraphs: [`I can look at ${what}, but “Use my ${which === 'trades' ? 'portfolio trades' : 'journal'}” is turned off. Switch it on in the privacy panel and ask again.`],
  followUps: ['Give me today’s briefing', 'Which broker suits me?'],
});

export const levelIndex = (l: string) => (l === 'Beginner' ? 0 : l === 'Intermediate' ? 1 : 2);

export function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}
