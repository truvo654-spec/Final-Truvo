import React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import {
  STORY_MARKET_TODAY,
  STORY_TRADING_SETUP,
  STORY_LIFE_AS_TRADER,
  STORY_EVENT_HIGHLIGHTS,
} from '../../data/communityImagePlaceholders';

interface Story {
  id: string;
  label: string;
  timeLabel: string;
  bg: string;
  ringColor: string;
  avatar: string;
}

const STORIES: Story[] = [
  { id: 's1', label: 'Market Today', timeLabel: '2h ago', bg: STORY_MARKET_TODAY, ringColor: 'ring-[#5338ec]', avatar: '📈' },
  { id: 's2', label: 'Trading Setup', timeLabel: '4h ago', bg: STORY_TRADING_SETUP, ringColor: 'ring-rose-500', avatar: '💻' },
  { id: 's3', label: 'Life As a Trader', timeLabel: '6h ago', bg: STORY_LIFE_AS_TRADER, ringColor: 'ring-[#CAEB0E]', avatar: '🏙️' },
  { id: 's4', label: 'Event Highlights', timeLabel: '12h ago', bg: STORY_EVENT_HIGHLIGHTS, ringColor: 'ring-amber-400', avatar: '🎉' },
];

interface CommunityStoriesRowProps {
  onOpenCreatePost: () => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityStoriesRow: React.FC<CommunityStoriesRowProps> = ({
  onOpenCreatePost,
  onShowToast,
}) => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-[#0b1c30]">Stories</h4>
        <button
          onClick={() => onShowToast?.('More stories coming soon')}
          className="flex items-center gap-0.5 text-xs font-semibold text-[#5338ec] hover:text-[#4326d8] transition-colors"
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-none">
        <button
          onClick={onOpenCreatePost}
          className="shrink-0 w-28 sm:w-32 rounded-2xl border-2 border-dashed border-[#c7d2fe] bg-[#F8F7FF] hover:bg-[#F0EEFE] flex flex-col items-center justify-center gap-2 py-6 transition-colors"
        >
          <span className="w-9 h-9 rounded-full bg-white border border-[#c7d2fe] flex items-center justify-center shadow-xs">
            <Plus className="w-4 h-4 text-[#5338ec]" />
          </span>
          <span className="text-xs font-semibold text-[#5338ec] text-center px-1">Add to Story</span>
        </button>

        {STORIES.map((s) => (
          <button
            key={s.id}
            onClick={() => onShowToast?.(`Opening "${s.label}"...`)}
            className="relative shrink-0 w-28 sm:w-32 rounded-2xl overflow-hidden group"
          >
            <img src={s.bg} alt={s.label} className="w-full h-full absolute inset-0 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 ring-2 ${s.ringColor} flex items-center justify-center text-sm`}>
              {s.avatar}
            </span>
            <div className="relative p-2.5 pt-[148px] sm:pt-[168px] text-left">
              <p className="text-xs font-bold text-white leading-tight">{s.label}</p>
              <p className="text-[10px] text-white/70">{s.timeLabel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
