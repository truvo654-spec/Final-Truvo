import React from 'react';
import MS_LOCK from '../../assets/community/ms-lock.png';

/**
 * What sits over a panel the person cannot open yet.
 *
 * The content behind stays visible but blurred, so they can see the shape of
 * what they are missing, and the mascot holds the lock above a single way in.
 * Nothing about the flow changes: the button still calls whatever unlock the
 * panel used before.
 */
export interface LockStateContainerProps {
  /** The headline, usually what is behind the lock. */
  title: string;
  /** One line on why it is locked or what it gives. */
  description?: string;
  buttonText?: string;
  /** Tightens the padding where the panel is small. */
  compact?: boolean;
  onUnlock: () => void;
}

export const LockStateContainer: React.FC<LockStateContainerProps> = ({
  title,
  description,
  buttonText = 'Unlock with Credits',
  compact = false,
  onUnlock,
}) => (
  <div
    className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/55 text-center backdrop-blur-[3px] dark:bg-[#0b0320]/60 ${
      compact ? 'p-3' : 'p-6'
    }`}
    role="group"
    aria-label={title}
  >
    <img
      src={MS_LOCK}
      alt=""
      className={compact ? 'h-auto w-[140px]' : 'h-auto w-[230px]'}
    />
    <p className={`mt-2 font-display font-bold text-slate-900 dark:text-white ${compact ? 'text-[17px]' : 'text-[24px]'}`}>
      {title}
    </p>
    {description && (
      <p className={`mt-1.5 max-w-[320px] leading-relaxed text-slate-500 dark:text-white/60 ${compact ? 'text-[12.5px]' : 'text-[14px]'}`}>
        {description}
      </p>
    )}
    <button
      type="button"
      onClick={onUnlock}
      className={`mt-4 rounded-full bg-gradient-to-r from-[#5945F1] to-[#c026d3] font-bold text-white transition hover:brightness-110 active:scale-[0.99] ${
        compact ? 'px-5 py-2 text-[14px]' : 'px-8 py-3 text-[17px]'
      }`}
    >
      {buttonText}
    </button>
  </div>
);
