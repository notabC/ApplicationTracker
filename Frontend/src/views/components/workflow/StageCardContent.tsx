// src/views/components/workflow/StageCardContent.tsx
import { StageCardContentProps, WorkflowStage } from "@/domain/interfaces/IWorkflow";
import { Settings2, Eye, EyeOff, Palette, ChevronDown, X } from "lucide-react";
import { observer } from "mobx-react-lite";

export const StageCardContent: React.FC<StageCardContentProps> = observer(({
    stage,
    viewModel
  }) => (
    <div className="
      px-4 pb-4 space-y-4 border-t border-[#232732]/20 pt-4
      bg-gradient-to-br from-[#1e2128] to-[#16181d]
    ">
      {/* Stage Name Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <Settings2 className="h-4 w-4" />
          Stage Name
        </label>
        <input
          type="text"
          value={stage.name}
          onChange={(e) => viewModel.updateStage(stage.id, { name: e.target.value })}
          disabled={stage.editable === false}
          className="
            w-full bg-[#1a1d24] px-4 py-2.5 rounded-xl text-white text-sm
            border border-[#232732]/20
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
            disabled:opacity-50 disabled:cursor-not-allowed 
            transition-all duration-200
          "
          placeholder="Enter stage name"
        />
      </div>
  
      {/* Visibility Toggle */}
      <div className="flex items-center justify-between py-1">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          {stage.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          Visibility
        </label>
        <button
          onClick={() => stage.editable && viewModel.updateStage(stage.id, { visible: !stage.visible })}
          disabled={stage.editable === false}
          className={`
            relative w-11 h-6 rounded-full transition-all duration-200
            ${stage.visible ? 'bg-blue-500/20' : 'bg-gray-800/50'}
            ${stage.editable === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-blue-500/30
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          `}
          role="switch"
          aria-checked={stage.visible}
        >
          <div className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full transform transition-transform duration-200
            ${stage.visible ? 'translate-x-5 bg-blue-400' : 'translate-x-0 bg-gray-400'}
            shadow-[2px_2px_4px_#111316,-2px_-2px_4px_#232732]
          `} />
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
            onChange={(e) => viewModel.updateStage(stage.id, { color: e.target.value as WorkflowStage['color'] })}
            disabled={stage.editable === false}
            className="
              w-full bg-[#1a1d24] px-4 py-2.5 rounded-xl text-white text-sm
              border border-[#232732]/20
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
              disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-200 appearance-none
            "
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
  
      {/* Delete Button */}
      {stage.editable !== false && (
        <button
          onClick={() => viewModel.deleteStage(stage.id)}
          className="
            w-full flex items-center justify-center gap-2 px-4 py-2.5
            bg-red-500/10 hover:bg-red-500/20 
            border border-red-500/20 hover:border-red-500/30
            text-red-400 hover:text-red-300
            rounded-xl transition-all duration-200
            shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
            hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
            active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
          "
        >
          <X className="h-4 w-4" />
          Delete Stage
        </button>
      )}
    </div>
  ));