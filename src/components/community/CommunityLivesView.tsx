import React, { useState } from 'react';
import {
  Mic,
  Calendar,
  Users,
  Play,
  Pause,
  Bell,
  Check,
  Sparkles,
  Lock,
  Volume2,
  Share2,
  Radio,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { CommunityLiveSession, UserProfile } from '../../types';
import { COMMUNITY_LIVES } from '../../data/communityData';

interface CommunityLivesViewProps {
  user: UserProfile;
  onRewardPoints?: (points: number, reason: string) => void;
  onShowToast: (msg: string) => void;
  onOpenTierModal?: () => void;
}

export const CommunityLivesView: React.FC<CommunityLivesViewProps> = ({
  user,
  onRewardPoints,
  onShowToast,
  onOpenTierModal,
}) => {
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Past'>('All');
  const [lives, setLives] = useState<CommunityLiveSession[]>(COMMUNITY_LIVES);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(34);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; emoji: string; x: number }[]>([]);

  // Toggle Reminder
  const handleToggleReminder = (id: string) => {
    setLives((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isReminderSet;
          const delta = nextState ? 1 : -1;
          if (nextState && onRewardPoints) {
            onRewardPoints(5, 'Set reminder for live stream');
          }
          onShowToast(
            nextState
              ? '🔔 Reminder set! +5 Community Points awarded'
              : 'Reminder removed'
          );
          return {
            ...item,
            isReminderSet: nextState,
            listenersCount: item.listenersCount + delta,
          };
        }
        return item;
      })
    );
  };

  // Play audio recording
  const handleTogglePlayAudio = (id: string) => {
    if (activeAudioId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudioId(id);
      setIsPlaying(true);
      setAudioProgress(12);
      onShowToast('🎙️ Streaming session audio recording...');
    }
  };

  // Add floating reaction
  const handleSendReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 60) + 20;
    setFloatingHearts((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  const upcomingLives = lives.filter((l) => l.status === 'upcoming');
  const pastLives = lives.filter((l) => l.status === 'past');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ─── FLOATING REACTIONS CONTAINER ─── */}
      <div className="fixed bottom-20 right-10 pointer-events-none z-50 overflow-hidden w-40 h-80">
        {floatingHearts.map((h) => (
          <div
            key={h.id}
            className="absolute bottom-0 text-2xl animate-bounce"
            style={{
              left: `${h.x}%`,
              animation: 'floatUp 1.8s ease-out forwards',
            }}
          >
            {h.emoji}
          </div>
        ))}
      </div>

      {/* ─── TOP FILTER BAR ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-[#171924] p-1 rounded-xl border border-slate-800">
          {(['All', 'Upcoming', 'Past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-[#3861fb] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab === 'All' && '⊞ All'}
              {tab === 'Upcoming' && '🕒 Upcoming'}
              {tab === 'Past' && '🎙️ Past'}
            </button>
          ))}
        </div>

        {/* Host Live Button (Tier 5 Unlock) */}
        <button
          onClick={() => {
            if (user.level < 5) {
              onShowToast('🔒 Host Spaces unlocks at Gold Master Tier (Level 5)!');
              if (onOpenTierModal) onOpenTierModal();
            } else {
              onShowToast('🎙️ Starting your custom Live Audio Space...');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#3861fb] to-[#5338ec] hover:opacity-95 text-white shadow-md transition-all group"
        >
          {user.level < 5 ? (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Host a Space (Lvl 5)</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-300" />
              <span>Start Live Space</span>
            </>
          )}
        </button>
      </div>

      {/* ─── ACTIVE AUDIO BAR (WHEN PLAYING) ─── */}
      {activeAudioId && (
        <div className="bg-[#171924] border border-[#3861fb]/40 rounded-2xl p-4 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#3861fb]/20 border border-[#3861fb]/50 flex items-center justify-center text-[#3861fb] shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-display text-white">
                  {lives.find((l) => l.id === activeAudioId)?.title || 'Playing Recording'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-semibold">
                  HQ AUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Host: {lives.find((l) => l.id === activeAudioId)?.hosts[0]?.name} • {lives.find((l) => l.id === activeAudioId)?.audioDuration}
              </p>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-3 w-full md:w-1/3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-[#3861fb] text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-xs shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative cursor-pointer">
              <div
                className="bg-[#3861fb] h-full transition-all duration-300"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {Math.floor(audioProgress * 0.45)}:20
            </span>
          </div>

          {/* Quick Reaction Emojis in Player */}
          <div className="flex items-center gap-1.5 shrink-0">
            {['🔥', '🚀', '❤️', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm hover:scale-110 transition-transform active:scale-95"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveAudioId(null);
                setIsPlaying(false);
              }}
              className="text-xs text-slate-400 hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── UPCOMING SECTION ─── */}
      {(filter === 'All' || filter === 'Upcoming') && upcomingLives.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
            <span>Upcoming</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </h2>

          {upcomingLives.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1e40af] p-6 text-white shadow-xl border border-blue-400/30"
            >
              {/* Background Soundwave Lines Graphic */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none flex items-center justify-end gap-1.5 pr-8">
                {[40, 65, 85, 45, 95, 30, 75, 55, 90, 60, 40, 80, 100, 50, 70, 85].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 max-w-xl space-y-4">
                {/* Host Badges */}
                <div className="flex items-center flex-wrap gap-2">
                  {item.hosts.map((host) => (
                    <div
                      key={host.name}
                      className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs font-medium"
                    >
                      <img
                        src={host.avatar}
                        alt={host.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{host.name}</span>
                    </div>
                  ))}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-200 shrink-0" />
                    <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Schedule and Going Count */}
                <div className="flex items-center gap-2 text-xs text-blue-100 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                  <span className="text-white/40">|</span>
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    <strong className="text-white font-bold">{item.listenersCount}</strong> going
                  </span>
                </div>

                {/* Set Reminder Button */}
                <div className="pt-1">
                  <button
                    onClick={() => handleToggleReminder(item.id)}
                    className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                      item.isReminderSet
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-[#0b1c30]'
                    }`}
                  >
                    {item.isReminderSet ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Reminder Set (We will notify you)</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 text-[#3861fb]" />
                        <span>Set reminder</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── PAST SECTION (3-COLUMN GRID MATCHING CMC) ─── */}
      {(filter === 'All' || filter === 'Past') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-display">Past</h2>
            <button
              onClick={() => onShowToast('Loading past archive recordings...')}
              className="text-xs text-[#3861fb] hover:underline font-semibold"
            >
              See all ›
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pastLives.map((past) => (
              <div
                key={past.id}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e40af] p-5 text-white shadow-md border border-blue-400/20 flex flex-col justify-between group hover:border-blue-300/50 transition-all hover:-translate-y-0.5"
              >
                {/* Waveform graphic in card background */}
                <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none flex items-end gap-1 p-3">
                  {[20, 50, 80, 40, 90, 60, 30, 70].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>

                <div className="space-y-3 relative z-10">
                  {/* Host badges & Token tags */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    {past.tokens &&
                      past.tokens.map((tok) => (
                        <span
                          key={tok.symbol}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tok.change >= 0
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {tok.symbol} {tok.change >= 0 ? `+${tok.change}%` : `${tok.change}%`}
                        </span>
                      ))}

                    {past.hosts.map((host) => (
                      <div
                        key={host.name}
                        className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] font-medium text-blue-100"
                      >
                        <img
                          src={host.avatar}
                          alt={host.name}
                          className="w-3 h-3 rounded-full object-cover"
                        />
                        <span>{host.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold font-display text-white leading-snug line-clamp-2">
                    {past.title}
                  </h3>

                  {/* Date & Tuned in stats */}
                  <div className="flex items-center gap-2 text-xs text-blue-100">
                    <Calendar className="w-3 h-3 text-blue-200" />
                    <span>{past.date}</span>
                    <span className="text-white/40">|</span>
                    <strong className="text-white font-mono font-bold">
                      {past.listenersCount.toLocaleString()}
                    </strong>{' '}
                    tuned in
                  </div>
                </div>

                {/* Play recording button */}
                <div className="pt-4 relative z-10">
                  <button
                    onClick={() => handleTogglePlayAudio(past.id)}
                    className="w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#0b1c30] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:bg-[#f8fafc]"
                  >
                    <Play className="w-3.5 h-3.5 text-[#3861fb] fill-[#3861fb]" />
                    <span>Play recording</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
