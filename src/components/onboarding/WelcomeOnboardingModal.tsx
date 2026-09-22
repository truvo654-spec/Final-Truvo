import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, TrendingUp, Trophy, Flame } from 'lucide-react';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

/* ─── 3D Party Popper Badge (Matching Pop-Up Onboarding #1.png) ─── */
const OnboardingPopperBadge: React.FC = () => (
  <motion.div
    initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.1 }}
    className="w-18 h-18 sm:w-22 sm:h-22 rounded-[22px] bg-gradient-to-tr from-[#422ce0] via-[#5945F1] to-[#7663f7] shadow-xl shadow-[#5945F1]/30 relative overflow-hidden flex items-center justify-center shrink-0"
  >
    {/* Ambient shimmer */}
    <div className="absolute inset-0 bg-white/10 opacity-60 pointer-events-none" />

    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 p-2 overflow-visible">
      {/* Confetti pieces */}
      <motion.circle
        animate={{ y: [-1, 2, -1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        cx="28" cy="22" r="3" fill="#DCF73B"
      />
      <motion.circle
        animate={{ y: [1, -2, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        cx="68" cy="18" r="3.5" fill="#DCF73B"
      />
      <circle cx="78" cy="34" r="3" fill="#FD02B0" />
      <circle cx="82" cy="56" r="2.5" fill="#38BDF8" />
      <circle cx="62" cy="40" r="2" fill="#FBBF24" />

      {/* Streamers */}
      <path d="M 44 26 Q 58 14 74 24" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 52 34 Q 72 26 84 46" stroke="#DCF73B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 38 38 Q 48 48 64 42" stroke="#FD02B0" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 3D Party Popper Cone with animated wiggle */}
      <motion.g
        animate={{ rotate: [-38, -32, -38] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ transformOrigin: '34px 68px' }}
      >
        <polygon points="20,54 48,82 12,82" fill="#818CF8" />
        <polygon points="18,60 42,82 14,82" fill="#C7D2FE" />
        <ellipse cx="20" cy="54" rx="14" ry="6" fill="#4338CA" />
        <ellipse cx="20" cy="54" rx="12" ry="4.5" fill="#312E81" />
      </motion.g>
    </svg>
  </motion.div>
);

/* ─── 3D Candlesticks & Coins Badge (Matching Pop-Up Onboarding #2.png) ─── */
const OnboardingTradingBadge: React.FC = () => (
  <motion.div
    initial={{ scale: 0.8, rotate: 10, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.1 }}
    className="w-18 h-18 sm:w-22 sm:h-22 rounded-[22px] bg-gradient-to-tr from-[#422ce0] via-[#5945F1] to-[#7663f7] shadow-xl shadow-[#5945F1]/30 relative overflow-hidden flex items-center justify-center shrink-0"
  >
    <div className="absolute inset-0 bg-white/10 opacity-60 pointer-events-none" />

    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 p-2 overflow-visible">
      {/* Candlesticks */}
      <line x1="36" y1="22" x2="36" y2="52" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <rect x="32" y="28" width="8" height="18" rx="2" fill="#10B981" />

      <line x1="48" y1="18" x2="48" y2="46" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
      <rect x="44" y="22" width="8" height="16" rx="2" fill="#F43F5E" />

      <line x1="60" y1="14" x2="60" y2="42" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      <rect x="56" y="18" width="8" height="17" rx="2" fill="#10B981" />

      {/* Floating Gold Coins */}
      <motion.ellipse
        animate={{ y: [-2, 2, -2], rotate: [-22, -18, -22] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        cx="22" cy="36" rx="5" ry="3.5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"
      />
      <motion.ellipse
        animate={{ y: [2, -2, 2], rotate: [22, 28, 22] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        cx="76" cy="24" rx="4.5" ry="3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"
      />

      {/* 3D Stack of Gold Coins */}
      <g transform="translate(46, 48)">
        <ellipse cx="14" cy="22" rx="13" ry="5" fill="#D97706" />
        <rect x="1" y="18" width="26" height="4" fill="#F59E0B" />
        <ellipse cx="14" cy="18" rx="13" ry="5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.7" />

        <rect x="1" y="12" width="26" height="4" fill="#F59E0B" />
        <ellipse cx="14" cy="12" rx="13" ry="5" fill="#FDE047" stroke="#D97706" strokeWidth="0.7" />
      </g>
    </svg>
  </motion.div>
);

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed & softly blurred backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* ─── MODAL STEP 1: "You're in." ─── */
          <motion.div
            key="onboarding-step-1"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -15 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="bg-white rounded-[32px] max-w-[560px] w-full p-6 sm:p-9 shadow-2xl border border-slate-200/90 relative text-left my-auto z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Layout: Top Left Popper Icon + Title */}
            <div className="flex items-start gap-4 sm:gap-5">
              <OnboardingPopperBadge />
              <div className="pt-1">
                <h2 className="text-3xl sm:text-[34px] font-extrabold tracking-tight text-[#0b1c30] leading-tight">
                  You&apos;re <span className="text-[#5945F1]">in</span>
                  <span className="text-[#FD02B0]">.</span>
                </h2>
                <div className="mt-1.5 text-sm sm:text-base text-slate-600 font-medium">
                  Everything is ready for you to{' '}
                  <span className="font-bold text-slate-900 relative inline-block">
                    start now.
                    {/* Lime green dot accent above "start" */}
                    <span className="absolute -top-1.5 left-1/4 w-2 h-2 rounded-full bg-[#CAEB0E] ring-2 ring-white" />
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-7">
              {/* Card 1: Your first signals */}
              <div className="bg-[#f8f9fe] border border-indigo-100/70 rounded-2xl p-4 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#5945F1] flex items-center justify-center mb-2.5 shadow-2xs">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#5945F1]">
                  Your first signals
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Live. Ready. Go check them.
                </div>
              </div>

              {/* Card 2: Your cashback rate */}
              <div className="bg-[#f8f9fe] border border-indigo-100/70 rounded-2xl p-4 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#CAEB0E] text-[#5945F1] font-black text-base flex items-center justify-center mb-2.5 shadow-xs">
                  $
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#5945F1]">
                  Your cashback rate
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Earned on trades you&apos;re already making.
                </div>
              </div>

              {/* Card 3: Broker deals */}
              <div className="bg-[#f8f9fe] border border-indigo-100/70 rounded-2xl p-4 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#FD02B0] text-white flex items-center justify-center mb-2.5 shadow-xs">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs sm:text-[13px] font-bold text-[#5945F1]">
                  Broker deals
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Compare. Pick. Save time.
                </div>
              </div>
            </div>

            {/* Bottom Controls: Pagination Dots & Action Buttons */}
            <div className="flex items-center justify-between mt-7 pt-4 border-t border-slate-100">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5945F1]" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-2 py-1"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="py-2.5 px-6 rounded-full bg-[#5945F1] hover:bg-[#4734df] text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ─── MODAL STEP 2: "Trade more. Earn more." ─── */
          <motion.div
            key="onboarding-step-2"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -15 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="bg-white rounded-[32px] max-w-[560px] w-full p-6 sm:p-9 shadow-2xl border border-slate-200/90 relative text-left my-auto z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Layout: Title on Left, Trading Badge on Right */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-[34px] font-extrabold tracking-tight text-[#5945F1] leading-tight">
                  Trade more.<br />
                  Earn <span className="text-[#FD02B0]">more.</span>
                </h2>
                <div className="mt-2 text-sm sm:text-base text-slate-800 font-bold relative inline-block">
                  It&apos;s that simple.
                  {/* Lime green dot accent */}
                  <span className="absolute -top-1.5 left-[42%] w-2 h-2 rounded-full bg-[#CAEB0E] ring-2 ring-white" />
                </div>
              </div>
              <OnboardingTradingBadge />
            </div>

            {/* 2 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7">
              {/* Card 1: Rank up, get back more */}
              <div className="bg-[#f8f9fe] border border-indigo-100/70 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5 shadow-2xs">
                  <Trophy className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#5945F1]">
                  Rank up, get back more
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  Higher level, higher cashback rate.
                </div>
              </div>

              {/* Card 2: More activity, more access */}
              <div className="bg-[#f8f9fe] border border-indigo-100/70 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center hover:border-indigo-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-[#FD02B0] flex items-center justify-center mb-2.5 shadow-2xs">
                  <Flame className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#5945F1]">
                  More activity, more access
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">
                  Stay active. Stay ahead.
                </div>
              </div>
            </div>

            {/* Bottom Controls: Pagination Dots & Action Buttons */}
            <div className="flex items-center justify-between mt-7 pt-4 border-t border-slate-100">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#5945F1]" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-2 py-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onComplete();
                  }}
                  className="py-2.5 px-6 rounded-full bg-[#5945F1] hover:bg-[#4734df] text-white font-semibold text-sm transition-all shadow-md cursor-pointer active:scale-98"
                >
                  Let&apos;s Start
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
