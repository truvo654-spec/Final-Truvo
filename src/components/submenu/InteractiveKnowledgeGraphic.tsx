import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, GraduationCap, Flame, TrendingUp } from 'lucide-react';

export const InteractiveKnowledgeGraphic: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
    >
      {/* Base glow */}
      <div className="absolute w-36 h-36 rounded-full bg-white/70 blur-xl" />

      <motion.div
        className="relative w-40 h-40"
        animate={{ rotateX: tilt.y, rotateY: tilt.x }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* News card */}
        <motion.div
          className="absolute left-0 top-4 w-32 bg-white rounded-2xl shadow-lg border border-slate-100 p-3"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-[#5945F1] flex items-center justify-center shrink-0">
              <Newspaper className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="h-1.5 w-12 bg-slate-200 rounded-full" />
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1" />
          <div className="h-1.5 w-2/3 bg-slate-100 rounded-full mb-2" />
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
            <TrendingUp className="w-2.5 h-2.5" /> Bullish
          </div>
        </motion.div>

        {/* Course / certificate card */}
        <motion.div
          className="absolute right-0 bottom-2 w-28 bg-white rounded-2xl shadow-lg border border-slate-100 p-3"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ transform: 'translateZ(45px)' }}
        >
          <div className="w-6 h-6 rounded-full bg-[#CAEB0E] flex items-center justify-center mb-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#323B01]" />
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1" />
          <div className="h-1.5 bg-slate-100 rounded-full mb-2" style={{ width: '70%' }} />
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-[#5945F1] rounded-full" />
          </div>
        </motion.div>

        {/* Floating points badge */}
        <motion.div
          className="absolute left-6 bottom-0 flex items-center gap-1 bg-[#0b1c30] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md"
          animate={{ y: [0, -4, 0], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ transform: 'translateZ(60px)' }}
        >
          <Flame className="w-2.5 h-2.5 text-[#CAEB0E]" /> +150 pts
        </motion.div>
      </motion.div>
    </div>
  );
};
