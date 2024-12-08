// src/views/components/workflow/StageCard.tsx
import { StageCardProps } from "@/domain/interfaces/IWorkflow";
import { observer } from "mobx-react-lite";
import { StageCardHeader } from "./StageCardHeader";
import { StageCardContent } from "./StageCardContent";

export const StageCard: React.FC<StageCardProps> = observer(({
    stage,
    isExpanded,
    onExpand,
    onDragStart,
    onDrop,
    viewModel,
    isMobile
  }) => {
    return (
      <div
        draggable={stage.editable !== false}
        onDragStart={(e) => {
          onDragStart(stage.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(stage.id);
        }}
        className={`
          bg-[#1a1d24] 
          border border-[#232732]/20 
          rounded-xl overflow-hidden
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
          transition-all duration-200
          ${!isMobile ? 'hover:border-cyan-500/30' : ''} 
          ${isExpanded ? 'ring-1 ring-blue-500/20' : ''}
          cursor-grab active:cursor-grabbing
        `}
      >
        <StageCardHeader
          stage={stage}
          isExpanded={isExpanded}
          onExpand={onExpand}
          isMobile={isMobile}
        />
        {isExpanded && (
          <StageCardContent
            stage={stage}
            viewModel={viewModel}
          />
        )}
      </div>
    );
  });