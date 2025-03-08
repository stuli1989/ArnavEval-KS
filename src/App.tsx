import React from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import BasicInfoForm from './components/BasicInfoForm';
import IncomeStreamsForm from './components/IncomeStreamsForm';
import ExpenseStreamsForm from './components/ExpenseStreamsForm';
import AssetsForm from './components/AssetsForm';
import MajorExpensesForm from './components/MajorExpensesForm';
import SavingsDistributionForm from './components/SavingsDistributionForm';
import FinancialChart from './components/FinancialChart';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Personal Financial Tracker</h1>
            <p className="text-gray-600">Plan your financial future and track your long-term goals</p>
          </header>
          
          <div className="grid grid-cols-1 gap-6">
            <ControlPanel />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <BasicInfoForm />
                <IncomeStreamsForm />
                <ExpenseStreamsForm />
              </div>
              <div>
                <AssetsForm />
                <MajorExpensesForm />
                <SavingsDistributionForm />
              </div>
            </div>
            
            <FinancialChart />
          </div>
          
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Personal Financial Tracker. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </PortfolioProvider>
  );
};

export default App;
