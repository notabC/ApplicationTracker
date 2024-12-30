// src/domain/models/JobTrackerModel.ts
import { makeAutoObservable } from 'mobx';
import type { Application } from '@/domain/interfaces/IApplication';
import type { Email, IEmailService } from '@/domain/interfaces/IEmailService';
import type { RootStore } from '@/viewModels/RootStore';
import { IWorkflowService } from '../interfaces/IWorkflow';

type AppTypeColorMap = Record<string, string>;

export interface ApplicationViewData {
  company: string;
  position: string;
  displayTags: string[];
  extraTagCount: number;
  typeColorsForTags: Record<string, string>;
  relativeTimeSinceUpdate: string;
  isDragged: boolean;
}

export class JobTrackerModel {
  private rootStore: RootStore;
  private emailService: IEmailService;
  private workflowService: IWorkflowService;

  isLoading: boolean = false;
  error: string | null = null;
  searchTerm: string = '';
  activeFilters: string[] = [];
  emails: Email[] = [];
  draggedApplication: Application | null = null;
  dragOverStageId: string | null = null;

  // For stage selector UI state management at Model level:
  stageSelectorForApplicationId: string | null = null;

  private typeColorMap: AppTypeColorMap = {
    frontend: 'bg-blue-500/10 text-blue-400',
    backend: 'bg-green-500/10 text-green-400',
    fullstack: 'bg-purple-500/10 text-purple-400',
  };

