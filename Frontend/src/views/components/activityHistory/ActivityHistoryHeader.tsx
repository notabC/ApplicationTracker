// src/views/components/activityHistory/ActivityHistoryHeader.tsx
import React from 'react';
import { History, X } from 'lucide-react';
import { ActivityHistoryModalProps } from '@/domain/interfaces/IActivityHistory';

export const ActivityHistoryHeader: React.FC<ActivityHistoryModalProps> = ({ onClose }) => (
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
);
