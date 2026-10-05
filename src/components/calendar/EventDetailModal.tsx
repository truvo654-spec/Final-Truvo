import React, { useState } from 'react';
import { X, Bell, Star, Sparkles, Lock, Newspaper, Activity, Megaphone } from 'lucide-react';
import { EconomicEvent, EventNote } from '../../types';
import { NEWS_ARTICLES } from '../../data/newsData';
import { IMPACT_STYLES } from '../../data/economicCalendarData';

interface EventDetailModalProps {
  event: EconomicEvent;
  whenLabel: string;
  isWatched: boolean;
  alertLeadTime: number | null;
  hasAiAccess: boolean;
  isAdvisor?: boolean;
  isBroker?: boolean;
  notes: EventNote[];
  onClose: () => void;
  onToggleWatch: () => void;
  onSetAlert: (leadTimeMinutes: number | null) => void;
  onNavigateToArticle?: (articleId: string) => void;
  onNavigateToSignal?: (ticker: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
}

const ALERT_OPTIONS = [
  { label: 'No alert', value: null },
  { label: '15 min before', value: 15 },
  { label: '30 min before', value: 30 },
  { label: '1 hour before', value: 60 },
];

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  whenLabel,
  isWatched,
  alertLeadTime,
  hasAiAccess,
  isAdvisor = false,
  isBroker = false,
  notes,
  onClose,
  onToggleWatch,
  onSetAlert,
  onNavigateToArticle,
  onNavigateToSignal,
  onUpgradePrompt,
  onShowToast,
}) => {
  const [noteDraft, setNoteDraft] = useState('');
  const [brokerTagDraft, setBrokerTagDraft] = useState('');
  const impactStyle = IMPACT_STYLES[event.impact];
  const relatedArticle = event.relatedArticleId ? NEWS_ARTICLES.find((a) => a.id === event.relatedArticleId) : null;

  const trendPoints = event.historicalTrend;
  const sparkline = (() => {
    if (!trendPoints || trendPoints.length < 2) return null;
    const min = Math.min(...trendPoints);
    const max = Math.max(...trendPoints);
    const range = max - min || 1;
    const w = 240;
    const h = 56;
    const step = w / (trendPoints.length - 1);
    const pts = trendPoints
      .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
      .join(' ');
    return { pts, w, h };
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-[#0b1c30] shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${impactStyle.chip}`}>
            {event.impact} impact
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#EEF0FE] text-[#5338ec] text-xs font-semibold">
            {event.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
            {event.assetClass}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0b1c30] leading-snug mb-1">
          {event.title}
        </h2>
        <p className="text-sm text-[#474556] mb-5">
          {event.countryFlag} {event.country} · {whenLabel}
        </p>

        {(event.forecast || event.previous || event.actual) && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Previous</p>
              <p className="text-sm font-bold text-[#0b1c30]">{event.previous || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Forecast</p>
              <p className="text-sm font-bold text-[#0b1c30]">{event.forecast || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Actual</p>
              <p className={`text-sm font-bold ${event.actual ? 'text-[#5338ec]' : 'text-[#0b1c30]'}`}>
                {event.actual || 'Pending'}
              </p>
            </div>
          </div>
        )}

        {sparkline && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Historical trend</p>
            <svg viewBox={`0 0 ${sparkline.w} ${sparkline.h}`} className="w-full h-14">
              <polyline points={sparkline.pts} fill="none" stroke="#5338ec" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <p className="text-sm text-[#0b1c30] leading-relaxed mb-5">{event.summary}</p>

        {/* Actions: watch + alert */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={onToggleWatch}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              isWatched ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-slate-200 text-[#0b1c30] hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
            {isWatched ? 'Watching' : 'Add to Watched Events'}
          </button>

          <div className="flex items-center gap-1.5 px-1">
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={alertLeadTime ?? ''}
              onChange={(e) => onSetAlert(e.target.value ? Number(e.target.value) : null)}
              className="text-xs font-semibold text-[#0b1c30] border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            >
              {ALERT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Related content */}
        {(relatedArticle || event.relatedSignalTicker) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {relatedArticle && (
              <button
                onClick={() => onNavigateToArticle?.(relatedArticle.id)}
                className="text-left bg-[#F8F7FF] border border-[#ECEEFA] rounded-xl p-3 hover:border-[#5338ec] transition-colors"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#5338ec] mb-1">
                  <Newspaper className="w-3.5 h-3.5" /> Related analysis
                </p>
                <p className="text-sm font-semibold text-[#0b1c30] leading-snug line-clamp-2">
                  {relatedArticle.headline}
                </p>
              </button>
            )}
            {event.relatedSignalTicker && (
              <button
                onClick={() => onNavigateToSignal?.(event.relatedSignalTicker!)}
                className="text-left bg-[#F0FCB1]/40 border border-[#E6FA76] rounded-xl p-3 hover:border-[#A9C40B] transition-colors"
              >
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#667705] mb-1">
                  <Activity className="w-3.5 h-3.5" /> Connected signal
                </p>
                <p className="text-sm font-semibold text-[#0b1c30]">{event.relatedSignalTicker}</p>
              </button>
            )}
          </div>
        )}

        {/* AI predictive model */}
        <div className="rounded-xl border border-[#e2e8f0] p-4 mb-5 relative overflow-hidden">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#5338ec] mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI predicted reaction
          </p>
          {hasAiAccess ? (
            <p className="text-sm text-[#0b1c30] leading-relaxed">
              {event.aiPrediction || 'No predictive read available for this event yet.'}
            </p>
          ) : (
            <>
              <p className="text-sm text-[#0b1c30] leading-relaxed blur-[3px] select-none">
                {event.aiPrediction || 'Model estimates a directional move with moderate confidence based on historical reaction patterns.'}
              </p>
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                <button
                  onClick={onUpgradePrompt}
                  className="flex items-center gap-1.5 bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> Unlock AI Assistant
                </button>
              </div>
            </>
          )}
        </div>

        {/* Advisor notes */}
        {isAdvisor && (
          <div className="rounded-xl border border-[#e2e8f0] p-4 mb-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">
              Notes visible to your group
            </p>
            <div className="space-y-2 mb-3">
              {notes.map((n) => (
                <p key={n.id} className="text-sm text-[#0b1c30] bg-slate-50 rounded-lg px-3 py-2">
                  {n.text}
                </p>
              ))}
            </div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={2}
              placeholder="Add context or trade prep for your members before this event..."
              className="w-full resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
            <button
              onClick={() => {
                if (!noteDraft.trim()) return;
                onShowToast('Note added — your group will see this event with your context.');
                setNoteDraft('');
              }}
              className="bg-[#5338ec] hover:bg-[#4326d8] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Save note &amp; notify group
            </button>
          </div>
        )}

        {/* Broker tools */}
        {isBroker && (
          <div className="rounded-xl border border-[#e2e8f0] p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#474556] mb-2">
              <Megaphone className="w-3.5 h-3.5" /> Broker tools
            </p>
            <input
              value={brokerTagDraft}
              onChange={(e) => setBrokerTagDraft(e.target.value)}
              placeholder="Tag this event with a message for your traders..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#5338ec]/30"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (!brokerTagDraft.trim()) return;
                  onShowToast('Tag saved to this event.');
                  setBrokerTagDraft('');
                }}
                className="bg-[#0b1c30] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Save tag
              </button>
              <span className="text-xs text-[#474556]">142 traders watching this event</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
