import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Portfolio, IncomeStream, ExpenseStream, MajorExpense, Asset, SavingsDistribution, CalculationResult } from '../types';
import { generateId, getCurrentYear, calculateBirthYear } from '../utils/helpers';
import { calculatePortfolioProjection, exportToCsv } from '../utils/calculations';

// Define the initial state
const initialPortfolio: Portfolio = {
  startYear: getCurrentYear(),
  endYear: getCurrentYear() + 60,
  userAge: 30,
  birthYear: calculateBirthYear(30),
  incomeStreams: [],
  expenseStreams: [],
  majorExpenses: [],
  assets: [],
  savingsDistributions: []
};

// Define actions
type Action =
  | { type: 'SET_USER_AGE'; payload: number }
  | { type: 'SET_START_YEAR'; payload: number }
  | { type: 'SET_END_YEAR'; payload: number }
  | { type: 'ADD_INCOME_STREAM'; payload: IncomeStream }
  | { type: 'UPDATE_INCOME_STREAM'; payload: IncomeStream }
  | { type: 'REMOVE_INCOME_STREAM'; payload: string }
  | { type: 'ADD_EXPENSE_STREAM'; payload: ExpenseStream }
  | { type: 'UPDATE_EXPENSE_STREAM'; payload: ExpenseStream }
  | { type: 'REMOVE_EXPENSE_STREAM'; payload: string }
  | { type: 'ADD_MAJOR_EXPENSE'; payload: MajorExpense }
  | { type: 'UPDATE_MAJOR_EXPENSE'; payload: MajorExpense }
  | { type: 'REMOVE_MAJOR_EXPENSE'; payload: string }
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'UPDATE_ASSET'; payload: Asset }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'ADD_SAVINGS_DISTRIBUTION'; payload: SavingsDistribution }
  | { type: 'UPDATE_SAVINGS_DISTRIBUTION'; payload: SavingsDistribution }
  | { type: 'REMOVE_SAVINGS_DISTRIBUTION'; payload: string };

// Define the context type
interface PortfolioContextType {
  portfolio: Portfolio;
  calculationResult: CalculationResult | null;
  dispatch: React.Dispatch<Action>;
  calculateProjection: () => void;
  exportCsv: () => void;
}

// Create context
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// Reducer function
const portfolioReducer = (state: Portfolio, action: Action): Portfolio => {
  switch (action.type) {
    case 'SET_USER_AGE':
      return {
        ...state,
        userAge: action.payload,
        birthYear: calculateBirthYear(action.payload)
      };
    case 'SET_START_YEAR':
      return {
        ...state,
        startYear: action.payload
      };
    case 'SET_END_YEAR':
      return {
        ...state,
        endYear: action.payload
      };
    case 'ADD_INCOME_STREAM':
      return {
        ...state,
        incomeStreams: [...state.incomeStreams, action.payload]
      };
    case 'UPDATE_INCOME_STREAM':
      return {
        ...state,
        incomeStreams: state.incomeStreams.map(stream =>
          stream.id === action.payload.id ? action.payload : stream
        )
      };
    case 'REMOVE_INCOME_STREAM':
      return {
        ...state,
        incomeStreams: state.incomeStreams.filter(stream => stream.id !== action.payload)
      };
    case 'ADD_EXPENSE_STREAM':
      return {
        ...state,
        expenseStreams: [...state.expenseStreams, action.payload]
      };
    case 'UPDATE_EXPENSE_STREAM':
      return {
        ...state,
        expenseStreams: state.expenseStreams.map(stream =>
          stream.id === action.payload.id ? action.payload : stream
        )
      };
    case 'REMOVE_EXPENSE_STREAM':
      return {
        ...state,
        expenseStreams: state.expenseStreams.filter(stream => stream.id !== action.payload)
      };
    case 'ADD_MAJOR_EXPENSE':
      return {
        ...state,
        majorExpenses: [...state.majorExpenses, action.payload]
      };
    case 'UPDATE_MAJOR_EXPENSE':
      return {
        ...state,
        majorExpenses: state.majorExpenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    case 'REMOVE_MAJOR_EXPENSE':
      return {
        ...state,
        majorExpenses: state.majorExpenses.filter(expense => expense.id !== action.payload)
      };
    case 'ADD_ASSET':
      return {
        ...state,
        assets: [...state.assets, action.payload]
      };
    case 'UPDATE_ASSET':
      return {
        ...state,
        assets: state.assets.map(asset =>
          asset.id === action.payload.id ? action.payload : asset
        )
      };
    case 'REMOVE_ASSET':
      return {
        ...state,
        assets: state.assets.filter(asset => asset.id !== action.payload),
        // Also remove this asset from any savings distributions
        savingsDistributions: state.savingsDistributions.map(dist => ({
          ...dist,
          distribution: Object.fromEntries(
            Object.entries(dist.distribution).filter(([assetId]) => assetId !== action.payload)
          )
        }))
      };
    case 'ADD_SAVINGS_DISTRIBUTION':
      return {
        ...state,
        savingsDistributions: [...state.savingsDistributions, action.payload]
      };
    case 'UPDATE_SAVINGS_DISTRIBUTION':
      return {
        ...state,
        savingsDistributions: state.savingsDistributions.map(dist =>
          dist.id === action.payload.id ? action.payload : dist
        )
      };
    case 'REMOVE_SAVINGS_DISTRIBUTION':
      return {
        ...state,
        savingsDistributions: state.savingsDistributions.filter(dist => dist.id !== action.payload)
      };
    default:
      return state;
  }
};

// Provider component
export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, dispatch] = useReducer(portfolioReducer, initialPortfolio);
  const [calculationResult, setCalculationResult] = React.useState<CalculationResult | null>(null);

  // Calculate the projection when the portfolio changes
  const calculateProjection = () => {
    try {
      const result = calculatePortfolioProjection(portfolio);
      setCalculationResult(result);
    } catch (error) {
      console.error('Error calculating projection:', error);
    }
  };

  // Export the calculation result to CSV
  const exportCsv = () => {
    if (!calculationResult) return;

    const csvContent = exportToCsv(calculationResult);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'financial-projection.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate initial projection
  useEffect(() => {
    calculateProjection();
  }, [portfolio]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        calculationResult,
        dispatch,
        calculateProjection,
        exportCsv
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

// Custom hook to use the portfolio context
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}; 