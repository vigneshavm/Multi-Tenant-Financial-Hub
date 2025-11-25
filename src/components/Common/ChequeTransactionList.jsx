import React from 'react';

const ChequeTransactionList = ({ data, onDelete, updateStatus, role }) => (
    <div className="bg-white p-4 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Cheque Transaction History</h3>
        
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {data.length === 0 ? (
                <p className="text-gray-500 italic">No cheques logged.</p>
            ) : (
                data.map(cheque => (
                    <li key={cheque.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className='text-sm flex-1 min-w-0'>
                            <span className={`font-bold ${cheque.type === 'Received' ? 'text-green-600' : 'text-red-600'}`}>
                                {cheque.type}: ₹{cheque.amount.toLocaleString('en-IN')}
                            </span>
                            <span className="ml-2 text-gray-500 text-xs">
                                - Date: {new Date(cheque.date).toLocaleDateString('en-IN')}
                            </span>
                            <p className='text-xs text-gray-400'>Logged by: {cheque.loggedBy || 'Unknown'}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            {role === 'Owner' ? (
                                <select
                                    value={cheque.status}
                                    onChange={(e) => updateStatus(cheque.id, e.target.value)}
                                    className="p-1 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Cleared">Cleared</option>
                                    <option value="Bounced">Bounced</option>
                                </select>
                            ) : (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                    cheque.status === 'Cleared' ? 'bg-green-100 text-green-800' : 
                                    cheque.status === 'Bounced' ? 'bg-red-100 text-red-800' : 
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {cheque.status}
                                </span>
                            )}
                            {role === 'Owner' && (
                                <button
                                    onClick={() => onDelete('cheques', cheque.id)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                    title="Delete Cheque"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </div>
                    </li>
                ))
            )}
        </ul>
    </div>
);

export default ChequeTransactionList;