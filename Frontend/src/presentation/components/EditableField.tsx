// src/presentation/components/EditableField/EditableField.tsx
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Pencil, Save, X } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const EditableField: React.FC<Props> = observer(({
  label,
  value,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Pencil className="h-4 w-4 text-gray-400 hover:text-white" />
        </button>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="w-full bg-gray-800 text-gray-100 rounded-lg p-3 
                     border border-gray-600 focus:border-blue-500 
                     focus:ring-1 focus:ring-blue-500 min-h-[100px]
                     placeholder-gray-500 text-lg"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white 
                       hover:bg-gray-700 rounded-md transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white 
                       rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-3 min-h-[60px] text-gray-200 text-lg">
          {value || <span className="text-gray-500">No {label.toLowerCase()} provided.</span>}
        </div>
      )}
    </div>
  );
});