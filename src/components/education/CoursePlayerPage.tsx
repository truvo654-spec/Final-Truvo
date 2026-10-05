import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  FileText,
  HelpCircle,
  File,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  Sparkles,
} from 'lucide-react';
import { Course, CourseLesson } from '../../types';
import { PLAN_RANK } from '../../data/educationData';

interface CoursePlayerPageProps {
  course: Course;
  userPlanRank: number;
  completedLessonIds: Record<string, boolean>;
  initialLessonId: string;
  onBack: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const FORMAT_ICON: Record<CourseLesson['format'], React.ElementType> = {
  Video: Play,
  Article: FileText,
  PDF: File,
  Quiz: HelpCircle,
};

export const CoursePlayerPage: React.FC<CoursePlayerPageProps> = ({
  course,
  userPlanRank,
  completedLessonIds,
  initialLessonId,
  onBack,
  onCompleteLesson,
  onUpgradePrompt,
  onShowToast,
}) => {
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const courseLocked = userPlanRank < PLAN_RANK[course.requiredPlan];
  const lessonIndex = course.lessons.findIndex((l) => l.id === currentLessonId);
  const lesson = course.lessons[lessonIndex] ?? course.lessons[0];
  const lessonLocked = courseLocked || (lesson.isPremium && userPlanRank < 1);

  const completedCount = course.lessons.filter((l) => completedLessonIds[l.id]).length;
  const progressPct = Math.round((completedCount / course.lessons.length) * 100);
  const courseComplete = progressPct === 100;
  const isLessonDone = !!completedLessonIds[lesson.id];

  const goTo = (id: string) => {
    setCurrentLessonId(id);
  };

  const goRelative = (delta: number) => {
    const next = course.lessons[lessonIndex + delta];
    if (next) setCurrentLessonId(next.id);
  };

  const markComplete = () => {
    if (!isLessonDone) {
      onCompleteLesson(lesson.id);
      onShowToast(`+${Math.round(course.pointsReward / course.lessons.length)} pts earned`);
    }
    if (lessonIndex < course.lessons.length - 1) {
      goRelative(1);
    }
  };

  const quizResult = useMemo(() => {
    if (lesson.format !== 'Quiz' || !lesson.quizQuestions || !quizSubmitted[lesson.id]) return null;
    const correct = lesson.quizQuestions.filter((q) => quizAnswers[q.id] === q.correctIndex).length;
    return { correct, total: lesson.quizQuestions.length };
  }, [lesson, quizAnswers, quizSubmitted]);

  if (courseLocked) {
    return (
      <div className="w-full max-w-[720px] mx-auto px-4 py-16 text-center">
        <Lock className="w-8 h-8 text-slate-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#0b1c30] mb-2">
          This course is included in the {course.requiredPlan} Learning Plan
        </h2>
        <p className="text-sm text-[#474556] mb-6">Upgrade to unlock every lesson, the quizzes and the certificate.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onBack} className="text-sm font-semibold text-[#474556] hover:text-[#0b1c30]">
            Back to Education Hub
          </button>
          <button
            onClick={onUpgradePrompt}
            className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            See plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top bar + progress */}
      <div className="w-full border-b border-[#f1f5f9] bg-white sticky top-0 z-10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-[#474556] hover:text-[#5338ec] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Education Hub
          </button>
          <span className="text-sm font-bold text-[#0b1c30] truncate">{course.title}</span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-[#5338ec] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-xs font-semibold text-[#474556] shrink-0">{progressPct}%</span>
        </div>
      </div>

      {courseComplete && (
        <div className="bg-[#0b1c30] text-white">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-3 flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Award className="w-4 h-4 text-[#CAEB0E]" /> Course complete — your certificate is ready.
            </span>
            <button
              onClick={() => onShowToast('Certificate ready — shared to your profile.')}
              className="bg-[#CAEB0E] hover:bg-[#b8d60a] text-[#0b1c30] text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shrink-0"
            >
              Get certificate
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8">
        {/* Main lesson content */}
        <div className="min-w-0">
          {lessonLocked ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
              <Lock className="w-6 h-6 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#0b1c30] mb-1">This lesson needs a Basic Learning Plan</p>
              <button onClick={onUpgradePrompt} className="text-sm font-semibold text-[#5338ec] hover:text-[#4326d8]">
                See plans →
              </button>
            </div>
          ) : (
            <>
              {lesson.format === 'Video' && (
                <div className="aspect-video w-full bg-[#0b1c30] rounded-2xl flex items-center justify-center relative overflow-hidden mb-5">
                  <button
                    onClick={() => onShowToast('Playing lesson...')}
                    className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                    aria-label="Play"
                  >
                    <Play className="w-7 h-7 text-white fill-current ml-1" />
                  </button>
                  <span className="absolute bottom-4 right-5 text-xs font-mono text-white/70">
                    {lesson.videoDurationLabel || `${lesson.durationMinutes}:00`}
                  </span>
                </div>
              )}

              {lesson.format === 'PDF' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 flex flex-col items-center text-center mb-5">
                  <File className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-[#0b1c30] mb-3">{lesson.title}.pdf</p>
                  <button
                    onClick={() => onShowToast('Downloading PDF...')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0b1c30] hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              )}

              <p className="text-xs font-semibold text-[#5338ec] mb-1.5">
                Lesson {lessonIndex + 1} of {course.lessons.length}
              </p>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#0b1c30] mb-4">{lesson.title}</h1>

              {lesson.format === 'Article' && (
                <div className="space-y-4 text-[15px] leading-[1.75] text-[#0b1c30] mb-6">
                  {(lesson.articleContent || [
                    'Full lesson content for this article is being finalized — check back soon, or mark this lesson complete once you\u2019ve reviewed it elsewhere.',
                  ]).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {lesson.format === 'Quiz' && (
                <div className="space-y-5 mb-6">
                  {lesson.quizQuestions ? (
                    <>
                      {lesson.quizQuestions.map((q, qi) => (
                        <div key={q.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
                          <p className="text-sm font-semibold text-[#0b1c30] mb-3">
                            {qi + 1}. {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => {
                              const selected = quizAnswers[q.id] === oi;
                              const submitted = quizSubmitted[q.id] || quizSubmitted[lesson.id];
                              const isCorrect = oi === q.correctIndex;
                              let style = 'border-slate-200 hover:border-[#5338ec]';
                              if (quizSubmitted[lesson.id]) {
                                if (isCorrect) style = 'border-emerald-400 bg-emerald-50';
                                else if (selected && !isCorrect) style = 'border-rose-300 bg-rose-50';
                                else style = 'border-slate-200';
                              } else if (selected) {
                                style = 'border-[#5338ec] bg-[#F8F7FF]';
                              }
                              return (
                                <button
                                  key={oi}
                                  disabled={quizSubmitted[lesson.id]}
                                  onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                                  className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl border transition-colors ${style}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {!quizSubmitted[lesson.id] ? (
                        <button
                          onClick={() => setQuizSubmitted((prev) => ({ ...prev, [lesson.id]: true }))}
                          disabled={lesson.quizQuestions.some((q) => quizAnswers[q.id] === undefined)}
                          className="bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                        >
                          Submit answers
                        </button>
                      ) : (
                        quizResult && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#0b1c30]">
                            <Sparkles className="w-4 h-4 text-[#5338ec]" />
                            You scored {quizResult.correct} of {quizResult.total} — {completedCount < course.lessons.length ? 'nice work' : 'all done!'}
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#474556]">Questions for this quiz are coming soon.</p>
                  )}
                </div>
              )}

              {/* Personal notes */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">Your notes</p>
                <textarea
                  value={notes[lesson.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [lesson.id]: e.target.value }))}
                  rows={3}
                  placeholder="Jot down anything you want to remember from this lesson..."
                  className="w-full resize-none border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
                <button
                  onClick={() => goRelative(-1)}
                  disabled={lessonIndex === 0}
                  className="flex items-center gap-1 text-sm font-semibold text-[#474556] hover:text-[#0b1c30] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  onClick={markComplete}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors ${
                    isLessonDone
                      ? 'bg-slate-100 text-[#474556]'
                      : 'bg-[#5338ec] hover:bg-[#4326d8] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isLessonDone ? 'Completed' : 'Mark complete & continue'}
                </button>

                <button
                  onClick={() => goRelative(1)}
                  disabled={lessonIndex === course.lessons.length - 1}
                  className="flex items-center gap-1 text-sm font-semibold text-[#474556] hover:text-[#0b1c30] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Curriculum sidebar */}
        <aside className="lg:sticky lg:top-20 h-fit">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden">
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] px-4 pt-4 pb-2">
              Course content
            </p>
            <div className="divide-y divide-[#f1f5f9] max-h-[60vh] overflow-y-auto">
              {course.lessons.map((l, i) => {
                const Icon = FORMAT_ICON[l.format];
                const done = !!completedLessonIds[l.id];
                const locked = l.isPremium && userPlanRank < 1;
                const active = l.id === lesson.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => (locked ? onUpgradePrompt() : goTo(l.id))}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                      active ? 'bg-[#F8F7FF]' : 'hover:bg-slate-50'
                    }`}
                  >
                    {locked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    ) : done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5338ec] fill-current shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className={`flex-1 text-xs font-medium ${active ? 'text-[#5338ec]' : 'text-[#0b1c30]'}`}>
                      {i + 1}. {l.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
