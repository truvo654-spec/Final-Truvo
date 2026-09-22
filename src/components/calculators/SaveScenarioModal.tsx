import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  isEditing?: boolean;
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  isEditing = false,
}) => {
  const [scenarioName, setScenarioName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setScenarioName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!scenarioName.trim()) return;
    onSave(scenarioName.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog (Matches 'Save Scenario Modal - Enter Name.png' exactly) */}
      <div className="relative w-full max-w-[420px] bg-white dark:bg-[#170345] rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-[#230674] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-base font-bold tracking-tight">
            <span className="text-[#5945F1] dark:text-[#ABA1F8]">
              {isEditing ? 'Edit Scenar' : 'Save Scenar'}
            </span>
            <span className="text-[#FD02B0]">io</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-800 dark:text-white block">
              Scenario Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                maxLength={20}
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Enter Name"
                autoFocus
                className="w-full h-11 px-3.5 pr-14 rounded-xl border border-slate-200 dark:border-[#3410D5] bg-white dark:bg-[#230674] text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:border-[#5945F1] transition-colors"
              />
              <span className="absolute right-3.5 text-xs text-slate-400 dark:text-[#8A7AF6] font-medium pointer-events-none select-none">
                {scenarioName.length}/20
              </span>
            </div>
          </div>

          {/* Action Buttons: 2 Equal Columns (Cancel & Save) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-indigo-200/90 dark:border-[#3410D5] bg-white dark:bg-[#230674] hover:bg-slate-50 dark:hover:bg-[#2E0AA3] text-[#5945F1] dark:text-[#ABA1F8] font-semibold text-sm transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!scenarioName.trim()}
              className="h-10 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
