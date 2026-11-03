import React from 'react';
import { Loader2, Play } from 'lucide-react';
import type { BacktestRun } from '../../backtest/store';
import type { DashboardQuickOption } from './dashboardQuickRun';
import { btnPrimary, btnSecondary, inputCls } from './ui';
import {BACKTEST_ENGINE_VERSION} from '../../backtest/config';

export function DashboardRunPrompt({ run, options, bookId, onBook, onRun, onEdit, running, progress, onCancel, hiddenResults, onClear }: {
  run?: BacktestRun; options: DashboardQuickOption[]; bookId: string; onBook: (id: string) => void;
  onRun: () => void; onEdit?:()=>void; running: boolean; progress: number; onCancel?: () => void; hiddenResults: boolean; onClear: () => void;
}) {
  const option = options.find(option => option.bookId === bookId);
  const completed = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const testedEmpty=!!run&&run.engineVersion===BACKTEST_ENGINE_VERSION&&!hiddenResults;
  return <div className="flex min-h-[275px] flex-col items-center justify-center gap-3 px-3 py-7 text-center" aria-busy={running}>
    {running ? <><Loader2 aria-hidden className="h-6 w-6 animate-spin text-[#5338ec]" /><p role="status" className="text-sm font-semibold">Running test… {completed}%</p><progress aria-label="Test progress" max={1} value={progress} className="h-2 w-full max-w-xs accent-[#5338ec]" />{onCancel && <button type="button" className={btnSecondary} onClick={onCancel}>Cancel test</button>}</> : <>
      <p className="text-sm font-semibold">{hiddenResults ? 'No trades match these filters' : run ? 'No trades in this test yet' : 'Run a test to see performance'}</p>
      {!run && options.length > 0 && <label className="w-full max-w-xs text-left text-xs font-semibold">Strategy Book<select aria-label="Strategy Book to test" className={`${inputCls} mt-1`} value={bookId} onChange={event => onBook(event.target.value)}>{options.map(option => <option key={option.bookId} value={option.bookId}>{option.name}</option>)}</select></label>}
      <p className="max-w-md text-xs text-slate-500">{run ? `${run.symbol} · ${run.timeframe} · ${run.from} to ${run.to}` : option?.summary ?? 'Create a strategy book in Strategy Lab to start.'}</p>
      {run?.output.result.zeroTradeReason && !hiddenResults && <p className="max-w-md text-xs text-slate-500">{run.output.result.zeroTradeReason}</p>}
      <div className="flex flex-wrap justify-center gap-2">{hiddenResults?<button type="button" className={btnPrimary} onClick={onClear}>Clear filters</button>:<>{(!testedEmpty||!onEdit)&&<button type="button" className={btnPrimary} disabled={!run && !option} onClick={onRun}><Play size={14} aria-hidden />Run test</button>}{run&&onEdit&&<button type="button" className={testedEmpty?btnPrimary:btnSecondary} onClick={onEdit}>Edit test setup</button>}</>}</div>
      <p className="text-[11px] text-slate-400">{hiddenResults?'Saved results are available · no new test needed':testedEmpty?'No test run used · adjust the period or rules':'Generated sample prices · uses your saved setup'}</p>
    </>}
  </div>;
}
