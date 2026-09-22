import React, { useState } from 'react';
import { X, Copy, Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Broker } from '../types';

interface GenerateIbEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  broker: Broker;
  partnerCode: string;
  scenarioType?: 'single_ib' | 'restricted_ib';
  onShowToast?: (msg: string) => void;
}

export const GenerateIbEmailModal: React.FC<GenerateIbEmailModalProps> = ({
  isOpen,
  onClose,
  broker,
  partnerCode: _partnerCode,
  scenarioType: _scenarioType = 'single_ib',
  onShowToast,
}) => {
  // Input fields (Frame 41 empty state by default)
  const [brokerEmail, setBrokerEmail] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Copy states & Toast
  const [copiedSection, setCopiedSection] = useState<'to' | 'title' | 'body' | null>(null);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen) return null;

  // Values matching Frame 41 & D9
  const brokerSupportEmail = 'supportemail@broker.com';

  const emailTitle = `Request for Changing IB for ${brokerEmail.trim() ? brokerEmail.trim() : 'email@domain.com'}`;

  // When empty: (User email), (Accout type), (Trading account no.)
  // When filled: email@domain.com, Cent, 0000000001
  const displayEmail = brokerEmail.trim() || '(User email)';
  const displayAccountType = accountType || '(Accout type)';
  const displayAccountNumber = accountNumber.trim() || '(Trading account no.)';

  const emailBody = `Hello Broker Team,\n\nI would like to request a change of my IB code to (Marketsyde referral code)\n\nPlease find my account details below for your reference:\nEmail Address: ${displayEmail}\nAccount Type: ${displayAccountType}\nAccount Number: ${displayAccountNumber}\n\nThank you`;

  const triggerCopySuccess = (section: 'to' | 'title' | 'body', text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedSection(section);
    setShowToast(true);
    onShowToast?.('The content has been copied and is now ready to use.');

    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);

    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const handleFillDemoD9 = () => {
    setBrokerEmail('email@domain.com');
    setAccountType('Cent');
    setAccountNumber('0000000001');
  };

  const handleResetFrame41 = () => {
    setBrokerEmail('');
    setAccountType('');
    setAccountNumber('');
  };

  return (
    <>
      {/* ─── D10: ACTION CONFIRMED TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed top-6 right-6 z-[100] max-w-sm w-full sm:w-[360px] pointer-events-auto"
          >
            <div className="bg-white dark:bg-[#161238] rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-start gap-3.5">
              <div className="text-[#5046E5] shrink-0 mt-0.5">
                <Copy className="w-5 h-5 text-[#5046E5]" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#0b1c30] dark:text-white leading-tight">
                  Copied to Clipboard
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  The content has been copied and is now ready to use.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL BACKDROP OVER PAGE ─── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        {/* ─── MODAL CONTAINER (Exact Match to Frame 41 & D9) ─── */}
        <div className="relative w-full max-w-[490px] bg-white dark:bg-[#120d2b] border border-slate-200/90 dark:border-slate-800 rounded-[28px] shadow-2xl p-6 sm:p-7 overflow-hidden my-auto">
          {/* Close button top right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 pr-8">
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#0b1c30] dark:text-white tracking-tight">
              Change IB Request
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-snug">
              {brokerEmail || accountType || accountNumber
                ? 'Enter your details and we will prepare a transfer email you can send to your broker.'
                : 'Provide your details and we will prepare the switch email for you to send to your broker.'}
            </p>
          </div>

          {/* Quick Demo Pre-fill helpers */}
          <div className="flex items-center justify-end gap-2 pt-2 text-[11px]">
            {brokerEmail || accountType || accountNumber ? (
              <button
                type="button"
                onClick={handleResetFrame41}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
              >
                Reset to empty (Frame 41)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFillDemoD9}
                className="text-[#5046E5] hover:underline font-semibold cursor-pointer"
              >
                Fill D9 sample data
              </button>
            )}
          </div>

          {/* ─── FORM FIELDS ─── */}
          <div className="space-y-3.5 mt-3">
            {/* Field 1: Broker Account Email address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0b1c30] dark:text-slate-200">
                Broker Account Email address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={brokerEmail}
                onChange={(e) => setBrokerEmail(e.target.value)}
                placeholder="Enter broker account email address"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5] transition-all"
              />
            </div>

            {/* Field 2: Trading Account Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0b1c30] dark:text-slate-200">
                Trading Account Type<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5] appearance-none cursor-pointer pr-10 transition-all ${
                    accountType ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  <option value="" disabled>
                    Select trading account type
                  </option>
                  <option value="Cent" className="text-slate-900 dark:text-white">Cent</option>
                  <option value="Standard" className="text-slate-900 dark:text-white">Standard</option>
                  <option value="Pro" className="text-slate-900 dark:text-white">Pro</option>
                  <option value="Raw Spread" className="text-slate-900 dark:text-white">Raw Spread</option>
                  <option value="Zero" className="text-slate-900 dark:text-white">Zero</option>
                  <option value="ECN" className="text-slate-900 dark:text-white">ECN</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Field 3: Trading Account Number (UID) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0b1c30] dark:text-slate-200">
                Trading Account Number (UID)<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter trading account number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#5046E5] focus:ring-1 focus:ring-[#5046E5] transition-all"
              />
            </div>
          </div>

          {/* ─── OUTPUT EMAIL PREVIEW BOX (Exact Match to Frame 41 & D9) ─── */}
          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900/60 space-y-3.5">
            {/* Row 1: To */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium block">To:</span>
                <p className="text-xs sm:text-sm text-[#0b1c30] dark:text-slate-200 font-medium">
                  {brokerSupportEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerCopySuccess('to', brokerSupportEmail)}
                title="Copy recipient email"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#5046E5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                {copiedSection === 'to' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Row 2: Title */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="space-y-0.5 flex-1 min-w-0 pr-2">
                <span className="text-[11px] text-slate-400 font-medium block">Title:</span>
                <p className="text-xs sm:text-sm text-[#0b1c30] dark:text-slate-200 font-medium break-words">
                  {emailTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerCopySuccess('title', emailTitle)}
                title="Copy email subject"
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#5046E5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                {copiedSection === 'title' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Row 3: Email Body */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 relative">
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Email Body:</span>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pr-8">
                {emailBody}
              </div>

              {/* Copy Body Icon at the bottom right */}
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => triggerCopySuccess('body', emailBody)}
                  title="Copy email body"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#5046E5] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedSection === 'body' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

