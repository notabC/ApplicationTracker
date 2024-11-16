import { 
  makeAutoObservable, 
  computed,
  observable
} from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { ActivityLog } from '@/core/domain/models/ActivityLog';
import type { IApplicationService } from '@/core/interfaces/services';

@injectable()
export class ActivityHistoryViewModel {
  @observable private _logs: ActivityLog[] = [];
  @observable searchTerm = '';
  @observable dateRange: { start?: string; end?: string } = {};
  @observable expandedLogIds = new Set<string>();

  // Cache for date-filtered results
  @observable private dateFilteredLogs: ActivityLog[] = [];
  
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) 
    private readonly applicationService: IApplicationService
  ) {
    makeAutoObservable(this);
    this.initialize();
  }

  private initialize(): void {
    const applications = this.applicationService.getApplications();
    this._logs = this.createLogsFromApplications(applications);
    this.updateDateFiltered(); // Initial date filtering
  }

  private createLogsFromApplications(applications: Application[]): ActivityLog[] {
    return applications.flatMap(app => {
      const logs: ActivityLog[] = [];

      // Create an initial creation log
      logs.push({
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
      });

      // Convert application logs
      app.logs.forEach(log => {
        logs.push({
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
        });
      });

      return logs;
    });
  }

  // Update date filtered logs whenever date range changes
  private updateDateFiltered(): void {
    const startDate = this.dateRange.start ? new Date(this.dateRange.start) : null;
    let endDate = this.dateRange.end ? new Date(this.dateRange.end) : null;

    // Add one day to endDate to include the entire day
    if (endDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    this.dateFilteredLogs = this._logs
      .filter(log => {
        const logDate = new Date(log.timestamp);
        return (!startDate || logDate >= startDate) && 
               (!endDate || logDate < endDate);
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Only search term filtering is computed
  @computed
  get filteredLogs(): ActivityLog[] {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      return this.dateFilteredLogs;
    }

    const searchWords = searchTerm.split(/\s+/);

    return this.dateFilteredLogs.filter(log => {
      const content = [
        log.title,
        log.description,
        log.metadata.company,
        log.metadata.position,
        log.metadata.fromStage,
        log.metadata.toStage,
        log.metadata.emailSubject
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchWords.every(word => content.includes(word));
    });
  }

  setSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  setDateRange(start?: string, end?: string): void {
    this.dateRange = { start, end };
    this.updateDateFiltered(); // Update the date-filtered cache
  }

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