import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface SignalUnlockedToastProps {
  isVisible: boolean;
  onDismiss: () => void;
  message?: string;
}

/**
 * Signal Unlocked Toast Notification
 * Exact match to Trading Signals; Desktop; Signal Unlocked.png
 * Positioned in the top-right header area with green background and check icon.
 */
export const SignalUnlockedToast: React.FC<SignalUnlockedToastProps> = ({
  isVisible,
  onDismiss,
  message = 'Trading Signal Unlocked!',
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-20 right-6 z-[160] flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#E8F8EE] border border-[#BBF7D0] shadow-sm pointer-events-auto select-none"
        >
          <div className="flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-[#16A34A] stroke-[2.5]" />
          </div>
          <span className="text-[#15803D] font-medium text-sm tracking-tight">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
