// src/views/components/workflow/StageCardHeader.tsx
import { StageCardHeaderHeaderProps } from "@/domain/interfaces/IWorkflow";
import { GripVertical, Eye, EyeOff, ChevronDown } from "lucide-react";
import { observer } from "mobx-react-lite";

export const StageCardHeader: React.FC<StageCardHeaderHeaderProps> = observer(({
    stage,
    isExpanded,
    onExpand,
    isMobile
  }) => (
    <div 
      className={`
        p-4 flex items-center gap-3 
        ${isMobile ? '' : 'cursor-grab active:cursor-grabbing'}
      `}
      onClick={() => onExpand(stage.id)}
    >
      <div 
        className="
          bg-[#1a1d24]
          border border-[#232732]/20
          rounded-lg p-2
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        "
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1 font-medium text-white truncate">
        {stage.name || 'Untitled Stage'}
      </div>
  
      <div className={`
        flex items-center gap-2 text-sm
        ${stage.visible ? 'text-blue-400' : 'text-gray-500'}
      `}>
        {stage.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  ));