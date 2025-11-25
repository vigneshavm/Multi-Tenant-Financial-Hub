// --- DATE & FILTER UTILITIES ---

export const getFilterDates = (type) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    switch (type) {
        case 'weekly':
            const day = start.getDay() || 7;
            start.setDate(start.getDate() - day + 1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case 'monthly':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        case 'all':
            start.setFullYear(2000, 0, 1);
            start.setHours(0, 0, 0, 0);
            return { start, end };
        default:
            return { start, end };
    }
};

export const filterDataByDate = (data, startDate, endDate) => {
    if (!startDate || !endDate || !data) return [];
    
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    return data.filter(item => {
        const dateKey = item.dateLogged ? 'dateLogged' : 'date';
        let itemDate = item[dateKey] ? new Date(item[dateKey]) : 
                       (item.timestamp?.toDate ? item.timestamp.toDate() : new Date());

        const itemMs = itemDate.getTime();
        return itemMs >= startMs && itemMs <= endMs;
    }).sort((a, b) => {
        const dateKeyA = a.dateLogged ? 'dateLogged' : 'date';
        const dateKeyB = b.dateLogged ? 'dateLogged' : 'date';
        const dateA = new Date(a[dateKeyA]).getTime();
        const dateB = new Date(b[dateKeyB]).getTime();
        return dateB - dateA;
    });
};

export const groupTransactionsByDate = (transactions) => {
    const grouped = transactions.reduce((acc, item) => {
        const dateKey = item.dateLogged ? 'dateLogged' : 'date';
        const dateStr = new Date(item[dateKey]).toISOString().substring(0, 10);
        
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(item);
        return acc;
    }, {});
    return Object.entries(grouped).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
};


export const getPurchaseDisplayStatus = (purchase) => {
    if (purchase.status === 'Paid') {
        return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    }
    const paymentDate = new Date(purchase.expectedPaymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (paymentDate < today) {
        return { text: 'Over Due', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800' };
};
