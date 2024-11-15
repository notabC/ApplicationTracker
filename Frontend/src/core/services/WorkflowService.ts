// File: src/core/services/WorkflowService.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import type { Workflow, WorkflowStage } from '../domain/models/Workflow';
import { IWorkflowService } from '../interfaces/services';

@injectable()
export class WorkflowService implements IWorkflowService {
  @observable private workflow: Workflow = {
    stages: [
      { id: 'unassigned', name: 'Unassigned', color: 'gray', editable: false },
      { id: 'resume-submitted', name: 'Resume Submitted', color: 'blue', editable: true },
      { id: 'online-assessment', name: 'Online Assessment', color: 'yellow', editable: true },
      { id: 'interview-process', name: 'Interview Process', color: 'purple', editable: true },
      { id: 'offer', name: 'Offer', color: 'green', editable: true },
      { id: 'rejected', name: 'Rejected', color: 'red', editable: false }
    ],
    stageOrder: [
      'unassigned',
      'resume-submitted',
      'online-assessment',
      'interview-process',
      'offer',
      'rejected'
    ]
  };

  constructor() {
    makeObservable(this);
  }

  getWorkflow(): Workflow {
    return this.workflow;
  }

  @action
  updateWorkflow(workflow: Workflow) {
    this.workflow = workflow;
  }

  getStages(): WorkflowStage[] {
    return this.workflow.stages;
  }
}

