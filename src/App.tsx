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
import { Header } from './components/Header';
import { ReferenceDashboard } from './components/ReferenceDashboard';
import { DashboardBentoGrid } from './components/DashboardBentoGrid';
import { BrokerDirectory } from './components/BrokerDirectory';
import { BrokerListPage } from './components/brokers/BrokerListPage';
import { BrokerDetailPage } from './components/brokers/BrokerDetailPage';
import { SignalsList } from './components/SignalsList';
import { CommunityHub } from './components/CommunityHub';
import { CommunityPage } from './components/community/CommunityPage';
import { LeaderboardCard } from './components/LeaderboardCard';
import { PointsAndCreditsView } from './components/PointsAndCreditsView';
import { LevelPointsGuideView } from './components/LevelPointsGuideView';
import { CreditEarningGuideView } from './components/CreditEarningGuideView';
import { ActivityLogsView } from './components/ActivityLogsView';
import { CashbackOverviewPage } from './components/CashbackOverviewPage';
import { ConnectToTruvoPage } from './components/ConnectToTruvoPage';
import { TradingSignalsPage } from './components/TradingSignalsPage';
import { TradingSignalDetailPage } from './components/signals/TradingSignalDetailPage';
import { ProfilePage } from './components/ProfilePage';
import { AccountSecurityPage } from './components/AccountSecurityPage';
import { LeverageCalculatorPage } from './components/calculators/LeverageCalculatorPage';
import { TradingCalculatorsModal, CalculatorType } from './components/calculators/TradingCalculatorsModal';
import { ActivityLogModal } from './components/ActivityLogModal';
import { EarningRewardModal, EarningRewardData } from './components/EarningRewardModal';
import { Footer } from './components/Footer';
import { ConnectBrokerModal } from './components/ConnectBrokerModal';
import { ViewPlanModal } from './components/ViewPlanModal';
import { SignalDetailModal } from './components/SignalDetailModal';
import { CashbackLedgerModal } from './components/CashbackLedgerModal';
import { BrokerComparisonModal } from './components/BrokerComparisonModal';
import { SearchModal } from './components/SearchModal';
import { Sparkles, Trophy, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

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

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedBrokerForConnect, setSelectedBrokerForConnect] = useState<Broker | null>(null);
  const [selectedBrokerForDetail, setSelectedBrokerForDetail] = useState<Broker>(brokers[0] || INITIAL_BROKERS[0]);
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
    setUser((prev) => {
      const newPoints = prev.currentPoints + pointsToAdd;
      let newTitle = prev.rankTitle;
      let newTier = prev.tierLevel;
      let newBoost = prev.boostPercentage;

      if (newPoints >= 150 && prev.tierLevel < 2) {
        newTitle = 'Bronze';
        newTier = 2;
        newBoost = 15;
        showToast('🎉 Level Up! You unlocked Bronze Tier with +15% Boost!');
      } else if (newPoints >= 500 && prev.tierLevel < 3) {
        newTitle = 'Silver';
        newTier = 3;
        newBoost = 20;
        showToast('🚀 Level Up! You unlocked Silver Tier with +20% Boost!');
      } else if (reason) {
        showToast(`💎 +${pointsToAdd} Points: ${reason}`);
      }

      return {
        ...prev,
        currentPoints: newPoints,
        rankTitle: newTitle,
        tierLevel: newTier,
        boostPercentage: newBoost,
      };
    });
  };

  // Gamification: Earn demo points
  const handleAddDemoPoints = () => {
    handleRewardPoints(25, 'Trader Level Progress');
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
        onOpenViewPlan={() => setIsViewPlanOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenBrokerComparison={() => setIsBrokerComparisonOpen(true)}
        onOpenCalculator={(calcType) => {
          if (calcType === 'forex') {
            setActiveTab('leverage-calculator');
          } else {
            setSelectedCalculatorType(calcType);
            setIsCalculatorModalOpen(true);
          }
        }}
        onNavigateToCashbackOverview={() => setActiveTab('cashback-overview')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onShowToast={showToast}
        onUpdateAvatar={handleUpdateAvatar}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#c6f831] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-[56px] py-6 space-y-6">
        {/* Welcome Bar / Subheader for other tabs */}
        {activeTab !== 'dashboard' && activeTab !== 'brokers' && activeTab !== 'broker-detail' && activeTab !== 'connect-to-truvo' && activeTab !== 'points-credits' && activeTab !== 'cashback-overview' && activeTab !== 'signals' && activeTab !== 'signal-detail' && activeTab !== 'level-points-guide' && activeTab !== 'credit-earning-guide' && activeTab !== 'activity-logs' && activeTab !== 'leverage-calculator' && activeTab !== 'volatility-calculator' && activeTab !== 'spread-calculator' && activeTab !== 'pip-calculator' && activeTab !== 'pips-calculator' && activeTab !== 'margin-calculator' && activeTab !== 'rebate-calculator' && activeTab !== 'calculators' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {activeTab === 'community' && (
                  <>
                    <span className="bg-gradient-to-r from-[#5945F1] to-[#FE01B1] bg-clip-text text-transparent inline-block pb-0.5">
                      Community Trading Floor
                    </span>
                    <span className="text-[#c6f831] font-extrabold">.</span>
                  </>
                )}
                {activeTab === 'leaderboard' && (
                  <>
                    <span className="bg-gradient-to-r from-[#5945F1] to-[#FE01B1] bg-clip-text text-transparent inline-block pb-0.5">
                      Trader Leaderboard & Rankings
                    </span>
                    <span className="text-[#c6f831] font-extrabold">.</span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-[#474556] mt-0.5">
                {activeTab === 'community' &&
                  'Real-time trader feeds, verified institutional research, active market debates, and creator profiles.'}
                {activeTab === 'leaderboard' &&
                  'Compete for weekly $1,750 prize pools funded by institutional broker rebates.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Cashback Rate:
              </span>
              <span className="px-3 py-1 rounded-full bg-[#eef2ff] border border-[#d6d0ff] text-[#5338ec] text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#5338ec]" />
                <span>+{user.boostPercentage}% Multiplier Active</span>
              </span>
            </div>
          </div>
        )}

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
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
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

        {/* ─── TAB 1: Bento Grid Dashboard Matching Reference ─── */}
        {activeTab === 'dashboard' && (
          <ReferenceDashboard
            user={user}
            brokers={brokers}
            signals={signals}
            quickSteps={quickSteps}
            performanceData={PERFORMANCE_DATA}
            leaderboardUsers={LEADERBOARD_USERS}
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
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
            onOpenComparison={() => setIsBrokerComparisonOpen(true)}
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: Broker Detail Page (Scenarios: Cashback vs. No Cashback) ─── */}
        {activeTab === 'broker-detail' && (
          <BrokerDetailPage
            broker={selectedBrokerForDetail}
            user={user}
            onBackToBrokers={() => setActiveTab('brokers')}
            onNavigateToConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setActiveTab('connect-to-truvo');
            }}
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
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
            onUpgradePrompt={() => setIsViewPlanOpen(true)}
            onOpenConnectModal={(broker) => {
              setSelectedBrokerForConnect(broker || brokers[0]);
              setIsConnectModalOpen(true);
            }}
            onOpenBrokerComparison={() => setIsBrokerComparisonOpen(true)}
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
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
            onConnectBroker={(b) => {
              setSelectedBrokerForConnect(b);
              setIsConnectModalOpen(true);
            }}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToComparison={() => setIsBrokerComparisonOpen(true)}
            onShowToast={showToast}
          />
        )}

        {/* ─── TAB: User Profile Page (Exact match to Profile - Click Edit Photo.png) ─── */}
        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            brokers={brokers}
            onUpdateUserProfile={handleUpdateUserProfile}
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
            onShowToast={showToast}
            onNavigateToBrokers={() => setActiveTab('brokers')}
            onNavigateToCashback={() => setActiveTab('cashback-overview')}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
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
            onOpenViewPlan={() => setIsViewPlanOpen(true)}
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

        {/* ─── TAB: Connect to Truvo Page (Broker Partnership & Verification) ─── */}
        {activeTab === 'connect-to-truvo' && (
          <ConnectToTruvoPage
            broker={selectedBrokerForConnect || brokers[0]}
            brokers={brokers}
            onSelectBroker={(b) => setSelectedBrokerForConnect(b)}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNavigateToCashback={() => setActiveTab('cashback-overview')}
            onOpenConnectModal={(b) => {
              setSelectedBrokerForConnect(b);
              setIsConnectModalOpen(true);
            }}
            onShowToast={showToast}
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
          activeTab === 'position-size-calculator' ||
          activeTab === 'sltp-calculator' ||
          activeTab === 'stop-out-calculator' ||
          activeTab === 'fibonacci-calculator' ||
          activeTab === 'pivot-point-calculator' ||
          activeTab === 'loss-calculator' ||
          activeTab === 'profit-loss-calculator' ||
          activeTab === 'drawdown-calculator' ||
          activeTab === 'compound-calculator' ||
          activeTab === 'timezone-converter' ||
          activeTab === 'trading-timezone-converter' ||
          activeTab === 'currency-converter' ||
          activeTab === 'calculators') && (
          <LeverageCalculatorPage
            user={user}
            brokers={brokers}
            signals={signals}
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
                : activeTab === 'position-size-calculator'
                ? 'position-size'
                : activeTab === 'sltp-calculator'
                ? 'sltp'
                : activeTab === 'stop-out-calculator'
                ? 'stop-out'
                : activeTab === 'fibonacci-calculator'
                ? 'fibonacci'
                : activeTab === 'pivot-point-calculator'
                ? 'pivot-point'
                : activeTab === 'loss-calculator' || activeTab === 'profit-loss-calculator'
                ? 'profit-loss'
                : activeTab === 'drawdown-calculator'
                ? 'drawdown'
                : activeTab === 'compound-calculator'
                ? 'compound'
                : activeTab === 'timezone-converter' || activeTab === 'trading-timezone-converter'
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
                onOpenViewPlan={() => setIsViewPlanOpen(true)}
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
                    <span>$1,000 Cash + 1 Mo Elite Tier</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between font-semibold text-slate-800">
                    <span>🥈 2nd Place:</span>
                    <span>$500 Cash + Pro Trader Tier</span>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between font-semibold text-orange-900">
                    <span>🥉 3rd Place:</span>
                    <span>$250 Cash + Silver Tier</span>
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
      </main>

      {/* Footer Matching Reference */}
      <Footer />

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
        onOpenViewPlan={() => setIsViewPlanOpen(true)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onSelectBrokerDetail={(b) => {
          setSelectedBrokerForDetail(b);
          setActiveTab('broker-detail');
        }}
        onShowToast={showToast}
      />
    </div>
  );
}
