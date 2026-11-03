import type { Broker, PortfolioAssetClass } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';

const MARKETS_BY_BROKER_CATEGORY: Record<Broker['category'], ReadonlySet<PortfolioAssetClass>> = {
  Forex: new Set(['Forex']),
  'Multi-Asset': new Set(['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks']),
  Crypto: new Set(['Crypto']),
  'Raw Spread': new Set(['Forex']),
};

export const brokerSupportsPlaybookMarkets = (
  broker: Pick<Broker, 'category'>,
  playbook: Pick<JournalPlaybook, 'markets'>,
) => playbook.markets.length === 0 || playbook.markets.every(market => MARKETS_BY_BROKER_CATEGORY[broker.category].has(market));
