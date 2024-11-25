import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { WorkflowEditorViewModel } from '@/viewModels/WorkflowEditorViewModel';
import { Settings2, X, Plus, Save } from 'lucide-react';
import { StageCard } from './StageCard';
import { WorkflowEditorModalProps } from '@/domain/interfaces/IWorkflow';

export const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = observer(({ onClose }) => {
  const viewModel = container.get<WorkflowEditorViewModel>(
    SERVICE_IDENTIFIERS.WorkflowEditorViewModel
  );

  if (!viewModel.isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-[#1a1d24] border border-gray-800/50 flex flex-col ${
        viewModel.isMobile 
          ? 'fixed inset-0' 
          : 'rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-xl'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Settings2 className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Edit Workflow</h2>
          </div>
          <button 
            onClick={() => {
              viewModel.closeModal();
              onClose();
            }}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {viewModel.stages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                isExpanded={viewModel.expandedStageId === stage.id}
                onExpand={viewModel.setExpandedStage}
                onDragStart={viewModel.startDragging}
                onDrop={viewModel.handleDrop}
                viewModel={viewModel}
                isMobile={viewModel.isMobile}
              />
            ))}
          </div>

          <button
            onClick={() => viewModel.addStage()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3
                     bg-blue-500/10 hover:bg-blue-500/20 
                     border border-blue-500/20 hover:border-blue-500/30
                     text-blue-400 hover:text-blue-300
                     rounded-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add New Stage
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800/50">
          <div className={`flex gap-3 ${viewModel.isMobile ? 'flex-col' : 'justify-end'}`}>
            {!viewModel.isMobile && (
              <button
                onClick={() => {
                  viewModel.closeModal();
                  onClose();
                }}
                className="px-4 py-2.5 hover:bg-gray-800/50 
                         border border-gray-800/50 hover:border-gray-700/50
                         text-gray-400 hover:text-gray-300
                         rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={async () => {
                await viewModel.saveWorkflow();
                viewModel.closeModal();
                onClose();
              }}
              className={`px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 
                       border border-blue-500/20 hover:border-blue-500/30
                       text-blue-400 hover:text-blue-300
                       rounded-xl transition-all duration-200
                       flex items-center justify-center gap-2
                       ${viewModel.isMobile ? 'w-full' : ''}`}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});