// src/presentation/viewModels/EmailProcessingViewModel.ts
import { makeAutoObservable, computed, action } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Email } from '@/core/interfaces/services/IEmailService';
import type { Application } from '@/core/domain/models/Application';
import type { IApplicationService, IWorkflowService } from '@/core/interfaces/services';
import { IGmailEmail } from '@/core/interfaces/services/IGmailService';
import { JobTrackerViewModel } from './JobTrackerViewModel';

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
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
    @inject(SERVICE_IDENTIFIERS.JobTrackerViewModel) private jobTrackerViewModel: JobTrackerViewModel,
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
    const newApplication: Application = {
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

    this.applicationService.addApplication(newApplication);
    this.jobTrackerViewModel.processEmail(email.id);
    return newApplication;

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

  @action
  handleEmailUpdateApplication = (existingApp: Application, newStage: string, email: IGmailEmail) => {
    const newLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      fromStage: existingApp.stage,
      toStage: newStage,
      message: `Status updated from ${existingApp.stage} to ${newStage}`,
      source: 'email',
      emailId: email.id,
      emailTitle: email.title,
      emailBody: email.body,
    };

    this.applicationService.updateApplication(existingApp.id, {
      ...existingApp,
      stage: newStage,
      lastUpdated: new Date().toISOString().split('T')[0],
      logs: [...existingApp.logs, newLog],
    });
    
    this.jobTrackerViewModel.processEmail(email.id);
  }
}
