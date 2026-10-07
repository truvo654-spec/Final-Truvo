import React, { useEffect, useRef, useState } from 'react';
import { TextReveal, wordCount } from './TextReveal';

export const STAGGER = 26;

export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false));
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
};

/**
 * The dark MarketSyde card with a glow and gradient border that follow the pointer.
 * Used by the AI summaries on the journal Overview and on each journal entry.
 */
export const SpotlightCard: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className = '', children }) => {
  const ref = useRef<HTMLElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
    el.dataset.hover = 'true';
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    delete el.dataset.hover;
  };
  return (
    <section ref={ref} onPointerMove={move} onPointerLeave={leave} aria-label={label} className={`jr-spot relative isolate overflow-hidden rounded-3xl bg-[#090119] text-white border border-white/10 p-5 sm:p-8 ${className}`}>
      <div className="jr-spot-idle" aria-hidden />
      <div className="jr-spot-glow" aria-hidden />
      <div className="jr-spot-border" aria-hidden />
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export const SpotlightColumn: React.FC<{ accent: string; title: string; delay: number; reduced: boolean; children: React.ReactNode }> = ({ accent, title, delay, reduced, children }) => (
  <div className={`rounded-2xl bg-white/[0.05] border border-white/10 p-4 sm:p-5 ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2 h-2 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} aria-hidden />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export const SpotlightItem: React.FC<{ title: string; text: string; delay: number; reduced: boolean }> = ({ title, text, delay, reduced }) => (
  <div>
    <p className={`text-sm font-bold text-white ${reduced ? '' : 'jr-fade'}`} style={reduced ? undefined : { animationDelay: `${delay}ms` }}>{title}</p>
    <TextReveal text={text} palette="soft" delay={delay + 120} stagger={STAGGER * 0.7} instant={reduced} className="text-xs leading-relaxed mt-1" />
  </div>
);

/** When each item of a column starts, so the sections follow one another. */
export const itemDelay = (start: number, col: number, upTo: number, items: { text: string }[]) =>
  start + col * 260 + items.slice(0, upTo).reduce((s, it) => s + wordCount(it.text) * STAGGER * 0.7 + 120, 0);
