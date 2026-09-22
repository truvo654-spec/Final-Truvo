import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ArrowRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';

export type TourStepId = 1 | 2 | 3 | 4 | 5;

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

interface DashboardTourOverlayProps {
  isActive: boolean;
  user: UserProfile;
  currentStep?: TourStepId;
  onStepChange?: (step: TourStepId) => void;
  onClose: () => void;
  onFinish: () => void;
  onNavigateToBrokers?: () => void;
}

export const DashboardTourOverlay: React.FC<DashboardTourOverlayProps> = ({
  isActive,
  user,
  currentStep: controlledStep,
  onStepChange,
  onClose,
  onFinish,
  onNavigateToBrokers,
}) => {
  const [internalStep, setInternalStep] = useState<TourStepId>(1);
  const currentStep = controlledStep !== undefined ? controlledStep : internalStep;

  const setStep = useCallback(
    (step: TourStepId) => {
      if (onStepChange) {
        onStepChange(step);
      }
      setInternalStep(step);
    },
    [onStepChange]
  );

  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Determine element ID for current tour step
  const getTargetElementId = useCallback((step: TourStepId): string => {
    switch (step) {
      case 1:
        return 'tour-profile-dropdown';
      case 2:
        return 'tour-rookie-level-card';
      case 3:
        return 'tour-quick-start-card';
      case 4:
        return 'tour-your-stats-card';
      case 5:
        return 'tour-brokers-section';
      default:
        return '';
    }
  }, []);

  // Measure target element position
  const updateRect = useCallback(() => {
    if (!isActive) return;
    const targetId = getTargetElementId(currentStep);
    let el = document.getElementById(targetId);

    // Fallback for step 1 if dropdown animation is delayed
    if (!el && currentStep === 1) {
      el = document.getElementById('tour-profile-menu-container') || document.getElementById('tour-profile-button');
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep, getTargetElementId, isActive]);

  // Auto-scroll and continuous tracking during scroll transitions
  useEffect(() => {
    if (!isActive) return;

    const targetId = getTargetElementId(currentStep);
    let el = document.getElementById(targetId);
    if (!el && currentStep === 1) {
      el = document.getElementById('tour-profile-menu-container') || document.getElementById('tour-profile-button');
    }

    if (currentStep === 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Continuously measure during smooth scroll for 900ms
    setIsMeasuring(true);
    const startTime = performance.now();
    const track = () => {
      updateRect();
      if (performance.now() - startTime < 900) {
        animFrameRef.current = requestAnimationFrame(track);
      } else {
        setIsMeasuring(false);
      }
    };
    animFrameRef.current = requestAnimationFrame(track);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentStep, getTargetElementId, isActive, updateRect]);

  // Window resize & scroll listeners
  useEffect(() => {
    if (!isActive) return;

    const handleScrollOrResize = () => {
      updateRect();
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isActive, updateRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStep < 5) setStep((currentStep + 1) as TourStepId);
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 1) setStep((currentStep - 1) as TourStepId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep, onClose, setStep]);

  if (!isActive) return null;

  // Visual padding and border radius according to step
  const padding = currentStep === 1 ? 6 : currentStep === 5 ? 8 : 8;
  const radius = currentStep === 1 ? 24 : 20;

  // Calculate placement style for the floating tour card to sit directly adjacent to target
  const getTooltipPlacement = (): React.CSSProperties => {
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isDesktop = screenW >= 1024;
    const cardWidth = Math.min(390, screenW - 32);

    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: cardWidth,
      };
    }

    if (currentStep === 1) {
      // Profile menu in header (top-right of screen)
      if (isDesktop && targetRect.left >= 410) {
        return {
          position: 'fixed',
          top: Math.max(16, targetRect.top),
          right: screenW - targetRect.left + 18,
          width: cardWidth,
        };
      }
      return {
        position: 'fixed',
        top: Math.min(screenH - 330, targetRect.bottom + 16),
        right: Math.max(16, screenW - targetRect.right),
        width: cardWidth,
      };
    }

    if (currentStep === 2) {
      // Rookie Level Card (in top-right of 12-col grid)
      if (isDesktop && targetRect.left >= 410) {
        // Sit directly to the left of the Rookie Card!
        return {
          position: 'fixed',
          top: Math.max(20, Math.min(screenH - 360, targetRect.top)),
          right: screenW - targetRect.left + 20,
          width: cardWidth,
        };
      }
      // Mobile / narrow view: below or above
      if (targetRect.bottom + 340 <= screenH) {
        return {
          position: 'fixed',
          top: targetRect.bottom + 16,
          left: Math.max(16, Math.min(screenW - cardWidth - 16, targetRect.left)),
          width: cardWidth,
        };
      }
      return {
        position: 'fixed',
        bottom: Math.max(16, screenH - targetRect.top + 16),
        left: Math.max(16, Math.min(screenW - cardWidth - 16, targetRect.left)),
        width: cardWidth,
      };
    }

    if (currentStep === 3) {
      // Quick Start Guide Card (in top-left of 12-col grid)
      if (isDesktop && screenW - targetRect.right >= 400) {
        // Sit directly to the right of Quick Start Guide!
        return {
          position: 'fixed',
          top: Math.max(20, Math.min(screenH - 360, targetRect.top)),
          left: targetRect.right + 20,
          width: cardWidth,
        };
      }
      if (targetRect.bottom + 340 <= screenH) {
        return {
          position: 'fixed',
          top: targetRect.bottom + 16,
          left: Math.max(16, Math.min(screenW - cardWidth - 16, targetRect.left)),
          width: cardWidth,
        };
      }
      return {
        position: 'fixed',
        bottom: Math.max(16, screenH - targetRect.top + 16),
        left: Math.max(16, Math.min(screenW - cardWidth - 16, targetRect.left)),
        width: cardWidth,
      };
    }

    if (currentStep === 4) {
      // Your Stats Card (full width card)
      if (targetRect.top >= 360) {
        return {
          position: 'fixed',
          bottom: screenH - targetRect.top + 20,
          left: Math.max(16, (screenW - cardWidth) / 2),
          width: cardWidth,
        };
      }
      return {
        position: 'fixed',
        top: Math.min(screenH - 340, targetRect.bottom + 20),
        left: Math.max(16, (screenW - cardWidth) / 2),
        width: cardWidth,
      };
    }

    if (currentStep === 5) {
      // Trusted Broker Partners Callout (speech bubble anchored above banner)
      const bubbleWidth = Math.min(500, screenW - 32);
      if (targetRect.top >= 320) {
        return {
          position: 'fixed',
          bottom: screenH - targetRect.top + 24,
          left: Math.max(16, (screenW - bubbleWidth) / 2),
          width: bubbleWidth,
        };
      }
      return {
        position: 'fixed',
        top: Math.max(20, (screenH - 300) / 2),
        left: Math.max(16, (screenW - bubbleWidth) / 2),
        width: bubbleWidth,
      };
    }

    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: cardWidth,
    };
  };

  // Step badge description
  const getStepBadgeText = () => {
    switch (currentStep) {
      case 1:
        return 'Member Area & Profile';
      case 2:
        return 'Your Level Card';
      case 3:
        return 'Quick Start Guide';
      case 4:
        return 'Your Stats & Performance';
      case 5:
        return 'Trusted Broker Partners';
    }
  };

  const getStepTheme = () => {
    switch (currentStep) {
      case 1:
        return { border: '#5945F1', ring: 'rgba(89, 69, 241, 0.4)', text: '#5945F1' };
      case 2:
        return { border: '#CAEB0E', ring: 'rgba(202, 235, 14, 0.5)', text: '#CAEB0E' };
      case 3:
        return { border: '#FD02B0', ring: 'rgba(253, 2, 176, 0.4)', text: '#FD02B0' };
      case 4:
        return { border: '#5945F1', ring: 'rgba(89, 69, 241, 0.4)', text: '#5945F1' };
      case 5:
        return { border: '#CAEB0E', ring: 'rgba(202, 235, 14, 0.5)', text: '#CAEB0E' };
    }
  };

  const stepTheme = getStepTheme();

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none">
      {/* ─── SVG CUTOUT SPOTLIGHT BACKDROP ─── */}
      {/* Cutout punches an exact transparent hole matching the REAL component on screen */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White covers entire screen (opaque backdrop) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout reveals the REAL screen component with 100% clarity */}
            {targetRect && (
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={radius}
                ry={radius}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop rect applying mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(9, 1, 25, 0.72)"
          mask="url(#tour-spotlight-mask)"
          className="pointer-events-auto cursor-pointer"
          onClick={onClose}
        />
      </svg>

      {/* ─── ACTIVE SPOTLIGHT FOCUS FRAME ─── */}
      {/* Frames the exact real element with matching size, position and glowing ring */}
      {targetRect && (
        <motion.div
          key={`focus-frame-step-${currentStep}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          style={{
            position: 'fixed',
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            borderRadius: radius,
            borderColor: stepTheme.border,
            boxShadow: `0 0 0 4px ${stepTheme.ring}, 0 0 32px ${stepTheme.ring}`,
          }}
          className="pointer-events-none z-20 border-2 transition-all duration-300"
        >
          {/* Subtle pulsating badge identifying the real highlighted element */}
          <div
            className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5"
            style={{ backgroundColor: currentStep === 2 || currentStep === 5 ? '#090119' : '#5945F1' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: currentStep === 2 || currentStep === 5 ? '#CAEB0E' : '#FD02B0' }}
            />
            <span style={{ color: currentStep === 2 || currentStep === 5 ? '#CAEB0E' : '#FFFFFF' }}>
              Step {currentStep} of 5: {getStepBadgeText()}
            </span>
          </div>
        </motion.div>
      )}

      {/* ─── DYNAMIC FLOATING TOUR CARD (Steps 1 to 4) ─── */}
      {currentStep <= 4 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`tour-card-step-${currentStep}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            style={getTooltipPlacement()}
            className="bg-white dark:bg-[#170345] rounded-[24px] p-6 shadow-2xl border border-slate-200/90 dark:border-[#3410D5] pointer-events-auto text-left relative overflow-hidden z-30"
          >
            {/* Top Step Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-[#230674] rounded-full h-1.5 mb-5 overflow-hidden">
              <motion.div
                initial={{ width: `${(currentStep - 1) * 25}%` }}
                animate={{ width: `${currentStep * 25}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#FD02B0] to-[#5945F1] rounded-full"
              />
            </div>

            {/* Step 1 Content: Profile Menu */}
            {currentStep === 1 && (
              <>
                <h3 className="text-xl sm:text-[22px] font-black tracking-tight text-[#0b1c30] dark:text-white leading-tight">
                  Inside your <span className="text-[#FD02B0]">member area</span>
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
                  Head here to track performance, cashback summaries, profile, security, and notifications.
                  There&apos;s way more waiting for you, <span className="font-bold text-slate-900 dark:text-white">don&apos;t skip it.</span>
                </p>
              </>
            )}

            {/* Step 2 Content: Rookie Level Card */}
            {currentStep === 2 && (
              <>
                <h3 className="text-xl sm:text-[22px] font-black tracking-tight text-[#0b1c30] dark:text-white leading-tight">
                  Look at your <span className="text-[#FD02B0]">level!</span>
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
                  Every trade earns points to level you up. The highlighted card shows your current tier and progression.{' '}
                  <span className="font-bold text-slate-900 dark:text-white">We dare you to try it, zero sweat required.</span>
                </p>
              </>
            )}

            {/* Step 3 Content: Quick Start Guide */}
            {currentStep === 3 && (
              <>
                <h3 className="text-xl sm:text-[22px] font-black tracking-tight text-[#0b1c30] dark:text-white leading-tight">
                  Easy quick <span className="text-[#FD02B0]">setup!</span>
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
                  Follow these 4 simple steps on the dashboard to connect a broker and level up.{' '}
                  <span className="font-bold text-slate-900 dark:text-white">Come on, let us show you!</span>
                </p>
              </>
            )}

            {/* Step 4 Content: Your Stats */}
            {currentStep === 4 && (
              <>
                <h3 className="text-xl sm:text-[22px] font-black tracking-tight text-[#0b1c30] dark:text-white leading-tight">
                  Your success stats <span className="text-[#FD02B0]">live here</span>
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-[#CCC6FB] leading-relaxed">
                  From day one to your latest win, your effort is always on display right on this card.{' '}
                  <span className="font-bold text-slate-900 dark:text-white">Time to connect a broker and get your stats moving!</span>
                </p>
              </>
            )}

            {/* Footer Navigation Controls */}
            <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-100 dark:border-[#230674]">
              {/* Back / Forward arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => currentStep > 1 && setStep((currentStep - 1) as TourStepId)}
                  disabled={currentStep === 1}
                  className={`w-8 h-8 rounded-full border border-slate-200 dark:border-[#3410D5] flex items-center justify-center transition-colors cursor-pointer ${
                    currentStep === 1
                      ? 'opacity-40 cursor-not-allowed text-slate-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-[#230674]'
                  }`}
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => currentStep < 5 && setStep((currentStep + 1) as TourStepId)}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#3410D5] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-[#230674] transition-colors cursor-pointer"
                  aria-label="Next step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-[#8A7AF6] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {currentStep === 1
                    ? 'Nah, skip it.'
                    : currentStep === 2
                    ? 'Nah, not today'
                    : currentStep === 3
                    ? "I don't care"
                    : "I'll explore solo"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep((currentStep + 1) as TourStepId)}
                  className="py-2 px-5 rounded-full bg-[#5945F1] hover:bg-[#4734df] text-white font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>
                    {currentStep === 1
                      ? "What's More?"
                      : currentStep === 2
                      ? 'Show me how'
                      : currentStep === 3
                      ? 'Take me there'
                      : 'Bring it on'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ─── STEP 5: VOLT-LIME BROKER CALLOUT (Anchored above Brokers Banner) ─── */}
      {currentStep === 5 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            style={getTooltipPlacement()}
            className="bg-[#CAEB0E] rounded-[28px] p-6 sm:p-8 text-slate-950 shadow-2xl pointer-events-auto relative text-left border-2 border-lime-400 z-30"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onFinish}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-900 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Sparkle Icon Badge */}
            <div className="w-10 h-10 rounded-full bg-black text-[#CAEB0E] flex items-center justify-center mb-3 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-950 leading-tight">
              Our trusted broker partners
            </h3>

            {/* Body */}
            <p className="mt-2.5 text-sm sm:text-base text-slate-900/90 font-medium leading-relaxed">
              To make your stats grow, connect your broker or pick from our trusted partners to get started.{' '}
              <span className="font-extrabold text-slate-950">This is just the beginning</span>, so click &apos;Explore All Brokers&apos; to see what we&apos;ve got!
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={onFinish}
                className="py-2.5 px-5 rounded-full font-bold text-xs sm:text-sm text-slate-900 hover:bg-black/10 transition-colors cursor-pointer"
              >
                Got it!
              </button>
              <button
                type="button"
                onClick={() => {
                  onFinish();
                  if (onNavigateToBrokers) onNavigateToBrokers();
                }}
                className="py-2.5 px-6 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Explore All Brokers</span>
                <ArrowRight className="w-4 h-4 text-[#CAEB0E]" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
