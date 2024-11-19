import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Search, ChevronDown, ChevronRight, X,
  History, Calendar, Building2, Clock 
} from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { ActivityHistoryViewModel } from '@/presentation/viewModels/ActivityHistoryViewModel';

export const ActivityHistoryModal: React.FC<{ onClose: () => void }> = observer(({ onClose }) => {
  const viewModel = container.get<ActivityHistoryViewModel>(SERVICE_IDENTIFIERS.ActivityHistoryViewModel);

  return (
    <div className="bg-[#1a1d24] rounded-2xl overflow-hidden relative border border-gray-800/50">
      {/* Header with Filters */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <History className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Activity History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
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
              { value: viewModel.dateRange.start, onChange: (e: React.ChangeEvent<HTMLInputElement>) => viewModel.setDateRange(e.target.value, viewModel.dateRange.end) },
              { value: viewModel.dateRange.end, onChange: (e: React.ChangeEvent<HTMLInputElement>) => viewModel.setDateRange(viewModel.dateRange.start, e.target.value) }
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
      </div>

      {/* Activity Timeline */}
      <div className="p-6 overflow-y-auto h-[60vh]">
        <div className="space-y-3">
          {viewModel.filteredLogs.map(log => {
            const application = viewModel.getApplicationDetails(log.applicationId);
            
            return (
              <div
                key={crypto.randomUUID()}
                className="bg-[#282c34] rounded-xl border border-gray-800/50
                         hover:border-gray-700/50 transition-all duration-200"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => viewModel.toggleLogExpansion(log.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-gray-800/50 rounded-lg mt-1">
                        {viewModel.isLogExpanded(log.id) 
                          ? <ChevronDown className="h-4 w-4 text-gray-400" />
                          : <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-medium truncate">{log.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <p className="text-sm text-gray-400 truncate">
                            {application?.company} - {application?.position}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <p className="text-xs text-gray-500">
                            {viewModel.formatDate(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {viewModel.isLogExpanded(log.id) && (
                  <div className="px-4 py-3 border-t border-gray-800/50">
                    <div className="space-y-2">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-gray-500 text-sm w-24">{key}:</span>
                            <span className="text-gray-300 text-sm">{value}</span>
                          </div>
                        )
                      ))}
                    </div>

                    {log.description && (
                      <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                        {log.description}
                      </p>
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