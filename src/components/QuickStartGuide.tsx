import React from 'react';
import { QuickStep } from '../types';
import { Building2, Link2, TrendingUp, DollarSign, Check, ChevronRight } from 'lucide-react';

interface QuickStartGuideProps {
  steps: QuickStep[];
  onStepClick: (stepIndex: number) => void;
  onToggleStep?: (stepIndex: number) => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  steps,
  onStepClick,
  onToggleStep,
}) => {
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Building2 className="w-4 h-4 text-white" />;
      case 1:
        return <Link2 className="w-4 h-4 text-white" />;
      case 2:
        return <TrendingUp className="w-4 h-4 text-white" />;
      case 3:
        return <DollarSign className="w-4 h-4 text-white" />;
      default:
        return <Check className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div
      id="quick-start-guide"
      className="bg-white rounded-2xl p-5 sm:p-6 border-[1.5px] border-dashed border-[#cbd5e1] shadow-sm relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5338ec]"></span>
            <h3 className="font-display text-lg font-bold text-[#0b1c30] tracking-tight">
              Quick Start Guide
            </h3>
          </div>
          <p className="text-xs text-[#474556] mt-0.5">
            Follow 4 seamless steps to activate automated institutional cashback on every trade
          </p>
        </div>

        <div className="text-xs font-semibold text-[#5338ec] bg-[#5338ec]/10 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
          <span>{steps.filter((s) => s.completed).length} of 4 completed</span>
        </div>
      </div>

      {/* 4-Stage Horizontal Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((item, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <div key={item.step} className="relative flex flex-col justify-between group">
              {/* Connector line for desktop between steps */}
              {!isLast && (
                <div className="hidden lg:block absolute top-[18px] left-[42px] right-[-14px] h-[1.5px] border-t border-dashed border-[#cbd5e1] pointer-events-none z-0" />
              )}

              <div>
                {/* Badge + Step Number */}
                <div className="flex items-center gap-3 mb-2.5 relative z-10">
                  <div
                    onClick={() => onToggleStep && onToggleStep(idx)}
                    className={`w-[36px] h-[36px] rounded-[0.5rem] flex items-center justify-center shrink-0 shadow-sm transition-transform cursor-pointer ${
                      item.completed
                        ? 'bg-[#5338ec] ring-4 ring-[#5338ec]/15'
                        : 'bg-slate-300 group-hover:bg-[#5338ec]/70'
                    }`}
                    title={item.completed ? 'Completed (Click to toggle)' : 'Mark as complete'}
                  >
                    {item.completed ? (
                      <Check className="w-4 h-4 text-[#c6f831] stroke-[3]" />
                    ) : (
                      getStepIcon(idx)
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Step 0{item.step}
                    </span>
                    <h4 className="font-display font-semibold text-sm text-[#0b1c30] leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#474556] leading-relaxed pl-[48px] sm:pl-0">
                  {item.desc}
                </p>
              </div>

              {/* Action link */}
              <div className="pt-3 pl-[48px] sm:pl-0">
                <button
                  onClick={() => onStepClick(idx)}
                  className="text-xs font-bold text-[#5338ec] hover:text-[#4338ca] flex items-center gap-1 group-hover:gap-1.5 transition-all"
                >
                  <span>{item.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
