import React from 'react';

// 1. Define the shape of a single transaction item
// This interface combines fields for both Sales (total, cash, card) 
// and Expenses/Payments (amount, vendor) based on your rendering logic.
export interface TransactionItem {
  id: string | number;
  date: string | Date;
  description?: string;
  vendor?: string;
  loggedBy?: string;
  
  // Sales specific fields
  total?: number;
  cash?: number;
  card?: number;
  
  // Expense/Simple transaction fields
  amount?: number;
}

// 2. Define the component props
interface GroupedTransactionListProps {
  title: string;
  // groupedData is an array of tuples: [dateString, ArrayOfItems]
  groupedData: [string, TransactionItem[]][]; 
  onDelete: (collectionName: string, id: string | number) => void;
  collectionName: string;
  role: string;
}

const GroupedTransactionList: React.FC<GroupedTransactionListProps> = ({ 
  title, 
  groupedData, 
  onDelete, 
  collectionName, 
  role 
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
        {title}
      </h3>
      <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {groupedData.length === 0 ? (
          <p className="text-gray-500 italic">No entries found for this period.</p>
        ) : (
          groupedData.map(([dateStr, itemsForDay]) => (
            <li key={dateStr} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-indigo-50 p-3 font-bold text-indigo-700 sticky top-0 border-b">
                {new Date(dateStr).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <ul className="divide-y divide-gray-100">
                {itemsForDay.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white transition-shadow hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.description || item.vendor || 'Untitled Entry'}
                      </p>

                      {/* Scenario 1: Item has a 'total' (e.g., Sales with split payment) */}
                      {item.total !== undefined && (
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-bold text-indigo-600">₹{item.total.toLocaleString('en-IN')}</span>
                          <span className="ml-3 text-xs text-gray-500">
                            (Cash: ₹{item.cash?.toLocaleString('en-IN') || 0}, Card: ₹{item.card?.toLocaleString('en-IN') || 0})
                          </span>
                        </p>
                      )}

                      {/* Scenario 2: Item has simple 'amount' and no 'total' (e.g., Expenses) */}
                      {item.amount !== undefined && item.total === undefined && (
                        <p className="text-sm text-gray-600 font-semibold">
                          Amount: ₹{item.amount.toLocaleString('en-IN')}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-1">
                        Logged by: {item.loggedBy || 'Unknown'} at{' '}
                        {new Date(item.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {role === 'Owner' && (
                        <button
                          onClick={() => onDelete(collectionName, item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                          title="Delete Entry"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default GroupedTransactionList;