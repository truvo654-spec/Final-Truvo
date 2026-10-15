import type { JournalPlaybook, PlaybookStatus } from '../../data/journalPlaybooks';
import type { PortfolioAssetClass } from '../../types';

export type InventoryStatus = 'all' | PlaybookStatus;
export function filterPlaybookInventory(playbooks: JournalPlaybook[], market: 'all' | PortfolioAssetClass, query: string, status: InventoryStatus = 'all') {
  const q = query.trim().toLowerCase();
  return playbooks.filter(p => (status === 'all' || p.status === status)
    && (market === 'all' || p.markets.includes(market))
    && (!q || [p.name, p.style, p.thesis, ...p.tags, ...p.rules.map(r => r.title), ...(p.symbols || []), ...(p.scenarios || []).map(s => `${s.symbol} ${s.hypothesis}`)].some(value => value.toLowerCase().includes(q))));
}
