import React from 'react';

const SummaryCard = ({ title, value, colorClass }) => (
    <div className={`p-5 rounded-xl shadow-lg ${colorClass} text-white transition-transform transform hover:scale-[1.02] min-w-[150px] flex-1`}>
        <p className="text-sm font-semibold opacity-80">{title}</p>
        <p className="text-3xl font-bold mt-1">₹{value.toLocaleString('en-IN')}</p>
    </div>
);

export default SummaryCard;