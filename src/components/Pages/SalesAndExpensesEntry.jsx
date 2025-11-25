import React, { useState } from 'react';
import GroupedTransactionList from '../Common/GroupedTransactionList'; 

const SalesAndExpensesEntry = ({ handlers, state, calculations }) => {
    const [saleForm, setSaleForm] = useState({ description: '', cash: '', card: '', date: new Date().toISOString().substring(0, 10) });
    const [expenseForm, setExpenseForm] = useState({ description: '', amount: '' });

    const handleSaleSubmit = (e) => {
        e.preventDefault();
        const cash = parseFloat(saleForm.cash) || 0;
        const card = parseFloat(saleForm.card) || 0;
        const total = cash + card;
        const dateLogged = saleForm.date;

        if (saleForm.description && total > 0 && dateLogged) {
            handlers.handleAdd('sales', { description: saleForm.description, cash, card, total, dateLogged, loggedBy: state.role });
            setSaleForm({ description: '', cash: '', card: '', date: new Date().toISOString().substring(0, 10) });
        } else { state.setError('Please ensure description, a valid date, and at least one amount field are filled.'); }
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(expenseForm.amount) || 0;
        if (expenseForm.description && amount > 0) {
            handlers.handleAdd('expenses', { description: expenseForm.description, amount, loggedBy: state.role });
            setExpenseForm({ description: '', amount: '' });
        } else { state.setError('Please ensure description and amount are filled for the expense.'); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Daily Sales Log Entry</h2>
                <form onSubmit={handleSaleSubmit} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Sale Date</label>
                    <input type="date" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <input type="text" placeholder="Description (e.g., 50 T-shirts, 10m Cotton Fabric)" value={saleForm.description} onChange={(e) => setSaleForm({ ...saleForm, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Cash amount (₹)" value={saleForm.cash} onChange={(e) => setSaleForm({ ...saleForm, cash: e.target.value })} className="p-3 border border-gray-300 rounded-lg" />
                        <input type="number" placeholder="Card/Digital amount (₹)" value={saleForm.card} onChange={(e) => setSaleForm({ ...saleForm, card: e.target.value })} className="p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">Log Sale</button>
                </form>
            </div>
            <div className="p-5 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">General Expenses Log Entry</h2>
                <form onSubmit={handleExpenseSubmit} className="space-y-3">
                    <input type="text" placeholder="Description (e.g., Electricity Bill, Salaries)" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <input type="number" placeholder="Amount (₹)" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <button type="submit" className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-md">Log General Expense</button>
                </form>
            </div>
            <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Entries (Filtered by {calculations.filterType})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GroupedTransactionList title="Sales Log" groupedData={calculations.groupedSales} onDelete={handlers.handleDelete} collectionName="sales" role={state.role} />
                    <GroupedTransactionList title="General Expenses" groupedData={calculations.groupedExpenses} onDelete={handlers.handleDelete} collectionName="expenses" role={state.role} />
                </div>
            </div>
        </div>
    );
};

export default SalesAndExpensesEntry;