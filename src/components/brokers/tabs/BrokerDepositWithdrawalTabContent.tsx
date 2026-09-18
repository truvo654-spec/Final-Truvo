import React from 'react';
import { Broker } from '../../../types';

export interface PaymentMethodItem {
  id: string;
  name: string;
  fee: string;
  minAmount: string;
  processingTime: string;
  type: 'bank' | 'mobile' | 'card' | 'skrill' | 'neteller' | 'crypto';
}

interface BrokerDepositWithdrawalTabContentProps {
  broker: Broker;
}

// Custom High-Fidelity SVG Icons matching the design screenshot exactly
const MethodIcon: React.FC<{ type: PaymentMethodItem['type'] }> = ({ type }) => {
  switch (type) {
    case 'bank':
      return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Bank Roof / Pediment */}
            <path d="M17 5L6 13.5H28L17 5Z" fill="#5240F2" />
            <rect x="7" y="13.5" width="20" height="2" rx="0.5" fill="#4335C4" />
            {/* Columns */}
            <rect x="9.5" y="15.5" width="2.8" height="8" rx="0.6" fill="#5240F2" />
            <rect x="15.6" y="15.5" width="2.8" height="8" rx="0.6" fill="#5240F2" />
            <rect x="21.7" y="15.5" width="2.8" height="8" rx="0.6" fill="#5240F2" />
            {/* Base Plinth */}
            <rect x="6" y="23.5" width="22" height="2.5" rx="0.5" fill="#4335C4" />
            {/* Green Dollar Badge */}
            <circle cx="24.5" cy="22.5" r="5" fill="#22C55E" stroke="#FFFFFF" strokeWidth="1.2" />
            <text x="24.5" y="24.8" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="system-ui, sans-serif">
              $
            </text>
          </svg>
        </div>
      );

    case 'mobile':
      return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Phone Body */}
            <rect x="10" y="6" width="14" height="22" rx="3" fill="#5240F2" />
            {/* Phone Screen */}
            <rect x="11.5" y="8.5" width="11" height="15.5" rx="1.5" fill="#EEF2FF" />
            {/* Home Indicator */}
            <rect x="15" y="25.5" width="4" height="1" rx="0.5" fill="#C7D2FE" />
            {/* Speaker bar */}
            <rect x="15.5" y="7" width="3" height="0.8" rx="0.4" fill="#C7D2FE" />
            {/* Green Dollar Badge on top right */}
            <circle cx="23.5" cy="8.5" r="5" fill="#22C55E" stroke="#FFFFFF" strokeWidth="1.2" />
            <text x="23.5" y="10.8" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="system-ui, sans-serif">
              $
            </text>
          </svg>
        </div>
      );

    case 'card':
      return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Back Card (Green) */}
            <rect
              x="5"
              y="11"
              width="21"
              height="14"
              rx="2.5"
              transform="rotate(-8 5 11)"
              fill="#22C55E"
            />
            <rect
              x="5.5"
              y="14.5"
              width="20"
              height="2.8"
              transform="rotate(-8 5.5 14.5)"
              fill="#15803D"
              opacity="0.5"
            />
            {/* Front Card (Indigo/Blue) */}
            <rect x="8" y="11" width="21" height="14" rx="2.5" fill="#5240F2" />
            {/* Chip */}
            <rect x="11" y="14" width="4.5" height="3.5" rx="0.8" fill="#FDE047" />
            {/* Card Lines */}
            <rect x="11" y="19.5" width="9" height="1.2" rx="0.6" fill="#C7D2FE" />
            <rect x="11" y="21.8" width="5.5" height="1.2" rx="0.6" fill="#C7D2FE" />
          </svg>
        </div>
      );

    case 'skrill':
      return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Rhombus (Violet) */}
            <g transform="translate(10, 17) rotate(45)">
              <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill="#6366F1" />
            </g>
            {/* Right Rhombus (Lime Green) */}
            <g transform="translate(22, 17) rotate(45)">
              <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill="#CAEB0E" />
            </g>
          </svg>
        </div>
      );

    case 'neteller':
      return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left Rhombus (Purple/Indigo) */}
            <g transform="translate(10, 17) rotate(45)">
              <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill="#5240F2" />
            </g>
            {/* Right Rhombus (Bright Green) */}
            <g transform="translate(22, 17) rotate(45)">
              <rect x="-4.5" y="-4.5" width="9" height="9" rx="1.5" fill="#22C55E" />
            </g>
          </svg>
        </div>
      );

    case 'crypto':
      return (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 3D Isometric Cube / Hexagon */}
            {/* Top face */}
            <path d="M17 7L24 11L17 15L10 11L17 7Z" fill="#7C3AED" />
            {/* Left face */}
            <path d="M10 11.5L17 15.5V23.5L10 19.5V11.5Z" fill="#5240F2" />
            {/* Right face */}
            <path d="M17 15.5L24 11.5V19.5L17 23.5V15.5Z" fill="#4335C4" />
            {/* Green Circle Badge with Dollar Sign on top left */}
            <circle cx="24.5" cy="9.5" r="4.5" fill="#22C55E" stroke="#FFFFFF" strokeWidth="1" />
            <text x="24.5" y="11.8" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="system-ui, sans-serif">
              $
            </text>
          </svg>
        </div>
      );

    default:
      return null;
  }
};

