import React from 'react';
import { observer } from 'mobx-react-lite';
import { Save, X, AlertTriangle } from 'lucide-react';

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
      <div className="bg-[#282c34] rounded-xl border border-gray-800/50 shadow-2xl
                    p-4 flex items-center gap-4 backdrop-blur-sm
                    animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2 rounded-lg">
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
            className="px-4 py-2 bg-blue-500/10 text-blue-400
                     hover:bg-blue-500/20 rounded-lg
                     border border-blue-500/20 hover:border-blue-500/30
                     transition-all duration-200
                     flex items-center gap-2 text-sm"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-red-500/10 text-red-400
                     hover:bg-red-500/20 rounded-lg
                     border border-red-500/20 hover:border-red-500/30
                     transition-all duration-200
                     flex items-center gap-2 text-sm"
          >
            <X className="h-4 w-4" />
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