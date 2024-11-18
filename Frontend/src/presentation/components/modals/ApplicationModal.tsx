// src/presentation/components/modals/ApplicationModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  X, ChevronDown, ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { ApplicationModalViewModel } from '@/presentation/viewModels/ApplicationModalViewModel';
import type { Application } from '@/core/domain/models/Application';
import { EditableField } from '../EditableField';
import { TagManager } from '../TagManager';
import { StageSelector } from '../StageSelector';
import { useUnsavedChanges } from '@/presentation/providers/UnsavedChangesProvider';
import { ApplicationService } from '@/core/services/ApplicationService';
import { RootStore } from '@/presentation/viewModels/RootStore';

interface Props {
  application: Application;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  totalApplications: number;
  currentIndex: number;
}

export const ApplicationModal: React.FC<Props> = observer(({
  application,
  onClose,
  onNavigate,
  totalApplications,
  currentIndex
}) => {
  const { trackChange } = useUnsavedChanges();
  const viewModel = container.get<ApplicationModalViewModel>(SERVICE_IDENTIFIERS.ApplicationModalViewModel);
  const rootStore = container.get<RootStore>(SERVICE_IDENTIFIERS.RootStore);
  const updatedApplication = rootStore.getApplicationById(application.id) || application;

  const handleFieldChange = (field: keyof Application, value: any, track=false) => {
    // Track the change with original value
    const originalValue = application[field];

    if (track) {
      trackChange(application.id.toString(), field, value, originalValue, viewModel);
    }
    
    // Update the application state via ViewModel or directly
    viewModel.updateField(application.id, field, value);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="relative group">
                <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={viewModel.unsavedChanges.company !== undefined ? viewModel.unsavedChanges.company : application.company}
                  onChange={(e) => handleFieldChange('company', e.target.value, true)}
                  className="text-xl font-semibold text-white bg-transparent hover:bg-gray-800 
                          px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                  <input
                    type="text"
                    value={viewModel.unsavedChanges.position !== undefined ? viewModel.unsavedChanges.position : application.position}
                    onChange={(e) => handleFieldChange('position', e.target.value, true)}
                    className="text-sm text-gray-400 bg-transparent hover:bg-gray-800 
                             px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Stage Button */}
          <button
            onClick={() => viewModel.setShowStageSelect(true)}
            className="mt-4 w-full flex items-center justify-between px-4 py-3 
                     bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* <div className={`w-2.5 h-2.5 rounded-full bg-${viewModel.getStageColor(updatedApplication.stage)}-400`} /> */}
              <span className="text-white font-medium">{updatedApplication.stage}</span>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <EditableField
              label="Description"
              value={application.description}
              onChange={(value) => handleFieldChange('description', value)}
              application={application}
              field="description"
            />

            <div className="grid grid-cols-2 gap-6">
              <EditableField
                label="Salary Range"
                value={application.salary}
                onChange={(value) => handleFieldChange('salary', value)}
                application={application}
                field="salary"
              />
              <EditableField
                label="Location"
                value={application.location}
                onChange={(value) => handleFieldChange('location', value)}
                application={application}
                field="location"
                />
            </div>

            <EditableField
              label="Notes"
              value={application.notes}
              onChange={(value) => handleFieldChange('notes', value)}
              application={application}
              field="notes"
            />

            <TagManager
              tags={application.tags}
              onTagsUpdate={(tags) => handleFieldChange('tags', tags)}
            />

            {/* Logs Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
                Status Log
              </h3>
              <div className="space-y-4">
                {application.logs.slice().reverse().map((log) => (
                  <div 
                    key={log.id}
                    className={`flex flex-col bg-gray-800/50 rounded-lg transition-all duration-200 
                              ${log.emailId ? 'cursor-pointer hover:bg-gray-800/70' : ''}`}
                    onClick={() => log.emailId && viewModel.toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-gray-200">
                          {viewModel.formatDate(log.date)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.date).getFullYear()}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-200 text-sm">
                            {log.fromStage ? (
                              <>
                                Moved from <span className="text-gray-400">{log.fromStage}</span> to{' '}
                                <span className="text-gray-400">{log.toStage}</span>
                              </>
                            ) : (
                              log.message
                            )}
                          </p>
                          {log.emailId && (
                            <ChevronRight
                              className={`h-4 w-4 text-gray-400 transform transition-transform 
                                        ${viewModel.expandedLogs.has(log.id) ? 'rotate-90' : ''}`}
                            />
                          )}
                        </div>
                        {log.emailId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Source Email: "{log.emailTitle}"
                          </p>
                        )}
                      </div>
                    </div>

                    {log.emailId && viewModel.expandedLogs.has(log.id) && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-700 mt-2">
                        <div className="bg-gray-900 rounded-lg p-3">
                          <p className="text-sm text-gray-300 whitespace-pre-line">
                            {log.emailBody}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-gray-900">
          <button 
            onClick={() => onNavigate('prev')} 
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div className="text-sm text-gray-400">
            Application {currentIndex + 1} of {totalApplications}
          </div>
          <button 
            onClick={() => onNavigate('next')} 
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Stage Selector Modal */}
        {viewModel.showStageSelect && (
          <StageSelector
            onStageChange={(newStage) => viewModel.handleStageChange(application, newStage)}
            onClose={() => viewModel.setShowStageSelect(false)}
            availableStages={viewModel.getAvailableStages(application.stage)}
          />
        )}
      </div>
    </div>
  );
});