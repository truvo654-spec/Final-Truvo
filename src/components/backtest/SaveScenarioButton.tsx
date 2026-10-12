import React from 'react';
import {Check,Save} from 'lucide-react';

export const SaveScenarioButton:React.FC<{name:string;saved:boolean;onSave:()=>void;label?:boolean}>=({name,saved,onSave,label=false})=>{
  const Icon=saved?Check:Save;
  return <button type="button" disabled={saved} aria-label={saved?`${name} saved to Saved runs`:`Save ${name} to Saved runs`} title={saved?'Saved to Saved runs':'Save this scenario and results to Saved runs'} onClick={onSave} className={`inline-flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold normal-case tracking-normal ${saved?'border-emerald-200 bg-emerald-50 text-emerald-700':'border-slate-200 bg-white text-[#5338ec] hover:bg-[#F5F2FF]'}`}><Icon className="w-4 h-4" aria-hidden/>{label&&(saved?'Saved':'Save scenario')}</button>;
};
