import React, { useEffect, useRef, useState } from 'react';
import { newsFollows } from '../../data/newsFollows';

interface FollowButtonProps {
  writer: string;
  following: boolean;
  notify: boolean;
  isLoggedIn: boolean;
  /** soft = violet tint (story page), solid = filled purple (writer page). */
  variant?: 'soft' | 'solid';
  size?: 'sm' | 'md';
  onSignIn?: () => void;
  onToast: (msg: string) => void;
}

/**
 * Follow toggles on one click, with no dialog. Following plays a short ripple and the label
 * changes to Following. Click again to unfollow. Notifications are one small switch under it.
 */
export const FollowButton: React.FC<FollowButtonProps> = ({ writer, following, notify, isLoggedIn, variant = 'soft', size = 'sm', onSignIn, onToast }) => {
  const [pulse, setPulse] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggle = () => {
    if (!isLoggedIn) {
      if (onSignIn) onSignIn();
      else onToast('Sign in to follow writers');
      return;
    }
    if (following) {
      newsFollows.unfollow(writer);
      onToast(`Unfollowed ${writer}`);
      return;
    }
    newsFollows.follow(writer, false);
    setPulse((n) => n + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPulse(0), 700);
    onToast(`Following ${writer}`);
  };

  const flipNotify = () => {
    newsFollows.setNotify(writer, !notify);
    onToast(notify ? `Notifications off for ${writer}` : `Notifications on for ${writer}. New stories go to Notifications › Market News.`);
  };

  const pad = size === 'md' ? 'text-sm px-5 py-2.5' : 'text-xs px-4 py-2';
  const look = following
    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    : variant === 'solid'
    ? 'bg-[#5338ec] text-white hover:bg-[#4326d8]'
    : 'bg-violet-50 text-[#5338ec] hover:bg-violet-100';

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="relative">
        {pulse > 0 && <span key={pulse} aria-hidden className="follow-ripple" />}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={following}
          className={`relative font-bold rounded-full transition-colors ${pad} ${look} ${pulse > 0 ? 'follow-pop' : ''}`}
        >
          <span key={following ? 'on' : 'off'} className="follow-label-in">
            {following ? '✓ Following' : 'Follow'}
          </span>
        </button>
      </div>
      {following && (
        <button
          type="button"
          onClick={flipNotify}
          aria-pressed={notify}
          className={`text-[11px] font-semibold transition-colors ${notify ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#94a3b8] hover:text-[#5338ec] underline underline-offset-2'}`}
        >
          {notify ? 'Notifications on' : 'Turn on notifications'}
        </button>
      )}
    </div>
  );
};
