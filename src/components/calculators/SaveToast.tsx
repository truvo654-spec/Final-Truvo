import React, { useEffect } from 'react';
import { Save, X } from 'lucide-react';

interface SaveToastProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const SaveToast: React.FC<SaveToastProps> = ({
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-6 z-50 flex items-start gap-3.5 max-w-[360px] p-4 bg-white/95 dark:bg-[#1a084c]/95 backdrop-blur-md rounded-2xl shadow-xl border border-indigo-100/90 dark:border-[#3410D5] animate-in slide-in-from-top-4 fade-in duration-200"
    >
      {/* Icon Badge (Matches 'Save Successful - Toast.png') */}
      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#230674] flex items-center justify-center shrink-0">
        <Save className="w-4 h-4 text-[#5945F1] dark:text-[#ABA1F8]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-bold text-[#5945F1] dark:text-[#ABA1F8] leading-tight">
          Scenario Saved
        </h4>
        <p className="text-xs text-slate-500 dark:text-[#CCC6FB] mt-0.5 leading-relaxed">
          Your scenario has been saved successfully and is ready to use.
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-0.5 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
