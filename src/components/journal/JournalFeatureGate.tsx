import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { JOURNAL_ACCESS_FEATURES } from './journalAccess';
import type { JournalAccessFeature } from './journalAccess';

interface JournalFeatureGateProps {
  feature: JournalAccessFeature;
  currentLevel: number;
  credits: number;
  onUnlock: () => void;
  onUpgrade: () => void;
}

export const JournalFeatureGate: React.FC<JournalFeatureGateProps> = ({
  feature,
  currentLevel,
  credits,
  onUnlock,
  onUpgrade,
}) => {
  const access = JOURNAL_ACCESS_FEATURES[feature];
  const requiredLevel = access.minLevel ?? 1;

  return (
    <section
      aria-label={`${access.title} access`}
      className="my-6 rounded-2xl border border-[#D8D0FF] bg-gradient-to-br from-[#F4F0FF] via-white to-[#F8FAFF] p-6 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5338ec]/10 text-[#5338ec]">
        {feature === 'advancedCoach' ? <Sparkles className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-[#5338ec]">
        Included at Level {requiredLevel}
      </p>
      <h2 className="mt-1 text-lg font-bold text-[#0b1c30]">{access.title} is locked</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
        {access.shortDescription} Your level is {currentLevel}. Unlock temporary access with Syde Credits or view membership benefits.
      </p>
      <p className="mt-3 text-xs font-medium text-slate-500">
        From {access.dailyPrice} credits for 1 day · {credits.toLocaleString('en-US')} credits available
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onUnlock}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#5338ec] px-4 text-sm font-semibold text-white hover:bg-[#4326d8]"
        >
          <Lock className="h-4 w-4" />
          Unlock with credits
        </button>
        <button
          type="button"
          onClick={onUpgrade}
          className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-[#5338ec] hover:text-[#5338ec]"
        >
          View level benefits
        </button>
      </div>
    </section>
  );
};
