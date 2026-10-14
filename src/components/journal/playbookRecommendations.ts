import type { JournalEntry, PortfolioAssetClass } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { TECHNICAL_STRATEGIES } from '../../backtest/technicalStrategies';
import { describeCondition, IND_LABEL } from '../../backtest/rules';
import { eligible, realizedR, resultOf } from './journalMath';

export const RECOMMENDATION_MARKETS: PortfolioAssetClass[] = ['Forex', 'Indices', 'Commodity', 'Crypto', 'Stocks'];

export interface PlaybookRecommendation {
  id: string;
  market: PortfolioAssetClass;
  title: string;
  description: string;
  evidence: string;
  personalized: boolean;
  kind: 'journal' | 'technical';
  tools: string[];
  draft: JournalPlaybook;
}

const marketName = (market: PortfolioAssetClass) => market === 'Commodity' ? 'Commodities' : market;

const starterDraft = (market: PortfolioAssetClass, name: string, thesis: string): JournalPlaybook => ({
  id: '',
  name,
  grade: 'C',
  style: 'Structured execution',
  status: 'testing',
  markets: [market],
  window: null,
  benchmarkRR: 2,
  thesis,
  rules: [
    { id: 'r1', title: 'Define market context', detail: 'Write the instrument, timeframe, and conditions that make this setup valid.' },
    { id: 'r2', title: 'Require a clear trigger', detail: 'Describe the observable price action that must happen before entry; do not enter on the idea alone.' },
    { id: 'r3', title: 'Set invalidation first', detail: 'Place the stop where the setup is no longer valid, then size the position to your risk limit.' },
    { id: 'r4', title: 'Plan the exit', detail: 'Define the target, minimum reward:risk, and any conditions for managing or closing the trade.' },
  ],
  entryTrigger: 'Write the exact, observable condition that confirms the setup before entry.',
  stopRule: 'Set the stop at the price or condition that invalidates the trade idea.',
  targetRule: 'Set a target and management plan before entry; record the realized R after the trade.',
  tags: ['Marketsyde AI draft', marketName(market)],
  createdAt: '',
});

function summarize(entries: JournalEntry[]) {
  const byStrategy = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const strategy = entry.strategy.trim();
    if (!strategy) continue;
    byStrategy.set(strategy, [...(byStrategy.get(strategy) || []), entry]);
  }

  return [...byStrategy].map(([name, trades]) => {
    const rs = trades.map(realizedR).filter((r): r is number => r !== null && Number.isFinite(r));
    const averageR = rs.length ? rs.reduce((sum, r) => sum + r, 0) / rs.length : null;
    const wins = trades.filter((trade) => resultOf(trade) === 'win').length;
    return { name, trades, count: trades.length, rs, averageR, winRate: trades.length ? wins / trades.length * 100 : null };
  });
}

function mostTradedSymbols(entries: JournalEntry[], strategy: string): string[] {
  const counts = new Map<string, number>();
  entries.filter((entry) => entry.strategy.trim() === strategy).forEach((entry) => {
    counts.set(entry.symbol, (counts.get(entry.symbol) || 0) + 1);
  });
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([symbol]) => symbol);
}

