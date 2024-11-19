import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  X, ChevronDown, ChevronLeft, ChevronRight,
  Building2, MapPin, DollarSign, ClipboardEdit,
  Calendar
} from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { ApplicationModalViewModel } from '@/presentation/viewModels/ApplicationModalViewModel';
import type { Application } from '@/core/domain/models/Application';
import { EditableField } from '../EditableField';
import { TagManager } from '../TagManager';
import { StageSelector } from '../StageSelector';
import { useUnsavedChanges } from '@/presentation/providers/UnsavedChangesProvider';
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
    const originalValue = application[field];
    if (track) {
      trackChange(application.id.toString(), field, value, originalValue, viewModel);
    }
    viewModel.updateField(application.id, field, value);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1d24] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-800/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-800/50 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200 z-10"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>

          <div className="flex gap-4 items-start pr-12"> {/* Added right padding to prevent text from going under close button */}
            <div className="bg-blue-500/10 p-2.5 rounded-xl flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={viewModel.unsavedChanges.company !== undefined ? viewModel.unsavedChanges.company : application.company}
                onChange={(e) => handleFieldChange('company', e.target.value, true)}
                className="text-xl font-medium text-white bg-transparent hover:bg-[#282c34] 
                         px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30
                         transition-all duration-200 w-full"
              />
              <input
                type="text"
                value={viewModel.unsavedChanges.position !== undefined ? viewModel.unsavedChanges.position : application.position}
                onChange={(e) => handleFieldChange('position', e.target.value, true)}
                className="text-sm text-gray-400 bg-transparent hover:bg-[#282c34]
                         px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30
                         transition-all duration-200 w-full"
              />
            </div>
          </div>

          {/* Stage Button */}
          <button
            onClick={() => viewModel.setShowStageSelect(true)}
            className="mt-4 w-full flex items-center justify-between px-4 py-3 
                     bg-[#282c34] border border-gray-800/50
                     rounded-xl hover:bg-gray-800/50 hover:border-gray-700/50
                     transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full bg-blue-400`} />
              <span className="text-white font-medium">{updatedApplication.stage}</span>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Grid Layout for Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardEdit className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-400">Description</label>
                </div>
                <EditableField
                  value={application.description}
                  onChange={(value) => handleFieldChange('description', value)}
                  application={application}
                  field="description"
                  label='Description'
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-400">Salary Range</label>
                </div>
                <EditableField
                  value={application.salary}
                  onChange={(value) => handleFieldChange('salary', value)}
                  application={application}
                  field="salary"
                  label='Salary Range'
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-400">Location</label>
                </div>
                <EditableField
                  value={application.location}
                  onChange={(value) => handleFieldChange('location', value)}
                  application={application}
                  field="location"
                  label='Location'
                />
              </div>
            </div>

            <TagManager
              tags={application.tags}
              onTagsUpdate={(tags) => handleFieldChange('tags', tags)}
            />

            {/* Status Log */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-400">Status Log</h3>
              </div>
              
              <div className="space-y-3">
                {application.logs.slice().reverse().map((log) => (
                  <div 
                    key={log.id}
                    className={`bg-[#282c34] rounded-xl border border-gray-800/50
                              transition-all duration-200 
                              ${log.emailId ? 'cursor-pointer hover:bg-gray-800/50 hover:border-gray-700/50' : ''}`}
                    onClick={() => log.emailId && viewModel.toggleLogExpansion(log.id)}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-medium text-gray-300">
                          {viewModel.formatDate(log.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.date).getFullYear()}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-gray-300 text-sm leading-relaxed">
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
                              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200
                                      ${viewModel.expandedLogs.has(log.id) ? 'rotate-90' : ''}`}
                            />
                          )}
                        </div>
                        {log.emailId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Source Email: "{log.emailTitle}"
                          </p>
                        )}
                      </div>
                    </div>

                    {log.emailId && viewModel.expandedLogs.has(log.id) && (
                      <div className="px-4 pb-4 border-t border-gray-700/50 mt-2">
                        <div className="bg-[#1a1d24] rounded-lg p-4 mt-3">
                          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
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
        <div className="px-6 py-4 border-t border-gray-800/50 flex justify-between items-center bg-[#1a1d24]">
          <button 
            onClick={() => onNavigate('prev')} 
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div className="text-sm text-gray-400">
            Application {currentIndex + 1} of {totalApplications}
          </div>
          <button 
            onClick={() => onNavigate('next')} 
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
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