// src/views/components/gmailImportModal/SelectionFooter.tsx
import React from 'react';
import { Check, Loader } from 'lucide-react';

interface SelectionFooterProps {
  selectedCount: number;
  onImport: () => void;
  isLoading: boolean;
}

const SelectionFooter: React.FC<SelectionFooterProps> = ({ selectedCount, onImport, isLoading }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={onImport}
        disabled={isLoading}
        className="
          flex items-center gap-2 px-6 py-2.5 
          bg-blue-800/80 backdrop-blur-sm
          border border-[#232732]/20
          rounded-full
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
          active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
          transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <div className="
          h-5 w-5 rounded-full flex items-center justify-center
          bg-[#1a1d24] border border-[#232732]/20
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        ">
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin text-blue-400" />
          ) : (
            <Check className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <span className="text-base text-gray-200 font-medium">
          Import {selectedCount} {selectedCount === 1 ? 'email' : 'emails'}
        </span>
      </button>
    </div>
  );
};

export default SelectionFooter;