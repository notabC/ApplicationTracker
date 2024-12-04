// src/views/components/gmailImportModal/SelectionHeader.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';

interface SelectionHeaderProps {
  currentPage: number;
  hasNextPage: boolean;
  isAllSelected: boolean;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onSelectAll: (selected: boolean) => void;
}

const SelectionHeader: React.FC<SelectionHeaderProps> = ({
  currentPage,
  hasNextPage,
  isAllSelected,
  onPageChange,
  isLoading,
  onSelectAll,
}) => (
  <div className="sticky top-0 z-10 bg-[#1a1d24]/95 backdrop-blur-sm border-b border-gray-800/50">
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="w-5 h-5 rounded-lg border-gray-700 text-blue-500 focus:ring-blue-500/30 bg-gray-800"
        />
        <span className="text-base text-gray-400">Select All</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-[#282c34] rounded-lg border border-gray-800/50 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-300 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base text-gray-400 min-w-[4rem] text-center">
            Page {currentPage}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="p-2 bg-[#282c34] rounded-lg border border-gray-800/50 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-300 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    {isLoading && (
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
        <div className="bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 
                        backdrop-blur-sm flex items-center gap-2">
          <Loader className="h-5 w-5 text-blue-400 animate-spin" />
          <span className="text-sm text-blue-400">Loading...</span>
        </div>
      </div>
    )}
  </div>
);

export default SelectionHeader;
