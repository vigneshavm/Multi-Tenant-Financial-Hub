import React, { useState, useRef } from 'react';
import SummaryCard from '../Common/SummaryCard';
import ChartRenderer from '../Common/ChartRenderer';
import ChequeTransactionList from '../Common/ChequeTransactionList';

const BankFinancialHistory = ({ handlers, state, data, calculations }) => {
    const [bankUpdate, setBankUpdate] = useState('');

    if (state.role !== 'Owner') return <div className="p-6 text-center text-red-500">Access Denied: Only Owners can view this information.</div>;
    
    // --- Chart Data Setup ---
    const financialChartData = [calculations.totalSales, calculations.totalExpenses, calculations.totalProfit];
    const financialChartLabels = ['Sales', 'Expenses', 'Profit'];
    const financialChartColors = ['#34D399', '#F87171', calculations.totalProfit >= 0 ? '#60A5FA' : '#F87171'];
    
    const dailySalesChartData = calculations.dailySalesData.map(d => d.total);
    const dailySalesChartLabels = calculations.dailySalesData.map(d => new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    const dailySalesChartColors = Array(dailySalesChartData.length).fill('#60A5FA');
    
    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Summary & Trend Analysis ({calculations.filterType})</h2>
                <div className="flex flex-wrap gap-4 justify-start mb-6">
                    <SummaryCard title="Total Sales" value={calculations.totalSales} colorClass="bg-green-500" />
                    <SummaryCard title="Total Expenses (General)" value={calculations.totalExpenses} colorClass="bg-red-500" />
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
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Bank Balance and Cheque History</h2>
                <div className="flex flex-wrap md:flex-nowrap gap-6">
                    <div className="w-full md:w-1/3 p-4 bg-gray-50 rounded-lg shadow-inner">
                        <h3 className="text-xl font-medium mb-3 text-gray-800">Current Bank Balance</h3>
                        <p className="text-4xl font-bold text-indigo-700">₹{data.bankBalance.toLocaleString('en-IN')}</p>
                        <div className="mt-4">
                            <label htmlFor="bankUpdate" className="block text-sm font-medium text-gray-700 mb-1">Update Reconciled Balance</label>
                            <div className="flex gap-2">
                                <input type="number" id="bankUpdate" placeholder="New balance" value={bankUpdate} onChange={(e) => setBankUpdate(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-lg" />
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
                        <ChequeTransactionList data={data.cheques} onDelete={handlers.handleDelete} updateStatus={handlers.updateChequeStatus} role={state.role}/>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BankFinancialHistory;