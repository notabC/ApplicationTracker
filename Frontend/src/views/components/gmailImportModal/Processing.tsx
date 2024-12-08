// src/views/components/gmailImportModal/Processing.tsx
import React from 'react';
import { Loader } from 'lucide-react';

const Processing: React.FC = () => (
  <div className="p-12 text-center sm:p-16 bg-gradient-to-br from-[#1e2128] to-[#16181d]">
    <div className="
      bg-blue-500/10 w-20 h-20 sm:w-24 sm:h-24 rounded-xl mx-auto mb-6 
      flex items-center justify-center
      border border-[#232732]/20
      shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
    ">
      <Loader className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 animate-spin" />
    </div>
    <h3 className="text-2xl font-medium text-white mb-2">Importing emails...</h3>
    <p className="text-gray-400 text-base">This may take a few moments</p>
  </div>
);

export default Processing;