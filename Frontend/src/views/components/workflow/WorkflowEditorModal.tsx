// src/views/components/workflow/WorkflowEditorModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
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
      <div 
        className={`
          ${viewModel.isMobile 
            ? 'fixed inset-0' 
            : 'rounded-2xl w-full max-w-2xl max-h-[85vh]'}
          bg-gradient-to-br from-[#1e2128] to-[#16181d] border border-[#232732]/10 
          flex flex-col 
          shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
          transition-all duration-200
        `}
      >
        {/* Header */}
        <div className="
          px-6 py-4 border-b border-[#232732]/20 flex justify-between items-center
          bg-[#1a1d24] transition-all duration-200
        ">
          <div className="flex items-center gap-3">
            <div 
              className="
                bg-blue-500/10 p-2 rounded-xl
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              "
            >
              <Settings2 className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Edit Workflow</h2>
          </div>
          <button 
            onClick={() => {
              viewModel.closeModal();
              onClose();
            }}
            className="
              p-2 rounded-xl
              bg-[#1a1d24] border border-[#232732]/20
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
              transition-all duration-200
            "
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
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

          <button
            onClick={() => viewModel.addStage()}
            className="
              mt-4 w-full flex items-center justify-center gap-2 px-4 py-3
              bg-blue-500/10 hover:bg-blue-500/20 
              border border-blue-500/20 hover:border-blue-500/30
              text-blue-400 hover:text-blue-300
              rounded-xl transition-all duration-200
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
            "
          >
            <Plus className="h-4 w-4" />
            Add New Stage
          </button>
        </div>

        {/* Footer */}
        <div className="
          px-6 py-4 border-t border-[#232732]/20
          bg-[#1a1d24] transition-all duration-200
        ">
          <div className={`flex gap-3 ${viewModel.isMobile ? 'flex-col' : 'justify-end'}`}>
            {!viewModel.isMobile && (
              <button
                onClick={() => {
                  viewModel.closeModal();
                  onClose();
                }}
                className="
                  px-4 py-2.5 text-gray-400 hover:text-gray-300
                  rounded-xl
                  bg-[#1a1d24] border border-[#232732]/20
                  shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                  hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                  active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                  transition-all duration-200
                "
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
              className={`
                px-4 py-2.5 bg-blue-500/10 text-blue-400
                rounded-xl
                border border-blue-500/20
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:bg-blue-500/20 hover:border-blue-500/30 hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200
                flex items-center justify-center gap-2
                ${viewModel.isMobile ? 'w-full' : ''}
              `}
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