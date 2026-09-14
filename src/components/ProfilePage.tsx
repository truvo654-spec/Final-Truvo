import React, { useState, useEffect } from 'react';
import {
  Pencil,
  Info,
  ChevronRight,
  X,
  Camera,
  Upload,
  Check,
  Shield,
  CreditCard,
  Plus,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, Broker } from '../types';

interface ProfilePageProps {
  user: UserProfile;
  brokers: Broker[];
  onUpdateUserProfile: (updated: Partial<UserProfile>) => void;
  onOpenViewPlan: () => void;
  onShowToast: (msg: string) => void;
  onNavigateToBrokers?: () => void;
  onNavigateToCashback?: () => void;
  onNavigateToDashboard?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  brokers,
  onUpdateUserProfile,
  onOpenViewPlan,
  onShowToast,
  onNavigateToBrokers,
  onNavigateToCashback,
  onNavigateToDashboard,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'slots' | 'trading-accounts'>('profile');
  
  // Edit Profile Modal ("Change Things About You")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Extract initial names
  const [firstName, setFirstName] = useState(
    user.firstName && !user.firstName.toLowerCase().includes('josh')
      ? user.firstName
      : 'toh'
  );
  const [lastName, setLastName] = useState(
    user.lastName && !user.lastName.toLowerCase().includes('mcerror')
      ? user.lastName
      : ''
  );
  const [displayName, setDisplayName] = useState(
    user.username && !user.username.toLowerCase().includes('josh')
      ? user.username
      : 'toh'
  );
  const [bio, setBio] = useState(
    user.bio && !user.bio.toLowerCase().includes('josh')
      ? user.bio
      : 'toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.'
  );

  // Sync state if user prop changes or contains old mock data
  useEffect(() => {
    const isStale =
      user.username?.toLowerCase().includes('josh') ||
      user.fullName?.toLowerCase().includes('josh') ||
      user.fullName?.toLowerCase().includes('mcerror') ||
      user.email?.toLowerCase().includes('josh');

    if (isStale) {
      setFirstName('toh');
      setLastName('');
      setDisplayName('toh');
      setBio('toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.');
      onUpdateUserProfile({
        fullName: 'toh',
        firstName: 'toh',
        lastName: '',
        username: 'toh',
        email: 'truvo654@gmail.com',
        bio: 'toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.',
      });
    } else {
      setFirstName(user.firstName || 'toh');
      setLastName(user.lastName || '');
      setDisplayName(user.username || 'toh');
      setBio(user.bio || 'toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.');
    }
  }, [user]);

  // Edit Avatar Modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(user.avatar || '/toh-avatar.svg');

  // Sidebar tasks state (dismissible)
  const [sidebarTasks, setSidebarTasks] = useState([
    {
      id: 'axi',
      name: 'Axi',
      logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=60',
      title: 'Account approved?',
      subtitle: 'If ready, continue to next step',
      stepText: 'Register Account',
      badgeColor: 'bg-red-500',
    },
    {
      id: 'windsor',
      name: 'IB Partner',
      logo: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=100&auto=format&fit=crop&q=60',
      title: 'IB approved?',
      subtitle: 'If ready, continue to next step',
      stepText: 'Register Account',
      badgeColor: 'bg-teal-600',
    },
    {
      id: 'avatrade',
      name: 'AvaTrade',
      logo: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=100&auto=format&fit=crop&q=60',
      title: 'IB Transfer approved?',
      subtitle: 'If ready, continue to next step',
      stepText: 'Register Account',
      badgeColor: 'bg-indigo-700',
    },
  ]);

  // Saved slots mock
  const [savedSlots] = useState([
    {
      id: 'slot-1',
      brokerName: 'Axi MT5 Pro',
      rebateRate: '$8.50 / lot',
      status: 'Active',
      tradesThisMonth: 38,
      cashbackGenerated: '$323.00',
    },
    {
      id: 'slot-2',
      brokerName: 'IC Markets Raw ECN',
      rebateRate: '$5.50 / lot',
      status: 'Active',
      tradesThisMonth: 44,
      cashbackGenerated: '$242.00',
    },
  ]);

