import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface InsufficientCreditModalProps {
  isOpen: boolean;
  userCredits: number;
  cost?: number;
  onClose: () => void;
  onShowMe: () => void;
}

/**
 * 3D Wallet & Popping M-Coins Illustration
 * Exact match to Dashboard_Trading Signals_Desktop_Beginner (2).png and (3).png
 * Features:
 * - Isometric/angled purple-to-blue gradient wallet
 * - Hot pink strap clasp with gold/yellow snap button
 * - Silver-lavender coins popping out with Marketsyde 'm' logo
 * - Vibrant magenta exclamation badge (!) in front
 */
export const WalletCoinsIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-36 mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(83,56,245,0.22)] overflow-visible"
      >
        <defs>
          {/* Wallet main body gradient */}
          <linearGradient id="walletBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7557FE" />
            <stop offset="40%" stopColor="#5338F5" />
            <stop offset="100%" stopColor="#3557F8" />
          </linearGradient>

          {/* Wallet upper flap gradient */}
          <linearGradient id="walletFlap" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8A6FFE" />
            <stop offset="100%" stopColor="#583CF6" />
          </linearGradient>

          {/* Wallet interior shadow */}
          <linearGradient id="walletPocket" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E0D7B" />
            <stop offset="100%" stopColor="#3D25CA" />
          </linearGradient>

          {/* Hot pink clasp */}
          <linearGradient id="pinkClasp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4DB8" />
            <stop offset="100%" stopColor="#E6007A" />
          </linearGradient>

          {/* Gold button */}
          <linearGradient id="goldButton" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Exclamation badge gradient */}
          <linearGradient id="exclamationBadge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF33A1" />
            <stop offset="100%" stopColor="#D90074" />
          </linearGradient>

          {/* Silver/lavender coin face */}
          <linearGradient id="coinSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#E2DEFE" />
            <stop offset="100%" stopColor="#C4B9FC" />
          </linearGradient>

          {/* Coin edge/rim */}
          <linearGradient id="coinRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B3A2FB" />
            <stop offset="100%" stopColor="#8B72F8" />
          </linearGradient>
        </defs>

        {/* Ambient Floor Shadow */}
        <ellipse cx="80" cy="138" rx="44" ry="10" fill="#5338F5" opacity="0.18" filter="blur(5px)" />
        <ellipse cx="80" cy="136" rx="30" ry="6" fill="#1C0D6E" opacity="0.28" filter="blur(2.5px)" />

        {/* ─── COINS POPPING OUT OF WALLET ─── */}
        {/* Coin 1: Left floating coin */}
        <g transform="translate(56, 46) rotate(-14)">
          <ellipse cx="0" cy="2" rx="14" ry="14" fill="url(#coinRim)" />
          <ellipse cx="0" cy="0" rx="14" ry="14" fill="url(#coinSilver)" />
          <ellipse cx="0" cy="0" rx="12" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          {/* 'm' logo on coin */}
          <path
            d="M -6 2.5 C -6 -1.5, -4.5 -3.5, -2 -3.5 C -0.2 -3.5, 0.8 -1.8, 1.6 0.2 C 2.4 -1.8, 3.8 -3.5, 5.5 -3.5 C 7.2 -3.5, 8.2 -1.5, 8.2 2"
            stroke="#5338F5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="8.5" cy="2.5" r="1.1" fill="#bef226" />
        </g>

        {/* Coin 2: Center highest floating coin */}
        <g transform="translate(86, 38) rotate(12)">
          <ellipse cx="0" cy="2" rx="15" ry="15" fill="url(#coinRim)" />
          <ellipse cx="0" cy="0" rx="15" ry="15" fill="url(#coinSilver)" />
          <ellipse cx="0" cy="0" rx="13" ry="13" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" />
          {/* 'm' logo on coin */}
          <path
            d="M -6.5 2.5 C -6.5 -1.8, -5 -4, -2.2 -4 C -0.2 -4, 0.9 -2, 1.8 0.3 C 2.6 -2, 4.2 -4, 6 -4 C 8 -4, 9 -1.8, 9 2.2"
            stroke="#5338F5"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="9.2" cy="2.8" r="1.2" fill="#bef226" />
        </g>

        {/* ─── WALLET BACK / INTERIOR POCKET ─── */}
        <rect x="42" y="55" width="76" height="66" rx="14" fill="url(#walletPocket)" />

        {/* Coin 3: Sitting partially inside the pocket */}
        <g transform="translate(74, 58) rotate(-4)">
          <ellipse cx="0" cy="2" rx="14" ry="14" fill="url(#coinRim)" />
          <ellipse cx="0" cy="0" rx="14" ry="14" fill="url(#coinSilver)" />
          <ellipse cx="0" cy="0" rx="12" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
          <path
            d="M -5.5 2 C -5.5 -1.5, -4 -3.2, -1.8 -3.2 C 0 -3.2, 0.8 -1.5, 1.6 0.2 C 2.4 -1.5, 3.6 -3.2, 5.2 -3.2 C 6.8 -3.2, 7.6 -1.5, 7.6 1.8"
            stroke="#5338F5"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* ─── WALLET FRONT BODY ─── */}
        <g>
          {/* Main front envelope/wallet */}
          <rect
            x="38"
            y="65"
            width="84"
            height="58"
            rx="12"
            fill="url(#walletBody)"
            filter="drop-shadow(0 4px 8px rgba(37,18,150,0.3))"
          />

          {/* Upper rim highlight */}
          <path
            d="M 40 68 Q 80 70 120 68"
            stroke="#9A89FF"
            strokeWidth="1.5"
            fill="none"
            opacity="0.75"
          />

          {/* Front flap fold curve */}
          <path
            d="M 38 75 C 50 84, 110 84, 122 75 L 122 68 L 38 68 Z"
            fill="url(#walletFlap)"
            opacity="0.9"
          />

          {/* Horizontal center crease */}
          <line x1="42" y1="88" x2="118" y2="88" stroke="#3D25CA" strokeWidth="1.5" opacity="0.6" />

          {/* Hot Pink Flap Clasp / Tab */}
          <rect
            x="70"
            y="81"
            width="20"
            height="14"
            rx="5"
            fill="url(#pinkClasp)"
            filter="drop-shadow(0 2px 4px rgba(230,0,122,0.35))"
          />

          {/* Yellow / Gold Snap Button */}
          <circle cx="80" cy="88" r="3.6" fill="url(#goldButton)" />
          <circle cx="79.2" cy="87.2" r="1.2" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* ─── EXCLAMATION MARK BADGE (!) ─── */}
        <g transform="translate(46, 102)">
          {/* Outer glow ring */}
          <circle cx="0" cy="0" r="14.5" fill="#FFFFFF" />
          {/* Magenta/Pink circular badge */}
          <circle
            cx="0"
            cy="0"
            r="12.5"
            fill="url(#exclamationBadge)"
            filter="drop-shadow(0 3px 6px rgba(217,0,116,0.4))"
          />
          {/* Exclamation mark stem */}
          <rect x="-1.8" y="-7.5" width="3.6" height="7.8" rx="1.8" fill="#FFFFFF" />
          {/* Exclamation mark dot */}
          <circle cx="0" cy="4.2" r="1.8" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
};

