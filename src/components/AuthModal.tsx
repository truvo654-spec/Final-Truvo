import React, { useState, useId } from 'react';
import { X, Eye, EyeOff, Check, ArrowRight, TrendingUp, Trophy, Flame } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signup' | 'signin';
  onClose: () => void;
  onSuccess: (email?: string, name?: string) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

type AuthStep = 'form' | 'verify-email' | 'link-expired' | 'onboarding-1' | 'onboarding-2';

/* ─── D07 Graphic: 3D Purple Envelope with Lime-Green Checkmark ─── */
const EnvelopeCheckIcon: React.FC = () => (
  <div className="relative w-28 h-20 sm:w-32 sm:h-24 flex items-center justify-center mx-auto">
    {/* Soft glowing ambient light */}
    <div className="absolute inset-0 bg-[#5945F1]/20 rounded-full blur-xl scale-95" />
    
    <svg viewBox="0 0 120 90" className="w-full h-full relative z-10 drop-shadow-md overflow-visible">
      <defs>
        <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7A66FA" />
          <stop offset="100%" stopColor="#4A34DF" />
        </linearGradient>
        <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCF73B" />
          <stop offset="100%" stopColor="#84CC16" />
        </linearGradient>
      </defs>
      
      {/* Outer Envelope Body */}
      <rect x="15" y="18" width="90" height="56" rx="14" fill="url(#envGrad)" />
      
      {/* Top Flap V-Line Fold */}
      <path d="M 17 22 Q 60 54 103 22" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 17 21 Q 60 52 103 21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      
      {/* Bottom folds */}
      <path d="M 16 72 L 44 48" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 104 72 L 76 48" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Top Gloss Highlight */}
      <path d="M 25 21 L 46 21" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Glowing Lime Checkmark Seal */}
      <g transform="translate(68, 8)">
        <ellipse cx="14" cy="18" rx="16" ry="16" fill="#DCF73B" opacity="0.3" filter="blur(4px)" />
        <circle cx="14" cy="18" r="13" fill="url(#checkGrad)" className="drop-shadow-md" />
        <path d="M 9 18.5 L 12.5 22 L 19 14.5" stroke="#172554" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  </div>
);

/* ─── D09 Graphic: Broken Chain Link with Pink Sparks ─── */
const BrokenLinkIcon: React.FC = () => (
  <div className="relative w-28 h-20 sm:w-32 sm:h-24 flex items-center justify-center mx-auto">
    <div className="absolute inset-0 bg-pink-500/15 rounded-full blur-xl scale-95" />
    
    <svg viewBox="0 0 120 90" className="w-full h-full relative z-10 drop-shadow-sm overflow-visible">
      <defs>
        <linearGradient id="purpleLinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C6BFA" />
          <stop offset="100%" stopColor="#5945F1" />
        </linearGradient>
      </defs>

      {/* Left Link (Frosted White / Transparent Grey) */}
      <g transform="rotate(-35 44 45)">
        <rect x="24" y="31" width="40" height="28" rx="14" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeDasharray="75 22" strokeDashoffset="10" />
        <rect x="24" y="31" width="40" height="28" rx="14" fill="rgba(241,245,249,0.35)" />
      </g>

      {/* Right Link (Vivid Purple) */}
      <g transform="rotate(-35 76 45)">
        <rect x="56" y="31" width="40" height="28" rx="14" fill="none" stroke="url(#purpleLinkGrad)" strokeWidth="6" strokeDasharray="75 22" strokeDashoffset="38" />
      </g>

      {/* Sparks Radiating from Break Point */}
      {/* Top Spark */}
      <path d="M 60 28 L 58 18" stroke="#FD02B0" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 66 30 L 72 20" stroke="#FD02B0" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 54 34 L 47 26" stroke="#FD02B0" strokeWidth="2.4" strokeLinecap="round" />

      {/* Bottom Spark */}
      <path d="M 60 62 L 58 72" stroke="#FD02B0" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 66 60 L 73 70" stroke="#FD02B0" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 54 56 L 47 64" stroke="#FD02B0" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  </div>
);

