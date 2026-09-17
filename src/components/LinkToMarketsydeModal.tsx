import React, { useState } from 'react';
import { X, ArrowLeft, Check } from 'lucide-react';

interface LinkToMarketsydeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerName?: string;
  onNavigateToCashback: () => void;
  onShowToast?: (msg: string) => void;
  onOpenFullTermsPage?: () => void;
}

function RequestSubmittedIllustration() {
  return (
    <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="docBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="idCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Soft backdrop ambient glow */}
        <circle cx="60" cy="60" r="42" fill="#e0e7ff" opacity="0.45" />

        {/* Background Paper Sheet with folded corner */}
        <g transform="translate(34, 18)">
          {/* Main Paper */}
          <path
            d="M 6,0 L 40,0 L 52,12 L 52,72 C 52,75.3 49.3,78 46,78 L 6,78 C 2.7,78 0,75.3 0,72 L 0,6 C 0,2.7 2.7,0 6,0 Z"
            fill="url(#docBgGrad)"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          {/* Folded dog-ear corner */}
          <path
            d="M 40,0 L 40,12 L 52,12 Z"
            fill="#cbd5e1"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          {/* Faint document lines */}
          <line x1="8" y1="22" x2="32" y2="22" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="30" x2="44" y2="30" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="38" x2="40" y2="38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Foreground Blue ID Card with avatar */}
        <g filter="url(#cardShadow)" transform="translate(26, 32)">
          {/* Card body */}
          <rect
            x="0"
            y="0"
            width="54"
            height="58"
            rx="8"
            fill="url(#idCardGrad)"
            stroke="#818cf8"
            strokeWidth="1"
          />

          {/* User Silhouette Avatar */}
          {/* Head */}
          <circle cx="27" cy="20" r="8" fill="#ffffff" />
          {/* Torso */}
          <path
            d="M 13,44 C 13,34 19,32 27,32 C 35,32 41,34 41,44 Z"
            fill="#ffffff"
          />

          {/* Card bottom subtle accent bar */}
          <rect x="14" y="48" width="26" height="3" rx="1.5" fill="#a5b4fc" opacity="0.7" />
        </g>

        {/* Verification Checkmark Badge overlapping bottom right of card */}
        <g transform="translate(64, 68)">
          <circle cx="14" cy="14" r="14" fill="#ffffff" />
          <circle cx="14" cy="14" r="11.5" fill="url(#badgeGrad)" />
          {/* White checkmark */}
          <path
            d="M 9.5,14 L 12.5,17 L 18.5,10.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

export const LinkToMarketsydeModal: React.FC<LinkToMarketsydeModalProps> = ({
  isOpen,
  onClose,
  brokerName = 'HFM',
  onNavigateToCashback,
  onShowToast,
  onOpenFullTermsPage,
}) => {
  const [step, setStep] = useState<'form' | 'submitted' | 'terms'>('form');
  const [email, setEmail] = useState('');
  const [accountType, setAccountType] = useState('');
  const [tradingNumber, setTradingNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (!isOpen) return null;

  const isFormValid =
    email.trim().length > 0 &&
    accountType.trim().length > 0 &&
    tradingNumber.trim().length > 0 &&
    acceptedTerms;

  const handleFillDemoData = () => {
    setEmail('email@domain.com');
    setAccountType('Cent');
    setTradingNumber('0000000001');
    setAcceptedTerms(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStep('submitted');
    onShowToast?.(`Link request for ${brokerName} submitted successfully!`);
  };

  const handleClose = () => {
    setStep('form');
    onClose();
  };

  const handleGoToCashback = () => {
    handleClose();
    onNavigateToCashback();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'form' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="pr-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Link to MarketSyde
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-1 leading-relaxed">
                Fill in the form and we&apos;ll handle the IB switch for you
              </p>
            </div>

            {/* Quick Demo Helper (for rapid review/testing matching D32) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Step 1 of 2: Submit Details</span>
              <button
                type="button"
                onClick={handleFillDemoData}
                className="text-[11px] text-[#5338ec] hover:underline font-medium cursor-pointer"
                title="Fill example data from image D32"
              >
                Fill Demo Data
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Broker Account Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Broker Account Email address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter broker account email address"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200/80 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec] transition-colors"
                />
              </div>

              {/* Field 2: Trading Account Type */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Trading Account Type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200/80 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select trading account type
                    </option>
                    <option value="Cent">Cent</option>
                    <option value="Standard">Standard</option>
                    <option value="Raw Spread">Raw Spread</option>
                    <option value="Pro">Pro</option>
                    <option value="Zero">Zero</option>
                    <option value="Micro">Micro</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Field 3: Trading Account Number (UID) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-800">
                  Trading Account Number (UID)<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tradingNumber}
                  onChange={(e) => setTradingNumber(e.target.value)}
                  placeholder="Enter trading account number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200/80 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec] transition-colors"
                />
              </div>

              {/* Checkbox: Terms and Conditions */}
              <div className="flex items-start gap-2.5 pt-1.5">
                <input
                  type="checkbox"
                  id="linkTermsCheck"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#5338ec] focus:ring-[#5338ec] border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="linkTermsCheck"
                  className="text-xs text-slate-600 leading-snug cursor-pointer select-none"
                >
                  I have read, understood, and accepted the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setStep('terms');
                    }}
                    className="text-[#5945F1] underline hover:text-[#432ec4] font-medium inline cursor-pointer"
                  >
                    Terms and Conditions.
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-[#5945F1] hover:bg-[#4835e0] disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'terms' && (
          <div className="space-y-4">
            {/* Header with back arrow */}
            <div className="flex items-center gap-2 pr-8">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="Back to form"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Terms and Condition<span className="text-[#FE01B1]">s</span>
              </h3>
            </div>

            {/* Scrollable Terms Content */}
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-4 text-xs sm:text-[13px] text-slate-700 leading-relaxed border-t border-b border-slate-100 py-3">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">1. Account Linking & Eligibility</h4>
                <p>
                  To be eligible for cashback (rebates), your trading account must be successfully linked to our platform under our specified IB (Introducing Broker) group.
                </p>
                <p>
                  Only certain account types, such as &apos;Raw Spread&apos; or &apos;Standard&apos;, may be eligible for rebates. It is the user&apos;s responsibility to verify account compatibility before trading.
                </p>
                <p>
                  You may connect multiple accounts of the same type (e.g., &apos;Raw Spread&apos;) provided your broker&apos;s policy allows for multiple sub-account linking.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">2. Cashback Calculation & Payments</h4>
                <p>
                  Cashback is calculated based on closed trading volume (lots) and varies by instrument and account type.
                </p>
                <p>
                  Rebates are only generated on &quot;valid&quot; trades as defined by the broker (e.g., trades held for a minimum duration or exceeding a minimum pip movement).
                </p>
                <p>
                  We reserve the right to adjust or withhold cashback if the broker refuses payment due to a violation of their trading terms (e.g., churning or arbitrage).
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">3. Data Privacy & Authorization</h4>
                <p>
                  By connecting your account, you authorize MarketSyde to view your trading history, including volume, symbols and timestamps, for the sole purpose of calculating and verifying your cashback.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">4. Broker Limitations</h4>
                <p>
                  MarketSyde is not responsible for technical errors on the broker&apos;s side that may prevent a trade from being tracked. If a broker disconnects your account from our IB group, cashback accrual will cease immediately.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">5. Modifications</h4>
                <p>
                  We reserve the right to modify these terms or change rebate rates at any time based on our agreements with partner brokers.
                </p>
              </div>
            </div>

            {/* Accept & Return Button */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setStep('form');
                }}
                className="flex-1 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4835e0] text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>I Accept & Return</span>
              </button>
              {onOpenFullTermsPage && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenFullTermsPage();
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer"
                  title="Open full page"
                >
                  Full Page
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'submitted' && (
          <div className="py-2 text-center space-y-4">
            {/* 3D Illustration matching Image D38 */}
            <RequestSubmittedIllustration />

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Request Submitted
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Approval may take 2 to 3 business days depending on the broker&apos;s account approval process.
              </p>
            </div>

            {/* Button matching Image D38 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToCashback}
                className="w-full py-2.5 sm:py-3 rounded-xl border border-[#5945F1]/80 text-[#5945F1] hover:bg-indigo-50 font-semibold text-xs sm:text-sm transition-all text-center cursor-pointer shadow-2xs"
              >
                Go to Cashback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
