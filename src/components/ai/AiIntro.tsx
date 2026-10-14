import React, { useEffect, useRef } from 'react';
import { Gauge, ScanText } from 'lucide-react';

/**
 * The one-time invite, docked in the same corner the panel will appear in.
 * Says what it reads and what it will not do before anything opens.
 */
export const AiIntro: React.FC<{
  open: boolean;
  onStart: () => void;
  onLater: () => void;
  onLearnMore: () => void;
}> = ({ open, onStart, onLater, onLearnMore }) => {
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    startRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onLater(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onLater]);

  if (!open) return null;

  const features = [
    { Icon: ScanText, title: 'Reads the page', text: 'A short summary of whatever is in front of you.' },
    { Icon: Gauge, title: 'Knows your account', text: 'Your trades, level and cashback, not generic market talk.' },
  ];

  const rule = 'h-px bg-[#d7d3fb] dark:bg-[#2b2bd6]';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="ai-intro-title"
      data-keep-button-icons
      className="fixed bottom-4 right-4 z-40 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-[18px] border border-[#e4e0fa] bg-white p-4 shadow-[0_18px_50px_rgba(11,28,48,0.18)] dark:border-[#1d1046] dark:bg-black print:hidden"
    >
      <div className="rounded-xl bg-[#f0efff] px-5 py-5 text-center dark:bg-[#1a0a4a]">
        <h2 id="ai-intro-title" className="text-[21px] font-medium leading-[1.3] text-[#5945F1] dark:text-[#a99bff]">
          You&rsquo;re invited to try<br />
          advanced <span className="font-extrabold text-[#5945F1] dark:text-[#c9bfff]">MarketSyde AI</span>
        </h2>
      </div>

      <div className={`mt-4 ${rule}`} />

      <ul className="space-y-4 py-4">
        {features.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3.5">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#f0efff] text-[#5945F1] dark:bg-[#1a0a4a] dark:text-white">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-[16px] font-bold leading-snug text-[#0b1c30] dark:text-white">{title}</span>
              <span className="mt-1 block text-[14px] leading-[1.45] text-[#64748b] dark:text-white/70">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={rule} />

      <p className="mt-4 text-center text-[14px] leading-[1.45] text-[#64748b] dark:text-white/70">
        MarketSyde AI may make mistakes. Access and limits are subject to change.
      </p>
      <p className="mt-2 text-center text-[14px] leading-[1.45] text-[#64748b] dark:text-white/70">
        <button type="button" onClick={onLearnMore} className="font-medium text-[#0b1c30] underline underline-offset-[3px] dark:text-white">Learn more</button>{' '}
        about MarketSyde AI.
      </p>

      <button
        ref={startRef}
        type="button"
        onClick={onStart}
        className="mt-4 w-full rounded-full bg-[#5945F1] py-3.5 text-[16px] font-bold text-white transition hover:bg-[#4a38d6] active:scale-[0.99]"
      >
        Open MarketSyde AI
      </button>
      <button
        type="button"
        onClick={onLater}
        className="mt-3 w-full py-1.5 text-[14px] text-[#64748b] transition hover:text-[#0b1c30] dark:text-white/70 dark:hover:text-white"
      >
        Maybe later
      </button>
    </div>
  );
};
