import React from 'react';
import { observer } from 'mobx-react-lite';
import { X, ArrowRight } from 'lucide-react';

interface Props {
  availableStages: string[];
  onStageChange: (newStage: string) => void;
  onClose: () => void;
}

export const StageSelector: React.FC<Props> = observer(({
  availableStages,
  onStageChange,
  onClose
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                flex items-end justify-center sm:items-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1d24] w-full max-w-sm rounded-2xl overflow-hidden
                 border border-gray-800/50 shadow-xl
                 transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 
                     flex justify-between items-center">
          <span className="text-white font-medium">Update Status</span>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl
                     transition-colors duration-200"
          >
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
              className="w-full px-6 py-3 flex items-center justify-between
                       hover:bg-[#282c34] transition-colors duration-200 group"
            >
              <span className="text-gray-300 group-hover:text-white transition-colors">
                {stage}
              </span>
              <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-gray-300 
                                 opacity-0 group-hover:opacity-100 transition-all
                                 transform translate-x-2 group-hover:translate-x-0" />
            </button>
          ))}
        </div>

        {/* Mobile Cancel Button */}
        <div className="p-4 border-t border-gray-800/50 sm:hidden">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#282c34] text-gray-300
                     hover:bg-gray-800/50 hover:text-white
                     rounded-xl transition-all duration-200
                     border border-gray-800/50 hover:border-gray-700/50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});