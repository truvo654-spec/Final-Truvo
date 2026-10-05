import React from 'react';
import { GraduationCap, ChevronRight, Clock, BookOpen } from 'lucide-react';
import { COURSES } from '../../data/educationData';

interface CommunityFeaturedCoursesWidgetProps {
  onNavigateToTab?: (tab: string) => void;
}

export const CommunityFeaturedCoursesWidget: React.FC<CommunityFeaturedCoursesWidgetProps> = ({
  onNavigateToTab,
}) => {
  const featured = COURSES.slice(0, 3);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-[#5338ec]" />
          <h4 className="text-sm font-bold text-[#0b1c30]">Featured Courses</h4>
        </div>
        <button
          onClick={() => onNavigateToTab?.('education-hub')}
          className="flex items-center gap-0.5 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] transition-colors shrink-0"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {featured.map((course) => (
          <div key={course.id} className="flex items-center gap-3 group">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-[#0b1c30] group-hover:text-[#5338ec] transition-colors line-clamp-2 leading-snug">
                  {course.title}
                </p>
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold">
                  {course.level}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 mb-1.5 text-[10px] text-[#94a3b8] font-medium">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {course.lessons.length} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {course.lessons.reduce((s, l) => s + l.durationMinutes, 0)} min
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab?.('education-hub')}
                className="text-[11px] font-bold text-[#5338ec] border border-[#5338ec]/30 hover:border-[#5338ec] rounded-lg px-2.5 py-1 transition-colors"
              >
                View Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
