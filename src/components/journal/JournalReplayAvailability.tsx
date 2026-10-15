import { JournalHelp } from './JournalHelp';
import React from 'react';
import { PlayCircle, X } from 'lucide-react';
import type { JournalEntry } from '../../types';
import type { JournalPlaybook } from '../../data/journalPlaybooks';
import { DemoReplay } from '../backtest/DemoReplay';
import { TradeReplayModal } from './TradeReplayModal';
import { useDialogFocus } from './useDialogFocus';

// Explicit user-requested demo; it is never presented as custom API or actual trade history.
export function JournalReplayAvailability({ entry, entries = [entry], playbooks = [], returnLabel = 'Return to daily review', recording,onAttachRecording,onRemoveRecording,onClose }: { entry: JournalEntry; entries?: JournalEntry[]; playbooks?: JournalPlaybook[]; returnLabel?:string;recording?:string;onAttachRecording?:(blob:Blob)=>void;onRemoveRecording?:()=>void; onClose: () => void }) {
  const ref = useDialogFocus(onClose);
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1c30]/35 p-4" onClick={ev => ev.target === ev.currentTarget && onClose()}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="journal-api-replay-title" tabIndex={-1} className="w-full max-w-6xl max-h-[94dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-[#f8fafc] shadow-2xl text-[#0b1c30] focus:outline-none">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4"><div><h2 id="journal-api-replay-title" className="text-base font-bold flex items-center gap-2"><PlayCircle size={20} className="text-[#5338ec]"/>Replay log · {entry.symbol}<JournalHelp label="Replay log" /></h2><p className="text-xs text-slate-500 mt-1">{entry.date} · {entry.direction} · {entry.strategy || 'Strategy not recorded'} · recorded setup · generated price comparison</p></div><button aria-label="Close demo replay" onClick={onClose} className="rounded-lg border border-slate-200 p-2"><X size={16}/></button></div>
      <div className="p-4 sm:p-5"><DemoReplay key={entry.id} entries={[entry,...entries.filter(item=>item.id!==entry.id)]} playbooks={playbooks} initialEntryId={entry.id} lockRecordedTrade/>{onAttachRecording&&onRemoveRecording&&<details className="mt-4 rounded-xl border border-slate-200 bg-white"><summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#5338ec]">Trade recording · attach or watch a clip</summary><TradeReplayModal embedded entry={entry} targetRR={playbooks.find(p=>p.name===entry.strategy)?.benchmarkRR??2} recording={recording} onAttach={onAttachRecording} onRemove={onRemoveRecording} onClose={()=>{}}/></details>}<button onClick={onClose} className="mt-4 rounded-lg bg-[#5338ec] px-4 py-2 text-xs font-semibold text-white">{returnLabel}</button></div>
    </div>
  </div>;
}
