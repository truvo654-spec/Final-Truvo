import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCheck,
  ChevronRight,
  ChevronDown,
  X,
  Bell,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
} from 'lucide-react';
import { TabMain } from '../common/TabMain';
import { Broker } from '../../types';

export interface NotificationItem {
  id: string;
  category: 'activities' | 'announcements';
  source: 'cashback' | 'connect' | 'announcement';
  sourceLabel: string;
  title: string;
  modalTitle?: string;
  isRead: boolean;
  date: string;
  time: string;
  brokerName?: string;
  brokerLogo?: string;
  accountDetail?: string;
  statusBadge?: string;
  detailAccountText?: string;
  detailMessage: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

interface NotificationsPageProps {
  brokers?: Broker[];
  onNavigateToTab: (tab: string) => void;
  onNavigateToCashback: () => void;
  onNavigateToSignals: () => void;
  onNavigateToBrokers: () => void;
  onOpenConnectModal?: (broker?: Broker) => void;
  onShowToast?: (msg: string) => void;
}

const INITIAL_ACTIVITIES: NotificationItem[] = [
  {
    id: 'act-1',
    category: 'activities',
    source: 'connect',
    sourceLabel: 'Connect to MarketSyde',
    title: 'Success! Your account is now active and ready for trading.',
    isRead: false,
    date: '14/09/26',
    time: '10:45',
    brokerName: 'XM',
    accountDetail: 'XM — 1100012001',
    statusBadge: 'Connected',
    detailAccountText: 'Premium — 1100012001',
    detailMessage:
      'To get started, you can now fund your account or place your first trade. Start trading today to begin earning cashback on every execution.',
    primaryActionLabel: 'Trade Now',
    secondaryActionLabel: 'My Cashback',
  },
  {
    id: 'act-2',
    category: 'activities',
    source: 'cashback',
    sourceLabel: 'Cash Back',
    title: 'You earned $15 from 5 standard lots of EUR/USD',
    isRead: false,
    date: '14/09/26',
    time: '09:30',
    brokerName: 'Exness',
    accountDetail: 'Exness — 8839210',
    statusBadge: 'Credited',
    detailAccountText: 'Standard — 8839210 (5 Lots EUR/USD)',
    detailMessage:
      'Cashback of $15.00 has been calculated and deposited directly to your cashback balance. Keep trading to unlock higher cashback tiers and maximize your rebates.',
    primaryActionLabel: 'Trade Now',
    secondaryActionLabel: 'My Cashback',
  },
  {
    id: 'act-3',
    category: 'activities',
    source: 'cashback',
    sourceLabel: 'Cash Back',
    title: 'You earned $15 from 5 standard lots of EUR/USD',
    isRead: true,
    date: '12/09/26',
    time: '15:20',
    brokerName: 'Exness',
    accountDetail: 'Exness — 8839210',
    statusBadge: 'Credited',
    detailAccountText: 'Standard — 8839210 (5 Lots EUR/USD)',
    detailMessage:
      'Cashback of $15.00 has been calculated and deposited directly to your cashback balance.',
    primaryActionLabel: 'Trade Now',
    secondaryActionLabel: 'My Cashback',
  },
  {
    id: 'act-4',
    category: 'activities',
    source: 'cashback',
    sourceLabel: 'Cash Back',
    title: 'You earned $15 from 5 standard lots of EUR/USD',
    isRead: true,
    date: '11/09/26',
    time: '18:40',
    brokerName: 'Exness',
    accountDetail: 'Exness — 8839210',
    statusBadge: 'Credited',
    detailAccountText: 'Standard — 8839210 (5 Lots EUR/USD)',
    detailMessage:
      'Cashback of $15.00 has been calculated and deposited directly to your cashback balance.',
    primaryActionLabel: 'Trade Now',
    secondaryActionLabel: 'My Cashback',
  },
  {
    id: 'act-5',
    category: 'activities',
    source: 'cashback',
    sourceLabel: 'Cash Back',
    title: 'You earned $15 from 5 standard lots of EUR/USD',
    isRead: true,
    date: '09/09/26',
    time: '14:15',
    brokerName: 'Exness',
    accountDetail: 'Exness — 8839210',
    statusBadge: 'Credited',
    detailAccountText: 'Standard — 8839210 (5 Lots EUR/USD)',
    detailMessage:
      'Cashback of $15.00 has been calculated and deposited directly to your cashback balance.',
    primaryActionLabel: 'Trade Now',
    secondaryActionLabel: 'My Cashback',
  },
  {
    id: 'act-6',
    category: 'activities',
    source: 'cashback',
    sourceLabel: 'Cash Back',
    title: 'You earned $15 from 5 standard lots of EUR/USD',
    isRead: true,
    date: '07/09/26',
    time: '11:05',
    brokerName: 'Exness',
    accountDetail: 'Exness — 8839210',
    statusBadge: 'Credited',
    detailAccountText: 'Standard — 8839210 (5 Lots EUR/USD)',
    detailMessage:
      'Cashback of $15.00 has been calculated and deposited directly to your cashback balance.',
    primaryActionLabel: 'Trade Now',
    secondaryActionLabel: 'My Cashback',
  },
];

const INITIAL_ANNOUNCEMENTS: NotificationItem[] = [
  {
    id: 'ann-1',
    category: 'announcements',
    source: 'announcement',
    sourceLabel: 'Announcement',
    title: "You're in! Ready to turn your trading volume into cash back?",
    modalTitle: "Nice. You're on the right Syde now.",
    isRead: false,
    date: '14/09/26',
    time: '12:00',
    detailMessage:
      'Track what matters. Learn what works. Analyze smarter. Earn while you trade. And keep moving to the next level.',
    primaryActionLabel: "Let's Find Your Broker",
  },
  {
    id: 'ann-2',
    category: 'announcements',
    source: 'announcement',
    sourceLabel: 'Announcement',
    title: "You're in! Ready to turn your trading volume into cash back?",
    modalTitle: "Nice. You're on the right Syde now.",
    isRead: true,
    date: '10/09/26',
    time: '08:30',
    detailMessage:
      'Track what matters. Learn what works. Analyze smarter. Earn while you trade. And keep moving to the next level.',
    primaryActionLabel: "Let's Find Your Broker",
  },
];

interface SidebarTask {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  stepText: string;
}

const INITIAL_SIDEBAR_TASKS: SidebarTask[] = [
  {
    id: 'axi',
    name: 'Axi',
    title: 'Account approved?',
    subtitle: 'If ready, continue to next step',
    stepText: 'Register Account',
  },
  {
    id: 'windsor',
    name: 'Windsor Brokers',
    title: 'IB approved?',
    subtitle: 'If ready, continue to next step',
    stepText: 'Register Account',
  },
  {
    id: 'avatrade',
    name: 'AvaTrade',
    title: 'IB Transfer approved?',
    subtitle: 'If ready, continue to next step',
    stepText: 'Register Account',
  },
];

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  brokers = [],
  onNavigateToTab,
  onNavigateToCashback,
  onNavigateToSignals,
  onNavigateToBrokers,
  onOpenConnectModal,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'announcements'>('activities');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'cashback' | 'connect'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [activities, setActivities] = useState<NotificationItem[]>(INITIAL_ACTIVITIES);
  const [announcements, setAnnouncements] = useState<NotificationItem[]>(INITIAL_ANNOUNCEMENTS);

  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [sidebarTasks, setSidebarTasks] = useState<SidebarTask[]>(INITIAL_SIDEBAR_TASKS);

