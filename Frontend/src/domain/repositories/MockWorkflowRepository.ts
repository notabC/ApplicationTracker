// File: src/core/services/WorkflowService.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import type { Workflow, WorkflowStage } from '../interfaces/IWorkflow';

@injectable()
export class MockWorkflowRepository {
  @observable private workflow: Workflow = {
    stages: [
      { id: 'unassigned', name: 'Unassigned', color: 'gray', editable: false, visible: true },
      { id: 'resume-submitted', name: 'Resume Submitted', color: 'blue', editable: true, visible: true },
      { id: 'online-assessment', name: 'Online Assessment', color: 'yellow', editable: true, visible: true },
      { id: 'interview-process', name: 'Interview Process', color: 'purple', editable: true, visible: true },
      { id: 'offer', name: 'Offer', color: 'green', editable: true, visible: true },
      { id: 'rejected', name: 'Rejected', color: 'red', editable: true, visible: true }
    ],
    stage_order: [
      'unassigned',
      'resume-submitted',
      'online-assessment',
      'interview-process',
      'offer',
      'rejected'
    ],
    default: true,
    id: '',
    user_email: '',
    user_id: ''
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

  getStageById(stageId: string): WorkflowStage | undefined {
    return this.workflow.stages.find(s => s.id === stageId);
  }

  getStages(): WorkflowStage[] {
    // return this.workflow.stages; return it according to the order
    return this.workflow.stage_order.map((stageId) => {
      const stage = this.workflow.stages.find(s => s.id === stageId);
      if (!stage) throw new Error(`Stage with id ${stageId} not found`);
      return stage;
    });
  }

  getColorForStage(stageId: string): string {
    const stage = this.workflow.stages.find(s => s.id === stageId);
    return stage ? stage.color : 'gray';
  }
}

