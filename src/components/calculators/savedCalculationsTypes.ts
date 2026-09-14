import { CalculatorTool } from './LeverageCalculatorPage';

export interface SavedCalculation {
  id: string;
  name: string;
  tool: CalculatorTool;
  toolLabel: string;
  date: string; // e.g. "Aug 4"
  timestamp: number;
  data: Record<string, any>;
}

export const INITIAL_SAVED_CALCULATIONS: SavedCalculation[] = [
  {
    id: 'calc-prototype',
    name: 'Prototype Design',
    tool: 'leverage',
    toolLabel: 'Leverage',
    date: 'Aug 4',
    timestamp: 1722758400000,
    data: {
      currencyPair: 'EUR/USD',
      accountCurrency: 'USD',
      marginInput: '1000',
      positionSizeInput: '1',
    },
  },
  {
    id: 'calc-high-risk',
    name: 'High-Risk 50:1',
    tool: 'leverage',
    toolLabel: 'Leverage',
    date: 'Jul 28',
    timestamp: 1722153600000,
    data: {
      currencyPair: 'EUR/USD',
      accountCurrency: 'USD',
      marginInput: '2000',
      positionSizeInput: '1',
    },
  },
];