export function buildPlaybookRecommendations(
  entries: JournalEntry[],
  playbooks: JournalPlaybook[],
  createdAt: string,
): PlaybookRecommendation[] {
  const journalRecommendations = RECOMMENDATION_MARKETS.map((market) => {
    const closed = entries.filter((entry) => entry.assetClass === market && eligible(entry));
    const groups = summarize(closed);
    const candidates = groups
      .filter((group) => group.count >= 5 && group.rs.length >= 5 && group.averageR !== null && group.averageR > 0)
      .sort((a, b) => b.averageR! - a.averageR! || b.rs.length - a.rs.length || b.count - a.count);
    const best = candidates[0];

    if (best) {
      const existing = playbooks.find((playbook) => playbook.name.trim().toLowerCase() === best.name.toLowerCase());
      const draft = existing
        ? {
            ...existing,
            id: '',
            name: `${existing.name} · ${marketName(market)}`,
            grade: 'C' as const,
            status: 'testing' as const,
            markets: [market],
            rules: existing.rules.map((rule) => ({ ...rule })),
            symbols: mostTradedSymbols(best.trades, best.name),
            tags: [...new Set([...existing.tags, 'Marketsyde AI draft', 'Journal-guided'])],
            scenarios: [],
            reviews: [],
            createdAt,
          }
        : starterDraft(
            market,
            `${best.name} · ${marketName(market)}`,
            `Your journal has ${best.count} eligible closed ${marketName(market)} trades labeled "${best.name}", with recorded risk on ${best.rs.length} and a positive average of ${best.averageR!.toFixed(2)}R. This draft records the pattern; review and write down the exact rules you used before relying on it.`,
          );
      if (!existing) draft.symbols = mostTradedSymbols(best.trades, best.name);

      return {
        id: `journal-${market}`,
        market,
        title: `Journal pattern: ${best.name}`,
        description: `${best.count} eligible closes · ${best.averageR!.toFixed(2)}R average across ${best.rs.length} trades with recorded R${best.winRate === null ? '' : ` · ${best.winRate.toFixed(0)}% net win rate`}.`,
        evidence: `${best.count} eligible trades · ${best.rs.length} with recorded R`,
        personalized: true,
        kind: 'journal' as const,
        tools: [],
        draft,
      };
    }

    const sample = closed.length;
    const observed = groups.sort((a, b) => b.count - a.count)[0];
    const thesis = observed
      ? `Starter framework for ${marketName(market)}. Your journal contains ${sample} eligible closed trade${sample === 1 ? '' : 's'} in this market; "${observed.name}" is the most frequently recorded label, but there is not enough risk-normalized evidence to rank it. Define the actual conditions you traded and validate them before use.`
      : `Starter framework for ${marketName(market)}. No eligible closed trades were found for this market in the journal data. Define your own setup conditions and validate them before use.`;
    const draft = starterDraft(market, `${marketName(market)} strategy framework`, thesis);
    if (observed) draft.symbols = mostTradedSymbols(observed.trades, observed.name);

    return {
      id: `journal-${market}`,
      market,
      title: sample ? `Build on your ${marketName(market)} journal` : `${marketName(market)} starter framework`,
      description: sample
        ? `${sample} eligible closed trade${sample === 1 ? '' : 's'} found. No setup met the minimum evidence threshold, so this is a fill-in framework—not a performance ranking.`
        : `No eligible closed trades found. Start with a blank, structured framework and add your own tested rules.`,
      evidence: sample ? `${sample} eligible closes · evidence below threshold` : 'No eligible closed trades',
      personalized: false,
      kind: 'journal' as const,
      tools: [],
      draft,
    };
  });

  const technical = TECHNICAL_STRATEGIES.map((scenario) => {
    const market = scenario.market;
    const draft = starterDraft(
      market,
      scenario.name,
      `${scenario.description} This is a technical scenario to test and refine, not evidence of a proven edge.`,
    );
    draft.technicalRecipeId = scenario.id;
    draft.style = scenario.style;
    draft.benchmarkRR = scenario.rules.exits.targetR ?? 2;
    draft.rules = scenario.rules.entry.map((condition, index) => ({
      id: `r${index + 1}`,
      title: `Technical condition ${index + 1}`,
      detail: describeCondition(condition),
    }));
    draft.entryTrigger = scenario.entryTrigger;
    draft.stopRule = scenario.stopRule;
    draft.targetRule = scenario.targetRule;
    draft.tags = [...new Set(['Marketsyde AI draft', 'Technical scenario', scenario.style, ...scenario.tools.map((tool) => IND_LABEL[tool])])];
    draft.createdAt = createdAt;

    return {
      id: scenario.id,
      market,
      title: scenario.name,
      description: scenario.description,
      evidence: `Tools: ${scenario.tools.map((tool) => IND_LABEL[tool]).join(' · ')}`,
      personalized: false,
      kind: 'technical' as const,
      tools: scenario.tools.map((tool) => IND_LABEL[tool]),
      draft,
    };
  });

  return [...journalRecommendations, ...technical];
}