const DEFAULT_METHODS: PaymentMethodItem[] = [
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    fee: '$0',
    minAmount: '$5',
    processingTime: '2 to 7 Business Days',
    type: 'bank',
  },
  {
    id: 'mobile-banking',
    name: 'Mobile Banking',
    fee: '$0',
    minAmount: '$5',
    processingTime: 'Up to 10 minutes',
    type: 'mobile',
  },
  {
    id: 'credit-debit-cards',
    name: 'Credit/Debit Cards',
    fee: '$0',
    minAmount: '$5',
    processingTime: 'Up to 10 minutes',
    type: 'card',
  },
  {
    id: 'skrill',
    name: 'Skrill',
    fee: '$0',
    minAmount: '$5',
    processingTime: 'Up to 10 minutes',
    type: 'skrill',
  },
  {
    id: 'neteller',
    name: 'Neteller',
    fee: '$0',
    minAmount: '$5',
    processingTime: 'Up to 10 minutes',
    type: 'neteller',
  },
  {
    id: 'crypto',
    name: 'Crypto',
    fee: '$0',
    minAmount: '$5',
    processingTime: 'Up to 10 minutes',
    type: 'crypto',
  },
];

export const BrokerDepositWithdrawalTabContent: React.FC<BrokerDepositWithdrawalTabContentProps> = ({
  broker: _broker,
}) => {
  return (
    <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: DEPOSIT
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h3 className="font-display font-bold text-xl sm:text-[22px] text-[#0b1c30] tracking-tight">
            Deposit
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Here is an overview of deposit options, fees, and expected processing times.
          </p>
        </div>

        {/* Deposit Table Container with Soft Lavender Border */}
        <div className="rounded-2xl border border-[#C5B9FB]/80 dark:border-indigo-900/60 bg-white dark:bg-[#150444]/60 overflow-hidden shadow-[0_2px_8px_rgba(89,69,241,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#E8E5FB] dark:border-indigo-900/50">
                  <th className="py-4 px-6 sm:px-8 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[34%]">
                    Method
                  </th>
                  <th className="py-4 px-4 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[18%]">
                    Fee
                  </th>
                  <th className="py-4 px-4 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[20%]">
                    Min. Amount
                  </th>
                  <th className="py-4 px-6 sm:px-8 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[28%]">
                    Processing Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFFD] dark:divide-indigo-950/60">
                {DEFAULT_METHODS.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* Method Name & Icon */}
                    <td className="py-4 px-6 sm:px-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <MethodIcon type={item.type} />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="py-4 px-4 text-center text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-200">
                      {item.fee}
                    </td>

                    {/* Min. Amount */}
                    <td className="py-4 px-4 text-center text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-200">
                      {item.minAmount}
                    </td>

                    {/* Processing Time */}
                    <td className="py-4 px-6 sm:px-8 text-center text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-200">
                      {item.processingTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: WITHDRAW
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h3 className="font-display font-bold text-xl sm:text-[22px] text-[#0b1c30] tracking-tight">
            Withdraw
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Here are the available withdrawal methods, fees, and processing times.
          </p>
        </div>

        {/* Withdraw Table Container with Soft Lavender Border */}
        <div className="rounded-2xl border border-[#C5B9FB]/80 dark:border-indigo-900/60 bg-white dark:bg-[#150444]/60 overflow-hidden shadow-[0_2px_8px_rgba(89,69,241,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-[#E8E5FB] dark:border-indigo-900/50">
                  <th className="py-4 px-6 sm:px-8 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[34%]">
                    Method
                  </th>
                  <th className="py-4 px-4 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[18%]">
                    Fee
                  </th>
                  <th className="py-4 px-4 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[20%]">
                    Min. Amount
                  </th>
                  <th className="py-4 px-6 sm:px-8 text-center text-xs sm:text-sm font-semibold text-[#5240F2] dark:text-[#A594FD] w-[28%]">
                    Processing Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFFD] dark:divide-indigo-950/60">
                {DEFAULT_METHODS.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* Method Name & Icon */}
                    <td className="py-4 px-6 sm:px-8">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <MethodIcon type={item.type} />
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="py-4 px-4 text-center text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-200">
                      {item.fee}
                    </td>

                    {/* Min. Amount */}
                    <td className="py-4 px-4 text-center text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-200">
                      {item.minAmount}
                    </td>

                    {/* Processing Time */}
                    <td className="py-4 px-6 sm:px-8 text-center text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-200">
                      {item.processingTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
