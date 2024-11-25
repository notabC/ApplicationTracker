import { WorkflowEditorViewModel } from "@/viewModels/WorkflowEditorViewModel";

export interface IWorkflowService {
  getOrCreateWorkflow(): Promise<Workflow>;
  getWorkflow(workflowId: string): Promise<Workflow>;
  updateWorkflow(workflow: Workflow): Promise<Workflow>;
  getStages(workflowId: string): Promise<WorkflowStage[]>;
  getColorForStage(workflowId: string, stageId: string): Promise<string>;
  getStageById(workflowId: string, stageId: string): Promise<WorkflowStage | undefined>;
  updateStage(workflowId: string, stageId: string, stage: WorkflowStage): Promise<Workflow>;
  updateStageOrder(workflowId: string, stageOrder: string[]): Promise<Workflow>;
  updateStageVisibility(workflowId: string, stageId: string, visible: boolean): Promise<Workflow>;
}

export interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  editable: boolean;
  visible: boolean;
}

export interface Workflow {
  id: string;
  user_id: string;
  user_email: string;
  stages: WorkflowStage[];
  stage_order: string[];
  default: boolean;
}

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