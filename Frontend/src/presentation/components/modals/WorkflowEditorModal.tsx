import React from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, Plus, X, Save, ChevronDown } from 'lucide-react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { WorkflowEditorViewModel } from '@/presentation/viewModels/WorkflowEditorViewModel';
import { WorkflowStage } from '@/core/domain/models/Workflow';
import { IWorkflowService } from '@/core/interfaces/services';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowEditorModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<WorkflowEditorViewModel>(SERVICE_IDENTIFIERS.WorkflowEditorViewModel);
  const [expandedStage, setExpandedStage] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const StageCard = ({ stage }: { stage: WorkflowStage }) => {
    const workFlowService = container.get<IWorkflowService>(SERVICE_IDENTIFIERS.WorkflowService);
    const isExpanded = expandedStage === stage.id;
    const currentStage = workFlowService.getStageById(stage.id);
    const isVisible = currentStage?.visible ?? stage.visible;
    
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
        className={`bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 
                   ${!isMobile ? 'hover:bg-gray-750' : ''} 
                   ${isExpanded ? 'ring-1 ring-gray-600' : ''}`}
      >
        <div 
          className={`p-3 flex items-center gap-3 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}
          onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          
          <div className="flex-1 font-medium text-white truncate">
            {stage.name || 'Untitled Stage'}
          </div>

          <div className={`
            flex items-center gap-2 text-sm
            ${stage.visible ? 'text-blue-400' : 'text-gray-500'}
          `}>
            {stage.visible ? 'Visible' : 'Hidden'}
            <div className={`
              p-1.5 rounded-md transition-transform duration-200
              ${isExpanded ? 'rotate-180' : ''}
            `}>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-3 space-y-4">
            {/* Stage Name Input */}
            <div className="space-y-1.5">
              <label 
                htmlFor={`name-${stage.id}`} 
                className="block text-sm text-gray-400"
              >
                Stage Name
              </label>
              <input
                id={`name-${stage.id}`}
                type="text"
                value={stage.name}
                onChange={(e) => viewModel.updateStageName(stage.id, e.target.value)}
                disabled={stage.editable === false}
                className="w-full bg-gray-700/50 px-3 py-2 rounded-lg text-white text-sm
                          border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                          disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Enter stage name"
              />
            </div>

            {/* Custom Toggle Switch */}
            <div className="flex items-center justify-between py-1">
              <label 
                htmlFor={`visibility-${stage.id}`}
                className="text-sm text-gray-400"
              >
                Stage Visibility
              </label>
              <div className="flex items-center gap-2">
                <button
                  id={`visibility-${stage.id}`}
                  onClick={() => stage.editable && viewModel.updateStageVisibility(stage.id, !stage.visible)}
                  disabled={stage.editable === false}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors duration-200
                    ${isVisible ? 'bg-blue-600' : 'bg-gray-700'}
                    ${stage.editable === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  `}
                  role="switch"
                  aria-checked={isVisible}
                >
                  <div
                    className={`
                      absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                      transform transition-transform duration-200
                      ${isVisible ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
                <span className={`text-sm ${isVisible ? 'text-gray-300' : 'text-gray-500'}`}>
                  {isVisible ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-1.5">
              <label 
                htmlFor={`color-${stage.id}`} 
                className="block text-sm text-gray-400"
              >
                Stage Color
              </label>
              <div className="relative">
                <select
                  id={`color-${stage.id}`}
                  value={stage.color}
                  onChange={(e) => viewModel.updateStageColor(stage.id, e.target.value as WorkflowStage['color'])}
                  disabled={stage.editable === false}
                  className="w-full bg-gray-700/50 px-3 py-2 rounded-lg text-white text-sm
                            border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                            appearance-none"
                >
                  <option value="gray">Gray</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                  <option value="purple">Purple</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {stage.editable !== false && (
              <button
                onClick={() => viewModel.deleteStage(stage.id)}
                className="w-full flex items-center justify-center gap-2 p-2.5
                         bg-red-500/10 hover:bg-red-500/20 text-red-400 
                         rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                Delete Stage
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-gray-900 flex flex-col ${
        isMobile 
          ? 'fixed inset-0' 
          : 'rounded-xl w-full max-w-2xl max-h-[85vh] shadow-xl'
      }`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Edit Workflow</h2>
            <button 
              onClick={handleClose} 
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {viewModel.workflow.stageOrder.map((stageId) => {
              const stage = viewModel.workflow.stages.find(s => s.id === stageId);
              if (!stage) return null;
              return <StageCard key={stage.id} stage={stage} />;
            })}
          </div>

          <button
            onClick={() => viewModel.addStage()}
            className="mt-4 w-full flex items-center justify-center gap-2 p-3 
                     border-2 border-dashed border-gray-700 rounded-lg
                     text-gray-400 hover:text-white hover:border-gray-600
                     transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Add New Stage
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="flex gap-3 justify-end">
            {!isMobile && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-400 hover:text-white 
                         hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={async () => {
                await viewModel.saveWorkflow();
                onClose();
              }}
              className={`px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors duration-200
                       flex items-center justify-center gap-2
                       font-medium ${isMobile ? 'w-full' : ''}`}
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

export default WorkflowEditorModal;