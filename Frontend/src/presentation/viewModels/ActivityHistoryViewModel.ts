// src/presentation/viewModels/ActivityHistoryViewModel.ts
import { makeAutoObservable, computed, action, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { ActivityLog } from '@/core/domain/models/ActivityLog';
import type { IApplicationService } from '@/core/interfaces/services';

@injectable()
export class ActivityHistoryViewModel {
  @observable private _logs: ActivityLog[] = [];
  @observable searchTerm = '';
  @observable dateRange: { start?: string; end?: string } = {
  };
  @observable expandedLogIds: Set<string> = new Set();

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) 
    private applicationService: IApplicationService
  ) {
    makeAutoObservable(this);
    this.loadLogs();
  }

  private loadLogs(): void {
    const applications = this.applicationService.getApplications();
    this._logs = this.extractLogsFromApplications(applications);
  }

  private extractLogsFromApplications(applications: Application[]): ActivityLog[] {
    return applications.flatMap(app => {
      const logs: ActivityLog[] = [];

      // Create an initial creation log
      const creationLog: ActivityLog = {
        id: crypto.randomUUID(),
        applicationId: app.id,
        type: 'application_created',
        timestamp: app.dateApplied,
        title: 'Application Created',
        description: `Created application for ${app.position} at ${app.company}`,
        metadata: {
          company: app.company,
          position: app.position,
          type: app.type
        }
      };
      logs.push(creationLog);

      // Convert application logs
      app.logs.forEach(log => {
        const activityLog: ActivityLog = {
          id: log.id,
          applicationId: app.id,
          type: log.fromStage ? 'stage_change' : 'application_updated',
          timestamp: log.date,
          title: log.fromStage 
            ? `Stage changed: ${log.fromStage} → ${log.toStage}`
            : 'Application Updated',
          description: log.message,
          metadata: {
            company: app.company,
            position: app.position,
            fromStage: log.fromStage ?? undefined,
            toStage: log.toStage,
            emailId: log.emailId,
            emailSubject: log.emailTitle,
            source: log.source
          }
        };
        logs.push(activityLog);
      });

      return logs;
    });
  }

  @computed
  get filteredLogs(): ActivityLog[] {
    return this._logs.filter(log => {
      // Search term filter
      const searchFields = [
        log.title,
        log.description,
        log.metadata.company,
        log.metadata.position,
        log.metadata.fromStage,
        log.metadata.toStage,
        log.metadata.emailSubject
      ].filter(Boolean).map(field => field.toLowerCase());

      const matchesSearch = !this.searchTerm || 
        searchFields.some(field => field.includes(this.searchTerm.toLowerCase()));

      // Date range filter
      const logDate = new Date(log.timestamp);
      const startDate = this.dateRange.start ? new Date(this.dateRange.start) : null;
      const endDate = this.dateRange.end ? new Date(this.dateRange.end) : null;

      // Add one day to endDate to include the entire day
      if (endDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      const matchesDateRange = (!startDate || logDate >= startDate) && 
                             (!endDate || logDate < endDate);

      return matchesSearch && matchesDateRange;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  @action
  setSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  @action
  setDateRange(start?: string, end?: string): void {
    this.dateRange = { start, end };
  }

  @action
  toggleLogExpansion(logId: string): void {
    if (this.expandedLogIds.has(logId)) {
      this.expandedLogIds.delete(logId);
    } else {
      this.expandedLogIds.add(logId);
    }
  }

  isLogExpanded(logId: string): boolean {
    return this.expandedLogIds.has(logId);
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    // Format to show both date and time
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getApplicationDetails(applicationId: string): Application | undefined {
    return this.applicationService.getApplications()
      .find(app => app.id === applicationId);
  }
}
