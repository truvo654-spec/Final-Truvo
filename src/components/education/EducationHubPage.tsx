import React, { useMemo, useState } from 'react';
import {
  Star,
  Users,
  Sparkles,
  Lock,
  Award,
  Share2,
  Download,
  Radio,
  Calendar as CalendarIcon,
  PlayCircle,
  PlusCircle,
  Bell,
} from 'lucide-react';
import { Course, LiveClass, LiveClassStatus } from '../../types';
import {
  COURSES,
  CERTIFICATES,
  LIVE_CLASSES,
  EDUCATION_CATEGORIES,
  PLAN_RANK,
  userPlanRank,
} from '../../data/educationData';
import { FolderTabs, FolderTabItem } from '../common/FolderTabs';
import { CourseDetailModal } from './CourseDetailModal';
import { CoursePlayerPage } from './CoursePlayerPage';

type HubTab = 'explore' | 'my-learning' | 'live' | 'certificates';
type LiveFilter = LiveClassStatus;

interface EducationHubPageProps {
  userTierLevel: number;
  isLoggedIn: boolean;
  isAdvisor?: boolean;
  isBroker?: boolean;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const HOST_STYLES: Record<LiveClass['hostType'], string> = {
  Advisor: 'border-[#FD02B0]',
  Broker: 'border-amber-400',
  MarketSyde: 'border-[#5338ec]',
};

export const EducationHubPage: React.FC<EducationHubPageProps> = ({
  userTierLevel,
  isLoggedIn,
  isAdvisor = false,
  isBroker = false,
  onUpgradePrompt,
  onShowToast,
}) => {
  const [tab, setTab] = useState<HubTab>('explore');
  const [category, setCategory] = useState<(typeof EDUCATION_CATEGORIES)[number]>('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Record<string, boolean>>({ course_1: true, course_2: true });
  const [completedLessons, setCompletedLessons] = useState<Record<string, Record<string, boolean>>>({
    course_1: { l1_1: true, l1_2: true, l1_3: true, l1_4: true, l1_5: true },
    course_2: { l2_1: true, l2_2: true },
  });
  const [liveFilter, setLiveFilter] = useState<LiveFilter>('live');
  const [remindedIds, setRemindedIds] = useState<Record<string, boolean>>({});
  const [playerLesson, setPlayerLesson] = useState<{ course: Course; lessonId: string } | null>(null);

  const planRank = userPlanRank(userTierLevel, isLoggedIn);
  const isAdvisorOrBroker = isAdvisor || isBroker;

  const tabs: FolderTabItem<HubTab>[] = [
    { id: 'explore', label: 'Explore' },
    { id: 'my-learning', label: 'My Learning' },
    { id: 'live', label: 'Live Classes' },
    { id: 'certificates', label: 'Certificates' },
  ];

  const filteredCourses = useMemo(
    () => (category === 'All' ? COURSES : COURSES.filter((c) => c.category === category)),
    [category]
  );

  const enrolledCourses = COURSES.filter((c) => enrolledIds[c.id]);
  const totalHours = Object.entries(completedLessons).reduce((sum, [courseId, lessonMap]) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return sum;
    const minutes = course.lessons
      .filter((l) => lessonMap[l.id])
      .reduce((s, l) => s + l.durationMinutes, 0);
    return sum + minutes;
  }, 0);
  const topicsCovered = new Set(enrolledCourses.map((c) => c.category)).size;

  const progressFor = (course: Course) => {
    const done = Object.values(completedLessons[course.id] || {}).filter(Boolean).length;
    return course.lessons.length > 0 ? Math.round((done / course.lessons.length) * 100) : 0;
  };

  const toggleLesson = (courseId: string, lessonId: string) => {
    setEnrolledIds((prev) => ({ ...prev, [courseId]: true }));
    setCompletedLessons((prev) => {
      const courseMap = { ...(prev[courseId] || {}) };
      courseMap[lessonId] = !courseMap[lessonId];
      return { ...prev, [courseId]: courseMap };
    });
  };

  const liveClassesFiltered = LIVE_CLASSES.filter((lc) => lc.status === liveFilter);

  const nextRecommended = COURSES.find(
    (c) => !enrolledIds[c.id] && PLAN_RANK[c.requiredPlan] <= Math.max(planRank, 0)
  );

  if (playerLesson) {
    return (
      <CoursePlayerPage
        course={playerLesson.course}
        userPlanRank={planRank}
        completedLessonIds={completedLessons[playerLesson.course.id] || {}}
        initialLessonId={playerLesson.lessonId}
        onBack={() => setPlayerLesson(null)}
        onCompleteLesson={(lessonId) => toggleLesson(playerLesson.course.id, lessonId)}
        onUpgradePrompt={onUpgradePrompt}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 py-8 sm:py-10 pb-24">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0b1c30]">Education Hub</h1>
          <p className="text-sm text-[#474556] mt-1">
            Free to start, no account required for the basics — upgrade your Learning Plan whenever you're ready.
          </p>
        </div>
        {isAdvisorOrBroker && (
          <button
            onClick={() => onShowToast('Opening course builder...')}
            className="shrink-0 flex items-center gap-1.5 bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Create content
          </button>
        )}
      </div>

      {/* Coursera-style summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
          <p className="text-xl font-bold text-[#0b1c30]">{Math.round(totalHours / 60)}h</p>
          <p className="text-xs text-[#474556]">Learning hours</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
          <p className="text-xl font-bold text-[#0b1c30]">{topicsCovered}</p>
          <p className="text-xs text-[#474556]">Topics covered</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
          <p className="text-xl font-bold text-[#0b1c30]">{CERTIFICATES.length}</p>
          <p className="text-xs text-[#474556]">Certificates earned</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4">
          <p className="text-xl font-bold text-[#667705]">+420</p>
          <p className="text-xs text-[#474556]">Points this month</p>
        </div>
      </div>

      <FolderTabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* ───── Explore ───── */}
      {tab === 'explore' && (
        <div className="mt-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 mb-5">
            {EDUCATION_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  category === c
                    ? 'bg-[#5338ec] border-[#5338ec] text-white'
                    : 'bg-white border-[#e2e8f0] text-[#474556] hover:border-[#5338ec] hover:text-[#5338ec]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const locked = planRank < PLAN_RANK[course.requiredPlan];
              const progress = progressFor(course);
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="text-left bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {locked && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold uppercase tracking-wide">
                      {course.requiredPlan}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-semibold text-[#5338ec] mb-1">{course.category} · {course.level}</p>
                    <h4 className="text-sm font-bold text-[#0b1c30] leading-snug mb-2 line-clamp-2">
                      {course.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-[#474556] mb-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-current" /> {course.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {(course.enrolledCount / 1000).toFixed(1)}K
                      </span>
                      <span className="flex items-center gap-1 ml-auto font-semibold text-[#667705]">
                        <Sparkles className="w-3 h-3" /> +{course.pointsReward}
                      </span>
                    </div>
                    {progress > 0 && (
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5338ec] rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── My Learning ───── */}
      {tab === 'my-learning' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10">
          <div className="space-y-4">
            {enrolledCourses.length === 0 && (
              <p className="text-sm text-[#474556] py-10 text-center">
                Nothing enrolled yet — head to Explore and start your first course.
              </p>
            )}
            {enrolledCourses.map((course) => {
              const progress = progressFor(course);
              return (
                <button
                  key={course.id}
                  onClick={() => {
                    const firstIncomplete = course.lessons.find((l) => !completedLessons[course.id]?.[l.id]);
                    setPlayerLesson({ course, lessonId: (firstIncomplete || course.lessons[0]).id });
                  }}
                  className="w-full flex items-center gap-4 bg-white border border-[#e2e8f0] rounded-2xl p-4 text-left hover:border-[#5338ec] transition-colors"
                >
                  <img src={course.thumbnail} alt={course.title} className="w-20 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#0b1c30] mb-1.5 truncate">{course.title}</h4>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-[#5338ec] rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-[#474556]">{progress}% complete</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-[#5338ec]">
                    {progress === 100 ? 'Review' : 'Continue'}
                  </span>
                </button>
              );
            })}
          </div>

          <aside className="space-y-6">
            {nextRecommended && (
              <div className="bg-[#F8F7FF] border border-[#ECEEFA] rounded-2xl p-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#5338ec] mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> Suggested next
                </p>
                <button
                  onClick={() => setSelectedCourse(nextRecommended)}
                  className="text-sm font-semibold text-[#0b1c30] hover:text-[#5338ec] text-left leading-snug transition-colors"
                >
                  {nextRecommended.title}
                </button>
              </div>
            )}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5">
              <h4 className="text-sm font-bold text-[#0b1c30] mb-3">This week's learning</h4>
              <div className="flex items-end gap-2 h-20">
                {[30, 55, 20, 70, 45, 10, 60].map((v, i) => (
                  <div key={i} className="flex-1 bg-[#EEF0FE] rounded-t-md" style={{ height: `${v}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#474556] mt-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ───── Live Classes (Discord-style rooms) ───── */}
      {tab === 'live' && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-6">
          <div className="bg-[#0b1c30] rounded-2xl p-3 flex sm:flex-col gap-1 h-fit overflow-x-auto sm:overflow-visible">
            {([
              { id: 'live', label: 'Live now', icon: Radio },
              { id: 'upcoming', label: 'Upcoming', icon: CalendarIcon },
              { id: 'replay', label: 'Replays', icon: PlayCircle },
            ] as { id: LiveFilter; label: string; icon: React.ElementType }[]).map((item) => {
              const Icon = item.icon;
              const active = liveFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setLiveFilter(item.id)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.id === 'live' && active ? 'text-rose-400' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {liveClassesFiltered.map((lc) => (
              <div
                key={lc.id}
                className={`flex items-center gap-4 bg-white border-l-4 ${HOST_STYLES[lc.hostType]} border-y border-r border-[#e2e8f0] rounded-2xl p-4`}
              >
                <img src={lc.hostAvatar} alt={lc.hostName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {lc.status === 'live' && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live
                      </span>
                    )}
                    <span className="text-xs text-[#474556]">{lc.hostName} · {lc.hostType}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0b1c30] mb-1">{lc.title}</h4>
                  <p className="text-xs text-[#474556] leading-relaxed mb-1.5 line-clamp-2">{lc.description}</p>
                  <div className="flex items-center gap-3 text-xs text-[#474556]">
                    <span>{lc.scheduledLabel}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {lc.attendeeCount}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {planRank < PLAN_RANK[lc.requiredPlan] ? (
                    <button
                      onClick={onUpgradePrompt}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] rounded-xl px-3.5 py-2 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" /> Upgrade
                    </button>
                  ) : lc.status === 'live' ? (
                    <button
                      onClick={() => onShowToast(`Joining ${lc.title}...`)}
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      Join
                    </button>
                  ) : lc.status === 'upcoming' ? (
                    <button
                      onClick={() => {
                        setRemindedIds((prev) => ({ ...prev, [lc.id]: !prev[lc.id] }));
                        onShowToast(remindedIds[lc.id] ? 'Reminder removed' : "We'll remind you before it starts");
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
                        remindedIds[lc.id] ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-slate-200 text-[#0b1c30] hover:bg-slate-50'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" /> {remindedIds[lc.id] ? 'Reminded' : 'Remind me'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onShowToast('Opening replay...')}
                      className="text-xs font-semibold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] rounded-xl px-3.5 py-2 transition-colors"
                    >
                      Watch
                    </button>
                  )}
                </div>
              </div>
            ))}

            {liveClassesFiltered.length === 0 && (
              <p className="text-sm text-[#474556] py-10 text-center">Nothing in this view right now.</p>
            )}
          </div>
        </div>
      )}

      {/* ───── Certificates ───── */}
      {tab === 'certificates' && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CERTIFICATES.map((cert) => (
            <div key={cert.id} className="bg-white border-2 border-[#EEF0FE] rounded-2xl p-5">
              <Award className="w-8 h-8 text-[#5338ec] mb-3" />
              <p className="text-[11px] font-semibold text-[#5338ec] mb-1">{cert.trackName}</p>
              <h4 className="text-sm font-bold text-[#0b1c30] leading-snug mb-1">{cert.courseTitle}</h4>
              <p className="text-xs text-[#474556] mb-4">Issued {cert.issuedDate}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShowToast('Certificate link copied')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1c30] border border-slate-200 hover:bg-slate-50 rounded-xl px-3 py-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button
                  onClick={() => onShowToast('Downloading certificate...')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1c30] border border-slate-200 hover:bg-slate-50 rounded-xl px-3 py-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
          {CERTIFICATES.length === 0 && (
            <p className="text-sm text-[#474556] py-10 text-center col-span-full">
              Complete a course track to earn your first certificate.
            </p>
          )}
        </div>
      )}

      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          userPlanRank={planRank}
          completedLessonIds={completedLessons[selectedCourse.id] || {}}
          isAdvisorOrBroker={isAdvisorOrBroker}
          onClose={() => setSelectedCourse(null)}
          onOpenLesson={(lessonId) => {
            setEnrolledIds((prev) => ({ ...prev, [selectedCourse.id]: true }));
            setPlayerLesson({ course: selectedCourse, lessonId });
            setSelectedCourse(null);
          }}
          onUpgradePrompt={onUpgradePrompt}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
