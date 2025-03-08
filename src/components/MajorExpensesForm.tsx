import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { MajorExpense } from '../types';
import { generateId } from '../utils/helpers';
import { calculateAnnualInstallment } from '../utils/calculations';

const MajorExpensesForm: React.FC = () => {
  const { portfolio, dispatch } = usePortfolio();
  const { startYear, endYear } = portfolio;
  
  const [newExpense, setNewExpense] = useState<Omit<MajorExpense, 'id'>>({
    name: '',
    totalAmount: 0,
    isInInstallments: false,
    annualInstallmentAmount: 0,
    installmentStartYear: startYear,
    installmentEndYear: startYear,
    annualInterest: 0,
  });
  
  // Calculate annual installment amount when loan parameters change
  useEffect(() => {
    if (newExpense.isInInstallments && newExpense.totalAmount > 0) {
      const installmentAmount = calculateAnnualInstallment(
        newExpense.totalAmount,
        newExpense.annualInterest,
        newExpense.installmentStartYear,
        newExpense.installmentEndYear
      );
      setNewExpense(prev => ({ ...prev, annualInstallmentAmount: installmentAmount }));
    }
  }, [
    newExpense.isInInstallments,
    newExpense.totalAmount,
    newExpense.annualInterest,
    newExpense.installmentStartYear,
    newExpense.installmentEndYear,
  ]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isInInstallments') {
      setNewExpense({ 
        ...newExpense, 
        [name]: checked,
        installmentEndYear: checked ? newExpense.installmentStartYear + 4 : newExpense.installmentStartYear, 
      });
    } else if (
      name === 'totalAmount' || 
      name === 'annualInstallmentAmount' || 
      name === 'installmentStartYear' || 
      name === 'installmentEndYear' || 
      name === 'annualInterest'
    ) {
      setNewExpense({ ...newExpense, [name]: parseFloat(value) });
    } else {
      setNewExpense({ ...newExpense, [name]: value });
    }
  };
  
  const handleAddExpense = () => {
    if (!newExpense.name || newExpense.totalAmount <= 0) {
      return;
    }
    
    const expenseToAdd = { ...newExpense };
    
    // If not in installments, set end year same as start year
    if (!expenseToAdd.isInInstallments) {
      expenseToAdd.installmentEndYear = expenseToAdd.installmentStartYear;
      expenseToAdd.annualInstallmentAmount = expenseToAdd.totalAmount;
    }
    
    dispatch({
      type: 'ADD_MAJOR_EXPENSE',
      payload: { ...expenseToAdd, id: generateId() },
    });
    
    setNewExpense({
      name: '',
      totalAmount: 0,
      isInInstallments: false,
      annualInstallmentAmount: 0,
      installmentStartYear: startYear,
      installmentEndYear: startYear,
      annualInterest: 0,
    });
  };
  
  const handleUpdateExpense = (id: string, field: keyof MajorExpense, value: string | number | boolean) => {
    const expenseToUpdate = portfolio.majorExpenses.find(expense => expense.id === id);
    if (!expenseToUpdate) return;
    
    let updatedValue: string | number | boolean = value;
    if (
      field === 'totalAmount' ||
      field === 'annualInstallmentAmount' ||
      field === 'installmentStartYear' ||
      field === 'installmentEndYear' ||
      field === 'annualInterest'
    ) {
      updatedValue = parseFloat(value.toString());
    } else if (field === 'isInInstallments') {
      updatedValue = !!value;
    }
    
    const updatedExpense = { ...expenseToUpdate, [field]: updatedValue };
    
    // Recalculate installment amount if needed
    if (
      field === 'isInInstallments' ||
      field === 'totalAmount' ||
      field === 'annualInterest' ||
      field === 'installmentStartYear' ||
      field === 'installmentEndYear'
    ) {
      if (updatedExpense.isInInstallments && updatedExpense.totalAmount > 0) {
        updatedExpense.annualInstallmentAmount = calculateAnnualInstallment(
          updatedExpense.totalAmount,
          updatedExpense.annualInterest,
          updatedExpense.installmentStartYear,
          updatedExpense.installmentEndYear
        );
      } else if (!updatedExpense.isInInstallments) {
        updatedExpense.installmentEndYear = updatedExpense.installmentStartYear;
        updatedExpense.annualInstallmentAmount = updatedExpense.totalAmount;
      }
    }
    
    dispatch({
      type: 'UPDATE_MAJOR_EXPENSE',
      payload: updatedExpense,
    });
  };
  
  const handleRemoveExpense = (id: string) => {
    dispatch({ type: 'REMOVE_MAJOR_EXPENSE', payload: id });
  };
  
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold mb-4">Major Expenses</h2>
      
      {/* Existing Major Expenses */}
      {portfolio.majorExpenses.length > 0 && (
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-right py-2 px-3">Total Amount</th>
                <th className="text-center py-2 px-3">Loan/Installments</th>
                <th className="text-right py-2 px-3">Annual Interest %</th>
                <th className="text-right py-2 px-3">Start Year</th>
                <th className="text-right py-2 px-3">End Year</th>
                <th className="text-right py-2 px-3">Annual Payment</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {portfolio.majorExpenses.map((expense) => (
                <tr key={expense.id} className="border-b">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={expense.name}
                      onChange={(e) => handleUpdateExpense(expense.id, 'name', e.target.value)}
                      className="input-field"
                      aria-label={`Name for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={expense.totalAmount}
                      onChange={(e) => handleUpdateExpense(expense.id, 'totalAmount', e.target.value)}
                      className="input-field text-right"
                      min="0"
                      step="1000"
                      aria-label={`Total amount for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={expense.isInInstallments}
                      onChange={(e) => handleUpdateExpense(expense.id, 'isInInstallments', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      aria-label={`Is in installments for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={expense.annualInterest}
                      onChange={(e) => handleUpdateExpense(expense.id, 'annualInterest', e.target.value)}
                      className="input-field text-right"
                      min="0"
                      step="0.1"
                      disabled={!expense.isInInstallments}
                      aria-label={`Annual interest for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={expense.installmentStartYear}
                      onChange={(e) => handleUpdateExpense(expense.id, 'installmentStartYear', e.target.value)}
                      className="input-field text-right"
                      min={startYear}
                      max={expense.isInInstallments ? expense.installmentEndYear : endYear}
                      aria-label={`Start year for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={expense.installmentEndYear}
                      onChange={(e) => handleUpdateExpense(expense.id, 'installmentEndYear', e.target.value)}
                      className="input-field text-right"
                      min={expense.installmentStartYear}
                      max={endYear}
                      disabled={!expense.isInInstallments}
                      aria-label={`End year for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={expense.annualInstallmentAmount}
                      className="input-field text-right bg-gray-100"
                      disabled
                      aria-label={`Annual payment for ${expense.name}`}
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => handleRemoveExpense(expense.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove major expense"
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
      
      {/* Add New Major Expense */}
      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-md font-medium">Add New Major Expense</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="expense-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="expense-name"
              name="name"
              className="input-field"
              placeholder="e.g., New Car, House Purchase"
              value={newExpense.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <input
              type="number"
              id="expense-amount"
              name="totalAmount"
              className="input-field"
              value={newExpense.totalAmount}
              onChange={handleInputChange}
              min="0"
              step="1000"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="expense-installments"
            name="isInInstallments"
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            checked={newExpense.isInInstallments}
            onChange={handleInputChange}
          />
          <label htmlFor="expense-installments" className="ml-2 block text-sm font-medium text-gray-700">
            Loan / Pay in Installments
          </label>
        </div>
        
        {newExpense.isInInstallments && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label htmlFor="expense-interest" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Interest %
              </label>
              <input
                type="number"
                id="expense-interest"
                name="annualInterest"
                className="input-field"
                value={newExpense.annualInterest}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                placeholder="0"
              />
            </div>
            
            <div>
              <label htmlFor="expense-start-year" className="block text-sm font-medium text-gray-700 mb-1">
                Start Year
              </label>
              <input
                type="number"
                id="expense-start-year"
                name="installmentStartYear"
                className="input-field"
                value={newExpense.installmentStartYear}
                onChange={handleInputChange}
                min={startYear}
                max={newExpense.installmentEndYear}
              />
            </div>
            
            <div>
              <label htmlFor="expense-end-year" className="block text-sm font-medium text-gray-700 mb-1">
                End Year
              </label>
              <input
                type="number"
                id="expense-end-year"
                name="installmentEndYear"
                className="input-field"
                value={newExpense.installmentEndYear}
                onChange={handleInputChange}
                min={newExpense.installmentStartYear}
                max={endYear}
              />
            </div>
            
            <div>
              <label htmlFor="expense-annual-payment" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Payment
              </label>
              <input
                type="number"
                id="expense-annual-payment"
                name="annualInstallmentAmount"
                className="input-field bg-gray-100"
                value={newExpense.annualInstallmentAmount.toFixed(2)}
                readOnly
              />
            </div>
          </div>
        )}
        
        <div className="mt-2">
          <button
            onClick={handleAddExpense}
            className="btn btn-primary inline-flex items-center"
            disabled={!newExpense.name || newExpense.totalAmount <= 0}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Major Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default MajorExpensesForm; 