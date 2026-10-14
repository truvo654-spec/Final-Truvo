import React from 'react';
import MS_VOTES from '../../../assets/community/ms-votes.png';
import MS_ALERT from '../../../assets/community/ms-alert.png';
import MS_CHAT from '../../../assets/community/ms-chat.png';

export type DetailArt = 'votes' | 'alert' | 'chat';

const ART: Record<DetailArt, string> = { votes: MS_VOTES, alert: MS_ALERT, chat: MS_CHAT };

/**
 * What a panel on the instrument page shows when its data is missing.
 * The headline is the thing that failed, in the brand's gradient; the line
 * under it tells the reader the data is not lost, only late.
 */
export const DetailEmptyState: React.FC<{
  art: DetailArt;
  title: string;
  lines: string[];
  /** Fills the panel rather than sitting inline. */
  tall?: boolean;
  className?: string;
}> = ({ art, title, lines, tall = false, className = '' }) => (
  <div
    role="status"
    className={`flex flex-col items-center justify-center px-5 text-center ${tall ? 'min-h-[420px] py-10' : 'py-7'} ${className}`}
  >
    <img src={ART[art]} alt="" className={art === 'alert' ? 'h-auto w-[180px]' : 'h-auto w-[170px]'} />
    <p className="mt-4 bg-gradient-to-r from-[#5945F1] to-[#c026d3] bg-clip-text font-display text-[18px] font-bold text-transparent">
      {title}
    </p>
    {lines.map((l) => (
      <p key={l} className="mt-1 text-[13px] leading-relaxed text-slate-500">{l}</p>
    ))}
  </div>
);
