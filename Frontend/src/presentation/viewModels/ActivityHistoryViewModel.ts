// src/presentation/viewModels/ActivityHistoryViewModel.ts
import { makeAutoObservable, runInAction, reaction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { ActivityLog } from '@/core/domain/models/ActivityLog';
import { RootStore } from './RootStore';

@injectable()
export class ActivityHistoryViewModel {
  // Observables
  private _logs: ActivityLog[] = [];
  searchTerm: string = '';
  dateRange: { start?: string; end?: string } = {};
  expandedLogIds: Set<string> = new Set<string>();

  // Cache for date-filtered results
  private dateFilteredLogs: ActivityLog[] = [];

  // Loading and Error States
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
    this.initialize();

    // Observe changes in the RootStore's applications and update logs accordingly
    this.rootStore = rootStore;
    this.setupReactions();
  }

  /**
   * Initializes the ViewModel by creating logs from applications.
   */
  private initialize(): void {
    this._logs = this.createLogsFromApplications(this.rootStore.applications);
    this.updateDateFiltered(); // Initial date filtering
  }

  /**
   * Sets up MobX reactions to observe changes in the RootStore's applications.
   */
  private setupReactions(): void {
    // Reaction when applications change
    // You can use MobX reactions or autorun here, but makeAutoObservable with observables will handle it
    // So whenever `rootStore.applications` changes, createLogsFromApplications and update dateFilteredLogs
    // To achieve this, we can make `_logs` a computed value, but since it's a flat map, it's better to use reactions

    // Alternatively, watch the RootStore's applications and update logs accordingly
    // Here, we'll use a MobX `reaction`

    reaction(
      () => this.rootStore.applications.slice(),
      (applications) => {
        this._logs = this.createLogsFromApplications(applications);
        this.updateDateFiltered();
      }
    );
  }

  /**
   * Converts applications to a flat list of activity logs.
   * @param applications Array of Application objects.
   * @returns Array of ActivityLog objects.
   */
  private createLogsFromApplications(applications: Application[]): ActivityLog[] {
    return applications.flatMap((app: Application) => {
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
          type: app.type,
        },
      });

      // Convert application logs
      app.logs.forEach((log) => {
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
            source: log.source,
          },
        });
      });

      return logs;
    });
  }

  /**
   * Updates the dateFilteredLogs based on the current dateRange.
   */
  private updateDateFiltered(): void {
    const startDate = this.dateRange.start ? new Date(this.dateRange.start) : null;
    let endDate = this.dateRange.end ? new Date(this.dateRange.end) : null;

    // Add one day to endDate to include the entire day
    if (endDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    this.dateFilteredLogs = this._logs
      .filter((log: ActivityLog) => {
        const logDate = new Date(log.timestamp);
        return (
          (!startDate || logDate >= startDate) && 
          (!endDate || logDate < endDate)
        );
      })
      .sort((a: ActivityLog, b: ActivityLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Computed property that filters logs based on the searchTerm.
   */
  get filteredLogs(): ActivityLog[] {
    const searchTerm = this.searchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      return this.dateFilteredLogs;
    }

    const searchWords = searchTerm.split(/\s+/);

    return this.dateFilteredLogs.filter((log: ActivityLog) => {
      const content = [
        log.title,
        log.description,
        log.metadata.company,
        log.metadata.position,
        log.metadata.fromStage,
        log.metadata.toStage,
        log.metadata.emailSubject,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchWords.every((word: string) => content.includes(word));
    });
  }

  /**
   * Sets the search term for filtering logs.
   * @param term The search term input by the user.
   */
  setSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  /**
   * Sets the date range for filtering logs and updates the filtered cache.
   * @param start Optional start date in ISO string format.
   * @param end Optional end date in ISO string format.
   */
  setDateRange(start?: string, end?: string): void {
    this.dateRange = { start, end };
    this.updateDateFiltered(); // Update the date-filtered cache
  }

  /**
   * Toggles the expansion state of a specific log.
   * @param logId The ID of the log to toggle.
   */
  toggleLogExpansion(logId: string): void {
    if (this.expandedLogIds.has(logId)) {
      this.expandedLogIds.delete(logId);
    } else {
      this.expandedLogIds.add(logId);
    }
  }

  /**
   * Checks if a specific log is expanded.
   * @param logId The ID of the log to check.
   * @returns True if the log is expanded, false otherwise.
   */
  isLogExpanded(logId: string): boolean {
    return this.expandedLogIds.has(logId);
  }

  /**
   * Formats a timestamp into a human-readable date string.
   * @param timestamp The ISO string timestamp to format.
   * @returns A formatted date string.
   */
  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Retrieves detailed information about an application.
   * @param applicationId The ID of the application to retrieve.
   * @returns The Application object if found, undefined otherwise.
   */
  async getApplicationDetails(applicationId: string): Promise<Application | undefined> {
    this.isLoading = true;
    try {
      const application = this.rootStore.getApplicationById(applicationId);
      runInAction(() => {
        this.error = null;
      });
      return application;
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to retrieve application details.';
        console.error('Error retrieving application details:', error);
      });
      return undefined;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
