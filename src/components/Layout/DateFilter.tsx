import React, { type Dispatch, type SetStateAction } from 'react';

// --- Type Definitions ---

// Define the interface for the props passed to DateFilter
interface DateFilterProps {
  calculations: {
    // State values
    filterType: 'monthly' | 'weekly' | 'all' | 'custom' | string;
    customStartDate: string; // Stored as YYYY-MM-DD string from input
    customEndDate: string;   // Stored as YYYY-MM-DD string from input

    // State setters (functions to update the state in the parent/hook)
    setFilterType: Dispatch<SetStateAction<string>>;
    setCustomStartDate: Dispatch<SetStateAction<string>>;
    setCustomEndDate: Dispatch<SetStateAction<string>>;
  };
}

const DateFilter: React.FC<DateFilterProps> = ({ calculations }) => {
  const { 
    filterType, 
    setFilterType, 
    customStartDate, 
    setCustomStartDate, 
    customEndDate, 
    setCustomEndDate 
  } = calculations;
    
  const getButtonClass = (type: string): string => {
    return `px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-md ${
      filterType === type 
        ? 'bg-indigo-600 text-white shadow-indigo-500/50' 
        : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-300'
    }`;
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl shadow-inner mb-6 border border-gray-200">
      <div className="flex flex-wrap gap-2">
        {/* Filter Buttons */}
        <button
          onClick={() => setFilterType('monthly')}
          className={getButtonClass('monthly')}
        >
          Current Month
        </button>
        <button
          onClick={() => setFilterType('weekly')}
          className={getButtonClass('weekly')}
        >
          Current Week
        </button>
        <button
          onClick={() => setFilterType('all')}
          className={getButtonClass('all')}
        >
          All Time
        </button>
        <button
          onClick={() => setFilterType('custom')}
          className={getButtonClass('custom')}
        >
          Custom Range
        </button>
      </div>

      {/* Custom Date Range Picker - Visible only when 'custom' is selected */}
      {filterType === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
          <label htmlFor="start-date" className="text-sm font-medium text-gray-700 hidden sm:block">
            From:
          </label>
          <input 
            id="start-date"
            type="date" 
            value={customStartDate} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomStartDate(e.target.value)} 
            className="p-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto flex-grow" 
          />
          <span className="text-gray-500 hidden sm:inline text-sm">to</span>
          <label htmlFor="end-date" className="text-sm font-medium text-gray-700 hidden sm:block">
            To:
          </label>
          <input 
            id="end-date"
            type="date" 
            value={customEndDate} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEndDate(e.target.value)} 
            className="p-2 border border-gray-300 rounded-lg text-gray-700 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-auto flex-grow" 
          />
        </div>
      )}
    </div>
  );
};

export default DateFilter;