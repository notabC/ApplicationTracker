// src/views/components/UnsavedChangesNotification.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { AlertTriangle } from 'lucide-react';
import { UnsavedChangesViewModel } from '@/viewModels/UnsavedChangesViewModel';

interface Props {
  viewModel: UnsavedChangesViewModel;
}

export const UnsavedChangesNotification: React.FC<Props> = observer(({ viewModel }) => {
  if (!viewModel.showNotification || !viewModel.hasUnsavedChanges) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      {/* UI logic as before */}
      <div className="
        bg-[#1a1d24] rounded-xl border border-[#232732]/20 
        shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
        p-4 flex items-center gap-4 backdrop-blur-sm
        animate-slide-up transition-all duration-200
      ">
        <div className="flex items-center gap-3">
          <div className="
            bg-amber-500/10 p-2 rounded-lg
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          ">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-gray-200 text-sm">You have unsaved changes</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => { await viewModel.saveChanges(); }}
            className="px-4 py-2 bg-blue-500/10 text-blue-400 ..."
          >
            Save
          </button>
          <button
            onClick={() => { viewModel.discardChanges(); }}
            className="px-4 py-2 bg-red-500/10 text-red-400 ..."
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
});
