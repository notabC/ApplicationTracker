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
    stages: WorkflowStage[];
    stage_order: string[];
    default: boolean;
  }