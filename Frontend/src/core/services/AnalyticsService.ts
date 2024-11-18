// src/core/services/AnalyticsService.ts

import { injectable, inject } from 'inversify';
import {
  IAnalyticsService,
  StageMetric,
  TimeMetric,
  ResponseRate,
  TypeDistribution,
  DateRange,
  StageFunnelMetric,
  StageTransition,
  StageOutcome
} from '../interfaces/services/IAnalyticsService';
import { SERVICE_IDENTIFIERS } from '../constants/identifiers';
import type { IApplicationRepository } from '@/domain/repositories/ApplicationRepository';
import { Application } from '../domain/models/Application';
import type { IWorkflowService } from '../interfaces/services';

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationRepository)
    private applicationRepository: IApplicationRepository,
    
    @inject(SERVICE_IDENTIFIERS.WorkflowService)
    private workflowService: IWorkflowService
  ) {}

  getStageFunnelMetrics(dateRange: DateRange): StageFunnelMetric[] {
    const applications = this.applicationRepository.getApplications().filter(app => 
      this.isWithinDateRange(app.dateApplied, dateRange)
    );

    const stages = this.workflowService.getStages().map(stage => stage.name);
    const metrics: StageFunnelMetric[] = [];
    
    let total = applications.length;
    stages.forEach((stage, index) => {
      let count;
      if (index === 0) { // First stage
        count = total;
      } else {
        const previousStages = stages.slice(0, index + 1);
        count = applications.filter(app => previousStages.includes(app.stage)).length;
      }

      metrics.push({
        stage,
        count,
        rate: total > 0 ? ((count / total) * 100).toFixed(1) + '%' : '0%'
      });
    });

    return metrics;
  }

  getStageTransitionTime(dateRange: DateRange): StageTransition[] {
    const applications = this.applicationRepository.getApplications().filter(app => 
      this.isWithinDateRange(app.dateApplied, dateRange) &&
      app.logs && app.logs.length > 1
    );

    const workflowStages = this.workflowService.getStages();
    const stageOrder = workflowStages.map(stage => stage.name).filter(stageName => stageName !== 'Unassigned');

    // Define valid transitions based on workflow's stageOrder
    const validTransitions: string[] = [];
    for (let i = 0; i < stageOrder.length - 1; i++) {
      validTransitions.push(`${stageOrder[i]} → ${stageOrder[i + 1]}`);
    }

    const transitions: { [key: string]: number[] } = {};

    // Initialize transitions with empty arrays
    validTransitions.forEach(transition => {
      transitions[transition] = [];
    });

    applications.forEach(app => {
      // Sort logs by date to ensure chronological order
      const sortedLogs = [...app.logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (let i = 1; i < sortedLogs.length; i++) {
        const fromStage = sortedLogs[i - 1].toStage;
        const toStage = sortedLogs[i].toStage;
        const transitionKey = `${fromStage} → ${toStage}`;

        if (validTransitions.includes(transitionKey)) {
          const fromDate = new Date(sortedLogs[i - 1].date);
          const toDate = new Date(sortedLogs[i].date);
          const days = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
          
          transitions[transitionKey].push(days);
        }
      }
    });

    // Calculate average days for each valid transition
    return validTransitions.map(transition => ({
      stage: transition,
      avgDays: transitions[transition].length > 0 
        ? parseFloat((transitions[transition].reduce((a, b) => a + b, 0) / transitions[transition].length).toFixed(2))
        : 0
    }));
  }

  getStageOutcomes(dateRange: DateRange): StageOutcome[] {
    const applications = this.applicationRepository.getApplications().filter(app => 
      this.isWithinDateRange(app.dateApplied, dateRange)
    );

    const stages = this.workflowService.getStages().map(stage => stage.name);
    return stages.map(stage => {
      const stageApps = applications.filter(app => app.stage === stage || app.logs.some(log => log.toStage === stage));
      
      return {
        stage,
        passed: stageApps.filter(app => 
          app.stage === 'Offer' || 
          app.stage === 'Interview Process' || 
          (stage === 'Resume Submitted' && app.stage === 'Resume Submitted')
        ).length,
        failed: stageApps.filter(app => app.stage === 'Rejected').length,
      };
    });
  }

  private isWithinDateRange(date: string, range: DateRange): boolean {
    const applicationDate = new Date(date);
    return applicationDate >= range.from && applicationDate <= range.to;
  }
  
  private filterApplicationsByDateRange(applications: Application[], dateRange: DateRange): Application[] {
    return applications.filter(app => {
      const appliedDate = new Date(app.dateApplied);
      return appliedDate >= dateRange.from && appliedDate <= dateRange.to;
    });
  }

  getStageMetrics(dateRange: DateRange): StageMetric[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const metrics: Record<string, number> = {};

    applications.forEach(app => {
      metrics[app.stage] = (metrics[app.stage] || 0) + 1;
    });

    return Object.entries(metrics).map(([name, value]) => ({ name, value }));
  }

  getTimeMetrics(dateRange: DateRange): TimeMetric[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const monthlyData: Record<string, TimeMetric> = {};

    applications.forEach(app => {
      const date = new Date(app.dateApplied);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g., "Mar 2024"
      if (!monthlyData[month]) {
        monthlyData[month] = { month, applications: 0, interviews: 0, offers: 0 };
      }

      monthlyData[month].applications++;
      if (app.stage === 'Interview Process') monthlyData[month].interviews++;
      if (app.stage === 'Offer') monthlyData[month].offers++;
    });

    // Sort the data by date to ensure chronological order
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(month => monthlyData[month]);
  }

  getResponseRates(dateRange: DateRange): ResponseRate[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const total = applications.length;

    if (total === 0) {
      return [
        { name: 'Response Rate', value: 0 },
        { name: 'Interview Rate', value: 0 },
        { name: 'Offer Rate', value: 0 }
      ];
    }

    const responded = applications.filter(app => app.stage !== 'Resume Submitted').length;
    const interviewed = applications.filter(app => app.stage === 'Interview Process').length;
    const offered = applications.filter(app => app.stage === 'Offer').length;

    return [
      { name: 'Response Rate', value: parseFloat(((responded / total) * 100).toFixed(2)) },
      { name: 'Interview Rate', value: parseFloat(((interviewed / total) * 100).toFixed(2)) },
      { name: 'Offer Rate', value: parseFloat(((offered / total) * 100).toFixed(2)) }
    ];
  }

  getTypeDistribution(dateRange: DateRange): TypeDistribution[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const distribution: Record<string, number> = {};

    applications.forEach(app => {
      distribution[app.type] = (distribution[app.type] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }

  getTimeToOffer(dateRange: DateRange): number {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const offeredApps = applications.filter(app => app.stage === 'Offer');

    if (offeredApps.length === 0) return 0;

    const avgDays = offeredApps.reduce((acc, app) => {
      const applied = new Date(app.dateApplied);
      const lastUpdate = new Date(app.lastUpdated);
      return acc + (lastUpdate.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
    }, 0) / offeredApps.length;

    return Math.round(avgDays);
  }

}
