import React from 'react';
import { Lock } from 'lucide-react';

export type PlanId = 'basic' | 'intermediate' | 'premium';
export const PLAN_RANK: Record<PlanId, number> = { basic: 0, intermediate: 1, premium: 2 };
export const PLAN_LABEL: Record<PlanId, string> = { basic: 'Basic', intermediate: 'Intermediate', premium: 'Premium' };
export const HISTORY_DAYS: Record<PlanId, number> = { basic: 14, intermediate: 90, premium: 9999 };

export const planFromTier = (tier: number, loggedIn: boolean): PlanId =>
  !loggedIn || tier <= 2 ? 'basic' : tier === 3 ? 'intermediate' : 'premium';

export const money = (n: number, d = 2) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
export const signedMoney = (n: number, d = 2) => `${n > 0 ? '+' : ''}${money(n, d)}`;
export const pct = (n: number, d = 1) => `${n > 0 ? '+' : ''}${n.toFixed(d)}%`;

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white border border-[#e2e8f0] rounded-2xl ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ title: string; hint?: string; right?: React.ReactNode; icon?: React.ReactNode }> = ({
  title,
  hint,
  right,
  icon,
}) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div className="min-w-0">
      <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0b1c30]">
        {icon}
        {title}
      </h4>
      {hint && <p className="text-xs text-[#94a3b8] mt-0.5">{hint}</p>}
    </div>
    {right}
  </div>
);

/** Blurs its children and shows an upgrade button when locked. */
export const Locked: React.FC<{
  locked: boolean;
  label: string;
  onUpgrade: () => void;
  children: React.ReactNode;
  className?: string;
  top?: boolean;
}> = ({ locked, label, onUpgrade, children, className = '', top = false }) => (
  <div className={`relative ${className}`}>
    <div className={locked ? 'blur-[3px] select-none pointer-events-none' : ''}>{children}</div>
    {locked && (
      <div className={`absolute inset-0 flex justify-center bg-white/40 rounded-2xl ${top ? 'items-start pt-28' : 'items-center'}`}>
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition-colors"
        >
          <Lock className="w-3.5 h-3.5" /> {label}
        </button>
      </div>
    )}
  </div>
);

export const PillTabs = <T extends string>({
  options,
  value,
  onChange,
  locked = [],
  onLockedClick,
  dark = false,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  locked?: T[];
  onLockedClick?: () => void;
  dark?: boolean;
}) => (
  <div className={`inline-flex items-center gap-1 rounded-full p-1 ${dark ? 'bg-white/10' : 'bg-[#f1f5f9]'}`}>
    {options.map((o) => {
      const isLocked = locked.includes(o.id);
      const active = value === o.id;
      return (
        <button
          key={o.id}
          onClick={() => (isLocked ? onLockedClick?.() : onChange(o.id))}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
            active
              ? dark
                ? 'bg-white text-[#0b1c30]'
                : 'bg-white text-[#5338ec] shadow-xs'
              : dark
              ? 'text-white/70 hover:text-white'
              : 'text-[#474556] hover:text-[#0b1c30]'
          } ${isLocked ? 'opacity-50' : ''}`}
        >
          {o.label}
          {isLocked && <Lock className="w-3 h-3" />}
        </button>
      );
    })}
  </div>
);
