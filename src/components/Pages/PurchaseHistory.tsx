import React from 'react';
// import { getPurchaseDisplayStatus } from '../../utils/dataUtils'; // Assuming this utility function is typed elsewhere or unused

// --- Type Definitions ---

// 1. Define the shape of a single Purchase object (as stored/used in the list)
interface Purchase {
  id: string | number;
  vendor: string;
  amount: number;
  dateLogged: string | Date; // Date when purchase was logged/goods received
  expectedPaymentDate: string | Date; // The due date
  status: 'Pending Payment' | 'Paid' | string; // Status as stored in the database
  loggedBy?: string;
}

// 2. Define the structure for the Status function's return value
interface DisplayStatus {
  text: 'Paid' | 'Over Due' | 'Pending Payment' | string;
  color: string;
}

// 3. Define the structure for the Handler functions passed via props
interface Handlers {
  handleDelete: (collection: 'purchases' | string, id: string | number) => void;
  updatePurchaseStatus: (id: string | number, newStatus: string) => void;
}

// 4. Define the simple state structure
interface State {
  role: 'Owner' | 'Employee' | string;
}

// 5. Define the structure for the calculation/filter state passed via props
interface CalculationData {
  purchaseFilter: 'All' | 'Pending' | 'Over Due' | 'Paid' | string;
  setPurchaseFilter: React.Dispatch<React.SetStateAction<string>>;
  filteredPurchasesByStatus: Purchase[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// 6. Define the component's combined props
interface PurchaseHistoryProps {
  handlers: Handlers;
  state: State;
  calculations: CalculationData;
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ handlers, state, calculations }) => {
    
  // NOTE: The logic for getStatus is duplicated here from the original JS component.
  // In a real TS environment, this internal function should be moved outside or typed correctly.
  const getStatus = (purchase: Purchase): DisplayStatus => {
    if (purchase.status === 'Paid') {
      return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    
    // Ensure date comparison is accurate
    const paymentDate = new Date(purchase.expectedPaymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (paymentDate < today) {
      return { text: 'Over Due', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Purchase History & Bill Due Monitoring
      </h2>
      <p className="text-gray-500 mb-4">
        Viewing purchases made between {calculations.dateRange.start.toLocaleDateString()} and{' '}
        {calculations.dateRange.end.toLocaleDateString()}.
      </p>

      <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
        <span className='font-medium text-gray-700 mr-2'>Filter Status:</span>
        {['All', 'Pending', 'Over Due', 'Paid'].map(filter => (
          <button
            key={filter}
            onClick={() => calculations.setPurchaseFilter(filter)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              calculations.purchaseFilter === filter
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <ul className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {calculations.filteredPurchasesByStatus.length === 0 ? (
          <p className="text-gray-500 italic">No vendor purchases found for this period and status.</p>
        ) : (
          calculations.filteredPurchasesByStatus.map(item => {
            const { text: statusText, color: statusColor } = getStatus(item);
            return (
              <li 
                key={item.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {item.vendor} - Purchase: ₹{item.amount.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor}`}>
                      {statusText}
                    </span>
                    <span className="text-xs text-gray-700">
                      Purchased: {new Date(item.dateLogged).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-xs text-red-500 font-semibold">
                      Due: {new Date(item.expectedPaymentDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Logged by: {item.loggedBy || 'Unknown'}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  {state.role === 'Owner' && statusText !== 'Paid' && (
                    <button
                      onClick={() => handlers.updatePurchaseStatus(item.id, 'Paid')}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors shadow"
                    >
                      Mark as Paid
                    </button>
                  )}
                  {state.role === 'Owner' && (
                    <button
                      onClick={() => handlers.handleDelete('purchases', item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                      title="Delete Entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default PurchaseHistory;