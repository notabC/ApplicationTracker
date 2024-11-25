import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { ActivityHistoryHeader } from './ActivityHistoryHeader';
import { ActivityHistoryFilters } from './ActivityHistoryFilters';
import { ActivityHistoryTimeline } from './ActivityHistoryTimeline';
import { ActivityHistoryViewModel } from '@/viewModels/ActivityHistoryViewModel';
import { ActivityHistoryModalProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = observer(({ onClose }) => {
  const viewModel = container.get<ActivityHistoryViewModel>(
    SERVICE_IDENTIFIERS.ActivityHistoryViewModel
  );

  return (
    <div className="bg-[#1a1d24] rounded-2xl overflow-hidden relative border border-gray-800/50">
      <div className="p-6 border-b border-gray-800/50">
        <ActivityHistoryHeader onClose={onClose} />
        <ActivityHistoryFilters viewModel={viewModel} />
      </div>
      <ActivityHistoryTimeline viewModel={viewModel} />
    </div>
  );
});