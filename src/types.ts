export interface IncomeStream {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  annualAmount: number;
  annualGrowth: number;
}

export interface ExpenseStream {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  annualAmount: number;
  annualGrowth: number;
}

export interface MajorExpense {
  id: string;
  name: string;
  totalAmount: number;
  isInInstallments: boolean;
  annualInstallmentAmount: number;
  installmentStartYear: number;
  installmentEndYear: number;
  annualInterest: number;
}

export interface Asset {
  id: string;
  type: 'Cash & Equivalents' | 'Stocks & Equities' | 'Movable Property (Car)' | 'Immovable Property (House)';
  name: string;
  currentAmount: number;
  annualGrowth: number;
  spendPriority: number;
  isForSavings: boolean;
}

export interface SavingsDistribution {
  id: string;
  startYear: number;
  endYear: number;
  distribution: Record<string, number>; // Asset ID -> percentage
}

export interface Portfolio {
  startYear: number;
  endYear: number;
  userAge: number;
  birthYear: number;
  incomeStreams: IncomeStream[];
  expenseStreams: ExpenseStream[];
  majorExpenses: MajorExpense[];
  assets: Asset[];
  savingsDistributions: SavingsDistribution[];
}

export interface CalculationResult {
  years: number[];
  incomes: Record<string, number[]>; // Year -> Income by stream
  expenses: Record<string, number[]>; // Year -> Expense by stream
  majorExpenses: Record<string, { year: number; amount: number }>; // One-time expenses
  assets: Record<string, number[]>; // Year -> Asset values
  netWorth: number[]; // Year -> Net Worth
  savings: number[]; // Year -> Savings
} 