export const InsufficientCreditModal: React.FC<InsufficientCreditModalProps> = ({
  isOpen,
  userCredits,
  cost = 200,
  onClose,
  onShowMe,
}) => {
  if (!isOpen) return null;

  const isZeroCredits = userCredits <= 0;
  const missingCredits = Math.max(0, cost - userCredits);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
      />

      {/* Centered Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="relative w-full max-w-[420px] bg-white dark:bg-[#120738] rounded-[28px] p-7 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-[#2b186b] z-10 overflow-hidden text-center"
      >
        {/* Close X Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 3D Wallet & Coins Graphic */}
        <div className="pt-2 pb-1">
          <WalletCoinsIllustration />
        </div>

        {/* Heading based on scenario */}
        {isZeroCredits ? (
          /* Scenario 1: "Wallet feeling light?" */
          <h3 className="text-2xl sm:text-[26px] font-black tracking-tight mt-3 text-center">
            <span className="text-[#5338F5]">Wallet feeling </span>
            <span className="text-[#FD02B0]">light?</span>
          </h3>
        ) : (
          /* Scenario 2: "Missing syde credits" */
          <h3 className="text-2xl sm:text-[26px] font-black tracking-tight mt-3 text-center">
            <span className="text-[#5338F5]">Missing </span>
            <span className="text-[#FD02B0]">syde credits</span>
          </h3>
        )}

        {/* Subtitle / Description based on scenario */}
        {isZeroCredits ? (
          <p className="text-center text-slate-600 dark:text-slate-300 text-[14px] sm:text-[15px] leading-relaxed mt-2.5 max-w-[340px] mx-auto">
            You have <span className="text-[#FD02B0] font-semibold">0</span> syde credits. Do some missions before trying to spend nothing!
          </p>
        ) : (
          <p className="text-center text-slate-600 dark:text-slate-300 text-[14px] sm:text-[15px] leading-relaxed mt-2.5 max-w-[340px] mx-auto">
            You need <span className="text-[#FD02B0] font-semibold">{missingCredits}</span> more syde credits. Do some missions and we&apos;ll give you some!
          </p>
        )}

        {/* Action Buttons: [ Not Now ] [ Show Me ] */}
        <div className="flex items-center gap-3 mt-7 w-full">
          {/* Not Now Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a0f44] text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            Not Now
          </button>

          {/* Show Me Button */}
          <button
            type="button"
            onClick={onShowMe}
            className="flex-1 py-3 px-4 rounded-xl bg-[#5338F5] hover:bg-[#4326cf] text-white font-semibold text-sm shadow-md shadow-[#5338F5]/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Show Me
          </button>
        </div>
      </motion.div>
    </div>
  );
};
