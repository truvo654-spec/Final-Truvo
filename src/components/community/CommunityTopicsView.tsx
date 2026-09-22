import React, { useState } from 'react';
import {
  Flame,
  Play,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  Vote,
} from 'lucide-react';
import { CommunityTopic } from '../../types';
import { COMMUNITY_TOPICS } from '../../data/communityData';

interface CommunityTopicsViewProps {
  topics?: CommunityTopic[];
  onAnswerTopic: (topicId: string, answerText: string) => void;
  onShowToast: (msg: string) => void;
}

export const CommunityTopicsView: React.FC<CommunityTopicsViewProps> = ({
  topics = COMMUNITY_TOPICS,
  onAnswerTopic,
  onShowToast,
}) => {
  const [selectedTopicForAnswer, setSelectedTopicForAnswer] = useState<CommunityTopic | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [topicsState, setTopicsState] = useState<CommunityTopic[]>(topics);

  const featuredTopic = topicsState.find((t) => t.featured) || topicsState[0];
  const gridTopics = topicsState.filter((t) => !t.featured);

  const handleOpenAnswer = (topic: CommunityTopic) => {
    setSelectedTopicForAnswer(topic);
    setAnswerInput('');
    setVotedOption(null);
  };

  const handleModalSubmit = () => {
    if (!selectedTopicForAnswer) return;
    if (!answerInput.trim() && !votedOption) {
      onShowToast('Please type an answer or select a thesis option');
      return;
    }

    const submission = votedOption ? `[Voted: ${votedOption}] ${answerInput}` : answerInput;
    onAnswerTopic(selectedTopicForAnswer.id, submission);

    setTopicsState((prev) =>
      prev.map((t) =>
        t.id === selectedTopicForAnswer.id
          ? { ...t, answersCount: t.answersCount + 1, userAnswer: submission }
          : t
      )
    );

    onShowToast('🎉 Answer submitted! +15 Points added for market community contribution');
    setSelectedTopicForAnswer(null);
  };

  return (
    <div className="space-y-6 w-full">
      {/* ─── 1. HERO FEATURED TOPIC ─── */}
      {featuredTopic && (
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 text-[#0b1c30] shadow-xs relative overflow-hidden group hover:border-[#cbd5e1] hover:shadow-sm transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left image thumbnail */}
            <div className="md:col-span-4 relative rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 shadow-inner">
              <img
                src={featuredTopic.image}
                alt={featuredTopic.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                <Flame className="w-3 h-3 fill-current" />
                <span>Hot Discussion</span>
              </div>
            </div>

            {/* Right details */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5338ec] font-bold tracking-wide uppercase">
                  Featured Topic
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-[#474556] font-medium">{featuredTopic.category}</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-display font-bold text-[#0b1c30] leading-snug">
                {featuredTopic.title}
              </h2>

              <div className="flex items-center gap-3 flex-wrap">
                {featuredTopic.tokens.map((tok, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-1 text-xs font-medium"
                  >
                    <span className="text-amber-500 font-bold">₿</span>
                    <span className="text-[#0b1c30] font-semibold">{tok.symbol}</span>
                    <span className="text-emerald-600 font-mono text-[11px] font-semibold">
                      +{tok.change}%
                    </span>
                  </div>
                ))}

                <span className="text-xs text-[#474556] font-mono">
                  {featuredTopic.answersCount} traders answered
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenAnswer(featuredTopic)}
                  className="inline-flex items-center gap-2 bg-[#5338ec] hover:bg-[#4326d8] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Answer ({featuredTopic.answersCount})</span>
                </button>

                <button
                  onClick={() => handleOpenAnswer(featuredTopic)}
                  className="inline-flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Check it out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. 2-COLUMN GRID OF DISCUSSION TOPICS ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0b1c30] font-display">All Hot Topics</h3>
          <span className="text-xs text-[#474556] font-mono">
            {gridTopics.length} Active Debates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gridTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-[#0b1c30] shadow-xs hover:border-[#cbd5e1] hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[11px] font-semibold text-[#5338ec] bg-[#ede9fe] px-2.5 py-0.5 rounded-md">
                    {topic.category || 'Trading Strategy'}
                  </span>
                  <span className="text-xs text-[#474556] font-mono">
                    {topic.answersCount} Answers
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-[#0b1c30] leading-snug mb-3 line-clamp-2">
                  {topic.title}
                </h4>

                {/* Token pills */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {topic.tokens.map((tok, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-2.5 py-1 text-xs font-medium"
                    >
                      <span className="text-[#0b1c30] font-bold">{tok.symbol}</span>
                      <span className="text-emerald-600 font-mono text-[11px] font-semibold">
                        +{tok.change}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                {topic.userAnswer ? (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>You contributed</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Open for answers
                  </span>
                )}

                <button
                  onClick={() => handleOpenAnswer(topic)}
                  className="inline-flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#5338ec] text-[#0b1c30] hover:text-white border border-slate-200 hover:border-[#5338ec] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Answer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODAL: ANSWER TOPIC DIALOG ─── */}
      {selectedTopicForAnswer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 w-full max-w-lg text-[#0b1c30] shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#5338ec] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Community Debate
              </span>
              <button
                onClick={() => setSelectedTopicForAnswer(null)}
                className="text-slate-400 hover:text-slate-700 text-lg p-1"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-[#0b1c30] mb-3 leading-snug">
              {selectedTopicForAnswer.title}
            </h3>

            {/* Quick Poll Voting Options */}
            <div className="space-y-2 mb-4">
              <label className="text-xs text-[#474556] font-medium block">
                Choose your market thesis:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVotedOption('Bullish - Holds Support')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                    votedOption === 'Bullish - Holds Support'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold'
                      : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0b1c30] hover:bg-[#f1f5f9]'
                  }`}
                >
                  🚀 Bullish (Holds Support)
                </button>
                <button
                  onClick={() => setVotedOption('Bearish - Tests $70K')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                    votedOption === 'Bearish - Tests $70K'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 font-semibold'
                      : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0b1c30] hover:bg-[#f1f5f9]'
                  }`}
                >
                  📉 Bearish (Tests $70K)
                </button>
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-4">
              <label className="text-xs text-[#474556] font-medium block mb-1">
                Your detailed technical or macro perspective:
              </label>
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Explain order book liquidity, funding rates, or institutional flow..."
                rows={4}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#0b1c30] placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#5338ec] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTopicForAnswer(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#474556] hover:text-[#0b1c30]"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="inline-flex items-center gap-2 bg-[#5338ec] hover:bg-[#4326d8] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Answer (+15 pts)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
