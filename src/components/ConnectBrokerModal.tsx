import React, { useState } from 'react';
import { Broker } from '../types';
import { X, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface ConnectBrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokers: Broker[];
  selectedBroker: Broker | null;
  onSuccess: (brokerId: string, accountId: string) => void;
}

export const ConnectBrokerModal: React.FC<ConnectBrokerModalProps> = ({
  isOpen,
  onClose,
  brokers,
  selectedBroker,
  onSuccess,
}) => {
  const [brokerId, setBrokerId] = useState<string>(selectedBroker?.id || brokers[0]?.id || '');
  const [platform, setPlatform] = useState<string>('MetaTrader 5 (MT5)');
  const [accountId, setAccountId] = useState<string>('');
  const [serverName, setServerName] = useState<string>('Live-Real-01');
  const [readOnlyPassword, setReadOnlyPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentBroker = brokers.find((b) => b.id === brokerId) || brokers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId.trim()) {
      setError('Please enter your broker trading account number');
      return;
    }

    setIsSubmitting(true);

    // Simulate verification with broker API
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(true);

      setTimeout(() => {
        onSuccess(brokerId, accountId);
        setSuccessMessage(false);
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5338ec] text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#c6f831]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0b1c30]">
                Link Trading Account
              </h3>
              <p className="text-xs text-[#474556]">
                Activate instant automated cashback without changing your spreads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successMessage ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#15803d] mx-auto flex items-center justify-center text-2xl shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-[#15803d]" />
            </div>
            <div>
              <h4 className="font-display text-xl font-bold text-[#0b1c30]">
                Account Connected Successfully!
              </h4>
              <p className="text-xs text-[#474556] mt-1">
                Your trades on {currentBroker.name} are now tracking automatically.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef2ff] text-[#5338ec] text-xs font-bold">
              <span>💎 +50 Points Awarded</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Broker Selection */}
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Select Broker Partner
              </label>
              <select
                value={brokerId}
                onChange={(e) => setBrokerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-medium text-[#0b1c30] focus:outline-none focus:border-[#5338ec] focus:ring-1 focus:ring-[#5338ec]"
              >
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.maxCashback})
                  </option>
                ))}
              </select>
            </div>

            {/* Platform & Server */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-medium text-[#0b1c30] focus:outline-none focus:border-[#5338ec]"
                >
                  <option>MetaTrader 5 (MT5)</option>
                  <option>MetaTrader 4 (MT4)</option>
                  <option>cTrader</option>
                  <option>TradingView / Proprietary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Server Name
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="e.g. Exness-Real12"
                  className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0b1c30] focus:outline-none focus:border-[#5338ec]"
                />
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Trading Account Number (Login ID)
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="e.g. 7481920"
                className="w-full px-3 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs text-[#0b1c30] focus:outline-none focus:border-[#5338ec]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found on your MT4/MT5 navigation window or broker account portal
              </span>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#d6d0ff]/60 flex items-start gap-2.5 text-xs text-[#474556]">
              <Lock className="w-4 h-4 text-[#5338ec] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Trading Risk:</strong> We only track lot volume through official broker partner APIs. We never request trading passwords or execution rights.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying with Broker...</span>
                ) : (
                  <>
                    <span>Verify & Link Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
