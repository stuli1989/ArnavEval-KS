import { Portfolio, CalculationResult, Asset, IncomeStream, ExpenseStream, MajorExpense, SavingsDistribution } from '../types';

export const calculatePortfolioProjection = (portfolio: Portfolio): CalculationResult => {
  const { startYear, endYear, incomeStreams, expenseStreams, majorExpenses, assets, savingsDistributions } = portfolio;
  
  // Initialize result data structure
  const years: number[] = [];
  const incomes: Record<string, number[]> = {};
  const expenses: Record<string, number[]> = {};
  const assetValues: Record<string, number[]> = {};
  const netWorth: number[] = [];
  const savings: number[] = [];
  const majorExpensesOneTime: Record<string, { year: number; amount: number }> = {};
  
  // Ensure the end year is after the start year
  const actualEndYear = Math.max(startYear, endYear);
  
  // Initialize arrays for each year
  for (let year = startYear; year <= actualEndYear; year++) {
    years.push(year);
  }

  // Initialize income streams
  incomeStreams.forEach(stream => {
    incomes[stream.id] = Array(years.length).fill(0);
  });

  // Initialize expense streams
  expenseStreams.forEach(stream => {
    expenses[stream.id] = Array(years.length).fill(0);
  });

  // Initialize asset values
  assets.forEach(asset => {
    assetValues[asset.id] = Array(years.length).fill(0);
    // Set initial value for the start year
    const yearIndex = 0;
    assetValues[asset.id][yearIndex] = asset.currentAmount;
  });

  // Handle edge case where there are no entries in one of the categories
  if (Object.keys(expenses).length === 0) {
    expenses["default"] = Array(years.length).fill(0);
  }
  
  if (Object.keys(incomes).length === 0) {
    incomes["default"] = Array(years.length).fill(0);
  }
  
  if (Object.keys(assetValues).length === 0) {
    // Create a default asset if none exist
    const defaultAssetId = "default";
    assetValues[defaultAssetId] = Array(years.length).fill(0);
  }

  // Calculate year by year
  try {
    for (let i = 0; i < years.length; i++) {
      const currentYear = years[i];
      
      // Calculate incomes for this year
      calculateIncomeForYear(currentYear, i, incomeStreams, incomes);
      
      // Calculate expenses for this year
      calculateExpensesForYear(currentYear, i, expenseStreams, expenses);
      
      // Process one-time major expenses
      processMajorExpensesForYear(currentYear, majorExpenses, expenses, majorExpensesOneTime);
      
      // Calculate total income and expense for the year
      const totalIncome = calculateTotalValueForYear(incomes, i);
      const totalExpense = calculateTotalValueForYear(expenses, i);
      
      // Calculate saving or burning for the year
      const yearSavings = totalIncome - totalExpense;
      savings.push(yearSavings);
      
      // Update asset values
      if (i > 0) { // Skip for the first year which is already initialized
        updateAssetValuesForYear(currentYear, i, assets, assetValues, yearSavings, savingsDistributions);
      }
      
      // Calculate net worth
      const yearNetWorth = Object.values(assetValues).reduce(
        (sum, values) => sum + values[i], 0
      );
      netWorth.push(yearNetWorth);
    }
  } catch (error) {
    console.error("Error during calculation:", error);
    // Return a minimal valid result structure
    return {
      years,
      incomes,
      expenses,
      majorExpenses: majorExpensesOneTime,
      assets: assetValues,
      netWorth: Array(years.length).fill(0),
      savings: Array(years.length).fill(0)
    };
  }
  
  return {
    years,
    incomes,
    expenses,
    majorExpenses: majorExpensesOneTime,
    assets: assetValues,
    netWorth,
    savings
  };
};

// Helper functions
const calculateIncomeForYear = (
  currentYear: number, 
  yearIndex: number, 
  incomeStreams: IncomeStream[], 
  incomes: Record<string, number[]>
) => {
  incomeStreams.forEach(stream => {
    if (currentYear >= stream.startYear && currentYear <= stream.endYear) {
      if (yearIndex === 0) {
        // First year, use the initial amount
        incomes[stream.id][yearIndex] = stream.annualAmount;
      } else {
        // Subsequent years, apply growth rate
        const previousAmount = incomes[stream.id][yearIndex - 1];
        incomes[stream.id][yearIndex] = previousAmount * (1 + stream.annualGrowth / 100);
      }
    }
  });
};

const calculateExpensesForYear = (
  currentYear: number, 
  yearIndex: number, 
  expenseStreams: ExpenseStream[], 
  expenses: Record<string, number[]>
) => {
  expenseStreams.forEach(stream => {
    if (currentYear >= stream.startYear && currentYear <= stream.endYear) {
      if (yearIndex === 0) {
        // First year, use the initial amount
        expenses[stream.id][yearIndex] = stream.annualAmount;
      } else {
        // Subsequent years, apply growth rate
        const previousAmount = expenses[stream.id][yearIndex - 1];
        expenses[stream.id][yearIndex] = previousAmount * (1 + stream.annualGrowth / 100);
      }
    }
  });
};

