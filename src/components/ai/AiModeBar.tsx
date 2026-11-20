import React from 'react';
import { Lock } from 'lucide-react';
import { AI_POLICY, aiStatus, type AiLockCode, type AiMode, type AiStatus } from './aiEntitlement';
import './aiModeBar.css';

/** A message shown under the mode switch: why something is locked, or what happened. */
export interface AiNotice {
  code: AiLockCode | 'info';
  text: string;
  /** An ordinary navigation the person can still take (costs nothing). */
  cta?: { label: string; run: () => void };
}

const isLock = (code: AiNotice['code']) =>
  code === 'exhausted' || code === 'basic-locked' || code === 'advanced-locked' || code === 'advanced-exhausted';

const Banner: React.FC<{
  tone: 'lock' | 'info';
  text: string;
  onMember?: () => void;
  onBasic?: () => void;
  cta?: { label: string; run: () => void };
  onDismiss?: () => void;
}> = ({ tone, text, onMember, onBasic, cta, onDismiss }) => (
  <div className={`msai-banner ${tone}`} role="status">
    <span className="msai-grow">{text}</span>
    {onBasic && <button type="button" className="msai-btn sec" onClick={onBasic}>Use Basic</button>}
    {onMember && <button type="button" className="msai-btn" onClick={onMember}>View membership</button>}
    {cta && <button type="button" className="msai-btn sec" onClick={cta.run}>{cta.label}</button>}
    {onDismiss && <button type="button" className="msai-btn ghost" aria-label="Dismiss this message" onClick={onDismiss}>✕</button>}
  </div>
);

/**
 * Basic / Advanced switch with both allowances, plus the one notice that
 * matters right now. Inspecting a mode is free; only sending is gated.
 */
export const AiModeBar: React.FC<{
  mode: AiMode;
  setMode: (m: AiMode) => void;
  level: number;
  stat: AiStatus;
  notice: AiNotice | null;
  onDismiss: () => void;
  onMember?: () => void;
}> = ({ mode, setMode, level, stat, notice, onDismiss, onMember }) => {
  const advLocked = level < AI_POLICY.advancedMinLevel;
  const adv = aiStatus(level, 'advanced');

  const basicLine = stat.locked
    ? 'Basic · locked until Level 2'
    : stat.dayPass
      ? `Basic · day pass active · ${stat.used} used today`
      : stat.unlimited
        ? 'Basic · unlimited (fair use)'
        : `Basic · ${stat.remaining} of ${stat.limit} left · ${stat.used} used`;
  const advLine = advLocked
    ? 'Advanced · locked until Level 3'
    : adv.unlimited
      ? 'Advanced · unlimited (fair use)'
      : `Advanced · ${adv.remaining} of ${adv.limit} left · ${adv.used} used`;

  let banner: React.ReactNode = null;
  if (notice) {
    const lock = isLock(notice.code);
    banner = (
      <Banner
        tone={lock ? 'lock' : 'info'}
        text={notice.text}
        onMember={lock ? onMember : undefined}
        onBasic={(notice.code === 'advanced-locked' || notice.code === 'advanced-exhausted') && !stat.locked && stat.remaining !== 0 ? () => setMode('basic') : undefined}
        cta={notice.cta}
        onDismiss={onDismiss}
      />
    );
  } else if (mode === 'advanced' && advLocked) {
    banner = <Banner tone="lock" text="Advanced AI unlocks at Level 3. Your draft and history are kept." onMember={onMember} onBasic={!stat.locked ? () => setMode('basic') : undefined} />;
  } else if (mode === 'advanced') {
    if (adv.remaining === 0) {
      banner = (
        <Banner
          tone="lock"
          text={`You have used ${adv.used} of ${adv.limit} Advanced prompts today. 0 left. ${adv.resetLabel}. Your draft and history are kept.`}
          onMember={onMember}
          onBasic={!stat.locked && stat.remaining !== 0 ? () => setMode('basic') : undefined}
        />
      );
    }
  } else if (stat.locked) {
    banner = <Banner tone="lock" text={`MarketSyde AI is not included at Level ${level}. Basic AI unlocks at Level 2. Everything else on this page works as usual.`} onMember={onMember} />;
  } else if (stat.remaining === 0) {
    banner = <Banner tone="lock" text={`You have used ${stat.used} of ${stat.limit} Basic prompts today. 0 left. ${stat.resetLabel}. Your draft and history are kept.`} onMember={onMember} />;
  }

  return (
    <div className="msai-bar">
      <div className="msai-row">
        <div role="radiogroup" aria-label="AI mode" className="msai-seg">
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'basic'}
            onClick={() => setMode('basic')}
            title={stat.locked ? 'Basic AI unlocks at Level 2' : 'Basic: focused explanations and lookups'}
          >
            {(stat.locked ? '🔒 ' : '') + 'Basic'}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === 'advanced'}
            onClick={() => setMode('advanced')}
            title={advLocked ? 'Advanced AI unlocks at Level 3' : 'Advanced: multi-source research'}
          >
            {(advLocked ? '🔒 ' : '') + 'Advanced'}
          </button>
        </div>
        <span className="msai-usage" data-msai-usage>
          <span
            className={`msai-u${mode === 'basic' ? ' on' : ''}`}
            title={stat.locked || stat.unlimited || stat.dayPass ? undefined : stat.resetLabel}
          >
            {basicLine}
          </span>
          <span className={`msai-u${mode === 'advanced' ? ' on' : ''}`} title={advLocked ? 'Advanced AI unlocks at Level 3' : adv.resetLabel}>
            {advLine}
          </span>
        </span>
      </div>
      {banner}
    </div>
  );
};

/** Level 1 on the Summary tab: no fresh personalised summary is generated. */
export const AiLockedSummary: React.FC<{ level: number; tierName: string; onMember?: () => void }> = ({ level, tierName, onMember }) => (
  <div className="msai-locked">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#5945F1] to-[#2a1b7a]" aria-hidden>
      <Lock className="h-6 w-6 text-white/90" />
    </span>
    <h3>AI summaries unlock at Level 2</h3>
    <p>
      Your Level {level} ({tierName}) membership does not include MarketSyde AI, so no personalised summary is
      generated here. The page itself works as usual.
    </p>
    {onMember && <button type="button" className="msai-btn" onClick={onMember}>View membership</button>}
  </div>
);

export interface AiAnswerMeta { mode: AiMode; src?: string; at: string }

/** Where an answer came from, what it covers and what it cost. */
export const AiAnswerDetails: React.FC<{ meta: AiAnswerMeta }> = ({ meta }) => {
  const at = new Date(meta.at);
  const adv = meta.mode === 'advanced';
  return (
    <details className="msai-meta">
      <summary>{`${adv ? 'Advanced answer' : 'Basic answer'} · sources & scope`}</summary>
      <dl>
        <dt>Source</dt><dd>{`${meta.src || 'This page'} (sample data)`}</dd>
        <dt>Account scope</dt><dd>All connected accounts (sample)</dd>
        <dt>Date range</dt><dd>{adv ? 'Last 30 days (sample)' : 'As shown on the page'}</dd>
        <dt>Answered</dt><dd>{`${at.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · ${at.toISOString().slice(11, 16)} UTC`}</dd>
        <dt>Usage</dt><dd>{adv ? '1 Advanced prompt' : '1 Basic prompt'}</dd>
      </dl>
    </details>
  );
};
