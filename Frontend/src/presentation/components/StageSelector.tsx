// src/presentation/components/StageSelector/StageSelector.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';
import type { Application } from '@/core/domain/models/Application';

interface Props {
  application: Application;
  currentStage: string;
  availableStages: string[];
  onStageChange: (newStage: string) => void;
  onClose: () => void;
}

export const StageSelector: React.FC<Props> = observer(({
  application,
  currentStage,
  availableStages,
  onStageChange,
  onClose
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end justify-center sm:items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 w-full max-w-sm rounded-t-xl sm:rounded-xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-200">Update Status</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Options */}
        <div className="py-2">
          {availableStages.map((stage) => (
            <button
              key={stage}
              onClick={() => {
                onStageChange(stage);
                onClose();
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50"
            >
              <div className={`w-2.5 h-2.5 rounded-full bg-${stage.toLowerCase()}-400`} />
              <span className="flex-1 text-left text-gray-300">{stage}</span>
            </button>
          ))}
        </div>

        {/* Cancel button for mobile */}
        <div className="p-4 border-t border-gray-700 sm:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});