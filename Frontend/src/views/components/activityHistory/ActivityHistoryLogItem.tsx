// src/views/components/activityHistory/ActivityHistoryLogItem.tsx
import React from 'react';
import { ChevronDown, ChevronRight, Building2, Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ActivityHistoryLogItemProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryLogItem: React.FC<ActivityHistoryLogItemProps> = observer(({ log, viewModel }) => {
  const application = viewModel.getApplicationDetails(log.applicationId);
  const isExpanded = viewModel.isLogExpanded(log.id);

  return (
    <div className="
      bg-[#1a1d24] rounded-xl border border-[#232732]/20
      shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
      hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
      hover:border-cyan-500/30
      transition-all duration-200
    ">
      <div 
        className="
          p-4 cursor-pointer
          bg-gradient-to-br from-[#1e2128] to-[#16181d]
        "
        onClick={() => viewModel.toggleLogExpansion(log.id)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="
              flex-shrink-0 p-2 rounded-lg mt-1
              bg-[#1a1d24] border border-[#232732]/20
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
            ">
              {isExpanded 
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
      
      {isExpanded && (
        <div className="
          px-4 py-3 border-t border-[#232732]/20
          bg-[#1a1d24] transition-all duration-200
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        ">
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
});
