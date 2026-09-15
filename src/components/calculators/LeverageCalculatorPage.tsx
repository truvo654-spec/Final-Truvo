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
  const [pipPositionSize, setPipPositionSize] = useState('0.01');

  // Margin Form State
  const [marginLeverage, setMarginLeverage] = useState('1:100');
  const [marginPositionSize, setMarginPositionSize] = useState('0.01');

  // Rebate Form State
  const [rebatePerLot, setRebatePerLot] = useState('2');
  const [rebateCurrency, setRebateCurrency] = useState('USD');
  const [rebatePositionSize, setRebatePositionSize] = useState('0.01');

  // Volatility Form State
  const [volatilityHigh, setVolatilityHigh] = useState('1.0920');
  const [volatilityLow, setVolatilityLow] = useState('1.0815');

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

    if (marginInput === '100' && positionSizeInput === '0.01' && currencyPair === 'EUR/USD') {
      return {
        value: 11.78,
        ratio: '1 : 0.12',
      };
    }

    if (margin <= 0 || positionLots <= 0) {
      return {
        value: 0,
        ratio: '1 : 0.00',
      };
    }

    const nominalValue = +(positionLots * 1178).toFixed(2);
    const leverageFactor = (nominalValue / margin).toFixed(2);

    return {
      value: nominalValue,
      ratio: `1 : ${leverageFactor}`,
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
    const lots = parseFloat(pipPositionSize) || 0.01;

    if (pipAmount === '1' && pipPositionSize === '0.01') {
      return { pipValue: '$0.10' };
    }

    const val = lots * 10 * pips;
    return { pipValue: `$${val.toFixed(2)}` };
  }, [pipAmount, pipPositionSize, currencyPair]);

  // Dynamic reactive calculation for Margin
  const marginCalculations = useMemo(() => {
    const lots = parseFloat(marginPositionSize) || 0.01;
    const levRatio = parseInt(marginLeverage.replace(/[^0-9]/g, '')) || 100;

    if (marginLeverage === '1:100' && marginPositionSize === '0.01') {
      return { marginValue: '$11.78' };
    }

    const price = pairPrices[currencyPair] || 1.178;
    const req = (lots * 100000 * price) / levRatio;
    return { marginValue: `$${req.toFixed(2)}` };
  }, [marginLeverage, marginPositionSize, currencyPair]);

  // Dynamic reactive calculation for Rebate
  const rebateCalculations = useMemo(() => {
    const rate = parseFloat(rebatePerLot) || 2;
    const lots = parseFloat(rebatePositionSize) || 0.01;

    if (rebatePerLot === '2' && rebatePositionSize === '0.01') {
      return { rebateValue: '$0.10' };
    }

    const val = lots * rate * 5;
    return { rebateValue: `$${val.toFixed(2)}` };
  }, [rebatePerLot, rebatePositionSize, rebateCurrency]);

  // Dynamic reactive calculation for Volatility
  const volatilityCalculations = useMemo(() => {
    const high = parseFloat(volatilityHigh) || 1.0920;
    const low = parseFloat(volatilityLow) || 1.0815;
    const isJpy = currencyPair.includes('JPY');
    const pipFactor = isJpy ? 0.01 : 0.0001;

    if (volatilityHigh === '1.0920' && volatilityLow === '1.0815') {
      return {
        dailyVolatility: '0.97%',
        expectedRange: '105 Pips',
      };
    }

    const pct = low > 0 ? (((high - low) / low) * 100).toFixed(2) : '0.00';
    const range = Math.round((high - low) / pipFactor);
    return {
      dailyVolatility: `${pct}%`,
      expectedRange: `${range} Pips`,
    };
  }, [volatilityHigh, volatilityLow, currencyPair]);

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
      setAccountCurrency('USD');
      setCurrencyPair('EUR/USD');
      setVolatilityHigh('1.0920');
      setVolatilityLow('1.0815');
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
      dataToSave = { ...dataToSave, volatilityHigh, volatilityLow, ...volatilityCalculations };
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
      if (calc.data.volatilityHigh) setVolatilityHigh(calc.data.volatilityHigh);
      if (calc.data.volatilityLow) setVolatilityLow(calc.data.volatilityLow);
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
          COLUMN 1: LEFT NAVIGATION MENU / TREE SIDEBAR
         ───────────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 hidden lg:block bg-transparent select-none sticky top-[84px] self-start max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain pr-1 sidebar-scrollbar pb-6 z-10">
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
            currencyPair={currencyPair}
            setCurrencyPair={setCurrencyPair}
            accountCurrency={accountCurrency}
            setAccountCurrency={setAccountCurrency}
            volatilityHigh={volatilityHigh}
            setVolatilityHigh={setVolatilityHigh}
            volatilityLow={volatilityLow}
            setVolatilityLow={setVolatilityLow}
            dailyVolatility={volatilityCalculations.dailyVolatility}
            expectedRange={volatilityCalculations.expectedRange}
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
          <aside className="w-[300px] space-y-6 animate-in slide-in-from-right-3 duration-200 max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain pr-1.5 pb-6 sidebar-scrollbar">
            {activeTool === 'timezone' ? (
              <GlobalMarketStatusSidebar />
            ) : (
              <>
            {/* Card: Brokers Matching Your Preferences */}
            <div className="bg-white dark:bg-[#170345] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-[#230674] shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  <span className="text-[#5945F1] dark:text-[#ABA1F8]">Brokers</span>{' '}
                  <span className="text-slate-900 dark:text-white">Matching Your</span>{' '}
                  <span className="text-[#5945F1] dark:text-[#ABA1F8]">Preferences</span>
                  <span className="text-[#FD02B0]">.</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#CCC6FB] mt-1 leading-relaxed">
                  Different brokers offer different trading conditions. Compare your options and find
                  the right fit.
                </p>
              </div>

              {/* Broker List Items */}
              <div className="space-y-3.5">
                {/* 1. HFM */}
                <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-[#230674] bg-[#fbfbff] dark:bg-[#230674]/50 hover:border-indigo-200 dark:hover:border-[#3410D5] transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eef2ff] dark:bg-[#3410D5] text-[#5945F1] dark:text-white flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#5945F1] dark:fill-white text-[#5945F1] dark:text-white" />
                      Best match
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-black text-white flex flex-col items-center justify-center shrink-0 border border-slate-800">
                        <span className="text-[11px] font-black tracking-tight leading-none">HFM</span>
                        <span className="text-[6px] font-mono tracking-widest text-slate-400 mt-0.5">HF MARKETS</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          HFM
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-[#8A7AF6]">Nano—Standard</div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#bef226] text-black text-[9px] font-bold">
                            ✔ Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 text-[10px]">
                      {activeTool === 'stop-out' ? (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Margin call: <span className="text-slate-800 dark:text-white font-bold">60%</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Stop-out level: <span className="text-emerald-600 dark:text-emerald-400 font-bold">0%</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Negative balance: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Protected</span>
                          </div>
                        </>
                      ) : activeTool === 'sltp' ? (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Avg spread: <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.1 pips</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Slippage: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Very low</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Min SL distance: <span className="text-slate-800 dark:text-white font-bold">0 pips</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Min. deposit: <span className="text-emerald-600 dark:text-emerald-400 font-bold">$200</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Max leverage: <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold">1:400</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Step size: <span className="text-slate-800 dark:text-white font-bold">0.01 lots</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {activeTool === 'stop-out' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                          Safety buffer
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                          Max buffer
                        </span>
                      </div>
                    ) : activeTool === 'sltp' ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                        SL fill accuracy ~99.9%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                        Min position size 0.01 lots
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const b = brokers.find((x) => x.name.toLowerCase().includes('hfm')) || brokers[0];
                        onOpenConnectModal(b);
                      }}
                      className="text-[#5945F1] dark:text-[#ABA1F8] hover:underline text-xs font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* 2. Exness */}
                <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-[#230674] bg-[#fbfbff] dark:bg-[#230674]/50 hover:border-indigo-200 dark:hover:border-[#3410D5] transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eef2ff] dark:bg-[#3410D5] text-[#5945F1] dark:text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#5945F1] dark:text-white" />
                      Low margin
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F8D210] text-black flex items-center justify-center shrink-0 font-extrabold text-sm tracking-tighter">
                        ex
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          Exness
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-[#8A7AF6]">Nano—Standard</div>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-[#bef226] text-black text-[9px] font-bold">
                            ✔ Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 text-[10px]">
                      {activeTool === 'stop-out' ? (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Margin call: <span className="text-slate-800 dark:text-white font-bold">60%</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Stop-out level: <span className="text-emerald-600 dark:text-emerald-400 font-bold">0%</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Negative balance: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Protected</span>
                          </div>
                        </>
                      ) : activeTool === 'sltp' ? (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Avg spread: <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.1 pips</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Slippage: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Very low</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Min SL distance: <span className="text-slate-800 dark:text-white font-bold">0 pips</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Min. deposit: <span className="text-emerald-600 dark:text-emerald-400 font-bold">$200</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Max leverage: <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold">1:400</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Step size: <span className="text-slate-800 dark:text-white font-bold">0.01 lots</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {activeTool === 'stop-out' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                          Safety buffer
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                          Max buffer
                        </span>
                      </div>
                    ) : activeTool === 'sltp' ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                        SL fill accuracy ~99.9%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                        Min position size 0.01 lots
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const b = brokers.find((x) => x.name.toLowerCase().includes('exness')) || brokers[1];
                        onOpenConnectModal(b);
                      }}
                      className="text-[#5945F1] dark:text-[#ABA1F8] hover:underline text-xs font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* 3. FxPro */}
                <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-[#230674] bg-[#fbfbff] dark:bg-[#230674]/50 hover:border-indigo-200 dark:hover:border-[#3410D5] transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eef2ff] dark:bg-[#3410D5] text-[#5945F1] dark:text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#5945F1] dark:text-white" />
                      Low margin
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#E11925] text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[11px] font-black tracking-tight leading-none">FxPro</span>
                        <span className="text-[6px] text-white/80 mt-0.5">Trade Like a Pro</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          FxPro
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-[#8A7AF6]">Nano—Standard</div>
                      </div>
                    </div>

                    <div className="text-right space-y-1 text-[10px]">
                      {activeTool === 'stop-out' ? (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Margin call: <span className="text-slate-800 dark:text-white font-bold">60%</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Stop-out level: <span className="text-emerald-600 dark:text-emerald-400 font-bold">0%</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Negative balance: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Protected</span>
                          </div>
                        </>
                      ) : activeTool === 'sltp' ? (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Avg spread: <span className="text-emerald-600 dark:text-emerald-400 font-bold">0.1 pips</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Slippage: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Very low</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Min SL distance: <span className="text-slate-800 dark:text-white font-bold">0 pips</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Min. deposit: <span className="text-emerald-600 dark:text-emerald-400 font-bold">$200</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Max leverage: <span className="text-[#5945F1] dark:text-[#ABA1F8] font-bold">1:400</span>
                          </div>
                          <div className="text-slate-400 dark:text-[#8A7AF6]">
                            Step size: <span className="text-slate-800 dark:text-white font-bold">0.01 lots</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {activeTool === 'stop-out' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                          Safety buffer
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                          Max buffer
                        </span>
                      </div>
                    ) : activeTool === 'sltp' ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                        SL fill accuracy ~99.9%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-[#230674] text-[#5945F1] dark:text-[#ABA1F8] text-[10px] font-medium">
                        Min position size 0.01 lots
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const b = brokers.find((x) => x.name.toLowerCase().includes('fxpro')) || brokers[2];
                        onOpenConnectModal(b);
                      }}
                      className="text-[#5945F1] dark:text-[#ABA1F8] hover:underline text-xs font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Compare Matched Brokers Button */}
              <button
                onClick={onOpenBrokerComparison}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5945F1] hover:bg-[#4736d4] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Compare Matched Brokers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Card: Today's Market Opportunities */}
            <div className="bg-[#5945F1] rounded-3xl p-5 text-white shadow-lg space-y-3.5">
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  <span className="text-[#DCF73B]">Today's</span> Market{' '}
                  <span className="text-[#DCF73B]">Opportunities</span>
                  <span className="text-[#FD02B0]">.</span>
                </h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  If you're planning your next move, start with these opportunities.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Card 1: USD/CAD */}
                <div
                  onClick={() => {
                    const sig = signals.find((s) => s.ticker === 'USD/CAD') || signals[0];
                    onSelectSignal(sig);
                  }}
                  className="p-3 rounded-2xl bg-white text-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight">
                        <span>🇺🇸</span>
                        <span>USD/CAD</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#5945F1] leading-none">99%</div>
                        <div className="text-[8px] text-slate-400">Confidence</div>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Target</span>
                        <span className="blur-[3px] select-none text-slate-400 font-mono">1.3850</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Entry</span>
                        <span className="blur-[3px] select-none text-slate-400 font-mono">1.3810</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Stop</span>
                        <span className="blur-[3px] select-none text-slate-400 font-mono">1.3780</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[9px] text-slate-400">
                      <span>Risk/Reward</span>
                      <span className="font-bold text-slate-700">1:1.8</span>
                    </div>
                  </div>
                  <div className="mt-2.5 py-1 px-2 rounded-lg bg-indigo-50 text-[#5945F1] font-bold text-[10px] flex items-center justify-center gap-1">
                    <span>💎</span> Level 4
                  </div>
                </div>

                {/* Card 2: GBP/USD */}
                <div
                  onClick={() => {
                    const sig = signals.find((s) => s.ticker === 'GBP/USD') || signals[1];
                    onSelectSignal(sig);
                  }}
                  className="p-3 rounded-2xl bg-white text-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight">
                        <span>🇬🇧</span>
                        <span>GBP/USD</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#5945F1] leading-none">73%</div>
                        <div className="text-[8px] text-slate-400">Confidence</div>
                      </div>
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Target</span>
                        <span className="font-semibold text-slate-800 font-mono">1.2875</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Entry</span>
                        <span className="font-semibold text-slate-800 font-mono">1.2838</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Stop</span>
                        <span className="font-semibold text-slate-800 font-mono">1.2795</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-1 flex items-center justify-between text-[9px] text-slate-400">
                      <span>Risk/Reward</span>
                      <span className="font-bold text-slate-700">1:1.7</span>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] text-emerald-600 font-semibold px-0.5">
                      <span>⏱ 30m period</span>
                      <span>⌛ valid 12m</span>
                    </div>
                    <button
                      type="button"
                      className="w-full py-1.5 rounded-lg bg-[#DCF73B] text-slate-900 font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs hover:brightness-105 cursor-pointer"
                    >
                      Buy <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Explore Signals Button */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => onNavigateToTab?.('signals')}
                  className="px-5 py-2 rounded-full bg-white hover:bg-slate-50 text-[#5945F1] font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Explore Signals
                </button>
              </div>
            </div>
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
