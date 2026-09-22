import React from 'react';
import { motion } from 'motion/react';

interface LiveInteractiveSparklineProps {
  trend: 'up' | 'down';
  color?: string;
  isTicked?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export const LiveInteractiveSparkline: React.FC<LiveInteractiveSparklineProps> = ({
  trend,
  color,
  isTicked = false,
  className = '',
  width = 44,
  height = 18,
}) => {
  const strokeColor = color || (trend === 'up' ? '#10B981' : '#EF4444');
  const gradientId = React.useId();

  // Paths for upward and downward trends with slight wave variations
  const upPath1 = 'M 0 14 Q 8 12, 14 13 T 26 8 T 34 10 L 42 3';
  const upPath2 = 'M 0 13 Q 8 14, 15 11 T 25 7 T 35 8 L 42 2';

  const downPath1 = 'M 0 3 Q 8 5, 14 4 T 26 11 T 34 9 L 42 15';
  const downPath2 = 'M 0 4 Q 8 3, 15 6 T 25 12 T 35 11 L 42 16';

  const initialD = trend === 'up' ? upPath1 : downPath1;
  const targetD = trend === 'up' ? upPath2 : downPath2;

  // Tip coordinate for the live radar ping dot
  const tipX = 42;
  const tipY = trend === 'up' ? 2.5 : 15.5;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-visible ${className}`}
      style={{ width, height }}
      animate={isTicked ? { scale: [1, 1.18, 1], y: [0, -1.5, 0] } : { scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 44 18"
        className="w-full h-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle Area Glow */}
        <motion.path
          d={
            trend === 'up'
              ? `${initialD} L 42 18 L 0 18 Z`
              : `${initialD} L 42 18 L 0 18 Z`
          }
          fill={`url(#${gradientId})`}
          animate={{
            opacity: isTicked ? [0.4, 0.75, 0.4] : [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Animated Moving Spline Wave */}
        <motion.path
          d={initialD}
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: [initialD, targetD, initialD],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Live Radar Ping Pulse at Tip */}
        <motion.circle
          cx={tipX}
          cy={tipY}
          r="4"
          fill={strokeColor}
          animate={{
            scale: [1, 2.4, 1],
            opacity: [0.75, 0, 0.75],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />

        {/* Solid Live Tip Dot */}
        <circle
          cx={tipX}
          cy={tipY}
          r="2.2"
          fill={strokeColor}
          className="shadow-xs"
        />
      </svg>
    </motion.div>
  );
};
