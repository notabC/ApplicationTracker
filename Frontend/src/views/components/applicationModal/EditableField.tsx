import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Pencil } from 'lucide-react';
import { Application } from '@/core/domain/models/Application';
import { IApplicationService } from '@/core/interfaces/services';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  application: Application;
  field: keyof Application;
  Icon: React.ElementType;
}

export const EditableField: React.FC<Props> = observer(({
  label,
  value,
  onChange,
  application,
  field,
  Icon,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const applicationService = container.get<IApplicationService>(SERVICE_IDENTIFIERS.ApplicationService);

  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editedValue);
    setIsEditing(false);
    (application[field] as unknown as string) = editedValue;
    applicationService.updateApplication(application.id, application);
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  return (
    <div className="relative">
      {isEditing ? (
        <div className="space-y-2 sm:space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-400">
                {label}
              </h3>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className="w-full bg-[#282c34] text-gray-200 rounded-xl p-3 sm:p-4 
                     border border-gray-800/50 
                     focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 
                     transition-all duration-200 min-h-[80px] sm:min-h-[100px] text-sm
                     placeholder-gray-500"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />

          {/* Action buttons */}
          <div className="flex w-full gap-2 sm:gap-3 mt-2 sm:mt-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 sm:py-3 text-sm bg-[#282c34] text-gray-300
                       hover:bg-gray-800/50 rounded-xl 
                       transition-all duration-200 flex items-center justify-center gap-2
                       border border-gray-800/50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 sm:py-3 text-sm bg-blue-500/10 text-blue-400
                       hover:bg-blue-500/20 rounded-xl
                       border border-blue-500/20 hover:border-blue-500/30
                       transition-all duration-200 flex items-center justify-center gap-2"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="group">
          {/* View mode header */}
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-gray-400" />
              <label className="text-sm font-medium text-gray-400">{label}</label>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 sm:p-2 bg-gray-800/50 hover:bg-gray-700/50 
                       rounded-xl transition-all duration-200 group"
            >
              <Pencil className="h-4 w-4 text-gray-400 group-hover:text-gray-300" />
            </button>
          </div>

          {/* Content area */}
          <div 
            onClick={() => setIsEditing(true)}
            className="bg-[#282c34] rounded-xl p-3 sm:p-4 min-h-[48px] sm:min-h-[60px]
                     border border-gray-800/50 group-hover:border-gray-700/50
                     transition-all duration-200 cursor-pointer"
          >
            <div className="text-sm text-gray-300 leading-relaxed">
              {value || (
                <span className="text-gray-500">
                  Not specified
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});