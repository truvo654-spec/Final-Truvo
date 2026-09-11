import React, { useState, useId } from 'react';
import { X, Eye, EyeOff, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signup' | 'signin';
  onClose: () => void;
  onSuccess: (email?: string, name?: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const termsId = useId();

  // Reset state whenever opened or mode changed
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

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

      // Success Sign Up
      onSuccess(email);
      if (onShowToast) {
        onShowToast('🎉 Account created successfully! Welcome to MarketSyde.');
      }
      onClose();
    } else {
      // Sign In mode
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }
      onSuccess(email);
      if (onShowToast) {
        onShowToast('Welcome back to MarketSyde!');
      }
      onClose();
    }
  };

  const handleSocialLogin = (provider: 'Facebook' | 'Google' | 'Apple') => {
    onSuccess(
      provider === 'Google'
        ? 'truvo654@gmail.com'
        : `${provider.toLowerCase()}user@marketsyde.com`,
      provider === 'Google' ? 'toh' : `${provider} User`
    );
    if (onShowToast) {
      onShowToast(`Signed in with ${provider}! Welcome to MarketSyde.`);
    }
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
    </div>
  );
};
