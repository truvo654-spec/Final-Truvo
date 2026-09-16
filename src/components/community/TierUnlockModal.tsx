import React from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Award,
  DollarSign,
  Radio,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { TIER_UNLOCK_MATRIX } from '../../data/communityData';

interface TierUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigateToCashback?: () => void;
}

export const TierUnlockModal: React.FC<TierUnlockModalProps> = ({
  isOpen,
  onClose,
  user,
  onNavigateToCashback,
}) => {
  if (!isOpen) return null;

  const currentLevel = user.level || 1;
  const currentTierMeta = TIER_UNLOCK_MATRIX.find((t) => t.level === currentLevel) || TIER_UNLOCK_MATRIX[0];
  const nextTierMeta = TIER_UNLOCK_MATRIX.find((t) => t.level === currentLevel + 1);

  const pointsToNext = nextTierMeta ? Math.max(0, nextTierMeta.minPoints - user.currentPoints) : 0;
  const progressPercent = nextTierMeta
    ? Math.min(
        100,
        Math.round(
          ((user.currentPoints - currentTierMeta.minPoints) /
            (nextTierMeta.minPoints - currentTierMeta.minPoints)) *
            100
        )
      )
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#171924] border border-slate-700/80 rounded-2xl w-full max-w-2xl text-white shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3861fb] to-[#5338ec] flex items-center justify-center text-xl shadow-md">
              {currentTierMeta.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-display text-white">
                  Tier Accessibility & Unlocks
                </h3>
                <span className="text-[11px] font-mono font-bold bg-[#3861fb]/20 text-[#3861fb] px-2 py-0.5 rounded-full border border-[#3861fb]/30">
                  Level {currentLevel} • {currentTierMeta.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock higher social privileges, audio hosting, and extra broker cashback boosters.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e1b4b] border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 w-full sm:w-2/3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Current Activity Points</span>
              <span className="font-mono font-bold text-amber-400">
                {user.currentPoints.toLocaleString()} Pts
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3861fb] to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{currentTierMeta.title} ({currentTierMeta.minPoints} Pts)</span>
              {nextTierMeta ? (
                <span className="text-emerald-400 font-semibold">
                  +{pointsToNext} Pts to {nextTierMeta.title} ({nextTierMeta.minPoints} Pts)
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">Max Tier Achieved! 🏆</span>
              )}
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Active Cashback Boost
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              +{currentTierMeta.cashbackBoost}% Booster
            </span>
          </div>
        </div>

        {/* Tier Matrix Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            All 6 Tier Levels & Unlocked Privileges
          </h4>

          <div className="space-y-2.5">
            {TIER_UNLOCK_MATRIX.map((tier) => {
              const isUnlocked = currentLevel >= tier.level;
              const isCurrent = currentLevel === tier.level;

              return (
                <div
                  key={tier.level}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-800/90 border-[#3861fb] ring-1 ring-[#3861fb]'
                      : isUnlocked
                      ? 'bg-slate-900/60 border-slate-700/60'
                      : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tier.badge}</span>
                      <span className="text-xs font-bold text-white font-display">
                        Level {tier.level}: {tier.title}
                      </span>
                      {isCurrent && (
                        <span className="bg-[#3861fb] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                          Current
                        </span>
                      )}
                      {!isUnlocked && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono">
                          <Lock className="w-2.5 h-2.5" /> Requires {tier.minPoints} Pts
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        +{tier.cashbackBoost}% Cashback
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {tier.unlockedFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-1.5 p-1.5 rounded-lg ${
                          isUnlocked ? 'text-slate-200 bg-slate-800/40' : 'text-slate-500'
                        }`}
                      >
                        {isUnlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block text-[11px] font-semibold">
                            {feat.name}
                          </strong>
                          <span className="text-[10px] text-slate-400 leading-tight block">
                            {feat.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2">
          <p className="text-[11px] text-slate-400">
            💡 Earn points by liking (+5 Pts), commenting (+15 Pts), and sharing alpha setups (+25 Pts).
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#3861fb] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
