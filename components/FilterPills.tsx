
import React from 'react';
import type { Position } from '../types';

interface FilterPillsProps {
  positions: (Position | 'ทั้งหมด')[];
  activeFilter: Position | 'ทั้งหมด';
  onFilterChange: (filter: Position | 'ทั้งหมด') => void;
  counts: Record<Position | 'ทั้งหมด', number>;
}

const FilterPills: React.FC<FilterPillsProps> = ({ positions, activeFilter, onFilterChange, counts }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
      {positions.map((position) => (
        <button
          key={position}
          onClick={() => onFilterChange(position)}
          className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 
            ${
              activeFilter === position
                ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
        >
          {position}
          <span
            className={`ml-2.5 text-xs px-2 py-0.5 rounded-full transition-colors ${
              activeFilter === position ? 'bg-white/20' : 'bg-slate-700 text-slate-200'
            }`}
          >
            {counts[position] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterPills;