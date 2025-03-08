// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Get current year
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

// Calculate birth year from age
export const calculateBirthYear = (age: number): number => {
  return getCurrentYear() - age;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (percentage: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(percentage / 100);
};

// Check if all savings distributions cover the entire time range
export const validateSavingsDistributions = (
  startYear: number,
  endYear: number,
  distributions: { startYear: number; endYear: number }[]
): boolean => {
  if (distributions.length === 0) {
    return false;
  }

  // Sort distributions by start year
  const sorted = [...distributions].sort((a, b) => a.startYear - b.startYear);

  // Check if the first distribution starts at or before the portfolio start year
  if (sorted[0].startYear > startYear) {
    return false;
  }

  // Check if the last distribution ends at or after the portfolio end year
  if (sorted[sorted.length - 1].endYear < endYear) {
    return false;
  }

  // Check for gaps between distributions
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].endYear + 1 !== sorted[i + 1].startYear) {
      return false;
    }
  }

  return true;
};

// Check if savings distribution percentages sum to 100
export const validateDistributionPercentages = (
  distribution: Record<string, number>
): boolean => {
  const sum = Object.values(distribution).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 100) < 0.01; // Allow small floating point errors
}; 