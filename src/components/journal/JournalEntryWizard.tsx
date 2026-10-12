import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Broker, JournalEntry } from '../../types';
import { JOURNAL_STRATEGIES } from '../../data/journalData';
import { AutoSyncPanel, StatementUploadPanel } from './JournalIngestPanels';
import { useDialogFocus } from './useDialogFocus';

interface JournalEntryWizardProps {
  onClose: () => void;
  onImportMany: (entries: JournalEntry[]) => void;
  existingEntries?: JournalEntry[];
  brokers?: Broker[];
  onConnectBroker?: (broker: Broker) => void;
  strategies?: string[];
}

const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
    active ? 'bg-[#5338ec] border-[#5338ec] text-white' : 'bg-white border-slate-200 text-[#474556] hover:border-[#5338ec]'
  }`;

export const JournalEntryWizard: React.FC<JournalEntryWizardProps> = ({
  onClose,
  onImportMany,
  existingEntries = [],
  brokers = [],
  onConnectBroker,
  strategies,
}) => {
  const dialogRef = useDialogFocus(onClose);
  const [mode, setMode] = useState<'auto' | 'upload'>('auto');
  const strategy = strategies?.[0] ?? JOURNAL_STRATEGIES[0] ?? 'Unassigned';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Import or link trades" tabIndex={-1} className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl text-[#0b1c30] outline-none">
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9]">
          <h2 className="text-lg font-bold">Import or link trades</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Import options">
            <button type="button" role="tab" aria-selected={mode === 'auto'} onClick={() => setMode('auto')} className={chip(mode === 'auto')}>Link account</button>
            <button type="button" role="tab" aria-selected={mode === 'upload'} onClick={() => setMode('upload')} className={chip(mode === 'upload')}>Upload Statement</button>
          </div>
          <div role="tabpanel" aria-label={mode === 'auto' ? 'Link account' : 'Upload Statement'}>
            {mode === 'auto' ? (
              <AutoSyncPanel brokers={brokers} onConnect={onConnectBroker} />
            ) : (
              <StatementUploadPanel
                existing={existingEntries}
                strategy={strategy}
                onImport={onImportMany}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
