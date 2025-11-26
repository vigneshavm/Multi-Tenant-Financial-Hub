
interface DateRange {
    start: Date;
    end: Date;
}

// Define a general structure for a transaction item that these functions process
interface Transaction {
    // These keys are accessed dynamically
    dateLogged?: string | Date; 
    date?: string | Date;
    timestamp?: {
        toDate: () => Date; // Assuming a Firebase Timestamp conversion method
    };
    [key: string]: any; // Allow other properties
}

// Defines the output format for groupTransactionsByDate
type GroupedData = [string, Transaction[]][];

// Defines the output format for getPurchaseDisplayStatus
interface DisplayStatus {
    text: string;
    color: string;
}

// Defines the input structure for getPurchaseDisplayStatus (Purchase is a specialized Transaction)
interface Purchase extends Transaction {
    status: 'Paid' | 'Pending Payment' | string;
    expectedPaymentDate: string | Date;
}


/**
 * Calculates start and end dates for predefined filters (monthly, weekly, all).
 */
export const getFilterDates = (type: 'weekly' | 'monthly' | 'all' | string): DateRange => {
    const start = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999); // End of today

    switch (type) {
        case 'weekly':
            // Start of the week (Monday)
            // getDay() returns 0 for Sunday, 1 for Monday... 6 for Saturday.
            const day = start.getDay() || 7; // Convert 0 (Sunday) to 7
            start.setDate(start.getDate() - day + 1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case 'monthly':
            // Start of the month
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case 'all':
            // Set a very old date for "All Time"
            start.setFullYear(2000, 0, 1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        default:
            // Default to today/current range if type is unrecognized
            start.setHours(0, 0, 0, 0);
            return { start, end };
    }
};

/**
 * Filters transaction data based on the provided date range (inclusive).
 */
export const filterDataByDate = (data: Transaction[] | null | undefined, startDate: Date | null, endDate: Date | null): Transaction[] => {
    if (!startDate || !endDate || !data) return [];
    
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    const filteredData = data.filter(item => {
        // Determine the date source from the transaction item
        const dateKey = item.dateLogged ? 'dateLogged' : 'date';
        
        let itemDate: Date;
        
        if (item[dateKey]) {
            itemDate = new Date(item[dateKey] as string | Date);
        } else if (item.timestamp && item.timestamp.toDate) {
            // Handle Firebase Timestamps
            itemDate = item.timestamp.toDate();
        } else {
            // Fallback for missing date, assumes it's outside the range unless specified otherwise
            return false;
        }

        const itemMs = itemDate.getTime();
        return itemMs >= startMs && itemMs <= endMs;
    });

    // Sort by date descending
    return filteredData.sort((a, b) => {
        const dateKeyA = a.dateLogged ? 'dateLogged' : 'date';
        const dateKeyB = b.dateLogged ? 'dateLogged' : 'date';
        
        const dateA = new Date(a[dateKeyA] as string | Date).getTime();
        const dateB = new Date(b[dateKeyB] as string | Date).getTime();
        
        return dateB - dateA;
    });
};

/**
 * Groups a flat list of transactions into an array of [dateString, itemsArray] tuples, sorted by date.
 */
export const groupTransactionsByDate = (transactions: Transaction[]): GroupedData => {
    // Use an explicit index signature for the accumulator object
    const grouped: { [key: string]: Transaction[] } = transactions.reduce((acc, item) => {
        const dateKey = item.dateLogged ? 'dateLogged' : 'date';
        
        // Safety check: ensure the date key exists before creating the date string
        if (!item[dateKey]) return acc;

        // Format date to YYYY-MM-DD for consistent grouping keys
        const dateStr = new Date(item[dateKey] as string | Date).toISOString().substring(0, 10);
        
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(item);
        return acc;
    }, {} as { [key: string]: Transaction[] });
    
    // Convert to array of tuples and sort dates descending
    return Object.entries(grouped).sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) as GroupedData;
};


/**
 * Calculates the payment status of a vendor purchase based on the payment date.
 */
export const getPurchaseDisplayStatus = (purchase: Purchase): DisplayStatus => {
    if (purchase.status === 'Paid') {
        return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    
    const paymentDate = new Date(purchase.expectedPaymentDate);
    const today = new Date();
    // Reset time to ensure comparison is date-only (start of day)
    today.setHours(0, 0, 0, 0); 

    if (paymentDate < today) {
        return { text: 'Over Due', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' };
};