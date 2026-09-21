import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, PlusCircle } from 'lucide-react';
import { MarketSignal } from '../../types';

export interface SignalCreditUnlockModalProps {
  isOpen: boolean;
  signal: MarketSignal | null;
  userCredits: number;
  cost?: number;
  onClose: () => void;
  onUnlock: (signal: MarketSignal, cost: number) => void;
  onClaimBonusCredits?: (amount: number) => void;
  onInsufficientCredits?: (userCredits: number, cost: number) => void;
}

/**
 * High-craft 3D Puzzle & Marketsyde Key Illustration
 * Matches the exact design of the 3D purple isometric puzzle piece
 * with keyhole and entering Marketsyde 'm' brand key coin.
 */
const PuzzleKeyIllustration: React.FC = () => {
  return (
    <div className="relative w-36 h-36 mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(82,64,242,0.25)] overflow-visible"
      >
        <defs>
          {/* Gradients for 3D Isometric Puzzle Piece */}
          <linearGradient id="puzzleTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8775FE" />
            <stop offset="60%" stopColor="#6E56FC" />
            <stop offset="100%" stopColor="#5841F1" />
          </linearGradient>

          <linearGradient id="puzzleLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#553DEF" />
            <stop offset="100%" stopColor="#3C25D1" />
          </linearGradient>

          <linearGradient id="puzzleRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#432BCF" />
            <stop offset="100%" stopColor="#251296" />
          </linearGradient>

          {/* Gradients for Marketsyde Key Coin */}
          <linearGradient id="coinFace" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#9B8BFF" />
            <stop offset="30%" stopColor="#7561FE" />
            <stop offset="100%" stopColor="#4F36E8" />
          </linearGradient>

          <linearGradient id="coinRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D8D2FE" />
            <stop offset="50%" stopColor="#6C55FD" />
            <stop offset="100%" stopColor="#331DB8" />
          </linearGradient>

          <linearGradient id="keyShaft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C16A5" />
            <stop offset="50%" stopColor="#1E0D7B" />
            <stop offset="100%" stopColor="#11054E" />
          </linearGradient>

          <linearGradient id="keyholeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B022B" />
            <stop offset="100%" stopColor="#1A0A58" />
          </linearGradient>

          {/* Drop Shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3821C8" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Ambient Floor Shadow */}
        <ellipse cx="80" cy="140" rx="46" ry="11" fill="#4B34DF" opacity="0.22" filter="blur(6px)" />
        <ellipse cx="82" cy="138" rx="34" ry="7" fill="#180766" opacity="0.35" filter="blur(3px)" />

        {/* ─── 3D ISOMETRIC PUZZLE PIECE ─── */}
        <g transform="translate(10, 8)">
          {/* Base puzzle block with isometric extrusion and interlocking tabs */}

          {/* Right dark extrusion face */}
          <path
            d="M 94 92 L 94 116 C 94 116, 102 119, 108 114 C 114 109, 114 100, 106 97 L 94 92 Z"
            fill="url(#puzzleRight)"
          />
          <path
            d="M 68 107 L 68 126 L 94 116 L 94 97 Z"
            fill="url(#puzzleRight)"
          />

          {/* Front / Left 3D Extruded Wall */}
          <path
            d="M 40 92 L 40 112 L 68 126 L 68 107 Z"
            fill="url(#puzzleLeft)"
          />
          {/* Left tab bottom extrusion */}
          <path
            d="M 26 80 L 26 99 C 26 106, 33 108, 40 102 L 40 92 Z"
            fill="url(#puzzleLeft)"
          />

          {/* Top Main Puzzle Surface (Isometric Diamond with Interlocking Tabs) */}
          <path
            d="M 68 62 
               C 74 58, 80 50, 77 44 C 74 38, 64 39, 62 48 
               L 56 52 
               L 40 60
               C 33 56, 25 58, 23 66 C 21 73, 27 80, 36 78 
               L 40 92 
               L 68 107
               C 74 104, 79 97, 77 91 C 74 85, 65 86, 64 94
               L 68 107
               L 94 97
               C 102 99, 108 95, 108 87 C 108 80, 100 76, 94 81 
               L 94 76 
               Z"
            fill="url(#puzzleTop)"
          />

          {/* Beveled Top Highlight Ridge */}
          <path
            d="M 40 92 L 68 107 L 94 97"
            stroke="#A394FF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Center Keyhole in Puzzle Piece */}
          <g transform="translate(67, 82)">
            {/* Outer Keyhole rim / bevel */}
            <path
              d="M 0 -7 C 3.5 -7, 6 -4.5, 6 -1 C 6 1.8, 4.2 3.8, 2.5 4.8 L 3 11 L -3 11 L -2.5 4.8 C -4.2 3.8, -6 1.8, -6 -1 C -6 -4.5, -3.5 -7, 0 -7 Z"
              fill="none"
              stroke="#A89BFF"
              strokeWidth="1.2"
              opacity="0.7"
            />
            {/* Deep Dark Keyhole Interior */}
            <path
              d="M 0 -6 C 3 -6, 5 -4, 5 -1 C 5 1.5, 3.5 3.2, 2 4.2 L 2.5 10 L -2.5 10 L -2 4.2 C -3.5 3.2, -5 1.5, -5 -1 C -5 -4, -3 -6, 0 -6 Z"
              fill="url(#keyholeGlow)"
            />
          </g>
        </g>

        {/* ─── 3D MARKETSYDE KEY COIN (Inserting into Keyhole) ─── */}
        <g transform="translate(77, 60) rotate(-28)">
          {/* Key Shank Cylinder entering the slot */}
          <path
            d="M -3.5 14 L -3.5 36 C -3.5 37.5, 3.5 37.5, 3.5 36 L 3.5 14 Z"
            fill="url(#keyShaft)"
          />
          {/* Key bit notches */}
          <rect x="0" y="24" width="4" height="4" rx="0.8" fill="#1C0D6E" />
          <rect x="0" y="30" width="3" height="3" rx="0.6" fill="#15085C" />

          {/* Coin Rim / 3D Thickness (Lower layered ellipse) */}
          <ellipse cx="0" cy="4" rx="24" ry="24" fill="url(#coinRim)" />

          {/* Coin Top Face */}
          <ellipse cx="0" cy="0" rx="24" ry="24" fill="url(#coinFace)" />

          {/* Glossy Inner Bevel Ring */}
          <ellipse
            cx="0"
            cy="0"
            rx="21.5"
            ry="21.5"
            fill="none"
            stroke="#D6CEFE"
            strokeWidth="1.6"
            opacity="0.85"
          />

          {/* White Marketsyde Signature 'm' Waveform Logo */}
          <path
            d="M -11 5 C -11 -2.5, -8 -6, -4 -6 C -0.8 -6, 1.2 -3, 2.5 0.5 C 3.8 -3, 6 -6, 9 -6 C 12 -6, 13.5 -2.5, 13.5 3.5"
            stroke="white"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="drop-shadow(0 2px 3px rgba(37,18,150,0.4))"
          />

          {/* Neon Lime Dot Accent on 'm' Logo */}
          <circle cx="14.2" cy="4.5" r="2.2" fill="#bef226" />

          {/* Specular White Gloss Sheen */}
          <path
            d="M -16 -12 A 20 20 0 0 1 12 -16 A 21 21 0 0 0 -16 -12 Z"
            fill="white"
            opacity="0.45"
          />
        </g>

        {/* Floating Sparkle Stars */}
        <path
          d="M 36 28 L 37.5 33 L 42.5 34.5 L 37.5 36 L 36 41 L 34.5 36 L 29.5 34.5 L 34.5 33 Z"
          fill="#FD02B0"
          opacity="0.9"
        />
        <path
          d="M 126 44 L 127 47 L 130 48 L 127 49 L 126 52 L 125 49 L 122 48 L 125 47 Z"
          fill="#bef226"
          opacity="0.85"
        />
        <path
          d="M 120 102 L 121 104 L 123 105 L 121 106 L 120 108 L 119 106 L 117 105 L 119 104 Z"
          fill="#CAEB0E"
          opacity="0.75"
        />
      </svg>
    </div>
  );
};

