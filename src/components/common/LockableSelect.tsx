import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

/**
 * A picker whose options can be locked.
 *
 * A locked option is still shown, in brand violet with a lock, so the person
 * can see what a higher level would give them. Choosing one does not change
 * the view: it asks the panel to open its unlock flow instead.
 */
export interface LockableOption<T extends string = string> {
  id: T;
  label: string;
  locked?: boolean;
}

export function LockableSelect<T extends string = string>({
  label,
  value,
  options,
  width = 190,
  onChange,
  onLocked,
}: {
  label: string;
  value: T;
  options: LockableOption<T>[];
  width?: number;
  onChange: (id: T) => void;
  onLocked: (option: LockableOption<T>) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key); };
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5" ref={box} style={{ width }}>
      <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          data-keep-button-icons
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-left text-[14px] text-slate-900 transition ${
            open ? 'border-[#5945F1]' : 'border-[#CCC6FB] hover:border-[#5945F1]'
          }`}
        >
          <span className="truncate">{current?.label ?? ''}</span>
          <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute left-0 top-[calc(100%+6px)] z-30 w-full overflow-hidden rounded-xl border border-[#CCC6FB] bg-white py-1 shadow-xl"
          >
            {options.map((o) => {
              const active = o.id === value;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-keep-button-icons
                    onClick={() => {
                      if (o.locked) onLocked(o);
                      else onChange(o.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-[14px] transition ${
                      o.locked
                        ? 'text-[#5945F1] hover:bg-[#f7f6ff]'
                        : active
                          ? 'bg-[#f1f0fe] font-medium text-slate-900'
                          : 'text-slate-900 hover:bg-[#faf9ff]'
                    }`}
                  >
                    {o.locked && <Lock size={14} className="shrink-0" aria-hidden />}
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
