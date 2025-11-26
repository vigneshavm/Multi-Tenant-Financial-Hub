import React, { useState } from 'react';
import SummaryCard from '../common/SummaryCard';
import ChartRenderer from '../common/ChartRenderer';
import ChequeTransactionList from '../common/ChequeTransactionList'; // Assuming Cheque interface is exported

// --- Interface Definitions ---

interface Cheque {
    id: string | number;
    type: 'Received' | 'Paid' | string; // Union type allows specific strings but remains flexible
    amount: number;
    date: string | Date; // Handles both ISO strings and Date objects
    loggedBy?: string; // Optional property
    status: 'Pending' | 'Cleared' | 'Bounced' | string;
  }

// 1. Define the shape of the data passed from the parent state/context
interface BankData {
  bankBalance: number;
  cheques: Cheque[]; // Reusing the Cheque interface from the imported list component
}

// 2. Define the expected output structure from the calculation hook
interface CalculationData {
  filterType: string;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  // Daily sales data is an array of objects
  dailySalesData: {
    date: string | Date; // Assuming date is ISO string or Date object
    total: number;
  }[];
}

// 3. Define the handlers (functions) passed as props
interface Handlers {
  handleDelete: (collection: string, id: string | number) => void;
  updateChequeStatus: (id: string | number, status: string) => void;
  handleBankBalanceUpdate: (balance: string | number, setBalance: React.Dispatch<React.SetStateAction<string>>) => Promise<void>;
}

// 4. Define the simple state structure
interface State {
  role: 'Owner' | 'Employee' | string;
  // Include other relevant state properties if known, e.g., error?: string;
}

// 5. Define the component's combined props
interface BankFinancialHistoryProps {
  handlers: Handlers;
  state: State;
  data: BankData;
  calculations: CalculationData;
}

const BankFinancialHistory: React.FC<BankFinancialHistoryProps> = ({ handlers, state, data, calculations }) => {
  // state for bank update input is always a string from the input field
  const [bankUpdate, setBankUpdate] = useState('');

  // Access Denied Guard Clause
  if (state.role !== 'Owner') return <div className="p-6 text-center text-red-500">Access Denied: Only Owners can view this information.</div>;
    
  // --- Chart Data Setup ---
  const financialChartData: number[] = [
    calculations.totalSales, 
    calculations.totalExpenses, 
    calculations.totalProfit
  ];
  const financialChartLabels: string[] = ['Sales', 'Expenses', 'Profit'];
  const financialChartColors: string[] = [
    '#34D399', 
    '#F87171', 
    calculations.totalProfit >= 0 ? '#60A5FA' : '#F87171' // Blue for profit, Red for loss
  ];
    
  const dailySalesChartData: number[] = calculations.dailySalesData.map(d => d.total);
  const dailySalesChartLabels: string[] = calculations.dailySalesData.map(d => 
    new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  );
  const dailySalesChartColors: string[] = Array(dailySalesChartData.length).fill('#60A5FA'); // All bars blue
    
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Summary & Trend Analysis ({calculations.filterType})
        </h2>
        <div className="flex flex-wrap gap-4 justify-start mb-6">
          <SummaryCard 
            title="Total Sales" 
            value={calculations.totalSales} 
            colorClass="bg-green-500" 
          />
          <SummaryCard 
            title="Total Expenses (General)" 
            value={calculations.totalExpenses} 
            colorClass="bg-red-500" 
          />
          <SummaryCard
            title="Net Profit"
            value={calculations.totalProfit}
            colorClass={calculations.totalProfit >= 0 ? "bg-indigo-600" : "bg-red-600"}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartRenderer 
            data={financialChartData} 
            labels={financialChartLabels} 
            colors={financialChartColors} 
            title="Aggregate Performance" 
          />
          <ChartRenderer 
            data={dailySalesChartData} 
            labels={dailySalesChartLabels} 
            colors={dailySalesChartColors} 
            title="Daily Sales Performance" 
          />
        </div>
      </section>

      <section className="p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Bank Balance and Cheque History
        </h2>
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          <div className="w-full md:w-1/3 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-medium mb-3 text-gray-800">Current Bank Balance</h3>
            <p className="text-4xl font-bold text-indigo-700">₹{data.bankBalance.toLocaleString('en-IN')}</p>
            <div className="mt-4">
              <label htmlFor="bankUpdate" className="block text-sm font-medium text-gray-700 mb-1">
                Update Reconciled Balance
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  id="bankUpdate" 
                  placeholder="New balance" 
                  value={bankUpdate} 
                  // Input value is always a string
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankUpdate(e.target.value)} 
                  className="flex-1 p-2 border border-gray-300 rounded-lg" 
                />
                <button
                  onClick={() => handlers.handleBankBalanceUpdate(bankUpdate, setBankUpdate)}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <ChequeTransactionList 
              data={data.cheques} 
              onDelete={handlers.handleDelete} 
              updateStatus={handlers.updateChequeStatus} 
              role={state.role}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BankFinancialHistory;