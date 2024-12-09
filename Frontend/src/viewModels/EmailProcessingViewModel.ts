// src/presentation/viewModels/EmailProcessingViewModel.ts
import { injectable, inject } from 'inversify';
import { computed, makeObservable } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { Application } from '@/core/domain/models/Application';
import { Email } from '@/core/interfaces/services/IEmailService';
import { IGmailEmail } from '@/core/interfaces/services/IGmailService';
import { EmailProcessingModel } from '@/domain/models/EmailProcessingModel';
import { WorkflowEditorViewModel } from '@/viewModels/WorkflowEditorViewModel';
import { JobTrackerViewModel } from './JobTrackerViewModel';
import { RootStore } from '../presentation/viewModels/RootStore';

@injectable()
export class EmailProcessingViewModel {
  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) rootStore: RootStore,
    @inject(SERVICE_IDENTIFIERS.JobTrackerViewModel) jobTrackerViewModel: JobTrackerViewModel,
    @inject(SERVICE_IDENTIFIERS.WorkflowEditorViewModel) workflowEditorViewModel: WorkflowEditorViewModel
  ) {
    this.model = new EmailProcessingModel(rootStore, jobTrackerViewModel, workflowEditorViewModel);
    makeObservable(this, {
      applications: computed,
      matchedApplications: computed,
      availableStages: computed
    });
  }

  private model: EmailProcessingModel;

  // Data binding properties
  get applications() { return this.model.applications; }
  get matchedApplications() { return this.model.matchedApplications; }
  get availableStages() { return this.model.availableStages; }
  get isLoading() { return this.model.isLoading; }
  get error() { return this.model.error; }
  get searchInput() { return this.model.searchInput; }
  get isBodyExpanded() { return this.model.isBodyExpanded; }

  // UI event handlers that just delegate to model
  setSearchInput = (input: Partial<typeof this.model.searchInput>) => {
    this.model.searchInput = { ...this.model.searchInput, ...input };
  };

  toggleBodyExpanded = () => {
    this.model.isBodyExpanded = !this.model.isBodyExpanded;
  };

  createNewApplication = async (email: Email) => {
    return this.model.createNewApplication(email);
  };

  handleEmailUpdateApplication = async (existingApp: Application, newStage: string, email: IGmailEmail) => {
    return this.model.handleEmailUpdateApplication(existingApp, newStage, email);
  };

  reset = () => {
    this.model.reset();
  };
}