import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, ChevronDown, Clock, Ellipsis } from 'lucide-react';
import { Application } from '@/core/domain/models/Application';
import type { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { StageSelector } from './StageSelector';
interface Props {
  application: Application;
  viewModel: JobTrackerViewModel;
}

export const ApplicationCard: React.FC<Props> = observer(({ application, viewModel }) => {
  const [showStageSelect, setShowStageSelect] = useState(false);

  const getAvailableStages = (currentStage: string): string[] => {
    const stages = viewModel.workflowStages;
    const stage_order = viewModel.stageOrder;
    const currentStageObj = stages.find(s => s.name === currentStage);
    
    if (!currentStageObj) return [];

    const currentIndex = stage_order.indexOf(currentStageObj.id);
    return stages
      .filter(stage => 
        stage.name === 'Rejected' || 
        stage_order.indexOf(stage.id) > currentIndex
      )
      .map(stage => stage.name);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      frontend: 'bg-blue-500/10 text-blue-400',
      backend: 'bg-green-500/10 text-green-400',
      fullstack: 'bg-purple-500/10 text-purple-400',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-400';
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
      className={`bg-[#282c34] p-4 rounded-lg 
                 border border-gray-800/50 hover:border-gray-700/50
                 hover:bg-[#2d313a] transition-all duration-200 
                 cursor-grab active:cursor-grabbing group
                 ${viewModel.dragDropVM.draggedApplication?.id === application.id ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-start text-left">
          <div>
            <h4 className="font-medium text-white leading-tight">{application.company}</h4>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{application.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <button
            className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowStageSelect(true);
            }}
          >
            <Ellipsis className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex gap-1.5 overflow-hidden">
          {(application.tags || [application.type]).slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(tag)}`}
            >
              {tag}
            </span>
          ))}
          {(application.tags || [application.type]).length > 3 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-500/10 text-gray-400">
              +{(application.tags || [application.type]).length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500 flex-shrink-0 ml-auto">
          <Clock className="h-3 w-3 mr-1" />
          {application.lastUpdated}
        </div>
      </div>

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