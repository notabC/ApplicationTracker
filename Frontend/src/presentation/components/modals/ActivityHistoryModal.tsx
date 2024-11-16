import React from 'react';
import { observer } from 'mobx-react-lite';
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { ActivityHistoryViewModel } from '@/presentation/viewModels/ActivityHistoryViewModel';

export const ActivityHistoryModal: React.FC<{ onClose: () => void }> = observer(({ onClose }) => {
  const viewModel = container.get<ActivityHistoryViewModel>(SERVICE_IDENTIFIERS.ActivityHistoryViewModel);

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <X className="h-5 w-5 text-gray-400" />
      </button>

      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white mb-6">Activity History</h2>
        
        <div className="flex gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={viewModel.searchTerm}
              onChange={(e) => viewModel.setSearchTerm(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500"
            />
          </div>

          <input
            type="date"
            value={viewModel.dateRange.start}
            onChange={(e) => viewModel.setDateRange(e.target.value, viewModel.dateRange.end)}
            className="w-40 px-3 py-2 bg-gray-800 rounded-lg text-white"
          />
          <input
            type="date"
            value={viewModel.dateRange.end}
            onChange={(e) => viewModel.setDateRange(viewModel.dateRange.start, e.target.value)}
            className="w-40 px-3 py-2 bg-gray-800 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6 overflow-y-auto h-[60vh]">
        <div className="space-y-4">
          {viewModel.filteredLogs.map(log => {
            const application = viewModel.getApplicationDetails(log.applicationId);
            
            return (
              <div
                key={crypto.randomUUID()}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-750"
                  onClick={() => viewModel.toggleLogExpansion(log.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {viewModel.isLogExpanded(log.id) 
                          ? <ChevronDown className="h-4 w-4 text-gray-400" />
                          : <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{log.title}</h3>
                        <p className="text-sm text-gray-400">
                          {application?.company} - {application?.position}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {viewModel.formatDate(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {viewModel.isLogExpanded(log.id) && (
                    <div className="px-4 py-3 border-t border-gray-800/60">
                        <div className="space-y-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                            value && (
                            <div key={key} className="flex items-center">
                                <span className="text-gray-500 text-sm w-24">{key}:</span>
                                <span className="text-gray-200">{value}</span>
                            </div>
                            )
                        ))}
                        </div>

                        {log.description && (
                        <p className="mt-3 text-gray-400 text-sm">{log.description}</p>
                        )}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});