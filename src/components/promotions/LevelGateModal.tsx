import React from 'react';
import { X } from 'lucide-react';
import { Mission } from '../../types';
import { Promotion, PromoLevel, PROMO_LEVELS } from '../../data/promotionsData';

interface LevelGateModalProps {
  promo: Promotion;
  level: PromoLevel;
  points: number;
  maxPoints: number;
  credits: number;
  missions: Mission[];
  onGoToMissions: () => void;
  onClose: () => void;
}

/** Shown when a member tries to take an offer above their level. Points them to missions. */
export const LevelGateModal: React.FC<LevelGateModalProps> = ({ promo, level, points, maxPoints, credits, missions, onGoToMissions, onClose }) => {
  const steps = ([1, 2, 3, 4] as PromoLevel[]).filter((l) => l >= level && l <= promo.minLevel);
  const open = missions.filter((m) => m.status !== 'completed').slice(0, 3);
  const pct = maxPoints > 0 ? Math.min(100, Math.round((points / maxPoints) * 100)) : 0;
  const gap = promo.minLevel - level;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-xs font-semibold text-[#474556]">{promo.source === 'platform' ? 'MarketSyde' : promo.brokerName}</p>
            <h3 className="text-lg font-bold text-[#0b1c30] leading-snug">Reach Lv.{promo.minLevel} {PROMO_LEVELS[promo.minLevel]} to take this offer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 shrink-0" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-[#474556] mb-4">
          “{promo.title}” is open from Lv.{promo.minLevel}. You are Lv.{level} {PROMO_LEVELS[level]}, {gap} level{gap === 1 ? '' : 's'} away. Finish missions to earn credits and points.
        </p>

        <div className="flex items-center gap-2 mb-4">
          {steps.map((l, i) => (
            <React.Fragment key={l}>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${l === level ? 'bg-[#0b1c30] text-white' : l === promo.minLevel ? 'bg-[#5338ec] text-white' : 'bg-slate-100 text-[#474556]'}`}>
                Lv.{l} {PROMO_LEVELS[l]}
              </span>
              {i < steps.length - 1 && <span className="text-slate-300 text-sm">›</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#0b1c30]">Your progress</span>
            <span className="font-mono text-[#474556]">{points} / {maxPoints} pts · {credits} credits</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-[#5338ec] rounded-full" style={{ width: `${Math.max(4, pct)}%` }} />
          </div>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-wide text-[#94a3b8] mb-2">Missions you can do now</p>
        <div className="space-y-2 mb-5">
          {open.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 border border-[#e2e8f0] rounded-xl px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#0b1c30] truncate">{m.title}</p>
                <p className="text-[11px] text-[#474556] truncate">{m.subtitle}</p>
              </div>
              <span className="text-[11px] font-bold text-[#5338ec] whitespace-nowrap">+{m.rewardCredits} credits</span>
            </div>
          ))}
          {open.length === 0 && <p className="text-xs text-[#474556]">No open missions right now. Check back soon.</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">Not now</button>
          <button onClick={onGoToMissions} className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Go to missions</button>
        </div>
      </div>
    </div>
  );
};
