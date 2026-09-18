import React from 'react';
import { X } from 'lucide-react';

interface ConnectionDeniedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onReconnect: () => void;
  onExploreBrokers: () => void;
  brokerName?: string;
  supportPhone?: string;
  supportEmail?: string;
}

export const ConnectionDeniedPopup: React.FC<ConnectionDeniedPopupProps> = ({
  isOpen,
  onClose,
  onReconnect,
  onExploreBrokers,
  brokerName = 'HFM',
  supportPhone = '+44-2033185978',
  supportEmail = 'support@hfm.com',
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="connection-denied-popup-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="connection-denied-popup"
        className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-indigo-100/90 relative animate-in zoom-in-95 duration-150 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          id="connection-denied-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Broker Logo Badge (HFM) */}
        <div className="w-16 h-16 rounded-2xl bg-black flex flex-col items-center justify-center text-white shadow-md mb-6 shrink-0 select-none">
          <div className="flex items-center text-lg font-black tracking-tight leading-none">
            <span className="text-white">HF</span>
            <span className="text-[#E11D48] font-black">M</span>
          </div>
          <span className="text-[7px] text-white/90 font-bold leading-none tracking-wider mt-1.5 uppercase">
            HF MARKETS
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-xl sm:text-[22px] text-[#0b1c30] tracking-tight mb-3">
          Your Connection Was Denied
        </h3>

        {/* Support Details */}
        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-[360px] mx-auto">
          Don't worry, you can contact broker support to resolve this
          <span className="block mt-1 text-slate-700 font-medium">
            <span className="mr-1">🌍</span>
            Global:{' '}
            <a
              href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`}
              className="hover:underline text-slate-700 font-semibold"
            >
              {supportPhone}
            </a>
            ,{' '}
            <a
              href={`mailto:${supportEmail}`}
              className="hover:underline text-slate-700 font-semibold"
            >
              {supportEmail}
            </a>
          </span>
        </p>

        {/* Secondary helper text */}
        <p className="text-xs sm:text-[13px] text-slate-500 mt-4 mb-6">
          Or click below options, it's up to you.
        </p>

        {/* Action Buttons: Reconnect + Explore New Brokers */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            id="connection-denied-reconnect-btn"
            onClick={onReconnect}
            className="w-full py-2.5 px-4 rounded-xl border border-[#5240F2]/40 hover:border-[#5240F2] bg-white hover:bg-indigo-50/50 text-[#5240F2] text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer text-center"
          >
            Reconnect
          </button>
          <button
            type="button"
            id="connection-denied-explore-btn"
            onClick={onExploreBrokers}
            className="w-full py-2.5 px-4 rounded-xl bg-[#5240F2] hover:bg-[#4335C4] text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer text-center shadow-xs"
          >
            Explore New Brokers
          </button>
        </div>
      </div>
    </div>
  );
};
