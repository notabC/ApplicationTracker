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
      className="
        fixed inset-0 bg-black/60 backdrop-blur-sm 
        flex items-end justify-center sm:items-center p-4 z-50
      "
      onClick={onClose}
    >
      <div
        className="
          bg-gradient-to-br from-[#1e2128] to-[#16181d] 
          w-full max-w-sm rounded-2xl overflow-hidden
          border border-[#232732]/10
          shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
          transform transition-all duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="
          px-6 py-4 border-b border-[#232732]/20 
          flex justify-between items-center
          bg-[#1a1d24]
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        ">
          <span className="text-white font-medium">Update Status</span>
          <button 
            onClick={onClose}
            className="
              p-2 rounded-xl
              bg-[#1a1d24] border border-[#232732]/20
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              hover:border-cyan-500/30
              active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
              transition-all duration-200
            "
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Options */}
        <div className="py-2 bg-[#1a1d24] transition-all duration-200">
          {availableStages.map((stage) => (
            <button
              key={stage}
              onClick={() => {
                onStageChange(stage);
                onClose();
              }}
              className="
                w-full px-6 py-3 flex items-center justify-between
                hover:bg-[#282c34]
                transition-colors duration-200 group
                text-gray-300 group-hover:text-white
              "
            >
              <span>{stage}</span>
              <ArrowRight 
                className="
                  h-4 w-4 text-gray-500 group-hover:text-gray-300 
                  opacity-0 group-hover:opacity-100 transition-all
                  transform translate-x-2 group-hover:translate-x-0
                "
              />
            </button>
          ))}
        </div>

        {/* Mobile Cancel Button */}
        <div className="
          p-4 border-t border-[#232732]/20 sm:hidden bg-[#1a1d24]
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        ">
          <button
            onClick={onClose}
            className="
              w-full py-3 bg-[#1a1d24] text-gray-300
              border border-[#232732]/20 rounded-xl
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              hover:border-cyan-500/30 hover:text-white
              transition-all duration-200
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});