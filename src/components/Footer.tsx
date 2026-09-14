import React from 'react';

export interface FooterProps {
  onNavigateToAbout?: () => void;
  onNavigateToPlan?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateToAbout,
  onNavigateToPlan,
  onNavigateToTab,
}) => {
  return (
    <footer className="w-full bg-[#5945F1] text-white pt-16 sm:pt-20 pb-8 px-4 sm:px-8 md:px-[56px] overflow-hidden relative selection:bg-[#bef226] selection:text-slate-900 z-10">
      <div className="w-full relative z-10 space-y-12">
        
        {/* Main Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Col 1: Signature M Ribbon with Lime Ball & 3D Sphere */}
          <div className="md:col-span-3 flex items-start">
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative select-none">
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full overflow-visible"
              >
                {/* Thick White Continuous Smooth 'M' Curve */}
                <path
                  d="M 32 126 C 30 84, 34 56, 50 56 C 66 56, 73 98, 88 98 C 102 98, 110 42, 126 42 C 138 42, 142 66, 144 86"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Electric Lime Green Circle at the terminal of the 'M' path */}
                <circle
                  cx="145"
                  cy="90"
                  r="14"
                  fill="#bef226"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="filter drop-shadow-sm"
                />
              </svg>
            </div>
          </div>

          {/* Col 2: More than product */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-white/90">
              More than product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-indigo-100/70 font-normal">
              <li>
                <button
                  onClick={() => {
                    if (onNavigateToPlan) onNavigateToPlan();
                    else if (onNavigateToTab) onNavigateToTab('member-plan');
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Member Plan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab?.('points-credits')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Loyalty Program
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab?.('points-credits')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Points System
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-white/90">
              Company
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-indigo-100/70 font-normal">
              <li>
                <button
                  onClick={() => {
                    if (onNavigateToAbout) onNavigateToAbout();
                    else if (onNavigateToTab) onNavigateToTab('about');
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left font-medium text-white"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab?.('contact-us')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Us & FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab?.('community')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Company News
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToTab?.('community')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Regal / Legal */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-white/90">
              Regal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-indigo-100/70 font-normal">
              <li>
                <button
                  onClick={() => alert('Legal Notice: Financial market data and rebate calculations are provided as-is without warranty.')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Legal Notice
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('Privacy Policy: All client trading account credentials are encrypted and never shared.')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('Terms & Conditions: Cashback rebates are funded directly by our institutional partner broker agreements.')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => alert('Cookies Policy: Cookies are used purely to maintain your preferences and active session.')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cookies Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider and Secondary Row: Copyright, Socials, and Email Callout */}
        <div className="pt-8 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Copyright */}
          <div className="text-[11px] sm:text-xs text-indigo-200/80 font-normal order-2 md:order-1">
            © 2026 MarketSyde. All rights reserved.
          </div>

          {/* Center Social Media Icons */}
          <div className="flex items-center gap-4 text-white/90 order-1 md:order-2">
            {/* Facebook */}
            <a
              href="#facebook"
              onClick={(e) => {
                e.preventDefault();
                alert('Follow MarketSyde on Facebook');
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#instagram"
              onClick={(e) => {
                e.preventDefault();
                alert('Follow MarketSyde on Instagram');
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Instagram"
            >
              <svg
                className="w-3.5 h-3.5 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="#x"
              onClick={(e) => {
                e.preventDefault();
                alert('Follow MarketSyde on X');
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="X (Twitter)"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Discord */}
            <a
              href="#discord"
              onClick={(e) => {
                e.preventDefault();
                alert('Join MarketSyde Discord Community');
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Discord"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          </div>

          {/* Right Direct Email with Lime Smiley / Target Accent */}
          <div className="flex flex-col items-start md:items-end order-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#bef226] flex items-center justify-center text-slate-900 font-black text-[11px] shadow-2xs">
                @
              </div>
              <a
                href="mailto:abc@MarketSyde.com"
                className="font-bold text-base sm:text-lg text-white hover:text-[#bef226] transition-colors font-sans"
              >
                abc@MarketSyde.com
              </a>
            </div>
            <span className="text-[11px] text-indigo-200/80 font-normal mt-0.5">
              Look who finally knows how to reach us
            </span>
          </div>

        </div>

        {/* Legal Fine Print Paragraph */}
        <div className="pt-4 pb-2 border-t border-white/10">
          <p className="text-[11px] sm:text-xs text-indigo-200/70 leading-relaxed font-normal">
            By using this website, you agree to be bound by MarketSyde's Terms & Conditions, which may be updated at any time without prior notice. Continued use of the site signifies your acceptance of all current terms, including any revisions. All content is provided for informational purposes only and may be changed or removed at our discretion. If you do not agree with these terms, please discontinue use of the website.
          </p>
        </div>

        {/* Huge Bottom Watermark "marketsyde" (Edge-to-edge full width) */}
        <div className="w-[calc(100%+32px)] sm:w-[calc(100%+64px)] md:w-[calc(100%+112px)] -mx-4 sm:-mx-8 md:-mx-[56px] select-none overflow-hidden pt-4 pb-2 -mb-8">
          <h1 className="text-[14vw] sm:text-[15vw] font-black tracking-tighter text-white/20 leading-none text-center select-none font-sans pointer-events-none">
            marketsyde
          </h1>
        </div>

      </div>
    </footer>
  );
};
