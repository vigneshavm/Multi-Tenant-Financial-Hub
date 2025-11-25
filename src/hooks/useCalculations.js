import { useState, useMemo } from 'react';
import { getFilterDates, filterDataByDate, groupTransactionsByDate, getPurchaseDisplayStatus } from '../utils/dataUtils';

const useDataCalculations = (sales, expenses, purchases) => {
    // --- Filter States ---
    const [filterType, setFilterType] = useState('monthly');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [purchaseFilter, setPurchaseFilter] = useState('All');

    // Determine the active date range based on filter type
    const dateRange = useMemo(() => {
        if (filterType === 'custom' && customStartDate && customEndDate) {
            return {
                start: new Date(customStartDate),
                end: new Date(customEndDate + 'T23:59:59'), // End of the day
            };
        }
        return getFilterDates(filterType);
    }, [filterType, customStartDate, customEndDate]);

    // 1. Filter raw data based on the calculated dateRange
    const filteredSales = useMemo(() => filterDataByDate(sales, dateRange.start, dateRange.end), [sales, dateRange]);
    const filteredExpenses = useMemo(() => filterDataByDate(expenses, dateRange.start, dateRange.end), [expenses, dateRange]);
    const filteredPurchasesAll = useMemo(() => filterDataByDate(purchases, dateRange.start, dateRange.end), [purchases, dateRange]);

    // 2. Group transactions by date for display lists
    const groupedSales = useMemo(() => groupTransactionsByDate(filteredSales), [filteredSales]);
    const groupedExpenses = useMemo(() => groupTransactionsByDate(filteredExpenses), [filteredExpenses]);

    // 3. Aggregate Sales, Expenses, and Profit, plus generate daily chart data
    const { totalSales, totalExpenses, totalProfit, dailySalesData } = useMemo(() => {
        const salesSum = filteredSales.reduce((acc, sale) => acc + (sale.total || 0), 0);
        const expensesSum = filteredExpenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
        const profit = salesSum - expensesSum;

        // Calculate Daily Sales Map for charting
        const dailySalesMap = filteredSales.reduce((acc, sale) => {
            const dateStr = new Date(sale.dateLogged).toISOString().substring(0, 10);
            acc[dateStr] = (acc[dateStr] || 0) + (sale.total || 0);
            return acc;
        }, {});

        // Format for Chart (convert map to array of {date, total} sorted by date)
        const sortedDailySales = Object.entries(dailySalesMap)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return { totalSales: salesSum, totalExpenses: expensesSum, totalProfit: profit, dailySalesData: sortedDailySales };
    }, [filteredSales, filteredExpenses]);

    // 4. Filter purchases based on status (in addition to date range)
    const filteredPurchasesByStatus = useMemo(() => {
        return filteredPurchasesAll.filter(purchase => {
            // NOTE: getPurchaseDisplayStatus is imported from dataUtils
            const status = getPurchaseDisplayStatus(purchase).text;
            if (purchaseFilter === 'All') return true;
            if (purchaseFilter === 'Pending') return status === 'Pending Payment' || status === 'Over Due';
            return status === purchaseFilter;
        });
    }, [filteredPurchasesAll, purchaseFilter]);

    return {
        filterType, setFilterType, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate,
        purchaseFilter, setPurchaseFilter, dateRange,
        filteredSales, filteredExpenses, filteredPurchasesAll, filteredPurchasesByStatus,
        groupedSales, groupedExpenses,
        totalSales, totalExpenses, totalProfit, dailySalesData
    };
};

export default useDataCalculations;