import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WidgetSize } from '../../types/dashboardWidgets';
import { Mission, MissionTask } from '../../types';
import { INITIAL_MISSIONS } from '../../data/mockData';

interface MissionCardWidgetProps {
  className?: string;
  size?: WidgetSize;
  missions?: Mission[];
  onUpdateMissions?: (missions: Mission[]) => void;
  onNavigateToTab?: (tab: string) => void;
  onRewardClaimed?: (points: number, credits: number, reason?: string) => void;
  themeOverride?: 'purple' | 'pink' | 'lime' | 'light';
  noShadow?: boolean;
}

interface MissionThemeStyles {
  containerBg: string;
  glowGradient: string;
  badgeBg: string;
  iconBoxBg: string;
  iconBarColor: string;
  titleColor: string;
  subtitleColor: string;
  toggleBtnClass: string;
  numberColor: string;
  actionBtnBorder: string;
  actionBtnText: string;
  actionBtnBg: string;
  actionBtnHoverBg: string;
  hoverTaskText: string;
  hoverCheckboxBorder: string;
  dotActive: string;
  suffixColor: string;
}

const THEME_STYLES: Record<'purple' | 'pink' | 'lime' | 'light', MissionThemeStyles> = {
  purple: {
    containerBg: 'bg-[#5136EE]',
    glowGradient:
      'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(139, 92, 246, 0.25) 45%, transparent 70%)',
    badgeBg: 'bg-[#180E6B]/75 text-white border-white/15',
    iconBoxBg: 'bg-white/15 border-white/25',
    iconBarColor: '#BEF226',
    titleColor: 'text-white',
    subtitleColor: 'text-white/85',
    toggleBtnClass: 'bg-white hover:bg-slate-100 text-slate-700',
    numberColor: 'text-[#5136EE]',
    actionBtnBorder: 'border-indigo-200',
    actionBtnText: 'text-[#5136EE]',
    actionBtnBg: 'bg-white',
    actionBtnHoverBg: 'hover:bg-indigo-50',
    hoverTaskText: 'group-hover:text-[#5136EE]',
    hoverCheckboxBorder: 'group-hover:border-[#5136EE]',
    dotActive: 'bg-[#5136EE]',
    suffixColor: '#BEF226',
  },
  pink: {
    containerBg: 'bg-gradient-to-br from-[#FF007A] via-[#E11D74] to-[#B90C5C]',
    glowGradient:
      'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(254, 1, 177, 0.3) 45%, transparent 70%)',
    badgeBg: 'bg-[#6B0033]/80 text-white border-white/20',
    iconBoxBg: 'bg-white/15 border-white/25',
    iconBarColor: '#FFDE59',
    titleColor: 'text-white',
    subtitleColor: 'text-white/85',
    toggleBtnClass: 'bg-white hover:bg-slate-100 text-slate-700',
    numberColor: 'text-[#E11D74]',
    actionBtnBorder: 'border-pink-200',
    actionBtnText: 'text-[#E11D74]',
    actionBtnBg: 'bg-white',
    actionBtnHoverBg: 'hover:bg-pink-50',
    hoverTaskText: 'group-hover:text-[#E11D74]',
    hoverCheckboxBorder: 'group-hover:border-[#E11D74]',
    dotActive: 'bg-[#FF007A]',
    suffixColor: '#FFDE59',
  },
  lime: {
    containerBg: 'bg-[#CAEB0E]',
    glowGradient:
      'radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(202, 235, 14, 0.3) 45%, transparent 70%)',
    badgeBg: 'bg-slate-950/85 text-white border-black/20',
    iconBoxBg: 'bg-black/10 border-black/15',
    iconBarColor: '#0F172A',
    titleColor: 'text-slate-950',
    subtitleColor: 'text-slate-800',
    toggleBtnClass: 'bg-slate-950 hover:bg-slate-800 text-white',
    numberColor: 'text-slate-950',
    actionBtnBorder: 'border-[#b5d606]',
    actionBtnText: 'text-slate-950',
    actionBtnBg: 'bg-[#CAEB0E]',
    actionBtnHoverBg: 'hover:bg-[#bedf07]',
    hoverTaskText: 'group-hover:text-black',
    hoverCheckboxBorder: 'group-hover:border-slate-950',
    dotActive: 'bg-[#CAEB0E] ring-2 ring-slate-800/40',
    suffixColor: '#0F172A',
  },
  light: {
    containerBg: 'bg-[#EEF2F9]',
    glowGradient:
      'radial-gradient(circle, rgba(89,69,241,0.12) 0%, rgba(89,69,241,0.05) 45%, transparent 70%)',
    badgeBg: 'bg-white text-slate-700 border-slate-200',
    iconBoxBg: 'bg-white border-slate-200',
    iconBarColor: '#5945F1',
    titleColor: 'text-[#0b1c30]',
    subtitleColor: 'text-slate-600',
    toggleBtnClass: 'bg-[#0b1c30] hover:bg-black text-white',
    numberColor: 'text-[#5945F1]',
    actionBtnBorder: 'border-indigo-200',
    actionBtnText: 'text-[#5945F1]',
    actionBtnBg: 'bg-white',
    actionBtnHoverBg: 'hover:bg-indigo-50',
    hoverTaskText: 'group-hover:text-[#5945F1]',
    hoverCheckboxBorder: 'group-hover:border-[#5945F1]',
    dotActive: 'bg-[#5945F1]',
    suffixColor: '#5945F1',
  },
};

