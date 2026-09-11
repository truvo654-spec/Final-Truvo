import React from 'react';
import { X } from 'lucide-react';

export type EarningModalType = 'quest' | 'mission' | 'trade';

export interface EarningRewardData {
  type: EarningModalType;
  title?: string;
  subtitle?: string;
  credits?: number;
  points?: number;
  questName?: string;
  brokerName?: string;
}

interface EarningRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: EarningRewardData | null;
}

/* ─────────────────────────────────────────────────────────────
 * Graphic 1: Quest Complete (Open Gift Box with Coins & Swirl Sphere)
 * Matches 'Broker List; Desktop; Quest Complete Modal.png'
 * ───────────────────────────────────────────────────────────── */
function QuestBoxGiftGraphic() {
  return (
    <div className="w-48 h-44 mx-auto relative flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 200 180" className="w-full h-full overflow-visible">
        <defs>
          {/* Sphere Gradients */}
          <radialGradient id="questSphereGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="45%" stopColor="#5945F1" />
            <stop offset="100%" stopColor="#311da4" />
          </radialGradient>

          {/* Box Gradients */}
          <linearGradient id="boxFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="boxSideGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id="boxLidLime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="60%" stopColor="#CAEB0E" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>

          {/* Coin Gradients */}
          <linearGradient id="coinGradSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="coinGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="60%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          {/* Shadow */}
          <filter id="boxDropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3730a3" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* ── Background Floating Confetti Dots ── */}
        <circle cx="28" cy="58" r="4.5" fill="#CAEB0E" />
        <circle cx="48" cy="30" r="3.5" fill="#CAEB0E" />
        <circle cx="68" cy="65" r="4" fill="#FD02B0" />
        <circle cx="150" cy="30" r="3.5" fill="#FD02B0" />
        <circle cx="172" cy="72" r="3" fill="#CAEB0E" />
        <circle cx="140" cy="70" r="4.5" fill="#3b82f6" />
        <circle cx="160" cy="115" r="3.5" fill="#CAEB0E" />
        <circle cx="34" cy="100" r="4" fill="#CAEB0E" />

        {/* ── The 3D Open Purple Box ── */}
        <g filter="url(#boxDropShadow)">
          {/* Back Interior Shadow */}
          <polygon points="56,80 144,80 134,102 66,102" fill="#1e1b4b" opacity="0.8" />

          {/* Main Box Body (Front trapezoid) */}
          <polygon points="66,102 134,102 128,150 72,150" fill="url(#boxFrontGrad)" />
          {/* Left Bevel */}
          <polygon points="56,80 66,102 72,150 64,142 52,90" fill="url(#boxSideGrad)" />
          {/* Right Bevel */}
          <polygon points="144,80 134,102 128,150 136,142 148,90" fill="url(#boxSideGrad)" opacity="0.85" />

          {/* Neon Lime Flaps (Open Lids) */}
          {/* Left Flap */}
          <polygon points="56,80 66,102 44,98 34,78" fill="url(#boxLidLime)" stroke="#ecfccb" strokeWidth="0.8" />
          {/* Front Left Flap */}
          <polygon points="66,102 100,102 96,118 64,112" fill="url(#boxLidLime)" stroke="#ecfccb" strokeWidth="0.8" />
          {/* Front Right Flap */}
          <polygon points="100,102 134,102 136,112 104,118" fill="url(#boxLidLime)" stroke="#ecfccb" strokeWidth="0.8" />
          {/* Right Flap */}
          <polygon points="134,102 144,80 166,78 156,98" fill="url(#boxLidLime)" stroke="#ecfccb" strokeWidth="0.8" />
        </g>

        {/* ── Bursting Metallic Coins ── */}
        {/* Left Floating Coin */}
        <g transform="translate(68, 70) rotate(-22)">
          <ellipse cx="14" cy="8" rx="14" ry="7" fill="url(#coinGradSilver)" />
          <path d="M 0,8 C 0,11 6,14 14,14 C 22,14 28,11 28,8 L 28,11 C 28,14 22,17 14,17 C 6,17 0,14 0,11 Z" fill="#94a3b8" />
          <ellipse cx="14" cy="8" rx="11" ry="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        </g>

        {/* Right Floating Coin */}
        <g transform="translate(108, 64) rotate(18)">
          <ellipse cx="14" cy="8" rx="14" ry="7" fill="url(#coinGradBlue)" />
          <path d="M 0,8 C 0,11 6,14 14,14 C 22,14 28,11 28,8 L 28,11 C 28,14 22,17 14,17 C 6,17 0,14 0,11 Z" fill="#4338ca" />
          <ellipse cx="14" cy="8" rx="11" ry="5" fill="#a5b4fc" stroke="#c7d2fe" strokeWidth="0.5" />
        </g>

        {/* Center Lower Coin */}
        <g transform="translate(86, 82) rotate(4)">
          <ellipse cx="14" cy="8" rx="14" ry="7" fill="url(#coinGradSilver)" />
          <path d="M 0,8 C 0,11 6,14 14,14 C 22,14 28,11 28,8 L 28,11 C 28,14 22,17 14,17 C 6,17 0,14 0,11 Z" fill="#64748b" />
          <ellipse cx="14" cy="8" rx="11" ry="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
        </g>

        {/* ── Large 3D MarketSyde Sphere Badge with Swirl 'm' ── */}
        <g filter="url(#boxDropShadow)">
          <circle cx="100" cy="38" r="26" fill="url(#questSphereGrad)" />
          {/* Specular Highlight Ring on Sphere */}
          <ellipse cx="94" cy="24" rx="10" ry="5" fill="#ffffff" opacity="0.35" transform="rotate(-15 94 24)" />

          {/* White Swirl 'm' glyph */}
          <path
            d="M 88 42 C 88 34, 91.5 30, 95 30 C 98 30, 100 33, 101.5 36.5 C 103 33, 105 30, 108 30 C 111 30, 113 34, 113 40"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Swirl dot */}
          <circle cx="113" cy="41" r="2.6" fill="#bef226" />
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Graphic 2: Mission Complete (3D Sphere with Crown & Magenta Ribbon)
 * Matches 'Broker List_Landing Page.png'
 * ───────────────────────────────────────────────────────────── */
