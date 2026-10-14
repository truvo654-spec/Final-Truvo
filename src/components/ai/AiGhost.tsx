import React from 'react';

/**
 * The MarketSyde mascot, drawn the same way as the error pages so the AI
 * reads as part of the product rather than a bolted-on assistant.
 */
export const AiGhost: React.FC<{ className?: string; blink?: boolean }> = ({ className = 'w-6 h-6', blink = true }) => (
  <svg viewBox="0 0 100 115" className={`${className} fill-none stroke-current`} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M 20 94 L 20 56 C 20 26, 33 14, 50 14 C 67 14, 80 26, 80 56 L 80 94 L 70 84 L 60 94 L 50 84 L 40 94 L 30 84 Z" />
    <g className={blink ? 'ai-ghost-eyes' : undefined} style={{ transformOrigin: '50px 50px' }}>
      <circle cx="38" cy="50" r="5" fill="currentColor" stroke="none" />
      <circle cx="62" cy="50" r="5" fill="currentColor" stroke="none" />
    </g>
  </svg>
);
