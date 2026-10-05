import React from 'react';
import {
  X,
  PlayCircle,
  FileText,
  HelpCircle,
  File,
  CheckCircle2,
  Lock,
  Clock,
  Star,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { Course } from '../../types';
import { PLAN_RANK } from '../../data/educationData';

interface CourseDetailModalProps {
  course: Course;
  userPlanRank: number;
  completedLessonIds: Record<string, boolean>;
  isAdvisorOrBroker?: boolean;
  onClose: () => void;
  onOpenLesson: (lessonId: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const FORMAT_ICON: Record<Course['lessons'][number]['format'], React.ElementType> = {
  Video: PlayCircle,
  Article: FileText,
  PDF: File,
  Quiz: HelpCircle,
};

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  userPlanRank,
  completedLessonIds,
  isAdvisorOrBroker = false,
  onClose,
  onOpenLesson,
  onUpgradePrompt,
  onShowToast,
}) => {
  const requiredRank = PLAN_RANK[course.requiredPlan];
  const courseLocked = userPlanRank < requiredRank;
  const totalMinutes = course.lessons.reduce((s, l) => s + l.durationMinutes, 0);
  const completedCount = course.lessons.filter((l) => completedLessonIds[l.id]).length;
  const progressPct = course.lessons.length > 0 ? Math.round((completedCount / course.lessons.length) * 100) : 0;
  const isComplete = progressPct === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-[#0b1c30] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-white/80 bg-white/60 backdrop-blur transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="aspect-[16/6] w-full overflow-hidden">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="px-2.5 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold">
              {course.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
              {course.level}
            </span>
            {course.brokerBranding && (
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold">
                {course.brokerBranding} Academy
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0b1c30] leading-snug mb-2">
            {course.title}
          </h2>
          <p className="text-sm text-[#474556] leading-relaxed mb-4">{course.summary}</p>

          <div className="flex items-center gap-4 flex-wrap mb-5">
            <div className="flex items-center gap-2">
              <img src={course.instructorAvatar} alt={course.instructorName} className="w-7 h-7 rounded-full object-cover" />
              <span className="text-xs font-semibold text-[#0b1c30]">{course.instructorName}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#474556]">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#474556]">
              <Users className="w-3.5 h-3.5" /> {course.enrolledCount.toLocaleString()} enrolled
            </span>
            <span className="flex items-center gap-1 text-xs text-[#474556]">
              <Clock className="w-3.5 h-3.5" /> {totalMinutes} min total
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#667705]">
              <Sparkles className="w-3.5 h-3.5" /> +{course.pointsReward} pts on completion
            </span>
          </div>

          {courseLocked ? (
            <div className="flex items-center justify-between gap-4 bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl px-5 py-3 mb-5">
              <span className="text-sm font-medium text-[#0b1c30]">
                This course is included in the {course.requiredPlan} Learning Plan.
              </span>
              <button
                onClick={onUpgradePrompt}
                className="shrink-0 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                See plans
              </button>
            </div>
          ) : (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#474556]">
                  {completedCount} of {course.lessons.length} lessons complete
                </span>
                <span className="text-xs font-bold text-[#5338ec]">{progressPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5338ec] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {/* Curriculum */}
          <div className="border border-[#e2e8f0] rounded-2xl divide-y divide-[#f1f5f9] mb-5">
            {course.lessons.map((lesson) => {
              const Icon = FORMAT_ICON[lesson.format];
              const lessonLocked = courseLocked || (lesson.isPremium && userPlanRank < 1);
              const done = !!completedLessonIds[lesson.id];
              return (
                <button
                  key={lesson.id}
                  onClick={() => (lessonLocked ? onUpgradePrompt() : onOpenLesson(lesson.id))}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  {lessonLocked ? (
                    <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                  ) : done ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5338ec] shrink-0 fill-current" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`flex-1 text-sm font-medium ${done ? 'text-[#474556]' : 'text-[#0b1c30]'}`}>
                    {lesson.title}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">{lesson.durationMinutes} min</span>
                </button>
              );
            })}
          </div>

          {!courseLocked && (
            <div className="flex items-center gap-3">
              {!isComplete ? (
                <button
                  onClick={() => {
                    const firstIncomplete = course.lessons.find((l) => !completedLessonIds[l.id]);
                    onOpenLesson((firstIncomplete || course.lessons[0]).id);
                  }}
                  className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold rounded-xl py-3 transition-colors"
                >
                  {completedCount > 0 ? 'Continue course' : 'Start course'}
                </button>
              ) : (
                <button
                  onClick={() => onShowToast('Certificate ready — shared to your profile.')}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0b1c30] hover:bg-slate-800 text-white text-sm font-semibold rounded-xl py-3 transition-colors"
                >
                  <Award className="w-4 h-4" /> Get your certificate
                </button>
              )}
            </div>
          )}

          {/* Advisor / broker analytics */}
          {isAdvisorOrBroker && course.isAdvisorContent && (
            <div className="mt-6 pt-5 border-t border-[#f1f5f9]">
              <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-3">
                Course performance
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#0b1c30]">{course.enrolledCount.toLocaleString()}</p>
                  <p className="text-[11px] text-[#474556]">Viewers</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#0b1c30]">68%</p>
                  <p className="text-[11px] text-[#474556]">Completion rate</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-[#0b1c30]">{course.rating.toFixed(1)}/5</p>
                  <p className="text-[11px] text-[#474556]">Feedback score</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
