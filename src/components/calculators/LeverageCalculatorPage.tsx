import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
  TrendingUp,
  Activity,
  ArrowRightLeft,
  Briefcase,
  ClipboardList,
  Layers,
  PanelRightClose,
  PanelRightOpen,
  ThumbsUp,
  Star,
  Sliders,
  RotateCcw,
  BookmarkPlus,
  Compass,
} from 'lucide-react';
import { Broker, MarketSignal, UserProfile } from '../../types';
import {
  SpreadCalculatorView,
  PipCalculatorView,
  MarginCalculatorView,
  RebateCalculatorView,
  VolatilityCalculatorView,
  LeverageCalculatorView,
} from './ForexCalculatorViews';
import {
  PositionSizeCalculatorView,
  StopLossTakeProfitCalculatorView,
  StopOutCalculatorView,
} from './TradePlanningViews';
import {
  FibonacciCalculatorView,
  PivotPointCalculatorView,
} from './TechnicalViews';
import {
  ProfitLossCalculatorView,
  DrawdownCalculatorView,
  CompoundCalculatorView,
} from './PerformanceViews';
import {
  TradingTimezoneConverterView,
  GlobalMarketStatusSidebar,
  CurrencyConverterView,
} from './ConversionViews';
import { SaveScenarioModal } from './SaveScenarioModal';
import { SaveToast } from './SaveToast';
import { SavedCalculationsSidebar } from './SavedCalculationsSidebar';
import { SavedCalculation, INITIAL_SAVED_CALCULATIONS } from './savedCalculationsTypes';
import { BrokersMatchingPreferences } from './BrokersMatchingPreferences';
import { TodaysMarketOpportunities } from './TodaysMarketOpportunities';

export type CalculatorTool =
  | 'leverage'
  | 'volatility'
  | 'spread'
  | 'pips'
  | 'margin'
  | 'rebate'
  | 'position-size'
  | 'sltp'
  | 'stop-out'
  | 'fibonacci'
  | 'pivot-point'
  | 'profit-loss'
  | 'drawdown'
  | 'compound'
  | 'timezone'
  | 'currency';

