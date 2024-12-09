// src/presentation/views/components/ApplicationCard.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { GripVertical, Clock, Ellipsis } from 'lucide-react';
import { Application } from '@/core/domain/models/Application';
import { StageSelector } from '../StageSelector';
import type { JobTrackerViewModel } from '@/viewModels/JobTrackerViewModel';

interface Props {
  application: Application;
  onSelectApplication: (app: Application) => void;
  viewModel: JobTrackerViewModel;
}

export const ApplicationCard: React.FC<Props> = observer(({ application, onSelectApplication, viewModel }) => {
  const appData = viewModel.getApplicationViewData(application.id);
  if (!appData) return null; // If no data, don't render

  const { company, position, displayTags, extraTagCount, typeColorsForTags, relativeTimeSinceUpdate, isDragged } = appData;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    viewModel.beginDrag(application);
  };

  const handleDragEnd = () => {
    viewModel.endDrag();
  };

  const handleOpenStageSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    viewModel.openStageSelectorForApplication(application.id);
  };

  const handleCloseStageSelect = () => {
    viewModel.closeStageSelector();
  };

  const handleStageChange = async (newStage: string) => {
    await viewModel.handleStageChange(application, newStage);
    handleCloseStageSelect();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelectApplication(application)}
      className={`
        bg-gradient-to-br from-[#1e2128] to-[#16181d]
        p-4 rounded-xl
        shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
        hover:shadow-[12px_12px_24px_#111316,-12px_-12px_24px_#232732]
        active:shadow-[inset_8px_8px_16px_#111316,inset_-8px_-8px_16px_#232732]
        border border-[#232732]/10
        transition-all duration-200 
        cursor-grab active:cursor-grabbing group
        ${isDragged ? 'opacity-50' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3 items-start text-left">
          <div>
            <h4 className="font-medium text-white/90 leading-tight">{company}</h4>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{position}</p>
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
                    border-cyan-500/30
                    group
                    transition-all duration-200"
            onClick={handleOpenStageSelect}
          >
            <Ellipsis className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex gap-1.5 overflow-hidden">
          {displayTags.map(tag => (
            <span 
              key={tag} 
              className={`
                px-2.5 py-1 rounded-lg text-xs font-medium 
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                ${typeColorsForTags[tag]}
              `}
            >
              {tag}
            </span>
          ))}
          {extraTagCount > 0 && (
            <span className="
              px-2.5 py-1 rounded-lg text-xs font-medium 
              bg-[#1a1d24] text-gray-400
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]"
            >
              +{extraTagCount}
            </span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500 flex-shrink-0 ml-auto">
          <Clock className="h-3 w-3 mr-1" />
          {relativeTimeSinceUpdate}
        </div>
      </div>

      {viewModel.isStageSelectorOpenForApplication(application.id) && (
        <StageSelector
          onStageChange={handleStageChange}
          onClose={handleCloseStageSelect}
          availableStages={viewModel.getAvailableStages(application.stage)}
        />
      )}
    </div>
  );
});