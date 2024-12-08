import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FooterProps {
  currentIndex: number;
  totalApplications: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const ApplicationModalFooter: React.FC<FooterProps> = ({
  currentIndex,
  totalApplications,
  onNavigate
}) => {
  return (
    <div 
      className="
        px-6 py-4 border-t border-[#232732]/20 flex justify-between items-center 
        bg-gradient-to-br from-[#1e2128] to-[#16181d]
      "
    >
      <button 
        onClick={() => onNavigate('prev')} 
        className="
          p-2 rounded-xl
          bg-[#1a1d24] border border-[#232732]/20
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
          active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
          transition-all duration-200
        "
      >
        <ChevronLeft className="h-5 w-5 text-gray-400" />
      </button>
      <div className="text-sm text-gray-400">
        Application {currentIndex + 1} of {totalApplications}
      </div>
      <button 
        onClick={() => onNavigate('next')} 
        className="
          p-2 rounded-xl
          bg-[#1a1d24] border border-[#232732]/20
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
          active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
          transition-all duration-200
        "
      >
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  );
};