// src/models/ActivityHistoryModel.ts
import { makeAutoObservable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application } from '@/domain/interfaces/IApplication';
import type { RootStore } from '@/presentation/viewModels/RootStore';
import { ActivityLog } from '../interfaces/IActivityHistory';

@injectable()
export class ActivityHistoryModel {
  private _logs: ActivityLog[] = [];

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
  }

  get logs(): ActivityLog[] {
    return this._logs;
  }

  initialize(applications: Application[]): void {
    this._logs = this.createLogsFromApplications(applications);
  }

  private createLogsFromApplications(applications: Application[]): ActivityLog[] {
    return applications.flatMap((app: Application) => [
      this.createApplicationCreatedLog(app),
      ...this.createApplicationHistoryLogs(app)
    ]);
  }

  private createApplicationCreatedLog(app: Application): ActivityLog {
    return {
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
    };
  }

  private createApplicationHistoryLogs(app: Application): ActivityLog[] {
    return app.logs.map((log) => ({
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
    }));
  }

  filterLogsByDateRange(startDate: Date | null, endDate: Date | null): ActivityLog[] {
    let filteredEndDate = endDate;
    if (endDate) {
      filteredEndDate = new Date(endDate);
      filteredEndDate.setDate(filteredEndDate.getDate() + 1);
    }

    return this._logs.filter((log: ActivityLog) => {
      const logDate = new Date(log.timestamp);
      return (
        (!startDate || logDate >= startDate) && 
        (!filteredEndDate || logDate < filteredEndDate)
      );
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  filterLogsBySearchTerm(logs: ActivityLog[], searchTerm: string): ActivityLog[] {
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    if (!normalizedTerm) {
      return logs;
    }

    const searchWords = normalizedTerm.split(/\s+/);

    return logs.filter((log: ActivityLog) => {
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

  updateLogs(applications: Application[]): void {
    this._logs = this.createLogsFromApplications(applications);
  }

  getApplicationDetails(applicationId: string): Application | undefined {
    return this.rootStore.getApplicationById(applicationId);
  }
}