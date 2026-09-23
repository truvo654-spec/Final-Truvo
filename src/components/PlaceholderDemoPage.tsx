import React from 'react';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

export interface PlaceholderDemoPageProps {
  title: string;
  description?: string;
  onNavigateHome: () => void;
  onNavigateToDemo1?: () => void;
}

/**
 * Lightweight placeholder view for demo variants that don't have a
 * fully built experience yet. Keeps the same visual language
 * (brand purple #5945F1, rounded cards) as the rest of the platform
 * so it can be swapped out for real content later without a redesign.
 */
export const PlaceholderDemoPage: React.FC<PlaceholderDemoPageProps> = ({
  title,
  description = 'This demo variant is still being put together. Check back soon.',
  onNavigateHome,
  onNavigateToDemo1,
}) => {
  return (
    <div className="min-h-[calc(100vh-220px)] flex flex-col items-center justify-center py-16 sm:py-20 px-4 sm:px-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-2xs">
        <Sparkles className="w-7 h-7 text-[#5945F1] stroke-[1.75]" />
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-[38px] font-bold text-[#0b1c30] tracking-tight leading-tight">
        {title}
      </h1>

      <p className="text-slate-600 text-sm sm:text-[15px] max-w-md mx-auto mt-4 leading-relaxed font-normal">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {onNavigateToDemo1 && (
          <button
            onClick={onNavigateToDemo1}
            className="px-5 py-2.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50/50 text-[#5945F1] active:scale-98 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            <span>Back to Demo 1</span>
          </button>
        )}
        <button
          onClick={onNavigateHome}
          className="px-5 py-2.5 rounded-xl bg-[#5945F1] hover:bg-[#4834e0] active:scale-98 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Home className="w-4 h-4 stroke-[2.2]" />
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default PlaceholderDemoPage;
