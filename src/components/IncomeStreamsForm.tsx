import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { IncomeStream } from '../types';
import { generateId, getCurrentYear } from '../utils/helpers';

const IncomeStreamsForm: React.FC = () => {
  const { portfolio, dispatch } = usePortfolio();
  const currentYear = getCurrentYear();
  
  const [newStream, setNewStream] = useState<Omit<IncomeStream, 'id'>>({
    name: '',
    startYear: currentYear,
    endYear: currentYear + 30,
    annualAmount: 0,
    annualGrowth: 3.0,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startYear' || name === 'endYear' || name === 'annualAmount' || name === 'annualGrowth') {
      setNewStream({ ...newStream, [name]: parseFloat(value) });
    } else {
      setNewStream({ ...newStream, [name]: value });
    }
  };
  
  const handleAddStream = () => {
    if (!newStream.name || newStream.annualAmount <= 0) {
      return;
    }
    
    dispatch({
      type: 'ADD_INCOME_STREAM',
      payload: { ...newStream, id: generateId() },
    });
    
    setNewStream({
      name: '',
      startYear: currentYear,
      endYear: currentYear + 30,
      annualAmount: 0,
      annualGrowth: 3.0,
    });
  };
  
  const handleUpdateStream = (id: string, field: keyof IncomeStream, value: string | number) => {
    const streamToUpdate = portfolio.incomeStreams.find(stream => stream.id === id);
    if (!streamToUpdate) return;
    
    let updatedValue: string | number = value;
    if (field === 'startYear' || field === 'endYear' || field === 'annualAmount' || field === 'annualGrowth') {
      updatedValue = parseFloat(value.toString());
    }
    
    dispatch({
      type: 'UPDATE_INCOME_STREAM',
      payload: { ...streamToUpdate, [field]: updatedValue },
    });
  };
  
  const handleRemoveStream = (id: string) => {
    dispatch({ type: 'REMOVE_INCOME_STREAM', payload: id });
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Income Streams</h2>
      
      {/* Existing Income Streams */}
      {portfolio.incomeStreams.length > 0 && (
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-right py-2 px-3">Start Year</th>
                <th className="text-right py-2 px-3">End Year</th>
                <th className="text-right py-2 px-3">Annual Amount</th>
                <th className="text-right py-2 px-3">Annual Growth %</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {portfolio.incomeStreams.map((stream) => (
                <tr key={stream.id} className="border-b">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={stream.name}
                      onChange={(e) => handleUpdateStream(stream.id, 'name', e.target.value)}
                      className="input-field"
                      aria-label={`Name for ${stream.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={stream.startYear}
                      onChange={(e) => handleUpdateStream(stream.id, 'startYear', e.target.value)}
                      className="input-field text-right"
                      min={portfolio.startYear}
                      max={stream.endYear}
                      aria-label={`Start year for ${stream.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={stream.endYear}
                      onChange={(e) => handleUpdateStream(stream.id, 'endYear', e.target.value)}
                      className="input-field text-right"
                      min={stream.startYear}
                      max={portfolio.endYear}
                      aria-label={`End year for ${stream.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={stream.annualAmount}
                      onChange={(e) => handleUpdateStream(stream.id, 'annualAmount', e.target.value)}
                      className="input-field text-right"
                      min="0"
                      step="1000"
                      aria-label={`Annual amount for ${stream.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={stream.annualGrowth}
                      onChange={(e) => handleUpdateStream(stream.id, 'annualGrowth', e.target.value)}
                      className="input-field text-right"
                      step="0.1"
                      aria-label={`Annual growth for ${stream.name}`}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => handleRemoveStream(stream.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove income stream"
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
      
      {/* Add New Income Stream */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-md font-medium">Add New Income Stream</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              placeholder="e.g., Salary, Business"
              value={newStream.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
              Start Year
            </label>
            <input
              type="number"
              id="startYear"
              name="startYear"
              className="input-field"
              value={newStream.startYear}
              onChange={handleInputChange}
              min={portfolio.startYear}
              max={newStream.endYear}
            />
          </div>
          
          <div>
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
              End Year
            </label>
            <input
              type="number"
              id="endYear"
              name="endYear"
              className="input-field"
              value={newStream.endYear}
              onChange={handleInputChange}
              min={newStream.startYear}
              max={portfolio.endYear}
            />
          </div>
          
          <div>
            <label htmlFor="annualAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Amount
            </label>
            <input
              type="number"
              id="annualAmount"
              name="annualAmount"
              className="input-field"
              value={newStream.annualAmount}
              onChange={handleInputChange}
              min="0"
              step="1000"
              placeholder="0"
            />
          </div>
          
          <div>
            <label htmlFor="annualGrowth" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Growth %
            </label>
            <input
              type="number"
              id="annualGrowth"
              name="annualGrowth"
              className="input-field"
              value={newStream.annualGrowth}
              onChange={handleInputChange}
              step="0.1"
              placeholder="3.0"
            />
          </div>
        </div>
        
        <div className="mt-2">
          <button
            onClick={handleAddStream}
            className="btn btn-primary inline-flex items-center"
            disabled={!newStream.name || newStream.annualAmount <= 0}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Income Stream
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeStreamsForm; 