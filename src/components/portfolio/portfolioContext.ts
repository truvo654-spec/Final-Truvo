import type React from 'react';
import { PortfolioTrade } from '../../types';
import { EquityPoint, PortfolioAccount, PortfolioGoal2 } from '../../data/portfolioData';
import { PlanId } from './portfolioUi';
import { Timeframe, TradeStats } from './portfolioMath';

export type PortfolioRole = 'trader' | 'advisor' | 'broker';

export interface PortfolioCtx {
  plan: PlanId;
  role: PortfolioRole;
  accounts: PortfolioAccount[];
  accountIds: string[];
  allTrades: PortfolioTrade[];
  setAllTrades: React.Dispatch<React.SetStateAction<PortfolioTrade[]>>;
  /** Account-filtered and history-limited. */
  trades: PortfolioTrade[];
  /** Inside the selected timeframe. */
  windowTrades: PortfolioTrade[];
  openTrades: PortfolioTrade[];
  stats: TradeStats;
  unrealized: number;
  isLive: boolean;
  historyDays: number;
  timeframe: Timeframe;
  setTimeframe: (t: Timeframe) => void;
  /** Equity inside the selected timeframe. */
  series: EquityPoint[];
  /** Equity for the whole allowed history. */
  fullSeries: EquityPoint[];
  /** Equity with no plan limit (for the compare overlay). */
  rawSeries: EquityPoint[];
  goals: PortfolioGoal2[];
  setGoals: React.Dispatch<React.SetStateAction<PortfolioGoal2[]>>;
  marginUsed: number;
  upgrade: () => void;
  toast: (m: string) => void;
  navigate: (tab: string) => void;
  openSignal: (ticker: string) => void;
  openConnect: () => void;
  openTrade: (id: string) => void;
  setTab: (t: string) => void;
}
