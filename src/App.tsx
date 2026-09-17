import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  INITIAL_BROKERS,
  INITIAL_SIGNALS,
  QUICK_START_STEPS,
  PERFORMANCE_DATA,
  LEADERBOARD_USERS,
  RECENT_TRADES,
  INITIAL_COMMUNITY_POSTS,
  COMMUNITY_CHALLENGES,
  TOP_CONTRIBUTORS,
  INITIAL_MISSIONS,
  INITIAL_ACTIVITY_LOGS,
} from './data/mockData';
import {
  Broker,
  MarketSignal,
  UserProfile,
  CommunityPost,
  CommunityChallenge,
  TopContributor,
  Mission,
  ActivityLogItem,
} from './types';
import { LEVEL_SCENARIOS, LevelScenarioId, applyLevelScenarioToUser, getTierForPoints } from './data/levelScenarios';
import { Header } from './components/Header';
import { ReferenceDashboard } from './components/ReferenceDashboard';
import { DashboardBentoGrid } from './components/DashboardBentoGrid';
import { BrokerDirectory } from './components/BrokerDirectory';
import { BrokerListPage } from './components/brokers/BrokerListPage';
import { BrokerDetailPage } from './components/brokers/BrokerDetailPage';
import { BrokerRebateTablePage } from './components/brokers/BrokerRebateTablePage';
import { BrokerComparisonPage } from './components/brokers/BrokerComparisonPage';
import { MembershipPlanPage } from './components/membership/MembershipPlanPage';
import { SignalsList } from './components/SignalsList';
import { CommunityHub } from './components/CommunityHub';
import { CommunityPage } from './components/community/CommunityPage';
import { LeaderboardCard } from './components/LeaderboardCard';
import { PointsAndCreditsView } from './components/PointsAndCreditsView';
import { LevelPointsGuideView } from './components/LevelPointsGuideView';
import { CreditEarningGuideView } from './components/CreditEarningGuideView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { AboutUsPage } from './components/AboutUsPage';
import { ContactUsPage } from './components/ContactUsPage';
import { PublicLandingPage } from './components/PublicLandingPage';
import { CashbackOverviewPage } from './components/CashbackOverviewPage';
import { ConnectToTruvoPage } from './components/ConnectToTruvoPage';
import { ActiveTradingAccountsPage } from './components/dashboard/ActiveTradingAccountsPage';
import { TradingSignalsPage } from './components/TradingSignalsPage';
import { TradingSignalDetailPage } from './components/signals/TradingSignalDetailPage';
import { InstrumentAnalysisPage } from './components/InstrumentAnalysisPage';
import { ProfilePage } from './components/ProfilePage';
import { AccountSecurityPage } from './components/AccountSecurityPage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { LeverageCalculatorPage } from './components/calculators/LeverageCalculatorPage';
import { SavedCalculation, INITIAL_SAVED_CALCULATIONS } from './components/calculators/savedCalculationsTypes';
import { TradingCalculatorsModal, CalculatorType } from './components/calculators/TradingCalculatorsModal';
import { ActivityLogModal } from './components/ActivityLogModal';
import { EarningRewardModal, EarningRewardData } from './components/EarningRewardModal';
import { Footer } from './components/Footer';
import { TermsAndConditionsPage } from './components/TermsAndConditionsPage';
import { ConnectBrokerModal } from './components/ConnectBrokerModal';
import { ViewPlanModal } from './components/ViewPlanModal';
import { SignalDetailModal } from './components/SignalDetailModal';
import { CashbackLedgerModal } from './components/CashbackLedgerModal';
import { BrokerComparisonModal } from './components/BrokerComparisonModal';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';
import { ErrorPageView, Error404Page, Error500Page, Error503Page } from './components/errors';
import { Sparkles, Trophy, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const KNOWN_APP_TABS = new Set([
  'terms-and-conditions',
  'terms',
  'points-credits',
  'activity-logs',
  'level-points-guide',
  'credit-earning-guide',
  'dashboard',
  'landing',
  'home',
  'brokers',
  'broker-comparison',
  'member-plan',
  'broker-detail',
  'broker-rebate-table',
  'signals',
  'signal-detail',
  'instrument-analysis',
  'profile',
  'account-security',
  'notifications',
  'community',
  'cashback-overview',
  'active-trading-accounts',
  'connect-to-truvo',
  'leverage-calculator',
  'volatility-calculator',
  'spread-calculator',
  'pip-calculator',
  'pips-calculator',
  'margin-calculator',
  'rebate-calculator',
  'trade-planning-calculator',
  'position-size-calculator',
  'sltp-calculator',
  'stop-out-calculator',
  'fibonacci-calculator',
  'pivot-point-calculator',
  'loss-calculator',
  'profit-loss-calculator',
  'drawdown-calculator',
  'compound-calculator',
  'performance-calculator',
  'timezone-converter',
  'trading-timezone-converter',
  'currency-converter',
  'conversion-calculator',
  'calculators',
  'leaderboard',
  'about',
  'contact-us',
  'contact',
  '500',
  'server-error',
  '503',
  'maintenance',
  'service-unavailable',
  '404',
  'not-found',
]);

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('marketsyde_user_profile');
      const savedAvatar = localStorage.getItem('marketsyde_user_avatar');
      let base = INITIAL_USER;
      if (savedUser) {
        base = { ...base, ...JSON.parse(savedUser) };
      }
      if (savedAvatar) {
        base = { ...base, avatar: savedAvatar };
      }
      if (!savedAvatar || savedAvatar.includes('dicebear') || savedAvatar.includes('api.dicebear.com')) {
        base = { ...base, avatar: '/toh-avatar.svg' };
        localStorage.setItem('marketsyde_user_avatar', '/toh-avatar.svg');
      }
      if (
        !base.username ||
        base.username.toLowerCase().includes('josh') ||
        base.fullName?.toLowerCase().includes('josh') ||
        base.fullName?.toLowerCase().includes('mcerror') ||
        base.email?.toLowerCase().includes('josh')
      ) {
        base = {
          ...base,
          username: 'toh',
          fullName: 'toh',
          firstName: 'toh',
          lastName: '',
          email: 'truvo654@gmail.com',
          bio: 'toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.',
          avatar: '/toh-avatar.svg',
        };
        localStorage.setItem('marketsyde_user_profile', JSON.stringify(base));
      }
      return base;
    } catch (e) {
      return INITIAL_USER;
    }
  });

  // Ensure full app state and localStorage are strictly synced to toh
  useEffect(() => {
    const raw = localStorage.getItem('marketsyde_user_profile');
    if (
      !raw ||
      raw.toLowerCase().includes('josh') ||
      raw.toLowerCase().includes('mcerror') ||
      user.username?.toLowerCase().includes('josh') ||
      user.fullName?.toLowerCase().includes('josh')
    ) {
      const sanitized: UserProfile = {
        ...user,
        username: 'toh',
        fullName: 'toh',
        firstName: 'toh',
        lastName: '',
        email: 'truvo654@gmail.com',
        bio: 'toh trades forex and indices. Focused on market structure, disciplined risk management, and building automated trading systems.',
        avatar: user.avatar && !user.avatar.includes('dicebear') ? user.avatar : '/toh-avatar.svg',
      };
      setUser(sanitized);
      try {
        localStorage.setItem('marketsyde_user_profile', JSON.stringify(sanitized));
        localStorage.setItem('marketsyde_user_avatar', sanitized.avatar);
      } catch (e) {}
    }
  }, [user.username, user.fullName]);

  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('marketsyde_user_profile', JSON.stringify(next));
        if (updated.avatar) {
          localStorage.setItem('marketsyde_user_avatar', updated.avatar);
        }
      } catch (e) {}
      return next;
    });
  };

  const handleUpdateAvatar = (newAvatar: string) => {
    handleUpdateUserProfile({ avatar: newAvatar });
  };

  const [brokers, setBrokers] = useState<Broker[]>(INITIAL_BROKERS);
  const [signals, setSignals] = useState<MarketSignal[]>(INITIAL_SIGNALS);
  const [quickSteps, setQuickSteps] = useState(QUICK_START_STEPS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Community state
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [communityChallenges, setCommunityChallenges] = useState<CommunityChallenge[]>(COMMUNITY_CHALLENGES);
  const [topContributors, setTopContributors] = useState<TopContributor[]>(TOP_CONTRIBUTORS);
  const [selectedInstrumentForCommunity, setSelectedInstrumentForCommunity] = useState<string | null>(null);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedBrokerForConnect, setSelectedBrokerForConnect] = useState<Broker | null>(null);
  const [connectReturnTab, setConnectReturnTab] = useState<string>('dashboard');
  const [selectedBrokerForDetail, setSelectedBrokerForDetail] = useState<Broker>(brokers[0] || INITIAL_BROKERS[0]);
  const [comparisonInitialBroker, setComparisonInitialBroker] = useState<Broker | null>(null);
  const [isViewPlanOpen, setIsViewPlanOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<MarketSignal | null>(null);
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [isBrokerComparisonOpen, setIsBrokerComparisonOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [selectedCalculatorType, setSelectedCalculatorType] = useState<CalculatorType>('forex');
  const [earningRewardModal, setEarningRewardModal] = useState<EarningRewardData | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Auth State: default to false (or stored preference) so user can test "ยังไม่ได้ sign up" flow
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('marketsyde_is_logged_in');
      return stored !== null ? stored === 'true' : false;
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'signin'>('signup');

  const handleAuthSuccess = (email?: string, name?: string) => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('marketsyde_is_logged_in', 'true');
    } catch {}

    if (email) {
      setUser((prev) => ({
        ...prev,
        email: email,
        username: name || (email.split('@')[0]) || prev.username,
        fullName: name || prev.fullName,
      }));
    }
    showToast('🎉 Welcome to MarketSyde! You are now signed in.');

    // If currently on broker-detail, immediately navigate to Connect to MarketSyde (D12_Connect to MarketSyde.png)
    if (activeTab === 'broker-detail') {
      setSelectedBrokerForConnect(selectedBrokerForDetail);
      setActiveTab('connect-to-truvo');
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('marketsyde_is_logged_in', 'false');
    } catch {}
    showToast("You've been signed out. Welcome back anytime!");
  };

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K opens Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Saved Calculations State lifted to App level for real-time synchronization between Calculator & Profile
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const stored = localStorage.getItem('marketsyde_saved_calculations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SAVED_CALCULATIONS;
  });
  const [pendingLoadedCalculation, setPendingLoadedCalculation] = useState<SavedCalculation | null>(null);

  const handleUpdateSavedCalculations = (calcs: SavedCalculation[]) => {
    setSavedCalculations(calcs);
    try {
      localStorage.setItem('marketsyde_saved_calculations', JSON.stringify(calcs));
    } catch {}
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Gamification: Reward points with tier upgrade checking
  const handleRewardPoints = (pointsToAdd: number, reason?: string) => {
    handleRewardPointsAndCredits(pointsToAdd, 0, reason);
  };

  // Gamification: Reward both points & Syde Credits with tier upgrade and activity log
  const handleRewardPointsAndCredits = (pointsToAdd: number, creditsToAdd: number, reason?: string) => {
    setUser((prev) => {
      const newPoints = prev.currentPoints + pointsToAdd;
      const newCredits = prev.sydeCredits + creditsToAdd;
      const tierInfo = getTierForPoints(newPoints);

      if (tierInfo.level > prev.tierLevel) {
        showToast(`🎉 Level Up! You reached Level ${tierInfo.level} (${tierInfo.rankTitle}) with +${tierInfo.boostPercentage}% Cashback Boost!`);
      } else if (reason) {
        if (creditsToAdd > 0) {
          showToast(`💎 +${pointsToAdd} Pts • 🪙 +${creditsToAdd} Credits: ${reason}`);
        } else {
          showToast(`💎 +${pointsToAdd} Points: ${reason}`);
        }
      }

      return {
        ...prev,
        currentPoints: newPoints,
        sydeCredits: newCredits,
        rankTitle: tierInfo.rankTitle,
        tierLevel: tierInfo.level,
        maxPoints: tierInfo.maxPoints,
        boostPercentage: tierInfo.boostPercentage,
        perks: tierInfo.perks,
      };
    });

    // Add to activity logs for real-time synchronization with Points & Credits view
    const newLogItem: ActivityLogItem = {
      id: `act-${Date.now()}`,
      title: reason || 'Community Activity',
      description: `Earned from trading community engagement and alpha sharing`,
      pointsChange: pointsToAdd,
      creditsChange: creditsToAdd,
      timestamp: 'Just now',
      type: pointsToAdd > 0 && creditsToAdd > 0 ? 'both' : creditsToAdd > 0 ? 'credits' : 'points',
      category: 'Bonus',
    };
    setActivityLogs((prev) => [newLogItem, ...prev]);
  };

  // Gamification: Earn demo points
  const handleAddDemoPoints = () => {
    handleRewardPointsAndCredits(25, 5, 'Trader Level Progress');
  };

  // Trigger Earning Modals (Quest Complete, Mission Complete, Trade Complete)
  const handleTriggerEarningReward = (data: EarningRewardData) => {
    setEarningRewardModal(data);
    if (data.credits) {
      setUser((prev) => ({
        ...prev,
        sydeCredits: prev.sydeCredits + data.credits!,
      }));
    }
    if (data.points) {
      handleRewardPoints(data.points, data.title || 'Reward Earning');
    }
  };

  // User Level Scenario Switcher (Rookie, Climber, Player, Boss)
  const handleSelectLevelScenario = (scenarioId: LevelScenarioId) => {
    setUser((prev) => {
      const updated = applyLevelScenarioToUser(prev, scenarioId);
      try {
        localStorage.setItem('marketsyde_user_profile', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      const scenario = LEVEL_SCENARIOS.find((s) => s.id === scenarioId);
      showToast(`🎮 Switched to ${scenario?.label || scenarioId} (Level ${scenario?.level}) scenario! Features updated.`);
      return updated;
    });
  };

  // Connect broker callback
  const handleBrokerConnected = (brokerId: string, accountId: string) => {
    setBrokers((prev) =>
      prev.map((b) =>
        b.id === brokerId ? { ...b, connected: true, connectedAccountId: accountId } : b
      )
    );

    // Update user points and step
    handleRewardPoints(50, `Linked Account ${accountId}`);
    setUser((prev) => ({
      ...prev,
      connectedBrokersCount: prev.connectedBrokersCount + 1,
    }));

    setQuickSteps((prev) =>
      prev.map((s) => (s.step === 2 ? { ...s, completed: true } : s))
    );

    // Trigger Trade Active modal reward!
    handleTriggerEarningReward({
      type: 'trade',
      points: 20,
      credits: 10,
    });
  };

  const handleStepClick = (index: number) => {
    if (index === 0) {
      setActiveTab('brokers');
    } else if (index === 1) {
      setSelectedBrokerForConnect(brokers.find((b) => !b.connected) || brokers[1]);
      setIsConnectModalOpen(true);
    } else if (index === 2) {
      setActiveTab('signals');
    } else if (index === 3) {
      setIsLedgerOpen(true);
    }
  };

  const handleToggleStep = (index: number) => {
    setQuickSteps((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleSelectSignalByTicker = (ticker: string) => {
    const found = signals.find((s) => s.ticker.toLowerCase() === ticker.toLowerCase());
    if (found) {
      setSelectedSignal(found);
      setIsSignalModalOpen(true);
    } else {
      setActiveTab('signals');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#090119] text-[#0b1c30] dark:text-white transition-colors duration-200">
      {/* Top Header */}
      <Header
        user={user}
        signals={signals}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConnectModal={() => {
          setSelectedBrokerForConnect(brokers.find((b) => !b.connected) || brokers[0]);
          setIsConnectModalOpen(true);
        }}
        onOpenViewPlan={() => setActiveTab('member-plan')}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenBrokerComparison={() => setActiveTab('broker-comparison')}
        onOpenCalculator={(calcType, subTool) => {
          if (calcType === 'forex') {
            setActiveTab('leverage-calculator');
          } else if (
            calcType === 'planning' ||
            calcType === 'trade-planning' ||
            calcType === 'trade-planning-calculator' ||
            calcType === 'position-size'
          ) {
            if (subTool === 'sltp') {
              setActiveTab('sltp-calculator');
            } else if (subTool === 'stop-out') {
              setActiveTab('stop-out-calculator');
            } else {
              // Default to Position Size calculator
              setActiveTab('position-size-calculator');
            }
          } else if (
            calcType === 'technical' ||
            calcType === 'technical-calculator' ||
            calcType === 'fibonacci' ||
            calcType === 'pivot-point'
          ) {
            if (subTool === 'pivot-point' || calcType === 'pivot-point') {
              setActiveTab('pivot-point-calculator');
            } else {
              // Default to Fibonacci calculator
              setActiveTab('fibonacci-calculator');
            }
          } else if (
            calcType === 'performance' ||
            calcType === 'performance-calculator' ||
            calcType === 'profit-loss' ||
            calcType === 'loss' ||
            calcType === 'drawdown' ||
            calcType === 'compound'
          ) {
            if (subTool === 'drawdown' || calcType === 'drawdown') {
              setActiveTab('drawdown-calculator');
            } else if (subTool === 'compound' || calcType === 'compound') {
              setActiveTab('compound-calculator');
            } else {
              // Default to Profit/Loss calculator
              setActiveTab('profit-loss-calculator');
            }
          } else if (
            calcType === 'conversion' ||
            calcType === 'conversion-calculator' ||
            calcType === 'converters' ||
            calcType === 'timezone' ||
            calcType === 'trading-timezone' ||
            calcType === 'currency'
          ) {
            if (subTool === 'currency' || calcType === 'currency') {
              setActiveTab('currency-converter');
            } else {
              // Default to Trading Timezone Converter
              setActiveTab('timezone-converter');
            }
          } else {
            setSelectedCalculatorType(calcType as CalculatorType);
            setIsCalculatorModalOpen(true);
          }
        }}
        onNavigateToCashbackOverview={() => setActiveTab('cashback-overview')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onShowToast={showToast}
        onUpdateAvatar={handleUpdateAvatar}
        onSelectLevelScenario={handleSelectLevelScenario}
        isLoggedIn={isLoggedIn}
        onOpenSignIn={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }}
        onOpenSignUp={() => {
          setAuthModalMode('signup');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      {/* Floating Toast Notification with Spring Physics */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#c6f831] shrink-0 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Container */}
      <main className={`flex-1 w-full ${
        activeTab === 'about' ||
        activeTab === 'contact-us' ||
        activeTab === 'contact' ||
        activeTab === 'landing' ||
        activeTab === 'home' ||
        activeTab === 'instrument-analysis' ||
        activeTab === '404' ||
        activeTab === 'not-found' ||
        activeTab === '500' ||
        activeTab === 'server-error' ||
        activeTab === '503' ||
        activeTab === 'maintenance' ||
        activeTab === 'service-unavailable' ||
        !KNOWN_APP_TABS.has(activeTab) ||
        (!isLoggedIn && activeTab === 'dashboard') ||
        (!isLoggedIn && activeTab === 'member-plan')
          ? 'p-0 space-y-0 pt-[84px]'
          : 'px-4 sm:px-8 md:px-[56px] pt-[100px] pb-12 space-y-6'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, scale: 0.996 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.996 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* ─── TAB 0: Mission, Points & Credits (User Reference Focus) ─── */}
            {activeTab === 'points-credits' && (
          <PointsAndCreditsView
            user={user}
            missions={missions}
            signals={signals}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onUpdateMissions={setMissions}
            onAddActivityLog={(log) => {
              setActivityLogs((prev) => [log, ...prev]);
              showToast(`Activity Logged: ${log.title}`);
            }}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onOpenLevelPointsGuide={() => setActiveTab('level-points-guide')}
            onOpenCreditEarningGuide={() => setActiveTab('credit-earning-guide')}
            onOpenActivityLog={() => setActiveTab('activity-logs')}
            onNavigateToSignals={() => setActiveTab('signals')}
            onSelectSignal={(signal) => {
              setSelectedSignal(signal);
              setIsSignalModalOpen(true);
            }}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onTriggerEarningModal={handleTriggerEarningReward}
          />
        )}

        {/* ─── TAB: Activity Logs (Matching Exact Reference Design) ─── */}
        {activeTab === 'activity-logs' && (
          <ActivityLogsView
            user={user}
            activityLogs={activityLogs}
            onBackToMissions={() => setActiveTab('points-credits')}
            onNavigateToSignals={() => setActiveTab('signals')}
          />
        )}

        {/* ─── TAB: Level Points Guide (Requested from Rookie Card 'Learn More') ─── */}
        {activeTab === 'level-points-guide' && (
          <LevelPointsGuideView
            user={user}
            onBackToMissions={() => setActiveTab('points-credits')}
          />
        )}

        {/* ─── TAB: Credit Earning Guide (Requested from Syde Credits Card 'Learn More') ─── */}
        {activeTab === 'credit-earning-guide' && (
          <CreditEarningGuideView
            user={user}
            onBackToMissions={() => setActiveTab('points-credits')}
          />
        )}

        {/* ─── TAB 1: Bento Grid Dashboard Matching Reference (or Public Landing Page if guest) ─── */}
        {activeTab === 'dashboard' && (
          !isLoggedIn ? (
            <PublicLandingPage
              onOpenSignUp={() => {
                setAuthModalMode('signup');
                setIsAuthModalOpen(true);
              }}
              onOpenSignIn={() => {
                setAuthModalMode('signin');
                setIsAuthModalOpen(true);
              }}
              onNavigateToBrokers={() => setActiveTab('brokers')}
              onNavigateToSignals={() => setActiveTab('signals')}
              onNavigateToPlan={() => setActiveTab('member-plan')}
              onNavigateToTab={setActiveTab}
            />
          ) : (
            <ReferenceDashboard
              user={user}
              brokers={brokers}
              signals={signals}
              quickSteps={quickSteps}
              performanceData={PERFORMANCE_DATA}
              leaderboardUsers={LEADERBOARD_USERS}
              onOpenViewPlan={() => setActiveTab('member-plan')}
              onAddDemoPoints={handleAddDemoPoints}
              onStepClick={handleStepClick}
              onToggleStep={handleToggleStep}
              onOpenConnectModal={(broker) => {
                setSelectedBrokerForConnect(broker || brokers[0]);
                setIsConnectModalOpen(true);
              }}
              onOpenLedger={() => setIsLedgerOpen(true)}
              onSelectSignal={(sig) => {
                setSelectedSignal(sig);
                setIsSignalModalOpen(true);
              }}
              onNavigateToTab={setActiveTab}
              onNavigateToConnectBroker={(broker) => {
                if (broker) setSelectedBrokerForConnect(broker);
                setActiveTab('connect-to-truvo');
              }}
              onSelectBrokerDetail={(broker) => {
                setSelectedBrokerForDetail(broker);
                setActiveTab('broker-detail');
              }}
              onTriggerEarningModal={handleTriggerEarningReward}
              onOpenSearchModal={() => setIsSearchModalOpen(true)}
              onShowToast={showToast}
            />
          )
        )}

        {/* ─── Explicit Landing/Home Tab ─── */}
        {(activeTab === 'landing' || activeTab === 'home') && (
          <PublicLandingPage
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            onOpenSignIn={() => {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
            }}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToSignals={() => setActiveTab('signals')}
            onNavigateToPlan={() => setActiveTab('member-plan')}
            onNavigateToTab={setActiveTab}
          />
        )}

        {/* ─── TAB 2: Broker List Landing Page (Matching Broker List_Landing Page (2).png) ─── */}
        {activeTab === 'brokers' && (
          <BrokerListPage
            brokers={brokers}
            user={user}
            onSelectBrokerDetail={(broker) => {
              setSelectedBrokerForDetail(broker);
              setActiveTab('broker-detail');
            }}
            onConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setActiveTab('connect-to-truvo');
            }}
            onOpenComparison={(b) => {
              if (b) {
                setComparisonInitialBroker(b);
              }
              setActiveTab('broker-comparison');
            }}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: Broker Comparison Page (Exact match to D02-D08: Compare CFD Brokers) ─── */}
        {activeTab === 'broker-comparison' && (
          <BrokerComparisonPage
            brokers={brokers}
            user={user}
            signals={signals}
            isLoggedIn={isLoggedIn}
            initialBroker={comparisonInitialBroker}
            onToggleAuthState={(loggedIn) => {
              setIsLoggedIn(loggedIn);
              try {
                localStorage.setItem('marketsyde_is_logged_in', String(loggedIn));
              } catch {}
              showToast(
                loggedIn
                  ? 'Switched to Signed-In state (Hi, Josh · Rookie rank)'
                  : 'Switched to Not Signed-In state (Guest)'
              );
            }}
            onConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setActiveTab('connect-to-truvo');
            }}
            onSelectBrokerDetail={(b) => {
              setSelectedBrokerForDetail(b);
              setActiveTab('broker-detail');
            }}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            onOpenSignIn={() => {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
            }}
            onNavigateToSignals={() => setActiveTab('signals')}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: Member Plan Page (Logged-in: Member Lv.1 view, Guest: D03 view) ─── */}
        {activeTab === 'member-plan' && (
          <MembershipPlanPage
            user={user}
            isLoggedIn={isLoggedIn}
            onNavigateToTrade={() => setActiveTab('brokers')}
            onShowToast={showToast}
            onOpenSignIn={() => {
              setAuthModalMode('signin');
              setIsAuthModalOpen(true);
            }}
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onToggleLogin={() => setIsLoggedIn((prev) => !prev)}
            onSelectLevelScenario={handleSelectLevelScenario}
          />
        )}

        {/* ─── TAB: Broker Detail Page (Scenarios: Cashback vs. No Cashback) ─── */}
        {activeTab === 'broker-detail' && (
          <BrokerDetailPage
            broker={selectedBrokerForDetail}
            user={user}
            isLoggedIn={isLoggedIn}
            onBackToBrokers={() => setActiveTab('brokers')}
            onNavigateToComparison={() => setActiveTab('broker-comparison')}
            onNavigateToRebateTable={() => setActiveTab('broker-rebate-table')}
            onNavigateToConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setActiveTab('connect-to-truvo');
            }}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onShowToast={showToast}
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            onLoginSuccess={handleAuthSuccess}
          />
        )}

        {/* ─── TAB: Broker Rebate Table Page (Matches D02_Cashback Rebate Table_Default View.png) ─── */}
        {activeTab === 'broker-rebate-table' && (
          <BrokerRebateTablePage
            broker={selectedBrokerForDetail}
            user={user}
            onBack={() => setActiveTab('broker-detail')}
            onConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setActiveTab('connect-to-truvo');
            }}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB 3: Market Signals (Matching Reference Layout) ─── */}
        {activeTab === 'signals' && (
          <TradingSignalsPage
            user={user}
            signals={signals}
            brokers={brokers}
            onSelectSignal={(sig) => {
              setSelectedSignal(sig);
              setActiveTab('signal-detail');
            }}
            onUpgradePrompt={() => setActiveTab('member-plan')}
            onOpenConnectModal={(broker) => {
              setSelectedBrokerForConnect(broker || brokers[0]);
              setConnectReturnTab('signals');
              setActiveTab('connect-to-truvo');
            }}
            onOpenBrokerComparison={() => setActiveTab('broker-comparison')}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onSimulateTradeCashback={(brokerName, lotSize, rebateAmount) => {
              setUser((prev) => ({
                ...prev,
                totalCashbackEarned: +(prev.totalCashbackEarned + rebateAmount).toFixed(2),
                lotsTradedTotal: +(prev.lotsTradedTotal + lotSize).toFixed(1),
              }));
              handleRewardPoints(Math.round(lotSize * 15), `Live Trade via ${brokerName}`);
              showToast(`🎉 +$${rebateAmount.toFixed(2)} Cashback earned via ${brokerName}!`);
            }}
          />
        )}

        {/* ─── TAB: Trading Signal Detail Page (Exact Match to Dashboard_Trading Signals_Desktop_Detail Page_Overview.png) ─── */}
        {activeTab === 'signal-detail' && (
          <TradingSignalDetailPage
            signal={selectedSignal}
            user={user}
            brokers={brokers}
            onBackToSignals={() => setActiveTab('signals')}
            onSelectSignal={(sig) => setSelectedSignal(sig)}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setConnectReturnTab('signal-detail');
              setActiveTab('connect-to-truvo');
            }}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToComparison={() => setActiveTab('broker-comparison')}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: Instrument Analysis (Deep Technical Telemetry, Key Levels & Multi-Asset Structure) ─── */}
        {activeTab === 'instrument-analysis' && (
          <InstrumentAnalysisPage
            user={user}
            signals={signals}
            brokers={brokers}
            onSelectSignal={(sig) => {
              setSelectedSignal(sig);
              setIsSignalModalOpen(true);
            }}
            onOpenConnectModal={(broker) => {
              setSelectedBrokerForConnect(broker || brokers[0]);
              setIsConnectModalOpen(true);
            }}
            onOpenCalculator={(type) => {
              if (type === 'forex') setActiveTab('pip-calculator');
              else if (type === 'planning') setActiveTab('position-size-calculator');
              else setActiveTab('leverage-calculator');
            }}
            onNavigateToTab={(tab, subTab, sym) => {
              if (sym) setSelectedInstrumentForCommunity(sym);
              setActiveTab(tab);
            }}
            onShareToCommunity={(symbol, name) => {
              setSelectedInstrumentForCommunity(symbol);
              setActiveTab('community');
              showToast(`📢 Ready to share ${symbol} to Community Floor! +25 💎 Bounty`);
            }}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: User Profile Page (Exact match to Profile - Click Edit Photo.png & Member Profile - Saved Calculations.png) ─── */}
        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            brokers={brokers}
            savedCalculations={savedCalculations}
            onUpdateSavedCalculations={handleUpdateSavedCalculations}
            onLoadCalculationAndNavigate={(calc) => {
              setPendingLoadedCalculation(calc);
              setActiveTab('leverage-calculator');
            }}
            onNavigateToCalculators={() => setActiveTab('leverage-calculator')}
            onUpdateUserProfile={handleUpdateUserProfile}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onShowToast={showToast}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToCashback={() => setActiveTab('cashback-overview')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
            onSelectLevelScenario={handleSelectLevelScenario}
          />
        )}

        {/* ─── TAB: Account Security Page (Exact match to 02. Account Security Landing.png) ─── */}
        {activeTab === 'account-security' && (
          <AccountSecurityPage
            user={user}
            onShowToast={showToast}
            onNavigateToTrade={() => setActiveTab('signals')}
            onNavigateToBrokers={() => setActiveTab('brokers')}
          />
        )}

        {/* ─── TAB: Notifications Page (Activities & Announcements) ─── */}
        {activeTab === 'notifications' && (
          <NotificationsPage
            brokers={brokers}
            onNavigateToTab={setActiveTab}
            onNavigateToCashback={() => setActiveTab('cashback-overview')}
            onNavigateToSignals={() => setActiveTab('signals')}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onOpenConnectModal={(b) => {
              setSelectedBrokerForConnect(b || brokers[0]);
              setIsConnectModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB 4: Community Page (Feeds, Topics, Articles, My Page, Profile) ─── */}
        {activeTab === 'community' && (
          <CommunityPage
            user={user}
            onUpdateUserProfile={(updated) => {
              setUser((prev) => {
                const next = { ...prev, ...updated };
                if (updated.avatar) {
                  try {
                    localStorage.setItem('marketsyde_user_avatar', updated.avatar);
                  } catch (e) {}
                }
                return next;
              });
            }}
            onRewardPoints={handleRewardPoints}
            onRewardPointsAndCredits={handleRewardPointsAndCredits}
            onNavigateToTab={(tab, subTab, sym) => {
              if (sym) setSelectedInstrumentForCommunity(sym);
              setActiveTab(tab);
            }}
            initialInstrumentSymbol={selectedInstrumentForCommunity}
            onOpenConnectModal={() => {
              setSelectedBrokerForConnect(brokers[0]);
              setIsConnectModalOpen(true);
            }}
          />
        )}

        {/* ─── TAB: Cashback Overview (Matching Reference Image) ─── */}
        {activeTab === 'cashback-overview' && (
          <CashbackOverviewPage
            user={user}
            brokers={brokers}
            signals={signals}
            onOpenConnectModal={(broker) => {
              setSelectedBrokerForConnect(broker || brokers[0]);
              setIsConnectModalOpen(true);
            }}
            onOpenViewPlan={() => setActiveTab('member-plan')}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToSignals={() => setActiveTab('signals')}
            onSelectSignal={(sig) => {
              setSelectedSignal(sig);
              setIsSignalModalOpen(true);
            }}
            onNavigateToConnectBroker={(broker) => {
              if (broker) setSelectedBrokerForConnect(broker);
              setActiveTab('connect-to-truvo');
            }}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onSimulateTradeCashback={() => {
              handleRewardPoints(50, 'Live Broker Trade Rebate Credited');
              setUser((prev) => ({
                ...prev,
                totalCashbackEarned: +(prev.totalCashbackEarned + 12.0).toFixed(2),
              }));
              showToast('🎉 +$12.00 Cashback added to your balance!');
            }}
          />
        )}

        {/* ─── TAB: Active Trading Account / Linked Brokers (D2 - Select Linked Broker.png) ─── */}
        {activeTab === 'active-trading-accounts' && (
          <ActiveTradingAccountsPage
            brokers={brokers}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onSelectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setConnectReturnTab('active-trading-accounts');
              setActiveTab('connect-to-truvo');
            }}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: Connect to MarketSyde / Broker Onboarding (Exact Match to D12_Connect to MarketSyde.png) ─── */}
        {activeTab === 'connect-to-truvo' && (
          <ConnectToTruvoPage
            broker={selectedBrokerForConnect || selectedBrokerForDetail || brokers[0]}
            brokers={brokers}
            onSelectBroker={(b) => setSelectedBrokerForConnect(b)}
            onBackToDashboard={() => setActiveTab(connectReturnTab || 'active-trading-accounts')}
            backLabel={
              connectReturnTab === 'signal-detail'
                ? 'Back to Trading Signal'
                : connectReturnTab === 'signals'
                ? 'Back to Signals'
                : 'Back to Brokers'
            }
            onNavigateToCashback={() => setActiveTab('cashback-overview')}
            onOpenConnectModal={(b) => {
              setSelectedBrokerForConnect(b);
              setIsConnectModalOpen(true);
            }}
            onShowToast={showToast}
            onOpenTermsPage={() => setActiveTab('terms-and-conditions')}
          />
        )}

        {/* ─── TAB: Forex & Trading Calculators Suite (All 15 Specialized Tools) ─── */}
        {(activeTab === 'leverage-calculator' ||
          activeTab === 'volatility-calculator' ||
          activeTab === 'spread-calculator' ||
          activeTab === 'pip-calculator' ||
          activeTab === 'pips-calculator' ||
          activeTab === 'margin-calculator' ||
          activeTab === 'rebate-calculator' ||
          activeTab === 'trade-planning-calculator' ||
          activeTab === 'position-size-calculator' ||
          activeTab === 'sltp-calculator' ||
          activeTab === 'stop-out-calculator' ||
          activeTab === 'fibonacci-calculator' ||
          activeTab === 'pivot-point-calculator' ||
          activeTab === 'loss-calculator' ||
          activeTab === 'profit-loss-calculator' ||
          activeTab === 'drawdown-calculator' ||
          activeTab === 'compound-calculator' ||
          activeTab === 'performance-calculator' ||
          activeTab === 'timezone-converter' ||
          activeTab === 'trading-timezone-converter' ||
          activeTab === 'currency-converter' ||
          activeTab === 'conversion-calculator' ||
          activeTab === 'calculators') && (
          <LeverageCalculatorPage
            user={user}
            brokers={brokers}
            signals={signals}
            savedCalculations={savedCalculations}
            onUpdateSavedCalculations={handleUpdateSavedCalculations}
            loadedCalculation={pendingLoadedCalculation}
            onClearLoadedCalculation={() => setPendingLoadedCalculation(null)}
            initialTool={
              activeTab === 'volatility-calculator'
                ? 'volatility'
                : activeTab === 'spread-calculator'
                ? 'spread'
                : activeTab === 'pip-calculator' || activeTab === 'pips-calculator'
                ? 'pips'
                : activeTab === 'margin-calculator'
                ? 'margin'
                : activeTab === 'rebate-calculator'
                ? 'rebate'
                : activeTab === 'trade-planning-calculator' || activeTab === 'position-size-calculator'
                ? 'position-size'
                : activeTab === 'sltp-calculator'
                ? 'sltp'
                : activeTab === 'stop-out-calculator'
                ? 'stop-out'
                : activeTab === 'fibonacci-calculator'
                ? 'fibonacci'
                : activeTab === 'pivot-point-calculator'
                ? 'pivot-point'
                : activeTab === 'loss-calculator' || activeTab === 'profit-loss-calculator' || activeTab === 'performance-calculator'
                ? 'profit-loss'
                : activeTab === 'drawdown-calculator'
                ? 'drawdown'
                : activeTab === 'compound-calculator'
                ? 'compound'
                : activeTab === 'timezone-converter' || activeTab === 'trading-timezone-converter' || activeTab === 'conversion-calculator'
                ? 'timezone'
                : activeTab === 'currency-converter'
                ? 'currency'
                : 'leverage'
            }
            onOpenConnectModal={(broker) => {
              setSelectedBrokerForConnect(broker || brokers[0]);
              setIsConnectModalOpen(true);
            }}
            onOpenBrokerComparison={() => setIsBrokerComparisonOpen(true)}
            onSelectSignal={(sig) => {
              setSelectedSignal(sig);
              setIsSignalModalOpen(true);
            }}
            onNavigateToTab={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB 5: Leaderboard ─── */}
        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <LeaderboardCard
                users={LEADERBOARD_USERS}
                onOpenViewPlan={() => setActiveTab('member-plan')}
              />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-display font-bold text-lg text-[#0b1c30]">
                    Weekly Community Prize Pool
                  </h3>
                </div>
                <p className="text-xs text-[#474556] leading-relaxed">
                  Every Sunday at 23:59 UTC, the top 10 traders on the leaderboard receive direct cash bonuses and boosted signal privileges funded by our institutional broker rebate pool.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between font-semibold text-amber-900">
                    <span>🥇 1st Place:</span>
                    <span>$1,000 Cash + Boss Tier (Lv.4)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between font-semibold text-slate-800">
                    <span>🥈 2nd Place:</span>
                    <span>$500 Cash + Player Tier (Lv.3)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between font-semibold text-orange-900">
                    <span>🥉 3rd Place:</span>
                    <span>$250 Cash + Climber Tier (Lv.2)</span>
                  </div>
                </div>
                <button
                  onClick={handleAddDemoPoints}
                  className="w-full py-2.5 rounded-xl bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all"
                >
                  Earn +25 Points Now
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ─── TAB: About Us Page (Exact replica of Reference Design) ─── */}
        {activeTab === 'about' && (
          <AboutUsPage
            onOpenSignUp={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToSignals={() => setActiveTab('signals')}
            onNavigateToPlan={() => setActiveTab('member-plan')}
            onNavigateToTab={setActiveTab}
          />
        )}

        {/* ─── TAB: Contact Us Page (Exact replica of Reference Design) ─── */}
        {(activeTab === 'contact-us' || activeTab === 'contact') && (
          <ContactUsPage
            onShowToast={showToast}
            onNavigateToTab={setActiveTab}
          />
        )}

        {/* ─── TAB: Terms and Conditions Page (Image D33) ─── */}
        {(activeTab === 'terms-and-conditions' || activeTab === 'terms') && (
          <TermsAndConditionsPage
            onBack={() => {
              setActiveTab('connect-to-truvo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* ─── ERROR PAGES: 404, 500, 503 (Matches Member Desktop Reference Screens) ─── */}
        {(activeTab === '404' || activeTab === 'not-found' || !KNOWN_APP_TABS.has(activeTab)) && (
          <Error404Page
            onNavigateHome={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {(activeTab === '500' || activeTab === 'server-error') && (
          <Error500Page
            onNavigateHome={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {(activeTab === '503' || activeTab === 'maintenance' || activeTab === 'service-unavailable') && (
          <Error503Page
            onNavigateHome={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Matching Reference - Rendered on pages (suppressed on guest member-plan which has its own full purple footer) */}
      {!(activeTab === 'member-plan' && !isLoggedIn) && (
        <Footer
          onNavigateToAbout={() => {
            setActiveTab('about');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToPlan={() => {
            setActiveTab('member-plan');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Modals */}
      <ConnectBrokerModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        brokers={brokers}
        selectedBroker={selectedBrokerForConnect}
        onSuccess={handleBrokerConnected}
      />

      <ViewPlanModal
        isOpen={isViewPlanOpen}
        onClose={() => setIsViewPlanOpen(false)}
        user={user}
        onNavigateToFullPlan={() => {
          setIsViewPlanOpen(false);
          setActiveTab('member-plan');
        }}
      />

      <SignalDetailModal
        isOpen={isSignalModalOpen}
        onClose={() => setIsSignalModalOpen(false)}
        signal={selectedSignal}
        onNavigateToDetailPage={() => {
          setIsSignalModalOpen(false);
          setActiveTab('signal-detail');
        }}
      />

      <CashbackLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        trades={RECENT_TRADES}
        totalEarned={user.totalCashbackEarned}
        pendingPayout={user.pendingPayout}
      />

      <ActivityLogModal
        isOpen={isActivityLogModalOpen}
        onClose={() => setIsActivityLogModalOpen(false)}
        user={user}
        activityLogs={activityLogs}
        onOpenFullPage={() => {
          setIsActivityLogModalOpen(false);
          setActiveTab('activity-logs');
        }}
      />

      <BrokerComparisonModal
        isOpen={isBrokerComparisonOpen}
        onClose={() => setIsBrokerComparisonOpen(false)}
        brokers={brokers}
        onConnectBroker={(b) => {
          setSelectedBrokerForConnect(b);
          setIsConnectModalOpen(true);
        }}
        onSelectBrokerDetail={(b) => {
          setSelectedBrokerForDetail(b);
          setActiveTab('broker-detail');
        }}
        onOpenFullComparison={() => {
          setIsBrokerComparisonOpen(false);
          setActiveTab('broker-comparison');
        }}
      />

      <TradingCalculatorsModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        initialType={selectedCalculatorType}
      />

      {/* Earning Reward Modals (Quest Complete, Mission Complete, Trade Complete) */}
      <EarningRewardModal
        isOpen={!!earningRewardModal}
        onClose={() => setEarningRewardModal(null)}
        data={earningRewardModal}
      />

      {/* ─── SEARCH COMMAND PALETTE MODAL (EXACT MATCH TO DESIGN) ─── */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        brokers={brokers}
        signals={signals}
        onSelectSignal={(sig) => {
          setSelectedSignal(sig);
          setActiveTab('signal-detail');
        }}
        onOpenConnectModal={(broker) => {
          setSelectedBrokerForConnect(broker || brokers.find((b) => !b.connected) || brokers[0]);
          setIsConnectModalOpen(true);
        }}
        onOpenViewPlan={() => setActiveTab('member-plan')}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onSelectBrokerDetail={(b) => {
          setSelectedBrokerForDetail(b);
          setActiveTab('broker-detail');
        }}
        onShowToast={showToast}
      />

      {/* ─── AUTH MODAL (SIGN UP / SIGN IN / VERIFY / ONBOARDING FLOWS) ─── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onShowToast={showToast}
        onNavigateToTab={setActiveTab}
      />
    </div>
  );
}
