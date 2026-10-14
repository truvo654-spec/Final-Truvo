import React, { useEffect, useRef } from 'react';
import { Gauge, ScanText } from 'lucide-react';
import { AiGhost } from './AiGhost';

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
    { Icon: ScanText, title: 'Reads this page', text: 'A short summary of what is in front of you.' },
    { Icon: Gauge, title: 'Knows your account', text: 'Your trades, level and cashback, not generic market talk.' },
  ];

  const rule = 'h-px bg-[#d7d3fb] dark:bg-[#2a1a8a]';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="ai-intro-title"
      className="fixed bottom-4 right-4 z-40 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e4e0fa] bg-white p-4 shadow-[0_18px_50px_rgba(11,28,48,0.18)] dark:border-[#2a1a66] dark:bg-black print:hidden"
    >
      <div className="rounded-xl bg-[#f0efff] px-4 py-3.5 text-center dark:bg-[#170345]">
        <AiGhost className="mx-auto mb-2 h-7 w-7 text-[#5945F1] dark:text-[#a99bff]" />
        <h2 id="ai-intro-title" className="text-[17px] font-bold leading-snug text-[#5945F1] dark:text-[#a99bff]">
          You&rsquo;re invited to try<br />
          <span className="text-[#5945F1] dark:text-white">MarketSyde AI</span>
        </h2>
      </div>

      <div className={`my-3.5 ${rule}`} />

      <ul className="space-y-3.5">
        {features.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0efff] text-[#5945F1] dark:bg-[#170345] dark:text-[#a99bff]">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-bold leading-snug text-[#0b1c30] dark:text-white">{title}</span>
              <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#64748b] dark:text-white/60">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={`my-3.5 ${rule}`} />

      <p className="text-center text-[12.5px] leading-relaxed text-[#64748b] dark:text-white/60">
        It reads, it does not chat. MarketSyde AI can make mistakes and is not financial advice.
      </p>
      <p className="mt-1 text-center text-[12.5px] leading-relaxed text-[#64748b] dark:text-white/60">
        <button type="button" onClick={onLearnMore} className="font-medium text-[#0b1c30] underline underline-offset-4 dark:text-white">Learn more</button>{' '}
        about MarketSyde AI.
      </p>

      <button
        ref={startRef}
        type="button"
        onClick={onStart}
        className="mt-3.5 w-full rounded-full bg-[#5945F1] py-2.5 text-[14px] font-bold text-white transition hover:bg-[#4a38d6]"
      >
        Show me
      </button>
      <button
        type="button"
        onClick={onLater}
        className="mt-2 w-full py-1 text-[13px] text-[#64748b] transition hover:text-[#0b1c30] dark:text-white/60 dark:hover:text-white"
      >
        Maybe later
      </button>
    </div>
  );
};
