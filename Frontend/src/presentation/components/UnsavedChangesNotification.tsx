import React from 'react';
import { observer } from 'mobx-react-lite';
import { AlertTriangle } from 'lucide-react';

interface Props {
  show: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
}

export const UnsavedChangesNotification: React.FC<Props> = observer(({
  show,
  hasUnsavedChanges,
  onSave,
  onDiscard
}) => {
  if (!show || !hasUnsavedChanges) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
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
          <span className="text-gray-200 text-sm">
            You have unsaved changes
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await onSave();
            }}
            className="
              px-4 py-2 bg-blue-500/10 text-blue-400
              rounded-lg border border-blue-500/20
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:bg-blue-500/20 hover:border-blue-500/30
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              transition-all duration-200 text-sm
            "
          >
            Save
          </button>
          <button
            onClick={onDiscard}
            className="
              px-4 py-2 bg-red-500/10 text-red-400
              rounded-lg border border-red-500/20
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:bg-red-500/20 hover:border-red-500/30
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              transition-all duration-200 text-sm
            "
          >
            Discard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
});