function MissionCrownSphereGraphic() {
  return (
    <div className="w-48 h-44 mx-auto relative flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 200 180" className="w-full h-full overflow-visible">
        <defs>
          {/* Sphere Gradient */}
          <radialGradient id="missionSphereGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="45%" stopColor="#5945F1" />
            <stop offset="100%" stopColor="#311da4" />
          </radialGradient>

          {/* Crown Gradient */}
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="40%" stopColor="#CAEB0E" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>

          {/* Ribbon Gradients */}
          <linearGradient id="ribbonFrontGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff45cd" />
            <stop offset="50%" stopColor="#FD02B0" />
            <stop offset="100%" stopColor="#d90296" />
          </linearGradient>
          <linearGradient id="ribbonFoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9d016d" />
            <stop offset="100%" stopColor="#650047" />
          </linearGradient>

          {/* Drop Shadow */}
          <filter id="missionShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#4338ca" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ── Background Floating Confetti Dots ── */}
        <circle cx="34" cy="50" r="4.5" fill="#FD02B0" />
        <circle cx="50" cy="26" r="3.5" fill="#CAEB0E" />
        <circle cx="148" cy="28" r="4" fill="#5945F1" />
        <circle cx="168" cy="62" r="3.5" fill="#CAEB0E" />
        <circle cx="142" cy="98" r="4" fill="#FD02B0" />
        <circle cx="110" cy="118" r="4.5" fill="#CAEB0E" />
        <circle cx="68" cy="110" r="3.5" fill="#3b82f6" />

        {/* ── Golden-Lime Crown on Top ── */}
        <g filter="url(#missionShadow)">
          <path
            d="M 82,46
               L 80,24
               L 90,34
               L 100,18
               L 110,34
               L 120,24
               L 118,46
               Z"
            fill="url(#crownGrad)"
            stroke="#ecfccb"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Crown Jewels (Purple dots on peaks) */}
          <circle cx="80" cy="24" r="2.8" fill="#5945F1" />
          <circle cx="100" cy="18" r="3.2" fill="#5945F1" />
          <circle cx="120" cy="24" r="2.8" fill="#5945F1" />
          {/* Crown band rim */}
          <path d="M 82,44 C 94,48 106,48 118,44" stroke="#84cc16" strokeWidth="2.5" fill="none" />
        </g>

        {/* ── The Large 3D Purple Sphere ── */}
        <g filter="url(#missionShadow)">
          <circle cx="100" cy="74" r="38" fill="url(#missionSphereGrad)" />
          {/* Specular Highlight */}
          <ellipse cx="90" cy="52" rx="14" ry="7" fill="#ffffff" opacity="0.32" transform="rotate(-15 90 52)" />

          {/* White Swirl 'm' glyph */}
          <path
            d="M 82 78 C 82 66, 87 60, 92 60 C 97 60, 100 65, 102 70 C 104 65, 107 60, 112 60 C 117 60, 120 66, 120 76"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="120.5" cy="77" r="3.6" fill="#bef226" />
        </g>

        {/* ── Flowing Magenta Ribbon Across Sphere ── */}
        <g filter="url(#missionShadow)">
          {/* Left Ribbon Back Fold */}
          <polygon points="46,88 56,76 56,96 46,104" fill="url(#ribbonFoldGrad)" />
          {/* Left Ribbon Split End */}
          <path d="M 46,76 L 24,78 L 34,90 L 22,102 L 46,98 Z" fill="#d90296" />

          {/* Right Ribbon Back Fold */}
          <polygon points="154,88 144,76 144,96 154,104" fill="url(#ribbonFoldGrad)" />
          {/* Right Ribbon Split End */}
          <path d="M 154,76 L 176,78 L 166,90 L 178,102 L 154,98 Z" fill="#d90296" />

          {/* Front Curved Ribbon Swath across bottom of sphere */}
          <path
            d="M 54,82 
               C 80,102 120,102 146,82 
               L 146,96 
               C 120,116 80,116 54,96 
               Z"
            fill="url(#ribbonFrontGrad)"
            stroke="#ff9ae1"
            strokeWidth="0.8"
          />
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Graphic 3: Completing a Trade / Look who's active!
 * (3D Ascending Bars, Upward Arrow, Gemstone & Sphere)
 * Matches 'Broker List_Landing Page (1).png'
 * ───────────────────────────────────────────────────────────── */
