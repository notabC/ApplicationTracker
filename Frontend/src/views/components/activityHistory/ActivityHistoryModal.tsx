// src/views/components/activityHistory/ActivityHistoryModal.tsx
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
    <div className="
      bg-gradient-to-br from-[#1e2128] to-[#16181d] 
      rounded-2xl overflow-hidden relative 
      border border-[#232732]/10 
      shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
      transition-all duration-200
    ">
      <div className="
        p-6 border-b border-[#232732]/20
        bg-[#1a1d24]
        shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
      ">
        <ActivityHistoryHeader onClose={onClose} />
        <ActivityHistoryFilters viewModel={viewModel} />
      </div>
      <ActivityHistoryTimeline viewModel={viewModel} />
    </div>
  );
});
