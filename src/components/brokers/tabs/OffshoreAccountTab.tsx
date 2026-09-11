import React, { useState } from 'react';
import { Broker, UserProfile } from '../../../types';
import { BROKER_ACCOUNT_SPECS } from '../brokerConstants';
import {
  Check,
  Plus,
  Shield,
  Zap,
  Server,
  Activity,
  Layers,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';

interface OffshoreAccountTabProps {
  broker: Broker;
  user: UserProfile;
  onNavigateToConnect: () => void;
  onShowToast?: (msg: string) => void;
}

export const OffshoreAccountTab: React.FC<OffshoreAccountTabProps> = ({
  broker,
  user,
  onNavigateToConnect,
  onShowToast,
}) => {
  const [connectedAccounts, setConnectedAccounts] = useState([
    {
      id: '1100045789',
      platform: 'MT5 Pro',
      type: 'Zero (ECN)',
      leverage: '1:1000',
      server: `${broker.name}-Live03`,
      status: 'Active',
      rebateEarned: '$980.50',
      lots: 112.5,
    },
    {
      id: '1100098765',
      platform: 'MT4 Standard',
      type: 'Standard',
      leverage: '1:2000',
      server: `${broker.name}-Live01`,
      status: 'Active',
      rebateEarned: '$440.00',
      lots: 51.1,
    },
  ]);

  return (
    <div id="offshore-account-scenario" className="space-y-8 animate-in fade-in duration-200">
      {/* ─── 1. Sub-Accounts & Connected Accounts Manager (D10) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5945F1] uppercase tracking-wider">
                Multi-Account Manager • Offshore
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[#CAEB0E] text-[10px] font-black">
                2 Connected
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-[#0b1c30] mt-1">
              Your Connected {broker.name} Trading Accounts
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              onNavigateToConnect();
              onShowToast?.('Opening account connection flow...');
            }}
            className="px-4 py-2 rounded-xl bg-[#5945F1] hover:bg-[#4b39d6] text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#CAEB0E]" />
            <span>Add Another Sub-Account</span>
          </button>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {connectedAccounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-[#0b1c30]">
                    #{acc.id}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">({acc.platform})</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{acc.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] text-slate-400 block">Account Type</span>
                  <span className="font-bold text-slate-900">{acc.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Leverage</span>
                  <span className="font-bold text-slate-900">{acc.leverage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Rebate</span>
                  <span className="font-extrabold text-[#5945F1]">{acc.rebateEarned}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Server: <strong className="text-slate-700">{acc.server}</strong></span>
                <span>Volume: <strong className="text-slate-700">{acc.lots} lots</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 2. Accounts & Conditions Table (D10) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-xl text-[#0b1c30]">
            Offshore Accounts &amp; Deep Liquidity Specs
          </h3>
          <span className="text-xs text-slate-500">
            Raw ECN / Institutional Grade
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-indigo-200/80 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-indigo-100 text-[#5945F1] bg-slate-50/50">
                <th className="py-4 px-6 font-bold w-48 text-slate-700">Specification</th>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <th key={spec.name} className="py-4 px-6 font-bold text-center">
                    <div>{spec.name}</div>
                    {spec.name === 'Zero (ECN)' && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#CAEB0E] text-black text-[9px] font-black mt-1">
                        Trader Choice
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Spread Type</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td
                    key={spec.name}
                    className={`py-4 px-6 text-center ${spec.name === 'Zero (ECN)' ? 'font-bold text-[#5945F1]' : ''}`}
                  >
                    {spec.spreadType}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Commission</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center">
                    {spec.commission === 'None' ? (
                      <span className="text-slate-400">✕ None</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{spec.commission}</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Offshore Max Leverage</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center font-bold text-slate-900">
                    {spec.name === 'Bonus' || spec.name === 'Standard' ? '1:2000 (Unlimited)' : spec.maxLeverage}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Execution Venue</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center text-slate-600">
                    {spec.name === 'Zero (ECN)' ? 'ECN / Equinix LD4' : 'STP Liquidity'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">EA &amp; Scalping Policy</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center text-emerald-600 font-bold">
                    100% Permitted
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 px-6 font-semibold text-slate-900">Swap-Free (Islamic)</td>
                {BROKER_ACCOUNT_SPECS.map((spec) => (
                  <td key={spec.name} className="py-4 px-6 text-center text-slate-700">
                    Available on Request
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 3. VIP Desk & Latency Specs ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[#CAEB0E]">
            <Server className="w-4 h-4" />
            <h5 className="font-bold text-xs uppercase tracking-wider">Low Latency Infrastructure</h5>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cross-connected directly in Equinix London (LD4) and New York (NY4) data centers. Average order execution latency under 12ms with zero slippage guarantees on limit orders.
          </p>
        </div>

        <div className="bg-[#5945F1] text-white rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[#CAEB0E]">
            <PhoneCall className="w-4 h-4" />
            <h5 className="font-bold text-xs uppercase tracking-wider">Dedicated VIP Desk</h5>
          </div>
          <p className="text-xs text-white/90 leading-relaxed">
            As an active trader, you have direct line access to our institutional broker desk for rapid margin adjustments, custom IB tier requests, and FIX API access.
          </p>
        </div>
      </div>
    </div>
  );
};
