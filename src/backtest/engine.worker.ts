// Runs backtest jobs off the page's main thread. Messages:
//   in:  { id, settings }
//   out: { id, type: 'progress', p } | { id, type: 'done', output } | { id, type: 'error', message }
import { performJob } from './job';
import type { BacktestSettings } from './types';

const ctx = self as unknown as { onmessage: ((e: MessageEvent) => void) | null; postMessage: (m: unknown) => void };

ctx.onmessage = async (e: MessageEvent<{ id: string; settings: BacktestSettings }>) => {
  const { id, settings } = e.data;
  let last = 0;
  try {
    const output = await performJob(settings, {
      onProgress: (p) => { if (p - last >= 0.02 || p === 1) { last = p; ctx.postMessage({ id, type: 'progress', p }); } },
    });
    ctx.postMessage({ id, type: 'done', output });
  } catch (err) {
    ctx.postMessage({ id, type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
