import React from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, Plus, X, Save, ChevronDown } from 'lucide-react';
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
    const isExpanded = expandedStage === stage.id;
    
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
        className={`bg-gray-800 rounded-lg overflow-hidden ${!isMobile ? 'hover:bg-gray-750' : ''}`}
      >
        <div 
          className={`p-3 flex items-center gap-3 ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}
          onClick={() => isMobile && setExpandedStage(isExpanded ? null : stage.id)}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
          
          {isMobile ? (
            <>
              <div className="flex-1 font-medium text-white truncate">
                {stage.name}
              </div>
              <div className={`p-1.5 rounded-md transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                value={stage.name}
                onChange={(e) => viewModel.updateStageName(stage.id, e.target.value)}
                disabled={stage.editable === false}
                className="flex-1 bg-gray-700 px-3 py-1.5 rounded-lg text-white text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Stage name"
              />
              
            <div className='relative w-24'>
              <select
                value={stage.color}
                onChange={(e) => viewModel.updateStageColor(stage.id, e.target.value as WorkflowStage['color'])}
                disabled={stage.editable === false}
                className="w-full bg-gray-700 px-3 py-2 rounded-lg text-white text-sm appearance-none
                        disabled:opacity-50 disabled:cursor-not-allowed"
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

              {stage.editable !== false && (
                <button
                  onClick={() => viewModel.deleteStage(stage.id)}
                  className="p-1.5 hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Mobile Expanded Content */}
        {isMobile && isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            <input
              type="text"
              value={stage.name}
              onChange={(e) => viewModel.updateStageName(stage.id, e.target.value)}
              disabled={stage.editable === false}
              className="w-full bg-gray-700 px-3 py-2 rounded-lg text-white text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Stage name"
            />
            
            <div className='relative'>
              <select
                value={stage.color}
                onChange={(e) => viewModel.updateStageColor(stage.id, e.target.value as WorkflowStage['color'])}
                disabled={stage.editable === false}
                className="w-full bg-gray-700 px-3 py-2 rounded-lg text-white text-sm appearance-none
                        disabled:opacity-50 disabled:cursor-not-allowed"
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

            {stage.editable !== false && (
              <button
                onClick={() => viewModel.deleteStage(stage.id)}
                className="w-full flex items-center justify-center gap-2 p-2 
                         bg-red-500/10 text-red-400 rounded-lg"
              >
                <X className="h-4 w-4" />
                Delete Stage
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-gray-900 flex flex-col ${
        isMobile 
          ? 'fixed inset-0' 
          : 'rounded-xl w-full max-w-2xl max-h-[85vh]'
      }`}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Edit Workflow</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-800 rounded-lg">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
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
                     text-gray-400 hover:text-white hover:border-gray-600"
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
                className="px-4 py-2 text-gray-400 hover:text-white rounded-lg"
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
                       hover:bg-blue-700 flex items-center justify-center gap-2
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