// src/presentation/components/UnsavedChangesNotification/UnsavedChangesNotification.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Save, X } from 'lucide-react';

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
    <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-3 z-[1000]">
      <span className="text-gray-200">You have unsaved changes</span>
      <button
        onClick={async () => {
          await onSave();
        }}
        className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save now
      </button>
      <button
        onClick={onDiscard}
        className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
      >
        <X className="h-4 w-4" />
        Discard
      </button>
    </div>
  );
});