/* ─── D08 Graphic: Purple Squircle with Party Popper & Confetti Burst ─── */
const OnboardingPopperBadge: React.FC = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#5945F1] shadow-lg shadow-[#5945F1]/30 relative overflow-hidden flex items-center justify-center shrink-0">
    <div className="absolute inset-0 bg-gradient-to-tr from-[#452ee0] via-[#5945F1] to-[#7561f7]" />
    
    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 p-2 overflow-visible">
      {/* Confetti pieces */}
      <circle cx="28" cy="24" r="3" fill="#DCF73B" />
      <circle cx="68" cy="18" r="3.5" fill="#DCF73B" />
      <circle cx="78" cy="36" r="3" fill="#FD02B0" />
      <circle cx="82" cy="58" r="2.5" fill="#38BDF8" />
      <circle cx="62" cy="42" r="2" fill="#FBBF24" />

      {/* Streamers */}
      <path d="M 44 26 Q 58 14 74 24" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 52 34 Q 72 26 84 46" stroke="#DCF73B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 38 38 Q 48 48 64 42" stroke="#FD02B0" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Party Popper Cone */}
      <g transform="rotate(-35 34 68)">
        <polygon points="20,54 48,82 12,82" fill="#818CF8" />
        <polygon points="18,60 42,82 14,82" fill="#C7D2FE" />
        <ellipse cx="20" cy="54" rx="14" ry="6" fill="#4338CA" />
        <ellipse cx="20" cy="54" rx="12" ry="4.5" fill="#312E81" />
      </g>
    </svg>
  </div>
);

