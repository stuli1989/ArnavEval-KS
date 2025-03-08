import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { getCurrentYear } from '../utils/helpers';

const BasicInfoForm: React.FC = () => {
  const { portfolio, dispatch } = usePortfolio();
  const currentYear = getCurrentYear();
  
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value);
    if (!isNaN(age)) {
      dispatch({ type: 'SET_USER_AGE', payload: age });
    }
  };
  
  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startYear = parseInt(e.target.value);
    if (!isNaN(startYear)) {
      dispatch({ type: 'SET_START_YEAR', payload: startYear });
    }
  };
  
  const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endYear = parseInt(e.target.value);
    if (!isNaN(endYear)) {
      dispatch({ type: 'SET_END_YEAR', payload: endYear });
    }
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="userAge" className="block text-sm font-medium text-gray-700 mb-1">
            Your Age
          </label>
          <input
            type="number"
            id="userAge"
            className="input-field"
            value={portfolio.userAge}
            onChange={handleAgeChange}
            min="0"
            max="120"
          />
        </div>
        
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
            Start Year
          </label>
          <input
            type="number"
            id="startYear"
            className="input-field"
            value={portfolio.startYear}
            onChange={handleStartYearChange}
            min={currentYear - 50}
            max={currentYear + 50}
          />
        </div>
        
        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
            End Year
          </label>
          <input
            type="number"
            id="endYear"
            className="input-field"
            value={portfolio.endYear}
            onChange={handleEndYearChange}
            min={portfolio.startYear}
            max={portfolio.startYear + 100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Projection Span: {portfolio.endYear - portfolio.startYear} years
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm; 