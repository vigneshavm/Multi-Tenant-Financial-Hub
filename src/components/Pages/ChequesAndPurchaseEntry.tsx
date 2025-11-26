import React, { useState } from 'react';

// --- Type Definitions ---

// 1. Define the shape of the Purchase Form data
interface PurchaseForm {
  vendor: string;
  amount: string; // Stored as string in input, parsed to number on submit
  date: string; // ISO date string
  expectedPaymentDate: string; // ISO date string
}

// 2. Define the shape of the Cheque Form data
interface ChequeForm {
  type: 'Received' | 'Issued' | string;
  amount: string; // Stored as string in input, parsed to number on submit
  date: string; // ISO date string
  status: 'Pending' | 'Cleared' | 'Bounced' | string;
}

// 3. Define the shape of the handlers (functions) passed as props
interface Handlers {
  // handleAdd is generic, accepting a collection name and the data payload
  handleAdd: (collection: 'purchases' | 'cheques' | string, data: any) => Promise<void>;
  // Assuming a function might be needed here to clear the error, if the parent uses one
}

// 4. Define the simple state structure
interface State {
  role: string;
  setError: React.Dispatch<React.SetStateAction<string>> | ((msg: string) => void); // Assuming setError can be a hook setter or a simple function
  // Include other relevant state properties if known, e.g., error?: string;
}

// 5. Define the component's combined props
interface ChequesAndPurchaseEntryProps {
  handlers: Handlers;
  state: State;
}

const ChequesAndPurchaseEntry: React.FC<ChequesAndPurchaseEntryProps> = ({ handlers, state }) => {
  // Initial date formatting utility for default state
  const today = new Date().toISOString().substring(0, 10);
  
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({ vendor: '', amount: '', date: today, expectedPaymentDate: '' });
  const [chequeForm, setChequeForm] = useState<ChequeForm>({ type: 'Received', amount: '', date: today, status: 'Pending' });

  const handlePurchaseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse the amount string to a float
    const amount = parseFloat(purchaseForm.amount) || 0;
    
    if (purchaseForm.vendor && amount > 0 && purchaseForm.expectedPaymentDate) {
      handlers.handleAdd('purchases', {
        vendor: purchaseForm.vendor, 
        amount, 
        dateLogged: purchaseForm.date, 
        expectedPaymentDate: purchaseForm.expectedPaymentDate, 
        status: 'Pending Payment', 
        loggedBy: state.role
      });
      // Reset form
      setPurchaseForm({ vendor: '', amount: '', date: today, expectedPaymentDate: '' });
      state.setError('');
    } else { 
      state.setError('Please fill Vendor, Amount, Purchase Date, and Expected Payment Date for purchase.'); 
    }
  };

  const handleChequeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse the amount string to a float
    const amount = parseFloat(chequeForm.amount) || 0;
    
    if (chequeForm.type && amount > 0) {
      handlers.handleAdd('cheques', { ...chequeForm, amount, loggedBy: state.role });
      // Reset form
      setChequeForm({ type: 'Received', amount: '', date: today, status: 'Pending' });
      state.setError('');
    } else { 
      state.setError('Please fill Cheque Type, Amount, and Date.'); 
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vendor Purchase Entry</h2>
        <form onSubmit={handlePurchaseSubmit} className="space-y-3">
          <input 
            type="text" 
            placeholder="Vendor Name (e.g., Raw Cotton Supplier)" 
            value={purchaseForm.vendor} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurchaseForm({ ...purchaseForm, vendor: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <input 
            type="number" 
            placeholder="Purchase Amount (₹)" 
            value={purchaseForm.amount} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">Purchase Date (Goods Received)</label>
          <input 
            type="date" 
            value={purchaseForm.date} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">Expected Payment Date</label>
          <input 
            type="date" 
            value={purchaseForm.expectedPaymentDate} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurchaseForm({ ...purchaseForm, expectedPaymentDate: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            required 
          />
          <button 
            type="submit" 
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md"
          >
            Log Vendor Purchase
          </button>
        </form>
      </div>
      
      <div className="p-5 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cheque Log Entry</h2>
        <form onSubmit={handleChequeSubmit} className="space-y-3">
          <select 
            value={chequeForm.type} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setChequeForm({ ...chequeForm, type: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="Received">Received Cheque (In)</option>
            <option value="Issued">Issued Cheque (Out)</option>
          </select>
          <input 
            type="number" 
            placeholder="Amount (₹)" 
            value={chequeForm.amount} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChequeForm({ ...chequeForm, amount: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
          />
          <label className="block text-sm font-medium text-gray-700 mt-2">Cheque Date</label>
          <input 
            type="date" 
            placeholder="Cheque Date" 
            value={chequeForm.date} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChequeForm({ ...chequeForm, date: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-lg" 
          />
          <button 
            type="submit" 
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
          >
            Log Cheque
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChequesAndPurchaseEntry;