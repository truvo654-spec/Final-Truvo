import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Users, ThumbsUp, Heart, Flame, Sparkles } from 'lucide-react';

interface FloatingTraderBubble {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  comment: string;
  reaction: string;
  x: string;
  y: string;
  delay: number;
}

export const InteractiveCommunityGraphic: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [bullPercent, setBullPercent] = useState(78);
  const [bursts, setBursts] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([]);
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>('1');

  const traders: FloatingTraderBubble[] = [
    {
      id: '1',
      name: 'Elena (Quant)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&auto=format&fit=crop&q=80',
      badge: 'TOP 1%',
      comment: 'BTC breakout holding VWAP! 🎯',
      reaction: '🔥 48',
      x: 'top-1 right-0',
      y: 'translate-y-0',
      delay: 0,
    },
    {
      id: '2',
      name: 'Marcus K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&auto=format&fit=crop&q=80',
      badge: 'VERIFIED',
      comment: 'Rebate paid: $140 into wallet 💸',
      reaction: '⚡ 32',
      x: 'bottom-6 -left-2',
      y: 'translate-y-0',
      delay: 0.4,
    },
    {
      id: '3',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&auto=format&fit=crop&q=80',
      badge: 'PRO',
      comment: 'Gold spread tested: 0.1 pip 🏆',
      reaction: '🚀 84',
      x: 'bottom-1 right-2',
      y: 'translate-y-0',
      delay: 0.8,
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleVote = (type: 'bull' | 'bear', e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'bull') {
      setBullPercent((prev) => Math.min(95, prev + 2));
      triggerBurst('🐂', 40, 20);
    } else {
      setBullPercent((prev) => Math.max(20, prev - 2));
      triggerBurst('🐻', 80, 20);
    }
  };

  const triggerBurst = (emoji: string, x: number, y: number) => {
    const id = Date.now() + Math.random();
    setBursts((prev) => [...prev.slice(-4), { id, emoji, x, y }]);
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1200);
  };

  return (
    <div
      className="relative w-48 h-48 sm:w-52 sm:h-52 shrink-0 flex items-center justify-center select-none cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
    >
      {/* 3D Tilting Sphere Container */}
      <motion.div
        className="relative w-40 h-40 flex items-center justify-center"
        animate={{
          rotateX: tilt.y,
          rotateY: tilt.x,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <svg viewBox="0 0 160 160" className="w-40 h-40 overflow-visible">
          <defs>
            <clipPath id="sphere-clip-interactive-comm">
              <circle cx="80" cy="80" r="66" />
            </clipPath>
            <radialGradient id="sphere-grad-interactive-comm" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#f5f3ff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id="orbit-grad-comm" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5945F1" />
              <stop offset="50%" stopColor="#FE01B1" />
              <stop offset="100%" stopColor="#c6f831" />
            </linearGradient>
          </defs>

          {/* Sphere Base */}
          <circle cx="80" cy="80" r="66" fill="url(#sphere-grad-interactive-comm)" />

          {/* Internal Network Web & Constellation */}
          <g clipPath="url(#sphere-clip-interactive-comm)">
            {[-52, -42, -32, -22, -12, -2, 8, 18, 28, 38, 48].map((yOffset, i) => (
              <line
                key={i}
                x1="0"
                y1={80 + yOffset}
                x2="160"
                y2={80 + yOffset}
                stroke="#94a3b8"
                strokeWidth="1.2"
                strokeDasharray="2.5 3.5"
                strokeOpacity="0.5"
              />
            ))}

            {/* Glowing Interconnected Network Lines */}
            <line x1="45" y1="50" x2="80" y2="75" stroke="#5945F1" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="80" y1="75" x2="115" y2="55" stroke="#FE01B1" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="80" y1="75" x2="70" y2="115" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="115" y1="55" x2="125" y2="105" stroke="#5945F1" strokeWidth="1.2" strokeOpacity="0.5" />

            {/* Network nodes */}
            <circle cx="45" cy="50" r="4" fill="#5945F1" />
            <circle cx="80" cy="75" r="5" fill="#FE01B1" />
            <circle cx="115" cy="55" r="4" fill="#c6f831" />
            <circle cx="70" cy="115" r="4" fill="#10b981" />
            <circle cx="125" cy="105" r="3.5" fill="#3b82f6" />
          </g>

          {/* Outer Rim */}
          <circle
            cx="80"
            cy="80"
            r="66"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* Orbiting Halo Ring */}
          <ellipse
            cx="80"
            cy="80"
            rx="75"
            ry="24"
            fill="none"
            stroke="url(#orbit-grad-comm)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            transform="rotate(-15 80 80)"
            opacity="0.85"
          />
        </svg>

        {/* Orbiting Live Heartbeat Orb */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-[#FE01B1] shadow-[0_0_12px_#FE01B1]"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '80px 80px', top: 6, left: 6 }}
        />

        {/* Interactive Sentiment Meter in Center */}
        <div className="absolute z-20 flex flex-col items-center bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-lg border border-indigo-100 max-w-[130px]">
          <div className="flex items-center gap-1 text-[9px] font-bold text-[#0b1c30]">
            <span>Sentiment</span>
            <span className="text-[#5945F1] font-mono">{bullPercent}% Bull</span>
          </div>
          {/* Dual mini-progress bar */}
          <div className="w-20 h-1.5 bg-rose-100 rounded-full overflow-hidden mt-1 flex">
            <motion.div
              className="h-full bg-gradient-to-r from-[#5945F1] to-[#10b981]"
              animate={{ width: `${bullPercent}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            />
          </div>
          {/* Playful vote buttons */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={(e) => handleVote('bull', e)}
              className="text-[9px] px-1 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors"
              title="Vote Bullish"
            >
              🐂 +1
            </button>
            <button
              onClick={(e) => handleVote('bear', e)}
              className="text-[9px] px-1 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors"
              title="Vote Bearish"
            >
              🐻 -1
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Trader Bubbles with live chatter */}
      {traders.map((t) => {
        const isActive = activeBubbleId === t.id;
        return (
          <motion.div
            key={t.id}
            className={`absolute ${t.x} z-30`}
            animate={{ y: [-4, 4, -4] }}
            transition={{
              duration: 3 + t.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: t.delay,
            }}
            onClick={() => {
              setActiveBubbleId(isActive ? null : t.id);
              triggerBurst('🔥', 60, 40);
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/95 backdrop-blur-xs border border-indigo-100 px-2 py-1 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer max-w-[155px]"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-300"
              />
              <div className="overflow-hidden text-left">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[10px] font-bold text-[#0b1c30] truncate">{t.name}</span>
                  <span className="text-[7px] font-bold px-1 py-0.2 rounded-xs bg-[#5945F1]/10 text-[#5945F1]">
                    {t.badge}
                  </span>
                </div>
                <p className="text-[8.5px] text-[#474556] truncate mt-0.5">{t.comment}</p>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Bursts of Emojis when interacting */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 1, scale: 0.6, y: 0 }}
            animate={{ opacity: 0, scale: 1.4, y: -45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute z-50 text-base pointer-events-none"
            style={{ top: `${b.y}%`, left: `${b.x}%` }}
          >
            {b.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
