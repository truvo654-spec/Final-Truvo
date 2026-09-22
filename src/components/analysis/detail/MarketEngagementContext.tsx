import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
  correlation: { title: 'Correlation analytics', dailyPrice: 180, includedLevel: 3, description: 'Cross-asset and peer matrix correlations.' },
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
}

export const MarketEngagementProvider: React.FC<MarketEngagementProviderProps> = ({
  user,
  children,
  onOpenConnectBrokerModal,
  onViewPlans,
  onShowToast,
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

    setCredits(prev => prev - cost);
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-2xl"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{activeFeatureData.title}</h3>
                      <p className="text-xs text-slate-500">{activeFeatureData.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnlockTargetFeature(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="space-y-4 p-5">
                  {/* Status Banner */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          <Lock className="h-3 w-3" /> Requires Level {activeFeatureData.includedLevel}
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                          Your tier: <strong className="text-slate-900">Level {currentLevel} ({currentRank})</strong>
                        </span>
                      </div>
                      <div className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-indigo-900 shadow-xs">
                        {credits} <span className="font-normal text-indigo-600">Credits</span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      {isIncludedInLevel ? (
                        <span className="font-semibold text-emerald-600">
                          ✓ This feature is permanently included in your Level {currentLevel} tier!
                        </span>
                      ) : isAlreadyActive ? (
                        <span className="font-semibold text-indigo-700">
                          ✓ Active unlock: Available until{' '}
                          {activeEntitlement
                            ? new Date(activeEntitlement.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'active'}
                        </span>
                      ) : (
                        'Spend Syde Credits for immediate temporary access without waiting for level progression.'
                      )}
                    </p>
                  </div>

                  {!isAlreadyActive && !isIncludedInLevel && (
                    <>
                      {/* Duration Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Select Access Duration
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['1h', '1d', '7d'] as UnlockDuration[]).map(dur => {
                            const cost = getUnlockCost(unlockTargetFeature, dur, currentLevel);
                            const isSelected = selectedDuration === dur;
                            return (
                              <button
                                key={dur}
                                type="button"
                                onClick={() => {
                                  setSelectedDuration(dur);
                                  setConfirmedAgreement(false);
                                }}
                                className={`rounded-xl border p-2.5 text-center transition-all ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div className="text-xs font-bold text-slate-900">
                                  {DURATION_MULTIPLIERS[dur].label}
                                </div>
                                <div className="mt-1 text-xs font-extrabold text-indigo-600">
                                  {cost} <span className="text-[10px] font-normal text-slate-500">Credits</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cost Summary Box */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
                        <span className="font-medium text-slate-600">Syde Credits Deduction</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-extrabold text-indigo-700">{activeCost}</span>
                          <span className="text-[10px] font-semibold text-indigo-500">Credits</span>
                        </div>
                      </div>

                      {/* Confirmation Checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={confirmedAgreement}
                          onChange={e => setConfirmedAgreement(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>
                          I confirm spending <strong>{activeCost} Syde Credits</strong> to temporarily unlock{' '}
                          <strong>{activeFeatureData.title}</strong> for {DURATION_MULTIPLIERS[selectedDuration].label}.
                        </span>
                      </label>
                    </>
                  )}

                  {actionFeedback && (
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs font-medium text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{actionFeedback}</span>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockTargetFeature(null);
                      onViewPlans?.();
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    View Level & Tier Perks →
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUnlockTargetFeature(null)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      {isAlreadyActive ? 'Done' : 'Cancel'}
                    </button>

                    {!isAlreadyActive && !isIncludedInLevel && (
                      <button
                        type="button"
                        disabled={!confirmedAgreement || credits < activeCost}
                        onClick={() => {
                          const res = unlock(unlockTargetFeature, selectedDuration);
                          setActionFeedback(res.message);
                          if (res.ok) {
                            setTimeout(() => {
                              setUnlockTargetFeature(null);
                            }, 1200);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-colors ${
                          !confirmedAgreement || credits < activeCost
                            ? 'cursor-not-allowed bg-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {credits < activeCost ? 'Insufficient Credits' : `Confirm Unlock (${activeCost} C)`}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </MarketEngagementContext.Provider>
    </RewardsContext.Provider>
  );
};