  // Unread counts for tab badge
  const unreadActivitiesCount = activities.filter((a) => !a.isRead).length;
  const unreadAnnouncementsCount = announcements.filter((a) => !a.isRead).length;

  // Filtered activities
  const filteredActivities = activities.filter((item) => {
    if (sourceFilter === 'all') return true;
    if (sourceFilter === 'cashback') return item.source === 'cashback';
    if (sourceFilter === 'connect') return item.source === 'connect';
    return true;
  });

  // Handle Mark All as Read
  const handleMarkAllAsRead = () => {
    if (activeTab === 'activities') {
      setActivities((prev) => prev.map((a) => ({ ...a, isRead: true })));
      onShowToast?.('All activity notifications marked as read');
    } else {
      setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
      onShowToast?.('All announcements marked as read');
    }
  };

  // Click on an item: mark as read & open modal
  const handleOpenNotification = (item: NotificationItem) => {
    if (!item.isRead) {
      if (item.category === 'activities') {
        setActivities((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isRead: true } : a))
        );
      } else {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isRead: true } : a))
        );
      }
    }
    setSelectedNotification({ ...item, isRead: true });
  };

  // Reset to initial demo state
  const handleResetDemo = () => {
    setActivities(INITIAL_ACTIVITIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setSidebarTasks(INITIAL_SIDEBAR_TASKS);
    onShowToast?.('Notification demo state reset with unread items');
  };

  // Toggle empty state for announcement
  const handleToggleAnnouncementEmpty = () => {
    if (announcements.length > 0) {
      setAnnouncements([]);
      onShowToast?.('Announcement empty state activated');
    } else {
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      onShowToast?.('Announcements restored');
    }
  };

  // Dismiss a sidebar task
  const handleDismissTask = (id: string) => {
    setSidebarTasks((prev) => prev.filter((t) => t.id !== id));
    onShowToast?.('Task dismissed');
  };

  // Render small inline broker logo / badge
  const renderInlineBrokerLogo = (brokerName?: string) => {
    if (!brokerName) return null;
    const nameLower = brokerName.toLowerCase();

    if (nameLower.includes('xm')) {
      return (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-[#0b0f19] text-white text-[8px] font-black tracking-tighter leading-none shrink-0 shadow-2xs">
          XM
        </span>
      );
    }
    if (nameLower.includes('exness')) {
      return (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-[#FFE014] text-black text-[7.5px] font-black leading-none shrink-0 shadow-2xs">
          e
        </span>
      );
    }
    if (nameLower.includes('axi')) {
      return (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-[#E51D38] text-white text-[7px] font-black leading-none shrink-0 shadow-2xs">
          axi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-xs bg-slate-800 text-white text-[8px] font-bold leading-none shrink-0">
        {brokerName.charAt(0)}
      </span>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#fcfcfd] dark:bg-[#070114] text-slate-900 dark:text-slate-100 py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header: Title with pink dot */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-[#0b1c30] dark:text-white">
              Notifications<span className="text-[#ec4899]">.</span>
            </h1>
          </div>

          {/* Quick Demo Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#120a2e] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#5945F1] hover:border-[#5945F1] transition-all shadow-2xs cursor-pointer"
              title="Reset Demo Unread Notifications"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Unread</span>
            </button>
            {activeTab === 'announcements' && (
              <button
                onClick={handleToggleAnnouncementEmpty}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#120a2e] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#5945F1] hover:border-[#5945F1] transition-all shadow-2xs cursor-pointer"
                title="Toggle Empty State"
              >
                <span>{announcements.length === 0 ? 'Restore' : 'Show Empty State'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Left Notification Content (col-span-8) & Right Sidebar (col-span-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tabs, Filters, Notification List */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1:1 Browser Folder Tab Navigation using TabMain */}
            <div className="-mx-2 sm:mx-0">
              <TabMain
                tabs={[
                  {
                    id: 'activities',
                    label: 'Activities',
                    count: unreadActivitiesCount > 0 ? unreadActivitiesCount : undefined,
                  },
                  {
                    id: 'announcements',
                    label: 'Announcement',
                    count: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
                  },
                ]}
                activeTab={activeTab}
                onChange={(t) => setActiveTab(t as 'activities' | 'announcements')}
              />
            </div>

            {/* Filter and Action Bar */}
            <div className="flex items-end justify-between gap-4 pt-2">
              {/* Left: Sources Dropdown */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Sources
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className="w-48 sm:w-56 h-10 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-indigo-950/80 bg-white dark:bg-[#120a2e] text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between hover:border-slate-300 dark:hover:border-indigo-800 transition-colors shadow-2xs cursor-pointer text-left"
                  >
                    <span>
                      {sourceFilter === 'all'
                        ? 'All'
                        : sourceFilter === 'cashback'
                        ? 'Cash Back'
                        : 'Connect to [Our Brand]'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isFilterDropdownOpen ? 'rotate-180 text-[#5945F1]' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu (Matches 03a. Activities - Filters.png) */}
                  <AnimatePresence>
                    {isFilterDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsFilterDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-[#150c33] border border-slate-200 dark:border-indigo-900/60 shadow-xl py-1.5 z-30 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSourceFilter('all');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-xs text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              sourceFilter === 'all'
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/50 text-[#5945F1] dark:text-[#a594fd] font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <span>All</span>
                            {sourceFilter === 'all' && <Check className="w-3.5 h-3.5 text-[#5945F1]" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSourceFilter('cashback');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-xs text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              sourceFilter === 'cashback'
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/50 text-[#5945F1] dark:text-[#a594fd] font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <span>Cash Back</span>
                            {sourceFilter === 'cashback' && (
                              <Check className="w-3.5 h-3.5 text-[#5945F1]" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSourceFilter('connect');
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-xs text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              sourceFilter === 'connect'
                                ? 'bg-indigo-50/70 dark:bg-indigo-950/50 text-[#5945F1] dark:text-[#a594fd] font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            <span>Connect to [Our Brand]</span>
                            {sourceFilter === 'connect' && (
                              <Check className="w-3.5 h-3.5 text-[#5945F1]" />
                            )}
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right: Mark all as read */}
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-[#5945F1] dark:hover:text-[#a594fd] transition-colors py-2 px-1 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-[#5945F1]" />
                <span>Mark all as read</span>
              </button>
            </div>

            {/* Content List Area */}
            <div className="bg-transparent rounded-2xl border-t border-slate-100 dark:border-slate-800/60 divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* TAB 1: ACTIVITIES */}
              {activeTab === 'activities' && (
                <>
                  {filteredActivities.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#5945F1] flex items-center justify-center mx-auto shadow-xs">
                        <Bell className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-[#0b1c30] dark:text-white">
                        No activity found
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        No notifications match the selected source filter.
                      </p>
                    </div>
                  ) : (
                    filteredActivities.map((item) => {
                      const isUnread = !item.isRead;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenNotification(item)}
                          className="group flex items-center justify-between gap-4 py-4 px-3 sm:px-4 rounded-xl hover:bg-white dark:hover:bg-[#120a2e] transition-all cursor-pointer"
                        >
                          {/* Left: Indicator + Title + Subtitle */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5">
                              {/* Blue Unread Dot (Matches 03. Activities - Unread Transactions.png) */}
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.6)] shrink-0" />
                              )}
                              <h4
                                className={`text-sm sm:text-[14.5px] truncate transition-colors ${
                                  isUnread
                                    ? 'font-bold text-[#3b82f6] dark:text-[#60a5fa]'
                                    : 'font-semibold text-[#0b1c30] dark:text-slate-200 group-hover:text-[#5945F1]'
                                }`}
                              >
                                {item.title}
                              </h4>
                            </div>

                            {/* Subtitle Line: Notification Type • [logo] Account Detail • DD/MM/YY • HH:MM */}
                            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 pl-4 sm:pl-4.5">
                              <span>{item.sourceLabel || 'Notification Type'}</span>
                              <span>•</span>
                              {item.brokerName && (
                                <div className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                  {renderInlineBrokerLogo(item.brokerName)}
                                  <span>{item.accountDetail || 'Account Detail'}</span>
                                </div>
                              )}
                              {!item.brokerName && <span>Account Detail</span>}
                              <span>•</span>
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>{item.time}</span>
                            </div>
                          </div>

                          {/* Right Chevron */}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#5945F1] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {/* TAB 2: ANNOUNCEMENT */}
              {activeTab === 'announcements' && (
                <>
                  {announcements.length === 0 ? (
                    /* Empty State (Matches 03. Announcements - Empty State.png 1:1) */
                    <div className="py-20 flex items-start sm:items-center gap-4 px-4 sm:px-6">
                      {/* 3D Holographic / Iridescent Disc Icon */}
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-pink-400 to-cyan-300 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#120a2e] flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500/80 via-purple-500/80 to-pink-500/80 flex items-center justify-center text-white">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-[#0b1c30] dark:text-white">
                          Nothing yet
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          All MarketSyde alerts appear here. You'll never miss an update
                        </p>
                      </div>
                    </div>
                  ) : (
                    announcements.map((item) => {
                      const isUnread = !item.isRead;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenNotification(item)}
                          className="group flex items-center justify-between gap-4 py-4 px-3 sm:px-4 rounded-xl hover:bg-white dark:hover:bg-[#120a2e] transition-all cursor-pointer"
                        >
                          {/* Left: Indicator + Title + Subtitle */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5">
                              {/* Blue Unread Dot */}
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.6)] shrink-0" />
                              )}
                              <h4
                                className={`text-sm sm:text-[14.5px] truncate transition-colors ${
                                  isUnread
                                    ? 'font-bold text-[#3b82f6] dark:text-[#60a5fa]'
                                    : 'font-semibold text-[#0b1c30] dark:text-slate-200 group-hover:text-[#5945F1]'
                                }`}
                              >
                                {item.title}
                              </h4>
                            </div>

                            {/* Subtitle: Notification Type • DD/MM/YY • HH:MM */}
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 pl-4 sm:pl-4.5">
                              <span>{item.sourceLabel || 'Notification Type'}</span>
                              <span>•</span>
                              <span>{item.date}</span>
                              <span>•</span>
                              <span>{item.time}</span>
                            </div>
                          </div>

                          {/* Right Chevron */}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#5945F1] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Gamification & Onboarding Widgets (Fixed on scroll) */}
          <div className="lg:col-span-4">
            <aside
              aria-label="Notifications Sidebar"
              className="space-y-6 lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto lg:overscroll-contain sidebar-scrollbar"
            >
            {/* Widget 1: Staying here is boring. (Matches Screenshot 1:1) */}
            <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#ec4899] to-[#8b5cf6] shadow-sm">
              <div className="bg-white dark:bg-[#120a2e] rounded-[14.5px] p-5 space-y-4">
                <div>
                  <h4 className="font-display font-black text-sm text-[#0b1c30] dark:text-white">
                    Staying here is borin<span className="text-[#ec4899]">g.</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Make some trades and level up your rank automatically!
                  </p>
                </div>

                {/* Progress Visualizer: You (pink dot) ---> Climber (purple circle) */}
                <div className="relative pt-6 pb-2 px-1">
                  {/* Speech Bubble Badge with Arrow */}
                  <div className="absolute top-0 right-4 flex flex-col items-center">
                    <div className="bg-[#bef264] text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight flex items-center gap-1 shadow-2xs">
                      <span>Just</span>
                      <span className="text-[#5945F1] font-black">44 lots</span>
                      <span>and you're here!</span>
                    </div>
                    {/* Curved line indicator */}
                    <div className="w-6 h-3 border-r-2 border-b-2 border-indigo-400/60 rounded-br-lg -mr-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    {/* You (pink dot) */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#ec4899] shadow-xs" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">You</span>
                    </div>

                    {/* Stepper track */}
                    <div className="flex-1 mx-3 h-0.5 bg-indigo-100 dark:bg-indigo-950 relative">
                      <div className="absolute left-0 top-0 h-full w-1/4 bg-[#ec4899]" />
                    </div>

                    {/* Climber target */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-4 h-4 rounded-full border-2 border-[#5945F1] flex items-center justify-center text-[9px] font-bold text-[#5945F1] dark:text-[#a594fd]">
                        C
                      </span>
                      <span className="text-[11px] font-bold text-[#5945F1] dark:text-[#a594fd]">
                        Climber
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={onNavigateToSignals}
                    className="px-4 py-1.5 bg-[#5945F1] hover:bg-[#4338ca] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Trade Now
                  </button>
                </div>
              </div>
            </div>

            {/* Widget 2: Pick up where you left off. (Matches Screenshot 1:1) */}
            <div className="rounded-2xl p-5 bg-[#f8fafc] dark:bg-[#100726] border border-slate-200/90 dark:border-indigo-950/70 shadow-2xs space-y-4">
              <div>
                <div
                  onClick={onNavigateToBrokers}
                  className="flex items-center justify-between text-sm font-bold text-[#0b1c30] dark:text-white cursor-pointer group"
                >
                  <span className="group-hover:text-[#5945F1] transition-colors flex items-center">
                    Pick up where you left off<span className="text-[#ec4899] font-black">.</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-700 dark:text-slate-300 group-hover:text-[#5945F1] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Complete your account connection to access tiered trading cashback.
                </p>
              </div>

              {/* List of Tasks */}
              <div className="space-y-3.5 pt-1">
                {sidebarTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#150c33] border border-slate-200/90 dark:border-indigo-950/80 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Broker Square Logo */}
                      {task.id === 'axi' ? (
                        <div className="w-9 h-9 rounded-lg bg-[#E51D38] flex items-center justify-center text-white font-black text-xs shrink-0 tracking-tight shadow-2xs">
                          axi
                        </div>
                      ) : task.id === 'windsor' ? (
                        <div className="w-9 h-9 rounded-lg bg-[#0B1426] flex items-center justify-center text-[#00E5FF] font-black text-base shrink-0 shadow-2xs">
                          W
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#002868] font-black text-[8px] shrink-0 text-center leading-tight shadow-2xs">
                          AVA<br />TRADE
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-[#0b1c30] dark:text-white truncate">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {task.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Step Progress Line */}
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5945F1] shrink-0" />
                      <div className="h-[2px] w-6 bg-gradient-to-r from-[#5945F1] to-[#ec4899]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shrink-0" />
                      <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800" />
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {task.stepText}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          onShowToast?.(`Redirecting to connect ${task.name}...`);
                          onNavigateToBrokers();
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#bef264] hover:bg-[#aee64c] text-slate-900 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissTask(task.id)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a0f3d] border border-slate-200 dark:border-indigo-950 hover:bg-slate-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}

                {sidebarTasks.length === 0 && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#150c33] border border-slate-100 dark:border-indigo-950/60 text-center text-xs text-slate-500 space-y-1">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    <div className="font-semibold text-slate-800 dark:text-white">All tasks completed!</div>
                    <p className="text-[11px]">Your linked trading accounts are in sync.</p>
                  </div>
                )}
              </div>
            </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ─── Notification Detail Modal (Matches 05. Read Notification.png & 07. Read Announcement.png) ─── */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotification(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#120a2e] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-indigo-950/80 z-10 space-y-5"
            >
              {/* Close Button Top Right (Matches dark circular icon in screenshot) */}
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                aria-label="Close"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Modal Header */}
              <div className="pr-8 space-y-1">
                <h3 className="text-lg sm:text-xl font-bold font-display text-[#0b1c30] dark:text-white leading-snug">
                  {selectedNotification.modalTitle || selectedNotification.title}
                </h3>
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{selectedNotification.sourceLabel || 'Notification Type'}</span>
                  <span>•</span>
                  {selectedNotification.brokerName && (
                    <div className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      {renderInlineBrokerLogo(selectedNotification.brokerName)}
                      <span>Account Detail</span>
                      <span>•</span>
                    </div>
                  )}
                  <span>{selectedNotification.date}</span>
                  <span>•</span>
                  <span>{selectedNotification.time}</span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full border-b border-slate-100 dark:border-indigo-950" />

              {/* Modal Body: Activity Details vs Announcement Details */}
              {selectedNotification.category === 'activities' ? (
                <div className="space-y-4">
                  {/* Status row */}
                  {selectedNotification.statusBadge && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span className="font-bold">Status:</span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {selectedNotification.statusBadge}
                      </span>
                    </div>
                  )}

                  {/* Account Details Row */}
                  {selectedNotification.detailAccountText && (
                    <div className="text-xs text-slate-800 dark:text-slate-200">
                      <span className="font-bold">Account Details:</span>{' '}
                      <span className="text-slate-600 dark:text-slate-400">
                        {selectedNotification.detailAccountText}
                      </span>
                    </div>
                  )}

                  {/* Message Paragraph */}
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    {selectedNotification.detailMessage}
                  </p>

                  {/* Action Buttons (Matches 05. Read Notification.png: [My Cashback] [Trade Now]) */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    {selectedNotification.secondaryActionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNotification(null);
                          onNavigateToCashback();
                        }}
                        className="px-5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-[#1a0f3d] text-[#5945F1] dark:text-[#a594fd] font-semibold text-xs sm:text-sm hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer shadow-2xs"
                      >
                        {selectedNotification.secondaryActionLabel}
                      </button>
                    )}
                    {selectedNotification.primaryActionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNotification(null);
                          onNavigateToSignals();
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4338ca] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                      >
                        {selectedNotification.primaryActionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Announcement Modal Body (Matches 07. Read Announcement.png: Paragraph + [Let's Find Your Broker]) */
                <div className="space-y-6">
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedNotification.detailMessage}
                  </p>

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNotification(null);
                        onNavigateToBrokers();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4338ca] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                    >
                      {selectedNotification.primaryActionLabel || "Let's Find Your Broker"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
