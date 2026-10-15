import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

/** Shared help: hover, keyboard focus or tap. Portals avoid clipped tabs/tables/drawers. */
export function InfoTooltip({ label, description, className = '' }: {
  label: string; description: React.ReactNode; className?: string;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const pinned = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const cancelClose = () => { if (timer.current) clearTimeout(timer.current); };
  const show = () => {
    cancelClose();
    window.dispatchEvent(new CustomEvent('marketsyde-info-open', { detail: id }));
    setOpen(true);
  };
  const dismiss = () => { cancelClose(); pinned.current = false; setOpen(false); setPosition(null); };
  const scheduleClose = () => {
    cancelClose();
    timer.current = setTimeout(() => {
      if (!pinned.current && document.activeElement !== trigger.current) dismiss();
    }, 160);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const anotherOpened = (event: Event) => { if ((event as CustomEvent<string>).detail !== id) dismiss(); };
    window.addEventListener('marketsyde-info-open', anotherOpened);
    return () => window.removeEventListener('marketsyde-info-open', anotherOpened);
  }, [id]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current || !bubble.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      const box = bubble.current.getBoundingClientRect();
      if (anchor.bottom < 0 || anchor.top > window.innerHeight) { dismiss(); return; }
      const left = Math.max(12, Math.min(anchor.left - 12, window.innerWidth - box.width - 12));
      const below = anchor.bottom + 8;
      const top = below + box.height <= window.innerHeight - 12 ? Math.max(12, below) : Math.max(12, anchor.top - box.height - 8);
      setPosition({ left, top });
    };
    place();
    const observer = new ResizeObserver(place);
    if (bubble.current) observer.observe(bubble.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node) && !bubble.current?.contains(event.target as Node)) dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismiss(); }
    };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', escape, true);
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', escape, true); };
  }, [open]);

  return <span className={`inline-flex shrink-0 align-middle normal-case tracking-normal ${className}`}>
    <button ref={trigger} type="button" aria-label={`About ${label}`} aria-describedby={open ? id : undefined}
      onMouseEnter={show} onMouseLeave={scheduleClose} onFocus={show}
      onBlur={() => { pinned.current = false; scheduleClose(); }}
      onClick={event => { event.preventDefault(); event.stopPropagation(); if (pinned.current) dismiss(); else { pinned.current = true; show(); } }}
      className="ml-1 inline-flex h-6 w-6 shrink-0 cursor-help items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[#F1EDFF] hover:text-[#5338ec] focus-visible:bg-[#F1EDFF] focus-visible:text-[#5338ec] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5338ec]"
    ><Info size={14} strokeWidth={1.75} aria-hidden="true" /></button>
    {open && createPortal(<span ref={bubble} id={id} role="tooltip" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}
      onClick={event => event.stopPropagation()}
      style={{ position: 'fixed', left: position?.left ?? 12, top: position?.top ?? 12, visibility: position ? 'visible' : 'hidden', width: 'min(352px, calc(100vw - 24px))', maxHeight: 'min(420px, calc(100dvh - 24px))', zIndex: 1000 }}
      className="block overflow-y-auto rounded-xl border border-slate-700 bg-[#0b1c30] p-4 text-left font-sans text-xs font-normal normal-case leading-relaxed tracking-normal text-slate-200 shadow-xl"
    ><span className="mb-2 block text-[13px] font-semibold leading-snug text-white">{label}</span>
      {typeof description === 'string' ? description.split('\n\n').map((paragraph, index) => <span key={index} className="mb-2 block last:mb-0">{paragraph}</span>) : description}
    </span>, document.body)}
  </span>;
}
