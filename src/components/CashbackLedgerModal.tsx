import React, { useState } from 'react';
import { CashbackTrade } from '../types';
import { X, Download, Filter, Search, CheckCircle2, Clock, Wallet, ArrowUpRight } from 'lucide-react';

interface CashbackLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: CashbackTrade[];
  totalEarned: number;
  pendingPayout: number;
}

export const CashbackLedgerModal: React.FC<CashbackLedgerModalProps> = ({
  isOpen,
  onClose,
  trades,
  totalEarned,
  pendingPayout,
}) => {
  const [filterBroker, setFilterBroker] = useState('All');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const filtered = trades.filter(
    (t) => filterBroker === 'All' || t.broker.includes(filterBroker)
  );

  const handleExportCSV = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5338ec] text-white flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#c6f831]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#0b1c30]">
                Cashback Ledger & Trade Audits
              </h3>
              <p className="text-xs text-[#474556]">
                Immutable lot-by-lot rebate records credited to your account
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

        {/* Overview banner */}
        <div className="p-5 bg-[#f8f9ff] border-b border-[#e2e8f0] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Total Lifetime Rebates:</span>
            <div className="text-xl font-bold font-display text-[#15803d] tabular-nums mt-0.5">
              ${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Pending Payout:</span>
            <div className="text-xl font-bold font-display text-[#5338ec] tabular-nums mt-0.5">
              ${pendingPayout.toFixed(2)}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-start sm:justify-end">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-white border border-[#e2e8f0] hover:border-[#5338ec] text-[#0b1c30] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#5338ec]" />
              <span>{downloaded ? 'Audit Log Exported!' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-5 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Date & Time</th>
                <th className="pb-3">Broker</th>
                <th className="pb-3">Symbol</th>
                <th className="pb-3 text-right">Lots</th>
                <th className="pb-3 text-right">Cashback Earned</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-2 text-slate-600 font-medium whitespace-nowrap">
                    {trade.date}
                  </td>
                  <td className="py-3 font-semibold text-[#0b1c30]">
                    {trade.broker}
                  </td>
                  <td className="py-3 font-bold text-[#0b1c30]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 mr-1.5 text-[10px]">
                      {trade.type}
                    </span>
                    {trade.symbol}
                  </td>
                  <td className="py-3 text-right font-medium text-slate-700 tabular-nums">
                    {trade.lots.toFixed(1)}
                  </td>
                  <td className="py-3 text-right font-bold text-[#15803d] tabular-nums">
                    +${trade.cashbackEarned.toFixed(2)}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        trade.status === 'Credited'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {trade.status === 'Credited' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{trade.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Showing {filtered.length} verified trade rebates
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#5338ec] hover:bg-[#4338ca] text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
