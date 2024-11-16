  // File: src/core/domain/models/Workflow.ts
  export interface WorkflowStage {
    id: string;
    name: string;
    color: string;
    editable: boolean;
  }
  
  export interface Workflow {
    stages: WorkflowStage[];
    stageOrder: string[];
  }
  