  // Trading accounts mock
  const [tradingAccounts] = useState([
    {
      id: 'acc-1',
      brokerName: 'Axi',
      accountNumber: '8829104',
      type: 'MT5 Live Pro',
      server: 'Axi-Live-US',
      currency: 'USD',
      balance: '$12,450.00',
      rebateTier: 'Tier 1 (+10% Boost)',
      status: 'Connected',
    },
    {
      id: 'acc-2',
      brokerName: 'IC Markets',
      accountNumber: '5510294',
      type: 'cTrader ECN',
      server: 'ICMarkets-Live-02',
      currency: 'USD',
      balance: '$8,200.00',
      rebateTier: 'Tier 1 (+10% Boost)',
      status: 'Connected',
    },
    {
      id: 'acc-3',
      brokerName: 'AvaTrade',
      accountNumber: '3391024',
      type: 'MT4 Standard',
      server: 'Ava-Real-4',
      currency: 'EUR',
      balance: '€5,600.00',
      rebateTier: 'Pending Transfer',
      status: 'In Review',
    },
    {
      id: 'acc-4',
      brokerName: 'Exness',
      accountNumber: '9920145',
      type: 'Raw Spread',
      server: 'Exness-Real-12',
      currency: 'USD',
      balance: '$15,890.00',
      rebateTier: 'Tier 1 (+10% Boost)',
      status: 'Connected',
    },
  ]);

  const handleSaveAboutYou = (e: React.FormEvent) => {
    e.preventDefault();
    const full = `${firstName.trim()} ${lastName.trim()}`.trim();
    onUpdateUserProfile({
      fullName: full,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: displayName.trim() || user.username,
      bio: bio.trim(),
    });
    setIsEditModalOpen(false);
    onShowToast('Profile information updated successfully!');
  };

  const handleSaveAvatar = () => {
    onUpdateUserProfile({
      avatar: tempAvatar,
    });
    setIsAvatarModalOpen(false);
    onShowToast('Profile picture updated successfully!');
  };

  const handleDismissTask = (id: string) => {
    setSidebarTasks((prev) => prev.filter((t) => t.id !== id));
    onShowToast('Task dismissed.');
  };

  const fullNameDisplay = user.fullName || `${firstName} ${lastName}`.trim() || 'Toh';
  const emailDisplay = user.email || 'truvo654@gmail.com';
  const bioDisplay =
    user.bio ||
    'Toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.';
  const displayNameVal = user.username || displayName || 'Toh';

  return (
    <div className="w-full py-2 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Quick Back Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="hover:text-[#5338ec] transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">Profile & Accounts</span>
        </div>

        {onNavigateToDashboard && (
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#5338ec] hover:border-indigo-200 hover:bg-indigo-50/40 transition-all cursor-pointer shadow-2xs"
          >
            <span>Back to Dashboard</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── LEFT / MAIN COLUMN ─── */}
        <div className="lg:col-span-8 space-y-7">
          {/* User Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar with Floating Edit Pencil Button */}
            <div className="relative group shrink-0 w-24 h-24 sm:w-28 sm:h-28">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200/80 bg-slate-100 shadow-sm">
                <img
                  src={user.avatar || '/toh-avatar.svg'}
                  alt={fullNameDisplay}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempAvatar(user.avatar || '/toh-avatar.svg');
                  setIsAvatarModalOpen(true);
                }}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#5338ec] hover:border-[#5338ec] shadow-sm flex items-center justify-center cursor-pointer transition-colors"
                title="Change profile photo"
              >
                <Pencil className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Name and Stats */}
            <div className="flex-1 space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight">
                {fullNameDisplay}
              </h1>

