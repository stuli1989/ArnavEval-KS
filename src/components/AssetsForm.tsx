import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Asset } from '../types';
import { generateId } from '../utils/helpers';

const assetTypes = [
  'Cash & Equivalents',
  'Stocks & Equities',
  'Movable Property (Car)',
  'Immovable Property (House)'
] as const;

const AssetsForm: React.FC = () => {
  const { portfolio, dispatch } = usePortfolio();
  
  const [newAsset, setNewAsset] = useState<Omit<Asset, 'id'>>({
    type: 'Cash & Equivalents',
    name: '',
    currentAmount: 0,
    annualGrowth: 3.0,
    spendPriority: 5,
    isForSavings: true
  });
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    
    if (name === 'currentAmount' || name === 'annualGrowth' || name === 'spendPriority') {
      setNewAsset({ ...newAsset, [name]: parseFloat(value) });
    } else if (name === 'isForSavings') {
      setNewAsset({ ...newAsset, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'type') {
      setNewAsset({ 
        ...newAsset, 
        [name]: value as Asset['type']
      });
    } else {
      setNewAsset({ ...newAsset, [name]: value });
    }
  };
  
  const handleAddAsset = () => {
    if (!newAsset.name || newAsset.currentAmount < 0) {
      return;
    }
    
    dispatch({
      type: 'ADD_ASSET',
      payload: { ...newAsset, id: generateId() },
    });
    
    setNewAsset({
      type: 'Cash & Equivalents',
      name: '',
      currentAmount: 0,
      annualGrowth: 3.0,
      spendPriority: 5,
      isForSavings: true
    });
  };
  
  const handleUpdateAsset = (id: string, field: keyof Asset, value: string | number | boolean) => {
    const assetToUpdate = portfolio.assets.find(asset => asset.id === id);
    if (!assetToUpdate) return;
    
    let updatedValue: string | number | boolean = value;
    if (field === 'currentAmount' || field === 'annualGrowth' || field === 'spendPriority') {
      updatedValue = parseFloat(value.toString());
    } else if (field === 'isForSavings') {
      updatedValue = !!value;
    } else if (field === 'type') {
      updatedValue = value as Asset['type'];
    }
    
    dispatch({
      type: 'UPDATE_ASSET',
      payload: { ...assetToUpdate, [field]: updatedValue },
    });
  };
  
  const handleRemoveAsset = (id: string) => {
    dispatch({ type: 'REMOVE_ASSET', payload: id });
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Assets</h2>
      
      {/* Existing Assets */}
      {portfolio.assets.length > 0 && (
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-right py-2 px-3">Current Amount</th>
                <th className="text-right py-2 px-3">Annual Growth %</th>
                <th className="text-center py-2 px-3">Spend Priority</th>
                <th className="text-center py-2 px-3">For Savings</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {portfolio.assets.map((asset) => (
                <tr key={asset.id} className="border-b">
                  <td className="py-2 px-3">
                    <select
                      value={asset.type}
                      onChange={(e) => handleUpdateAsset(asset.id, 'type', e.target.value)}
                      className="input-field"
                      aria-label={`Asset type for ${asset.name}`}
                    >
                      {assetTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(e) => handleUpdateAsset(asset.id, 'name', e.target.value)}
                      className="input-field"
                      aria-label={`Asset name for ${asset.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={asset.currentAmount}
                      onChange={(e) => handleUpdateAsset(asset.id, 'currentAmount', e.target.value)}
                      className="input-field text-right"
                      min="0"
                      step="1000"
                      aria-label={`Current amount for ${asset.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={asset.annualGrowth}
                      onChange={(e) => handleUpdateAsset(asset.id, 'annualGrowth', e.target.value)}
                      className="input-field text-right"
                      step="0.1"
                      aria-label={`Annual growth for ${asset.name}`}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <select
                      value={asset.spendPriority}
                      onChange={(e) => handleUpdateAsset(asset.id, 'spendPriority', e.target.value)}
                      className="input-field"
                      aria-label={`Spend priority for ${asset.name}`}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={asset.isForSavings}
                      onChange={(e) => handleUpdateAsset(asset.id, 'isForSavings', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      aria-label={`Is for savings for ${asset.name}`}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => handleRemoveAsset(asset.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove asset"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add New Asset */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-md font-medium">Add New Asset</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label htmlFor="asset-type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="asset-type"
              name="type"
              className="input-field"
              value={newAsset.type}
              onChange={handleInputChange}
            >
              {assetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="asset-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="asset-name"
              name="name"
              className="input-field"
              placeholder="e.g., Savings Account, 401(k)"
              value={newAsset.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="asset-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Current Amount
            </label>
            <input
              type="number"
              id="asset-amount"
              name="currentAmount"
              className="input-field"
              value={newAsset.currentAmount}
              onChange={handleInputChange}
              min="0"
              step="1000"
              placeholder="0"
            />
          </div>
          
          <div>
            <label htmlFor="asset-growth" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Growth %
            </label>
            <input
              type="number"
              id="asset-growth"
              name="annualGrowth"
              className="input-field"
              value={newAsset.annualGrowth}
              onChange={handleInputChange}
              step="0.1"
              placeholder="3.0"
            />
          </div>
          
          <div>
            <label htmlFor="asset-priority" className="block text-sm font-medium text-gray-700 mb-1">
              Spend Priority
            </label>
            <select
              id="asset-priority"
              name="spendPriority"
              className="input-field"
              value={newAsset.spendPriority}
              onChange={handleInputChange}
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Higher is spent first</p>
          </div>
          
          <div className="flex items-end mb-2">
            <div className="flex items-center h-10">
              <input
                type="checkbox"
                id="asset-savings"
                name="isForSavings"
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={newAsset.isForSavings}
                onChange={handleInputChange}
              />
              <label htmlFor="asset-savings" className="ml-2 block text-sm font-medium text-gray-700">
                Add savings into this asset
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <button
            onClick={handleAddAsset}
            className="btn btn-primary inline-flex items-center"
            disabled={!newAsset.name}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsForm; 