import React from 'react';
import { X } from 'lucide-react';

interface NewsPromoBannerProps {
  visible: boolean;
  onDismiss: () => void;
  onUpgrade: () => void;
}

/**
 * Dismissible top bar, same role as Medium's "Welcome Offer... Upgrade now" strip.
 * Copy follows the Content Bible's "low risk" tone (marketing hook, lightly playful)
 * since this is a visitor-facing promo surface, not a money/status moment.
 */
export const NewsPromoBanner: React.FC<NewsPromoBannerProps> = ({ visible, onDismiss, onUpgrade }) => {
  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#5338ec] to-[#7c6ef0] text-white">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-14 h-11 flex items-center justify-center gap-3 relative">
        <span className="bg-white/15 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
          New here?
        </span>
        <span className="text-sm font-medium hidden sm:inline">
          Get every premium source free for 14 days.
        </span>
        <button onClick={onUpgrade} className="text-sm font-bold underline underline-offset-2 hover:opacity-80">
          Start free trial
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute right-4 sm:right-8 md:right-14 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
