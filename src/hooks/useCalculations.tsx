import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
// Assuming these utility functions are correctly defined and exported in dataUtils
import { getFilterDates, filterDataByDate, groupTransactionsByDate, getPurchaseDisplayStatus } from '../utils/dataUtils';

// --- Interface Definitions for Data Structures ---

interface DateRange {
    start: Date;
    end: Date;
}

// FIX: Re-exporting interfaces so utility functions can correctly reference them.
export interface Transaction { 
    id: string;
    dateLogged: string; // ISO date string or similar (YYYY-MM-DDTHH:MM:SS)
    amount: number; // Generic amount field for transactions
    [key: string]: any; // Allow for other fields
}

export interface Sale extends Transaction {
    total: number; // Specific field for sales revenue
}

export interface Expense extends Transaction {
    // Inherits amount from Transaction
}

export interface Purchase extends Transaction {
    paymentDueDate: string;
    expectedPaymentDate: string;
    status: 'Pending' | 'Paid' | 'Over Due' | string; 
}

// Define the required structure (Array of Tuples) for grouped transactions
type GroupedTransactionsArray<T extends Transaction> = [string, T[]][];


// --- Internal Hook Return Type Definition (to avoid conflict with external 'Calculations') ---
interface InternalCalculationsHook {
    // State setters and values for filtering (used by DateFilter and other components)
    filterType: string;
    setFilterType: Dispatch<SetStateAction<string>>;
    customStartDate: string;
    setCustomStartDate: Dispatch<SetStateAction<string>>;
    customEndDate: string;
    setCustomEndDate: Dispatch<SetStateAction<string>>;
    purchaseFilter: string;
    setPurchaseFilter: Dispatch<SetStateAction<string>>;
    
    // Calculated values
    dateRange: DateRange;
    filteredSales: Sale[];
    filteredExpenses: Expense[];
    filteredPurchasesAll: Purchase[];
    filteredPurchasesByStatus: Purchase[];
    
    // Using the Array of Tuples structure as required by the external 'Calculations' type
    groupedSales: GroupedTransactionsArray<Sale>;
    groupedExpenses: GroupedTransactionsArray<Expense>;
    
    totalSales: number;
    totalExpenses: number;
    totalProfit: number;
    dailySalesData: { date: string; total: number }[];
}


// --- The Hook Implementation ---

/**
 * Custom hook to manage filtering logic and derived financial calculations 
 * based on raw sales, expenses, and purchases data.
 * @param sales - Array of raw Sale objects.
 * @param expenses - Array of raw Expense objects.
 * @param purchases - Array of raw Purchase objects.
 * @returns An object containing all filter states, setters, and calculated financial data.
 */
const useDataCalculations = (
    sales: Sale[], 
    expenses: Expense[], 
    purchases: Purchase[]
): InternalCalculationsHook => { 
    // --- Filter States ---
    const [filterType, setFilterType] = useState<string>('monthly');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [purchaseFilter, setPurchaseFilter] = useState<string>('All');

    // Determine the active date range based on filter type
    const dateRange: DateRange = useMemo(() => {
        if (filterType === 'custom' && customStartDate && customEndDate) {
            return {
                start: new Date(customStartDate),
                // End of the day for the end date to include all transactions on that day
                end: new Date(customEndDate + 'T23:59:59'), 
            };
        }
        // Assumes getFilterDates returns a valid DateRange object
        return getFilterDates(filterType); 
    }, [filterType, customStartDate, customEndDate]);

    // 1. Filter raw data based on the calculated dateRange
    // Removed explicit type argument from the function call, kept the assertion for return type.
    const filteredSales: Sale[] = useMemo(() => 
        filterDataByDate(sales, dateRange.start, dateRange.end) as Sale[], 
        [sales, dateRange]
    );
    
    const filteredExpenses: Expense[] = useMemo(() => 
        // Removed explicit type argument from the function call, kept the assertion for return type.
        filterDataByDate(expenses, dateRange.start, dateRange.end) as Expense[], 
        [expenses, dateRange]
    );
    
    const filteredPurchasesAll: Purchase[] = useMemo(() => 
        // Removed explicit type argument from the function call, kept the assertion for return type.
        filterDataByDate(purchases, dateRange.start, dateRange.end) as Purchase[], 
        [purchases, dateRange]
    );

    // 2. Group transactions by date for display lists
    const groupedSales: GroupedTransactionsArray<Sale> = useMemo(() => {
        // Since Sale is now exported, groupTransactionsByDate should correctly return Sale[]
        return groupTransactionsByDate(filteredSales) as GroupedTransactionsArray<Sale>;
    }, [filteredSales]);
    
    const groupedExpenses: GroupedTransactionsArray<Expense> = useMemo(() => {
        // Since Expense is now exported, groupTransactionsByDate should correctly return Expense[]
        return groupTransactionsByDate(filteredExpenses) as GroupedTransactionsArray<Expense>;
    }, [filteredExpenses]);

    // 3. Aggregate Sales, Expenses, and Profit, plus generate daily chart data
    const { totalSales, totalExpenses, totalProfit, dailySalesData } = useMemo(() => {
        const salesSum = filteredSales.reduce((acc, sale) => acc + (sale.total || 0), 0);
        const expensesSum = filteredExpenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
        const profit = salesSum - expensesSum;

        // Calculate Daily Sales Map for charting
        const dailySalesMap = filteredSales.reduce((acc: { [date: string]: number }, sale) => {
            // Standardize date to YYYY-MM-DD
            const dateStr = new Date(sale.dateLogged).toISOString().substring(0, 10);
            acc[dateStr] = (acc[dateStr] || 0) + (sale.total || 0);
            return acc;
        }, {});

        // Format for Chart (convert map to array of {date, total} sorted by date)
        const sortedDailySales = Object.entries(dailySalesMap)
            .map(([date, total]) => ({ date, total }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return { 
            totalSales: salesSum, 
            totalExpenses: expensesSum, 
            totalProfit: profit, 
            dailySalesData: sortedDailySales 
        };
    }, [filteredSales, filteredExpenses]);

    // 4. Filter purchases based on status (in addition to date range)
    const filteredPurchasesByStatus: Purchase[] = useMemo(() => {
        return filteredPurchasesAll.filter(purchase => {
            // NOTE: getPurchaseDisplayStatus is imported from dataUtils
            const status = getPurchaseDisplayStatus(purchase).text;
            if (purchaseFilter === 'All') return true;
            
            // Group Pending Payment and Over Due for a general 'Pending' filter
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
    } as any; // Retain cast to 'any' to avoid circular dependency/conflict with external 'Calculations' definition
};

export default useDataCalculations;