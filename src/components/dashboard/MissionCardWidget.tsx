import React, { useState } from 'react';
import {
  Check,
  Minus,
  Plus,
  Hourglass,
  Gem,
  Coins,
  Sparkles,
} from 'lucide-react';
import { WidgetSize } from '../../types/dashboardWidgets';

export interface MissionTask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  actionText?: string;
  onAction?: () => void;
}

interface MissionCardWidgetProps {
  className?: string;
  size?: WidgetSize;
  onNavigateToTab?: (tab: string) => void;
  onRewardClaimed?: (points: number, credits: number) => void;
}

export const MissionCardWidget: React.FC<MissionCardWidgetProps> = ({
  className = '',
  size = 3,
  onNavigateToTab,
  onRewardClaimed,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState<MissionTask[]>([
    {
      id: 'task-1',
      title: 'Adjust allocations so no single stock exceeds 30%.',
      description: "Buy into a sector you haven't invested in yet.",
      isCompleted: false,
      actionText: 'Add Asset',
    },
    {
      id: 'task-2',
      title: 'Rebalance Your Holdings',
      description: 'Adjust allocations so no single stock exceeds 30%.',
      isCompleted: true,
    },
    {
      id: 'task-3',
      title: 'Set a Stop-Loss Order',
      description: 'Protect a position by placing a stop-loss trigger.',
      isCompleted: false,
      actionText: 'Set Position',
    },
  ]);

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const nextState = !task.isCompleted;
          if (nextState && completedCount + 1 === totalCount && onRewardClaimed) {
            onRewardClaimed(15, 25);
          }
          return { ...task, isCompleted: nextState };
        }
        return task;
      })
    );
  };

  const handleTaskAction = (task: MissionTask, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.id === 'task-1') {
      if (onNavigateToTab) onNavigateToTab('signals');
    } else if (task.id === 'task-3') {
      if (onNavigateToTab) onNavigateToTab('signals');
    }
  };

  return (
    <div
      id="mission-card-widget"
      className={`w-full rounded-2xl sm:rounded-3xl border border-indigo-200/80 bg-white overflow-hidden shadow-2xs transition-all hover:shadow-xs interactive-card ${className}`}
    >
      {/* ─── GRADIENT HEADER (Matching Mission Card.png) ─── */}
      <div className="relative bg-gradient-to-r from-[#5338F5] via-[#482DEF] to-[#3B22D4] p-4 sm:p-5 text-white overflow-hidden">
        {/* Subtle curved overlay highlight on the right */}
        <div className="absolute top-0 right-0 w-80 h-full bg-radial from-white/12 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: 3D Glossy Chart Icon, Title, Subtitle, and Badges */}
          <div className="flex items-start gap-3.5">
            {/* 3D Glossy Chart Vector Icon matching Mission Card.png */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/25 shadow-inner backdrop-blur-md flex items-center justify-center p-2 shrink-0 mt-0.5">
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full drop-shadow-xs">
                {/* 3 Bars in Lime Green */}
                <rect x="6" y="18" width="5" height="13" rx="1.5" fill="#BEF226" />
                <rect x="15" y="12" width="5" height="19" rx="1.5" fill="#BEF226" />
                <rect x="24" y="8" width="5" height="23" rx="1.5" fill="#BEF226" />
                {/* Neon Trend Arrow */}
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
            <div className="space-y-1.5">
              <div>
                <h3 className="font-display font-black text-xl sm:text-[22px] text-white tracking-tight leading-tight">
                  Portfolio Power-Up
                </h3>
                <p className="text-white/85 text-xs sm:text-[13px] font-normal mt-0.5">
                  Strengthen your portfolio by diversifying across asset classes.
                </p>
              </div>

              {/* Badges Row: Expires in 5 Days, +15 Points, +25 Credits */}
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                {/* Badge 1: Expires in 5 Days */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180E6B]/75 text-white text-[11px] sm:text-xs font-semibold border border-white/15 backdrop-blur-xs">
                  <span className="text-xs">⏳</span>
                  <span>Expires in 5 Days</span>
                </div>

                {/* Badge 2: +15 Points */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180E6B]/75 text-white text-[11px] sm:text-xs font-semibold border border-white/15 backdrop-blur-xs">
                  <span className="text-xs">💎</span>
                  <span>+15 Points</span>
                </div>

                {/* Badge 3: +25 Credits */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#180E6B]/75 text-white text-[11px] sm:text-xs font-semibold border border-white/15 backdrop-blur-xs">
                  <span className="text-xs">💱</span>
                  <span>+25 Credits</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Progress Pill & Collapse Button */}
          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            {/* Progress Pill: 1/3 Completed */}
            <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/30 bg-white/20 backdrop-blur-xs text-xs sm:text-[13px] font-bold shadow-2xs">
              <div className="px-3 py-1.5 bg-white/25 text-white font-mono border-r border-white/20">
                {completedCount}/{totalCount}
              </div>
              <div className="px-3 py-1.5 text-white/95">
                Completed
              </div>
            </div>

            {/* Collapse/Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs transition-transform active:scale-95"
              title={isCollapsed ? 'Expand missions' : 'Collapse missions'}
            >
              {isCollapsed ? (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Minus className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── TASKS CHECKLIST BODY (Visible when not collapsed) ─── */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-3.5 divide-y divide-slate-100">
          {tasks.map((task, idx) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`flex items-center justify-between gap-4 pt-3.5 first:pt-0 cursor-pointer group transition-colors`}
            >
              {/* Left: Status Icon & Task Text */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Status Indicator */}
                {task.isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 group-hover:border-indigo-400 flex items-center justify-center shrink-0 transition-colors" />
                )}

                {/* Title & Description */}
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      task.isCompleted
                        ? 'text-emerald-600 font-bold'
                        : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-normal mt-0.5 truncate">
                    {task.description}
                  </div>
                </div>
              </div>

              {/* Right: Action Button (only shown for uncompleted tasks with actionText) */}
              {!task.isCompleted && task.actionText && (
                <button
                  type="button"
                  onClick={(e) => handleTaskAction(task, e)}
                  className="px-4 py-1.5 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  {task.actionText}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
