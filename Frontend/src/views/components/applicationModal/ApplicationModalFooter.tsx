// src/views/components/applicationModal/ApplicationModalFooter.tsx
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
    <div className="px-6 py-4 border-t border-gray-800/50 flex justify-between items-center bg-[#1a1d24]">
      <button 
        onClick={() => onNavigate('prev')} 
        className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
      >
        <ChevronLeft className="h-5 w-5 text-gray-400" />
      </button>
      <div className="text-sm text-gray-400">
        Application {currentIndex + 1} of {totalApplications}
      </div>
      <button 
        onClick={() => onNavigate('next')} 
        className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
      >
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  );
};