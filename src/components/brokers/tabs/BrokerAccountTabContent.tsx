import React, { useState } from 'react';
import { Broker, UserProfile } from '../../../types';
import { Check } from 'lucide-react';
import { BrokerComparisonCard } from '../BrokerComparisonCard';
import { TabSub } from '../../common/TabSub';

interface BrokerAccountTabContentProps {
  broker: Broker;
  user: UserProfile;
  tier?: 'tier-1' | 'tier-2' | 'offshore';
  isConnected?: boolean;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

const ACCOUNT_TYPES = ['Bonus', 'Standard', 'Premium', 'Pro', 'Zero (ECN)'] as const;
type AccountType = typeof ACCOUNT_TYPES[number];

export const BrokerAccountTabContent: React.FC<BrokerAccountTabContentProps> = ({
  broker,
  user,
  tier = 'tier-1',
  isConnected = false,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<AccountType>('Bonus');

  const renderCheckPill = () => (
    <div className="w-5 h-5 rounded-md bg-[#CAEB0E] text-black flex items-center justify-center mx-auto shadow-2xs">
      <Check className="w-3.5 h-3.5 stroke-[3]" />
    </div>
  );

  const getColClass = (type: AccountType) =>
    selectedAccount === type
      ? 'bg-[#FAF9FF] dark:bg-[#1f0956]/40 border-x border-[#5945F1]/25 dark:border-[#5945F1]/40'
      : '';

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
          <TabSub<AccountType>
            id="broker-account-tab-sub"
            tabs={ACCOUNT_TYPES}
            activeTab={selectedAccount}
            onChange={(tab) => setSelectedAccount(tab)}
          />
          <div className="text-xs text-slate-500 font-medium">
            Viewing conditions for: <span className="font-bold text-[#5945F1]">{selectedAccount} Account</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-[#2f1073] bg-white dark:bg-[#120233] shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#190446] text-[#5945F1]">
                <th className="py-3.5 px-6 font-bold w-52 text-slate-700 dark:text-slate-200">Account Type</th>
                <th className={`py-3.5 px-4 font-bold text-center transition-colors ${selectedAccount === 'Bonus' ? 'text-[#5945F1] dark:text-[#CAEB0E] font-black ' + getColClass('Bonus') : 'text-slate-700 dark:text-slate-300'}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Bonus</span>
                    {selectedAccount === 'Bonus' && <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1] dark:bg-[#CAEB0E]" />}
                  </div>
                </th>
                <th className={`py-3.5 px-4 font-bold text-center transition-colors ${selectedAccount === 'Standard' ? 'text-[#5945F1] dark:text-[#CAEB0E] font-black ' + getColClass('Standard') : 'text-slate-700 dark:text-slate-300'}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Standard</span>
                    {selectedAccount === 'Standard' && <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1] dark:bg-[#CAEB0E]" />}
                  </div>
                </th>
                <th className={`py-3.5 px-4 font-bold text-center transition-colors ${selectedAccount === 'Premium' ? 'text-[#5945F1] dark:text-[#CAEB0E] font-black ' + getColClass('Premium') : 'text-slate-700 dark:text-slate-300'}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Premium</span>
                    {selectedAccount === 'Premium' && <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1] dark:bg-[#CAEB0E]" />}
                  </div>
                </th>
                <th className={`py-3.5 px-4 font-bold text-center transition-colors ${selectedAccount === 'Pro' ? 'text-[#5945F1] dark:text-[#CAEB0E] font-black ' + getColClass('Pro') : 'text-slate-700 dark:text-slate-300'}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Pro</span>
                    {selectedAccount === 'Pro' && <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1] dark:bg-[#CAEB0E]" />}
                  </div>
                </th>
                <th className={`py-3.5 px-4 font-bold text-center transition-colors ${selectedAccount === 'Zero (ECN)' ? 'text-[#5945F1] dark:text-[#CAEB0E] font-black ' + getColClass('Zero (ECN)') : 'text-slate-700 dark:text-slate-300'}`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span>Zero (ECN)</span>
                    {selectedAccount === 'Zero (ECN)' && <span className="w-1.5 h-1.5 rounded-full bg-[#5945F1] dark:bg-[#CAEB0E]" />}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {/* Row 1: Cashback */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                  <div>Cashback</div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Rates shown are for &apos;Boss&apos; level members.
                  </div>
                </td>
                <td className={`py-3.5 px-4 text-center ${getColClass('Bonus')}`}>
                  <span className="text-[#5945F1] dark:text-[#CAEB0E] font-extrabold text-sm">$5.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className={`py-3.5 px-4 text-center ${getColClass('Standard')}`}>
                  <span className="text-[#5945F1] dark:text-[#CAEB0E] font-extrabold text-sm">$6.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className={`py-3.5 px-4 text-center ${getColClass('Premium')}`}>
                  <span className="text-[#5945F1] dark:text-[#CAEB0E] font-extrabold text-sm">$7.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
                <td className={`py-3.5 px-4 text-center ${getColClass('Pro')}`}>
                  <span className="text-[#5945F1] dark:text-[#CAEB0E] font-extrabold text-sm">$8.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                  <div className="mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#FD02B0] text-white font-extrabold text-[9px] tracking-tight">
                      Highest
                    </span>
                  </div>
                </td>
                <td className={`py-3.5 px-4 text-center ${getColClass('Zero (ECN)')}`}>
                  <span className="text-[#5945F1] dark:text-[#CAEB0E] font-extrabold text-sm">$2.00</span>
                  <span className="text-slate-500 text-xs font-normal">/Lot</span>
                </td>
              </tr>

              {/* Row 2: Spread type */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Spread type</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 ${getColClass('Bonus')}`}>Wide</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 ${getColClass('Standard')}`}>Standard</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 ${getColClass('Premium')}`}>Tight</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 ${getColClass('Pro')}`}>Tighter</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 ${getColClass('Zero (ECN)')}`}>Raw 0.0–0.2</td>
              </tr>

              {/* Row 3: Commission */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Commission</td>
                <td className={`py-3 px-4 text-center text-slate-400 font-bold ${getColClass('Bonus')}`}>✕</td>
                <td className={`py-3 px-4 text-center text-slate-400 font-bold ${getColClass('Standard')}`}>✕</td>
                <td className={`py-3 px-4 text-center text-slate-400 font-bold ${getColClass('Premium')}`}>✕</td>
                <td className={`py-3 px-4 text-center text-slate-400 font-bold ${getColClass('Pro')}`}>✕</td>
                <td className={`py-3 px-4 text-center ${getColClass('Zero (ECN)')}`}>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>$3/lot/side</span>
                  </span>
                </td>
              </tr>

              {/* Row 4: Min deposit */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Min deposit</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Bonus')}`}>$10</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Standard')}`}>$10</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Premium')}`}>$50</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Pro')}`}>$100</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Zero (ECN)')}`}>$200</td>
              </tr>

              {/* Row 5: Min trade volume */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Min trade volume</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Bonus')}`}>0.01 lot</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Standard')}`}>0.01 lot</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Premium')}`}>0.01 lot</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Pro')}`}>0.10 lot</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Zero (ECN)')}`}>0.10 lot</td>
              </tr>

              {/* Row 6: Max leverage */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Max leverage</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Bonus')}`}>1:1000</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Standard')}`}>1:1000</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Premium')}`}>1:500</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Pro')}`}>1:500</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Zero (ECN)')}`}>1:200</td>
              </tr>

              {/* Row 7: Trading platforms */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Trading platforms</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Bonus')}`}>MT4, MT5</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Standard')}`}>MT4, MT5</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Premium')}`}>MT4, MT5</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Pro')}`}>MT4, MT5</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Zero (ECN)')}`}>MT4, MT5</td>
              </tr>

              {/* Row 8: Hedging (Y/N) */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Hedging (Y/N)</td>
                <td className={`py-3 px-4 text-center ${getColClass('Bonus')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Standard')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Premium')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Pro')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Zero (ECN)')}`}>{renderCheckPill()}</td>
              </tr>

              {/* Row 9: Scalping (Y/N) */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Scalping (Y/N)</td>
                <td className={`py-3 px-4 text-center ${getColClass('Bonus')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Standard')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Premium')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Pro')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Zero (ECN)')}`}>{renderCheckPill()}</td>
              </tr>

              {/* Row 10: EA supported (Y/N) */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">EA supported (Y/N)</td>
                <td className={`py-3 px-4 text-center ${getColClass('Bonus')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Standard')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Premium')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Pro')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Zero (ECN)')}`}>{renderCheckPill()}</td>
              </tr>

              {/* Row 11: Negative Balance Protection (Y/N) */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Negative Balance Protection (Y/N)</td>
                <td className={`py-3 px-4 text-center ${getColClass('Bonus')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Standard')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Premium')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Pro')}`}>{renderCheckPill()}</td>
                <td className={`py-3 px-4 text-center ${getColClass('Zero (ECN)')}`}>{renderCheckPill()}</td>
              </tr>

              {/* Row 12: Swap-fee Environment (Y/N) */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Swap-fee Environment (Y/N)</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Bonus')}`}>Optional</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Standard')}`}>Optional</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Premium')}`}>Optional</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Pro')}`}>Optional</td>
                <td className={`py-3 px-4 text-center text-slate-400 font-bold ${getColClass('Zero (ECN)')}`}>✕</td>
              </tr>

              {/* Row 13: Account currency */}
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">Account currency</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Bonus')}`}>USD, EUR</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Standard')}`}>USD, EUR</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Premium')}`}>USD, EUR, GBP</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Pro')}`}>USD, EUR, GBP</td>
                <td className={`py-3 px-4 text-center text-slate-700 dark:text-slate-300 font-medium ${getColClass('Zero (ECN)')}`}>USD</td>
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
