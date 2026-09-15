import React from 'react';
import { Broker, UserProfile } from '../../../types';
import { Globe, ExternalLink } from 'lucide-react';
import { BrokerComparisonCard } from '../BrokerComparisonCard';

interface BrokerCompanyTabContentProps {
  broker: Broker;
  user?: UserProfile;
  tier?: 'tier-1' | 'tier-2' | 'offshore';
  isConnected?: boolean;
  onSeeComparison?: () => void;
  onExploreAllBrokers?: () => void;
}

export const BrokerCompanyTabContent: React.FC<BrokerCompanyTabContentProps> = ({
  broker,
  user,
  tier = 'tier-1',
  isConnected = false,
  onSeeComparison,
  onExploreAllBrokers,
}) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Connected Partner Support Banner */}
      {isConnected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#eff2fe] to-[#f4f5fa] border border-[#5945F1]/20 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#5945F1] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              <Globe className="w-5 h-5 text-[#CAEB0E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#0b1c30]">
                  MarketSyde Partner Priority Support Active
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified IB
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                As an account connected through MarketSyde, you have direct priority dispute resolution and dedicated account manager support with {broker.name}.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          1. HFM BACKGROUND (D05, D08, D11)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-[#0b1c30]">
          {broker.name} Background
        </h3>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-normal">
          <p>
            HF Markets Group started to empower retail and professional traders to pursue opportunities in the financial markets online back in 2010. Since then, it&apos;s become a widely respected broker, famed for its commitment to maintaining multiple licenses, offering cutting-edge trading technology and rock-solid trading educational materials.
          </p>
          <p>
            With 16 years of market experience, {broker.name} now serves over 4 million client accounts and has won more than 80 industry awards. The broker was named among the World Finance Top 100 Global Companies in 2014, and in 2026 became an Official Partner of Arsenal Football Club.
          </p>
        </div>

        {/* Specs & Socials Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Specs List */}
            <div className="md:col-span-7 space-y-2 text-xs text-slate-700 font-medium">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 text-slate-500 font-normal">• Legal Name</span>
                <span className="col-span-7 font-bold text-slate-900">: HF Markets (SV) Ltd.</span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 text-slate-500 font-normal">• Founded Year</span>
                <span className="col-span-7 font-bold text-slate-900">
                  : {broker.founded || 2010} (Operated for 15 years)
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-5 text-slate-500 font-normal">• Headquarters</span>
                <span className="col-span-7 font-bold text-slate-900">: {broker.headquarters || 'Cyprus'}</span>
              </div>
            </div>

            {/* Right Specs List & Social Media Icons */}
            <div className="md:col-span-5 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-normal">Broker Type :</span>
                <span className="font-bold text-slate-900">STP, MM/DD</span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <span className="text-slate-500 font-normal">Social Media :</span>
                <div className="flex items-center gap-2">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-85 transition-opacity text-xs font-bold"
                    title="Facebook"
                  >
                    f
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] text-white flex items-center justify-center hover:opacity-85 transition-opacity text-xs font-bold"
                    title="Instagram"
                  >
                    ig
                  </a>
                  {/* X / Twitter */}
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:opacity-85 transition-opacity text-xs font-bold"
                    title="X"
                  >
                    𝕏
                  </a>
                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-85 transition-opacity text-xs font-bold"
                    title="YouTube"
                  >
                    ▶
                  </a>
                  {/* Website link */}
                  <a
                    href="https://hfm.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors text-xs font-bold"
                    title="Website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. REGULATOR LICENSES (D05, D08, D11)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h3 className="font-display font-bold text-lg text-[#0b1c30]">
            Regulator Licenses
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified licenses ensuring the highest standards of fund safety and transparency
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[#5945F1]">
                <th className="py-3.5 px-6 font-bold text-slate-700">Regulatory Body</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Status</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Number</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Country</th>
                <th className="py-3.5 px-4 font-bold text-center text-[#5945F1]">Effective</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Row 1: FCA */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      FCA
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      AAA
                    </span>
                    <span className="font-bold text-slate-900">FCA</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    Authorised
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">801701</td>
                <td className="py-3.5 px-4 text-center text-slate-700">United Kingdom</td>
                <td className="py-3.5 px-4 text-center text-slate-600">Nov 13, 2018</td>
              </tr>

              {/* Row 2: FSCA */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      FSCA
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      B
                    </span>
                    <span className="font-bold text-slate-900">FSCA</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    Authorised
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">46632</td>
                <td className="py-3.5 px-4 text-center text-slate-700">South Africa</td>
                <td className="py-3.5 px-4 text-center text-slate-600">Feb 08, 2016</td>
              </tr>

              {/* Row 3: FSA Seychelles */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-blue-700 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                      FSA
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      B
                    </span>
                    <span className="font-bold text-slate-900">Seychelles</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    Authorised
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">SD015</td>
                <td className="py-3.5 px-4 text-center text-slate-700">Seychelles</td>
                <td className="py-3.5 px-4 text-center text-slate-400">-</td>
              </tr>

              {/* Row 4: CMA Kenya */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-amber-700 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                      CMA
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      B
                    </span>
                    <span className="font-bold text-slate-900">Kenya CMA</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    Authorised
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">155</td>
                <td className="py-3.5 px-4 text-center text-slate-700">Kenya</td>
                <td className="py-3.5 px-4 text-center text-slate-400">-</td>
              </tr>

              {/* Row 5: SVG FSA */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                      SVG
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      C
                    </span>
                    <span className="font-bold text-slate-900">SVG FSA</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#CAEB0E] text-black font-extrabold text-[11px]">
                    Registered
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center font-semibold text-slate-800">22747IBC2015</td>
                <td className="py-3.5 px-4 text-center text-slate-700">
                  Saint Vincent and the Grenadines
                </td>
                <td className="py-3.5 px-4 text-center text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CONTACT (D05, D08, D11)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <h3 className="font-display font-bold text-lg text-[#0b1c30]">Contact</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Localized support for a seamless trading experience in your region
          </p>
        </div>

        {/* 8 Contact Cards (4x2 Grid on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Global (Main) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🌐</span>
              <span>Global (Main)</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+44-2033185978</div>
              <div className="text-slate-500 truncate">support@hfm.com</div>
            </div>
          </div>

          {/* 2. Thailand */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇹🇭</span>
              <span>Thailand</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+66-21056067</div>
              <div className="text-slate-500 truncate">support.th@hfm.com</div>
            </div>
          </div>

          {/* 3. Vietnam */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇻🇳</span>
              <span>Vietnam</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+84-2844581335</div>
              <div className="text-slate-500 truncate">support.vn@hfm.com</div>
            </div>
          </div>

          {/* 4. Indonesia */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇮🇩</span>
              <span>Indonesia</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+62-2111100222</div>
              <div className="text-slate-500 truncate">support.id@hfm.com</div>
            </div>
          </div>

          {/* 5. Philippines */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇵🇭</span>
              <span>Philippines</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+63-282711811</div>
              <div className="text-slate-500 truncate">support.ph@hfm.com</div>
            </div>
          </div>

          {/* 6. South Africa */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇿🇦</span>
              <span>South Africa</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+27-105003964</div>
              <div className="text-slate-500 truncate">support.za@hfm.com</div>
            </div>
          </div>

          {/* 7. Kenya */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇰🇪</span>
              <span>Kenya</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+254-203894255</div>
              <div className="text-slate-500 truncate">support.ke@hfm.com</div>
            </div>
          </div>

          {/* 8. Nigeria */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <span className="text-sm">🇳🇬</span>
              <span>Nigeria</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-600 font-medium">
              <div>+234-12273614</div>
              <div className="text-slate-500 truncate">support.ng@hfm.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW HFM COMPARES CARD
         ───────────────────────────────────────────────────────────── */}
      <BrokerComparisonCard
        broker={broker}
        onSeeComparison={onSeeComparison}
        onExploreAllBrokers={onExploreAllBrokers}
      />
    </div>
  );
};
