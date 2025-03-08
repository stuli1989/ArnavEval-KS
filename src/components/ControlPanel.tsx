import React from 'react';
import { RefreshCw, FileDown } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const ControlPanel: React.FC = () => {
  const { calculateProjection, exportCsv } = usePortfolio();
  
  return (
    <div className="card mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Controls</h2>
        
        <div className="flex space-x-4">
          <button
            onClick={calculateProjection}
            className="btn btn-secondary inline-flex items-center"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh Calculations
          </button>
          
          <button
            onClick={exportCsv}
            className="btn btn-primary inline-flex items-center"
          >
            <FileDown size={18} className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 