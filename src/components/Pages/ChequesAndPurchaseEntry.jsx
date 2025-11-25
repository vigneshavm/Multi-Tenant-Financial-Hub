import React, { useState } from 'react';

const ChequesAndPurchaseEntry = ({ handlers, state }) => {
    const [purchaseForm, setPurchaseForm] = useState({ vendor: '', amount: '', date: new Date().toISOString().substring(0, 10), expectedPaymentDate: '' });
    const [chequeForm, setChequeForm] = useState({ type: 'Received', amount: '', date: new Date().toISOString().substring(0, 10), status: 'Pending' });

    const handlePurchaseSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(purchaseForm.amount) || 0;
        if (purchaseForm.vendor && amount > 0 && purchaseForm.expectedPaymentDate) {
            handlers.handleAdd('purchases', {
                vendor: purchaseForm.vendor, amount, dateLogged: purchaseForm.date, 
                expectedPaymentDate: purchaseForm.expectedPaymentDate, status: 'Pending Payment', loggedBy: state.role
            });
            setPurchaseForm({ vendor: '', amount: '', date: new Date().toISOString().substring(0, 10), expectedPaymentDate: '' });
        } else { state.setError('Please fill Vendor, Amount, Purchase Date, and Expected Payment Date for purchase.'); }
    };

    const handleChequeSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(chequeForm.amount) || 0;
        if (chequeForm.type && amount > 0) {
            handlers.handleAdd('cheques', { ...chequeForm, amount, loggedBy: state.role });
            setChequeForm({ type: 'Received', amount: '', date: new Date().toISOString().substring(0, 10), status: 'Pending' });
        } else { state.setError('Please fill Cheque Type, Amount, and Date.'); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Vendor Purchase Entry</h2>
                <form onSubmit={handlePurchaseSubmit} className="space-y-3">
                    <input type="text" placeholder="Vendor Name (e.g., Raw Cotton Supplier)" value={purchaseForm.vendor} onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <input type="number" placeholder="Purchase Amount (₹)" value={purchaseForm.amount} onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <label className="block text-sm font-medium text-gray-700 mt-2">Purchase Date (Goods Received)</label>
                    <input type="date" value={purchaseForm.date} onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <label className="block text-sm font-medium text-gray-700 mt-2">Expected Payment Date</label>
                    <input type="date" value={purchaseForm.expectedPaymentDate} onChange={(e) => setPurchaseForm({ ...purchaseForm, expectedPaymentDate: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <button type="submit" className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors shadow-md">Log Vendor Purchase</button>
                </form>
            </div>
            <div className="p-5 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Cheque Log Entry</h2>
                <form onSubmit={handleChequeSubmit} className="space-y-3">
                    <select value={chequeForm.type} onChange={(e) => setChequeForm({ ...chequeForm, type: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg">
                        <option value="Received">Received Cheque (In)</option>
                        <option value="Issued">Issued Cheque (Out)</option>
                    </select>
                    <input type="number" placeholder="Amount (₹)" value={chequeForm.amount} onChange={(e) => setChequeForm({ ...chequeForm, amount: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                    <label className="block text-sm font-medium text-gray-700 mt-2">Cheque Date</label>
                    <input type="date" placeholder="Cheque Date" value={chequeForm.date} onChange={(e) => setChequeForm({ ...chequeForm, date: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" />
                    <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md">Log Cheque</button>
                </form>
            </div>
        </div>
    );
};

export default ChequesAndPurchaseEntry;