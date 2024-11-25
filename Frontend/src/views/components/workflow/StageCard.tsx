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
        className={`bg-[#282c34] border border-gray-800/50 rounded-xl overflow-hidden 
                   transition-all duration-200 
                   ${!isMobile ? 'hover:border-gray-700/50' : ''} 
                   ${isExpanded ? 'ring-1 ring-blue-500/20' : ''}`}
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