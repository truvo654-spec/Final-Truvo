import React, { useEffect, useRef } from 'react';
import { Gauge, MessageSquareOff, ScanText } from 'lucide-react';

/**
 * The one-time invite for the AI panel. Shown before the dock the first time,
 * so the person knows what it reads and what it will not do before it appears.
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
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = overflow; };
  }, [open, onLater]);

  if (!open) return null;

  const features = [
    { Icon: ScanText, title: 'Reads the page you are on', text: 'A short summary of whatever is in front of you, with the figures it used.' },
    { Icon: Gauge, title: 'Knows your account', text: 'Your trades, journal, level and cashback — not generic market talk.' },
    { Icon: MessageSquareOff, title: 'Not a chat', text: 'Nothing to type. It reads, then points you at the page that answers next.' },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm print:hidden">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-intro-title"
        className="w-full max-w-[420px] overflow-y-auto rounded-3xl bg-[#121214] p-7 text-white shadow-2xl max-h-[92vh]"
      >
        <h2 id="ai-intro-title" className="text-center font-display text-[30px] font-bold leading-[1.15]">
          You&rsquo;re invited to try<br />MarketSyde AI
        </h2>

        <div className="my-6 h-px bg-white/12" />

        <ul className="space-y-5">
          {features.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5945F1]">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-bold leading-snug">{title}</span>
                <span className="mt-1 block text-[14px] leading-relaxed text-white/55">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="my-6 h-px bg-white/12" />

        <p className="text-center text-[14px] leading-relaxed text-white/55">
          MarketSyde AI can make mistakes, and nothing it says is financial advice.
        </p>
        <p className="mt-2 text-center text-[14px] leading-relaxed text-white/55">
          <button type="button" onClick={onLearnMore} className="font-medium text-white underline underline-offset-4">Learn more</button>{' '}
          about what it reads.
        </p>

        <button
          ref={startRef}
          type="button"
          onClick={onStart}
          className="mt-6 w-full rounded-full bg-[#5945F1] py-4 text-[17px] font-bold text-white transition hover:bg-[#4a38d6]"
        >
          Show me
        </button>
        <button
          type="button"
          onClick={onLater}
          className="mt-3 w-full py-2 text-[16px] font-bold text-white/85 transition hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
