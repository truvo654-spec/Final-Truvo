import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export interface ToastItem {
  id: number;
  title: string;
  sub?: string;
}

/** Shows a toast for a community action. Pass a title and, where it helps, one line of detail. */
export type ShowToast = (title: string, sub?: string) => void;

const LIFETIME = 3200;
const MAX = 3;

export function useToasts(): { toasts: ToastItem[]; showToast: ShowToast } {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const showToast = useCallback<ShowToast>((title, sub) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, title, sub }].slice(-MAX));
    timers.current.push(window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), LIFETIME));
  }, []);

  return { toasts, showToast };
}

export const ToastStack: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2.5 pointer-events-none" aria-live="polite" role="status">
    {toasts.map((t) => (
      <div key={t.id} className="w-[290px] rounded-[10px] bg-[#f7f5ff] shadow-[0_6px_24px_rgba(89,69,241,0.16)] flex items-start gap-[12px] pl-3 pr-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <Check className="w-4 h-4 text-[#5945F1] shrink-0 mt-[2px]" strokeWidth={2.2} aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[15px] leading-[17px] font-semibold text-[#5945F1]">{t.title}</p>
          {t.sub && <p className="text-[13px] leading-[16px] text-[#7b7b7c] mt-[3px]">{t.sub}</p>}
        </div>
      </div>
    ))}
  </div>
);