/* ─── D10 Graphic: Purple Squircle with Candlesticks & 3D Gold Coins ─── */
const OnboardingTradingBadge: React.FC = () => (
  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#5945F1] shadow-lg shadow-[#5945F1]/30 relative overflow-hidden flex items-center justify-center shrink-0">
    <div className="absolute inset-0 bg-gradient-to-tr from-[#452ee0] via-[#5945F1] to-[#7561f7]" />
    
    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 p-2 overflow-visible">
      {/* Candlesticks */}
      <line x1="36" y1="24" x2="36" y2="52" stroke="#10B981" strokeWidth="1.5" />
      <rect x="32" y="30" width="8" height="16" rx="2" fill="#10B981" />

      <line x1="48" y1="20" x2="48" y2="46" stroke="#F43F5E" strokeWidth="1.5" />
      <rect x="44" y="24" width="8" height="14" rx="2" fill="#F43F5E" />

      <line x1="60" y1="16" x2="60" y2="42" stroke="#10B981" strokeWidth="1.5" />
      <rect x="56" y="20" width="8" height="15" rx="2" fill="#10B981" />

      {/* Floating Gold Coins */}
      <ellipse cx="22" cy="38" rx="4.5" ry="3" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" transform="rotate(-20 22 38)" />
      <ellipse cx="76" cy="26" rx="4" ry="2.8" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" transform="rotate(25 76 26)" />

      {/* 3D Stack of Gold Coins */}
      <g transform="translate(46, 50)">
        <ellipse cx="14" cy="22" rx="13" ry="5" fill="#D97706" />
        <rect x="1" y="18" width="26" height="4" fill="#F59E0B" />
        <ellipse cx="14" cy="18" rx="13" ry="5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.7" />

        <rect x="1" y="12" width="26" height="4" fill="#F59E0B" />
        <ellipse cx="14" cy="12" rx="13" ry="5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.7" />

        <rect x="1" y="6" width="26" height="4" fill="#F59E0B" />
        <ellipse cx="14" cy="6" rx="13" ry="5" fill="#FBBF24" stroke="#D97706" strokeWidth="0.7" />

        <rect x="1" y="0" width="26" height="4" fill="#F59E0B" />
        <ellipse cx="14" cy="0" rx="13" ry="5" fill="#FDE047" stroke="#D97706" strokeWidth="0.7" />
      </g>
    </svg>
  </div>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess,
  onShowToast,
  onNavigateToTab,
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [step, setStep] = useState<AuthStep>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const termsId = useId();

  // Reset state whenever opened or initialMode changed
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep('form');
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Masked email for display e.g. e*@domain.com or t*@gmail.com
  const getMaskedEmail = (val: string) => {
    if (!val) return 'e*@domain.com';
    const parts = val.split('@');
    if (parts.length !== 2) return val;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 1) return `${name}*@${domain}`;
    return `${name.charAt(0)}*@${domain}`;
  };

  // Real-time password validation criteria matching D12_Sign-Up
  const hasMinLength = password.length >= 12;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-=+~`[\]/\\]/.test(password);

  const isPasswordValid =
    hasMinLength && hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (!isPasswordValid) {
        setErrorMsg('Please fulfill all password requirements below.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Please agree to the privacy policy & terms.');
        return;
      }

      // Transition to D07 Verify Email Address popup
      setStep('verify-email');
      onShowToast?.(`Verification link sent to ${email}`);
    } else {
      // Sign In mode
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }
      onSuccess(email);
      onShowToast?.('Welcome back to MarketSyde!');
      onClose();
    }
  };

  const handleSocialLogin = (provider: 'Facebook' | 'Google' | 'Apple') => {
    const socialEmail = provider === 'Google' ? 'truvo654@gmail.com' : `${provider.toLowerCase()}user@marketsyde.com`;
    const socialName = provider === 'Google' ? 'Josh' : `${provider} User`;

    if (mode === 'signup') {
      setEmail(socialEmail);
      // In signup mode, clicking Google triggers the Verify Email Address flow (D07)
      setStep('verify-email');
      onShowToast?.(`Verification link sent to ${socialEmail}`);
    } else {
      // In signin mode, directly logs in
      onSuccess(socialEmail, socialName);
      onShowToast?.(`Signed in with ${provider}! Welcome to MarketSyde.`);
      onClose();
    }
  };

  const handleResendEmail = () => {
    onShowToast?.('📨 A new verification email has been sent!');
    setStep('verify-email');
  };

  const handleSimulateVerify = () => {
    // Verified! Set user as logged in and proceed to Onboarding #1 (D08)
    const verifiedEmail = email || 'truvo654@gmail.com';
    onSuccess(verifiedEmail, 'Josh');
    setStep('onboarding-1');
    onShowToast?.('✓ Email verified successfully!');
  };

  const handleFinishOnboarding = () => {
    onShowToast?.('🎉 Welcome to MarketSyde! Everything is ready.');
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-[999] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. D07: VERIFY EMAIL ADDRESS ("Almost There")
      ───────────────────────────────────────────────────────────── */}
      {step === 'verify-email' && (
        <div
          id="verify-email-modal-card"
          className="bg-white rounded-[28px] max-w-[460px] w-full p-7 sm:p-9 shadow-2xl border border-slate-200/90 relative text-left my-auto animate-in zoom-in-95 duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Envelope Graphic with Lime Checkmark */}
          <div className="pt-1 pb-4">
            <EnvelopeCheckIcon />
          </div>

          {/* Heading */}
          <h2 className="text-[22px] sm:text-2xl font-bold tracking-tight text-[#0b1c30]">
            Almost There
          </h2>

          {/* Sent Link Note */}
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            We&apos;ve sent a verification link to{' '}
            <span className="font-semibold text-[#5945F1]">{getMaskedEmail(email)}</span>.
          </p>

          {/* Explanatory instruction */}
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Click the link within 24 hours to activate your account. If it&apos;s not in your inbox, check your spam folder.
          </p>

          {/* Resend Verification Email Button (with circular dot indicator) */}
          <div className="mt-7">
            <button
              type="button"
              onClick={handleResendEmail}
              className="w-full py-3.5 px-6 rounded-full border border-indigo-200/90 hover:border-[#5945F1] hover:bg-indigo-50/40 text-[#5945F1] font-semibold text-sm transition-all flex items-center justify-center relative cursor-pointer group"
            >
              <span>Resend Verification Email</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#1b1c20] absolute right-4 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Can't find it? Contact Us */}
          <div className="mt-5 text-center text-xs sm:text-sm text-slate-500">
            Can&apos;t find it?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTab?.('contact-us');
              }}
              className="text-[#5945F1] font-semibold hover:underline cursor-pointer"
            >
              Contact Us
            </button>
          </div>

          {/* Interactive Simulation Helper for User & Tester */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Interactive Simulation:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulateVerify}
                className="py-1.5 px-2.5 rounded-lg bg-[#5945F1] text-white font-semibold text-xs hover:bg-[#4835e0] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Simulate: Click Link</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setStep('link-expired')}
                className="py-1.5 px-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Simulate: Link Expired</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. D09: VERIFICATION LINK EXPIRED
      ───────────────────────────────────────────────────────────── */}
      {step === 'link-expired' && (
        <div
          id="link-expired-modal-card"
          className="bg-white rounded-[28px] max-w-[460px] w-full p-7 sm:p-9 shadow-2xl border border-slate-200/90 relative text-left my-auto animate-in zoom-in-95 duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Broken Chain Link Graphic with Pink Sparks */}
          <div className="pt-1 pb-4">
            <BrokenLinkIcon />
          </div>

          {/* Heading */}
          <h2 className="text-[22px] sm:text-2xl font-bold tracking-tight text-[#0b1c30]">
            Verification Link Expired
          </h2>

          {/* Body Note */}
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            This link was only valid for 24 hours. Please request a new one to complete your verification.
          </p>

          {/* Resend Verification Email Button */}
          <div className="mt-7">
            <button
              type="button"
              onClick={handleResendEmail}
              className="w-full py-3.5 px-6 rounded-full border border-indigo-200/90 hover:border-[#5945F1] hover:bg-indigo-50/40 text-[#5945F1] font-semibold text-sm transition-all flex items-center justify-center relative cursor-pointer group"
            >
              <span>Resend Verification Email</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#1b1c20] absolute right-4 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Back to sign in */}
          <div className="mt-5 text-center text-xs sm:text-sm text-slate-500">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="text-[#5945F1] font-semibold hover:underline cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. D08: POP-UP ONBOARDING #1 ("You're in.")
      ───────────────────────────────────────────────────────────── */}
      {step === 'onboarding-1' && (
        <div
          id="onboarding-step1-card"
          className="bg-white rounded-[32px] max-w-[580px] w-full p-7 sm:p-10 shadow-2xl border border-slate-200/90 relative text-left my-auto animate-in zoom-in-95 duration-200 overflow-hidden"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Layout: Top Left Popper Icon + Title */}
          <div className="flex items-start gap-5 sm:gap-6">
            <OnboardingPopperBadge />
            <div className="pt-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0b1c30]">
                You&apos;re <span className="text-[#5945F1]">in</span>
                <span className="text-[#FD02B0]">.</span>
              </h2>
              <div className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
                Everything is ready for you to{' '}
                <span className="font-bold text-slate-900 relative inline-block">
                  start now.
                  {/* Lime green dot accent above "start" */}
                  <span className="absolute -top-1.5 left-1/4 w-2 h-2 rounded-full bg-[#DCF73B] ring-2 ring-white" />
                </span>
              </div>
            </div>
          </div>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8">
            {/* Card 1: Your first signals */}
            <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-[#5945F1] flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#5945F1]">
                Your first signals
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Live. Ready. Go check them.
              </div>
            </div>

            {/* Card 2: Your cashback rate */}
            <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-[#DCF73B] text-[#5945F1] font-black text-sm flex items-center justify-center mb-2 shadow-xs">
                $
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#5945F1]">
                Your cashback rate
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Earned on trades you&apos;re already making.
              </div>
            </div>

            {/* Card 3: Broker deals */}
            <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-[#FD02B0] text-white flex items-center justify-center mb-2 shadow-xs">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#5945F1]">
                Broker deals
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                Compare. Pick. Save time.
              </div>
            </div>
          </div>

          {/* Bottom Controls: Pagination Dots & Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#5945F1]" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setStep('onboarding-2')}
                className="py-2.5 pl-6 pr-11 rounded-full bg-[#5945F1] hover:bg-[#4734df] text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2 relative cursor-pointer group"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#1b1c20] absolute right-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. D10: POP-UP ONBOARDING #2 ("Trade more. Earn more.")
      ───────────────────────────────────────────────────────────── */}
      {step === 'onboarding-2' && (
        <div
          id="onboarding-step2-card"
          className="bg-white rounded-[32px] max-w-[580px] w-full p-7 sm:p-10 shadow-2xl border border-slate-200/90 relative text-left my-auto animate-in zoom-in-95 duration-200 overflow-hidden"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Layout: Title on Left, Trading Badge on Right */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#5945F1] leading-tight">
                Trade more.<br />
                Earn <span className="text-[#FD02B0]">more.</span>
              </h2>
              <div className="mt-2 text-sm sm:text-base text-slate-800 font-bold relative inline-block">
                It&apos;s that simple.
                {/* Lime green dot accent */}
                <span className="absolute -top-1.5 left-[42%] w-2 h-2 rounded-full bg-[#DCF73B] ring-2 ring-white" />
              </div>
            </div>
            <OnboardingTradingBadge />
          </div>

          {/* 2 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {/* Card 1: Rank up, get back more */}
            <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5">
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
            <div className="bg-[#f8f9fe] border border-indigo-100/60 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-[#FD02B0] flex items-center justify-center mb-2.5">
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
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#5945F1]" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep('onboarding-1')}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="py-2.5 px-6 rounded-full bg-[#5945F1] hover:bg-[#4734df] text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
              >
                Let&apos;s Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. BASE FORM: SIGN UP / SIGN IN (D12_Sign-Up)
      ───────────────────────────────────────────────────────────── */}
      {step === 'form' && (
        <div
          id="auth-modal-card"
          className="bg-white rounded-[24px] max-w-[440px] w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative text-left my-auto animate-in zoom-in-95 duration-200"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand Circular Logo with Wave 'm' */}
          <div className="w-11 h-11 rounded-full bg-[#5945F1] flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 32 32" className="w-6 h-6 fill-none">
              <path
                d="M 7.5 21 C 7.5 14, 9.5 10.5, 12.5 10.5 C 15 10.5, 16.5 13, 17.5 16 C 18.5 13, 20 10.5, 22.5 10.5 C 25 10.5, 26.5 14, 26.5 19.5"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="26.5" cy="20.5" r="2" fill="#CAEB0E" />
            </svg>
          </div>

          {/* Title and Tagline */}
          <div className="mt-4 mb-6">
            <h2 className="text-[22px] sm:text-2xl font-bold tracking-tight text-[#0b1c30]">
              {mode === 'signup' ? (
                <>
                  Create your accoun<span className="text-[#5945F1]">t</span>
                  <span className="text-[#FD02B0]">.</span>
                </>
              ) : (
                <>
                  Welcome bac<span className="text-[#5945F1]">k</span>
                  <span className="text-[#FD02B0]">.</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {mode === 'signup'
                ? 'Good decisions start somewhere.'
                : 'Log in to manage your cashback and trading accounts.'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label
                htmlFor={emailId}
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email address<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200/90 focus:border-[#5945F1] focus:ring-2 focus:ring-[#5945F1]/15 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={passwordId}
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password<span className="text-red-500 ml-0.5">*</span>
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() =>
                      onShowToast?.('Password reset instructions sent to your email.')
                    }
                    className="text-xs text-[#5945F1] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-indigo-200/90 focus:border-[#5945F1] focus:ring-2 focus:ring-[#5945F1]/15 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic Password Validation Requirements (Shown in Sign Up mode) */}
            {mode === 'signup' && (
              <div className="pt-0.5 space-y-1">
                <div className="text-[11px] sm:text-xs font-medium text-slate-500 mb-1">
                  Password must contain:
                </div>
                <ul className="space-y-1 text-xs">
                  <li
                    className={`flex items-center gap-2 ${
                      hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-400 text-[10px] w-3.5 text-center">✕</span>
                    )}
                    <span>At least 12 characters</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasLowerCase ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {hasLowerCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-400 text-[10px] w-3.5 text-center">✕</span>
                    )}
                    <span>At least 1 lower case letter</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasUpperCase ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {hasUpperCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-400 text-[10px] w-3.5 text-center">✕</span>
                    )}
                    <span>At least 1 upper case letter</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-400 text-[10px] w-3.5 text-center">✕</span>
                    )}
                    <span>At least 1 number</span>
                  </li>
                  <li
                    className={`flex items-center gap-2 ${
                      hasSpecialChar ? 'text-emerald-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {hasSpecialChar ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-400 text-[10px] w-3.5 text-center">✕</span>
                    )}
                    <span>At least 1 special character</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Privacy & Terms Checkbox */}
            {mode === 'signup' && (
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id={termsId}
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#5945F1] focus:ring-[#5945F1] accent-[#5945F1] cursor-pointer"
                />
                <label
                  htmlFor={termsId}
                  className="text-xs text-slate-600 cursor-pointer select-none"
                >
                  I agree to{' '}
                  <span className="text-slate-900 font-medium hover:underline">
                    privacy policy
                  </span>{' '}
                  &{' '}
                  <span className="text-slate-900 font-medium hover:underline">
                    terms
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#5945F1] hover:bg-[#4a36e0] active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
            >
              {mode === 'signup' ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* Divider: or */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Social Login Buttons: Facebook, Google, Apple */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="truncate">Facebook</span>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="truncate">Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-black shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.56.65-.99 1.7-0.87 2.72.99.08 1.97-.47 2.59-1.22z" />
              </svg>
              <span className="truncate">Apple</span>
            </button>
          </div>

          {/* Bottom Switch between Sign Up / Sign In */}
          <div className="mt-6 text-center text-xs text-slate-600">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className="text-[#5945F1] font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="text-[#5945F1] font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
