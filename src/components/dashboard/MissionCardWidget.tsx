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
}

export const MissionCardWidget: React.FC<MissionCardWidgetProps> = ({
  className = '',
  size = 3,
  missions: propMissions,
  onUpdateMissions,
  onNavigateToTab,
  onRewardClaimed,
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

  // Limit shown tasks to first 3 so cards stay uniform in height
  const displayedTasks = currentMission.tasks.slice(0, 3);

  return (
    <div
      id="mission-card-widget"
      className={`w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ─── MAIN PURPLE CARD CONTAINER (Matching Mission Card Widget.png) ─── */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#5136EE] overflow-hidden p-4 sm:p-5 md:p-6 text-white shadow-md transition-all">
        {/* Subtle curved ambient highlight dome on the right */}
        <div
          className="absolute -right-8 -top-8 w-80 sm:w-96 h-full rounded-full pointer-events-none opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(139, 92, 246, 0.2) 45%, transparent 70%)',
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
                {/* 3D Glassy Icon with Lime Bars and Trend Arrow */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 shadow-inner backdrop-blur-md flex items-center justify-center p-2.5 shrink-0 mt-0.5">
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    className="w-full h-full drop-shadow-xs"
                  >
                    {/* 3 Bars in Neon Lime */}
                    <rect x="6" y="18" width="5" height="13" rx="1.5" fill="#BEF226" />
                    <rect x="15" y="12" width="5" height="19" rx="1.5" fill="#BEF226" />
                    <rect x="24" y="8" width="5" height="23" rx="1.5" fill="#BEF226" />
                    {/* Neon Trend Line & Arrow */}
                    <path
                      d="M 6 22 L 15 15 L 21 19 L 29 8"
                      stroke="#BEF226"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M 24 8 H 29 V 13"
                      stroke="#BEF226"
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
                    <h3 className="font-display font-black text-xl sm:text-[22px] text-white tracking-tight leading-tight truncate">
                      {currentMission.title}
                    </h3>
                    <p className="text-white/85 text-xs sm:text-[13px] font-normal mt-0.5 leading-snug line-clamp-1">
                      {currentMission.subtitle}
                    </p>
                  </div>

                  {/* Badges Row: Expires, Points, Credits */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {/* Expiration badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180E6B]/75 text-white text-[11px] sm:text-xs font-semibold border border-white/15 backdrop-blur-xs shadow-2xs">
                      <span className="text-xs">⌛</span>
                      <span>
                        {currentMission.expiresIn ||
                          (currentMission.isDaily ? 'Daily Reset' : 'Expires in 5 Days')}
                      </span>
                    </div>

                    {/* Points badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180E6B]/75 text-white text-[11px] sm:text-xs font-semibold border border-white/15 backdrop-blur-xs shadow-2xs">
                      <span className="text-xs">💎</span>
                      <span>+{currentMission.rewardPoints} Points</span>
                    </div>

                    {/* Credits badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180E6B]/75 text-white text-[11px] sm:text-xs font-semibold border border-white/15 backdrop-blur-xs shadow-2xs">
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
                  <div className="px-3 py-1.5 bg-white/95 text-[#5338ec] font-mono font-bold border-r border-slate-200/80">
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
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer shadow-xs transition-transform active:scale-95"
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
                          <div className="w-5 h-5 rounded-full bg-[#edf2f7] border border-slate-200/80 group-hover:border-indigo-400 shrink-0 transition-colors" />
                        )}

                        <div className="min-w-0">
                          <div
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              task.completed
                                ? 'text-[#16a34a]'
                                : 'text-slate-900 group-hover:text-[#5338ec] transition-colors'
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
                          className="rounded-lg border border-indigo-200 bg-white text-[#5338ec] hover:bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
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
          {missionsList.map((m, idx) => (
            <button
              key={m.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === safeIndex
                  ? 'w-2.5 h-2.5 bg-[#5338ec]'
                  : 'w-2 h-2 bg-indigo-200 hover:bg-indigo-300'
              }`}
              title={m.title}
              aria-label={`Go to ${m.title}`}
            />
          ))}
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
