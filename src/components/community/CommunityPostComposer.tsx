import React from 'react';
import { Image as ImageIcon, Clapperboard, BarChart3, Send } from 'lucide-react';

interface CommunityPostComposerProps {
  username: string;
  avatar?: string;
  onOpenCreatePost: () => void;
}

export const CommunityPostComposer: React.FC<CommunityPostComposerProps> = ({
  username,
  avatar,
  onOpenCreatePost,
}) => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
      <div className="flex items-center gap-3 mb-3.5">
        {avatar ? (
          <img src={avatar} alt={username} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#5338ec] text-white flex items-center justify-center text-sm font-bold shrink-0">
            {username.slice(0, 1).toUpperCase()}
          </div>
        )}
        <button
          onClick={onOpenCreatePost}
          className="flex-1 text-left text-sm text-[#94a3b8] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-slate-100 rounded-xl px-4 py-2.5 transition-colors"
        >
          What your thoughts?
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#474556] hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-emerald-500" /> Button
        </button>
        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#474556] hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-colors"
        >
          <Clapperboard className="w-4 h-4 text-rose-500" /> Video
        </button>
        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#474556] hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-colors"
        >
          <BarChart3 className="w-4 h-4 text-[#5338ec]" /> Poll
        </button>
        <button
          onClick={onOpenCreatePost}
          className="ml-auto flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Post
        </button>
      </div>
    </div>
  );
};
