import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Move, Layers, Grid, Save } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onDontShowAgain,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [clickedAddMock, setClickedAddMock] = useState(false);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Add a widget — Tap an empty space and pick a size that fits.',
      subtitle: 'Click any dashed slot to open the widget library and choose from calculators, signals, and charts.',
      renderGraphic: () => (
        <div className="w-full flex flex-col items-center justify-center p-4">
          <div
            onClick={() => setClickedAddMock(!clickedAddMock)}
            className={`w-64 h-40 sm:w-80 sm:h-48 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 relative select-none ${
              clickedAddMock
                ? 'border-[#5945F1] bg-indigo-50/70 shadow-md'
                : 'border-indigo-200/90 bg-white/80 hover:border-indigo-400 hover:bg-indigo-50/40'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100/90 text-[#5945F1] flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-[#5945F1]">Move or Add Widget Here</span>

            {/* Simulated Hand Cursor Pointing */}
            <div className="absolute top-[42%] left-[50%] translate-x-1 translate-y-1 pointer-events-none animate-bounce">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 drop-shadow-md text-slate-800 fill-white stroke-slate-900"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 11V7a2 2 0 0 0-4 0v4H8a2 2 0 0 0-2 2v2a8 8 0 0 0 16 0v-2a2 2 0 0 0-2-2h-6Z" />
                <path d="M10 7V4a2 2 0 0 1 4 0v3" />
              </svg>
            </div>

            {clickedAddMock && (
              <div className="absolute -bottom-3 bg-[#FD02B0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md animate-fade-in">
                Widget Picker Opens!
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Move widgets — Drag and drop cards anywhere with the grip handles.',
      subtitle: 'Grab the grip handle on the left of any card or row to reposition it anywhere on your dashboard.',
      renderGraphic: () => (
        <div className="w-full flex items-center justify-center gap-3 p-4">
          <div className="w-36 sm:w-44 h-36 rounded-2xl bg-white border-2 border-[#5945F1] p-3 shadow-md relative flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5945F1]">
                <span className="w-2 h-2 rounded-full bg-[#FD02B0]" />
                Signals
              </div>
              <div className="p-1 rounded bg-indigo-50 text-[#5945F1] cursor-grab">
                <Move className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-1.5 py-2">
              <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
              <div className="h-2 w-1/2 bg-emerald-300 rounded-full" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Dragging to slot...</span>
          </div>

          <div className="text-[#5945F1] animate-pulse">
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </div>

          <div className="w-36 sm:w-44 h-36 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 flex flex-col items-center justify-center p-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#5945F1] flex items-center justify-center mb-1">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-[#5945F1] text-center">
              Drop target
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Pick the right size — Select Size 1, Size 2, or Size 3 widgets to fit.',
      subtitle: 'Size 1 fits 1 slot, Size 2 spans 2 slots, and Size 3 covers the full dashboard row.',
      renderGraphic: () => (
        <div className="w-full flex flex-col gap-2 p-2 max-w-sm mx-auto">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border-2 border-indigo-400 bg-white p-2 text-center shadow-2xs">
              <div className="text-[10px] font-bold text-[#5945F1]">Size 1</div>
              <div className="text-[9px] text-slate-400">1 column</div>
            </div>
            <div className="col-span-2 rounded-xl border-2 border-purple-400 bg-purple-50/60 p-2 text-center shadow-2xs">
              <div className="text-[10px] font-bold text-purple-700">Size 2</div>
              <div className="text-[9px] text-purple-500">2 columns wide</div>
            </div>
          </div>
          <div className="w-full rounded-xl border-2 border-pink-400 bg-pink-50/60 p-2 text-center shadow-2xs">
            <div className="text-[10px] font-bold text-pink-700">Size 3 (Full Row)</div>
            <div className="text-[9px] text-pink-500">3 columns banner</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Add new rows — Create more rows to fit more calculators & stats.',
      subtitle: 'Click "Add More Row" at any time to generate an extra 3-slot container ready for customization.',
      renderGraphic: () => (
        <div className="w-full flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#5945F1] shadow-2xs">
            <div className="w-5 h-4 border border-indigo-400 rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-1 bg-indigo-400 rounded-xs" />
            </div>
            <span>+ Add More Row</span>
          </div>
          <div className="my-2 text-[#FD02B0] animate-bounce">
            ↓
          </div>
          <div className="w-full max-w-xs grid grid-cols-3 gap-1.5">
            <div className="h-10 rounded-lg border border-dashed border-indigo-300 bg-white/80 flex items-center justify-center text-[10px] text-indigo-400 font-bold">+</div>
            <div className="h-10 rounded-lg border border-dashed border-indigo-300 bg-white/80 flex items-center justify-center text-[10px] text-indigo-400 font-bold">+</div>
            <div className="h-10 rounded-lg border border-dashed border-indigo-300 bg-white/80 flex items-center justify-center text-[10px] text-indigo-400 font-bold">+</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Save your vibe — Click Save to persist your layout, or Discard to revert.',
      subtitle: 'Your layout is automatically preserved in your browser profile. Reset to default whenever you want.',
      renderGraphic: () => (
        <div className="w-full flex flex-col items-center justify-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 shadow-2xs">
              ✕ Discard
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-xs font-medium text-[#5945F1] shadow-2xs">
              ↺ Reset
            </div>
            <div className="px-4 py-1.5 rounded-lg bg-[#5945F1] text-xs font-bold text-white shadow-xs flex items-center gap-1">
              <Save className="w-3.5 h-3.5" />
              <span>Save 💾</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ✓ Ready to customize!
          </span>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      onDontShowAgain(true);
    }
    onClose();
  };

  const active = slides[currentSlide];

  return (
    <div
      id="how-it-works-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-indigo-100 relative space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header matching image */}
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#5945F1]">
            How It Works?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Here are the rules so you won't get confused styling your dasboard
          </p>
        </div>

        {/* Main Graphic Box matching image */}
        <div className="w-full rounded-2xl bg-[#F8F9FE] border border-indigo-100/80 p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
          {active.renderGraphic()}
        </div>

        {/* Caption Text matching image */}
        <div className="text-center px-4">
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            {active.title}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-normal">
            {active.subtitle}
          </p>
        </div>

        {/* Pagination Dots & Arrows matching image */}
        <div className="flex items-center justify-center gap-3 text-slate-400 pt-1">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`p-1 transition-colors cursor-pointer ${
              currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-2.5 h-2.5 bg-[#5945F1]'
                    : 'w-2 h-2 bg-indigo-200 hover:bg-indigo-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer: Checkbox & Skip Button matching image */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#5945F1] focus:ring-[#5945F1] accent-[#5945F1] cursor-pointer"
            />
            <span>Don't show again</span>
          </label>

          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-xl border border-indigo-200/90 text-[#5945F1] hover:bg-indigo-50/70 font-semibold text-xs transition-colors cursor-pointer active:scale-95 shadow-2xs"
          >
            {currentSlide === slides.length - 1 ? 'Got It' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
};