export const SignalCreditUnlockModal: React.FC<SignalCreditUnlockModalProps> = ({
  isOpen,
  signal,
  userCredits,
  cost = 200,
  onClose,
  onUnlock,
  onClaimBonusCredits,
  onInsufficientCredits,
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);

  if (!isOpen || !signal) return null;

  const hasEnoughCredits = userCredits >= cost;

  // Determine Tier description: "Tier 4 Confidence" or "Tier 3 Confidence"
  const tierNumber = signal.minLevel || (signal.confidence >= 90 ? 4 : 3);
  const tierName = `Tier ${tierNumber}`;

  const handleUnlockClick = () => {
    if (!hasEnoughCredits) {
      if (onInsufficientCredits) {
        onClose();
        onInsufficientCredits(userCredits, cost);
      } else {
        setShowInsufficientCredits(true);
      }
      return;
    }

    setIsUnlocking(true);
    setTimeout(() => {
      onUnlock(signal, cost);
      setIsUnlocking(false);
      onClose();
    }, 450);
  };

  const handleClaimFreeDemo = () => {
    if (onClaimBonusCredits) {
      onClaimBonusCredits(300);
      setShowInsufficientCredits(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      {/* Blurred Backdrop - Exact match to Trading Signals; Desktop; Unlocking Modal.png */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
      />

      {/* Centered Modal Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="relative w-full max-w-[440px] bg-white dark:bg-[#120738] rounded-[28px] p-7 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-[#2b186b] z-10 overflow-hidden text-center"
      >
        {/* Close Button X (Top Right) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ─── 3D ILLUSTRATION: PUZZLE PIECE WITH KEY COIN ─── */}
        <div className="pt-2 pb-1">
          <PuzzleKeyIllustration />
        </div>

        {/* ─── HEADING: "Ready to unlock?" ─── */}
        <h3 className="text-2xl sm:text-[26px] font-black tracking-tight mt-3 text-center">
          <span className="text-[#5240F2] dark:text-[#7C6EF7]">Ready to </span>
          <span className="text-[#FD02B0]">unlock?</span>
        </h3>

        {/* ─── DESCRIPTION: "You have 1000 credits. Want to spend 200 to unlock Tier 4 Confidence for 24 hours?" ─── */}
        <p className="text-center text-slate-600 dark:text-slate-300 text-[14px] sm:text-[15px] leading-relaxed mt-2.5 max-w-[350px] mx-auto">
          You have{' '}
          <span className="text-[#FD02B0] font-bold">
            {userCredits} credits
          </span>
          . Want to spend{' '}
          <span className="text-[#FD02B0] font-bold">
            {cost}
          </span>{' '}
          to unlock{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {tierName} Confidence
          </span>{' '}
          for{' '}
          <span className="text-[#5240F2] dark:text-[#8A7AF6] font-semibold">
            24 hours
          </span>
          ?
        </p>

        {/* Low balance alert & free bonus trigger if user doesn't have 200 credits */}
        {showInsufficientCredits && !hasEnoughCredits && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3.5 p-3 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-left text-xs text-pink-700 dark:text-pink-300 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-pink-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Need {cost - userCredits} more credits!</p>
              <p className="text-[11px] text-pink-600/90 dark:text-pink-400 mt-0.5">
                Claim demo credits or complete daily missions to earn more.
              </p>
              <button
                type="button"
                onClick={handleClaimFreeDemo}
                className="mt-2 text-xs font-bold text-white bg-[#FD02B0] hover:bg-[#e0029c] px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Claim +300 Demo Credits</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── ACTION BUTTONS: [ Not Now ] [ Unlock ] ─── */}
        <div className="flex items-center gap-3 mt-7 w-full">
          {/* Not Now Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a0f44] text-[#5240F2] dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            Not Now
          </button>

          {/* Unlock Button */}
          <button
            type="button"
            onClick={handleUnlockClick}
            disabled={isUnlocking}
            className="flex-1 py-3 px-4 rounded-xl bg-[#5240F2] hover:bg-[#4332d9] text-white font-bold text-sm shadow-md shadow-[#5240F2]/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-75"
          >
            {isUnlocking ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Unlocking...</span>
              </span>
            ) : (
              <span>Unlock</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
