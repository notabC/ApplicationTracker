// src/presentation/viewModels/EmailProcessingViewModel.ts
import { makeAutoObservable, runInAction, computed } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Email } from '@/core/interfaces/services/IEmailService';
import type { Application } from '@/core/domain/models/Application';
import type { IApplicationService, IWorkflowService } from '@/core/interfaces/services';

interface SearchInput {
  company: string;
  position: string;
}

@injectable()
export class EmailProcessingViewModel {
  searchInput: SearchInput = {
    company: '',
    position: ''
  };
  isBodyExpanded = false;
  
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService
  ) {
    makeAutoObservable(this);
  }

  setSearchInput(input: Partial<SearchInput>) {
    this.searchInput = { ...this.searchInput, ...input };
  }

  toggleBodyExpanded() {
    this.isBodyExpanded = !this.isBodyExpanded;
  }

  @computed
  get matchedApplications(): Application[] {
    const applications = this.applicationService.getApplications();
    
    if (!this.searchInput.company && !this.searchInput.position) {
      return [];
    }

    return applications.filter(app => {
      const companyMatch = app.company.toLowerCase()
        .includes(this.searchInput.company.toLowerCase());
      const positionMatch = app.position.toLowerCase()
        .includes(this.searchInput.position.toLowerCase());
      
      return companyMatch && (this.searchInput.position ? positionMatch : true);
    });
  }

  createNewApplication(email: Email): Application {
    return {
      id: crypto.randomUUID(),
      company: this.searchInput.company,
      position: this.searchInput.position,
      dateApplied: email.date,
      stage: 'Resume Submitted',
      type: 'frontend',
      tags: ['frontend'],
      lastUpdated: new Date().toISOString(),
      description: email.body,
      salary: 'Not specified',
      location: 'Not specified',
      notes: `Created from email: ${email.title}\nFrom: ${email.from}`,
      logs: [{
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        fromStage: null,
        toStage: 'Resume Submitted',
        message: 'Application created from Gmail import',
        source: 'gmail',
        emailId: email.id,
        emailTitle: email.title,
        emailBody: email.body,
      }]
    };
  }

  async updateExistingApplication(application: Application, newStage: string): Promise<void> {
    const updatedApp = {
      ...application,
      stage: newStage,
      lastUpdated: new Date().toISOString(),
      logs: [
        ...application.logs,
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          fromStage: application.stage,
          toStage: newStage,
          message: `Status updated from ${application.stage} to ${newStage}`,
          source: 'manual'
        }
      ]
    };

    this.applicationService.updateApplication(application.id, updatedApp);
  }

  getAvailableStages(currentStage: string): string[] {
    const workflow = this.workflowService.getWorkflow();
    const { stages, stageOrder } = workflow;
    const currentStageObj = stages.find(s => s.name === currentStage);
    if (!currentStageObj) return [];

    const currentIndex = stageOrder.indexOf(currentStageObj.id);
    return stages
      .filter(stage => 
        stage.name === 'Rejected' || 
        stageOrder.indexOf(stage.id) > currentIndex
      )
      .map(stage => stage.name);
  }

  reset() {
    this.searchInput = {
      company: '',
      position: ''
    };
    this.isBodyExpanded = false;
  }
}

