// src/presentation/views/components/ConfirmResetModal.tsx

import React from 'react';
import { observer } from 'mobx-react-lite';
import { X } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = observer(({ 
  isOpen, 
  onConfirm, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="
        relative max-w-md w-full rounded-xl border border-[#232732]/20 
        shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
        bg-gradient-to-br from-[#1e2128] to-[#16181d]
        p-6
      ">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white/90">
            Delete All Data?
          </h2>
          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="
              text-gray-400 hover:text-gray-200
              transition-all duration-200
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body / Message */}
        <p className="text-sm text-gray-300 mb-6">
          This will permanently remove all your applications, workflow data, and emails. 
          Are you sure you want to continue?
        </p>

        {/* Footer / Buttons */}
        <div className="flex justify-end gap-3">
          {/* Cancel button */}
          <button
            onClick={onClose}
            className="
              flex items-center gap-2 px-4 py-2.5
              bg-[#1a1d24] hover:bg-[#111316]
              border border-[#232732]/20
              text-gray-400 hover:text-gray-200
              rounded-xl transition-all duration-200 text-sm
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
            "
          >
            Cancel
          </button>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            className="
              flex items-center gap-2 px-4 py-2.5
              bg-red-500/20 hover:bg-red-500/30
              border border-red-500/20
              text-red-300 hover:text-red-100
              rounded-xl transition-all duration-200 text-sm
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
            "
          >
            Delete All
          </button>
        </div>
      </div>
    </div>
  );
});