              {/* Stats Row with Vertical Dividers */}
              <div className="flex items-center gap-5 sm:gap-7 flex-wrap text-sm">
                {/* Slots Saved */}
                <div>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    <span>Slots Saved</span>
                    <span title="Number of broker rebate slots utilized" className="cursor-help text-slate-400 hover:text-slate-600">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-lg font-bold text-[#0b1c30] mt-0.5">
                    {user.slotsSaved ?? 2} <span className="text-slate-400 font-normal text-sm">/ {user.slotsTotal ?? 5}</span>
                  </div>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                {/* Trading Accounts */}
                <div>
                  <div className="text-slate-500 text-xs font-medium">Trading Accounts</div>
                  <div className="text-lg font-bold text-[#0b1c30] mt-0.5">
                    {user.tradingAccountsCount ?? 4}
                  </div>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                {/* Following */}
                <div>
                  <div className="text-slate-500 text-xs font-medium">Following</div>
                  <div className="text-lg font-bold text-[#0b1c30] mt-0.5">
                    {user.followingCount ?? 0}
                  </div>
                </div>

                <div className="h-7 w-[1px] bg-slate-200" />

                {/* Followers */}
                <div>
                  <div className="text-slate-500 text-xs font-medium">Followers</div>
                  <div className="text-lg font-bold text-[#0b1c30] mt-0.5">
                    {user.followersCount ?? 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('profile')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeSubTab === 'profile'
                    ? 'text-[#5338ec] border-b-2 border-[#5338ec] bg-indigo-50/40 -mb-[1px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('slots')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeSubTab === 'slots'
                    ? 'text-[#5338ec] border-b-2 border-[#5338ec] bg-indigo-50/40 -mb-[1px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Slots Saved
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('trading-accounts')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-xl transition-all cursor-pointer ${
                  activeSubTab === 'trading-accounts'
                    ? 'text-[#5338ec] border-b-2 border-[#5338ec] bg-indigo-50/40 -mb-[1px]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Trading Accounts
              </button>
            </div>
          </div>

          {/* ─── TAB CONTENT 1: PROFILE ─── */}
          {activeSubTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0b1c30]">About You</h2>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-[#5338ec] text-[#5338ec] bg-white text-xs font-semibold shadow-2xs hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Edit</span>
                </button>
              </div>

              {/* About You Card Container (Matching exact layout in Profile - Click Edit Photo.png) */}
              <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-2xs">
                {/* Row 1: Email (Soft Tinted Background) */}
                <div className="p-4 sm:p-5 bg-[#f1f5f9]/80 border-b border-[#e2e8f0]">
                  <div className="text-sm">
                    <span className="font-bold text-[#0b1c30]">Email:</span>{' '}
                    <span className="text-slate-700 font-medium ml-1.5">{emailDisplay}</span>
                  </div>
                </div>

                {/* Row 2: Full Name */}
                <div className="p-4 sm:p-5 border-b border-[#e2e8f0] space-y-1">
                  <div className="text-sm">
                    <span className="font-bold text-[#0b1c30]">Full Name:</span>{' '}
                    <span className="text-slate-800 font-medium ml-1.5">{fullNameDisplay}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your real name stays between us. We only use it to make sure you're really you.
                  </p>
                </div>

                {/* Row 3: Display Name */}
                <div className="p-4 sm:p-5 border-b border-[#e2e8f0] space-y-1">
                  <div className="text-sm">
                    <span className="font-bold text-[#0b1c30]">Display Name:</span>{' '}
                    <span className="text-slate-800 font-medium ml-1.5">{displayNameVal}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    This is how you'll appear to the community and how we'll greet you.
                  </p>
                </div>

                {/* Row 4: Bio */}
                <div className="p-4 sm:p-5 space-y-1.5">
                  <div className="text-sm font-bold text-[#0b1c30]">Bio:</div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                    {bioDisplay}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB CONTENT 2: SLOTS SAVED ─── */}
          {activeSubTab === 'slots' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0b1c30]">Broker Rebate Slots</h2>
                  <p className="text-xs text-slate-500">
                    You are utilizing {savedSlots.length} of your {user.slotsTotal ?? 5} allocated cashback slots.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToBrokers}
                  className="px-3 py-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Broker Slot</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-indigo-200 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[#0b1c30]">{slot.brokerName}</div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {slot.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div>
                        <div className="text-slate-400 text-[11px]">Rebate Rate</div>
                        <div className="font-bold text-slate-800">{slot.rebateRate}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[11px]">Generated This Month</div>
                        <div className="font-bold text-emerald-600">{slot.cashbackGenerated}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">{slot.tradesThisMonth} trades recorded</span>
                      <button
                        type="button"
                        onClick={onNavigateToCashback}
                        className="text-xs font-semibold text-[#5338ec] hover:underline flex items-center gap-1"
                      >
                        <span>View Ledger</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Empty Slot Placeholder */}
                <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2 min-h-[160px]">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-[#5338ec] flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800">Empty Slot Available (3 remaining)</div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Connect an additional trading partner to earn automatic multi-broker cashbacks.
                  </p>
                  <button
                    type="button"
                    onClick={onNavigateToBrokers}
                    className="mt-1 text-xs font-bold text-[#5338ec] hover:underline"
                  >
                    Browse Institutional Brokers →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB CONTENT 3: TRADING ACCOUNTS ─── */}
          {activeSubTab === 'trading-accounts' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0b1c30]">Linked Trading Accounts</h2>
                  <p className="text-xs text-slate-500">
                    Accounts verified and mapped to your Marketsyde IB rebate contract.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToBrokers}
                  className="px-3 py-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link New Account</span>
                </button>
              </div>

              <div className="space-y-3">
                {tradingAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-[#5338ec] text-xs">
                        {acc.brokerName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0b1c30]">{acc.brokerName}</span>
                          <span className="text-xs font-medium text-slate-500">#{acc.accountNumber}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {acc.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Server: {acc.server} • Currency: {acc.currency}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#0b1c30]">{acc.balance}</div>
                        <div className="text-[10.5px] text-emerald-600 font-semibold">{acc.rebateTier}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          acc.status === 'Connected'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Gamification Rank / Level Tracker */}
          <div className="rounded-2xl p-5 border-2 border-transparent bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/20 shadow-xs relative overflow-hidden ring-1 ring-slate-200/80">
            {/* Gradient Outline Accent */}
            <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/20 pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0b1c30] leading-snug">
                  Staying here is <span className="text-[#5338ec]">boring</span>
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
                    {/* Pink start dot */}
                    <div className="w-3 h-3 rounded-full bg-[#ec4899] shrink-0 shadow-2xs" />
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

                  {/* View Plan Button */}
                  <button
                    type="button"
                    onClick={onOpenViewPlan}
                    className="px-3 py-1.5 rounded-xl border border-[#5338ec] text-[#5338ec] hover:bg-indigo-50/60 text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    View Plan
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

      {/* ─── MODAL 1: "Change Things About You" (Matching Edit Picture Modal - Default.png) ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-indigo-100 shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                Change Things About You
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAboutYou} className="space-y-4 pt-4">
              {/* Full Name Fields (2 Columns) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full name<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:ring-2 focus:ring-[#5338ec]/10 transition-all"
                  />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:ring-2 focus:ring-[#5338ec]/10 transition-all"
                  />
                </div>
              </div>

              {/* Display Name Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you appear to others"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:ring-2 focus:ring-[#5338ec]/10 transition-all"
                />
              </div>

              {/* Bio Field with Character Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Bio</label>
                  <span
                    className={`text-xs ${
                      bio.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {bio.length}/160
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about your trading style, favorite instruments, or strategies..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:ring-2 focus:ring-[#5338ec]/10 transition-all resize-none"
                />
              </div>

              {/* Centered Save Changes Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] text-white font-semibold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: "Change Profile Picture" (Edit Picture Modal) ─── */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl border border-indigo-100 shadow-2xl p-6 relative animate-in zoom-in-95 duration-150 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-[#0b1c30]">
                Change Profile Picture
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm bg-slate-50">
                <img
                  src={tempAvatar || '/toh-avatar.svg'}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">Preview of your profile photo</span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Direct File Upload */}
              <label className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-[#5338ec] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload New Photo From Device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setTempAvatar(ev.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {/* Reset to Default Vector */}
              <button
                type="button"
                onClick={() => setTempAvatar('/toh-avatar.svg')}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Use Default High-Res Vector Avatar
              </button>

              {/* Or image URL */}
              <div>
                <label className="text-xs text-slate-500 block mb-1">Or paste image URL:</label>
                <input
                  type="text"
                  value={tempAvatar.startsWith('data:') ? '' : tempAvatar}
                  onChange={(e) => setTempAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#5338ec]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-5 py-2 rounded-xl bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
