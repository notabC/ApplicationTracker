// src/presentation/viewModels/EmailProcessingViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Email } from '@/core/interfaces/services/IEmailService';
import type { Application } from '@/core/domain/models/Application';
import { IGmailEmail } from '@/core/interfaces/services/IGmailService';
import { JobTrackerViewModel } from './JobTrackerViewModel';
import { RootStore } from './RootStore';
import { WorkflowEditorViewModel } from './WorkflowEditorViewModel';

interface SearchInput {
  company: string;
  position: string;
}

@injectable()
export class EmailProcessingViewModel {
  // Observables
  searchInput: SearchInput = {
    company: '',
    position: '',
  };
  isBodyExpanded: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowEditorViewModel) private workflowEditorViewModel: WorkflowEditorViewModel,
    @inject(SERVICE_IDENTIFIERS.JobTrackerViewModel) private jobTrackerViewModel: JobTrackerViewModel,
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore,
  ) {
    makeAutoObservable(this);
  }

  // Computed Properties
  get applications(): Application[] {
    return this.rootStore.applications;
  }

  get matchedApplications(): Application[] {
    if (!this.searchInput.company && !this.searchInput.position) {
      return [];
    }

    return this.applications.filter((app: Application) => {
      const companyMatch = app.company.toLowerCase().includes(this.searchInput.company.toLowerCase());
      const positionMatch = app.position.toLowerCase().includes(this.searchInput.position.toLowerCase());

      return companyMatch && (this.searchInput.position ? positionMatch : true);
    });
  }

  // Actions

  setSearchInput(input: Partial<SearchInput>): void {
    this.searchInput = { ...this.searchInput, ...input };
  }

  toggleBodyExpanded(): void {
    this.isBodyExpanded = !this.isBodyExpanded;
  }

  /**
   * Creates a new application from an email.
   * @param email The email to process.
   * @returns The newly created application.
   */
  async createNewApplication(email: Email): Promise<Application | null> {
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
      notes: `Created from email: ${email.subject}\nFrom: ${email.sender}`,
      logs: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          fromStage: null,
          toStage: 'Resume Submitted',
          message: 'Application created from Gmail import',
          source: 'gmail',
          emailId: email.id,
          emailTitle: email.subject,
          emailBody: email.body,
        },
      ],
    };

    this.isLoading = true;
    try {
      await this.rootStore.addApplication(newApplication);
      await this.jobTrackerViewModel.processEmail(email.id);
      runInAction(() => {
        this.error = null;
      });
      return newApplication;
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to create a new application.';
        console.error('Error creating application:', error);
      });
      return null;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Retrieves available stages based on the current stage.
   * @param currentStage The current stage of the application.
   * @returns An array of available stage names.
   */
  getAvailableStages(currentStage: string): string[] {
    const workflow = this.workflowEditorViewModel.workflow;
    const { stages, stage_order } = workflow;
    const currentStageObj = stages.find((s) => s.name === currentStage);
    if (!currentStageObj) return [];

    const currentIndex = stage_order.indexOf(currentStageObj.id);
    return stages
      .filter(
        (stage) =>
          stage.name === 'Rejected' ||
        stage_order.indexOf(stage.id) > currentIndex,
      )
      .map((stage) => stage.name);
  }

  /**
   * Resets the search input and body expansion state.
   */
  reset(): void {
    this.searchInput = {
      company: '',
      position: '',
    };
    this.isBodyExpanded = false;
  }

  /**
   * Handles updating an existing application based on an email.
   * @param existingApp The existing application to update.
   * @param newStage The new stage to transition the application to.
   * @param email The email associated with the update.
   */
  async handleEmailUpdateApplication(
    existingApp: Application,
    newStage: string,
    email: IGmailEmail,
  ): Promise<void> {
    const newLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      fromStage: existingApp.stage,
      toStage: newStage,
      message: `Status updated from ${existingApp.stage} to ${newStage}`,
      source: 'email',
      emailId: email.id,
      emailTitle: email.subject,
      emailBody: email.body,
    };

    const updatedApplication: Application = {
      ...existingApp,
      stage: newStage,
      lastUpdated: new Date().toISOString(),
      logs: [...existingApp.logs, newLog],
    };

    this.isLoading = true;
    try {
      await this.rootStore.updateApplication(updatedApplication);
      await this.jobTrackerViewModel.processEmail(email.id);
      runInAction(() => {
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to update the application.';
        console.error('Error updating application:', error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