const processMajorExpensesForYear = (
  currentYear: number, 
  majorExpenses: MajorExpense[], 
  expenses: Record<string, number[]>,
  majorExpensesOneTime: Record<string, { year: number; amount: number }>
) => {
  majorExpenses.forEach(expense => {
    if (expense.isInInstallments) {
      // Handle installment expenses as recurring expenses
      if (currentYear >= expense.installmentStartYear && currentYear <= expense.installmentEndYear) {
        if (!expenses[`installment-${expense.id}`]) {
          expenses[`installment-${expense.id}`] = Array(expenses[Object.keys(expenses)[0]].length).fill(0);
        }
        const yearIndex = currentYear - expense.installmentStartYear;
        expenses[`installment-${expense.id}`][yearIndex] = expense.annualInstallmentAmount;
      }
    } else {
      // One-time expense
      if (currentYear === expense.installmentStartYear) {
        majorExpensesOneTime[expense.id] = { 
          year: currentYear, 
          amount: expense.totalAmount 
        };
      }
    }
  });
};

const calculateTotalValueForYear = (values: Record<string, number[]>, yearIndex: number): number => {
  return Object.values(values).reduce(
    (total, yearValues) => total + (yearValues[yearIndex] || 0), 0
  );
};

const updateAssetValuesForYear = (
  currentYear: number, 
  yearIndex: number, 
  assets: Asset[], 
  assetValues: Record<string, number[]>, 
  yearSavings: number,
  savingsDistributions: SavingsDistribution[]
) => {
  // First, grow each asset by its growth rate
  assets.forEach(asset => {
    const previousValue = assetValues[asset.id][yearIndex - 1];
    assetValues[asset.id][yearIndex] = previousValue * (1 + asset.annualGrowth / 100);
  });
  
  // Then, handle savings or burning
  if (yearSavings > 0) {
    // Positive savings - distribute according to the savings distribution
    const applicableDistribution = savingsDistributions.find(
      dist => currentYear >= dist.startYear && currentYear <= dist.endYear
    );
    
    if (applicableDistribution) {
      // Check if there are any assets with isForSavings=true
      const savingsAssets = assets.filter(asset => asset.isForSavings);
      
      if (savingsAssets.length > 0 && Object.keys(applicableDistribution.distribution).length > 0) {
        Object.entries(applicableDistribution.distribution).forEach(([assetId, percentage]) => {
          // Make sure the asset still exists
          if (assetValues[assetId]) {
            assetValues[assetId][yearIndex] += yearSavings * (percentage / 100);
          }
        });
      } else {
        // If no savings distribution is set up, distribute equally among assets marked for savings
        const savingsAssets = assets.filter(asset => asset.isForSavings);
        if (savingsAssets.length > 0) {
          const equalShare = yearSavings / savingsAssets.length;
          savingsAssets.forEach(asset => {
            assetValues[asset.id][yearIndex] += equalShare;
          });
        } else if (assets.length > 0) {
          // If no assets are marked for savings, add to the first asset
          const firstAssetId = assets[0].id;
          assetValues[firstAssetId][yearIndex] += yearSavings;
        }
      }
    } else {
      // If no applicable distribution found, distribute equally among assets marked for savings
      const savingsAssets = assets.filter(asset => asset.isForSavings);
      if (savingsAssets.length > 0) {
        const equalShare = yearSavings / savingsAssets.length;
        savingsAssets.forEach(asset => {
          assetValues[asset.id][yearIndex] += equalShare;
        });
      } else if (assets.length > 0) {
        // If no assets are marked for savings, add to the first asset
        const firstAssetId = assets[0].id;
        assetValues[firstAssetId][yearIndex] += yearSavings;
      }
    }
  } else if (yearSavings < 0) {
    // Negative savings (burning) - go through assets in order of spend priority
    const sortedAssets = [...assets].sort((a, b) => b.spendPriority - a.spendPriority);
    let remainingBurn = -yearSavings;
    
    for (const asset of sortedAssets) {
      const currentValue = assetValues[asset.id][yearIndex];
      
      if (currentValue >= remainingBurn) {
        // This asset can cover the remaining burn
        assetValues[asset.id][yearIndex] -= remainingBurn;
        break;
      } else {
        // Consume this asset fully and continue to the next
        remainingBurn -= currentValue;
        assetValues[asset.id][yearIndex] = 0;
      }
    }
  }
};

// Function to calculate annual installment amount based on loan terms
export const calculateAnnualInstallment = (
  principal: number, 
  annualInterest: number, 
  startYear: number, 
  endYear: number
): number => {
  const years = endYear - startYear + 1;
  const rate = annualInterest / 100;
  
  if (rate === 0) {
    return principal / years;
  }
  
  // Using the formula: A = P(r(1+r)^n)/((1+r)^n-1)
  const installment = principal * (rate * Math.pow(1 + rate, years)) / (Math.pow(1 + rate, years) - 1);
  return installment;
};

// Export data to CSV
export const exportToCsv = (data: CalculationResult): string => {
  const { years, incomes, expenses, assets, netWorth, savings } = data;
  
  // Prepare headers
  const headers = ['Year', ...Object.keys(incomes).map(id => `Income: ${id}`), 
    ...Object.keys(expenses).map(id => `Expense: ${id}`),
    ...Object.keys(assets).map(id => `Asset: ${id}`),
    'Net Worth', 'Savings'];
  
  // Prepare rows
  const rows = years.map((year, i) => {
    return [
      year.toString(),
      ...Object.values(incomes).map(values => values[i].toFixed(2)),
      ...Object.values(expenses).map(values => values[i].toFixed(2)),
      ...Object.values(assets).map(values => values[i].toFixed(2)),
      netWorth[i].toFixed(2),
      savings[i].toFixed(2)
    ];
  });
  
  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  return csvContent;
}; 