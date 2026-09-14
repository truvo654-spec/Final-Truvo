import React, { useState, useMemo } from 'react';
import { Broker, UserProfile, MarketSignal } from '../../types';
import {
  Search,
  ChevronDown,
  X,
  Check,
  ArrowRight,
  Info,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Gem,
  LogIn,
  UserCheck,
} from 'lucide-react';

export interface BrokerComparisonPageProps {
  brokers: Broker[];
  user: UserProfile;
  signals?: MarketSignal[];
  isLoggedIn: boolean;
  initialBroker?: Broker | null;
  onToggleAuthState?: (loggedIn: boolean) => void;
  onConnectBroker: (broker: Broker) => void;
  onSelectBrokerDetail: (broker: Broker) => void;
  onOpenViewPlan: () => void;
  onOpenSignUp: () => void;
  onOpenSignIn: () => void;
  onNavigateToSignals?: () => void;
  onShowToast?: (msg: string) => void;
}

// Data model for comparison table specs
interface BrokerCompareSpecs {
  id: string;
  name: string;
  score: number;
  verified: boolean;
  isTopPick?: boolean;
  logoType: 'hfm' | 'exness' | 'xm' | 'icmarkets' | 'pepperstone' | 'fxpro' | 'tickmill' | 'eightcap' | 'default';
  logoBg: string;
  logoText: string;
  // Cashback & Income
  highestCashback: string;
  cashbackSubBadge?: string;
  monthlyEst: string;
  rebatePaid: string;
  pairsEligible: string;
  // Costs & Spreads
  spreadType: string;
  lowestAvgSpread: string;
  standardSpread: string;
  commissionRaw: string;
  totalCostPerLot: string;
  slippage: string;
  pipValuePerLot: string;
  // Account Details
  accountTypes: string;
  minDeposit: string;
  maxLeverage: string;
  minLotSize: string;
  instruments: string;
  tradingPlatforms: string[];
  // Currency & Execution
  accountCurrency: string;
  executionSpeed: string;
  priceLevels: string;
  entryPrecision: string;
  minSlDistance: string;
  slFillAccuracy: string;
  // Risk management
  marginCallLevel: string;
  stopOutLevel: string;
  marginBuffer: string;
  // Trading conditions
  scalping: 'Yes' | 'Partial' | 'No';
  hedging: 'Yes' | 'Partial' | 'No';
  eaAlgoSupport: 'Yes' | 'Partial' | 'No';
  swapFreeOption: 'Yes' | 'Partial' | 'No';
  copyTrading: 'Yes' | 'Partial' | 'No';
  tradingSessions: string;
  negativeBalanceProt: 'Yes' | 'Partial' | 'No';
}

