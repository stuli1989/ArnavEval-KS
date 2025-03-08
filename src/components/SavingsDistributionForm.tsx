import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SavingsDistribution } from '../types';
import { generateId, validateDistributionPercentages } from '../utils/helpers';

const SavingsDistributionForm: React.FC = () => {
  const { portfolio, dispatch } = usePortfolio();
  const { startYear, endYear, assets } = portfolio;
  
  const [newDistribution, setNewDistribution] = useState<Omit<SavingsDistribution, 'id'>>({
    startYear: startYear,
    endYear: endYear,
    distribution: {}
  });
  
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [error, setError] = useState('');
  
  // Initialize percentages when assets change
  useEffect(() => {
    const savingsAssets = assets.filter(asset => asset.isForSavings);
    if (savingsAssets.length === 0) return;
    
    // Distribute evenly among savings assets
    const evenPercentage = Math.floor(100 / savingsAssets.length);
    const remainder = 100 - (evenPercentage * savingsAssets.length);
    
    const newPercentages: Record<string, number> = {};
    savingsAssets.forEach((asset, index) => {
      newPercentages[asset.id] = evenPercentage + (index === 0 ? remainder : 0);
    });
    
    setPercentages(newPercentages);
    setTotalPercentage(100);
    setNewDistribution(prev => ({ ...prev, distribution: newPercentages }));
  }, [assets]);
  
  // Update total percentage when individual percentages change
  useEffect(() => {
    const total = Object.values(percentages).reduce((sum, val) => sum + val, 0);
    setTotalPercentage(total);
    
    if (total !== 100) {
      setError('Total percentage must equal 100%');
    } else {
      setError('');
      setNewDistribution(prev => ({ ...prev, distribution: percentages }));
    }
  }, [percentages]);
  
  const handleYearChange = (field: 'startYear' | 'endYear', value: string) => {
    const yearValue = parseInt(value);
    if (isNaN(yearValue)) return;
    
    setNewDistribution(prev => ({ ...prev, [field]: yearValue }));
  };
  
  const handlePercentageChange = (assetId: string, value: string) => {
    const percentValue = parseInt(value);
    if (isNaN(percentValue)) return;
    
    setPercentages(prev => ({ ...prev, [assetId]: percentValue }));
  };
  
  const handleAddDistribution = () => {
    if (
      !validateDistributionPercentages(newDistribution.distribution) ||
      newDistribution.startYear > newDistribution.endYear
    ) {
      return;
    }
    
    // Check for overlapping date ranges
    const hasOverlap = portfolio.savingsDistributions.some(dist => 
      (dist.startYear <= newDistribution.endYear && dist.endYear >= newDistribution.startYear)
    );
    
    if (hasOverlap) {
      setError('Distribution date ranges cannot overlap');
      return;
    }
    
    dispatch({
      type: 'ADD_SAVINGS_DISTRIBUTION',
      payload: { ...newDistribution, id: generateId() },
    });
    
    // Reset form
    setNewDistribution({
      startYear: newDistribution.endYear + 1,
      endYear: endYear,
      distribution: {}
    });
    
    // Reinitialize percentages
    const savingsAssets = assets.filter(asset => asset.isForSavings);
    const evenPercentage = Math.floor(100 / savingsAssets.length);
    const remainder = 100 - (evenPercentage * savingsAssets.length);
    
    const newPercentages: Record<string, number> = {};
    savingsAssets.forEach((asset, index) => {
      newPercentages[asset.id] = evenPercentage + (index === 0 ? remainder : 0);
    });
    
    setPercentages(newPercentages);
  };
  
  const handleUpdateDistribution = (id: string, field: keyof SavingsDistribution, value: any) => {
    const distToUpdate = portfolio.savingsDistributions.find(dist => dist.id === id);
    if (!distToUpdate) return;
    
    let updatedValue = value;
    if (field === 'startYear' || field === 'endYear') {
      updatedValue = parseInt(value);
    }
    
    dispatch({
      type: 'UPDATE_SAVINGS_DISTRIBUTION',
      payload: { ...distToUpdate, [field]: updatedValue },
    });
  };
  
  const handleUpdateDistributionPercentage = (id: string, assetId: string, value: string) => {
    const distToUpdate = portfolio.savingsDistributions.find(dist => dist.id === id);
    if (!distToUpdate) return;
    
    const percentValue = parseInt(value);
    if (isNaN(percentValue)) return;
    
    const newDistribution = {
      ...distToUpdate.distribution,
      [assetId]: percentValue
    };
    
    // Check if total is 100%
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    if (total !== 100) return;
    
    dispatch({
      type: 'UPDATE_SAVINGS_DISTRIBUTION',
      payload: { ...distToUpdate, distribution: newDistribution },
    });
  };
  
  const handleRemoveDistribution = (id: string) => {
    dispatch({ type: 'REMOVE_SAVINGS_DISTRIBUTION', payload: id });
  };
  
  // Get savings-eligible assets
  const savingsAssets = assets.filter(asset => asset.isForSavings);
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Savings Distribution</h2>
      
      {savingsAssets.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            You need to add at least one asset marked for savings before you can create a distribution.
          </p>
        </div>
      ) : (
        <>
          {/* Existing Distributions */}
          {portfolio.savingsDistributions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3">Current Distributions</h3>
              {portfolio.savingsDistributions.map((dist) => (
                <div key={dist.id} className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Year
                        </label>
                        <input
                          type="number"
                          value={dist.startYear}
                          onChange={(e) => handleUpdateDistribution(dist.id, 'startYear', e.target.value)}
                          className="input-field"
                          min={startYear}
                          max={dist.endYear}
                          aria-label={`Start year for distribution ${dist.id}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Year
                        </label>
                        <input
                          type="number"
                          value={dist.endYear}
                          onChange={(e) => handleUpdateDistribution(dist.id, 'endYear', e.target.value)}
                          className="input-field"
                          min={dist.startYear}
                          max={endYear}
                          aria-label={`End year for distribution ${dist.id}`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDistribution(dist.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove distribution"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {savingsAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center">
                        <div className="w-1/3">
                          <label className="block text-sm font-medium text-gray-700">
                            {asset.name}
                          </label>
                        </div>
                        <div className="w-1/3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={dist.distribution[asset.id] || 0}
                            onChange={(e) => handleUpdateDistributionPercentage(dist.id, asset.id, e.target.value)}
                            className="w-full"
                            aria-label={`Percentage for ${asset.name}`}
                          />
                        </div>
                        <div className="w-1/3 pl-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={dist.distribution[asset.id] || 0}
                            onChange={(e) => handleUpdateDistributionPercentage(dist.id, asset.id, e.target.value)}
                            className="input-field w-20 text-right"
                            aria-label={`Percentage input for ${asset.name}`}
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center font-medium mt-2">
                      <div className="w-1/3">
                        Total
                      </div>
                      <div className="w-1/3">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              Object.values(dist.distribution).reduce((sum, val) => sum + val, 0) === 100 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Object.values(dist.distribution).reduce((sum, val) => sum + val, 0)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-1/3 pl-4">
                        {Object.values(dist.distribution).reduce((sum, val) => sum + val, 0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add New Distribution */}
          <div className="border rounded-md p-4">
            <h3 className="text-md font-medium mb-3">Add New Distribution</h3>
            
            <div className="flex space-x-4 mb-4">
              <div>
                <label htmlFor="dist-start-year" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  id="dist-start-year"
                  value={newDistribution.startYear}
                  onChange={(e) => handleYearChange('startYear', e.target.value)}
                  className="input-field"
                  min={startYear}
                  max={newDistribution.endYear}
                />
              </div>
              <div>
                <label htmlFor="dist-end-year" className="block text-sm font-medium text-gray-700 mb-1">
                  End Year
                </label>
                <input
                  type="number"
                  id="dist-end-year"
                  value={newDistribution.endYear}
                  onChange={(e) => handleYearChange('endYear', e.target.value)}
                  className="input-field"
                  min={newDistribution.startYear}
                  max={endYear}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-4">
              {savingsAssets.map((asset) => (
                <div key={asset.id} className="flex items-center">
                  <div className="w-1/3">
                    <label htmlFor={`asset-${asset.id}-percentage`} className="block text-sm font-medium text-gray-700">
                      {asset.name}
                    </label>
                  </div>
                  <div className="w-1/3">
                    <input
                      type="range"
                      id={`asset-${asset.id}-percentage`}
                      min="0"
                      max="100"
                      value={percentages[asset.id] || 0}
                      onChange={(e) => handlePercentageChange(asset.id, e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="w-1/3 pl-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percentages[asset.id] || 0}
                      onChange={(e) => handlePercentageChange(asset.id, e.target.value)}
                      className="input-field w-20 text-right"
                      aria-label={`Percentage input for ${asset.name}`}
                    />
                    <span className="ml-1">%</span>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center font-medium mt-2">
                <div className="w-1/3">
                  Total
                </div>
                <div className="w-1/3">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${totalPercentage === 100 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${totalPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-1/3 pl-4">
                  {totalPercentage}%
                </div>
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm mb-3">
                {error}
              </div>
            )}
            
            <button
              onClick={handleAddDistribution}
              className="btn btn-primary inline-flex items-center"
              disabled={totalPercentage !== 100 || !!error}
            >
              <PlusCircle size={18} className="mr-2" />
              Add Distribution
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SavingsDistributionForm; 