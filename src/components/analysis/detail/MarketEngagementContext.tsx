import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { UnlockStateModal } from '../../common/UnlockStateModal';
import { UserProfile, Broker } from '../../../types';
import { PremiumFeature, UnlockDuration } from './types';
import { Sparkles, X, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PREMIUM_FEATURES: Record<
  PremiumFeature,
  { title: string; dailyPrice: number; includedLevel: number; description: string }
> = {
  advancedScreener: { title: 'Advanced screener scatter', dailyPrice: 100, includedLevel: 2, description: 'Unlock 2D distribution view of scanner candidates.' },
  signalPrecision: { title: 'High-precision signals & correlations', dailyPrice: 140, includedLevel: 3, description: 'Deep quantitative signal confirmation & correlation overlays.' },
  eventIntelligence: { title: 'Chart event intelligence', dailyPrice: 120, includedLevel: 3, description: 'On-chart earnings, split and macro event overlays.' },
  orderFlow: { title: 'Chart order-flow analysis', dailyPrice: 180, includedLevel: 4, description: 'Aggregated bid/ask delta and footprint depth analysis.' },
  historicalData: { title: 'Historical market data', dailyPrice: 120, includedLevel: 2, description: 'Extended 7D+ historical price and volume bars.' },
  marketScreener: { title: 'Advanced market screener', dailyPrice: 120, includedLevel: 2, description: 'Multi-variable screening and custom metric presets.' },
  heatmap: { title: 'Market heatmap', dailyPrice: 100, includedLevel: 2, description: 'Hierarchical market capitalization & performance treemaps.' },
  scatter: { title: 'Scatter visualization', dailyPrice: 120, includedLevel: 3, description: 'Correlation & distribution scatter matrix.' },
  correlation: { title: 'Correlation analytics', dailyPrice: 180, includedLevel: 4, description: 'Cross-asset and peer matrix correlations.' },
  advancedFilters: { title: 'Advanced screener filters', dailyPrice: 100, includedLevel: 2, description: 'Sophisticated multi-parameter screener filters.' },
  alerts: { title: 'Advanced alerts', dailyPrice: 140, includedLevel: 2, description: 'Real-time multi-condition price & indicator alerts.' },
  brokerComparison: { title: 'Advanced broker comparison', dailyPrice: 100, includedLevel: 2, description: 'Deep fee, spread, and platform comparison tools.' },
  tradingCalculator: { title: 'Advanced trading calculator', dailyPrice: 100, includedLevel: 2, description: 'Full lot-size, margin, pip-value & risk simulator.' },
  customDashboard: { title: 'Custom dashboard', dailyPrice: 120, includedLevel: 3, description: 'Personalized multi-widget analytics workspace.' },
  researchNews: { title: 'Research news filter', dailyPrice: 120, includedLevel: 4, description: 'Institutional equity research & macro analyst notes.' },
  advancedChart: { title: 'Advanced instrument chart', dailyPrice: 120, includedLevel: 2, description: 'Full-featured TradingView chart with drawings and indicators.' },
  performanceAnalytics: { title: 'Extended performance analytics', dailyPrice: 180, includedLevel: 3, description: 'Monthly seasonality, financial statements, and multi-year returns.' },
  technicalIntervals: { title: 'Advanced technical intervals', dailyPrice: 120, includedLevel: 3, description: '1m, 5m, 15m, 30m and 1M technical timeframe intervals.' },
  technicalTools: { title: 'Advanced technical tools', dailyPrice: 120, includedLevel: 3, description: 'Full library of 15+ oscillators and moving average indicators.' },
  technicalParameters: { title: 'Technical parameter editing', dailyPrice: 30, includedLevel: 3, description: 'Custom indicator period tuning and parameter overrides.' },
};

const DURATION_MULTIPLIERS: Record<UnlockDuration, { multiplier: number; ms: number; label: string }> = {
  '1h': { multiplier: 0.4, ms: 3600 * 1000, label: '1 Hour' },
  '1d': { multiplier: 1.0, ms: 86400 * 1000, label: '1 Day' },
  '7d': { multiplier: 4.5, ms: 7 * 86400 * 1000, label: '7 Days' },
};

export function getUnlockCost(feature: PremiumFeature, duration: UnlockDuration, level: number): number {
  const feat = PREMIUM_FEATURES[feature];
  if (!feat) return 50;
  if (level >= feat.includedLevel) return 0;
  const levelDiscountMultiplier = [1.0, 0.8, 0.5, 0][Math.min(Math.max(level - 1, 0), 3)];
  const durationMult = DURATION_MULTIPLIERS[duration]?.multiplier ?? 1.0;
  return Math.round(feat.dailyPrice * durationMult * levelDiscountMultiplier);
}

export interface Entitlement {
  feature: PremiumFeature;
  expiresAt: string;
}

export interface RewardsSnapshot {
  level: {
    level: number;
    title: string;
  };
  credits: number;
  entitlements: Entitlement[];
}

interface RewardsContextType {
  snapshot: RewardsSnapshot;
  hasAccess: (feature: PremiumFeature) => boolean;
  unlock: (feature: PremiumFeature, duration: UnlockDuration) => { ok: boolean; message: string };
}

interface MarketEngagementContextType {
  requestUnlock: (feature: PremiumFeature) => void;
  openBrokerAccess: (broker?: Broker | any) => void;
}

const RewardsContext = createContext<RewardsContextType | null>(null);
const MarketEngagementContext = createContext<MarketEngagementContextType | null>(null);

export function useRewards(): RewardsContextType {
  const ctx = useContext(RewardsContext);
  if (!ctx) {
    return {
      snapshot: {
        level: { level: 1, title: 'Rookie' },
        credits: 100,
        entitlements: [],
      },
      hasAccess: () => false,
      unlock: () => ({ ok: false, message: 'Context missing' }),
    };
  }
  return ctx;
}

export function useMarketEngagement(): MarketEngagementContextType {
  const ctx = useContext(MarketEngagementContext);
  if (!ctx) {
    return {
      requestUnlock: () => {},
      openBrokerAccess: () => {},
    };
  }
  return ctx;
}

interface MarketEngagementProviderProps {
  user: UserProfile;
  children: ReactNode;
  onOpenConnectBrokerModal?: (broker?: Broker) => void;
  onViewPlans?: () => void;
  onShowToast?: (msg: string) => void;
  /** Charges the account, so an unlock leaves the real balance and the activity log. */
  onSpendCredits?: (amount: number, reason: string) => boolean;
}

export const MarketEngagementProvider: React.FC<MarketEngagementProviderProps> = ({
  user,
  children,
  onOpenConnectBrokerModal,
  onViewPlans,
  onShowToast,
  onSpendCredits,
}) => {
  const [credits, setCredits] = useState<number>(user.sydeCredits ?? 100);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [unlockTargetFeature, setUnlockTargetFeature] = useState<PremiumFeature | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<UnlockDuration>('1d');
  const [confirmedAgreement, setConfirmedAgreement] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sync user credits if prop updates
  useEffect(() => {
    if (typeof user.sydeCredits === 'number') {
      setCredits(user.sydeCredits);
    }
  }, [user.sydeCredits]);

  // Clean up expired entitlements
  useEffect(() => {
    const now = Date.now();
    setEntitlements(prev => prev.filter(e => new Date(e.expiresAt).getTime() > now));
  }, []);

  const currentLevel = user.tierLevel || 1;
  const currentRank = user.rankTitle || 'Rookie';

  const hasAccess = (feature: PremiumFeature): boolean => {
    const feat = PREMIUM_FEATURES[feature];
    if (!feat) return true;
    if (currentLevel >= feat.includedLevel) return true;
    return entitlements.some(
      e => e.feature === feature && new Date(e.expiresAt).getTime() > Date.now()
    );
  };

  const unlock = (feature: PremiumFeature, duration: UnlockDuration): { ok: boolean; message: string } => {
    const feat = PREMIUM_FEATURES[feature];
    if (!feat) return { ok: false, message: 'Unknown feature' };

    if (currentLevel >= feat.includedLevel) {
      return { ok: true, message: `Included with your Level ${currentLevel} (${currentRank}). No credits needed!` };
    }

    if (hasAccess(feature)) {
      return { ok: true, message: 'This feature is already unlocked and active!' };
    }

    const cost = getUnlockCost(feature, duration, currentLevel);
    if (credits < cost) {
      return { ok: false, message: `Insufficient credits. You need ${cost - credits} more Syde Credits.` };
    }

    const durationInfo = DURATION_MULTIPLIERS[duration];
    const expiryDate = new Date(Date.now() + durationInfo.ms).toISOString();

    if (onSpendCredits) {
      if (!onSpendCredits(cost, `Unlocked ${feat.title} for ${durationInfo.label}`)) {
        const short = `You need ${cost} credits to unlock ${feat.title}.`;
        onShowToast?.(short);
        return { ok: false, message: short };
      }
    } else {
      setCredits(prev => prev - cost);
    }
    setEntitlements(prev => [...prev.filter(e => e.feature !== feature), { feature, expiresAt: expiryDate }]);

    const formattedExpiry = new Date(expiryDate).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const successMsg = `Unlocked ${feat.title} for ${cost} Credits (Active until ${formattedExpiry})`;
    onShowToast?.(successMsg);
    return { ok: true, message: successMsg };
  };

  const requestUnlock = (feature: PremiumFeature) => {
    setUnlockTargetFeature(feature);
    setSelectedDuration('1d');
    setConfirmedAgreement(false);
    setActionFeedback(null);
  };

  const openBrokerAccess = (broker?: Broker) => {
    onOpenConnectBrokerModal?.(broker);
  };

  const snapshot: RewardsSnapshot = {
    level: {
      level: currentLevel,
      title: currentRank,
    },
    credits,
    entitlements,
  };

  const activeFeatureData = unlockTargetFeature ? PREMIUM_FEATURES[unlockTargetFeature] : null;
  const activeCost = unlockTargetFeature ? getUnlockCost(unlockTargetFeature, selectedDuration, currentLevel) : 0;
  const isAlreadyActive = unlockTargetFeature ? hasAccess(unlockTargetFeature) : false;
  const isIncludedInLevel = unlockTargetFeature ? currentLevel >= (activeFeatureData?.includedLevel ?? 99) : false;
  const activeEntitlement = unlockTargetFeature ? entitlements.find(e => e.feature === unlockTargetFeature) : null;

  return (
    <RewardsContext.Provider value={{ snapshot, hasAccess, unlock }}>
      <MarketEngagementContext.Provider value={{ requestUnlock, openBrokerAccess }}>
        {children}

        {/* ─── CREDIT UNLOCK MODAL ─── */}
        <AnimatePresence>
          {unlockTargetFeature && activeFeatureData && (
            <UnlockStateModal
              open
              title={activeFeatureData.title}
              description={`Use credits to unlock this tool from level ${activeFeatureData.includedLevel} for a certain period of time.`}
              minLevel={activeFeatureData.includedLevel}
              levelLabel={`Level ${currentLevel} (${currentRank})`}
              credits={credits}
              durations={(Object.keys(DURATION_MULTIPLIERS) as UnlockDuration[]).map((id) => ({
                id,
                label: DURATION_MULTIPLIERS[id].label,
                cost: getUnlockCost(unlockTargetFeature, id, currentLevel),
                endsAt: new Date(Date.now() + DURATION_MULTIPLIERS[id].ms).toLocaleString('en-US', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                }),
              }))}
              onClose={() => setUnlockTargetFeature(null)}
              onConfirm={(choice) => {
                setSelectedDuration(choice.id as UnlockDuration);
                const result = unlock(unlockTargetFeature, choice.id as UnlockDuration);
                setActionFeedback(result.message);
                window.setTimeout(() => setActionFeedback(null), 4000);
                setUnlockTargetFeature(null);
              }}
            />
          )}
        </AnimatePresence>
      </MarketEngagementContext.Provider>
    </RewardsContext.Provider>
  );
};
