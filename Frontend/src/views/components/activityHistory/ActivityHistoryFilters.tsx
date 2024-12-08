// src/views/components/activityHistory/ActivityHistoryFilters.tsx

import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ActivityHistoryFiltersProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryFilters: React.FC<ActivityHistoryFiltersProps> = observer(({ viewModel }) => (
  <div className="flex flex-col sm:flex-row gap-4 bg-gradient-to-br from-[#1e2128] to-[#16181d] p-4 rounded-xl 
                  shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732] border border-[#232732]/20">
    {/* Search Field */}
    <div className="relative flex-grow">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={viewModel.searchTerm}
        onChange={(e) => viewModel.setSearchTerm(e.target.value)}
        placeholder="Search activities..."
        className="
          w-full pl-12 pr-4 py-3 bg-[#1a1d24] rounded-xl
          border border-[#232732]/20 
          text-white placeholder-gray-500
          focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
          transition-all duration-200
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        "
      />
    </div>

    {/* Date Range Fields */}
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
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={input.value}
            onChange={input.onChange}
            className="
              w-44 pl-12 pr-4 py-3 bg-[#1a1d24] rounded-xl
              border border-[#232732]/20 text-white
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
              transition-all duration-200
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
            "
          />
        </div>
      ))}
    </div>
  </div>
));