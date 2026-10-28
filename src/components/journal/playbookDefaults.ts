import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { PortfolioAssetClass, JournalEntry } from '../../types';
import { canonicalInstrument, knownInstrument } from './instrumentMatching';

type Template = {
  name: string;
  style: string;
  markets: PortfolioAssetClass[];
  thesis: string;
  rules: string[];
};

export const PLAYBOOK_STARTERS: Template[] = [
  { name: 'Breakout', style: 'Momentum', markets: ['Forex', 'Indices'], thesis: 'Trade a confirmed break of a well-defined range.', rules: ['Mark a tested range', 'Wait for a close outside the range', 'Confirm room to the target', 'Place the stop beyond invalidation'] },
  { name: 'Trend Pullback', style: 'Trend', markets: ['Forex', 'Indices'], thesis: 'Join an established trend after a pullback and confirmation.', rules: ['Identify the prevailing trend', 'Wait for a pullback into value', 'Confirm the trend has resumed', 'Place the stop beyond the pullback'] },
  { name: 'Scalping', style: 'Scalp', markets: ['Forex', 'Indices'], thesis: 'Take a short-duration setup with defined risk and an exit plan.', rules: ['Check liquidity and spread', 'Wait for the entry trigger', 'Size the position to the stop', 'Exit at the planned target or stop'] },
  { name: 'Swing', style: 'Swing', markets: ['Forex', 'Stocks'], thesis: 'Follow a higher-timeframe move with a defined invalidation level.', rules: ['Identify the higher-timeframe direction', 'Wait for a pullback or break', 'Check upcoming events', 'Plan the stop and target'] },
  { name: 'Range Reversal', style: 'Mean reversion', markets: ['Forex', 'Crypto'], thesis: 'Trade a rejection at the edge of an established range.', rules: ['Identify an established range', 'Wait for rejection at an edge', 'Check for nearby news', 'Plan the stop outside the range'] },
  { name: 'News Momentum', style: 'Momentum', markets: ['Forex', 'Indices'], thesis: 'Wait for price acceptance after a scheduled news event.', rules: ['Identify the scheduled event', 'Wait for the initial volatility', 'Confirm direction and spread', 'Define the stop and target'] },
];

export function starterFor(name: string): Template {
  const text = name.toLowerCase();
  return PLAYBOOK_STARTERS.find(t => t.name.toLowerCase() === text.trim())
    || (/scalp/.test(text) ? PLAYBOOK_STARTERS[2] : /swing/.test(text) ? PLAYBOOK_STARTERS[3] : /revers|range/.test(text) ? PLAYBOOK_STARTERS[4] : /pullback|trend/.test(text) ? PLAYBOOK_STARTERS[1] : /news/.test(text) ? PLAYBOOK_STARTERS[5] : /breakout/.test(text) ? PLAYBOOK_STARTERS[0] : {
      name: 'Custom', style: 'Custom', markets: [], thesis: 'Define the setup, confirmation and risk before trading.',
      rules: ['Define the setup', 'Wait for confirmation', 'Size the position to the stop', 'Plan the target before entry'],
    });
}

export function nextPlaybookId(playbooks: JournalPlaybook[]): string {
  const taken = new Set(playbooks.map(book => book.id));
  const numeric = playbooks.map(book => /^PB-(\d+)$/.exec(book.id)?.[1]).filter((value): value is string => value !== undefined).map(Number).filter(Number.isSafeInteger);
  let number = Math.max(0, ...numeric) + 1;
  while (taken.has(`PB-${String(number).padStart(3, '0')}`)) number++;
  return `PB-${String(number).padStart(3, '0')}`;
}

export function popularFromHistory(entries: JournalEntry[], markets: PortfolioAssetClass[]) {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (!markets.includes(entry.assetClass) || !entry.symbol.trim()) continue;
    const symbol = canonicalInstrument(entry.symbol);
    if (knownInstrument(symbol) && knownInstrument(symbol)?.market !== entry.assetClass) continue;
    counts.set(symbol, (counts.get(symbol) || 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([symbol]) => symbol);
}

export function defaultPlaybook(name: string, markets: PortfolioAssetClass[], symbols: string[], house: { maxRisk: number; maxTrades: number }, id: string, now: Date): JournalPlaybook {
  const starter = starterFor(name);
  const window = markets.length === 1 && markets[0] === 'Crypto' ? null : { start: 12, end: 16, label: 'London / NY overlap' };
  const instrumentMarkets: Record<string, PortfolioAssetClass> = {};
  for (const symbol of symbols) {
    const market = knownInstrument(symbol)?.market;
    if (market) instrumentMarkets[canonicalInstrument(symbol)] = market;
  }
  return {
    id, name: name.trim(), grade: null, status: 'active', style: starter.style, markets, symbols, instrumentMarkets, window,
    benchmarkRR: starter.style === 'Scalp' ? 1.5 : 2, thesis: starter.thesis,
    rules: starter.rules.map((title, index) => ({ id: `r${index + 1}`, title, detail: '' })),
    entryTrigger: starter.rules[1], stopRule: starter.rules.at(-1) || '', targetRule: 'Plan the target before entry.',
    tags: [], createdAt: now.toISOString().slice(0, 10), riskPerTrade: house.maxRisk, maxTradesPerDay: house.maxTrades,
  };
}
