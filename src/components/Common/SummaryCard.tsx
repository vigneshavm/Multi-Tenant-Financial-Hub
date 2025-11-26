import React from 'react';

// Define the shape of the component's props
interface SummaryCardProps {
  title: string;
  value: number;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, colorClass }) => (
  <div
    className={`p-5 rounded-xl shadow-lg ${colorClass} text-white transition-transform transform hover:scale-[1.02] min-w-[150px] flex-1`}
  >
    <p className="text-sm font-semibold opacity-80">{title}</p>
    {/* Ensure value is explicitly a number for toLocaleString to work correctly */}
    <p className="text-3xl font-bold mt-1">₹{value.toLocaleString('en-IN')}</p>
  </div>
);

export default SummaryCard;