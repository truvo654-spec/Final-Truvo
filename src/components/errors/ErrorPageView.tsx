import React, { useState } from 'react';
import { Home, RotateCcw, CloudOff, Unplug } from 'lucide-react';
import { useTone } from '../../context/ToneContext';

export type ErrorType = '404' | '500' | '503';

export interface ErrorPageProps {
  type?: ErrorType;
  onNavigateHome: () => void;
  onNavigateToTab?: (tab: string) => void;
  onRefresh?: () => void;
}

export const ErrorPageView: React.FC<ErrorPageProps> = ({
  type = '404',
  onNavigateHome,
  onNavigateToTab,
  onRefresh,
}) => {
  const [currentType, setCurrentType] = useState<ErrorType>(type);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const { copy } = useTone();

  // Sync internal state if prop changes
  React.useEffect(() => {
    setCurrentType(type);
  }, [type]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshMessage(
      currentType === '500'
        ? 'Restarting worker threads and checking services...'
        : 'Pinging MarketSyde infrastructure...'
    );

    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshMessage('Systems responding normally. Ready to reconnect!');
      setTimeout(() => setRefreshMessage(null), 3500);
      if (onRefresh) {
        onRefresh();
      }
    }, 1200);
  };

  const handleTypeChange = (newType: ErrorType) => {
    setCurrentType(newType);
    if (onNavigateToTab) {
      onNavigateToTab(newType);
    }
  };

  return (
    <div
      id={`error-page-${currentType}`}
      className="min-h-[calc(100vh-220px)] flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 text-center select-none"
    >
      {/* ─── DEMO SWITCHER PILL (Convenient toggle for reviewing all 3 screens) ─── */}
      <div className="mb-10 inline-flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-500 shadow-2xs">
        <span className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Preview
        </span>
        <button
          onClick={() => handleTypeChange('404')}
          className={`px-3 py-1 rounded-full font-medium transition-all text-xs cursor-pointer ${
            currentType === '404'
              ? 'bg-[#5945F1] text-white shadow-xs font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          404 Not Found
        </button>
        <button
          onClick={() => handleTypeChange('500')}
          className={`px-3 py-1 rounded-full font-medium transition-all text-xs cursor-pointer ${
            currentType === '500'
              ? 'bg-[#5945F1] text-white shadow-xs font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          500 Server Error
        </button>
        <button
          onClick={() => handleTypeChange('503')}
          className={`px-3 py-1 rounded-full font-medium transition-all text-xs cursor-pointer ${
            currentType === '503'
              ? 'bg-[#5945F1] text-white shadow-xs font-semibold'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          503 Maintenance
        </button>
      </div>

      {/* ─── ILLUSTRATIONS ─── */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        {currentType === '404' && (
          /* MarketSyde Mascot Ghost (Exact replica of 404 Page_Member_Desktop.png) */
          <div className="relative group">
            <svg
              viewBox="0 0 100 115"
              className="w-24 h-28 sm:w-28 sm:h-32 text-[#5945F1] fill-none stroke-current transition-transform duration-300 group-hover:scale-105"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Ghost Body: Round dome top, vertical sides, 4 down-tips and 3 inverted-V notches at hem */}
              <path d="M 20 94 L 20 56 C 20 26, 33 14, 50 14 C 67 14, 80 26, 80 56 L 80 94 L 70 84 L 60 94 L 50 84 L 40 94 L 30 84 Z" />
              {/* Ghost Eyes: Two solid round circles */}
              <circle cx="38" cy="50" r="3.6" fill="#5945F1" stroke="none" />
              <circle cx="62" cy="50" r="3.6" fill="#5945F1" stroke="none" />
            </svg>
          </div>
        )}

        {currentType === '500' && (
          /* Struck-through Cloud (Exact replica of 500 Page_Member_Desktop.png) */
          <div className="relative group">
            <CloudOff
              className="w-24 h-24 sm:w-28 sm:h-28 text-[#5945F1] stroke-[2.3] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {currentType === '503' && (
          /* Disconnected Electrical Plug & Socket (Exact replica of 503 Page_Member_Desktop.png) */
          <div className="relative group">
            <Unplug
              className="w-24 h-24 sm:w-28 sm:h-28 text-[#5945F1] stroke-[2.3] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* ─── HEADLINES (With Signature Pink Dot) ─── */}
      <h1 className="text-2xl sm:text-3xl md:text-[38px] lg:text-[40px] font-bold text-[#5945F1] tracking-tight leading-tight">
        {currentType === '404' && (
          <>
            {copy.errorPages['404'].headline.replace(/\.$/, '')}
            <span className="text-[#ec4899]">.</span>
          </>
        )}
        {currentType === '500' && (
          <>
            {copy.errorPages['500'].headline.replace(/\.$/, '')}
            <span className="text-[#ec4899]">.</span>
          </>
        )}
        {currentType === '503' && (
          <>
            {copy.errorPages['503'].headline.replace(/\.$/, '')}
            <span className="text-[#ec4899]">.</span>
          </>
        )}
      </h1>

      {/* ─── DESCRIPTIONS ─── */}
      <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-[15px] max-w-xl mx-auto mt-4 leading-relaxed font-normal">
        {currentType === '404' && <p>{copy.errorPages['404'].description}</p>}
        {currentType === '500' && <p>{copy.errorPages['500'].description}</p>}
        {currentType === '503' && <p>{copy.errorPages['503'].description}</p>}
      </div>

      {/* ─── ACTION BUTTONS ─── */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
        {currentType === '404' && (
          /* Take Me Home button with Home icon */
          <button
            id="error-404-take-me-home-btn"
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] active:scale-98 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>{copy.errorPages['404'].cta}</span>
            <Home className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}

        {currentType === '500' && (
          /* Two Buttons: Try Refreshing & Escape to Homepage */
          <>
            <button
              id="error-500-try-refreshing-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-[#150d30] hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-[#5945F1] dark:text-[#a594fd] active:scale-98 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
            >
              <span>{copy.errorPages['500'].ctaPrimary}</span>
              <RotateCcw className={`w-4 h-4 stroke-[2.2] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="error-500-escape-homepage-btn"
              onClick={onNavigateHome}
              className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] active:scale-98 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>{copy.errorPages['500'].ctaSecondary}</span>
              <Home className="w-4 h-4 stroke-[2.2]" />
            </button>
          </>
        )}

        {currentType === '503' && (
          /* Check Again button with Rotate icon */
          <button
            id="error-503-check-again-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] active:scale-98 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            <span>{copy.errorPages['503'].cta}</span>
            <RotateCcw className={`w-4 h-4 stroke-[2.2] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* ─── LIVE REFRESH TOAST / FEEDBACK ─── */}
      {refreshMessage && (
        <div className="mt-5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {refreshMessage}
        </div>
      )}
    </div>
  );
};

export default ErrorPageView;
