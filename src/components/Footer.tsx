import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12 py-8 px-[56px] text-slate-600 text-xs w-full">
      <div className="w-full space-y-6">
        {/* Top Links & Contacts Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
          {/* Left Email & Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#5338ec] flex items-center justify-center text-white shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 fill-none stroke-white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14C4 8.5 8 4 12 4s8 4.5 8 10-3 6-8 6c-3 0-5-1.5-6-4" />
                <path d="M8 12c1.5-2 3.5-3 5.5-3s3.5 1 4.5 3" />
              </svg>
            </div>
            <a
              href="mailto:abc@MarketSyde.com"
              className="text-xs font-semibold text-[#5338ec] hover:underline"
            >
              abc@MarketSyde.com
            </a>
          </div>

          {/* Center Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-700 font-medium text-xs">
            <button
              onClick={() => alert('MarketSyde provides automated institutional broker rebates and high-conviction market intelligence.')}
              className="hover:text-[#5338ec] transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => alert('Contact our 24/7 institutional desk at abc@MarketSyde.com')}
              className="hover:text-[#5338ec] transition-colors"
            >
              Contact Us
            </button>
            <button
              onClick={() => alert('Legal Notice: Financial market data and rebate calculations are provided as-is without warranty.')}
              className="hover:text-[#5338ec] transition-colors"
            >
              Legal Notice
            </button>
            <button
              onClick={() => alert('Privacy Policy: All client trading account credentials are encrypted and never shared.')}
              className="hover:text-[#5338ec] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => alert('Terms & Conditions: Cashback rebates are funded directly by our institutional partner broker agreements.')}
              className="hover:text-[#5338ec] transition-colors"
            >
              Terms & Conditions
            </button>
          </div>

          {/* Right Social Icons */}
          <div className="flex items-center gap-3 text-[#5338ec]">
            {/* Facebook */}
            <a
              href="#facebook"
              onClick={(e) => {
                e.preventDefault();
                alert('Follow MarketSyde on Facebook');
              }}
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#5338ec]/5 transition-colors"
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
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#5338ec]/5 transition-colors"
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
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#5338ec]/5 transition-colors"
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
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-[#5338ec]/5 transition-colors text-[#5338ec]"
              title="Discord"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Legal Disclaimer Paragraph (Exact text from reference) */}
        <p className="text-[11px] text-slate-500 text-center max-w-4xl mx-auto leading-relaxed">
          By using this website, you agree to be bound by MarketSyde's Terms & Conditions, which
          may be updated at any time without prior notice. Continued use of the site signifies your
          acceptance of all current terms, including any revisions. All content is provided for
          informational purposes only and may be changed or removed at our discretion. If you do not
          agree with these terms, please discontinue use of the website.
        </p>

        {/* Copyright */}
        <p className="text-[11px] text-slate-400 text-center font-normal pt-2">
          © 2026 MarketSyde. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
