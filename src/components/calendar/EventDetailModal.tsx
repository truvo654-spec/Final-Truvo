import React, { useState } from 'react';
import { X, ArrowLeft, Bell, Star, Sparkles, Lock, Newspaper, Activity, Megaphone } from 'lucide-react';
import { EconomicEvent, EventNote } from '../../types';
import { NEWS_ARTICLES } from '../../data/newsData';
import { EconomicIndicatorDetailPage } from './EconomicIndicatorDetailPage';

const CATEGORY_DETAIL_COPY: Record<string, { unit: string; forecast: string; consensus: string; alerts: string; description: string }> = {
  Holiday: {
    unit: 'Market holiday',
    forecast: 'There is no numerical forecast for a market holiday. Use the closure to plan liquidity, spreads, and execution windows for the related currency.',
    consensus: 'Holiday schedules are confirmed by the relevant market calendar rather than an analyst consensus. Check the local session and reopening time before trading.',
    alerts: 'Set a reminder before the closure so you can review open positions, reduce unexpected overnight exposure, and prepare for thinner liquidity in the related currency.',
    description: 'A market holiday changes trading hours and can reduce liquidity or widen spreads. This event is linked to the local calendar for the selected country and instrument.',
  },
  PMI: {
    unit: 'Index points',
    forecast: 'PMI forecasts reflect expectations for private-sector activity. Readings above 50 generally indicate expansion, while readings below 50 indicate contraction.',
    consensus: 'Compare the release with the consensus estimate and the previous month. A surprise in new orders, employment, or prices can move the related currency quickly.',
    alerts: 'Set an alert before the release to review the expected direction, the previous reading, and any connected currency or market signal.',
    description: 'A Purchasing Managers’ Index tracks business activity, orders, employment, and prices across the manufacturing and services economy.',
  },
  Inflation: {
    unit: 'Price change',
    forecast: 'Inflation forecasts help traders assess the path of purchasing power and the likely direction of interest-rate expectations.',
    consensus: 'The most important comparison is actual versus forecast, followed by the trend from the previous release. A surprise can reprice bonds and currencies.',
    alerts: 'Set an alert before the release to review rate-sensitive positions and prepare for volatility around the publication time.',
    description: 'Inflation releases measure changes in consumer or producer prices and are closely watched for their effect on monetary-policy expectations.',
  },
  Employment: {
    unit: 'Labour indicator',
    forecast: 'Employment forecasts summarize expected changes in jobs, wages, participation, or unemployment conditions.',
    consensus: 'Compare the actual result with the estimate and watch revisions to the previous period for confirmation of the labour-market trend.',
    alerts: 'Set an alert before the release to review currency exposure and potential volatility in rate-sensitive instruments.',
    description: 'Employment data shows the health of the labour market and can influence household spending, inflation, and central-bank decisions.',
  },
};

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
  onNavigateToInstrument?: (symbol: string) => void;
  onUpgradePrompt: () => void;
  onShowToast: (msg: string) => void;
  fullPage?: boolean;
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
  onNavigateToInstrument,
  onUpgradePrompt,
  onShowToast,
  fullPage = false,
}) => {
  const [noteDraft, setNoteDraft] = useState('');
  const [brokerTagDraft, setBrokerTagDraft] = useState('');
  const [detailTab, setDetailTab] = useState<'Summary' | 'Forecast' | 'Consensus' | 'Alerts'>('Summary');
  const categoryCopy = CATEGORY_DETAIL_COPY[event.category] || {
    unit: 'Release value',
    forecast: `Forecast context for this ${event.category.toLowerCase()} release is based on the published estimate and the previous reading.`,
    consensus: `Compare the actual value with the forecast and previous ${event.category.toLowerCase()} reading to identify a meaningful surprise.`,
    alerts: `Set a reminder before this ${event.category.toLowerCase()} release to review related positions and market conditions.`,
    description: `This ${event.category.toLowerCase()} release provides scheduled information about ${event.country} conditions and may affect the ${event.currency} market.`,
  };
  const relatedArticle = event.relatedArticleId ? NEWS_ARTICLES.find((a) => a.id === event.relatedArticleId) : null;

  if (fullPage) {
    return (
      <EconomicIndicatorDetailPage
        event={event}
        whenLabel={whenLabel}
        isWatched={isWatched}
        alertLeadTime={alertLeadTime}
        hasAiAccess={hasAiAccess}
        onClose={onClose}
        onToggleWatch={onToggleWatch}
        onSetAlert={onSetAlert}
        onNavigateToArticle={onNavigateToArticle}
        onNavigateToInstrument={onNavigateToInstrument}
        onUpgradePrompt={onUpgradePrompt}
        onShowToast={onShowToast}
      />
    );
  }

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
    <div className={fullPage ? 'fixed inset-0 z-50 overflow-y-auto bg-[#f8fafc]' : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs'}>
      <div className={fullPage ? 'min-h-full w-full bg-[#f8fafc] text-[#0b1c30]' : 'bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-[#0b1c30] shadow-2xl p-6 relative'}>
        {fullPage && <div className="h-16 border-b border-[#e2e8f0] bg-white"><div className="max-w-5xl mx-auto flex h-full items-center px-4 sm:px-8"><button onClick={onClose} className="flex items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#5338ec]"><ArrowLeft className="w-4 h-4" /> Back to Economic Calendar</button></div></div>}
        <div className={fullPage ? 'max-w-5xl mx-auto px-4 py-8 sm:px-8 sm:py-10' : ''}>
        <button
          onClick={onClose}
          className={fullPage ? 'hidden' : 'absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors'}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0b1c30] leading-snug mb-1">
          {event.title}
        </h2>
        <p className="text-sm text-[#474556] mb-5">
          {event.countryFlag} {event.country} · {whenLabel}
        </p>

        {fullPage && (
          <>
            <div className="flex items-center gap-6 border-b border-[#e2e8f0] mb-5 overflow-x-auto">
              {(['Summary', 'Forecast', 'Consensus', 'Alerts'] as const).map((tab) => (
                <button key={tab} onClick={() => setDetailTab(tab)} className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 ${detailTab === tab ? 'text-[#5338ec] border-[#5338ec]' : 'text-[#475569] border-transparent hover:text-[#5338ec]'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {detailTab === 'Forecast' && <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 mb-5 text-sm leading-relaxed text-[#475569]">{categoryCopy.forecast}</div>}
            {detailTab === 'Consensus' && <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 mb-5 text-sm leading-relaxed text-[#475569]">{categoryCopy.consensus}</div>}
            {detailTab === 'Alerts' && <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 mb-5 text-sm leading-relaxed text-[#475569]">{categoryCopy.alerts}</div>}

            <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden mb-5">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-sm font-bold text-[#0b1c30]">Historical data</p>
                <div className="flex items-center gap-3 text-xs font-semibold text-[#475569]"><span className="text-[#5338ec]">6M</span><span>1Y</span><span>2Y</span><span>3Y</span><button className="border-l border-[#e2e8f0] pl-3 hover:text-[#5338ec]">Compare +</button></div>
              </div>
              <div className="h-44 px-4 py-5">
                {trendPoints && trendPoints.length > 1 ? (
                  <div className="flex h-full items-end gap-2 sm:gap-4">
                    {trendPoints.map((value, index) => {
                      const min = Math.min(...trendPoints);
                      const max = Math.max(...trendPoints);
                      const height = `${Math.max(12, ((value - min) / (max - min || 1)) * 82 + 18)}%`;
                      return <div key={`${value}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className="w-full max-w-10 rounded-t-sm bg-[#5b84bd]" style={{ height }} title={`${value}`} /><span className="text-[10px] text-slate-400">{index === trendPoints.length - 1 ? 'Now' : `-${trendPoints.length - index - 1}`}</span></div>;
                    })}
                  </div>
                ) : <div className="flex h-full items-center justify-center text-sm text-slate-400">Historical series is not available for this event.</div>}
              </div>
            </div>
          </>
        )}

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

        {fullPage && (
          <div className="grid gap-5 lg:grid-cols-2 mb-5">
            <section className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
              <h3 className="border-b border-[#e2e8f0] px-4 py-3 text-sm font-bold text-[#0b1c30]">About this indicator</h3>
              <p className="p-4 text-sm leading-relaxed text-[#475569]">{categoryCopy.description}</p>
            </section>
            <section className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
              <h3 className="border-b border-[#e2e8f0] px-4 py-3 text-sm font-bold text-[#0b1c30]">Related indicators</h3>
              <div className="divide-y divide-[#f1f5f9]">{[`${event.country} ${event.category}`, `${event.assetClass} market`, `${event.currency} outlook`].map((item) => <button key={item} onClick={() => onNavigateToInstrument?.(event.currency)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[#334155] hover:bg-[#f8fafc]">{item}<span className="text-[#5338ec]">›</span></button>)}</div>
            </section>
          </div>
        )}

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
    </div>
  );
};
