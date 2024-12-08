// src/views/components/activityHistory/ActivityHistoryTimeline.tsx
import React from 'react';
import { ActivityHistoryLogItem } from './ActivityHistoryLogItem';
import { observer } from 'mobx-react-lite';
import { ActivityHistoryFiltersProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryTimeline: React.FC<ActivityHistoryFiltersProps> = observer(({ viewModel }) => (
  <div className="p-6 overflow-y-auto h-[60vh] bg-gradient-to-br from-[#1e2128] to-[#16181d]">
    <div className="space-y-3">
      {viewModel.filteredLogs.map(log => (
        <ActivityHistoryLogItem
          key={log.id}
          log={log}
          viewModel={viewModel}
        />
      ))}
    </div>
  </div>
));