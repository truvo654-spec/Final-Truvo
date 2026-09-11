import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  ArrowLeft,
  Plus,
  Minus,
} from 'lucide-react';

interface CreditEarningGuideViewProps {
  user: UserProfile;
  onBackToMissions?: () => void;
}

interface CreditActivityItem {
  activity: string;
  credits: number;
}

const CREDIT_ACTIVITIES: CreditActivityItem[] = [
  { activity: 'Daily Login', credits: 25 },
  { activity: '7-Day Streak', credits: 300 },
  { activity: 'Read Market Analysis', credits: 40 },
  { activity: 'Watch Education', credits: 60 },
  { activity: 'Save Watchlist', credits: 15 },
  { activity: 'Create Price Alert', credits: 20 },
  { activity: 'Connect Broker', credits: 400 },
  { activity: 'Share Achievement', credits: 75 },
  { activity: 'Community Poll', credits: 50 },
  { activity: 'Weekly Mission', credits: 500 },
];

function FacetedGemIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 inline-block`} fill="none">
      <defs>
        <linearGradient id="creditGemCrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="creditGemPavilion" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="60%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>
      </defs>
      <polygon points="7,4 17,4 21,9 17,9 7,9 3,9" fill="#c7d2fe" />
      <polygon points="7,4 17,4 14,9 10,9" fill="url(#creditGemCrown)" />
      <polygon points="7,4 10,9 3,9" fill="#818cf8" />
      <polygon points="17,4 21,9 14,9" fill="#818cf8" />
      <polygon points="3,9 10,9 12,20" fill="url(#creditGemPavilion)" />
      <polygon points="10,9 14,9 12,20" fill="#a3e635" />
      <polygon points="14,9 21,9 12,20" fill="url(#creditGemPavilion)" />
    </svg>
  );
}

export const CreditEarningGuideView: React.FC<CreditEarningGuideViewProps> = ({
  user,
  onBackToMissions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Can I do the same activity to earn credits again?',
      a: 'Most recurring activities—such as Daily Login, reading daily Market Analysis, and creating Price Alerts—reset on regular daily or weekly cycles so you can consistently accumulate Syde Credits. One-time setup milestones (like Connect Broker) are credited once per unique account verification.',
    },
    {
      q: 'Do I get credits for trading too?',
      a: 'Yes! While volume-based trading primarily builds your Tier Points toward VIP rank status, completing weekly trading volume challenges and milestone volume tiers awards generous bonus bundles of Syde Credits directly into your balance.',
    },
    {
      q: 'Are there any spending limits for my credits?',
      a: 'There are absolutely no spending caps or cooldown periods. You can hold unlimited Syde Credits and redeem them anytime to unlock pro trading signals, full institutional breakdowns, or convert them into tier points via the Converter.',
    },
    {
      q: 'Will my credits expire?',
      a: 'Syde Credits do not expire as long as your account remains active with at least one login or interaction every 180 days. You will receive an email reminder well before any inactivity period.',
    },
  ];

  return (
    <div className="w-full relative overflow-hidden pb-16">
      {/* ─── Top Back Navigation Link ─── */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToMissions}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#5338ec] hover:text-[#432ec4] bg-white border border-indigo-100 hover:border-indigo-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Missions, Points & Credits</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>Home</span>
          <span>/</span>
          <span>Missions</span>
          <span>/</span>
          <span className="text-[#5338ec] font-semibold">Credit Earning Guide</span>
        </div>
      </div>

      {/* ─── Hero Title Section with Orbit Graphics ─── */}
      <div className="relative pt-2 pb-8 sm:pb-12">
        {/* Orbital Ellipse Graphic Background with Hot Pink Circle */}
        <div className="absolute top-[-30px] right-[-20px] sm:right-[4%] w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] pointer-events-none select-none z-0">
          <svg viewBox="0 0 580 580" className="w-full h-full overflow-visible opacity-70">
            {/* Dotted Elliptical Path */}
            <ellipse
              cx="290"
              cy="290"
              rx="260"
              ry="220"
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
          </svg>

          {/* Hot Pink Glowing Circle Orb at Top Right */}
          <div className="absolute top-[48px] right-[42px] sm:right-[60px] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FE01B1] shadow-lg shadow-pink-500/40 flex items-center justify-center transform" />

          {/* Curved Hand-Drawn Arrow swooping down toward the table */}
          <div className="absolute top-[140px] right-[160px] sm:right-[200px] w-16 h-16 pointer-events-none">
            <svg viewBox="0 0 60 60" fill="none" className="w-full h-full stroke-[#6366f1]" strokeWidth="2.2" strokeLinecap="round">
              <path d="M 12 10 Q 38 18 42 38" />
              <path d="M 34 35 L 42 40 L 44 30" />
            </svg>
          </div>
        </div>

        {/* Big Display Title: "Credit Earning Guide." with "de." in Hot Pink */}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold font-display tracking-tight text-[#5945F1] leading-tight">
            Credit Earning Gui<span className="text-[#FE01B1]">de.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-normal mt-3 max-w-2xl leading-relaxed">
            Have fun using our platform in various ways and you will be rewarded with credits
          </p>
        </div>
      </div>

      {/* ─── Main Content 2-Column Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
        {/* ─── LEFT COLUMN: How Do Credits Work? ─── */}
        <div className="lg:col-span-5 space-y-6 pt-2">
          <h2 className="text-2xl font-bold font-display text-[#0b1c30] tracking-tight">
            How Do Credits Work?
          </h2>

          <ul className="space-y-5 text-sm text-slate-800 leading-snug">
            {/* Bullet 1: Black circle */}
            <li className="flex items-start gap-3.5">
              <span className="w-3.5 h-3.5 rounded-full bg-black shrink-0 mt-0.5" />
              <span className="font-normal text-slate-800">
                Earn credits through eligible activity on Syde.
              </span>
            </li>

            {/* Bullet 2: Hot Pink circle */}
            <li className="flex items-start gap-3.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FE01B1] shrink-0 mt-0.5" />
              <span className="font-normal text-slate-800">
                Your credit balance grows as you participate and engage on MarketSyde..
              </span>
            </li>

            {/* Bullet 3: Volt Green circle */}
            <li className="flex items-start gap-3.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#a3e635] shrink-0 mt-0.5" />
              <span className="font-normal text-slate-800">
                Spend credits to unlock premium signals, deeper signal details, and advanced calculator results.
              </span>
            </li>

            {/* Bullet 4: Royal Blue circle */}
            <li className="flex items-start gap-3.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#5338ec] shrink-0 mt-0.5" />
              <span className="font-normal text-slate-800">
                Spend credits to unlock premium signals, deep analysis, and advanced calculators.
              </span>
            </li>

            {/* Bullet 5: Light Periwinkle circle */}
            <li className="flex items-start gap-3.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#a5b4fc] shrink-0 mt-0.5" />
              <span className="font-normal text-slate-800">
                Different rewards cost different credit amounts based on their value.
              </span>
            </li>
          </ul>
        </div>

        {/* ─── RIGHT COLUMN: Fun things to earn credits & Table ─── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Subheader */}
          <div className="text-sm font-normal text-slate-900 pb-1">
            The fun things you can do to earn credits for more tools and features.
          </div>

          {/* ─── Activities Table with Background Orbit Satellite ─── */}
          <div className="rounded-2xl border border-indigo-100/90 bg-white overflow-hidden shadow-2xs relative">
            {/* Dotted Orbit Path Line through table with purple satellite dot */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-45">
              <svg viewBox="0 0 600 460" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M 60 -40 C 140 180 340 260 600 265"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {/* Purple Satellite Dot positioned on orbit near row 6 (Create Price Alert) */}
                <circle cx="505" cy="264" r="8.5" fill="#5338ec" />
              </svg>
            </div>

            <div className="relative z-10 divide-y divide-indigo-50/80">
              {/* Header Row */}
              <div className="flex items-center justify-between px-6 py-3.5 text-xs font-medium text-[#5338ec] bg-[#fcfdff]">
                <span>Activity</span>
                <span>Earn Credits</span>
              </div>

              {/* Rows */}
              {CREDIT_ACTIVITIES.map((act) => (
                <div
                  key={act.activity}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Left: Activity Name */}
                  <span className="text-sm font-normal text-slate-800">
                    {act.activity}
                  </span>

                  {/* Right: Faceted Gem + Credits Amount */}
                  <div className="flex items-center gap-2 text-sm font-bold text-[#5338ec]">
                    <FacetedGemIcon className="w-4 h-4" />
                    <span>{act.credits}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-1.5 pt-3 text-xs font-medium text-slate-600">
            <button
              onClick={() => setCurrentPage(1)}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              |&lt;
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              &lt;
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold cursor-pointer ${
                currentPage === 1
                  ? 'border border-[#5338ec] text-[#5338ec] bg-indigo-50/50'
                  : 'border border-slate-200 hover:bg-slate-100'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${
                currentPage === 2
                  ? 'border border-[#5338ec] text-[#5338ec] bg-indigo-50/50 font-bold'
                  : 'border border-slate-200 hover:bg-slate-100'
              }`}
            >
              2
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              onClick={() => setCurrentPage(20)}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              20
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(20, currentPage + 1))}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              &gt;
            </button>
            <button
              onClick={() => setCurrentPage(20)}
              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              &gt;|
            </button>
          </div>
        </div>
      </div>

      {/* ─── Got Questions? (FAQ Accordion) ─── */}
      <div className="mt-20 pt-8 max-w-4xl mx-auto text-center space-y-3">
        <h2 className="text-3xl font-extrabold font-display text-[#5338ec] tracking-tight">
          Got Questions?
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Quick answers on how to earn, spend, and convert your credits.
        </p>

        {/* Accordion List */}
        <div className="text-left mt-8 divide-y divide-slate-200/80 border-t border-b border-slate-200/80">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q} className="py-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between gap-4 text-left py-1 group cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-800 group-hover:text-[#5338ec] transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-[#5338ec] p-1 rounded-md group-hover:bg-indigo-50 transition-colors">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="pt-2.5 pb-2 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200 pr-8">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
