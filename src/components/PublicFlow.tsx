import React, { useState } from "react";
import { ExternalLink, RefreshCw, Check, Copy, ArrowRight, ShieldCheck } from "lucide-react";

interface PublicFlowProps {
  repo: string;
  isChecking: boolean;
  isPulling: boolean;
  onCheckAndPull: () => void;
}

export const PublicFlow: React.FC<PublicFlowProps> = ({
  repo,
  isChecking,
  isPulling,
  onCheckAndPull,
}) => {
  const [copied, setCopied] = useState(false);
  const settingsUrl = `https://github.com/${repo}/settings`;

  const copyUrl = () => {
    navigator.clipboard.writeText(settingsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 text-base">
              Why did the pull fail initially?
            </h3>
            <p className="text-amber-800 mt-1 leading-relaxed">
              GitHub hides private repositories behind a standard <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">404 Not Found</code> error for unauthenticated requests. Since this cloud environment cannot access private repositories without permission, making the repository public takes just 15 seconds and allows immediate pulling.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Step-by-step instructions
        </h3>

        <div className="grid gap-3">
          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900">
                Open the repository settings page on GitHub
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Go to <span className="font-mono text-neutral-700">{settingsUrl}</span>
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={settingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
                >
                  Open Settings in GitHub
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={copyUrl}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600 transition"
                  title="Copy settings URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium text-neutral-900">
                Scroll to the bottom to the Danger Zone
              </p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Click <strong className="text-neutral-700 font-semibold">Change visibility</strong> &rarr; select <strong className="text-neutral-700 font-semibold">Make public</strong> &rarr; confirm with your GitHub password or 2FA.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl border border-neutral-200 bg-white">
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium text-neutral-900">
                Click the button below to pull and launch
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                The importer will fetch all files, install npm dependencies, and start your live app automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onCheckAndPull}
          disabled={isChecking || isPulling}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking || isPulling ? "animate-spin" : ""}`} />
          {isPulling
            ? "Pulling repository & building..."
            : isChecking
            ? "Checking repository status..."
            : "I've made it public — Check & Pull Now"}
          {!isChecking && !isPulling && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
