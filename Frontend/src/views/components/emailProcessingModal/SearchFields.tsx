// src/views/components/EmailProcessingModal/SearchFields.tsx
import React from 'react';
import { BuildingIcon, Briefcase } from 'lucide-react';

interface SearchFieldsProps {
  companyValue: string;
  positionValue: string;
  onCompanyChange: (value: string) => void;
  onPositionChange: (value: string) => void;
}

export const SearchFields: React.FC<SearchFieldsProps> = ({
  companyValue,
  positionValue,
  onCompanyChange,
  onPositionChange
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
        <BuildingIcon className="h-4 w-4" />
        Company Name
      </label>
      <input
        type="text"
        value={companyValue}
        onChange={(e) => onCompanyChange(e.target.value)}
        placeholder="e.g., TechCorp"
        className="w-full px-4 py-3 bg-[#20242b] border border-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Position
      </label>
      <input
        type="text"
        value={positionValue}
        onChange={(e) => onPositionChange(e.target.value)}
        placeholder="e.g., Frontend Developer"
        className="w-full px-4 py-3 bg-[#20242b] border border-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all duration-200"
      />
    </div>
  </div>
);