import React from 'react';
import { Sparkles } from 'lucide-react';

export const DemoPage: React.FC = () => {
  return (
    <div className="w-full min-h-[70vh] bg-[#fafbfe] text-[#0b1c30] flex flex-col items-center justify-center text-center px-4 sm:px-8">
      <div className="w-14 h-14 rounded-2xl bg-[#5945F1]/10 flex items-center justify-center mb-6">
        <Sparkles className="w-7 h-7 text-[#5945F1]" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
        Demo
      </h1>
      <p className="text-slate-600 max-w-md">
        This is a placeholder Demo page. Content coming soon.
      </p>
    </div>
  );
};
