import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { BORDER } from './ui';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  /** The middle, non-destructive way out, e.g. "Move to Draft". */
  secondary?: { label: string; onClick: () => void };
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before something irreversible, and offers the softer option alongside it. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, body, secondary, confirmLabel, onConfirm, onCancel }) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onCancel]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-body" className={`w-full max-w-[480px] bg-white border ${BORDER} rounded-2xl shadow-2xl p-5`}>
        <div className="flex items-start justify-between gap-4">
          <h2 id="confirm-title" className="text-[17px] font-bold text-[#111827]">{title}</h2>
          <button type="button" aria-label="Close" onClick={onCancel} className="text-[#6b7280] hover:text-[#111827]"><X className="w-[18px] h-[18px]" /></button>
        </div>
        <p id="confirm-body" className="text-[14px] leading-relaxed text-[#6b7280] mt-2">{body}</p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button ref={cancelRef} type="button" onClick={onCancel} className={`h-9 px-4 rounded-lg border ${BORDER} text-[14px] font-medium text-[#5945F1] hover:bg-[#EEF0FE] transition-colors`}>Cancel</button>
          <span className="flex-1" />
          {secondary && (
            <button type="button" onClick={secondary.onClick} className="h-9 px-3 text-[14px] font-semibold text-[#111827] hover:text-[#5945F1] transition-colors">{secondary.label}</button>
          )}
          <button type="button" onClick={onConfirm} className="h-9 px-4 rounded-lg bg-[#fee2e2] hover:bg-[#fecaca] text-[#dc2626] text-[14px] font-semibold transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};