// Master specs lookup matching D02-D08 mockups
const COMPARISON_BROKERS: BrokerCompareSpecs[] = [
  {
    id: 'hfm',
    name: 'HFM',
    score: 9.75,
    verified: true,
    isTopPick: true,
    logoType: 'hfm',
    logoBg: '#000000',
    logoText: 'HFM',
    highestCashback: '$2.50/Lot',
    cashbackSubBadge: 'Top Pick',
    monthlyEst: '$125/mo',
    rebatePaid: 'Daily',
    pairsEligible: 'All majors',
    spreadType: 'ECN / Standard',
    lowestAvgSpread: '0.1 pips',
    standardSpread: '1.3 pips',
    commissionRaw: '—',
    totalCostPerLot: '$1–13',
    slippage: 'Very low',
    pipValuePerLot: '$10',
    accountTypes: '5 types',
    minDeposit: '$5',
    maxLeverage: '1:2000',
    minLotSize: '0.01',
    instruments: '1000+',
    tradingPlatforms: ['MT4', 'MT5'],
    accountCurrency: 'Multi',
    executionSpeed: '~30 ms',
    priceLevels: '5 decimal',
    entryPrecision: '±0.1 pips',
    minSlDistance: '0 pips',
    slFillAccuracy: '~99.9%',
    marginCallLevel: '60%',
    stopOutLevel: '0–20%',
    marginBuffer: 'Yes',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'exness',
    name: 'Exness',
    score: 9.75,
    verified: true,
    logoType: 'exness',
    logoBg: '#FCD303',
    logoText: 'ex',
    highestCashback: '$2.50/Lot',
    monthlyEst: '$125/mo',
    rebatePaid: 'Automated',
    pairsEligible: 'All majors',
    spreadType: 'Raw / Zero / Std',
    lowestAvgSpread: '0.0 pips',
    standardSpread: '0.9 pips',
    commissionRaw: '$7 RT/lot',
    totalCostPerLot: '$7–9',
    slippage: 'Very low',
    pipValuePerLot: '$10',
    accountTypes: '5 types',
    minDeposit: '$5',
    maxLeverage: '1:2000',
    minLotSize: '0.01',
    instruments: '220+',
    tradingPlatforms: ['MT4', 'MT5', 'App'],
    accountCurrency: 'Multi',
    executionSpeed: 'Ultra fast',
    priceLevels: '5 decimal',
    entryPrecision: 'High',
    minSlDistance: '0 pips',
    slFillAccuracy: 'High',
    marginCallLevel: '—',
    stopOutLevel: '—',
    marginBuffer: '—',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/7*',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'icmarkets',
    name: 'IC Markets',
    score: 9.75,
    verified: false,
    logoType: 'icmarkets',
    logoBg: '#000000',
    logoText: 'IC Markets',
    highestCashback: 'Via IB Program',
    monthlyEst: 'Varies',
    rebatePaid: 'Monthly',
    pairsEligible: 'All majors',
    spreadType: 'Zero / Ultra Low / Std',
    lowestAvgSpread: '0.0 pips',
    standardSpread: '1.0–1.6 pips',
    commissionRaw: '$7 RT/lot',
    totalCostPerLot: '$7–16',
    slippage: 'Low',
    pipValuePerLot: '$1–10',
    accountTypes: '4 types',
    minDeposit: '$5',
    maxLeverage: '1:1000',
    minLotSize: '0.01–0.1',
    instruments: '1000+',
    tradingPlatforms: ['MT4', 'MT5', 'cTrader'],
    accountCurrency: 'Multi',
    executionSpeed: 'Fast',
    priceLevels: '5 decimal',
    entryPrecision: 'Standard',
    minSlDistance: '—',
    slFillAccuracy: 'Standard',
    marginCallLevel: '—',
    stopOutLevel: '—',
    marginBuffer: '—',
    scalping: 'Partial',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'No',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'xm',
    name: 'XM',
    score: 9.75,
    verified: true,
    logoType: 'xm',
    logoBg: '#000000',
    logoText: 'XM',
    highestCashback: '$8.00/Lot',
    monthlyEst: '$160/mo',
    rebatePaid: 'Daily',
    pairsEligible: 'All majors',
    spreadType: 'Ultra Low / Standard',
    lowestAvgSpread: '0.6 pips',
    standardSpread: '1.6 pips',
    commissionRaw: '—',
    totalCostPerLot: '$6–16',
    slippage: 'Very low',
    pipValuePerLot: '$10',
    accountTypes: '4 types',
    minDeposit: '$5',
    maxLeverage: '1:1000',
    minLotSize: '0.01',
    instruments: '1000+',
    tradingPlatforms: ['MT4', 'MT5', 'App'],
    accountCurrency: 'Multi',
    executionSpeed: '~45 ms',
    priceLevels: '5 decimal',
    entryPrecision: 'High',
    minSlDistance: '0 pips',
    slFillAccuracy: '~99.5%',
    marginCallLevel: '50%',
    stopOutLevel: '20%',
    marginBuffer: 'Yes',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'pepperstone',
    name: 'Pepperstone',
    score: 9.75,
    verified: false,
    logoType: 'pepperstone',
    logoBg: '#0066FF',
    logoText: 'pepperstone',
    highestCashback: '$3.00/Lot',
    monthlyEst: '$150/mo',
    rebatePaid: 'Daily',
    pairsEligible: 'All majors',
    spreadType: 'Razor / Standard',
    lowestAvgSpread: '0.0 pips',
    standardSpread: '1.0 pips',
    commissionRaw: '$7 RT/lot',
    totalCostPerLot: '$7–10',
    slippage: 'Low',
    pipValuePerLot: '$10',
    accountTypes: '2 types',
    minDeposit: '$0',
    maxLeverage: '1:500',
    minLotSize: '0.01',
    instruments: '1200+',
    tradingPlatforms: ['MT4', 'MT5', 'cTrader', 'TradingView'],
    accountCurrency: 'Multi',
    executionSpeed: '~35 ms',
    priceLevels: '5 decimal',
    entryPrecision: 'High',
    minSlDistance: '0 pips',
    slFillAccuracy: '~99.8%',
    marginCallLevel: '90%',
    stopOutLevel: '50%',
    marginBuffer: 'Yes',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'fxpro',
    name: 'FxPro',
    score: 9.75,
    verified: false,
    logoType: 'fxpro',
    logoBg: '#DC2626',
    logoText: 'FxPro',
    highestCashback: '$2.20/Lot',
    monthlyEst: '$110/mo',
    rebatePaid: 'Daily',
    pairsEligible: 'All majors',
    spreadType: 'Raw+ / Standard / cTrader',
    lowestAvgSpread: '0.2 pips',
    standardSpread: '1.4 pips',
    commissionRaw: '$9 RT/lot',
    totalCostPerLot: '$9–14',
    slippage: 'Low',
    pipValuePerLot: '$10',
    accountTypes: '4 types',
    minDeposit: '$100',
    maxLeverage: '1:2000',
    minLotSize: '0.01',
    instruments: '2100+',
    tradingPlatforms: ['MT4', 'MT5', 'cTrader', 'FxPro Platform'],
    accountCurrency: 'Multi',
    executionSpeed: '~40 ms',
    priceLevels: '5 decimal',
    entryPrecision: 'High',
    minSlDistance: '0 pips',
    slFillAccuracy: '~99.6%',
    marginCallLevel: '50%',
    stopOutLevel: '20%',
    marginBuffer: 'Yes',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'tickmill',
    name: 'Tickmill',
    score: 9.75,
    verified: false,
    logoType: 'tickmill',
    logoBg: '#991B1B',
    logoText: 'Tickmill',
    highestCashback: '$2.00/Lot',
    monthlyEst: '$100/mo',
    rebatePaid: 'Weekly',
    pairsEligible: 'All majors',
    spreadType: 'Pro / Classic / VIP',
    lowestAvgSpread: '0.0 pips',
    standardSpread: '1.6 pips',
    commissionRaw: '$4 RT/lot',
    totalCostPerLot: '$4–16',
    slippage: 'Low',
    pipValuePerLot: '$10',
    accountTypes: '3 types',
    minDeposit: '$100',
    maxLeverage: '1:1000',
    minLotSize: '0.01',
    instruments: '600+',
    tradingPlatforms: ['MT4', 'MT5'],
    accountCurrency: 'Multi',
    executionSpeed: '~30 ms',
    priceLevels: '5 decimal',
    entryPrecision: 'High',
    minSlDistance: '0 pips',
    slFillAccuracy: '~99.9%',
    marginCallLevel: '100%',
    stopOutLevel: '30%',
    marginBuffer: 'Yes',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
  {
    id: 'eightcap',
    name: 'Eightcap',
    score: 9.75,
    verified: false,
    logoType: 'eightcap',
    logoBg: '#059669',
    logoText: 'Eightcap',
    highestCashback: '$2.50/Lot',
    monthlyEst: '$125/mo',
    rebatePaid: 'Daily',
    pairsEligible: 'All majors',
    spreadType: 'Raw / Standard',
    lowestAvgSpread: '0.0 pips',
    standardSpread: '1.0 pips',
    commissionRaw: '$7 RT/lot',
    totalCostPerLot: '$7–10',
    slippage: 'Low',
    pipValuePerLot: '$10',
    accountTypes: '2 types',
    minDeposit: '$100',
    maxLeverage: '1:500',
    minLotSize: '0.01',
    instruments: '800+',
    tradingPlatforms: ['MT4', 'MT5', 'TradingView'],
    accountCurrency: 'Multi',
    executionSpeed: '~40 ms',
    priceLevels: '5 decimal',
    entryPrecision: 'High',
    minSlDistance: '0 pips',
    slFillAccuracy: '~99.7%',
    marginCallLevel: '80%',
    stopOutLevel: '50%',
    marginBuffer: 'Yes',
    scalping: 'Yes',
    hedging: 'Yes',
    eaAlgoSupport: 'Yes',
    swapFreeOption: 'Yes',
    copyTrading: 'Yes',
    tradingSessions: '24/5',
    negativeBalanceProt: 'Yes',
  },
];

// 19 Complete searchable brokers list matching D03/D05/D07 dropdown
const ALL_SEARCHABLE_BROKERS = [
  { id: 'hfm', name: 'HFM', logoType: 'hfm' },
  { id: 'xm', name: 'XM', logoType: 'xm' },
  { id: 'exness', name: 'Exness', logoType: 'exness' },
  { id: 'icmarkets', name: 'IC Markets', logoType: 'icmarkets' },
  { id: 'pepperstone', name: 'Pepperstone', logoType: 'pepperstone' },
  { id: 'fxpro', name: 'FxPro', logoType: 'fxpro' },
  { id: 'tickmill', name: 'Tickmill', logoType: 'tickmill' },
  { id: 'fpmarkets', name: 'FP Markets', logoType: 'default' },
  { id: 'vantage', name: 'Vantage', logoType: 'default' },
  { id: 'eightcap', name: 'Eightcap', logoType: 'eightcap' },
  { id: 'axi', name: 'Axi', logoType: 'default' },
  { id: 'avatrade', name: 'AvaTrade', logoType: 'default' },
  { id: 'ig', name: 'IG', logoType: 'default' },
  { id: 'oanda', name: 'OANDA', logoType: 'default' },
  { id: 'capital', name: 'Capital.com', logoType: 'default' },
  { id: 'deriv', name: 'Deriv', logoType: 'default' },
  { id: 'octa', name: 'Octa', logoType: 'default' },
  { id: 'justmarkets', name: 'JustMarkets', logoType: 'default' },
  { id: 'atfx', name: 'ATFX', logoType: 'default' },
];

export const BrokerComparisonPage: React.FC<BrokerComparisonPageProps> = ({
  brokers,
  user,
  signals = [],
  isLoggedIn,
  initialBroker,
  onToggleAuthState,
  onConnectBroker,
  onSelectBrokerDetail,
  onOpenViewPlan,
  onOpenSignUp,
  onOpenSignIn,
  onNavigateToSignals,
  onShowToast,
}) => {
  // Helper to resolve any broker object or string ID to COMPARISON_BROKERS ID
  const resolveComparisonBrokerId = (b: Broker | string | null | undefined): string | null => {
    if (!b) return null;
    const targetId = typeof b === 'string' ? b : b.id;
    const targetName = typeof b === 'string' ? b : b.name;
    const cleanTargetId = targetId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTargetName = targetName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const found = COMPARISON_BROKERS.find((cb) => {
      const cleanId = cb.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanName = cb.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return (
        cb.id === targetId ||
        cleanId === cleanTargetId ||
        cleanName === cleanTargetName ||
        cleanTargetId.includes(cleanId) ||
        cleanId.includes(cleanTargetId) ||
        cleanName.includes(cleanTargetName) ||
        cleanTargetName.includes(cleanName)
      );
    });
    return found ? found.id : null;
  };

  // Up to 3 slots
  // Default to empty state or initialBroker if provided from card Compare button
  const [selectedSlotIds, setSelectedSlotIds] = useState<(string | null)[]>(() => {
    if (initialBroker) {
      const resolved = resolveComparisonBrokerId(initialBroker);
      if (resolved) {
        return [resolved, resolved === 'hfm' ? 'exness' : 'hfm', null];
      }
    }
    return ['hfm', 'exness', null];
  });

  // Keep slots in sync if initialBroker changes (e.g. user goes back to brokers and clicks Compare on XM)
  React.useEffect(() => {
    if (initialBroker) {
      const resolved = resolveComparisonBrokerId(initialBroker);
      if (resolved) {
        setSelectedSlotIds((prev) => {
          if (prev.includes(resolved)) return prev;
          const next = [...prev];
          const emptyIdx = next.findIndex((s) => s === null);
          if (emptyIdx !== -1) {
            next[emptyIdx] = resolved;
          } else {
            // Replace slot 0
            next[0] = resolved;
          }
          return next;
        });
        onShowToast?.(`Loaded ${initialBroker.name} into Comparison`);
      }
    }
  }, [initialBroker]);

  // Active dropdown open slot index: 0, 1, 2, or null
  const [activeDropdownSlot, setActiveDropdownSlot] = useState<number | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Selected specs objects for the 3 slots
  const slot1Broker = useMemo(
    () => (selectedSlotIds[0] ? COMPARISON_BROKERS.find((b) => b.id === selectedSlotIds[0]) || null : null),
    [selectedSlotIds]
  );
  const slot2Broker = useMemo(
    () => (selectedSlotIds[1] ? COMPARISON_BROKERS.find((b) => b.id === selectedSlotIds[1]) || null : null),
    [selectedSlotIds]
  );
  const slot3Broker = useMemo(
    () => (selectedSlotIds[2] ? COMPARISON_BROKERS.find((b) => b.id === selectedSlotIds[2]) || null : null),
    [selectedSlotIds]
  );

  const selectedCount = [slot1Broker, slot2Broker, slot3Broker].filter(Boolean).length;

  // Render logo badge
  const renderBrokerLogo = (logoType: string, name: string, sizeClass = 'w-10 h-10') => {
    switch (logoType) {
      case 'hfm':
        return (
          <div className={`${sizeClass} rounded-xl bg-black flex flex-col items-center justify-center p-1 shrink-0 shadow-2xs`}>
            <span className="text-white font-extrabold text-[11px] tracking-wider leading-none">HFM</span>
            <div className="h-[2px] w-5 bg-red-600 my-0.5" />
            <span className="text-[5px] text-white font-bold tracking-tighter uppercase leading-none">MARKETS</span>
          </div>
        );
      case 'exness':
        return (
          <div className={`${sizeClass} rounded-xl bg-[#FCD303] flex items-center justify-center text-black font-black text-lg shrink-0 shadow-2xs`}>
            ex
          </div>
        );
      case 'xm':
        return (
          <div className={`${sizeClass} rounded-xl bg-black flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs`}>
            XM
          </div>
        );
      case 'icmarkets':
        return (
          <div className={`${sizeClass} rounded-xl bg-black flex flex-col items-center justify-center p-0.5 text-white shrink-0 shadow-2xs`}>
            <div className="flex items-end gap-0.5 h-2.5 mb-0.5">
              <span className="w-0.5 h-1.5 bg-[#00E575] rounded-xs" />
              <span className="w-0.5 h-2.5 bg-[#00E575] rounded-xs" />
              <span className="w-0.5 h-2 bg-[#00E575] rounded-xs" />
              <span className="text-white font-black text-[7.5px] ml-0.5 leading-none">IC</span>
            </div>
            <span className="text-[5.5px] font-bold text-white tracking-tight leading-none">Markets</span>
          </div>
        );
      case 'pepperstone':
        return (
          <div className={`${sizeClass} rounded-xl bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-2xs`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M6 3h7a5 5 0 0 1 5 5 5 5 0 0 1-5 5H9v8H6V3zm3 3v4h4a2 2 0 0 0 2-2 2 2 0 0 0-2-2H9z" />
            </svg>
          </div>
        );
      case 'fxpro':
        return (
          <div className={`${sizeClass} rounded-xl bg-[#DC2626] flex flex-col items-center justify-center p-0.5 text-white shrink-0 shadow-2xs`}>
            <span className="text-white font-black text-[11px] tracking-tight leading-none">FxPro</span>
            <span className="text-[4.5px] text-white/90 font-medium tracking-tighter leading-none mt-0.5">Trade Like a Pro</span>
          </div>
        );
      case 'tickmill':
        return (
          <div className={`${sizeClass} rounded-xl bg-[#1E1B18] flex items-center justify-center p-1 text-white shrink-0 shadow-2xs`}>
            <div className="w-4 h-4 rounded-xs bg-[#DC2626] rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 rounded-xs bg-black rotate-45" />
            </div>
          </div>
        );
      case 'eightcap':
        return (
          <div className={`${sizeClass} rounded-xl bg-[#059669] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-2xs`}>
            8
          </div>
        );
      default:
        return (
          <div className={`${sizeClass} rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
            {name.slice(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  // Popular brokers shortcuts (shown in empty slots or bottom of slot)
  const popularBrokers = useMemo(() => {
    const activeIds = selectedSlotIds.filter(Boolean);
    return COMPARISON_BROKERS.filter((b) => !activeIds.includes(b.id));
  }, [selectedSlotIds]);

  // Handle slot selection
  const handleSelectBrokerIntoSlot = (slotIdx: number, brokerId: string) => {
    setSelectedSlotIds((prev) => {
      const next = [...prev];
      next[slotIdx] = brokerId;
      return next;
    });
    setActiveDropdownSlot(null);
    setDropdownSearch('');
    onShowToast?.(`Added ${COMPARISON_BROKERS.find((b) => b.id === brokerId)?.name || brokerId} to comparison`);
  };

  const handleRemoveSlot = (slotIdx: number) => {
    setSelectedSlotIds((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  // Handle Connect Now action
  const handleConnectNow = (brokerSpecs: BrokerCompareSpecs) => {
    if (!isLoggedIn) {
      // Unregistered / Not signed-in state: prompt with AuthModal
      onOpenSignUp();
      onShowToast?.(`Please sign up or log in to connect with ${brokerSpecs.name}`);
    } else {
      // Signed-in state: find matched broker from store and proceed
      const matched = brokers.find((b) => b.name.toLowerCase().includes(brokerSpecs.name.toLowerCase())) || brokers[0];
      onConnectBroker(matched);
      onShowToast?.(`Connecting to ${brokerSpecs.name}...`);
    }
  };

  // Filtered dropdown brokers
  const filteredSearchBrokers = useMemo(() => {
    if (!dropdownSearch.trim()) return ALL_SEARCHABLE_BROKERS;
    const q = dropdownSearch.toLowerCase();
    return ALL_SEARCHABLE_BROKERS.filter((b) => b.name.toLowerCase().includes(q));
  }, [dropdownSearch]);

  // Matchup preset: load HFM, Exness, FxPro
  const handleLoadFullComparison = () => {
    setSelectedSlotIds(['hfm', 'exness', 'fxpro']);
    onShowToast?.('Loaded HFM vs Exness vs FxPro comparison');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full space-y-10 pb-16">
      {/* ─── State Switcher Banner (Signed-In vs Not Signed-In Demo Controller) ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-[#15023a] border border-indigo-100 dark:border-[#32137d] rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#CAEB0E] animate-pulse" />
          <span className="font-semibold text-slate-800 dark:text-white">Broker Comparison State:</span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="text-slate-500">
            Current view is demonstrating the{' '}
            <strong className={isLoggedIn ? 'text-[#5945F1]' : 'text-[#FE01B1]'}>
              {isLoggedIn ? 'Signed-In (Josh / Member)' : 'Not Signed-In (Guest)'}
            </strong>{' '}
            experience.
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#230674] rounded-xl shrink-0">
          <button
            onClick={() => onToggleAuthState?.(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
              isLoggedIn
                ? 'bg-white dark:bg-[#5945F1] text-[#5945F1] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Switch to Signed-In state to test member experience"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Signed In</span>
          </button>
          <button
            onClick={() => onToggleAuthState?.(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
              !isLoggedIn
                ? 'bg-white dark:bg-[#FE01B1] text-[#FE01B1] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
            title="Switch to Not Signed-In state to test guest/sign-up flow"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Not Signed In</span>
          </button>
        </div>
      </div>

      {/* ─── Hero Heading (Exact match to D02-D08: Compare CFD Brokers.) ─── */}
      <div className="text-center max-w-3xl mx-auto pt-2 space-y-2.5">
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold font-display tracking-tight text-[#5945F1]">
          Compare CFD Brokers<span className="text-[#FE01B1]">.</span>
        </h1>
        <p className="text-sm sm:text-[15px] text-slate-500 font-normal leading-relaxed max-w-2xl mx-auto">
          See trading conditions, platforms, regulation and cashback side by syde before making your decision.
        </p>
      </div>

      {/* ─── Main Comparison Arena + Right Sidebar Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT: 3-Slot Comparison Matrix (lg:col-span-9) ─── */}
        <div className="lg:col-span-9 bg-white dark:bg-[#120233] border border-slate-200/80 dark:border-[#2f1073] rounded-3xl p-4 sm:p-6 shadow-2xs">
          {/* Top 3 Columns: Dropdown Slots */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 items-start pb-6 border-b border-slate-100 dark:border-[#270868]">
            {/* Blank offset matching left label column */}
            <div className="hidden sm:block sm:col-span-3 lg:col-span-3" />

            {/* Slot 1 */}
            <div className="col-span-12 sm:col-span-3 lg:col-span-3 relative">
              {renderSlotTop(0, slot1Broker)}
            </div>

            {/* Slot 2 */}
            <div className="col-span-12 sm:col-span-3 lg:col-span-3 relative">
              {renderSlotTop(1, slot2Broker)}
            </div>

            {/* Slot 3 */}
            <div className="col-span-12 sm:col-span-3 lg:col-span-3 relative">
              {renderSlotTop(2, slot3Broker)}
            </div>
          </div>

          {/* If no broker is selected, or slots have popular broker chips underneath */}
          {selectedCount < 3 && (
            <div className="my-5 p-4 rounded-2xl bg-indigo-50/40 dark:bg-[#1f0956]/40 border border-indigo-100/60 dark:border-[#381691]/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#5945F1]" />
                  <span>Popular Brokers to Compare:</span>
                </span>
                <span className="text-[11px] text-slate-400">Click to add to next available slot</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {popularBrokers.slice(0, 6).map((pb) => (
                  <button
                    key={pb.id}
                    onClick={() => {
                      const nextEmptyIdx = selectedSlotIds.findIndex((s) => s === null);
                      if (nextEmptyIdx !== -1) {
                        handleSelectBrokerIntoSlot(nextEmptyIdx, pb.id);
                      } else {
                        handleSelectBrokerIntoSlot(0, pb.id);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#180442] border border-slate-200/90 dark:border-[#31117a] hover:border-[#5945F1] hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
                  >
                    {renderBrokerLogo(pb.logoType, pb.name, 'w-8 h-8')}
                    <div className="font-bold text-xs text-[#0b1c30] dark:text-white mt-1.5 leading-tight group-hover:text-[#5945F1]">
                      {pb.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                      <span>{pb.score}</span>
                      <Info className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                    {pb.verified && (
                      <span className="mt-1 text-[9px] px-1 py-0.5 bg-[#CAEB0E] text-black font-bold rounded">
                        ✔ Verified
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Comparison Table Rows ─── */}
          <div className="space-y-6 pt-2">
            {/* 1. Cashback & Income */}
            <div>
              <div className="bg-[#EEECFC] dark:bg-[#25095e] text-[#5945F1] dark:text-[#CAEB0E] text-xs font-bold px-3.5 py-2 rounded-lg mb-2">
                Cashback & Income
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow(
                  'Highest Cashback per Lot',
                  null,
                  slot1Broker && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#5945F1] font-extrabold text-sm">{slot1Broker.highestCashback}</span>
                      {slot1Broker.cashbackSubBadge && (
                        <span className="bg-[#FE01B1] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {slot1Broker.cashbackSubBadge}
                        </span>
                      )}
                    </div>
                  ),
                  slot2Broker && (
                    <span className="text-[#5945F1] font-extrabold text-sm">{slot2Broker.highestCashback}</span>
                  ),
                  slot3Broker && (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {slot3Broker.highestCashback}
                    </span>
                  )
                )}

                {renderRow(
                  'Monthly Est.',
                  '(Can put a option to mention monthly avg trades and volume to identity the cashback income)',
                  slot1Broker && <span className="font-bold text-slate-900 dark:text-white">{slot1Broker.monthlyEst}</span>,
                  slot2Broker && <span className="font-bold text-slate-900 dark:text-white">{slot2Broker.monthlyEst}</span>,
                  slot3Broker && <span className="font-bold text-slate-900 dark:text-white">{slot3Broker.monthlyEst}</span>
                )}

                {renderRow(
                  'Rebate paid',
                  null,
                  slot1Broker?.rebatePaid,
                  slot2Broker?.rebatePaid,
                  slot3Broker?.rebatePaid
                )}

                {renderRow(
                  'Pairs eligible',
                  null,
                  slot1Broker?.pairsEligible,
                  slot2Broker?.pairsEligible,
                  slot3Broker?.pairsEligible
                )}
              </div>
            </div>

            {/* 2. Costs & Spreads */}
            <div>
              <div className="bg-[#EEECFC] dark:bg-[#25095e] text-[#5945F1] dark:text-[#CAEB0E] text-xs font-bold px-3.5 py-2 rounded-lg mb-2">
                Costs & Spreads
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow('Spread type', null, slot1Broker?.spreadType, slot2Broker?.spreadType, slot3Broker?.spreadType)}
                {renderRow('Lowest avg spread', null, slot1Broker?.lowestAvgSpread, slot2Broker?.lowestAvgSpread, slot3Broker?.lowestAvgSpread)}
                {renderRow('Standard spread', null, slot1Broker?.standardSpread, slot2Broker?.standardSpread, slot3Broker?.standardSpread)}
                {renderRow('Commission (raw acct)', null, slot1Broker?.commissionRaw, slot2Broker?.commissionRaw, slot3Broker?.commissionRaw)}
                {renderRow('Total cost / lot (est.)', null, slot1Broker?.totalCostPerLot, slot2Broker?.totalCostPerLot, slot3Broker?.totalCostPerLot)}
                {renderRow('Slippage', null, slot1Broker?.slippage, slot2Broker?.slippage, slot3Broker?.slippage)}
                {renderRow('Pip value / lot', null, slot1Broker?.pipValuePerLot, slot2Broker?.pipValuePerLot, slot3Broker?.pipValuePerLot)}
              </div>
            </div>

            {/* 3. Account Details */}
            <div>
              <div className="bg-[#EEECFC] dark:bg-[#25095e] text-[#5945F1] dark:text-[#CAEB0E] text-xs font-bold px-3.5 py-2 rounded-lg mb-2">
                Account Details
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow('Account types', null, slot1Broker?.accountTypes, slot2Broker?.accountTypes, slot3Broker?.accountTypes)}
                {renderRow('Min. deposit', null, slot1Broker?.minDeposit, slot2Broker?.minDeposit, slot3Broker?.minDeposit)}
                {renderRow('Max leverage', null, slot1Broker?.maxLeverage, slot2Broker?.maxLeverage, slot3Broker?.maxLeverage)}
                {renderRow('Min lot size', null, slot1Broker?.minLotSize, slot2Broker?.minLotSize, slot3Broker?.minLotSize)}
                {renderRow('Instruments', null, slot1Broker?.instruments, slot2Broker?.instruments, slot3Broker?.instruments)}
                {renderRow(
                  'Trading platform',
                  null,
                  slot1Broker && (
                    <div className="space-y-1">
                      {slot1Broker.tradingPlatforms.map((p) => (
                        <div key={p} className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <Check className="w-3.5 h-3.5 text-[#CAEB0E] bg-black rounded-xs p-0.5 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  ),
                  slot2Broker && (
                    <div className="space-y-1">
                      {slot2Broker.tradingPlatforms.map((p) => (
                        <div key={p} className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <Check className="w-3.5 h-3.5 text-[#CAEB0E] bg-black rounded-xs p-0.5 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  ),
                  slot3Broker && (
                    <div className="space-y-1">
                      {slot3Broker.tradingPlatforms.map((p) => (
                        <div key={p} className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <Check className="w-3.5 h-3.5 text-[#CAEB0E] bg-black rounded-xs p-0.5 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* 4. Account Currency */}
            <div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow('Account currency', null, slot1Broker?.accountCurrency, slot2Broker?.accountCurrency, slot3Broker?.accountCurrency)}
              </div>
            </div>

            {/* 5. Execution Quality */}
            <div>
              <div className="bg-[#EEECFC] dark:bg-[#25095e] text-[#5945F1] dark:text-[#CAEB0E] text-xs font-bold px-3.5 py-2 rounded-lg mb-2">
                Execution quality
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow('Execution speed', null, slot1Broker?.executionSpeed, slot2Broker?.executionSpeed, slot3Broker?.executionSpeed)}
                {renderRow('Price levels', null, slot1Broker?.priceLevels, slot2Broker?.priceLevels, slot3Broker?.priceLevels)}
                {renderRow('Entry precision', null, slot1Broker?.entryPrecision, slot2Broker?.entryPrecision, slot3Broker?.entryPrecision)}
                {renderRow('Min SL distance', null, slot1Broker?.minSlDistance, slot2Broker?.minSlDistance, slot3Broker?.minSlDistance)}
                {renderRow('SL fill accuracy', null, slot1Broker?.slFillAccuracy, slot2Broker?.slFillAccuracy, slot3Broker?.slFillAccuracy)}
              </div>
            </div>

            {/* 6. Risk Management */}
            <div>
              <div className="bg-[#EEECFC] dark:bg-[#25095e] text-[#5945F1] dark:text-[#CAEB0E] text-xs font-bold px-3.5 py-2 rounded-lg mb-2">
                Risk management
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow('Margin call level', null, slot1Broker?.marginCallLevel, slot2Broker?.marginCallLevel, slot3Broker?.marginCallLevel)}
                {renderRow('Stop-out level', null, slot1Broker?.stopOutLevel, slot2Broker?.stopOutLevel, slot3Broker?.stopOutLevel)}
                {renderRow(
                  'Margin buffer',
                  null,
                  slot1Broker && (slot1Broker.marginBuffer === 'Yes' ? renderBadge('Yes') : slot1Broker.marginBuffer),
                  slot2Broker && (slot2Broker.marginBuffer === 'Yes' ? renderBadge('Yes') : slot2Broker.marginBuffer),
                  slot3Broker && (slot3Broker.marginBuffer === 'Yes' ? renderBadge('Yes') : slot3Broker.marginBuffer)
                )}
              </div>
            </div>

            {/* 7. Trading Conditions */}
            <div>
              <div className="bg-[#EEECFC] dark:bg-[#25095e] text-[#5945F1] dark:text-[#CAEB0E] text-xs font-bold px-3.5 py-2 rounded-lg mb-2">
                Trading conditions
              </div>
              <div className="divide-y divide-slate-100 dark:divide-[#28086a] text-xs">
                {renderRow('Scalping', null, slot1Broker && renderBadge(slot1Broker.scalping), slot2Broker && renderBadge(slot2Broker.scalping), slot3Broker && renderBadge(slot3Broker.scalping))}
                {renderRow('Hedging', null, slot1Broker && renderBadge(slot1Broker.hedging), slot2Broker && renderBadge(slot2Broker.hedging), slot3Broker && renderBadge(slot3Broker.hedging))}
                {renderRow('EA / algo support', null, slot1Broker && renderBadge(slot1Broker.eaAlgoSupport), slot2Broker && renderBadge(slot2Broker.eaAlgoSupport), slot3Broker && renderBadge(slot3Broker.eaAlgoSupport))}
                {renderRow('Swap-free option', null, slot1Broker && renderBadge(slot1Broker.swapFreeOption), slot2Broker && renderBadge(slot2Broker.swapFreeOption), slot3Broker && renderBadge(slot3Broker.swapFreeOption))}
                {renderRow('Copy trading', null, slot1Broker && renderBadge(slot1Broker.copyTrading), slot2Broker && renderBadge(slot2Broker.copyTrading), slot3Broker && renderBadge(slot3Broker.copyTrading))}
                {renderRow('Trading sessions', null, slot1Broker?.tradingSessions, slot2Broker?.tradingSessions, slot3Broker?.tradingSessions)}
                {renderRow('Negative balance prot.', null, slot1Broker && renderBadge(slot1Broker.negativeBalanceProt), slot2Broker && renderBadge(slot2Broker.negativeBalanceProt), slot3Broker && renderBadge(slot3Broker.negativeBalanceProt))}
              </div>
            </div>

            {/* Bottom View Profile Action Buttons */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 pt-4">
              <div className="hidden sm:block sm:col-span-3 lg:col-span-3" />
              <div className="col-span-12 sm:col-span-3 lg:col-span-3">
                {slot1Broker && (
                  <button
                    onClick={() => {
                      const matched = brokers.find((b) => b.name.toLowerCase().includes(slot1Broker.name.toLowerCase())) || brokers[0];
                      onSelectBrokerDetail(matched);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[#5945F1] dark:text-[#CAEB0E] font-semibold text-xs hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors text-center cursor-pointer shadow-2xs"
                  >
                    View {slot1Broker.name} Profile
                  </button>
                )}
              </div>
              <div className="col-span-12 sm:col-span-3 lg:col-span-3">
                {slot2Broker && (
                  <button
                    onClick={() => {
                      const matched = brokers.find((b) => b.name.toLowerCase().includes(slot2Broker.name.toLowerCase())) || brokers[0];
                      onSelectBrokerDetail(matched);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[#5945F1] dark:text-[#CAEB0E] font-semibold text-xs hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors text-center cursor-pointer shadow-2xs"
                  >
                    View {slot2Broker.name} Profile
                  </button>
                )}
              </div>
              <div className="col-span-12 sm:col-span-3 lg:col-span-3">
                {slot3Broker && (
                  <button
                    onClick={() => {
                      const matched = brokers.find((b) => b.name.toLowerCase().includes(slot3Broker.name.toLowerCase())) || brokers[0];
                      onSelectBrokerDetail(matched);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[#5945F1] dark:text-[#CAEB0E] font-semibold text-xs hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-colors text-center cursor-pointer shadow-2xs"
                  >
                    View {slot3Broker.name} Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Sidebar Widgets (Move up. Earn More. & Most Recent Signals) ─── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Widget 1: Move up. Earn More. (Exact match to image.png) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#15023a] border-2 border-[#FE01B1] shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-display font-black text-xl text-[#0b1c30] dark:text-white tracking-tight">
                Move up. Earn More<span className="text-[#FE01B1]">.</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Keep trading to climb levels and boost cashback.
            </p>

            {/* Stepper Progress Bar (Exact match to image.png) */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Left Dot: Rookie with 'You' pill */}
                  <div className="relative flex flex-col items-center">
                    {/* Floating 'You' badge */}
                    <div className="absolute -top-7 px-2.5 py-0.5 rounded-lg bg-[#5945F1] text-white text-[11px] font-bold shadow-xs whitespace-nowrap">
                      You
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#5945F1] rotate-45" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#5945F1]" />
                    <span className="text-xs font-bold text-[#FE01B1] mt-1.5">Rookie</span>
                  </div>

                  {/* Connecting Line */}
                  <div className="w-12 sm:w-16 h-0.5 bg-slate-200 dark:bg-slate-700" />

                  {/* Right Dot: Climber */}
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full border-2 border-[#5945F1] bg-white dark:bg-[#15023a]" />
                    <span className="text-xs font-bold text-[#5945F1] mt-1.5">Climber</span>
                  </div>
                </div>

                {/* Action button: View Plan */}
                <button
                  type="button"
                  onClick={onOpenViewPlan}
                  className="px-5 py-2.5 rounded-2xl bg-[#5945F1] hover:bg-[#4834df] text-white text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  View Plan
                </button>
              </div>
            </div>

            {/* If not logged in, showcase the guest prompt */}
            {!isLoggedIn && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Track your climb:</span>
                <button
                  onClick={onOpenSignUp}
                  className="text-[#FE01B1] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Sign Up Free</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Widget 2: Most Recent Signals. (Exact match to D02-D08) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#15023a] border border-slate-200/80 dark:border-[#2f1073] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-extrabold text-base text-[#0b1c30] dark:text-white">
                Most Recent <span className="text-[#5945F1] dark:text-[#CAEB0E]">Signals</span>
                <span className="text-[#FE01B1]">.</span>
              </h3>
              <button
                onClick={onNavigateToSignals}
                className="text-xs font-semibold text-slate-500 hover:text-[#5945F1] flex items-center gap-0.5 cursor-pointer"
              >
                <span>More</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              View most recent signals for your trading
            </p>

            {/* Signal Items List */}
            <div className="space-y-3">
              {/* EUR/USD */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-base">🇪🇺</span>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30] dark:text-white">EUR/USD</div>
                    <div className="text-[11px] text-[#10B981] font-semibold">+0.33%</div>
                  </div>
                </div>
                {/* Mini sparkline */}
                <svg className="w-16 h-5 text-[#10B981] stroke-current fill-none stroke-[1.5]" viewBox="0 0 60 20">
                  <path d="M0 15 Q15 5, 25 12 T45 8 T60 3" />
                </svg>
                <button
                  onClick={onNavigateToSignals}
                  className="px-3 py-1 bg-[#CAEB0E] hover:bg-[#b8d60d] text-black text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Buy
                </button>
              </div>

              {/* GOOGL */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-blue-500">G</span>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30] dark:text-white">GOOGL</div>
                    <div className="text-[11px] text-red-500 font-semibold">-0.11%</div>
                  </div>
                </div>
                {/* Mini sparkline */}
                <svg className="w-16 h-5 text-indigo-400 stroke-current fill-none stroke-[1.5]" viewBox="0 0 60 20">
                  <path d="M0 5 Q15 15, 25 8 T45 14 T60 18" />
                </svg>
                <button
                  onClick={onNavigateToSignals}
                  className="px-3 py-1 bg-[#5945F1] hover:bg-[#4834e0] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Sell
                </button>
              </div>

              {/* BTC/USD - Premium Signal */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                    ₿
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30] dark:text-white">BTC/USD</div>
                    <div className="text-[10px] text-[#FE01B1] font-bold flex items-center gap-1">
                      <Gem className="w-2.5 h-2.5" />
                      <span>Premium Signal</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onOpenViewPlan}
                  className="px-3 py-1 border border-[#FE01B1] text-[#FE01B1] hover:bg-[#FE01B1]/10 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Upgrade
                </button>
              </div>

              {/* S&P 500 */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center">
                    500
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30] dark:text-white">S&P 500</div>
                    <div className="text-[11px] text-[#10B981] font-semibold">+0.44%</div>
                  </div>
                </div>
                {/* Mini sparkline */}
                <svg className="w-16 h-5 text-[#10B981] stroke-current fill-none stroke-[1.5]" viewBox="0 0 60 20">
                  <path d="M0 16 Q15 10, 30 14 T60 2" />
                </svg>
                <button
                  onClick={onNavigateToSignals}
                  className="px-3 py-1 bg-[#CAEB0E] hover:bg-[#b8d60d] text-black text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Buy
                </button>
              </div>

              {/* XAU/USD */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-white font-bold text-[10px] flex items-center justify-center">
                    🪙
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#0b1c30] dark:text-white">XAU/USD</div>
                    <div className="text-[11px] text-[#10B981] font-semibold">+0.24%</div>
                  </div>
                </div>
                {/* Mini sparkline */}
                <svg className="w-16 h-5 text-[#10B981] stroke-current fill-none stroke-[1.5]" viewBox="0 0 60 20">
                  <path d="M0 12 Q20 4, 35 10 T60 4" />
                </svg>
                <button
                  onClick={onNavigateToSignals}
                  className="px-3 py-1 bg-[#CAEB0E] hover:bg-[#b8d60d] text-black text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Banner: Most Viewed Broker Matchups (Exact match to D02-D08) ─── */}
      <div className="p-[1.5px] rounded-3xl bg-gradient-to-r from-[#5945F1] via-[#FE01B1] to-[#FE01B1]/80 shadow-md">
        <div className="bg-white dark:bg-[#120233] rounded-[22px] p-6 sm:p-8 flex flex-col lg:flex-row items-stretch justify-between gap-8">
          {/* Left copy and CTA */}
          <div className="max-w-sm flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-2xl text-[#5945F1] dark:text-white leading-tight">
                Most Viewed Broker Matchups
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2.5 leading-relaxed">
                Explore broker comparisons frequently viewed by traders.
              </p>
            </div>

            <div className="pt-6">
              <button
                onClick={handleLoadFullComparison}
                className="px-6 py-3 bg-[#5945F1] hover:bg-[#4834e0] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>View full comparison</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right 3 Matchup Cards (HFM, Exness, FxPro) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
            {/* Card 1: HFM */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#180442] border border-slate-200/90 dark:border-[#2f1073] flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-[10px] px-2 py-0.5 bg-[#CAEB0E] text-black font-bold rounded-md mb-2">
                ✔ Verified
              </span>
              {renderBrokerLogo('hfm', 'HFM', 'w-14 h-14')}
              <div className="font-extrabold text-sm text-[#0b1c30] dark:text-white mt-2">HFM</div>
              <div className="text-xs font-extrabold text-[#5945F1] dark:text-[#CAEB0E] mt-1">$8.00</div>
              <div className="text-[10px] text-slate-400 mb-3">Max Cashback</div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">$10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spread:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">0.0 - 0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Leverage:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">Unlimited</span>
                </div>
              </div>
            </div>

            {/* Card 2: Exness */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#180442] border border-slate-200/90 dark:border-[#2f1073] flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-[10px] px-2 py-0.5 bg-[#CAEB0E] text-black font-bold rounded-md mb-2">
                ✔ Verified
              </span>
              {renderBrokerLogo('exness', 'Exness', 'w-14 h-14')}
              <div className="font-extrabold text-sm text-[#0b1c30] dark:text-white mt-2">Exness</div>
              <div className="text-xs font-extrabold text-[#5945F1] dark:text-[#CAEB0E] mt-1">$8.00</div>
              <div className="text-[10px] text-slate-400 mb-3">Max Cashback</div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">$10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spread:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">0.0 - 0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Leverage:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">1:500</span>
                </div>
              </div>
            </div>

            {/* Card 3: FxPro */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#180442] border border-slate-200/90 dark:border-[#2f1073] flex flex-col items-center text-center shadow-2xs hover:shadow-xs transition-shadow">
              <div className="h-5 mb-2" /> {/* Spacing spacer */}
              {renderBrokerLogo('fxpro', 'FxPro', 'w-14 h-14')}
              <div className="font-extrabold text-sm text-[#0b1c30] dark:text-white mt-2">Fx Pro</div>
              <div className="text-xs font-extrabold text-[#5945F1] dark:text-[#CAEB0E] mt-1">$8.00</div>
              <div className="text-[10px] text-slate-400 mb-3">Max Cashback</div>

              <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">$10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spread:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">0.0 - 0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Leverage:</span>
                  <span className="font-semibold text-[#5945F1] dark:text-[#CAEB0E]">1:1500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to render top of each slot
  function renderSlotTop(slotIdx: number, broker: BrokerCompareSpecs | null) {
    if (!broker) {
      // Empty slot with "Select a Broker" dropdown button
      return (
        <div className="bg-[#f4f6fb] dark:bg-[#1a0747] rounded-2xl p-4 border border-slate-200/70 dark:border-[#321278] text-left">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Select a Broker</div>
          <button
            onClick={() => setActiveDropdownSlot(activeDropdownSlot === slotIdx ? null : slotIdx)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#120233] border border-slate-200 dark:border-[#3a1885] rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:border-[#5945F1] transition-all shadow-2xs cursor-pointer"
          >
            <span>Select Broker</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Searchable Dropdown Popup */}
          {activeDropdownSlot === slotIdx && renderDropdownPopup(slotIdx)}
        </div>
      );
    }

    // Populated slot card with logo, score, verified badge, remove X, and Connect Now button
    return (
      <div className="bg-[#f4f6fb] dark:bg-[#1a0747] rounded-2xl p-4 border border-slate-200/70 dark:border-[#321278] text-left space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            {renderBrokerLogo(broker.logoType, broker.name, 'w-11 h-11')}
            <div>
              <div className="font-bold text-sm text-[#0b1c30] dark:text-white leading-tight">{broker.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <span>{broker.score} Score</span>
                <Info className="w-3 h-3 text-slate-400" />
              </div>
              {broker.verified && (
                <div className="mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#CAEB0E] text-black font-bold rounded">
                    ✔ Verified
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleRemoveSlot(slotIdx)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Remove broker from this column"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connect Now Button */}
        <button
          onClick={() => handleConnectNow(broker)}
          className="w-full py-2.5 bg-[#5945F1] hover:bg-[#4834e0] text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center cursor-pointer block"
        >
          Connect Now
        </button>
      </div>
    );
  }

  // Render searchable dropdown popup
  function renderDropdownPopup(slotIdx: number) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#15023a] border border-slate-200 dark:border-[#3c178a] rounded-2xl shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={dropdownSearch}
            onChange={(e) => setDropdownSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#200754] border border-slate-200 dark:border-[#381682] focus:outline-hidden focus:border-[#5945F1] dark:text-white"
            autoFocus
          />
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {filteredSearchBrokers.map((b) => {
            const isAlreadySelected = selectedSlotIds.includes(b.id);
            return (
              <button
                key={b.id}
                disabled={isAlreadySelected}
                onClick={() => handleSelectBrokerIntoSlot(slotIdx, b.id)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  isAlreadySelected
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-[#1a0747]'
                    : 'hover:bg-indigo-50/70 dark:hover:bg-[#23085c] text-slate-800 dark:text-white'
                }`}
              >
                {renderBrokerLogo(b.logoType, b.name, 'w-6 h-6')}
                <span className="font-medium flex-1 truncate">{b.name}</span>
                {isAlreadySelected && <span className="text-[10px] text-slate-400">Added</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Row helper
  function renderRow(
    label: string,
    sublabel: string | null,
    val1?: React.ReactNode,
    val2?: React.ReactNode,
    val3?: React.ReactNode
  ) {
    return (
      <div className="grid grid-cols-12 gap-3 sm:gap-4 py-3 items-center">
        {/* Label (col-span-3) */}
        <div className="col-span-12 sm:col-span-3 lg:col-span-3">
          <div className="font-semibold text-slate-700 dark:text-slate-300">{label}</div>
          {sublabel && <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{sublabel}</div>}
        </div>

        {/* Slot 1 Value */}
        <div className="col-span-4 sm:col-span-3 lg:col-span-3 text-slate-800 dark:text-slate-200">
          {val1 !== undefined ? val1 : <span className="text-slate-300 dark:text-slate-600">—</span>}
        </div>

        {/* Slot 2 Value */}
        <div className="col-span-4 sm:col-span-3 lg:col-span-3 text-slate-800 dark:text-slate-200">
          {val2 !== undefined ? val2 : <span className="text-slate-300 dark:text-slate-600">—</span>}
        </div>

        {/* Slot 3 Value */}
        <div className="col-span-4 sm:col-span-3 lg:col-span-3 text-slate-800 dark:text-slate-200">
          {val3 !== undefined ? val3 : <span className="text-slate-300 dark:text-slate-600">—</span>}
        </div>
      </div>
    );
  }

  // Pill badge helper for Yes / Partial / No
  function renderBadge(val: string) {
    if (val === 'Yes') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md bg-[#CAEB0E] text-black font-bold text-[11px]">
          Yes
        </span>
      );
    }
    if (val === 'Partial') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-400 text-black font-bold text-[11px]">
          Partial
        </span>
      );
    }
    if (val === 'No') {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[11px]">
          No
        </span>
      );
    }
    return val;
  }
};
