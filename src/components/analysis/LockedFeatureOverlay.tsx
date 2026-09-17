import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'motion/react';

export interface LockedFeatureOverlayProps {
  title: string;
  description: string;
  buttonText?: string;
  compact?: boolean;
  onUnlock: () => void;
}

export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  title,
  description,
  buttonText = 'Unlock',
  compact = false,
  onUnlock,
}) => {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center text-center bg-slate-900/10 dark:bg-black/25 backdrop-blur-[2.5px] ${
        compact ? 'p-2 sm:p-3' : 'p-4 sm:p-6'
      }`}
    >
      {/* Frosted Glassmorphism Card with Auto-Floating Animation */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`w-full ${
          compact ? 'max-w-[270px] p-4 sm:p-5' : 'max-w-md p-6 sm:p-7'
        } rounded-2xl bg-white/80 dark:bg-[#120B2E]/85 backdrop-blur-xl border border-white/90 dark:border-white/15 shadow-[0_8px_32px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-slate-900/5 dark:ring-white/10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Purple Outline Lock Icon with frosted glass circle */}
        <div
          className={`relative ${
            compact ? 'w-10 h-10 mb-2.5' : 'w-11 h-11 mb-3.5'
          } rounded-2xl bg-[#5945F1]/10 dark:bg-[#5945F1]/25 border border-[#5945F1]/30 backdrop-blur-sm flex items-center justify-center shadow-2xs`}
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lock
              className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#5945F1] dark:text-[#ABA1F8]`}
              strokeWidth={2.2}
            />
          </motion.div>
        </div>

        <h3
          className={`font-bold ${
            compact ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
          } text-[#0b1c30] dark:text-white mb-1.5 leading-snug`}
        >
          {title}
        </h3>

        <p
          className={`text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3.5 ${
            compact ? 'max-w-[230px]' : 'max-w-sm'
          }`}
        >
          {description}
        </p>

        <button
          type="button"
          onClick={onUnlock}
          className="relative group overflow-hidden px-5 py-2 rounded-full bg-[#5945F1] hover:bg-[#4a36e2] text-white font-semibold text-xs shadow-md hover:shadow-lg hover:shadow-[#5945F1]/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <span className="relative z-10">{buttonText}</span>
          <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none" />
        </button>
      </motion.div>
    </div>
  );
};

