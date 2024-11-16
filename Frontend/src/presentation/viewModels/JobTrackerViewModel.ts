// src/presentation/viewModels/JobTrackerViewModel.ts
import { inject, injectable } from "inversify";
import { makeAutoObservable, runInAction } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { Workflow } from '@/core/domain/models/Workflow';
import type { IApplicationService, IWorkflowService } from '@/core/interfaces/services';
import type { Email, IEmailService } from '@/core/interfaces/services/IEmailService';
import { DragDropViewModel } from './DragDropViewModel';

@injectable()
export class JobTrackerViewModel {
  // Observables
  private _applications: Application[] = [];
  private _workflow: Workflow;
  searchTerm: string = '';
  activeFilters: string[] = [];
  isFilterExpanded: boolean = false;
  selectedApplication: Application | null = null;
  showAddModal: boolean = false;
  showImportModal: boolean = false;
  showWorkflowModal: boolean = false;
  isGmailModalOpen: boolean = false;
  emails: Email[] = [];
  selectedEmail: Email | null = null;
  showEmailProcessingModal: boolean = false;
  showHistory: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  // Services
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
    @inject(SERVICE_IDENTIFIERS.EmailService) private emailService: IEmailService,
    @inject(SERVICE_IDENTIFIERS.DragDropViewModel) private dragDropViewModel: DragDropViewModel
  ) {
    makeAutoObservable(this);
    this._workflow = this.workflowService.getWorkflow();
    this.loadApplications();
    this.loadEmails();
  }

  // Computed Properties
  get applications(): Application[] {
    return this._applications;
  }

  get filteredApplications(): Application[] {
    return this._applications.filter((app: Application) =>
      (app.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       app.position.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.activeFilters.length === 0 || this.activeFilters.some(filter => app.tags.includes(filter)))
    );
  }

  get workflowStages(): Workflow['stages'] {
    return this._workflow.stages;
  }

  get unprocessedEmails(): Email[] {
    return this.emails.filter(email => !email.processed);
  }

  get currentApplicationIndex(): number {
    if (!this.selectedApplication) return -1;
    const stageApps = this.getApplicationsByStage(this.selectedApplication.stage);
    return stageApps.findIndex(app => app.id === this.selectedApplication?.id);
  }

  get totalApplicationsInCurrentStage(): number {
    if (!this.selectedApplication) return 0;
    return this.getApplicationsByStage(this.selectedApplication.stage).length;
  }

  // DragDropViewModel Getter
  get dragDropVM(): DragDropViewModel {
    return this.dragDropViewModel;
  }

  // Actions

  // Load Applications
  private async loadApplications(): Promise<void> {
    this.isLoading = true;
    try {
      // Replace mockApplications with actual service call if needed
      const applications = await this.applicationService.getApplications();
      runInAction(() => {
        this._applications = applications;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load applications';
        console.error('Failed to load applications:', error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  // Load Emails
  loadEmails(): void {
    try {
      const fetchedEmails = this.emailService.getEmails();
      this.emails = fetchedEmails;
      console.log('Loaded Emails:', this.emails); // Debugging
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load emails';
        console.error('Failed to load emails:', error);
      });
    }
  }

  // Add Emails
  addEmails(newEmails: Email[]): void {
    try {
      this.emailService.addEmails(newEmails);
      this.loadEmails();
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to add emails';
        console.error('Failed to add emails:', error);
      });
    }
  }

  // Mark Emails as Processed
  markEmailsAsProcessed(emailIds: string[]): void {
    try {
      this.emailService.markAsProcessed(emailIds);
      this.loadEmails();
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to mark emails as processed';
        console.error('Failed to mark emails as processed:', error);
      });
    }
  }

  // Set Search Term
  setSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  // Toggle Filter
  toggleFilter(filter: string): void {
    if (this.activeFilters.includes(filter)) {
      this.activeFilters = this.activeFilters.filter(f => f !== filter);
    } else {
      this.activeFilters.push(filter);
    }
  }

  // Toggle Filter Expanded
  toggleFilterExpanded(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  // Get Applications by Stage
  getApplicationsByStage(stage: string): Application[] {
    return this.filteredApplications.filter((app: Application) => app.stage === stage);
  }

  // Select Application
  async selectApplication(application: Application | null): Promise<void> {
    if (application) {
      try {
        const updatedApplication = await this.applicationService.getApplicationById(application.id);
        runInAction(() => {
          this.selectedApplication = updatedApplication ?? null;
          this.error = null;
        });
      } catch (error) {
        runInAction(() => {
          this.error = 'Failed to load application details';
          console.error('Failed to load application details:', error);
        });
      }
    } else {
      runInAction(() => {
        this.selectedApplication = null;
      });
    }
  }

  // Clear Selected Application
  clearSelectedApplication(): void {
    this.selectedApplication = null;
  }

  // Handle Stage Change
  async handleStageChange(applicationId: string, newStage: string): Promise<void> {
    const application = this._applications.find((app: Application) => app.id === applicationId);
    if (!application) return;

    const updatedApplication: Application = {
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

    try {
      await this.applicationService.updateApplication(updatedApplication.id, updatedApplication);
      await this.loadApplications(); // Reload all applications to ensure consistency
      runInAction(() => {
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to update application stage';
        console.error('Failed to update application stage:', error);
      });
    }
  }

  // Add Application
  async addApplication(application: Application): Promise<void> {
    try {
      await this.applicationService.addApplication(application);
      await this.loadApplications();
      runInAction(() => {
        this.showAddModal = false;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to create application';
        console.error('Failed to create application:', error);
      });
    }
  }

  // Show Add Application Modal
  setShowAddModal(show: boolean): void {
    this.showAddModal = show;
  }

  // Show Import Gmail Modal
  setShowImportModal(show: boolean): void {
    this.showImportModal = show;
  }

  // Show Workflow Modal
  setShowWorkflowModal(show: boolean): void {
    this.showWorkflowModal = show;
  }

  // Set Gmail Modal Open State
  setIsGmailModalOpen(show: boolean): void {
    this.isGmailModalOpen = show;
  }

  // Select Email
  selectEmail(email: Email | null): void {
    this.selectedEmail = email;
    if (email) {
      this.showEmailProcessingModal = true;
    }
  }

  // Close Email Processing Modal
  closeEmailProcessingModal(): void {
    this.showEmailProcessingModal = false;
    this.selectedEmail = null;
  }

  // Process Email
  async processEmail(emailId: string): Promise<void> {
    try {
      // Mark email as processed
      await this.emailService.markAsProcessed([emailId]);

      // Refresh data
      this.loadEmails();

      // Close modal
      this.closeEmailProcessingModal();
      runInAction(() => {
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to process email';
        console.error('Failed to process email:', error);
      });
    }
  }

  // Navigate Applications
  navigateApplications(direction: 'prev' | 'next'): void {
    if (!this.selectedApplication) return;

    const stageApps = this.getApplicationsByStage(this.selectedApplication.stage);
    if (stageApps.length === 0) return;

    const currentIndex = stageApps.findIndex(app => app.id === this.selectedApplication?.id);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % stageApps.length
      : (currentIndex - 1 + stageApps.length) % stageApps.length;

    this.selectedApplication = stageApps[newIndex];
  }

  // Show History
  setShowHistory(show: boolean): void {
    this.showHistory = show;
  }
}
