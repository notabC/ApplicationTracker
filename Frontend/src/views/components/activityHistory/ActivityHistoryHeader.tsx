// src/views/components/activityHistory/ActivityHistoryHeader.tsx
import React from 'react';
import { History, X } from 'lucide-react';
import { ActivityHistoryModalProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryHeader: React.FC<ActivityHistoryModalProps> = ({ onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="
        bg-blue-500/10 p-2 rounded-xl
        shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
      ">
        <History className="h-5 w-5 text-blue-400" />
      </div>
      <h2 className="text-xl font-medium text-white">Activity History</h2>
    </div>
    <button
      onClick={onClose}
      className="
        p-2 rounded-xl
        bg-[#1a1d24] border border-[#232732]/20
        shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
        hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
        active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
        hover:border-cyan-500/30
        transition-all duration-200
      "
    >
      <X className="h-5 w-5 text-gray-400" />
    </button>
  </div>
);
