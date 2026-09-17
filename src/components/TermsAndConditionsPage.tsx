import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsAndConditionsPageProps {
  onBack?: () => void;
}

export const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-200">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#5338ec] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      )}

      {/* Page Heading matching Image D33 */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5338ec] tracking-tight mb-8">
        Terms and Condition<span className="text-[#FE01B1]">s</span>
      </h1>

      {/* 5 Clauses */}
      <div className="space-y-7 text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
        {/* Clause 1 */}
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            1. Account Linking & Eligibility
          </h2>
          <p className="text-slate-700 leading-relaxed">
            To be eligible for cashback (rebates), your trading account must be successfully linked to our platform under our specified IB (Introducing Broker) group.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Only certain account types, such as &apos;Raw Spread&apos; or &apos;Standard&apos;, may be eligible for rebates. It is the user&apos;s responsibility to verify account compatibility before trading.
          </p>
          <p className="text-slate-700 leading-relaxed">
            You may connect multiple accounts of the same type (e.g., &apos;Raw Spread&apos;) provided your broker&apos;s policy allows for multiple sub-account linking.
          </p>
        </div>

        {/* Clause 2 */}
        <div className="space-y-2 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            2. Cashback Calculation & Payments
          </h2>
          <p className="text-slate-700 leading-relaxed">
            Cashback is calculated based on closed trading volume (lots) and varies by instrument and account type.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Rebates are only generated on &quot;valid&quot; trades as defined by the broker (e.g., trades held for a minimum duration or exceeding a minimum pip movement).
          </p>
          <p className="text-slate-700 leading-relaxed">
            We reserve the right to adjust or withhold cashback if the broker refuses payment due to a violation of their trading terms (e.g., churning or arbitrage).
          </p>
        </div>

        {/* Clause 3 */}
        <div className="space-y-2 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            3. Data Privacy & Authorization
          </h2>
          <p className="text-slate-700 leading-relaxed">
            By connecting your account, you authorize MarketSyde to view your trading history, including volume, symbols and timestamps, for the sole purpose of calculating and verifying your cashback.
          </p>
        </div>

        {/* Clause 4 */}
        <div className="space-y-2 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            4. Broker Limitations
          </h2>
          <p className="text-slate-700 leading-relaxed">
            MarketSyde is not responsible for technical errors on the broker&apos;s side that may prevent a trade from being tracked.
          </p>
          <p className="text-slate-700 leading-relaxed">
            If a broker disconnects your account from our IB group, cashback accrual will cease immediately.
          </p>
        </div>

        {/* Clause 5 */}
        <div className="space-y-2 pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            5. Modifications
          </h2>
          <p className="text-slate-700 leading-relaxed">
            We reserve the right to modify these terms or change rebate rates at any time based on our agreements with partner brokers.
          </p>
        </div>
      </div>
    </div>
  );
};
