import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { Check } from 'lucide-react';
import { BrokerComparisonCard } from '../BrokerComparisonCard';

interface BrokerAccountTabContentProps {
  broker: Broker;
  user: UserProfile;
  tier?: 'tier-1' | 'tier-2' | 'offshore';
  isConnected?: boolean;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const BrokerAccountTabContent: React.FC<BrokerAccountTabContentProps> = ({
  broker,
  user,
  tier = 'tier-1',
  isConnected = false,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  const renderCheckPill = () => (
    <div className="w-5 h-5 rounded-md bg-[#CAEB0E] text-black flex items-center justify-center mx-auto shadow-2xs">
      <Check className="w-3.5 h-3.5 stroke-[3]" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Connected Account Banner */}
      {isConnected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#eff2fe] to-[#f4f5fa] border border-[#5945F1]/20 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-xs">
              HFM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#0b1c30]">
                  Your Connected Account: <span className="text-[#5945F1] font-extrabold">Pro Account (#1100045789)</span>
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                MT5 Platform • Max Leverage 1:500 • Commission Free • Tight Spreads • Highest Cashback ($8.00/Lot)
              </p>
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          1. ACCOUNTS & CONDITIONS TABLE (D04, D07, D10)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-[#0b1c30]">
            Accounts &amp; Conditions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore the account types available and find the right match for your trading approach.
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[#5945F1]">
                <th className="py-3.5 px-6 font-bold w-52 text-slate-700"></th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Bonus</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Standard</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Premium</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Pro</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Zero (ECN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Row 1: Cashback */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6 font-bold text-slate-900">
                  <div>Cashback</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Rates shown are for &apos;Boss&apos; level members.
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$5.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$6.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$7.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$8.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                  <div className="mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#FD02B0] text-white font-extrabold text-[9px] tracking-tight">
                      Highest
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="text-[#5945F1] font-extrabold text-sm">$2.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
              </tr>

              {/* Row 2: Spread type */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Spread type</td>
                <td className="py-3 px-4 text-center text-slate-700">Wide</td>
                <td className="py-3 px-4 text-center text-slate-700">Standard</td>
                <td className="py-3 px-4 text-center text-slate-700">Tight</td>
                <td className="py-3 px-4 text-center text-slate-700">Tighter</td>
                <td className="py-3 px-4 text-center text-slate-700">Raw 0.0–0.2</td>
              </tr>

              {/* Row 3: Commission */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Commission</td>
                <td className="py-3 px-4 text-center text-slate-400 font-bold">✕</td>
                <td className="py-3 px-4 text-center text-slate-400 font-bold">✕</td>
                <td className="py-3 px-4 text-center text-slate-400 font-bold">✕</td>
                <td className="py-3 px-4 text-center text-slate-400 font-bold">✕</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>$3/lot/side</span>
                  </span>
                </td>
              </tr>

              {/* Row 4: Min deposit */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Min deposit</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$10</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$10</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$50</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$100</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">$200</td>
              </tr>

              {/* Row 5: Min trade volume */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Min trade volume</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">0.01 lot</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">0.01 lot</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">0.01 lot</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">0.10 lot</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">0.10 lot</td>
              </tr>

              {/* Row 6: Max leverage */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Max leverage</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">1:1000</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">1:1000</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">1:500</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">1:500</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">1:200</td>
              </tr>

              {/* Row 7: Trading platforms */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Trading platforms</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">MT4, MT5</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">MT4, MT5</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">MT4, MT5</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">MT4, MT5</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">MT4, MT5</td>
              </tr>

              {/* Row 8: Hedging (Y/N) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Hedging (Y/N)</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
              </tr>

              {/* Row 9: Scalping (Y/N) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Scalping (Y/N)</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
              </tr>

              {/* Row 10: EA supported (Y/N) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">EA supported (Y/N)</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
              </tr>

              {/* Row 11: Negative Balance Protection (Y/N) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Negative Balance Protection (Y/N)</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
                <td className="py-3 px-4 text-center">{renderCheckPill()}</td>
              </tr>

              {/* Row 12: Swap-fee Environment (Y/N) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Swap-fee Environment (Y/N)</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">Optional</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">Optional</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">Optional</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">Optional</td>
                <td className="py-3 px-4 text-center text-slate-400 font-bold">✕</td>
              </tr>

              {/* Row 13: Account currency */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-6 font-semibold text-slate-800">Account currency</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">USD, EUR</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">USD, EUR</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">USD, EUR, GBP</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">USD, EUR, GBP</td>
                <td className="py-3 px-4 text-center text-slate-700 font-medium">USD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HOW HFM COMPARES CARD
         ───────────────────────────────────────────────────────────── */}
      <BrokerComparisonCard
        broker={broker}
        onSeeComparison={onSeeComparison}
        onExploreAllBrokers={onExploreAllBrokers}
      />
    </div>
  );
};