export const MissionCardWidget: React.FC<MissionCardWidgetProps> = ({
  className = '',
  size = 3,
  missions: propMissions,
  onUpdateMissions,
  onNavigateToTab,
  onRewardClaimed,
  themeOverride,
  noShadow = false,
}) => {
  // Use prop missions if provided, otherwise fallback to INITIAL_MISSIONS
  const [localMissions, setLocalMissions] = useState<Mission[]>(
    propMissions && propMissions.length > 0 ? propMissions : INITIAL_MISSIONS
  );

  // Sync if propMissions updates from outside
  useEffect(() => {
    if (propMissions && propMissions.length > 0) {
      setLocalMissions(propMissions);
    }
  }, [propMissions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const missionsList = localMissions.length > 0 ? localMissions : INITIAL_MISSIONS;
  const safeIndex = currentIndex % missionsList.length;
  const currentMission = missionsList[safeIndex];

  // Auto-slide every 5 seconds (5000ms), paused on hover or when collapsed
  useEffect(() => {
    if (isHovered || isCollapsed || missionsList.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % missionsList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, isCollapsed, missionsList.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + missionsList.length) % missionsList.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % missionsList.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > safeIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Toggle task completion
  const toggleTask = (missionId: string, taskId: string) => {
    const updated = missionsList.map((m) => {
      if (m.id !== missionId) return m;
      const updatedTasks = m.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        return { ...t, completed: nextCompleted };
      });

      const allCompleted = updatedTasks.every((t) => t.completed);
      const prevAllCompleted = m.tasks.every((t) => t.completed);

      if (allCompleted && !prevAllCompleted && onRewardClaimed) {
        onRewardClaimed(m.rewardPoints, m.rewardCredits, m.title);
      }

      return {
        ...m,
        tasks: updatedTasks,
        status: allCompleted ? ('completed' as const) : m.status,
      };
    });

    setLocalMissions(updated);
    if (onUpdateMissions) {
      onUpdateMissions(updated);
    }
  };

  const handleTaskAction = (task: MissionTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onNavigateToTab) return;

    const cat = task.category || '';
    if (cat === 'trade' || cat === 'signals' || cat === 'stoploss') {
      onNavigateToTab('signals');
    } else if (cat === 'broker' || cat === 'explore') {
      onNavigateToTab('brokers');
    } else if (cat === 'convert' || cat === 'rebalance') {
      onNavigateToTab('points-credits');
    } else {
      onNavigateToTab('signals');
    }
  };

  const completedCount = currentMission.tasks.filter((t) => t.completed).length;
  const totalCount = currentMission.tasks.length;

  const missionThemeKey: 'purple' | 'pink' | 'lime' | 'light' =
    themeOverride ||
    (currentMission.theme && THEME_STYLES[currentMission.theme]
      ? currentMission.theme
      : 'purple');
  const currentTheme = THEME_STYLES[missionThemeKey];

  // Limit shown tasks to first 3 so cards stay uniform in height
  const displayedTasks = currentMission.tasks.slice(0, 3);

  return (
    <div
      id="mission-card-widget"
      className={`w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── DYNAMIC MISSION CARD CONTAINER (Colors change per mission) ─── */}
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl ${currentTheme.containerBg} overflow-hidden p-4 sm:p-5 md:p-6 ${noShadow ? '' : 'shadow-md'} transition-all duration-500`}
      >
        {/* Subtle curved ambient highlight dome on the right */}
        <div
          className="absolute -right-8 -top-8 w-80 sm:w-96 h-full rounded-full pointer-events-none opacity-35 transition-all duration-500"
          style={{
            background: currentTheme.glowGradient,
          }}
        />

        {/* Animated Slide Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentMission.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="relative z-10"
          >
            {/* ─── TOP ROW: Icon + Title + Subtitle + Badges + Progress + Minus ─── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Column: 3D Glossy Vector Chart Icon + Title & Badges */}
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                {/* 3D Glassy Icon with Bars and Trend Arrow matching mission theme */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${currentTheme.iconBoxBg} shadow-inner backdrop-blur-md flex items-center justify-center p-2.5 shrink-0 mt-0.5`}>
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    className="w-full h-full drop-shadow-xs"
                  >
                    {/* 3 Bars in theme accent color */}
                    <rect x="6" y="18" width="5" height="13" rx="1.5" fill={currentTheme.iconBarColor} />
                    <rect x="15" y="12" width="5" height="19" rx="1.5" fill={currentTheme.iconBarColor} />
                    <rect x="24" y="8" width="5" height="23" rx="1.5" fill={currentTheme.iconBarColor} />
                    {/* Neon Trend Line & Arrow */}
                    <path
                      d="M 6 22 L 15 15 L 21 19 L 29 8"
                      stroke={currentTheme.iconBarColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M 24 8 H 29 V 13"
                      stroke={currentTheme.iconBarColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Title, Subtitle, and Badges */}
                <div className="min-w-0 space-y-1">
                  <div>
                    <h3 className={`font-display font-black text-xl sm:text-[22px] ${currentTheme.titleColor} tracking-tight leading-tight truncate`}>
                      {currentMission.title}
                      {currentMission.coloredSuffix && (
                        <>
                          {' '}
                          <span style={{ color: currentTheme.suffixColor }}>
                            {currentMission.coloredSuffix.text}
                          </span>
                        </>
                      )}
                    </h3>
                    <p className={`${currentTheme.subtitleColor} text-xs sm:text-[13px] font-medium mt-0.5 leading-snug line-clamp-1`}>
                      {currentMission.subtitle}
                    </p>
                  </div>

                  {/* Badges Row: Expires, Points, Credits */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {/* Expiration badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentTheme.badgeBg} text-[11px] sm:text-xs font-semibold backdrop-blur-xs shadow-2xs`}>
                      <span className="text-xs">⌛</span>
                      <span>
                        {currentMission.expiresIn ||
                          (currentMission.isDaily ? 'Daily Reset' : 'Expires in 5 Days')}
                      </span>
                    </div>

                    {/* Points badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentTheme.badgeBg} text-[11px] sm:text-xs font-semibold backdrop-blur-xs shadow-2xs`}>
                      <span className="text-xs">💎</span>
                      <span>+{currentMission.rewardPoints} Points</span>
                    </div>

                    {/* Credits badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentTheme.badgeBg} text-[11px] sm:text-xs font-semibold backdrop-blur-xs shadow-2xs`}>
                      <span className="text-xs">🪙</span>
                      <span>+{currentMission.rewardCredits} Credits</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: 1/3 Completed Pill + Minus/Plus Button */}
              <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
                {/* 1/3 Completed Pill matching image */}
                <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/35 bg-white/85 backdrop-blur-xs text-xs sm:text-[13px] shadow-2xs">
                  <div className={`px-3 py-1.5 bg-white/95 ${currentTheme.numberColor} font-mono font-bold border-r border-slate-200/80`}>
                    {completedCount}/{totalCount}
                  </div>
                  <div className="px-3 py-1.5 text-slate-600 font-semibold">
                    Completed
                  </div>
                </div>

                {/* Collapse / Expand Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`w-8 h-8 rounded-xl ${currentTheme.toggleBtnClass} flex items-center justify-center cursor-pointer shadow-xs transition-transform active:scale-95`}
                  title={isCollapsed ? 'Expand missions' : 'Collapse missions'}
                >
                  {isCollapsed ? (
                    <Plus className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Minus className="w-4 h-4 stroke-[3]" />
                  )}
                </button>
              </div>
            </div>

            {/* ─── WHITE CARD: TASK CHECKLIST (Matching Mission Card Widget.png) ─── */}
            {!isCollapsed && (
              <div className="mt-4 sm:mt-5 bg-white rounded-2xl p-4 sm:p-5 shadow-xs text-slate-800">
                <div className="space-y-3.5">
                  {displayedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(currentMission.id, task.id)}
                      className="flex items-center justify-between gap-4 cursor-pointer group select-none"
                    >
                      {/* Left: Checkmark or Unchecked circle + Title & Description */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {task.completed ? (
                          <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3.5]" />
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full bg-[#edf2f7] border border-slate-200/80 ${currentTheme.hoverCheckboxBorder} shrink-0 transition-colors`} />
                        )}

                        <div className="min-w-0">
                          <div
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              task.completed
                                ? 'text-[#16a34a]'
                                : `text-slate-900 ${currentTheme.hoverTaskText} transition-colors`
                            }`}
                          >
                            {task.title}
                          </div>
                          <div className="text-[11px] sm:text-xs text-slate-400 font-normal mt-0.5 truncate">
                            {task.description}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Button (e.g. Add Asset) */}
                      {!task.completed && (
                        <button
                          type="button"
                          onClick={(e) => handleTaskAction(task, e)}
                          className={`rounded-lg border ${currentTheme.actionBtnBorder} ${currentTheme.actionBtnBg} ${currentTheme.actionBtnText} ${currentTheme.actionBtnHoverBg} px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer`}
                        >
                          {task.actionLabel || 'Add Asset'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── CAROUSEL CONTROLS BELOW THE CARD (< • • • >) ─── */}
      <div className="flex items-center justify-center gap-2 pt-3 select-none">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Previous mission"
          aria-label="Previous mission"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-1.5">
          {missionsList.map((m, idx) => {
            const isCurrent = idx === safeIndex;
            const mTheme =
              m.theme && THEME_STYLES[m.theme]
                ? THEME_STYLES[m.theme]
                : THEME_STYLES.purple;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isCurrent
                    ? `w-2.5 h-2.5 ${mTheme.dotActive} shadow-xs scale-110`
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={m.title}
                aria-label={`Go to ${m.title}`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Next mission"
          aria-label="Next mission"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
