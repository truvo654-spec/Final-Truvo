import type { Tier, Visualization } from "./types";

export type TierLevel = 1 | 2 | 3 | 4;

export const tierLevels: TierLevel[] = [1, 2, 3, 4];

export const tierMatrix = [
  { feature: "Market overview", values: ["✓", "✓", "✓", "✓"] },
  { feature: "Basic Instrument Analysis", values: ["✓", "✓", "✓", "✓"] },
  { feature: "24H data", values: ["✓", "✓", "✓", "✓"] },
  { feature: "Fear & Greed", values: ["✓", "✓", "✓", "✓"] },
  { feature: "Historical data", values: ["—", "7D", "30D", "1Y+"] },
  { feature: "Market screener", values: ["Basic", "Advanced", "Pro", "Full"] },
  { feature: "Heatmap", values: ["—", "✓", "✓", "✓"] },
  { feature: "Scatter", values: ["—", "—", "✓", "✓"] },
  { feature: "Correlation", values: ["—", "—", "✓", "✓"] },
  { feature: "Advanced filters", values: ["—", "✓", "✓", "✓"] },
  { feature: "Saved screeners", values: ["—", "✓", "✓", "Unlimited"] },
  { feature: "Alerts", values: ["Basic", "Advanced", "Multi-condition", "Smart"] },
  { feature: "Watchlists", values: ["5 symbols", "20 symbols", "Unlimited", "Unlimited"] },
  { feature: "Broker comparison", values: ["Basic", "Advanced", "Pro", "Full"] },
  { feature: "Broker offers", values: ["Basic", "✓", "✓", "Exclusive"] },
  { feature: "Trading calculator", values: ["Basic", "Advanced", "Pro", "Full"] },
  { feature: "Data export", values: ["—", "CSV", "Advanced", "API"] },
  { feature: "Custom dashboard", values: ["—", "—", "✓", "✓"] },
  { feature: "Priority features", values: ["—", "—", "✓", "✓"] },
] as const;

export const visualizationRequiredTier: Record<Visualization, TierLevel> = {
  Table: 1,
  Heatmap: 2,
  Scatter: 3,
  Correlation: 3,
  "Cross-market": 3,
  Custom: 4,
};

export const tierLevelFor = (tier: Tier): TierLevel =>
  tier === "PREMIUM" ? 4 : tier === "INTERMEDIATE" ? 2 : 1;

export const watchlistLimitForTier = (level: number) =>
  level >= 3 ? Number.POSITIVE_INFINITY : level >= 2 ? 20 : 5;

export const historicalTierForTimeframe = (timeframe: string): TierLevel => {
  if (["1Y", "2Y", "5Y", "MAX"].includes(timeframe)) return 4;
  if (["1M", "3M", "6M"].includes(timeframe)) return 3;
  if (timeframe === "1W") return 2;
  return 1;
};

export const tierFeatureValue = (feature: string, level: number) => {
  const row = tierMatrix.find(item => item.feature === feature);
  return row?.values[Math.min(Math.max(level, 1), 4) - 1] ?? "—";
};
