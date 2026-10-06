import React, { useEffect, useRef, useState, type FC, type ReactNode, type RefObject } from 'react';
import { Check, Copy, Instagram, Linkedin, Share2, Twitter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

/** Join class names. Small stand-in for clsx + tailwind-merge so no new dependency is needed. */
function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(' ');
}

function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, handler]);
}

const OnClickOutside: FC<{ children: ReactNode; onClickOutside: () => void; classes?: string }> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickOutside(wrapperRef, onClickOutside);
  return <div ref={wrapperRef} className={cn(classes)}>{children}</div>;
};

const shareButtons = [
  { icon: Twitter, label: 'Twitter', color: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10' },
  { icon: Instagram, label: 'Instagram', color: 'hover:text-[#E1306C] hover:bg-[#E1306C]/10' },
  { icon: Linkedin, label: 'LinkedIn', color: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10' },
] as const;

interface SocialButtonProps {
  className?: string;
  /** Start opened. In the modal it opens by itself right after it appears. */
  autoExpand?: boolean;
  onShare: (network: 'Twitter' | 'Instagram' | 'LinkedIn') => void;
  onCopy: () => Promise<boolean>;
}

/** The expanding Share pill: a Share button that opens into Twitter, Instagram, LinkedIn and Copy link. */
export const SocialButton: FC<SocialButtonProps> = ({ className, autoExpand = false, onShare, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!autoExpand) return;
    const t = window.setTimeout(() => setIsExpanded(true), 250);
    return () => window.clearTimeout(t);
  }, [autoExpand]);

  const handleCopy = async () => {
    const ok = await onCopy();
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <OnClickOutside onClickOutside={() => !autoExpand && setIsExpanded(false)}>
      <div className={cn('flex items-center justify-center', className)}>
        <motion.div
          animate={{ width: isExpanded ? 'auto' : '120px', height: '48px' }}
          className={cn(
            'relative flex items-center overflow-hidden',
            'bg-white dark:bg-zinc-900',
            'border border-zinc-200 dark:border-zinc-800',
            'shadow-sm hover:shadow-md',
            'cursor-pointer rounded-full'
          )}
          initial={false}
          onClick={() => !isExpanded && setIsExpanded(true)}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <AnimatePresence mode="sync">
            {!isExpanded ? (
              <motion.div
                className="absolute inset-0 flex items-center justify-center gap-2"
                exit={{ opacity: 0, y: -20 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key="share-text"
                transition={{ duration: 0.2 }}
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm font-medium">Share</span>
              </motion.div>
            ) : (
              <motion.div
                className="flex items-center px-1"
                exit={{ opacity: 0, scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key="actions"
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {shareButtons.map((btn) => (
                  <button
                    className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-colors', 'text-zinc-600 dark:text-zinc-400', btn.color)}
                    key={btn.label}
                    type="button"
                    title={btn.label}
                    aria-label={`Share on ${btn.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(btn.label);
                    }}
                  >
                    <btn.icon className="h-5 w-5" />
                  </button>
                ))}
                <div className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                <button
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    'text-zinc-600 dark:text-zinc-400',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    copied && 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-500'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleCopy();
                  }}
                  type="button"
                  title="Copy Link"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </OnClickOutside>
  );
};

interface ShareModalProps {
  title: string;
  value: string;
  url: string;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ title, value, url, onClose, onToast }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const text = `${title}: ${value}, on MarketSyde`;

  const copy = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      onToast('Could not copy here. Copy the link from the box below.');
      return false;
    }
  };

  const share = async (network: 'Twitter' | 'Instagram' | 'LinkedIn') => {
    if (network === 'Twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    } else if (network === 'LinkedIn') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    } else {
      // Instagram has no web share link, so copy it and let the member paste it
      if (await copy()) onToast('Link copied. Paste it into Instagram.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share this offer"
        className="bg-white dark:bg-zinc-950 rounded-2xl border border-[#e2e8f0] dark:border-zinc-800 w-full max-w-md shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">Share this offer</h3>
            <p className="text-sm text-[#474556] dark:text-zinc-400 mt-0.5 truncate">{title} · {value}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 shrink-0" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>

        <SocialButton autoExpand className="py-3" onShare={share} onCopy={copy} />

        <div className="mt-5">
          <label className="text-xs font-semibold text-[#474556] dark:text-zinc-400 mb-1.5 block">Link</label>
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 rounded-xl px-3 py-2.5 text-xs font-mono text-[#474556] dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
          />
        </div>
      </div>
    </div>
  );
};
