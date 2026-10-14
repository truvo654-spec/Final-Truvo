import React from 'react';
import { ArrowRight, CircleAlert, X } from 'lucide-react';
import type { Broker } from '../types';

interface ConnectBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBroker: Broker | null;
}

/** The local build has no broker API; never report a simulated link as a real connection. */
export const ConnectBrokerModal: React.FC<ConnectBrokerModalProps> = ({ isOpen, onClose, selectedBroker }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="broker-connect-title" className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#0b1c30] shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 id="broker-connect-title" className="text-base font-bold">Live broker sync isn’t available</h2>
            <p className="mt-1 text-xs text-slate-500">{selectedBroker?.name ? `${selectedBroker.name} · ` : ''}Local app status</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4"/></button>
        </header>
        <div className="space-y-4 p-5">
          <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"/>
            <p>This build has no broker API connection. It cannot verify an account, fetch trades, or sync new activity. No credentials are needed here.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800">To load your Trade Log and Insights</p>
            <p className="mt-1">Open Trading Journal → Import / link → Upload Statement, then import a CSV statement. Imported records are saved in this browser and appear in Trade Log and Insights when their date, currency, account, and filters are in scope.</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#5338ec] px-4 text-sm font-semibold text-white hover:bg-[#4326d8]">Return to journal <ArrowRight className="h-4 w-4"/></button>
        </div>
      </section>
    </div>
  );
};
