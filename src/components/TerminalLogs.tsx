import React from "react";
import { Terminal, CheckCircle2, AlertCircle } from "lucide-react";

interface LogEntry {
  id: string;
  time: string;
  type: "info" | "success" | "error" | "warn";
  text: string;
}

interface TerminalLogsProps {
  logs: LogEntry[];
  onClear?: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear }) => {
  if (logs.length === 0) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-900 text-neutral-200 overflow-hidden text-xs font-mono shadow-sm">
      <div className="bg-neutral-800/80 px-4 py-2.5 flex items-center justify-between border-b border-neutral-700/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-300">Live Operation Log</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[11px] text-neutral-400 hover:text-white transition"
          >
            Clear
          </button>
        )}
      </div>
      <div className="p-4 max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
            <span className="text-neutral-500 shrink-0">{log.time}</span>
            <span
              className={
                log.type === "success"
                  ? "text-emerald-400"
                  : log.type === "error"
                  ? "text-rose-400"
                  : log.type === "warn"
                  ? "text-amber-400"
                  : "text-neutral-300"
              }
            >
              {log.type === "success" && "✓ "}
              {log.type === "error" && "✗ "}
              {log.type === "warn" && "▲ "}
              {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
