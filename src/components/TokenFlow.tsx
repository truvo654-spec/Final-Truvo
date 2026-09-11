import React, { useState } from "react";
import { Key, ExternalLink, ArrowRight, RefreshCw, Lock, ShieldAlert } from "lucide-react";

interface TokenFlowProps {
  repo: string;
  isPulling: boolean;
  onPullWithToken: (token: string) => void;
}

export const TokenFlow: React.FC<TokenFlowProps> = ({
  repo,
  isPulling,
  onPullWithToken,
}) => {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    onPullWithToken(token.trim());
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-base">
              Keep repository private using a Personal Access Token
            </h3>
            <p className="text-neutral-600 mt-1 leading-relaxed">
              If your repository contains private code or secrets that must remain private, you can authenticate via a temporary GitHub Personal Access Token (PAT) with read permission.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            GitHub Personal Access Token (PAT)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Key className="w-4 h-4" />
            </div>
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
              className="w-full pl-10 pr-24 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              {showToken ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            The token is used only once in-memory to clone your code, and is never saved to disk.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-600 space-y-2">
          <p className="font-medium text-neutral-800">How to create a quick read-only token in GitHub:</p>
          <ol className="list-decimal list-inside space-y-1 text-neutral-600">
            <li>Go to GitHub &rarr; Settings &rarr; Developer settings &rarr; Personal access tokens.</li>
            <li>Select <strong>Tokens (classic)</strong> &rarr; Generate new token (classic tokens work immediately without repository selection restrictions).</li>
            <li>Give it a note like <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">ai-studio-import</code> and check the <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">repo</code> checkbox.</li>
            <li>Copy and paste the generated <code className="font-mono text-neutral-800">ghp_...</code> token above.</li>
          </ol>
          <div className="pt-1">
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=Bearbearbear-Import"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-neutral-900 font-semibold hover:underline"
            >
              1-Click Classic Token Generator (Pre-filled repo scope)
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <strong>Note on Fine-Grained Tokens (github_pat_...):</strong> GitHub defaults them to <em>&ldquo;Public Repositories (read-only)&rdquo;</em>. If using a fine-grained token for a private repo, you must select <em>&ldquo;All repositories&rdquo;</em> (or select this repo) and grant <em>&ldquo;Contents: Read-only&rdquo;</em>.
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={!token.trim() || isPulling}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2.5 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isPulling ? "animate-spin" : ""}`} />
            {isPulling ? "Authenticating & Pulling..." : "Pull Repository with Token"}
            {!isPulling && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};
