import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, ChevronDown, Clock } from 'lucide-react';
import { Application } from '@/core/domain/models/Application';
import type { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { StageSelector } from './StageSelector';
import { IWorkflowService } from '@/core/interfaces/services';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { container } from '@/di/container';

interface Props {
  application: Application;
  viewModel: JobTrackerViewModel;
}

export const ApplicationCard: React.FC<Props> = observer(({ 
  application, 
  viewModel 
}) => {
  // Local state instead of using singleton
  const [showStageSelect, setShowStageSelect] = useState(false);
  
  // Get workflow service directly
  const workflowService = container.get<IWorkflowService>(SERVICE_IDENTIFIERS.WorkflowService);

  const getAvailableStages = (currentStage: string): string[] => {
    const workflow = workflowService.getWorkflow();
    const { stages, stageOrder } = workflow;
    const currentStageObj = stages.find(s => s.name === currentStage);
    if (!currentStageObj) return [];

    const currentIndex = stageOrder.indexOf(currentStageObj.id);
    return stages
      .filter(stage => 
        stage.name === 'Rejected' || 
        stageOrder.indexOf(stage.id) > currentIndex
      )
      .map(stage => stage.name);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      frontend: 'bg-blue-900 text-blue-200',
      backend: 'bg-green-900 text-green-200',
      fullstack: 'bg-purple-900 text-purple-200',
    };
    return colors[type] || 'bg-gray-800 text-gray-200';
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    viewModel.dragDropVM.setDraggedApplication(application);
  };

  const handleDragEnd = () => {
    viewModel.dragDropVM.setDraggedApplication(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => viewModel.selectApplication(application)}
      className={`bg-gray-750 p-4 rounded-lg border border-gray-700 
                 hover:bg-gray-700 transition-colors duration-200 cursor-grab 
                 active:cursor-grabbing group
                 ${viewModel.dragDropVM.draggedApplication?.id === application.id ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-center text-left">
          <div>
            <h4 className="font-medium text-white">{application.company}</h4>
            <p className="text-sm text-gray-400">{application.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-500 hidden group-hover:flex cursor-grab active:cursor-grabbing" />
          <button
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowStageSelect(true);
            }}
          >
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex gap-1 overflow-hidden">
          {(application.tags || [application.type]).slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${getTypeColor(tag)}`}
            >
              {tag}
            </span>
          ))}
          {(application.tags || [application.type]).length > 3 && (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
              +{(application.tags || [application.type]).length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-400 flex-shrink-0">
          <Clock className="h-3 w-3 mr-1" />
          {application.lastUpdated}
        </div>
      </div>

      {/* Stage Selector Modal */}
      {showStageSelect && (
        <StageSelector
          onStageChange={(newStage) => {
            viewModel.handleStageChange(application, newStage);
            setShowStageSelect(false);
          }}
          onClose={() => setShowStageSelect(false)}
          availableStages={getAvailableStages(application.stage)}
        />
      )}
    </div>
  );
});