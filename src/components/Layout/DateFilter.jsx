import React from 'react';

const DateFilter = ({ calculations }) => {
    // Destructure necessary state setters and values from the calculations hook output
    const { filterType, setFilterType, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate } = calculations;
    
    return (
        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-inner mb-6">
            <button
                onClick={() => setFilterType('monthly')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${filterType === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >Current Month</button>
            <button
                onClick={() => setFilterType('weekly')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${filterType === 'weekly' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >Current Week</button>
            <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${filterType === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >All Time</button>
            <button
                onClick={() => setFilterType('custom')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${filterType === 'custom' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
            >Custom Range</button>

            {filterType === 'custom' && (
                <div className="flex flex-wrap items-center gap-2 mt-2 w-full sm:w-auto">
                    <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto" />
                    <span className="text-gray-500 hidden sm:inline">to</span>
                    <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto" />
                </div>
            )}
        </div>
    );
};

export default DateFilter;