import { WorkflowStage } from "@/core/domain/models/Workflow";
import { WorkflowEditorViewModel } from "@/viewModels/WorkflowEditorViewModel";

export interface StageCardProps {
  stage: WorkflowStage;
  isExpanded: boolean;
  onExpand: (stageId: string) => void;
  onDragStart: (stageId: string) => void;
  onDrop: (targetId: string) => void;
  viewModel: WorkflowEditorViewModel;
  isMobile: boolean;
}

export interface StageCardHeaderHeaderProps {
  stage: WorkflowStage;
  isExpanded: boolean;
  onExpand: (stageId: string) => void;
  isMobile: boolean;
}

export interface StageCardContentProps {
  stage: WorkflowStage;
  viewModel: WorkflowEditorViewModel;
}

export interface WorkflowEditorModalProps {
  onClose: () => void;
}