// src/views/components/activityHistory/ActivityHistoryFilters.tsx

import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ActivityHistoryFiltersProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryFilters: React.FC<ActivityHistoryFiltersProps> = observer(({ viewModel }) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="relative flex-grow">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={viewModel.searchTerm}
        onChange={(e) => viewModel.setSearchTerm(e.target.value)}
        placeholder="Search activities..."
        className="w-full pl-12 pr-4 py-3 bg-[#282c34] rounded-xl
                 border border-gray-800/50 
                 text-white placeholder-gray-500
                 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                 transition-all duration-200"
      />
    </div>

    <div className="flex gap-3 flex-shrink-0">
      {[
        { 
          value: viewModel.dateRange.start,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
            viewModel.setDateRange(e.target.value, viewModel.dateRange.end)
        },
        { 
          value: viewModel.dateRange.end,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
            viewModel.setDateRange(viewModel.dateRange.start, e.target.value)
        }
      ].map((input, index) => (
        <div key={index} className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="date"
            value={input.value}
            onChange={input.onChange}
            className="w-44 pl-12 pr-4 py-3 bg-[#282c34] rounded-xl
                     border border-gray-800/50 text-white
                     focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                     transition-all duration-200"
          />
        </div>
      ))}
    </div>
  </div>
));