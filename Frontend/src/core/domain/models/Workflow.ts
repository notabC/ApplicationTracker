  // File: src/core/domain/models/Workflow.ts
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