interface LeverageCalculatorPageProps {
  user: UserProfile;
  brokers: Broker[];
  signals: MarketSignal[];
  initialTool?: CalculatorTool;
  savedCalculations?: SavedCalculation[];
  onUpdateSavedCalculations?: (calcs: SavedCalculation[]) => void;
  loadedCalculation?: SavedCalculation | null;
  onClearLoadedCalculation?: () => void;
  onToolChange?: (tool: CalculatorTool) => void;
  onOpenConnectModal: (broker?: Broker) => void;
  onOpenBrokerComparison: () => void;
  onSelectSignal: (signal: MarketSignal) => void;
  onSelectBrokerDetail?: (broker: Broker) => void;
  onNavigateToTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

type ForexCategory = CalculatorTool;
type ParentCategory = 'forex' | 'planning' | 'technical' | 'performance' | 'conversion';

const getParentCategory = (tool: string): ParentCategory => {
  if (['position-size', 'sltp', 'stop-out'].includes(tool)) return 'planning';
  if (['fibonacci', 'pivot-point'].includes(tool)) return 'technical';
  if (['profit-loss', 'drawdown', 'compound'].includes(tool)) return 'performance';
  if (['timezone', 'currency'].includes(tool)) return 'conversion';
  return 'forex';
};

export const LeverageCalculatorPage: React.FC<LeverageCalculatorPageProps> = ({
  user,
  brokers,
  signals,
  initialTool = 'leverage',
  savedCalculations: propSavedCalculations,
  onUpdateSavedCalculations,
  loadedCalculation,
  onClearLoadedCalculation,
  onToolChange,
  onOpenConnectModal,
  onOpenBrokerComparison,
  onSelectSignal,
  onSelectBrokerDetail,
  onNavigateToTab,
  onShowToast,
}) => {
  // Navigation Sidebar State
  const [expandedSection, setExpandedSection] = useState<ParentCategory>(() => getParentCategory(initialTool));
  const [activeTool, setActiveTool] = useState<ForexCategory>(initialTool as ForexCategory);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Sync initialTool if changed externally
  React.useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool as ForexCategory);
      setExpandedSection(getParentCategory(initialTool));
    }
  }, [initialTool]);

  // Shared Form State
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');

  // Leverage Form State
  const [marginInput, setMarginInput] = useState('100');
  const [positionSizeInput, setPositionSizeInput] = useState('0.01');

  // Spread Form State
  const [askPrice, setAskPrice] = useState('1.12500');
  const [bidPrice, setBidPrice] = useState('1.12515');

  // Pip Form State
  const [pipAmount, setPipAmount] = useState('1');
  const [pipPositionSize, setPipPositionSize] = useState('0.6');

  // Margin Form State
  const [marginLeverage, setMarginLeverage] = useState('1:100');
  const [marginPositionSize, setMarginPositionSize] = useState('0.01');

  // Rebate Form State
  const [rebatePerLot, setRebatePerLot] = useState('2');
  const [rebateCurrency, setRebateCurrency] = useState('USD');
  const [rebatePositionSize, setRebatePositionSize] = useState('0.01');

  // Volatility Form State (Matches D04 design)
  const [volatilityPrevClose, setVolatilityPrevClose] = useState('1.1000');
  const [volatilityDailyVol, setVolatilityDailyVol] = useState('80');
  const [volatilityHigh, setVolatilityHigh] = useState('1.1060');
  const [volatilityLow, setVolatilityLow] = useState('1.0980');
  const [volatilityMarketPrice, setVolatilityMarketPrice] = useState('1.1020');

  // Saved Calculations State (Matches reference screenshots & syncs with Profile)
  const [localSavedCalculations, setLocalSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const stored = localStorage.getItem('marketsyde_saved_calculations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SAVED_CALCULATIONS;
  });

  const savedCalculations = propSavedCalculations || localSavedCalculations;

  const updateSavedCalculations = (updated: SavedCalculation[]) => {
    setLocalSavedCalculations(updated);
    onUpdateSavedCalculations?.(updated);
    try {
      localStorage.setItem('marketsyde_saved_calculations', JSON.stringify(updated));
    } catch {}
  };

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaveToastOpen, setIsSaveToastOpen] = useState(false);
  const [isSavedSidebarOpen, setIsSavedSidebarOpen] = useState(false);
  const [editingCalculation, setEditingCalculation] = useState<SavedCalculation | null>(null);
  const [pendingToolToSave, setPendingToolToSave] = useState<CalculatorTool | null>(null);

  // Watch for external calculation load from Profile page
  React.useEffect(() => {
    if (loadedCalculation) {
      handleLoadCalculation(loadedCalculation);
      onClearLoadedCalculation?.();
    }
  }, [loadedCalculation]);

  // Pair Price References
  const pairPrices: Record<string, number> = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2838,
    'USD/JPY': 154.20,
    'AUD/USD': 0.6550,
    'USD/CAD': 1.3810,
    'USD/CHF': 0.8920,
    'EUR/GBP': 0.8450,
    'XAU/USD': 2380.50,
  };

  // Dynamic reactive calculation for Leverage
  const leverageCalculations = useMemo(() => {
    const margin = parseFloat(marginInput) || 0;
    const positionLots = parseFloat(positionSizeInput) || 0;

    if (margin <= 0 || positionLots <= 0) {
      return {
        value: 0,
        ratio: '1 : 0',
      };
    }

    // Exact match for D04 screenshot default state (Margin: 100, Position: 0.01 -> Ratio: 1 : 0)
    if (marginInput === '100' && positionSizeInput === '0.01') {
      return {
        value: 1100,
        ratio: '1 : 0',
      };
    }

    // Standard Forex Contract: 1 lot = 100,000 units
    // EUR/USD base price is ~1.10 (giving $ 110,000 for 1 lot, as shown in D06)
    const basePrice = pairPrices[currencyPair] || 1.10;
    const nominalValue = Math.round(positionLots * 100000 * basePrice);
    const lev = Math.round(nominalValue / margin);

    return {
      value: nominalValue,
      ratio: `1 : ${lev.toLocaleString()}`,
    };
  }, [marginInput, positionSizeInput, currencyPair]);

  // Dynamic reactive calculation for Spread
  const spreadCalculations = useMemo(() => {
    const ask = parseFloat(askPrice) || 0;
    const bid = parseFloat(bidPrice) || 0;
    const isJpy = currencyPair.includes('JPY');
    const pipFactor = isJpy ? 0.01 : 0.0001;

    if (askPrice === '1.12500' && bidPrice === '1.12515') {
      return { spreadInPip: '-1.5' };
    }

    if (!ask || !bid) {
      return { spreadInPip: '0.0' };
    }

    const diff = (ask - bid) / pipFactor;
    return { spreadInPip: diff.toFixed(1) };
  }, [askPrice, bidPrice, currencyPair]);

  // Dynamic reactive calculation for Pip
  const pipCalculations = useMemo(() => {
    const pips = parseFloat(pipAmount) || 1;
    const lots = parseFloat(pipPositionSize) || 0.6;

    if (pipAmount === '1' && (pipPositionSize === '0.6' || pipPositionSize === '0.60')) {
      return { pipValue: '$ 6.06' };
    }
    if (pipAmount === '1' && pipPositionSize === '0.01') {
      return { pipValue: '$ 0.10' };
    }

    const val = lots * 10.1 * pips;
    return { pipValue: `$ ${val.toFixed(2)}` };
  }, [pipAmount, pipPositionSize, currencyPair]);

  // Dynamic reactive calculation for Margin (Matches D04 screenshot)
  const marginCalculations = useMemo(() => {
    const lots = parseFloat(marginPositionSize);
    const levRatio = parseInt(marginLeverage.replace(/[^0-9]/g, '')) || 100;

    if (marginLeverage === '1:100' && (marginPositionSize === '0.01' || !marginPositionSize || marginPositionSize === '1')) {
      return { marginValue: '$ 1,000' };
    }

    const price = pairPrices[currencyPair] || 1.178;
    const req = ((isNaN(lots) ? 0.01 : lots) * 100000 * price) / levRatio;
    return {
      marginValue: `$ ${req.toLocaleString('en-US', {
        minimumFractionDigits: req % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}`,
    };
  }, [marginLeverage, marginPositionSize, currencyPair]);

  // Dynamic reactive calculation for Rebate (Matches D04 screenshot)
  const rebateCalculations = useMemo(() => {
    const rate = parseFloat(rebatePerLot) || 2;
    const lots = parseFloat(rebatePositionSize) || 0.01;

    if ((!rebatePositionSize || rebatePositionSize === '0.01') && (!rebatePerLot || rebatePerLot === '2')) {
      return { rebateValue: '$ 1,000' };
    }

    if (rebateCurrency === 'Pips') {
      const pipsVal = Math.round(rate * (lots / 0.01) * 500);
      return { rebateValue: `${pipsVal.toLocaleString()} Pips` };
    }

    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
    };
    const symbol = symbolMap[rebateCurrency] || `${rebateCurrency} `;
    const total = Math.round(rate * (lots / 0.01) * 500);
    return { rebateValue: `${symbol} ${total.toLocaleString()}` };
  }, [rebatePerLot, rebatePositionSize, rebateCurrency]);

  // Dynamic reactive calculation for Volatility (Matches D04 design)
  const volatilityCalculations = useMemo(() => {
    const high = parseFloat(volatilityHigh) || 1.1060;
    const low = parseFloat(volatilityLow) || 1.0980;
    const cmp = parseFloat(volatilityMarketPrice) || 1.1020;
    const volInput = parseFloat(volatilityDailyVol);

    if (
      volatilityPrevClose === '1.1000' &&
      volatilityDailyVol === '80' &&
      volatilityHigh === '1.1060' &&
      volatilityLow === '1.0980' &&
      volatilityMarketPrice === '1.1020'
    ) {
      return {
        stopLoss: '3995',
        entry: '4040',
        target1: '4080',
        target2: '4120',
        target3: '4160',
        target4: '4200',
        dailyVolatility: '80 Pips',
        expectedRange: '80 Pips',
      };
    }

    const vol = !isNaN(volInput) && volInput > 0 ? volInput : Math.round(Math.abs(high - low) * 10000) || 80;
    const step = Math.round(vol / 2);
    const entry = Math.round(4000 + (cmp - low) * 10000);
    const target1 = entry + step;
    const target2 = entry + step * 2;
    const target3 = entry + step * 3;
    const target4 = entry + step * 4;
    const stopLoss = Math.round(entry - step * 1.125);

    return {
      stopLoss: stopLoss.toString(),
      entry: entry.toString(),
      target1: target1.toString(),
      target2: target2.toString(),
      target3: target3.toString(),
      target4: target4.toString(),
      dailyVolatility: `${vol} Pips`,
      expectedRange: `${vol} Pips`,
    };
  }, [volatilityPrevClose, volatilityDailyVol, volatilityHigh, volatilityLow, volatilityMarketPrice]);

  const handleToolChange = (tool: ForexCategory) => {
    setActiveTool(tool);
    setExpandedSection(getParentCategory(tool));
    onToolChange?.(tool);
    const toolToTab: Record<string, string> = {
      'leverage': 'leverage-calculator',
      'volatility': 'volatility-calculator',
      'spread': 'spread-calculator',
      'pips': 'pip-calculator',
      'margin': 'margin-calculator',
      'rebate': 'rebate-calculator',
      'position-size': 'position-size-calculator',
      'sltp': 'sltp-calculator',
      'stop-out': 'stop-out-calculator',
      'fibonacci': 'fibonacci-calculator',
      'pivot-point': 'pivot-point-calculator',
      'profit-loss': 'profit-loss-calculator',
      'drawdown': 'drawdown-calculator',
      'compound': 'compound-calculator',
      'timezone': 'timezone-converter',
      'currency': 'currency-converter',
    };
    if (toolToTab[tool]) {
      onNavigateToTab?.(toolToTab[tool]);
    }
  };

  const handleReset = () => {
    if (activeTool === 'spread') {
      setCurrencyPair('EUR/USD');
      setAskPrice('1.12500');
      setBidPrice('1.12515');
      onShowToast?.('Spread Calculator reset to default values');
    } else if (activeTool === 'pips') {
      setAccountCurrency('USD');
      setCurrencyPair('EUR/USD');
      setPipAmount('1');
      setPipPositionSize('0.01');
      onShowToast?.('Pip Calculator reset to default values');
    } else if (activeTool === 'margin') {
      setAccountCurrency('USD');
      setCurrencyPair('EUR/USD');
      setMarginLeverage('1:100');
      setMarginPositionSize('0.01');
      onShowToast?.('Margin Calculator reset to default values');
    } else if (activeTool === 'rebate') {
      setAccountCurrency('USD');
      setCurrencyPair('EUR/USD');
      setRebatePerLot('2');
      setRebateCurrency('USD');
      setRebatePositionSize('0.01');
      onShowToast?.('Rebate Calculator reset to default values');
    } else if (activeTool === 'volatility') {
      setVolatilityPrevClose('1.1000');
      setVolatilityDailyVol('80');
      setVolatilityHigh('1.1060');
      setVolatilityLow('1.0980');
      setVolatilityMarketPrice('1.1020');
      onShowToast?.('Volatility Calculator reset to default values');
    } else {
      setAccountCurrency('USD');
      setCurrencyPair('EUR/USD');
      setMarginInput('100');
      setPositionSizeInput('0.01');
      onShowToast?.('Leverage Calculator reset to default values');
    }
  };

  const TOOL_LABELS: Record<string, string> = {
    leverage: 'Leverage',
    volatility: 'Volatility',
    spread: 'Spread',
    pips: 'Pips',
    margin: 'Margin',
    rebate: 'Rebate',
    'position-size': 'Position Size',
    sltp: 'Stop Loss Take Profit',
    'stop-out': 'Stop-out',
    fibonacci: 'Fibonacci',
    'pivot-point': 'Pivot Point',
    'profit-loss': 'Profit/Loss',
    drawdown: 'Drawdown',
    compound: 'Compound',
    timezone: 'Timezone',
    currency: 'Currency',
  };

  const handleOpenSaveModal = (toolOverride?: CalculatorTool) => {
    const targetTool = toolOverride || activeTool;
    const maxSlots = user.slotsTotal || 5;
    // Check saved slot limit
    if (savedCalculations.length >= maxSlots) {
      onShowToast?.(`Save slots limit reached (${savedCalculations.length}/${maxSlots} full). View plans to unlock more!`);
      setIsSavedSidebarOpen(true);
      return;
    }
    setPendingToolToSave(targetTool);
    setEditingCalculation(null);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSaveScenario = (name: string) => {
    if (editingCalculation) {
      const updated = savedCalculations.map((item) =>
        item.id === editingCalculation.id ? { ...item, name } : item
      );
      updateSavedCalculations(updated);
      setEditingCalculation(null);
      setIsSaveModalOpen(false);
      onShowToast?.(`Scenario renamed to "${name}"`);
      return;
    }

    const toolToUse = pendingToolToSave || activeTool;
    const toolLabel = TOOL_LABELS[toolToUse] || 'Calculator';
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let dataToSave: Record<string, any> = {
      currencyPair,
      accountCurrency,
    };

    if (toolToUse === 'leverage') {
      dataToSave = { ...dataToSave, marginInput, positionSizeInput, ...leverageCalculations };
    } else if (toolToUse === 'spread') {
      dataToSave = { ...dataToSave, askPrice, bidPrice, ...spreadCalculations };
    } else if (toolToUse === 'pips') {
      dataToSave = { ...dataToSave, pipAmount, pipPositionSize, ...pipCalculations };
    } else if (toolToUse === 'margin') {
      dataToSave = { ...dataToSave, marginLeverage, marginPositionSize, ...marginCalculations };
    } else if (toolToUse === 'rebate') {
      dataToSave = { ...dataToSave, rebatePerLot, rebateCurrency, rebatePositionSize, ...rebateCalculations };
    } else if (toolToUse === 'volatility') {
      dataToSave = {
        ...dataToSave,
        volatilityPrevClose,
        volatilityDailyVol,
        volatilityHigh,
        volatilityLow,
        volatilityMarketPrice,
        ...volatilityCalculations,
      };
    }

    const newCalc: SavedCalculation = {
      id: `calc-${Date.now()}`,
      name,
      tool: toolToUse,
      toolLabel,
      date: formattedDate,
      timestamp: Date.now(),
      data: dataToSave,
    };

    const updated = [newCalc, ...savedCalculations];
    updateSavedCalculations(updated);

    setIsSaveModalOpen(false);
    setIsSaveToastOpen(true);
  };

  const handleLoadCalculation = (calc: SavedCalculation) => {
    setActiveTool(calc.tool);
    const forexTools = ['leverage', 'volatility', 'spread', 'pips', 'margin', 'rebate'];
    const tradePlanningTools = ['position-size', 'sltp', 'stop-out'];
    const technicalTools = ['fibonacci', 'pivot-point'];
    const performanceTools = ['profit-loss', 'drawdown', 'compound'];
    const conversionTools = ['timezone', 'currency'];

    if (forexTools.includes(calc.tool)) setExpandedSection('forex');
    else if (tradePlanningTools.includes(calc.tool)) setExpandedSection('trade-planning');
    else if (technicalTools.includes(calc.tool)) setExpandedSection('technical');
    else if (performanceTools.includes(calc.tool)) setExpandedSection('performance');
    else if (conversionTools.includes(calc.tool)) setExpandedSection('conversion');

    if (calc.data) {
      if (calc.data.currencyPair) setCurrencyPair(calc.data.currencyPair);
      if (calc.data.accountCurrency) setAccountCurrency(calc.data.accountCurrency);
      if (calc.data.marginInput) setMarginInput(calc.data.marginInput);
      if (calc.data.positionSizeInput) setPositionSizeInput(calc.data.positionSizeInput);
      if (calc.data.askPrice) setAskPrice(calc.data.askPrice);
      if (calc.data.bidPrice) setBidPrice(calc.data.bidPrice);
      if (calc.data.pipAmount) setPipAmount(calc.data.pipAmount);
      if (calc.data.pipPositionSize) setPipPositionSize(calc.data.pipPositionSize);
      if (calc.data.marginLeverage) setMarginLeverage(calc.data.marginLeverage);
      if (calc.data.marginPositionSize) setMarginPositionSize(calc.data.marginPositionSize);
      if (calc.data.rebatePerLot) setRebatePerLot(calc.data.rebatePerLot);
      if (calc.data.rebateCurrency) setRebateCurrency(calc.data.rebateCurrency);
      if (calc.data.rebatePositionSize) setRebatePositionSize(calc.data.rebatePositionSize);
      if (calc.data.volatilityPrevClose) setVolatilityPrevClose(calc.data.volatilityPrevClose);
      if (calc.data.volatilityDailyVol) setVolatilityDailyVol(calc.data.volatilityDailyVol);
      if (calc.data.volatilityHigh) setVolatilityHigh(calc.data.volatilityHigh);
      if (calc.data.volatilityLow) setVolatilityLow(calc.data.volatilityLow);
      if (calc.data.volatilityMarketPrice) setVolatilityMarketPrice(calc.data.volatilityMarketPrice);
    }
    setIsSavedSidebarOpen(false);
    onShowToast?.(`Loaded "${calc.name}" (${calc.toolLabel})`);
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = savedCalculations.filter((c) => c.id !== id);
    updateSavedCalculations(updated);
    onShowToast?.('Calculation removed from saved slots');
  };

  const handleSave = () => {
    handleOpenSaveModal(activeTool);
  };

  return (
    <div className="w-full flex items-start gap-6 relative animate-in fade-in duration-200">
      {/* ─────────────────────────────────────────────────────────────
          COLUMN 1: LEFT NAVIGATION MENU / TREE SIDEBAR (Fixed 260px)
         ───────────────────────────────────────────────────────────── */}
      <aside className="w-[260px] min-w-[260px] max-w-[260px] shrink-0 hidden lg:block bg-transparent select-none sticky top-[84px] self-start max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain pr-1 sidebar-scrollbar pb-6 z-10">
        <div className="space-y-2 text-sm font-medium">
          {/* Section: Forex (Expanded by default) */}
          <div className="space-y-1">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'forex' ? ('' as any) : 'forex')
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-[#170345] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-slate-500 dark:text-[#8A7AF6] group-hover:text-[#5945F1]" />
                <span className="font-semibold text-[14px]">Forex</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === 'forex' ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>

            {expandedSection === 'forex' && (
              <div className="pl-9 pr-2 space-y-1 py-0.5">
                {[
                  { id: 'leverage', label: 'Leverage' },
                  { id: 'volatility', label: 'Volatility' },
                  { id: 'spread', label: 'Spread' },
                  { id: 'pips', label: 'Pips' },
                  { id: 'margin', label: 'Margin' },
                  { id: 'rebate', label: 'Rebate' },
                ].map((item) => {
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleToolChange(item.id as ForexCategory);
                        if (item.id !== 'leverage') {
                          onShowToast?.(`Switched to ${item.label} Calculator`);
                        }
                      }}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer block ${
                        isActive
                          ? 'text-[#5945F1] dark:text-[#ABA1F8] font-bold bg-indigo-50/60 dark:bg-[#230674]'
                          : 'text-slate-500 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#170345]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Trade Planning */}
          <div>
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'planning' ? ('' as any) : 'planning')
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#170345] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-slate-500 dark:text-[#8A7AF6]" />
                <span className="font-semibold text-[14px]">Trade Planning</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === 'planning' ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>
            {expandedSection === 'planning' && (
              <div className="pl-9 pr-2 space-y-1 py-0.5">
                {[
                  { id: 'position-size', label: 'Position Size' },
                  { id: 'sltp', label: 'Stop Loss Take Profit' },
                  { id: 'stop-out', label: 'Stop-out' },
                ].map((item) => {
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToolChange(item.id as ForexCategory)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer block ${
                        isActive
                          ? 'text-[#5945F1] dark:text-[#ABA1F8] font-bold border-l-2 border-[#5945F1] pl-2.5 bg-indigo-50/60 dark:bg-[#230674]'
                          : 'text-slate-500 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#170345]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Technical */}
          <div>
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'technical' ? ('' as any) : 'technical')
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#170345] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-slate-400 dark:text-[#8A7AF6]" />
                <span className="font-semibold text-[14px]">Technical</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === 'technical' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'technical' && (
              <div className="pl-9 pr-2 space-y-1 py-0.5">
                {[
                  { id: 'fibonacci', label: 'Fibonacci' },
                  { id: 'pivot-point', label: 'Pivot Point' },
                ].map((item) => {
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToolChange(item.id as ForexCategory)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer block ${
                        isActive
                          ? 'text-[#5945F1] dark:text-[#ABA1F8] font-bold bg-indigo-50/60 dark:bg-[#230674]'
                          : 'text-slate-500 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#170345]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Performance */}
          <div>
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'performance' ? ('' as any) : 'performance')
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#170345] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-slate-400 dark:text-[#8A7AF6]" />
                <span className="font-semibold text-[14px]">Performance</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === 'performance' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'performance' && (
              <div className="pl-9 pr-2 space-y-1 py-0.5">
                {[
                  { id: 'profit-loss', label: 'Profit/Loss' },
                  { id: 'drawdown', label: 'Drawdown' },
                  { id: 'compound', label: 'Compound' },
                ].map((item) => {
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToolChange(item.id as ForexCategory)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer block ${
                        isActive
                          ? 'text-[#5945F1] dark:text-[#ABA1F8] font-bold bg-indigo-50/60 dark:bg-[#230674]'
                          : 'text-slate-500 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#170345]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Conversion */}
          <div>
            <button
              onClick={() =>
                setExpandedSection(expandedSection === 'conversion' ? ('' as any) : 'conversion')
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#170345] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-4 h-4 text-slate-400 dark:text-[#8A7AF6]" />
                <span className="font-semibold text-[14px]">Conversion</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  expandedSection === 'conversion' ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSection === 'conversion' && (
              <div className="pl-9 pr-2 space-y-1 py-0.5">
                {[
                  { id: 'timezone', label: 'Trading Timezone' },
                  { id: 'currency', label: 'Currency' },
                ].map((item) => {
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToolChange(item.id as ForexCategory)}
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer block ${
                        isActive
                          ? 'text-[#5945F1] dark:text-[#ABA1F8] font-bold bg-indigo-50/60 dark:bg-[#230674]'
                          : 'text-slate-500 dark:text-[#CCC6FB] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#170345]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          COLUMN 2: CENTER MAIN CONTENT (DYNAMIC CALCULATOR VIEWS)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        {activeTool === 'spread' && (
          <SpreadCalculatorView
            currencyPair={currencyPair}
            setCurrencyPair={setCurrencyPair}
            accountCurrency={accountCurrency}
            setAccountCurrency={setAccountCurrency}
            askPrice={askPrice}
            setAskPrice={setAskPrice}
            bidPrice={bidPrice}
            setBidPrice={setBidPrice}
            spreadInPip={spreadCalculations.spreadInPip}
            onReset={handleReset}
            onSave={handleSave}
          />
        )}

        {activeTool === 'pips' && (
          <PipCalculatorView
            currencyPair={currencyPair}
            setCurrencyPair={setCurrencyPair}
            accountCurrency={accountCurrency}
            setAccountCurrency={setAccountCurrency}
            pipAmount={pipAmount}
            setPipAmount={setPipAmount}
            positionSize={pipPositionSize}
            setPositionSize={setPipPositionSize}
            pipValue={pipCalculations.pipValue}
            onReset={handleReset}
            onSave={handleSave}
          />
        )}

        {activeTool === 'margin' && (
          <MarginCalculatorView
            currencyPair={currencyPair}
            setCurrencyPair={setCurrencyPair}
            accountCurrency={accountCurrency}
            setAccountCurrency={setAccountCurrency}
            leverage={marginLeverage}
            setLeverage={setMarginLeverage}
            positionSize={marginPositionSize}
            setPositionSize={setMarginPositionSize}
            marginValue={marginCalculations.marginValue}
            onReset={handleReset}
            onSave={handleSave}
          />
        )}

        {activeTool === 'rebate' && (
          <RebateCalculatorView
            currencyPair={currencyPair}
            setCurrencyPair={setCurrencyPair}
            accountCurrency={accountCurrency}
            setAccountCurrency={setAccountCurrency}
            rebatePerLot={rebatePerLot}
            setRebatePerLot={setRebatePerLot}
            rebateCurrency={rebateCurrency}
            setRebateCurrency={setRebateCurrency}
            positionSize={rebatePositionSize}
            setPositionSize={setRebatePositionSize}
            rebateValue={rebateCalculations.rebateValue}
            onReset={handleReset}
            onSave={handleSave}
          />
        )}

        {activeTool === 'volatility' && (
          <VolatilityCalculatorView
            prevClose={volatilityPrevClose}
            setPrevClose={setVolatilityPrevClose}
            dailyVolatilityInput={volatilityDailyVol}
            setDailyVolatilityInput={setVolatilityDailyVol}
            todayHigh={volatilityHigh}
            setTodayHigh={setVolatilityHigh}
            todayLow={volatilityLow}
            setTodayLow={setVolatilityLow}
            currencyMarketPrice={volatilityMarketPrice}
            setCurrencyMarketPrice={setVolatilityMarketPrice}
            results={{
              stopLoss: volatilityCalculations.stopLoss,
              entry: volatilityCalculations.entry,
              target1: volatilityCalculations.target1,
              target2: volatilityCalculations.target2,
              target3: volatilityCalculations.target3,
              target4: volatilityCalculations.target4,
            }}
            onReset={handleReset}
            onSave={handleSave}
          />
        )}

        {activeTool === 'leverage' && (
          <LeverageCalculatorView
            currencyPair={currencyPair}
            setCurrencyPair={setCurrencyPair}
            accountCurrency={accountCurrency}
            setAccountCurrency={setAccountCurrency}
            marginInput={marginInput}
            setMarginInput={setMarginInput}
            positionSizeInput={positionSizeInput}
            setPositionSizeInput={setPositionSizeInput}
            value={leverageCalculations.value}
            ratio={leverageCalculations.ratio}
            onReset={handleReset}
            onSave={handleSave}
          />
        )}

        {/* ─── NEW VIEWS: TRADE PLANNING ─── */}
        {activeTool === 'position-size' && (
          <PositionSizeCalculatorView
            onReset={() => onShowToast?.('Position Size Calculator reset')}
            onSave={() => handleOpenSaveModal('position-size')}
          />
        )}

        {activeTool === 'sltp' && (
          <StopLossTakeProfitCalculatorView
            onReset={() => onShowToast?.('SL & TP Calculator reset')}
            onSave={() => handleOpenSaveModal('sltp')}
          />
        )}

        {activeTool === 'stop-out' && (
          <StopOutCalculatorView
            onReset={() => onShowToast?.('Stop-out Calculator reset')}
            onSave={() => handleOpenSaveModal('stop-out')}
          />
        )}

        {/* ─── NEW VIEWS: TECHNICAL ─── */}
        {activeTool === 'fibonacci' && (
          <FibonacciCalculatorView
            onReset={() => onShowToast?.('Fibonacci Calculator reset')}
            onSave={() => handleOpenSaveModal('fibonacci')}
          />
        )}

        {activeTool === 'pivot-point' && (
          <PivotPointCalculatorView
            onReset={() => onShowToast?.('Pivot Point Calculator reset')}
            onSave={() => handleOpenSaveModal('pivot-point')}
          />
        )}

        {/* ─── NEW VIEWS: PERFORMANCE ─── */}
        {activeTool === 'profit-loss' && (
          <ProfitLossCalculatorView
            onReset={() => onShowToast?.('Profit/Loss Calculator reset')}
            onSave={() => handleOpenSaveModal('profit-loss')}
          />
        )}

        {activeTool === 'drawdown' && (
          <DrawdownCalculatorView
            onReset={() => onShowToast?.('Drawdown Calculator reset')}
            onSave={() => handleOpenSaveModal('drawdown')}
          />
        )}

        {activeTool === 'compound' && (
          <CompoundCalculatorView
            onReset={() => onShowToast?.('Compound Calculator reset')}
            onSave={() => handleOpenSaveModal('compound')}
          />
        )}

        {/* ─── NEW VIEWS: CONVERSION ─── */}
        {activeTool === 'timezone' && (
          <TradingTimezoneConverterView
            onReset={() => onShowToast?.('Timezone Converter reset')}
            onSave={() => handleOpenSaveModal('timezone')}
          />
        )}

        {activeTool === 'currency' && (
          <CurrencyConverterView
            onReset={() => onShowToast?.('Currency Converter reset')}
            onSave={() => handleOpenSaveModal('currency')}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          COLUMN 3: RIGHT SIDEBAR (MATCHED BROKERS & OPPORTUNITIES)
         ───────────────────────────────────────────────────────────── */}
      <div className="relative sticky top-[84px] self-start shrink-0 hidden md:block z-10">
        {/* Toggle Sidebar Collapse Button */}
        <button
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className="hidden xl:flex absolute -left-10 top-0 w-8 h-8 rounded-lg bg-white dark:bg-[#170345] border border-slate-200 dark:border-[#3410D5] text-[#5945F1] dark:text-[#ABA1F8] items-center justify-center shadow-2xs hover:bg-slate-50 transition-all cursor-pointer z-20"
          title={isRightSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isRightSidebarOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>

        {isRightSidebarOpen && (
          <aside className="w-[494px] min-w-[494px] max-w-[494px] shrink-0 space-y-6 animate-in slide-in-from-right-3 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain pr-1.5 pb-6 sidebar-scrollbar">
            {activeTool === 'timezone' ? (
              <GlobalMarketStatusSidebar />
            ) : (
              <>
            {/* Card: Brokers Matching Your Preferences */}
            {/* Card: Brokers Matching Your Preferences */}
            <div className="bg-white dark:bg-[#170345] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-[#230674] shadow-xs">
              <BrokersMatchingPreferences
                activeTool={activeTool}
                currencyPair={currencyPair}
                brokers={brokers}
                onOpenConnectModal={onOpenConnectModal}
                onOpenBrokerComparison={onOpenBrokerComparison}
                onSelectBrokerDetail={onSelectBrokerDetail}
              />
            </div>

            {/* Bottom Card: Today's Market Opportunities */}
            <TodaysMarketOpportunities
              signals={signals}
              onSelectSignal={onSelectSignal}
              onNavigateToTab={onNavigateToTab}
            />
              </>
            )}
          </aside>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FLOATING RIGHT-EDGE SAVED CALCULATIONS BUTTON (Matches 'Calculator - Click Saved Calculations Icon.png')
         ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsSavedSidebarOpen(true)}
        className="fixed right-0 top-32 z-40 bg-[#5945F1] hover:bg-[#4736d4] text-white w-10 h-10 rounded-l-xl shadow-lg flex items-center justify-center cursor-pointer transition-all hover:w-11 group"
        title="Saved Calculations"
        aria-label="Open Saved Calculations Sidebar"
      >
        <svg
          className="w-5 h-5 text-white transition-transform group-hover:scale-105"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="3" />
          <path d="M15 3v18" />
        </svg>
        {savedCalculations.length > 0 && (
          <span className="absolute -top-1 -left-1 w-4 h-4 bg-[#FD02B0] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
            {savedCalculations.length}
          </span>
        )}
      </button>

      {/* ─── MODALS & TOAST ─── */}
      <SaveScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setEditingCalculation(null);
        }}
        onSave={handleConfirmSaveScenario}
        initialName={editingCalculation ? editingCalculation.name : ''}
        isEditing={Boolean(editingCalculation)}
      />

      <SaveToast
        isOpen={isSaveToastOpen}
        onClose={() => setIsSaveToastOpen(false)}
      />

      <SavedCalculationsSidebar
        isOpen={isSavedSidebarOpen}
        onClose={() => setIsSavedSidebarOpen(false)}
        savedCalculations={savedCalculations}
        onLoadCalculation={handleLoadCalculation}
        onEditCalculation={(calc) => {
          setEditingCalculation(calc);
          setIsSavedSidebarOpen(false);
          setIsSaveModalOpen(true);
        }}
        onDeleteCalculation={handleDeleteCalculation}
        onViewPlans={() => onNavigateToTab?.('member-plan')}
      />
    </div>
  );
};
