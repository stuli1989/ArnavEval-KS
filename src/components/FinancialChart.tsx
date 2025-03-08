import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  TooltipProps
} from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { formatCurrency } from '../utils/helpers';

interface ChartData {
  year: number;
  netWorth: number;
  savings: number;
  [key: string]: number;
}

const FinancialChart: React.FC = () => {
  const { calculationResult, portfolio } = usePortfolio();
  
  if (!calculationResult || !calculationResult.years || calculationResult.years.length === 0) {
    return (
      <div className="card p-6 flex items-center justify-center h-96">
        <p className="text-gray-500">No data to display. Add your financial information to see projections.</p>
      </div>
    );
  }
  
  try {
    const { years, incomes, expenses, assets, majorExpenses, netWorth, savings } = calculationResult;
    
    // Verify that all required arrays have the same length
    const expectedLength = years.length;
    if (!netWorth || !savings || netWorth.length !== expectedLength || savings.length !== expectedLength) {
      throw new Error("Inconsistent data arrays");
    }
    
    // Prepare data for the chart
    const chartData: ChartData[] = years.map((year, index) => {
      const dataPoint: ChartData = { 
        year, 
        netWorth: netWorth[index] || 0, 
        savings: savings[index] || 0 
      };
      
      // Add income streams
      if (incomes && typeof incomes === 'object') {
        Object.entries(incomes).forEach(([id, values]) => {
          if (Array.isArray(values) && values.length > index) {
            const stream = portfolio.incomeStreams.find(s => s.id === id);
            if (stream) {
              dataPoint[`income-${stream.name}`] = values[index] || 0;
            }
          }
        });
      }
      
      // Add expense streams (as negative values)
      if (expenses && typeof expenses === 'object') {
        Object.entries(expenses).forEach(([id, values]) => {
          if (Array.isArray(values) && values.length > index) {
            // Check if it's a regular expense or an installment
            if (id.startsWith('installment-')) {
              const expenseId = id.replace('installment-', '');
              const expense = portfolio.majorExpenses.find(e => e.id === expenseId);
              if (expense) {
                dataPoint[`expense-${expense.name}`] = -(values[index] || 0);
              }
            } else {
              const stream = portfolio.expenseStreams.find(s => s.id === id);
              if (stream) {
                dataPoint[`expense-${stream.name}`] = -(values[index] || 0);
              }
            }
          }
        });
      }
      
      // Add asset values
      if (assets && typeof assets === 'object') {
        Object.entries(assets).forEach(([id, values]) => {
          if (Array.isArray(values) && values.length > index) {
            const asset = portfolio.assets.find(a => a.id === id);
            if (asset) {
              dataPoint[`asset-${asset.name}`] = values[index] || 0;
            }
          }
        });
      }
      
      return dataPoint;
    });
    
    // Prepare one-time major expenses for scatter plot
    const scatterData = majorExpenses && typeof majorExpenses === 'object' ? 
      Object.entries(majorExpenses).map(([id, data]) => {
        if (!data || typeof data !== 'object') return null;
        
        const expense = portfolio.majorExpenses.find(e => e.id === id);
        return {
          year: data.year,
          amount: -(data.amount || 0),
          name: expense?.name || 'Major Expense',
        };
      }).filter(Boolean) : [];
    
    // Get income stream names for the chart
    const incomeStreamNames = portfolio.incomeStreams.map(stream => ({
      dataKey: `income-${stream.name}`,
      name: stream.name,
      color: '#4CAF50',
    }));
    
    // Get expense stream names for the chart
    const expenseStreamNames = portfolio.expenseStreams.map(stream => ({
      dataKey: `expense-${stream.name}`,
      name: stream.name,
      color: '#F44336',
    }));
    
    // Get installment expense names for the chart
    const installmentNames = portfolio.majorExpenses
      .filter(expense => expense.isInInstallments)
      .map(expense => ({
        dataKey: `expense-${expense.name}`,
        name: expense.name,
        color: '#FF9800',
      }));
    
    // Get asset names for the chart
    const assetNames = portfolio.assets.map(asset => ({
      dataKey: `asset-${asset.name}`,
      name: asset.name,
      color: getAssetColor(asset.type),
    }));
    
    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-4 border rounded shadow-lg">
            <p className="font-bold">{`Year: ${label}`}</p>
            <div className="mt-2">
              {payload.map((entry, index) => (
                <p key={index} style={{ color: entry.color }}>
                  {entry.name}: {formatCurrency(entry.value as number)}
                </p>
              ))}
            </div>
          </div>
        );
      }
      return null;
    };
    
    return (
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Financial Projection</h2>
        
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Income Streams (stacked bars above 0) */}
              {incomeStreamNames.length > 0 && incomeStreamNames.map((stream, index) => (
                <Bar
                  key={stream.dataKey}
                  dataKey={stream.dataKey}
                  name={`Income: ${stream.name}`}
                  stackId="income"
                  fill={lightenColor(stream.color, index * 10)}
                  barSize={40}
                />
              ))}
              
              {/* Expense Streams (stacked bars below 0) */}
              {expenseStreamNames.length > 0 && expenseStreamNames.map((stream, index) => (
                <Bar
                  key={stream.dataKey}
                  dataKey={stream.dataKey}
                  name={`Expense: ${stream.name}`}
                  stackId="expense"
                  fill={lightenColor(stream.color, index * 10)}
                  barSize={40}
                />
              ))}
              
              {/* Installment Expenses (stacked with regular expenses) */}
              {installmentNames.length > 0 && installmentNames.map((stream, index) => (
                <Bar
                  key={stream.dataKey}
                  dataKey={stream.dataKey}
                  name={`Loan: ${stream.name}`}
                  stackId="expense"
                  fill={lightenColor(stream.color, index * 10)}
                  barSize={40}
                />
              ))}
              
              {/* Assets (stacked areas) */}
              {assetNames.length > 0 && assetNames.map((asset, index) => (
                <Area
                  key={asset.dataKey}
                  type="monotone"
                  dataKey={asset.dataKey}
                  name={`Asset: ${asset.name}`}
                  stackId="assets"
                  fill={lightenColor(asset.color, index * 5)}
                  stroke={asset.color}
                  fillOpacity={0.6}
                />
              ))}
              
              {/* One-time Major Expenses (scatter dots) */}
              {scatterData.length > 0 && (
                <Scatter
                  name="Major Expense"
                  data={scatterData}
                  fill="#9C27B0"
                  shape="diamond"
                  legendType="diamond"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in FinancialChart component:", error);
    return (
      <div className="card p-6 flex items-center justify-center h-96">
        <p className="text-gray-500">An error occurred. Please try again later.</p>
      </div>
    );
  }
};

// Helper function to get color based on asset type
function getAssetColor(type: string): string {
  switch (type) {
    case 'Cash & Equivalents':
      return '#2196F3'; // Blue
    case 'Stocks & Equities':
      return '#673AB7'; // Deep Purple
    case 'Movable Property (Car)':
      return '#009688'; // Teal
    case 'Immovable Property (House)':
      return '#3F51B5'; // Indigo
    default:
      return '#607D8B'; // Blue Grey
  }
}

// Helper function to lighten a color
function lightenColor(color: string, amount: number): string {
  // Simple lightening for demo purposes
  // In a real app, you might want to use a proper color manipulation library
  const lightenHex = (hex: string): string => {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  return lightenHex(color);
}

export default FinancialChart; 