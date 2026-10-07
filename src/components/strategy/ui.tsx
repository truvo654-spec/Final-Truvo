import React, { useEffect, useState } from 'react';

export const inputCls =
  'w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30 focus:border-[#5338ec] disabled:opacity-50';

export const Field: React.FC<{ label: string; hint?: string; className?: string; children: React.ReactNode }> = ({ label, hint, className = '', children }) => (
  <label className={`block ${className}`}>
    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#6b7686] mb-1">
      {label}
      {hint && (
        <span title={hint} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-200 text-[9px] font-black text-slate-600 cursor-help normal-case">?</span>
      )}
    </span>
    {children}
  </label>
);

/** Number box that lets you type freely and tidies the value when you leave it. */
export const NumInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  suffix?: string;
  ariaLabel?: string;
  disabled?: boolean;
}> = ({ value, onChange, min = -1e9, max = 1e9, step = 1, integer, suffix, ariaLabel, disabled }) => {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = (raw: string) => {
    let v = parseFloat(raw);
    if (!isFinite(v)) {
      setText(String(value));
      return;
    }
    v = Math.min(max, Math.max(min, integer ? Math.round(v) : v));
    setText(String(v));
    if (v !== value) onChange(v);
  };
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        value={text}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => {
          setText(e.target.value);
          const v = parseFloat(e.target.value);
          if (isFinite(v) && v >= min && v <= max) onChange(integer ? Math.round(v) : v);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
        className={`${inputCls} ${suffix ? 'pr-9' : ''}`}
      />
      {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#6b7686] pointer-events-none">{suffix}</span>}
    </div>
  );
};

export interface Opt<T> {
  value: T;
  label: string;
  group?: string;
}

export function SelectBox<T extends string | number>({ value, onChange, options, ariaLabel, disabled }: { value: T; onChange: (v: T) => void; options: Opt<T>[]; ariaLabel?: string; disabled?: boolean }) {
  const groups = Array.from(new Set(options.map((o) => o.group ?? '')));
  const parse = (raw: string): T => (typeof value === 'number' ? (Number(raw) as T) : (raw as T));
  return (
    <select value={String(value)} aria-label={ariaLabel} disabled={disabled} onChange={(e) => onChange(parse(e.target.value))} className={`${inputCls} pr-7`}>
      {groups.map((g) =>
        g ? (
          <optgroup key={g} label={g}>
            {options.filter((o) => o.group === g).map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
          </optgroup>
        ) : (
          options.filter((o) => !o.group).map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)
        )
      )}
    </select>
  );
}

export const Section: React.FC<{ title: string; summary?: string; defaultOpen?: boolean; children: React.ReactNode; badge?: string }> = ({ title, summary, defaultOpen = true, children, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-white border border-[#e2e8f0] rounded-2xl overflow-clip">
      <div role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpen((v) => !v)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpen((v) => !v))} className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-[#fafbfe] transition-colors">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
            {title}
            {badge && <span className="text-[10px] font-bold bg-[#EEF0FE] text-[#5338ec] px-2 py-0.5 rounded-full">{badge}</span>}
          </h3>
          {!open && summary && <p className="text-xs text-[#6b7686] truncate mt-0.5">{summary}</p>}
        </div>
        <span className="text-lg font-light text-[#5338ec] leading-none w-4 text-center shrink-0">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </section>
  );
};

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#0b1c30]">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-slate-300 text-[#5338ec] focus:ring-[#5338ec]" />
    {label}
  </label>
);

export const Pill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} aria-pressed={active} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${active ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'}`}>
    {children}
  </button>
);
