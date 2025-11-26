import React, { useState } from 'react';
import GroupedTransactionList from '../common/GroupedTransactionList'; 

// --- Type Definitions ---

// 1. Define the shape of the Sale Form data
interface SaleForm {
  description: string;
  cash: string; // Stored as string from input
  card: string; // Stored as string from input
  date: string; // ISO date string
}

// 2. Define the shape of the Expense Form data
interface ExpenseForm {
  description: string;
  amount: string; // Stored as string from input
}

// 3. Define the structure for the Handler functions passed via props
interface Handlers {
  // handleAdd is generic, accepting a collection name and the data payload
  handleAdd: (collection: 'sales' | 'expenses' | string, data: any) => Promise<void>;
  handleDelete: (collection: 'sales' | 'expenses' | string, id: string | number) => void;
}

// 4. Define the simple state structure
interface State {
  role: 'Owner' | 'Employee' | string;
  setError: React.Dispatch<React.SetStateAction<string>> | ((msg: string) => void);
}

type TransactionItem = any;

// 5. Define the structure for the transaction data being displayed (GroupedTransactionList prop)
type GroupedData = [string, TransactionItem[]][];

// 6. Define the structure for the calculation/filter state passed via props
interface CalculationData {
  filterType: string;
  groupedSales: GroupedData;
  groupedExpenses: GroupedData;
}

// 7. Define the component's combined props
interface SalesAndExpensesEntryProps {
  handlers: Handlers;
  state: State;
  calculations: CalculationData;
}

const SalesAndExpensesEntry: React.FC<SalesAndExpensesEntryProps> = ({ handlers, state, calculations }) => {
  // Initial date formatting utility for default state
  const today = new Date().toISOString().substring(0, 10);
  
  const [saleForm, setSaleForm] = useState<SaleForm>({ description: '', cash: '', card: '', date: today });
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({ description: '', amount: '' });

  const handleSaleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse amounts from string to number
    const cash = parseFloat(saleForm.cash) || 0;
    const card = parseFloat(saleForm.card) || 0;
    const total = cash + card;
    const dateLogged = saleForm.date;

    if (saleForm.description && total > 0 && dateLogged) {
      handlers.handleAdd('sales', { 
        description: saleForm.description, 
        cash, 
        card, 
        total, 
        dateLogged, 
        loggedBy: state.role 
      });
      // Reset form
      setSaleForm({ description: '', cash: '', card: '', date: today });
      state.setError('');
    } else { 
      state.setError('Please ensure description, a valid date, and at least one amount field are filled.'); 
    }
  };

  const handleExpenseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse amount from string to number
    const amount = parseFloat(expenseForm.amount) || 0;
    
    if (expenseForm.description && amount > 0) {
      handlers.handleAdd('expenses', { 
        description: expenseForm.description, 
        amount, 
        loggedBy: state.role 
      });
      // Reset form
      setExpenseForm({ description: '', amount: '' });
      state.setError('');
    } else { 
      state.setError('Please ensure description and amount are filled for the expense.'); 
    }
  };

  // Helper for input change handlers
  const handleSaleChange = (key: keyof SaleForm, value: string) => {
    setSaleForm(prev => ({ ...prev, [key]: value }));
  };

  const handleExpenseChange = (key: keyof ExpenseForm, value: string) => {
    setExpenseForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Daily Sales Log Entry</h2>
        <form onSubmit={handleSaleSubmit} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Sale Date</label>
          <input 
            type="date" 
            value={saleForm.date} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSaleChange('date', e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <input 
            type="text" 
            placeholder="Description (e.g., 50 T-shirts, 10m Cotton Fabric)" 
            value={saleForm.description} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSaleChange('description', e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="Cash amount (₹)" 
              value={saleForm.cash} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSaleChange('cash', e.target.value)} 
              className="p-3 border border-gray-300 rounded-lg" 
            />
            <input 
              type="number" 
              placeholder="Card/Digital amount (₹)" 
              value={saleForm.card} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSaleChange('card', e.target.value)} 
              className="p-3 border border-gray-300 rounded-lg" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
          >
            Log Sale
          </button>
        </form>
      </div>
      
      <div className="p-5 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">General Expenses Log Entry</h2>
        <form onSubmit={handleExpenseSubmit} className="space-y-3">
          <input 
            type="text" 
            placeholder="Description (e.g., Electricity Bill, Salaries)" 
            value={expenseForm.description} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExpenseChange('description', e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <input 
            type="number" 
            placeholder="Amount (₹)" 
            value={expenseForm.amount} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExpenseChange('amount', e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <button 
            type="submit" 
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md"
          >
            Log General Expense
          </button>
        </form>
      </div>
      
      <div className="lg:col-span-2">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Recent Entries (Filtered by {calculations.filterType})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GroupedTransactionList 
            title="Sales Log" 
            groupedData={calculations.groupedSales} 
            onDelete={handlers.handleDelete} 
            collectionName="sales" 
            role={state.role} 
          />
          <GroupedTransactionList 
            title="General Expenses" 
            groupedData={calculations.groupedExpenses} 
            onDelete={handlers.handleDelete} 
            collectionName="expenses" 
            role={state.role} 
          />
        </div>
      </div>
    </div>
  );
};

export default SalesAndExpensesEntry;