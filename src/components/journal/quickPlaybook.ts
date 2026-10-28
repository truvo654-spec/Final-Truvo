import type { JournalPlaybook } from '../../data/journalPlaybooks';
import type { JournalEntry, PortfolioAssetClass } from '../../types';
import { canonicalInstrument, instrumentMarket, instrumentSelection, knownInstrument, PLAYBOOK_INSTRUMENTS } from './instrumentMatching';
import type { PlaybookRecommendation } from './playbookRecommendations';

export function uniquePlaybookName(baseName: string, existingNames: string[]): string {
  const taken = new Set(existingNames.map(name => name.trim().toLowerCase()));
  let name = baseName.trim();
  let suffix = 2;
  while (taken.has(name.toLowerCase())) name = `${baseName.trim()} (${suffix++})`;
  return name;
}

export function quickInstrumentCandidates(markets: PortfolioAssetClass[], entries: JournalEntry[]) {
  const journal = entries.map(entry => ({
    symbol: canonicalInstrument(entry.symbol),
    name: knownInstrument(entry.symbol)?.name || 'From your journal',
    market: knownInstrument(entry.symbol)?.market || entry.assetClass,
  }));
  const candidates = [...journal, ...PLAYBOOK_INSTRUMENTS].filter(item => item.symbol && markets.includes(item.market));
  return [...new Map(candidates.map(item => [item.symbol, item])).values()];
}

export function prepareQuickDraft(draft: JournalPlaybook, entries: JournalEntry[]): JournalPlaybook {
  const assignments: Record<string, PortfolioAssetClass> = {};
  for (const [symbol, market] of Object.entries(draft.instrumentMarkets || {})) assignments[canonicalInstrument(symbol)] = market;
  for (const entry of entries) {
    const symbol = canonicalInstrument(entry.symbol);
    if (!assignments[symbol]) assignments[symbol] = knownInstrument(symbol)?.market || entry.assetClass;
  }
  for (const symbol of draft.symbols || []) {
    const normalized = canonicalInstrument(symbol);
    const market = instrumentMarket(symbol, draft);
    if (!assignments[normalized] && market) assignments[normalized] = market;
  }
  return { ...draft, ...instrumentSelection(draft.symbols || [], assignments) };
}

export function recommendationQuickDraft(recommendation: PlaybookRecommendation, entries: JournalEntry[], existingNames: string[], createdAt: string): JournalPlaybook {
  const draft = prepareQuickDraft({
    ...recommendation.draft,
    name: uniquePlaybookName(recommendation.draft.name, existingNames),
    status: 'draft',
    createdAt: recommendation.draft.createdAt || createdAt,
  }, entries);
  if (draft.symbols?.length) return draft;
  const suggestion = quickInstrumentCandidates(draft.markets, entries)[0];
  return suggestion
    ? { ...draft, ...instrumentSelection([suggestion.symbol], { [suggestion.symbol]: suggestion.market }) }
    : draft;
}

export function toggleQuickMarket(draft: JournalPlaybook, market: PortfolioAssetClass): JournalPlaybook {
  if (!draft.markets.includes(market)) return { ...draft, markets: [...draft.markets, market] };
  const symbols = (draft.symbols || []).filter(symbol => instrumentMarket(symbol, draft) !== market);
  return {
    ...draft,
    markets: draft.markets.filter(item => item !== market),
    symbols,
    instrumentMarkets: Object.fromEntries(Object.entries(draft.instrumentMarkets || {}).filter(([symbol]) => symbols.includes(symbol))),
  };
}
