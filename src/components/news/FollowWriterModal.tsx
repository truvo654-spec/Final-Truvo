import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FollowWriterModalProps {
  writer: string;
  avatar: string;
  /** True when already following: the modal manages the choice instead of starting a follow. */
  isFollowing: boolean;
  notify: boolean;
  onConfirm: (notify: boolean) => void;
  onUnfollow: () => void;
  onClose: () => void;
}

export const FollowWriterModal: React.FC<FollowWriterModalProps> = ({ writer, avatar, isFollowing, notify, onConfirm, onUnfollow, onClose }) => {
  const [checked, setChecked] = useState(notify);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Follow ${writer}`} className="bg-white rounded-2xl border border-[#e2e8f0] w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#0b1c30] leading-snug truncate">{isFollowing ? `Following ${writer}` : `Follow ${writer}`}</h3>
              <p className="text-xs text-[#474556]">Their stories show up in your Following tab.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 shrink-0" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>

        <label className="flex items-start gap-3 border border-[#e2e8f0] hover:border-[#5338ec] rounded-xl px-4 py-3.5 cursor-pointer transition-colors mb-5">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
          <span>
            <span className="block text-sm font-bold text-[#0b1c30]">Notify me about new news</span>
            <span className="block text-xs text-[#474556] leading-snug mt-0.5">When {writer} publishes, you get a notification in Notifications › Market News.</span>
          </span>
        </label>

        <div className="flex gap-3">
          {isFollowing ? (
            <>
              <button onClick={onUnfollow} className="flex-1 border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">Unfollow</button>
              <button onClick={() => onConfirm(checked)} className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Save</button>
            </>
          ) : (
            <>
              <button onClick={onClose} className="flex-1 border border-slate-200 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => onConfirm(checked)} className="flex-1 bg-[#5338ec] hover:bg-[#4326d8] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">Follow</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
