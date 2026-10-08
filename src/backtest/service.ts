// Backtest service used by the page: a one-at-a-time job queue in front of the engine worker.
// The page only sends settings and receives results, so the same contract works with a server-side engine.
import BacktestWorker from './engine.worker?worker&inline';
import { CancelledError, performJob } from './job';
import { BacktestSettings, JobOutput } from './types';

interface Job {
  id: string;
  settings: BacktestSettings;
  onProgress: (p: number) => void;
  resolve: (o: JobOutput) => void;
  reject: (e: Error) => void;
  signal?: AbortSignal;
}

let worker: Worker | null = null;
let workerBroken = false;
const queue: Job[] = [];
let running: Job | null = null;

function getWorker(): Worker | null {
  if (workerBroken) return null;
  if (!worker) {
    try { worker = new BacktestWorker(); } catch { workerBroken = true; return null; }
  }
  return worker;
}

function finish(job: Job) {
  if (running === job) running = null;
  pump();
}

function startInWorker(w: Worker, job: Job) {
  const onAbort = () => {
    w.terminate(); worker = null; // stop the worker mid-run
    job.reject(new CancelledError());
    finish(job);
  };
  job.signal?.addEventListener('abort', onAbort, { once: true });
  w.onmessage = (e: MessageEvent) => {
    const m = e.data as { id: string; type: string; p?: number; output?: JobOutput; message?: string };
    if (m.id !== job.id) return;
    if (m.type === 'progress') job.onProgress(m.p ?? 0);
    else {
      job.signal?.removeEventListener('abort', onAbort);
      if (m.type === 'done' && m.output) job.resolve(m.output); else job.reject(new Error(m.message || 'The backtest failed.'));
      finish(job);
    }
  };
  w.onerror = () => {
    // Worker could not load (e.g. blocked by the host page): run this job on the main thread instead.
    job.signal?.removeEventListener('abort', onAbort);
    workerBroken = true; worker = null;
    startInPage(job);
  };
  w.postMessage({ id: job.id, settings: job.settings });
}

function startInPage(job: Job) {
  performJob(job.settings, {
    onProgress: job.onProgress,
    cancelled: () => !!job.signal?.aborted,
    yieldEvery: () => new Promise((r) => setTimeout(r, 0)),
  }).then(job.resolve, job.reject).finally(() => finish(job));
}

function pump() {
  if (running || !queue.length) return;
  const job = queue.shift()!;
  if (job.signal?.aborted) { job.reject(new CancelledError()); pump(); return; }
  running = job;
  const w = getWorker();
  if (w) startInWorker(w, job); else startInPage(job);
}

export function runBacktest(settings: BacktestSettings, opts: { onProgress?: (p: number) => void; signal?: AbortSignal } = {}): Promise<JobOutput> {
  return new Promise((resolve, reject) => {
    queue.push({ id: `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, settings, onProgress: opts.onProgress || (() => {}), resolve, reject, signal: opts.signal });
    pump();
  });
}

export { CancelledError };
