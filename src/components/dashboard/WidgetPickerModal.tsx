import React from 'react';
import { X, ChevronDown, ArrowRight, Gem, TrendingUp, TrendingDown } from 'lucide-react';
import { WidgetType, WidgetSize } from '../../types/dashboardWidgets';

interface WidgetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget: (type: WidgetType, size: WidgetSize) => void;
  currentlyUsedTypes: WidgetType[];
}

export const WidgetPickerModal: React.FC<WidgetPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectWidget,
  currentlyUsedTypes,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="widget-picker-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-indigo-100 relative flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header matching image New (3).png */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#5945F1]">
              Dashboard Widgets
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Add the widgets you actually need, or dump the ones that don't match your vibe.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-7">
          {/* ════════════ 1. MOST RECENT SIGNAL ════════════ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Most Recent Signal<span className="text-[#FD02B0]">.</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                3 Sizes: Size 1, 2, 3
              </span>
            </div>

            {/* Sizes Previews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* SIZE 1 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="font-extrabold text-xs text-[#0b1c30]">
                    Most Recent Signals<span className="text-[#FD02B0]">.</span>
                  </div>
                  {/* Signal Item 1 */}
                  <div className="flex items-center justify-between gap-1 text-[10px] bg-slate-50 p-1.5 rounded-lg">
                    <span className="font-bold">EUR/USD</span>
                    <span className="text-emerald-600 font-bold font-mono">+0.33%</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#CAEB0E] text-slate-900 font-bold text-[9px]">Buy</span>
                  </div>
                  {/* Signal Item 2 */}
                  <div className="flex items-center justify-between gap-1 text-[10px] bg-slate-50 p-1.5 rounded-lg">
                    <span className="font-bold">BTC/USD</span>
                    <span className="text-[9px] text-slate-400">Levels only</span>
                    <span className="px-1.5 py-0.5 rounded border border-[#FD02B0] text-[#FD02B0] font-bold text-[9px]">Plans</span>
                  </div>
                  {/* Signal Item 3 */}
                  <div className="flex items-center justify-between gap-1 text-[10px] bg-slate-50 p-1.5 rounded-lg">
                    <span className="font-bold">S&P 500</span>
                    <span className="text-[#5945F1] font-bold font-mono">-0.11%</span>
                    <span className="px-1.5 py-0.5 rounded bg-[#5945F1] text-white font-bold text-[9px]">Sell</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 1</span>
                  <button
                    onClick={() => {
                      onSelectWidget('most-recent-signals', 1);
                      onClose();
                    }}
                    className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* SIZE 2 */}
              <div className="col-span-1 md:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-3 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-xs text-[#0b1c30]">
                      Most Recent Signals<span className="text-[#FD02B0]">.</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 border border-slate-200 rounded-md px-1.5 py-0.5">
                      <span>Forex</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold">EUR/USD</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#CAEB0E] text-slate-900 font-bold text-[9px]">Buy</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">TP: 1.0920 • SL: 1.0840</div>
                      <div className="text-[9px] font-bold text-emerald-600">70% Confidence</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold">GOOGL</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#5945F1] text-white font-bold text-[9px]">Sell</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">TP: 172.50 • SL: 178.00</div>
                      <div className="text-[9px] font-bold text-[#5945F1]">74% Confidence</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 2</span>
                  <button
                    onClick={() => {
                      onSelectWidget('most-recent-signals', 2);
                      onClose();
                    }}
                    className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* SIZE 3 Full Width */}
            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition-all">
              <div className="space-y-1 max-w-md">
                <div className="font-extrabold text-sm text-[#0b1c30]">
                  Most Recent Signals<span className="text-[#FD02B0]">.</span>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time signals, tailored to you. Spot opportunities and execute instantly.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-[#5945F1]">
                    Forex & Crypto
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Updated every 5 mins</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500">Size 3 (Full Row)</span>
                <button
                  onClick={() => {
                    onSelectWidget('most-recent-signals', 3);
                    onClose();
                  }}
                  className="px-5 py-1.5 rounded-full bg-[#5945F1] text-white hover:bg-[#4836d9] font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* ════════════ 2. LEVEL CARD ════════════ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Level Card<span className="text-[#FD02B0]">.</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                2 Sizes: Size 1, 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Size 1 */}
              <div className="rounded-2xl border border-slate-200/90 bg-[#5945F1] p-4 text-white flex flex-col justify-between shadow-2xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-lg tracking-tight">Rookie</div>
                    <div className="text-xs font-extrabold text-[#CAEB0E]">Don't Stop Now</div>
                  </div>
                  <div className="w-full bg-white/25 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-[#FD02B0] rounded-full w-1/3" />
                  </div>
                  <div className="text-[10px] text-white/80">Next level at 50 Points • +10% Cashback</div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/20">
                  <span className="text-xs font-bold text-white/90">Size 1</span>
                  {currentlyUsedTypes.includes('level-card') ? (
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs">
                      In-Use
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectWidget('level-card', 1);
                        onClose();
                      }}
                      className="px-4 py-1 rounded-full bg-white text-[#5945F1] hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Size 2 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-sm text-[#0b1c30]">
                      Level & Milestone Tracker
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#5945F1]/10 text-[#5945F1] font-bold text-[10px]">
                      Rookie Tier
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-slate-400">Current Boost</div>
                      <div className="font-bold text-[#5945F1] text-xs">+10% Rebate</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <div className="text-slate-400">Signals Access</div>
                      <div className="font-bold text-emerald-600 text-xs">High Confidence</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 2</span>
                  <button
                    onClick={() => {
                      onSelectWidget('level-card', 2);
                      onClose();
                    }}
                    className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ 3. SAVED CALCULATORS ════════════ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Saved Calculator<span className="text-[#FD02B0]">.</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                2 Sizes: Size 1, 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Size 1 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-xs text-[#0b1c30]">
                      Saved Calculators<span className="text-[#FD02B0]">.</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">2 of 2 Slots</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px]">
                    <div className="font-bold text-slate-800">Forex Result 1</div>
                    <span className="text-slate-400 text-[9px]">Forex • Nov 28</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px]">
                    <div className="font-bold text-slate-800">High-Risk 50:1</div>
                    <span className="text-slate-400 text-[9px]">Forex • Nov 28</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 1</span>
                  {currentlyUsedTypes.includes('saved-calculators') ? (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                      In-Use
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectWidget('saved-calculators', 1);
                        onClose();
                      }}
                      className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Size 2 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-xs text-[#0b1c30]">
                      Quick Trading Calculators
                    </div>
                    <span className="text-[10px] text-[#5945F1] font-bold">10 Tools Available</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-lg bg-indigo-50/60 font-medium text-slate-700 flex items-center justify-between">
                      <span>Pip Value</span>
                      <span className="text-[#5945F1] font-bold">→</span>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50/60 font-medium text-slate-700 flex items-center justify-between">
                      <span>Leverage & Margin</span>
                      <span className="text-[#5945F1] font-bold">→</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 2</span>
                  <button
                    onClick={() => {
                      onSelectWidget('saved-calculators', 2);
                      onClose();
                    }}
                    className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ 4. WINNING SIGNALS ════════════ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Winning Signals<span className="text-[#FD02B0]">.</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                2 Sizes: Size 1, 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="font-extrabold text-xs text-[#0b1c30]">
                    Your Winning Signals<span className="text-[#FD02B0]">.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-1.5 bg-slate-50 rounded-lg flex justify-between font-medium">
                      <span>🇪🇺 EUR/USD</span>
                      <span className="text-emerald-600 font-bold">+0.33%</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-lg flex justify-between font-medium">
                      <span>🇬🇧 Dow</span>
                      <span className="text-[#5945F1] font-bold">-0.11%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 1</span>
                  <button
                    onClick={() => {
                      onSelectWidget('winning-signals', 1);
                      onClose();
                    }}
                    className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 flex flex-col justify-between shadow-2xs hover:border-indigo-300 transition-all">
                <div className="space-y-2">
                  <div className="font-extrabold text-xs text-[#0b1c30]">
                    Tops Earning Points<span className="text-[#FD02B0]">.</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between items-center py-0.5">
                      <span>EUR/USD</span>
                      <span className="font-bold text-[#5945F1]">50 pts</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span>XAU/USD</span>
                      <span className="font-bold text-[#5945F1]">20 pts</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Size 1</span>
                  <button
                    onClick={() => {
                      onSelectWidget('tops-earning-points', 1);
                      onClose();
                    }}
                    className="px-4 py-1 rounded-full border border-indigo-200 text-[#5945F1] hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════ 5. CONNECTED BROKERS ════════════ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30]">
                Connected Brokers Hub<span className="text-[#FD02B0]">.</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                Full Width
              </span>
            </div>

            <div className="rounded-2xl border border-pink-200 bg-gradient-to-r from-purple-50/40 via-white to-pink-50/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="font-extrabold text-sm text-[#5945F1]">
                  More Connected Brokers. More Opportunities.
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  XM, HFM, Exness, Pepperstone, IC Markets, FxPro and more.
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectWidget('connected-brokers', 3);
                  onClose();
                }}
                className="px-5 py-1.5 rounded-full bg-[#FD02B0] text-white hover:bg-[#e0029c] font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Add Broker Row
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
