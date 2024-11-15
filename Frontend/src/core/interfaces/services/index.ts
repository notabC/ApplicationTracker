import { Application } from '@/core/domain/models/Application';
import { Workflow, WorkflowStage } from '@/core/domain/models/Workflow';

export interface IApplicationService {
  getApplications(): Application[];
  setApplications(applications: Application[]): void;
  updateApplication(id: number, updates: Partial<Application>): void;
}

export interface IWorkflowService {
  getWorkflow(): Workflow;
  updateWorkflow(workflow: Workflow): void;
  getStages(): WorkflowStage[];
}