function TradeActiveChartGraphic() {
  return (
    <div className="w-48 h-44 mx-auto relative flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 200 180" className="w-full h-full overflow-visible">
        <defs>
          {/* Bar Chart Gradients */}
          <linearGradient id="barBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="barIndigo" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="barMagenta" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff45cd" />
            <stop offset="100%" stopColor="#FD02B0" />
          </linearGradient>

          {/* Upward Arrow Gradient */}
          <linearGradient id="chartArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FD02B0" />
            <stop offset="100%" stopColor="#ff70d9" />
          </linearGradient>

          {/* Gemstone Facet Gradients */}
          <linearGradient id="gemFacetLime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ecfccb" />
            <stop offset="100%" stopColor="#bef264" />
          </linearGradient>
          <linearGradient id="gemFacetPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Sphere Gradient */}
          <radialGradient id="tradeSphereGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="45%" stopColor="#5945F1" />
            <stop offset="100%" stopColor="#311da4" />
          </radialGradient>

          <filter id="tradeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4338ca" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* ── Background Confetti Dots ── */}
        <circle cx="30" cy="52" r="4" fill="#CAEB0E" />
        <circle cx="48" cy="30" r="3" fill="#FD02B0" />
        <circle cx="140" cy="24" r="3.5" fill="#FD02B0" />
        <circle cx="168" cy="58" r="4.5" fill="#CAEB0E" />
        <circle cx="138" cy="115" r="4" fill="#CAEB0E" />
        <circle cx="118" cy="132" r="3.5" fill="#FD02B0" />

        {/* ── 3D Ascending Candlestick / Cylinder Bars (Left) ── */}
        <g filter="url(#tradeShadow)">
          {/* Bar 1 (Shortest - Cyan/Blue) */}
          <rect x="52" y="80" width="16" height="34" rx="8" fill="url(#barBlue)" />
          {/* Bar 2 (Medium - Indigo) */}
          <rect x="74" y="58" width="16" height="56" rx="8" fill="url(#barIndigo)" />
          {/* Bar 3 (Tallest - Blue/Indigo) */}
          <rect x="96" y="44" width="16" height="70" rx="8" fill="url(#barBlue)" />

          {/* Dynamic Upward Trend Arrow */}
          <path
            d="M 54,95 L 82,65 L 94,76 L 124,36"
            fill="none"
            stroke="url(#chartArrowGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow Head */}
          <path
            d="M 112,34 L 126,34 L 126,48 Z"
            fill="#FD02B0"
          />
        </g>

        {/* ── Multi-faceted 3D Diamond / Gemstone (Right) ── */}
        <g transform="translate(132, 60)" filter="url(#tradeShadow)">
          <polygon points="16,0 34,0 44,14 34,14 16,14 6,14" fill="#e0e7ff" />
          <polygon points="16,0 34,0 28,14 18,14" fill="url(#gemFacetLime)" />
          <polygon points="6,14 16,0 18,14" fill="url(#gemFacetPurple)" />
          <polygon points="34,0 44,14 28,14" fill="#f472b6" />
          {/* Bottom Cone */}
          <polygon points="6,14 18,14 25,36" fill="#6366f1" />
          <polygon points="18,14 28,14 25,36" fill="#4f46e5" />
          <polygon points="28,14 44,14 25,36" fill="#d946ef" />
          {/* Highlight */}
          <polygon points="18,3 28,3 25,10 19,10" fill="#ffffff" opacity="0.65" />
        </g>

        {/* ── Central Floating 3D MarketSyde Sphere ── */}
        <g filter="url(#tradeShadow)">
          <circle cx="94" cy="106" r="30" fill="url(#tradeSphereGrad)" />
          {/* Highlight */}
          <ellipse cx="86" cy="88" rx="10" ry="5" fill="#ffffff" opacity="0.32" transform="rotate(-15 86 88)" />

          {/* White Swirl 'm' glyph */}
          <path
            d="M 80 110 C 80 100, 84 95, 88 95 C 92 95, 94 99, 96 103 C 98 99, 100 95, 104 95 C 108 95, 110 100, 110 108"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="110.5" cy="109" r="2.8" fill="#bef226" />
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Main Modal Component: EarningRewardModal
 * Seamlessly handles Quest, Mission, and Trade completions!
 * ───────────────────────────────────────────────────────────── */
export const EarningRewardModal: React.FC<EarningRewardModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  const type = data.type;
  const credits = data.credits ?? 5;
  const points = data.points ?? 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-2xl relative text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* ── 1. MODAL VARIANT: Quest Complete ── */}
        {type === 'quest' && (
          <div className="space-y-4 pt-1">
            <QuestBoxGiftGraphic />

            <div className="space-y-2">
              <h3 className="text-3xl sm:text-[34px] font-extrabold font-display text-[#FD02B0] tracking-tight leading-none">
                Yay!
              </h3>
              <p className="text-sm sm:text-base text-slate-700 font-normal leading-relaxed">
                You earned{' '}
                <strong className="text-[#FD02B0] font-bold">
                  {credits} credits
                </strong>{' '}
                for {data.questName || 'login in today'}.
                <br />
                <span className="text-slate-500 font-normal">
                  {data.subtitle || 'Way to go!'}
                </span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-3.5 px-6 rounded-2xl bg-[#5945F1] hover:bg-[#492CED] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Nice!
            </button>
          </div>
        )}

        {/* ── 2. MODAL VARIANT: Mission Complete ── */}
        {type === 'mission' && (
          <div className="space-y-4 pt-1">
            <MissionCrownSphereGraphic />

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-[28px] font-extrabold font-display tracking-tight leading-none">
                <span className="text-[#5945F1]">Mission </span>
                <span className="text-[#FD02B0]">Complete!</span>
              </h3>
              <div className="text-sm sm:text-base text-slate-600 space-y-0.5">
                <p>Wow, look at you go.</p>
                <p>
                  <strong className="text-[#FD02B0] font-bold">
                    {credits} credits
                  </strong>
                  {points > 0 && (
                    <>
                      {' '}and{' '}
                      <strong className="text-[#5945F1] font-bold">
                        {points} points
                      </strong>
                    </>
                  )}{' '}
                  are now in your balance!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-3.5 px-6 rounded-2xl bg-[#5945F1] hover:bg-[#492CED] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Nice!
            </button>
          </div>
        )}

        {/* ── 3. MODAL VARIANT: Completing a Trade (Look who's active!) ── */}
        {type === 'trade' && (
          <div className="space-y-4 pt-1">
            <TradeActiveChartGraphic />

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-[28px] font-extrabold font-display tracking-tight leading-none">
                <span className="text-[#5945F1]">Look who's </span>
                <span className="text-[#FD02B0]">active!</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Trading with your broker just
                <br />
                got you{' '}
                <strong className="text-[#5945F1] font-bold">
                  {points} Points
                </strong>{' '}
                and{' '}
                <strong className="text-[#FD02B0] font-bold">
                  {credits} Credits
                </strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-3.5 px-6 rounded-2xl bg-[#5945F1] hover:bg-[#492CED] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Nice!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