  constructor(rootStore: RootStore, emailService: IEmailService, workflowService: IWorkflowService) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
    this.emailService = emailService;
    this.workflowService = workflowService;
    this.loadEmails();
  }

  get applications(): Application[] {
    return this.rootStore.applications;
  }

  get filteredApplications(): Application[] {
    return this.applications.filter(app => {
      const matchesSearch = app.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            app.position.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilters = this.activeFilters.length === 0 ||
                             this.activeFilters.some(filter => app.tags.includes(filter));
      return matchesSearch && matchesFilters;
    });
  }

  get unprocessedEmails(): Email[] {
    return this.emails.filter(email => !email.processed);
  }

  get filteredUnprocessedEmails(): Email[] {
    const term = this.searchTerm.toLowerCase();
    return this.unprocessedEmails.filter(email =>
      email.subject.toLowerCase().includes(term) ||
      email.body.toLowerCase().includes(term)
    );
  }

  setSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  toggleFilter(filter: string): void {
    if (this.activeFilters.includes(filter)) {
      this.activeFilters = this.activeFilters.filter(f => f !== filter);
    } else {
      this.activeFilters.push(filter);
    }
  }

  async handleStageChange(application: Application, newStage: string): Promise<void> {
    const newLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      fromStage: application.stage,
      toStage: newStage,
      message: `Status updated from ${application.stage} to ${newStage}`,
      source: 'manual',
    };

    const updatedApplication: Application = {
      ...application,
      stage: newStage,
      lastUpdated: new Date().toISOString(),
      logs: [...application.logs, newLog],
    };

    try {
      this.isLoading = true;
      await this.rootStore.updateApplication(updatedApplication);
      this.error = null;
    } catch (error) {
      this.error = 'Failed to update application stage';
      console.error('Failed to update application stage:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadEmails(): Promise<void> {
    try {
      this.isLoading = true;
      const fetchedEmails = await this.emailService.getEmails();
      this.emails = fetchedEmails;
      this.error = null;
    } catch (error) {
      this.error = 'Failed to load emails';
      console.error('Failed to load emails:', error);
    } finally {
      this.isLoading = false;
    }
  }

  addEmails(newEmails: Email[]): void {
    try {
      this.emailService.addEmails(newEmails);
      this.loadEmails();
    } catch (error) {
      this.error = 'Failed to add emails';
      console.error('Failed to add emails:', error);
    }
  }

  markEmailsAsProcessed(emailIds: string[]): void {
    try {
      this.emailService.markAsProcessed(emailIds);
      this.loadEmails();
    } catch (error) {
      this.error = 'Failed to mark emails as processed';
      console.error('Failed to mark emails as processed:', error);
    }
  }

  async processEmail(emailId: string): Promise<void> {
    try {
      this.isLoading = true;
      await this.emailService.markAsProcessed([emailId]);
      await this.loadEmails();
      this.error = null;
    } catch (error) {
      this.error = 'Failed to process email';
      console.error('Failed to process email:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getApplicationsByStage(stageName: string): Application[] {
    return this.filteredApplications.filter(app => app.stage === stageName);
  }

  getCurrentApplicationIndex(applicationId: string): number {
    const app = this.filteredApplications.find(a => a.id === applicationId);
    if (!app) return -1;

    const stageApps = this.getApplicationsByStage(app.stage);
    return stageApps.findIndex(a => a.id === applicationId);
  }

  getTotalApplicationsInStage(applicationId: string): number {
    const app = this.filteredApplications.find(a => a.id === applicationId);
    if (!app) return 0;
    return this.getApplicationsByStage(app.stage).length;
  }

  getNextApplicationId(currentApplicationId: string, direction: 'prev' | 'next'): string | null {
    const currentApp = this.filteredApplications.find(a => a.id === currentApplicationId);
    if (!currentApp) return null;

    const stageApps = this.getApplicationsByStage(currentApp.stage);
    if (stageApps.length === 0) return null;

    const currentIndex = stageApps.findIndex(app => app.id === currentApplicationId);
    if (currentIndex === -1) return null;

    const newIndex = direction === 'next'
      ? (currentIndex + 1) % stageApps.length
      : (currentIndex - 1 + stageApps.length) % stageApps.length;

    return stageApps[newIndex].id;
  }

  // Drag and Drop
  beginDrag(application: Application) {
    this.draggedApplication = application;
  }

  endDrag() {
    this.draggedApplication = null;
  }

  dragOverStage(stageId: string) {
    this.dragOverStageId = stageId;
  }

  leaveStage() {
    this.dragOverStageId = null;
  }

  async dropOnStage(stageName: string): Promise<void> {
    if (this.draggedApplication && this.draggedApplication.stage !== stageName) {
      await this.handleStageChange(this.draggedApplication, stageName);
    }
    this.endDrag();
  }

  isStageVisible(stageId: string, workflowStages: {id:string;visible?:boolean;name:string}[], fallbackVisible: boolean): boolean {
    const stage = workflowStages.find(s => s.id === stageId);
    return stage?.visible ?? fallbackVisible;
  }

  // Stage Selector UI state
  openStageSelectorForApplication(applicationId: string) {
    this.stageSelectorForApplicationId = applicationId;
  }

  closeStageSelector() {
    this.stageSelectorForApplicationId = null;
  }

  isStageSelectorOpen(applicationId: string): boolean {
    return this.stageSelectorForApplicationId === applicationId;
  }

  // Business logic for formatting data for the view
  getApplicationViewData(application: Application): ApplicationViewData {
    const { company, position, tags, type, lastUpdated } = application;
    const allTags = tags && tags.length > 0 ? tags : [type];

    const displayTags = allTags.slice(0,3);
    const extraTagCount = allTags.length > 3 ? allTags.length - 3 : 0;

    const typeColorsForTags: Record<string,string> = {};
    allTags.forEach(t => {
      typeColorsForTags[t] = this.getTypeColor(t);
    });

    const relativeTimeSinceUpdate = this.formatRelativeTime(lastUpdated);
    const isDragged = this.draggedApplication?.id === application.id;

    return {
      company,
      position,
      displayTags,
      extraTagCount,
      typeColorsForTags,
      relativeTimeSinceUpdate,
      isDragged
    };
  }

  getTypeColor(type: string): string {
    return this.typeColorMap[type] || 'bg-gray-500/10 text-gray-400';
  }

  public formatRelativeTime(timestamp: string): string {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }

  async deleteAllData(): Promise<void> {
    try {
      this.isLoading = true;
      // Call each service's reset method
      await this.rootStore.applicationService.resetAllApplications();
      await this.workflowService.resetAllWorkflows();
      await this.emailService.resetAllEmails();

      window.location.reload();

      this.error = null;
    } catch (error) {
      this.error = 'Failed to delete all data';
      console.error('Failed to delete all data:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
