// src/core/domain/models/EmailProcessingModel.ts
import { makeAutoObservable } from 'mobx';
import type { Application } from '@/core/domain/models/Application';
import type { Email } from '@/core/interfaces/services/IEmailService';
import { IGmailEmail } from '@/core/interfaces/services/IGmailService';
import { WorkflowEditorViewModel } from '@/viewModels/WorkflowEditorViewModel';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { RootStore } from '@/presentation/viewModels/RootStore';

export class EmailProcessingModel {
  searchInput = {
    company: '',
    position: '',
  };
  isBodyExpanded = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private rootStore: RootStore,
    private jobTrackerViewModel: JobTrackerViewModel,
    private workflowEditorViewModel: WorkflowEditorViewModel
  ) {
    makeAutoObservable(this);
  }

  get applications() {
    return this.rootStore.applications;
  }

  get matchedApplications() {
    if (!this.searchInput.company && !this.searchInput.position) {
      return [];
    }

    return this.applications.filter((app) => {
      const companyMatch = app.company.toLowerCase().includes(this.searchInput.company.toLowerCase());
      const positionMatch = app.position.toLowerCase().includes(this.searchInput.position.toLowerCase());
      return companyMatch && (this.searchInput.position ? positionMatch : true);
    });
  }

  get availableStages() {
    return (currentStage: string) => {
      const stages = this.workflowEditorViewModel.stages;
      const stage_order = this.workflowEditorViewModel.stageOrder;
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
    };
  }

  async createNewApplication(email: Email): Promise<Application | null> {
    this.isLoading = true;
    try {
      const newApplication = {
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

      await this.rootStore.addApplication(newApplication);
      await this.jobTrackerViewModel.processEmail(email.id);
      this.error = null;
      return newApplication;
    } catch (error) {
      this.error = 'Failed to create a new application.';
      console.error('Error creating application:', error);
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  async handleEmailUpdateApplication(
    existingApp: Application,
    newStage: string,
    email: IGmailEmail,
  ): Promise<void> {
    this.isLoading = true;
    try {
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

      const updatedApplication = {
        ...existingApp,
        stage: newStage,
        lastUpdated: new Date().toISOString(),
        logs: [...existingApp.logs, newLog],
      };

      await this.rootStore.updateApplication(updatedApplication);
      await this.jobTrackerViewModel.processEmail(email.id);
      this.error = null;
    } catch (error) {
      this.error = 'Failed to update the application.';
      console.error('Error updating application:', error);
    } finally {
      this.isLoading = false;
    }
  }

  reset(): void {
    this.searchInput = {
      company: '',
      position: '',
    };
    this.isBodyExpanded = false;
  }
}