// Small shared building blocks for the Backtesting screens (match the journal's card style).
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const ACCENT = '#5338ec';

export const Card: React.FC<{ title?: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; className?: string; children?: React.ReactNode; label?: string }> = ({ title, sub, right, className = '', children, label }) => (
  <section className={`bg-white border border-[#e2e8f0] rounded-2xl p-5 min-w-0 ${className}`} aria-label={label ?? (typeof title === 'string' ? title : undefined)}>
    {(title || right) && (
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          {title && <h3 className="text-sm font-bold text-[#0b1c30]">{title}</h3>}
          {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

/** A label whose meaning shows on hover (dotted underline marks that it has a description). */
export const Hint: React.FC<{ text: string; children: React.ReactNode; className?: string }> = ({ text, children, className = '' }) => (
  <span title={text} className={`underline decoration-dotted decoration-slate-300 underline-offset-2 cursor-help ${className}`}>{children}</span>
);

export function Segmented<T extends string>({ options, value, onChange, label, size = 'md', disabled = {} }: {
  options: { id: T; label: React.ReactNode; title?: string }[]; value: T; onChange: (v: T) => void; label: string; size?: 'sm' | 'md'; disabled?: Partial<Record<T, string>>;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-0.5 gap-0.5">
      {options.map((o) => {
        const off = disabled[o.id];
        const on = value === o.id;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={on} disabled={!!off} title={off || o.title}
            onClick={() => onChange(o.id)}
            className={`${size === 'sm' ? 'h-7 px-2.5 text-[11px]' : 'h-8 px-3 text-xs'} rounded-md font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec] ${on ? 'bg-[#5338ec] text-white' : off ? 'text-slate-300 cursor-not-allowed' : 'text-[#474556] hover:bg-slate-50'}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const Pill: React.FC<{ tone?: 'good' | 'bad' | 'warn' | 'info' | 'neutral' | 'accent'; children: React.ReactNode; title?: string; className?: string }> = ({ tone = 'neutral', children, title, className = '' }) => {
  const c = { good: 'bg-emerald-50 text-emerald-700 border-emerald-200', bad: 'bg-rose-50 text-rose-700 border-rose-200', warn: 'bg-amber-50 text-amber-700 border-amber-200', info: 'bg-sky-50 text-sky-700 border-sky-200', neutral: 'bg-slate-100 text-slate-600 border-slate-200', accent: 'bg-[#EEF0FE] text-[#5338ec] border-[#5338ec]/20' }[tone];
  return <span title={title} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${c} ${className}`}>{children}</span>;
};

export const Kpi: React.FC<{ label: string; hint: string; value: React.ReactNode; sub?: React.ReactNode; valueClass?: string; sample?: number }> = ({ label, hint, value, sub, valueClass = '', sample }) => (
  <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 min-w-0">
    <p className="text-[11px] font-semibold text-[#474556] mb-1"><Hint text={hint}>{label}</Hint></p>
    <p className={`text-xl font-bold tabular-nums ${valueClass}`}>{value}</p>
    {sub && <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">{sub}</p>}
    {sample !== undefined && <p className="text-[10px] text-slate-400 mt-1 tabular-nums">{sample.toLocaleString('en-US')} trade{sample === 1 ? '' : 's'}</p>}
  </div>
);

export const Field: React.FC<{ label: string; hint?: string; htmlFor?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }> = ({ label, hint, htmlFor, children, className = '', aside }) => (
  <div className={`min-w-0 ${className}`}>
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{hint ? <Hint text={hint}>{label}</Hint> : label}</label>
      {aside}
    </div>
    {children}
  </div>
);

export const inputBase = 'h-9 border border-slate-200 rounded-lg px-3 text-sm bg-white text-[#0b1c30] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30';
export const inputCls = `${inputBase} w-full`;
export const btnPrimary = 'inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#5338ec] hover:bg-[#4326d8] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5338ec]';
export const btnSecondary = 'inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-[#0b1c30] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec]';
export const btnLink = 'text-xs font-semibold text-[#5338ec] hover:underline disabled:text-slate-300 disabled:no-underline';

export const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }> = ({ checked, onChange, label, id }) => (
  <button id={id} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5338ec] ${checked ? 'bg-[#5338ec]' : 'bg-slate-300'}`}>
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
  </button>
);

function useEscape(open: boolean, onClose: () => void, ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () => (ref.current ? Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')) : []);
    const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('button, input, select, textarea, [tabindex]')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = focusables() as HTMLElement[];
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); window.clearTimeout(t); prev?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export const Drawer: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; width?: string }> = ({ open, onClose, title, children, footer, width = 'max-w-md' }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(open, onClose, ref);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`absolute right-0 top-0 h-full w-full ${width} bg-white shadow-2xl flex flex-col`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200 shrink-0">
          <h3 className="text-sm font-bold text-[#0b1c30]">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-slate-200 p-4 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(open, onClose, ref);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
        {children}
      </div>
    </div>
  );
};

export const Banner: React.FC<{ tone: 'warn' | 'info' | 'bad' | 'good'; icon?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }> = ({ tone, icon, children, action }) => {
  const c = { warn: 'bg-amber-50 border-amber-200 text-amber-900', info: 'bg-sky-50 border-sky-200 text-sky-900', bad: 'bg-rose-50 border-rose-200 text-rose-900', good: 'bg-emerald-50 border-emerald-200 text-emerald-900' }[tone];
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={`flex flex-wrap items-start gap-2 rounded-xl border px-4 py-3 text-xs ${c}`}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-[12rem] leading-relaxed">{children}</div>
      {action}
    </div>
  );
};
