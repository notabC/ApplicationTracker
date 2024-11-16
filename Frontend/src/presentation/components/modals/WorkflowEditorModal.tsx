// src/presentation/components/modals/WorkflowEditorModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, Plus, X, Save } from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { WorkflowEditorViewModel } from '@/presentation/viewModels/WorkflowEditorViewModel';
import { WorkflowStage } from '@/core/domain/models/Workflow';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowEditorModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<WorkflowEditorViewModel>(SERVICE_IDENTIFIERS.WorkflowEditorViewModel);

  if (!isOpen) return null;

  const handleClose = async () => {
    if (viewModel.unsavedChangesViewModel.hasUnsavedChanges) {
      const shouldSave = window.confirm('You have unsaved changes. Would you like to save them before closing?');
      if (shouldSave) {
        await viewModel.saveWorkflow();
      } else {
        viewModel.unsavedChangesViewModel.discardChanges();
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Edit Application Workflow</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-800 rounded-lg">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {viewModel.workflow.stageOrder.map((stageId) => {
              const stage = viewModel.workflow.stages.find(s => s.id === stageId);
              if (!stage) return null;

              return (
                <div
                  key={stage.id}
                  draggable={stage.editable !== false}
                  onDragStart={(e) => {
                    viewModel.startDragging(stage.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    viewModel.handleDrop(stage.id);
                  }}
                  className="bg-gray-800 p-4 rounded-lg flex items-center gap-4"
                >
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                  
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => viewModel.updateStageName(stage.id, e.target.value)}
                    disabled={stage.editable === false}
                    className="flex-1 bg-gray-700 px-3 py-1.5 rounded-lg text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  
                  <select
                    value={stage.color}
                    onChange={(e) => viewModel.updateStageColor(stage.id, e.target.value as WorkflowStage['color'])}
                    disabled={stage.editable === false}
                    className="bg-gray-700 px-3 py-1.5 rounded-lg text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="gray">Gray</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                    <option value="purple">Purple</option>
                  </select>

                  {stage.editable !== false && (
                    <button
                      onClick={() => viewModel.deleteStage(stage.id)}
                      className="p-1 hover:bg-gray-700 rounded-lg"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => viewModel.addStage()}
            className="mt-4 w-full flex items-center justify-center gap-2 p-3 
                     border-2 border-dashed border-gray-700 rounded-lg
                     text-gray-400 hover:text-white hover:border-gray-600"
          >
            <Plus className="h-4 w-4" />
            Add New Stage
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await viewModel.saveWorkflow();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
});