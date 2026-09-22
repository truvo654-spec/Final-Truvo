import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type CompanyGraphicVariant = 'about' | 'contact';

interface InteractiveCompanySubmenuGraphicProps {
  variant?: CompanyGraphicVariant;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
}

export const InteractiveCompanySubmenuGraphic: React.FC<InteractiveCompanySubmenuGraphicProps> = ({
  variant = 'about',
  onOpenAbout,
  onOpenContact,
}) => {
  return (
    <div className="relative w-[280px] sm:w-[310px] h-[190px] select-none flex items-center justify-center shrink-0">
      <AnimatePresence mode="wait">
        {/* ─────────────────────────────────────────────────────────────
            VARIANT 1: ABOUT US (State=Company 1, Dark Mode_=off.png)
            Large Purple Circle with White M Ribbon and Lime Dot
           ───────────────────────────────────────────────────────────── */}
        {variant === 'about' && (
          <motion.div
            key="company-about-globe"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
            onClick={onOpenAbout}
          >
            {/* Ambient subtle glow behind the purple circle */}
            <div className="absolute w-44 h-44 rounded-full bg-[#5945F1]/15 blur-xl pointer-events-none" />

            {/* Large Vibrant Purple Circle (Extends gracefully overlapping background) */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#5945F1] shadow-2xl flex items-center justify-center overflow-hidden"
            >
              {/* Internal subtle gradient highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4b35e0] via-[#5945F1] to-[#715dfc] opacity-90" />

              {/* Marketsyde Signature 'M' Wave Ribbon with Lime Ball (Exact match to State=Company 1.png) */}
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full p-2 relative z-10 overflow-visible"
              >
                {/* Thick White Continuous Smooth 'M' Curve */}
                <path
                  d="M 38 126 C 36 88, 38 64, 52 64 C 66 64, 73 98, 86 98 C 98 98, 106 48, 122 48 C 134 48, 137 72, 139 88"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Electric Lime Green Circle at the terminal of the 'M' path */}
                <circle
                  cx="140"
                  cy="92"
                  r="13"
                  fill="#bef226"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="filter drop-shadow-sm"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VARIANT 2: CONTACT US (State=Company 2, Dark Mode_=off.png)
            Translucent Envelope with Message Card, Origami Plane, Chat & Question Bubbles
           ───────────────────────────────────────────────────────────── */}
        {variant === 'contact' && (
          <motion.div
            key="company-contact-envelope"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
            onClick={onOpenContact}
          >
            {/* Concentric Thin Orbit Rings with Decorative Accent Beads */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 240 200" className="w-full h-full overflow-visible">
                {/* Inner Orbit */}
                <ellipse
                  cx="120"
                  cy="98"
                  rx="72"
                  ry="58"
                  fill="none"
                  stroke="#c7d2fe"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                {/* Outer Orbit */}
                <ellipse
                  cx="120"
                  cy="98"
                  rx="98"
                  ry="78"
                  fill="none"
                  stroke="#e0e7ff"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* Decorative Beads positioned matching State=Company 2 */}
                {/* Lime Dot - Left */}
                <circle cx="34" cy="92" r="3" fill="#bef226" />
                {/* Purple Dot - Top */}
                <circle cx="120" cy="22" r="4" fill="#5945F1" />
                {/* Lime Dot - Top Right */}
                <circle cx="188" cy="74" r="3" fill="#bef226" />
                {/* Purple Dot - Bottom */}
                <circle cx="132" cy="172" r="3" fill="#5945F1" />
                {/* Lime Dot - Bottom Right */}
                <circle cx="178" cy="154" r="3" fill="#bef226" />
              </svg>
            </div>

            {/* Central Floating Envelope Container */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex items-center justify-center z-10"
            >
              {/* 1. Frosted Glowing Envelope Base */}
              <div className="relative w-36 h-28 sm:w-40 sm:h-30 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 shadow-[0_12px_32px_rgba(89,69,241,0.18)] p-2 flex flex-col justify-end overflow-hidden">
                {/* Open V-flap fold at the back */}
                <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/90 to-transparent pointer-events-none" />

                {/* Frosted Envelope Front V-Flaps */}
                <div
                  className="absolute inset-x-0 bottom-0 h-18 bg-white/60 backdrop-blur-sm pointer-events-none border-t border-white/80"
                  style={{
                    clipPath: 'polygon(0% 100%, 50% 30%, 100% 100%)',
                  }}
                />
                <div
                  className="absolute inset-y-0 left-0 w-18 bg-white/40 backdrop-blur-xs pointer-events-none"
                  style={{
                    clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)',
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 w-18 bg-white/40 backdrop-blur-xs pointer-events-none"
                  style={{
                    clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)',
                  }}
                />

                {/* 2. Glowing Letter Document inside Envelope */}
                <motion.div
                  animate={{ y: [-2, 1, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-26 rounded-xl bg-gradient-to-b from-[#7059fc] to-[#5945F1] shadow-lg p-2.5 flex flex-col justify-center gap-1.5 z-10 border border-white/30"
                >
                  {/* Three Horizontal Text Lines */}
                  <div className="w-14 h-1.5 rounded-full bg-white/90 shadow-xs" />
                  <div className="w-16 h-1.5 rounded-full bg-white/80" />
                  <div className="w-12 h-1.5 rounded-full bg-white/70" />
                </motion.div>
              </div>

              {/* 3. Origami Paper Airplane (Bottom-Left, Flying Towards Top-Right) */}
              <motion.div
                animate={{
                  y: [3, -4, 3],
                  x: [-2, 2, -2],
                  rotate: [0, 4, 0],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-2 -left-4 z-20"
              >
                <svg
                  viewBox="0 0 44 44"
                  className="w-11 h-11 filter drop-shadow-[0_8px_12px_rgba(89,69,241,0.35)]"
                >
                  {/* Left Wing (Light Purple) */}
                  <polygon points="6,34 38,6 20,24" fill="#7d6cfc" />
                  {/* Right Wing (Darker Purple) */}
                  <polygon points="20,24 38,6 26,38" fill="#5945F1" />
                  {/* Fold Center Crease */}
                  <polygon points="20,24 22,30 26,38" fill="#4330d0" />
                  {/* Crisp Highlights */}
                  <line x1="6" y1="34" x2="38" y2="6" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                </svg>
              </motion.div>

              {/* 4. Chat Speech Bubble with '...' (Top-Left) */}
              <motion.div
                animate={{
                  y: [-2, 3, -2],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute -top-3 left-1 z-20"
              >
                <div className="w-8 h-8 rounded-2xl bg-[#5945F1]/90 backdrop-blur-md shadow-md border border-white/30 flex items-center justify-center p-1 relative">
                  {/* Three dots */}
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-white" />
                    <span className="w-1 h-1 rounded-full bg-white" />
                  </div>
                  {/* Little speech tail */}
                  <div className="absolute -bottom-1 right-2 w-2 h-2 bg-[#5945F1]/90 rotate-45" />
                </div>
              </motion.div>

              {/* 5. Question Mark Bubble (Mid-Right) */}
              <motion.div
                animate={{
                  y: [2, -3, 2],
                  scale: [1, 1.06, 1],
                }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute top-6 -right-5 z-20"
              >
                <div className="w-7 h-7 rounded-xl bg-[#5945F1]/90 backdrop-blur-md shadow-md border border-white/30 flex items-center justify-center p-1 relative">
                  <span className="text-white font-black text-xs leading-none">?</span>
                  {/* Little tail */}
                  <div className="absolute -bottom-1 left-2 w-1.5 h-1.5 bg-[#5945F1]/90 rotate-45" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
