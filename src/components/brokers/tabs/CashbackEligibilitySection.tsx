import React from 'react';

export const CashbackEligibilitySection: React.FC = () => {
  return (
    <div className="space-y-4 pt-4">
      <div className="text-center">
        <h3 className="font-display font-black text-2xl sm:text-3xl text-[#5945F1]">
          Cashback Eligibility &amp; Payouts<span className="text-[#CAEB0E]">.</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Here are some quick answers to what&apos;s probably on your mind.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs max-w-4xl mx-auto">
        <ol className="space-y-3.5 text-xs text-slate-700 font-medium">
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span className="pt-0.5">
              Cashback is earned on eligible trades placed through a linked and approved broker&apos;s trading account.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span className="pt-0.5">
              Trading activity must be validated and approved by the broker before cashback is released.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span className="pt-0.5">
              Cashback amounts can differ based on the broker, instrument traded, account type, and your MarketSyde membership level.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <span className="pt-0.5">
              Cashback is credited directly to your trading account with the broker
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};
