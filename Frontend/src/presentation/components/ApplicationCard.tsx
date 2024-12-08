import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, Clock, Ellipsis } from 'lucide-react';
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
      className={`
        bg-gradient-to-br from-[#1e2128] to-[#16181d]
        p-4 rounded-xl
        shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
        hover:shadow-[12px_12px_24px_#111316,-12px_-12px_24px_#232732]
        active:shadow-[inset_8px_8px_16px_#111316,inset_-8px_-8px_16px_#232732]
        border border-[#232732]/10
        transition-all duration-200 
        cursor-grab active:cursor-grabbing group
        ${viewModel.dragDropVM.draggedApplication?.id === application.id ? 'opacity-50' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-start text-left">
          <div>
            <h4 className="font-medium text-white/90 leading-tight">{application.company}</h4>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{application.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <button
            className="p-2 rounded-lg
                    bg-[#1a1d24] border border-[#232732]/20
                    shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                    hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                    active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                    hover:border-cyan-500/30
                    group
                    transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setShowStageSelect(true);
            }}
          >
            <Ellipsis className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex gap-1.5 overflow-hidden">
          {(application.tags || [application.type]).slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className={`px-2.5 py-1 rounded-lg text-xs font-medium 
                       shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                       ${getTypeColor(tag)}`}
            >
              {tag}
            </span>
          ))}
          {(application.tags || [application.type]).length > 3 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium 
                          bg-[#1a1d24] text-gray-400
                          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]">
              +{(application.tags || [application.type]).length - 3}
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500 flex-shrink-0 ml-auto">
          <Clock className="h-3 w-3 mr-1" />
            {(() => {
              const seconds = Math.floor((new Date().getTime() - new Date(application.lastUpdated).getTime()) / 1000);
              const intervals = [
              { label: 'year', seconds: 31536000 },
              { label: 'month', seconds: 2592000 },
              { label: 'day', seconds: 86400 },
              { label: 'hour', seconds: 3600 },
              { label: 'minute', seconds: 60 },
              { label: 'second', seconds: 1 },
              ];

              for (const interval of intervals) {
              const count = Math.floor(seconds / interval.seconds);
              if (count > 0) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
              }
              }
              return 'just now';
            })()}
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