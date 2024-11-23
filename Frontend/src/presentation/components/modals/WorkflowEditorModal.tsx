import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  GripVertical, Plus, X, Save, ChevronDown,
  Settings2, Eye, EyeOff, Palette 
} from 'lucide-react';
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  const handleClose = async () => {
    viewModel.resetWorkflow();
    onClose();
  };

  const StageCard = ({ stage }: { stage: WorkflowStage }) => {
    const isExpanded = expandedStage === stage.id;
    const currentStage = viewModel.getStages().find(s => s.id === stage.id);
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
        className={`bg-[#282c34] border border-gray-800/50 rounded-xl overflow-hidden 
                   transition-all duration-200 
                   ${!isMobile ? 'hover:border-gray-700/50' : ''} 
                   ${isExpanded ? 'ring-1 ring-blue-500/20' : ''}`}
      >
        <div 
          className={`p-4 flex items-center gap-3 
                     ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}`}
          onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
        >
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex-1 font-medium text-white truncate">
            {stage.name || 'Untitled Stage'}
          </div>

          <div className={`flex items-center gap-2 text-sm ${isVisible ? 'text-blue-400' : 'text-gray-500'}`}>
            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-800/50">
            {/* Stage Name Input */}
            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <Settings2 className="h-4 w-4" />
                Stage Name
              </label>
              <input
                type="text"
                value={stage.name}
                onChange={(e) => viewModel.updateStageName(stage.id, e.target.value)}
                disabled={stage.editable === false}
                className="w-full bg-[#1a1d24] px-4 py-2.5 rounded-xl text-white text-sm
                         border border-gray-800/50 
                         focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-200"
                placeholder="Enter stage name"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Visibility
              </label>
              <button
                onClick={() => stage.editable && viewModel.updateStageVisibility(stage.id, !stage.visible)}
                disabled={stage.editable === false}
                className={`relative w-11 h-6 rounded-full transition-all duration-200
                         ${isVisible ? 'bg-blue-500/20' : 'bg-gray-800/50'}
                         ${stage.editable === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                role="switch"
                aria-checked={isVisible}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 
                              ${isVisible ? 'bg-blue-400' : 'bg-gray-400'}
                              rounded-full transform transition-transform duration-200
                              ${isVisible ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <Palette className="h-4 w-4" />
                Stage Color
              </label>
              <div className="relative">
                <select
                  value={stage.color}
                  onChange={(e) => viewModel.updateStageColor(stage.id, e.target.value as WorkflowStage['color'])}
                  disabled={stage.editable === false}
                  className="w-full bg-[#1a1d24] px-4 py-2.5 rounded-xl text-white text-sm
                           border border-gray-800/50 
                           focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-all duration-200 appearance-none"
                >
                  {['gray', 'blue', 'green', 'yellow', 'red', 'purple'].map(color => (
                    <option key={color} value={color} className="bg-[#1a1d24]">
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {stage.editable !== false && (
              <button
                onClick={() => viewModel.deleteStage(stage.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                         bg-red-500/10 hover:bg-red-500/20 
                         border border-red-500/20 hover:border-red-500/30
                         text-red-400 hover:text-red-300
                         rounded-xl transition-all duration-200"
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
      <div className={`bg-[#1a1d24] border border-gray-800/50 flex flex-col ${
        isMobile 
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
            onClick={handleClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {viewModel.workflow.stage_order.map((stageId) => {
              const stage = viewModel.workflow.stages.find(s => s.id === stageId);
              if (!stage) return null;
              return <StageCard key={stage.id} stage={stage} />;
            })}
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
          <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-end'}`}>
            {!isMobile && (
              <button
                onClick={handleClose}
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
                onClose();
              }}
              className={`px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 
                       border border-blue-500/20 hover:border-blue-500/30
                       text-blue-400 hover:text-blue-300
                       rounded-xl transition-all duration-200
                       flex items-center justify-center gap-2
                       ${isMobile ? 'w-full' : ''}`}
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