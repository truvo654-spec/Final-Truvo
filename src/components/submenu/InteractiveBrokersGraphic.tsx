import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type BrokerGraphicVariant = 'brokers' | 'broker-comparison';

interface InteractiveBrokersGraphicProps {
  variant?: BrokerGraphicVariant;
  onOpenBrokerList?: () => void;
  onOpenComparison?: () => void;
}

export const InteractiveBrokersGraphic: React.FC<InteractiveBrokersGraphicProps> = ({
  variant = 'brokers',
  onOpenBrokerList,
  onOpenComparison,
}) => {
  // Generate horizontal scanlines for the 3D halftone sphere
  const sphereLines = React.useMemo(() => {
    const lines = [];
    const R = 74;
    const cy0 = 100;
    const cx0 = 100;
    const step = 4;
    for (let y = 28; y <= 172; y += step) {
      const dy = y - cy0;
      const dx = Math.sqrt(Math.max(0, R * R - dy * dy));
      lines.push({
        y,
        x1: cx0 - dx,
        x2: cx0 + dx,
        width: dx * 2,
      });
    }
    return lines;
  }, []);

  // Purple / blue glow capsule dots along the right equator limb
  const rightLimbDots = [
    { cy: 68, cx: 168, rx: 2.2, ry: 3.5 },
    { cy: 77, cx: 171, rx: 2.6, ry: 4.2 },
    { cy: 87, cx: 173.5, rx: 2.8, ry: 4.8 },
    { cy: 98, cx: 174, rx: 3, ry: 5.2 },
    { cy: 109, cx: 173, rx: 2.8, ry: 4.8 },
    { cy: 119, cx: 170.5, rx: 2.6, ry: 4.2 },
    { cy: 129, cx: 166.5, rx: 2.2, ry: 3.6 },
  ];

  return (
    <div className="relative w-[280px] sm:w-[310px] h-[190px] select-none flex items-center justify-center shrink-0">
      <AnimatePresence mode="wait">
        {/* ─────────────────────────────────────────────────────────────
            VARIANT 1: BROKER LIST (State=Broker 1, Dark Mode_=off.png)
            Dotted Halftone Sphere Globe with Floating Broker Badges
           ───────────────────────────────────────────────────────────── */}
        {variant === 'brokers' && (
          <motion.div
            key="brokers-globe"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
            onClick={onOpenBrokerList}
          >
            {/* Halftone / Dotted Wireframe Sphere */}
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                <defs>
                  {/* Subtle continent mask/glow */}
                  <radialGradient id="sphere-light" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.2" />
                  </radialGradient>
                </defs>

                {/* Sphere Backdrop Shape */}
                <circle cx="100" cy="100" r="74" fill="url(#sphere-light)" opacity="0.3" />

                {/* Horizontal Halftone Scanlines */}
                {sphereLines.map((line, idx) => {
                  const isUpper = line.y < 100;
                  return (
                    <line
                      key={idx}
                      x1={line.x1}
                      y1={line.y}
                      x2={line.x2}
                      y2={line.y}
                      stroke="#0f172a"
                      strokeWidth="1.6"
                      strokeDasharray={idx % 2 === 0 ? "2.2 3.2" : "1.8 2.8"}
                      opacity={0.85}
                    />
                  );
                })}

                {/* Stylized continent dot clouds (white/soft clouds behind badges) */}
                <ellipse cx="80" cy="75" rx="24" ry="18" fill="#ffffff" opacity="0.8" />
                <ellipse cx="70" cy="125" rx="26" ry="16" fill="#ffffff" opacity="0.75" />
                <ellipse cx="125" cy="85" rx="16" ry="20" fill="#ffffff" opacity="0.6" />

                {/* Right Limb Purple Capsule Beads */}
                {rightLimbDots.map((dot, i) => (
                  <ellipse
                    key={i}
                    cx={dot.cx}
                    cy={dot.cy}
                    rx={dot.rx}
                    ry={dot.ry}
                    fill="#5945F1"
                    opacity={0.95}
                  />
                ))}
              </svg>

              {/* ─── FLOATING BADGE 1: HFM (Top Center, tilted -5deg) ─── */}
              <motion.div
                animate={{ y: [-2, 3, -2], rotate: [-6, -3, -6] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.15, rotate: 0 }}
                className="absolute top-2 left-[44%] -translate-x-1/2 z-20"
              >
                <div className="w-13 h-13 bg-black rounded-2xl shadow-xl border border-white/20 p-1.5 flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center leading-none">
                    <span className="text-white font-black text-sm tracking-tight">HF</span>
                    <span className="text-[#e11d48] font-black text-sm tracking-tight">M</span>
                  </div>
                  <span className="text-[6.5px] text-slate-300 font-bold tracking-widest mt-1 uppercase leading-none">
                    HF MARKETS
                  </span>
                </div>
              </motion.div>

              {/* ─── FLOATING BADGE 2: FxPro (Mid-Right, tilted +8deg) ─── */}
              <motion.div
                animate={{ y: [2, -3, 2], rotate: [6, 10, 6] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                whileHover={{ scale: 1.15, rotate: 0 }}
                className="absolute top-[42%] right-2 z-20"
              >
                <div className="w-10 h-10 bg-[#dc2626] rounded-xl shadow-xl border border-white/30 p-1 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-[10px] tracking-tight leading-none">
                    FxPro
                  </span>
                  <span className="text-[5.5px] text-red-100 font-medium tracking-tight mt-0.5 leading-none">
                    Trade Like a Pro
                  </span>
                </div>
              </motion.div>

              {/* ─── FLOATING BADGE 3: Exness (Bottom-Center, tilted -2deg) ─── */}
              <motion.div
                animate={{ y: [-3, 2, -3], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                whileHover={{ scale: 1.15, rotate: 0 }}
                className="absolute bottom-6 left-[38%] z-20"
              >
                <div className="w-12 h-12 bg-[#ffcc00] rounded-2xl shadow-xl border border-white/30 flex items-center justify-center">
                  <span className="text-black font-black text-2xl lowercase tracking-tighter leading-none select-none">
                    ex
                  </span>
                </div>
              </motion.div>

              {/* ─── FLOATING BADGE 4: XM (Bottom-Right, tilted +6deg) ─── */}
              <motion.div
                animate={{ y: [2, -2, 2], rotate: [4, 8, 4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
                whileHover={{ scale: 1.15, rotate: 0 }}
                className="absolute bottom-2 right-4 z-20"
              >
                <div className="w-12 h-12 bg-black rounded-2xl shadow-xl border border-white/20 flex items-center justify-center">
                  <span className="text-white font-black text-sm tracking-tighter">X</span>
                  <span className="text-[#e11d48] font-black text-sm tracking-tighter">M</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            VARIANT 2: BROKER COMPARISON (State=Broker 2, Dark Mode_=off.png)
            Dual Comparison Cards (HFM vs Exness) with VS badge, $, XM, FxPro
           ───────────────────────────────────────────────────────────── */}
        {variant === 'broker-comparison' && (
          <motion.div
            key="broker-comparison-cards"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
            onClick={onOpenComparison}
          >
            {/* 1. Lime Green Dollar Badge (Top-Left above HFM) */}
            <motion.div
              animate={{
                y: [-2, 3, -2],
                rotate: [-6, -2, -6],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1 left-2 w-10 h-10 rounded-full bg-[#CAEB0E] flex items-center justify-center shadow-md z-20"
            >
              <span className="text-black font-black text-2xl leading-none select-none">$</span>
            </motion.div>

            {/* 2. XM Logo Tile (Top Center, tilted -12deg) */}
            <motion.div
              animate={{
                y: [2, -3, 2],
                rotate: [-14, -10, -14],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
              className="absolute top-1 left-[105px] w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-md z-20 p-1 border border-white/20"
            >
              <div className="flex items-center justify-center tracking-tighter">
                <span className="text-white font-black text-[11px]">X</span>
                <span className="text-[#e11d48] font-black text-[11px]">M</span>
              </div>
            </motion.div>

            {/* 3. FxPro Logo Tile (Top Right above Exness, tilted +12deg) */}
            <motion.div
              animate={{
                y: [-2, 2, -2],
                rotate: [10, 14, 10],
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
              className="absolute top-4 right-6 w-8 h-8 rounded-lg bg-[#dc2626] flex items-center justify-center shadow-md z-20 p-0.5 border border-white/20"
            >
              <span className="text-white font-black text-[9px] tracking-tight leading-none">FxPro</span>
            </motion.div>

            {/* 4. HFM Card (Left Comparison Card, tilted -6deg) */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3, y: -2 }}
              className="absolute left-6 top-7 w-[114px] bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-slate-100 p-3 flex flex-col items-center text-center z-10 -rotate-[6deg] transition-shadow hover:shadow-xl"
            >
              {/* HFM Logo Square */}
              <div className="w-14 h-14 bg-black rounded-xl flex flex-col items-center justify-center p-1.5 shadow-xs">
                <div className="flex items-center justify-center">
                  <span className="text-white font-black text-sm tracking-tight leading-none">HF</span>
                  <span className="text-[#e11d48] font-black text-sm tracking-tight leading-none">M</span>
                </div>
                <span className="text-[6.5px] text-slate-300 font-bold tracking-widest mt-1 uppercase leading-none">
                  HF Markets
                </span>
              </div>

              {/* HFM Text */}
              <span className="font-black text-sm text-[#0b1c30] mt-2 leading-tight">HFM</span>

              {/* Instruments Stats */}
              <div className="mt-1 flex flex-col items-center">
                <span className="font-black text-sm text-[#5945F1] leading-none">500+</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5 leading-none">
                  instruments
                </span>
              </div>
            </motion.div>

            {/* 5. Exness Card (Right Comparison Card, tilted +6deg) */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3, y: -2 }}
              className="absolute right-6 top-7 w-[114px] bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-slate-100 p-3 flex flex-col items-center text-center z-10 rotate-[6deg] transition-shadow hover:shadow-xl"
            >
              {/* Exness Yellow Logo Square */}
              <div className="w-14 h-14 bg-[#ffcc00] rounded-xl flex items-center justify-center shadow-xs">
                <span className="text-black font-black text-2xl lowercase tracking-tighter leading-none select-none">
                  ex
                </span>
              </div>

              {/* Exness Text */}
              <span className="font-black text-sm text-[#0b1c30] mt-2 leading-tight">Exness</span>

              {/* Instruments Stats */}
              <div className="mt-1 flex flex-col items-center">
                <span className="font-black text-sm text-[#5945F1] leading-none">240+</span>
                <span className="text-[10px] font-medium text-slate-500 mt-0.5 leading-none">
                  instruments
                </span>
              </div>
            </motion.div>

            {/* 6. "VS" Circular Badge (Center Overlap) */}
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#5945F1] text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white z-30 select-none"
            >
              VS
            </motion.div>

            {/* 7. Hot Pink Star Icon (Bottom near HFM & VS) */}
            <motion.div
              animate={{
                rotate: [-12, -4, -12],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-2 left-[118px] w-6 h-6 flex items-center justify-center z-20"
            >
              <svg
                className="w-5 h-5 text-[#FE01B1] fill-[#FE01B1] stroke-black stroke-[1.6]"
                viewBox="0 0 24 24"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
