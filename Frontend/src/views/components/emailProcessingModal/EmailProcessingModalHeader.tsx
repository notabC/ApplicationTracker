// src/views/components/EmailProcessingModal/EmailProcessingModalHeader.tsx
import React from 'react';
import { Mail, X } from 'lucide-react';

interface HeaderProps {
  onClose: () => void;
  onReset: () => void;
}

export const EmailProcessingModalHeader: React.FC<HeaderProps> = ({ onClose, onReset }) => (
  <div className="flex justify-between items-center px-6 py-5 border-b border-gray-800/50">
    <div className="flex items-center gap-3">
      <div className="bg-blue-500/10 p-2 rounded-xl">
        <Mail className="h-5 w-5 text-blue-400" />
      </div>
      <h2 className="text-xl font-medium text-white">Process Email</h2>
    </div>
    <button 
      onClick={() => { onReset(); onClose(); }} 
      className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
    >
      <X className="h-5 w-5 text-gray-400" />
    </button>
  </div>
);
