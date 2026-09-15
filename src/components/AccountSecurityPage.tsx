import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Lock,
  Trash2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AccountSecurityPageProps {
  user: UserProfile;
  onShowToast: (msg: string) => void;
  onNavigateToTrade?: () => void;
  onNavigateToBrokers?: () => void;
}

export const AccountSecurityPage: React.FC<AccountSecurityPageProps> = ({
  user,
  onShowToast,
  onNavigateToTrade,
  onNavigateToBrokers,
}) => {
  // Password state
  const [hasPassword, setHasPassword] = useState(() => {
    return localStorage.getItem('marketsyde_has_password') === 'true';
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sidebar tasks state (matching screenshot)
  const [sidebarTasks, setSidebarTasks] = useState([
    {
      id: 'axi',
      name: 'Axi',
      title: 'Account approved?',
      subtitle: 'If ready, continue to next step',
      stepText: 'Register Account',
      badgeColor: 'bg-[#ff3b30]',
    },
    {
      id: 'windsor',
      name: 'IB Partner',
      title: 'IB approved?',
      subtitle: 'If ready, continue to next step',
      stepText: 'Register Account',
      badgeColor: 'bg-[#0f766e]',
    },
    {
      id: 'avatrade',
      name: 'AvaTrade',
      title: 'IB Transfer approved?',
      subtitle: 'If ready, continue to next step',
      stepText: 'Register Account',
      badgeColor: 'bg-[#3b49df]',
    },
  ]);

  // Validation rules for password
  const hasMinLength = password.length >= 12;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const isFormValid =
    hasMinLength && hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      onShowToast('Please fulfill all password requirements.');
      return;
    }
    localStorage.setItem('marketsyde_has_password', 'true');
    setHasPassword(true);
    setIsPasswordModalOpen(false);
    setPassword('');
    onShowToast('New password set successfully! Your account is now secured.');
  };

  const handleDismissTask = (id: string) => {
    setSidebarTasks((prev) => prev.filter((t) => t.id !== id));
    onShowToast('Task dismissed.');
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onShowToast('Account deletion scheduled for 30 days. You can cancel anytime.');
  };

  const emailDisplay = user.email || 'truvo654@gmail.com';

  return (
    <div className="w-full py-2 animate-in fade-in duration-200">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* ─── LEFT / MAIN COLUMN ─── */}
        <div className="flex-1 min-w-0 w-full space-y-8">
          {/* Header Title with authentic colored typography: 'Account Securit' + pink 'y' + lime '.' */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#4338ca] flex items-center">
              <span>Account Securit</span>
              <span className="text-[#ec4899]">y</span>
              <span className="text-[#c6f035]">.</span>
            </h1>
          </div>

          {/* SECTION 1: Sign In Credentials */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0b1c30]">Sign In Credentials</h2>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-indigo-100 transition-all">
              <div className="text-sm">
                <span className="font-bold text-[#0b1c30]">Email:</span>{' '}
                <span className="text-slate-700 font-medium ml-1.5">{emailDisplay}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPassword('');
                  setIsPasswordModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer self-start sm:self-auto"
              >
                {hasPassword ? 'Change Password' : 'Add Password'}
              </button>
            </div>
          </div>

          {/* SECTION 2: Third-Party Connections */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0b1c30]">Third-Party Connections</h2>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 flex items-center justify-between shadow-2xs hover:border-indigo-100 transition-all">
              <div className="flex items-center gap-3.5">
                {/* 4-Color Google G Logo */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-2xs border border-slate-100 shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0b1c30]">Google</div>
                  <div className="text-xs text-slate-500 mt-0.5">Added on Mar 4, 2026</div>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Connected
              </span>
            </div>
          </div>

          {/* SECTION 3: Account Deletion */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0b1c30]">Account Deletion</h2>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-red-100 transition-all">
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                We'd hate to see you go, but if this is your final decision, your account will be
                deleted in 30 days. Until then, you're welcome back anytime.
              </p>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#fef2f2] hover:bg-[#fee2e2] text-[#ef4444] border border-red-100 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR (Fixed 300px on LG) (Sticky during scroll) ─── */}
        <div className="w-full lg:w-[300px] lg:shrink-0">
          <div className="space-y-6 lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar">
          {/* Card 1: Gamification Rank / Level Tracker (Exact match to 02. Account Security Landing.png) */}
          <div className="rounded-2xl p-5 border-2 border-transparent bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/20 shadow-xs relative overflow-hidden ring-1 ring-slate-200/80">
            {/* Gradient Outline Accent */}
            <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] leading-snug">
                  Staying here is <span className="text-[#0b1c30]">boring</span>
                  <span className="text-[#ec4899]">.</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Make some trades and level up your rank automatically!
                </p>
              </div>

              {/* Stepper Graphic with dots and lime indicator */}
              <div className="pt-2 pb-1">
                <div className="flex items-center justify-between gap-2">
                  {/* Stepper nodes */}
                  <div className="flex items-center gap-2 flex-1">
                    {/* Pink 'You' start dot */}
                    <div className="flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#ec4899] shrink-0 shadow-2xs" />
                      <span className="text-[11px] font-bold text-[#ec4899] mt-1">You</span>
                    </div>

                    <div className="h-[2px] flex-1 bg-gradient-to-r from-[#ec4899] to-[#6366f1]" />

                    {/* Active Climber node */}
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-[#6366f1] bg-white flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                      </div>
                      <span className="text-[11px] font-bold text-[#4338ca] mt-1">Climber</span>
                    </div>

                    <div className="h-[2px] flex-1 bg-slate-200" />
                  </div>

                  {/* Trade Now Button */}
                  <button
                    type="button"
                    onClick={onNavigateToTrade}
                    className="px-4 py-2 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    Trade Now
                  </button>
                </div>

                {/* Curved Arrow & Bright Lime Indicator Pill */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="text-[#6366f1] text-xs">⤴</span>
                  <span className="px-3 py-1 rounded-full bg-[#c6f035] text-[#0f172a] text-xs font-bold shadow-2xs inline-flex items-center gap-1">
                    Just 44 lots and you're here!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pick up where you left off */}
          <div className="rounded-2xl p-5 bg-[#f8fafc] border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <div
                onClick={onNavigateToBrokers}
                className="flex items-center justify-between text-sm font-bold text-[#0b1c30] cursor-pointer group"
              >
                <span className="group-hover:text-[#5338ec] transition-colors">
                  Pick up where you left off. &gt;
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Complete your account connection to access tiered trading cashback.
              </p>
            </div>

            {/* List of Tasks */}
            <div className="space-y-4 pt-1">
              {sidebarTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Broker square logo */}
                    <div
                      className={`w-9 h-9 rounded-lg ${task.badgeColor} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs`}
                    >
                      {task.name.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#0b1c30] truncate">{task.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{task.subtitle}</div>
                    </div>
                  </div>

                  {/* Step Progress Line */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shrink-0" />
                    <div className="h-[2px] flex-1 bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-white shrink-0" />
                    <span className="text-[10.5px] text-slate-500 font-medium whitespace-nowrap">
                      {task.stepText}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onShowToast(`Redirecting to complete ${task.name} verification...`);
                        onNavigateToBrokers?.();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#c6f035] hover:bg-[#b8e329] text-black font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Continue
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissTask(task.id)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}

              {sidebarTasks.length === 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-100 text-center text-xs text-slate-500 space-y-1">
                  <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  <div className="font-semibold text-slate-800">All tasks completed!</div>
                  <p className="text-[11px]">Your linked trading accounts are in sync.</p>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: "Create New Password" (Exact match to 03. Create Password - Empty.png) ─── */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl border border-indigo-100 shadow-2xl p-6 sm:p-7 relative animate-in zoom-in-95 duration-150 space-y-5">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Top Left Icon Placeholder (as seen in screenshot 03) */}
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs">
              <Lock className="w-5 h-5 stroke-[2] text-slate-700" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-[#4338ca] flex items-center">
                <span>Create New Passwor</span>
                <span className="text-[#ec4899]">d</span>
                <span className="text-[#c6f035]">.</span>
              </h3>
              <p className="text-xs text-slate-500">
                Choose a new password to keep your account secure.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePassword} className="space-y-4">
              {/* Password Input with eye toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#5338ec] focus:ring-2 focus:ring-[#5338ec]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-800">Password must contain:</div>
                <div className="space-y-1.5 text-xs">
                  {/* Rule 1: 12 chars */}
                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                    )}
                    <span>At least 12 characters</span>
                  </div>

                  {/* Rule 2: Lower case */}
                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      hasLowerCase ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {hasLowerCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                    )}
                    <span>At least 1 lower case letter</span>
                  </div>

                  {/* Rule 3: Upper case */}
                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      hasUpperCase ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {hasUpperCase ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                    )}
                    <span>At least 1 upper case letter</span>
                  </div>

                  {/* Rule 4: Number */}
                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                    )}
                    <span>At least 1 number</span>
                  </div>

                  {/* Rule 5: Special char */}
                  <div
                    className={`flex items-center gap-2 transition-colors ${
                      hasSpecialChar ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {hasSpecialChar ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                    )}
                    <span>At least 1 special character</span>
                  </div>
                </div>
              </div>

              {/* Set New Password Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-sm ${
                    isFormValid
                      ? 'bg-[#5338ec] hover:bg-[#4326d8] text-white shadow-md'
                      : 'bg-indigo-300 text-white cursor-not-allowed opacity-80'
                  }`}
                >
                  Set New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Delete Account Confirmation ─── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl border border-red-100 shadow-2xl p-6 relative space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Are you sure?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your account will be placed into a 30-day grace period. You can sign in anytime
                before the period ends to cancel deletion.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Never mind
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer shadow-sm"
              >
                Schedule Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
