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

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationRepository)
    private applicationRepository: IApplicationRepository
  ) {}

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
      { name: 'Response Rate', value: (responded / total) * 100 },
      { name: 'Interview Rate', value: (interviewed / total) * 100 },
      { name: 'Offer Rate', value: (offered / total) * 100 }
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

  // New Method: Stage Funnel Metrics
  getStageFunnelMetrics(dateRange: DateRange): StageFunnelMetric[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const stagesOrder = [
      'Applied',
      'Resume Screened',
      'Phone Screen',
      'Technical Interview',
      'Onsite',
      'Offer'
    ];

    const funnelData: StageFunnelMetric[] = stagesOrder.map(stage => {
      const count = applications.filter(app => app.stage === stage).length;
      return { stage, count, rate: '0%' };
    });

    // Calculate conversion rates
    for (let i = 1; i < funnelData.length; i++) {
      const prevCount = funnelData[i - 1].count;
      const currentCount = funnelData[i].count;
      const rate = prevCount > 0 ? `${((currentCount / prevCount) * 100).toFixed(1)}%` : '0%';
      funnelData[i].rate = rate;
    }

    return funnelData;
  }

  // New Method: Stage Transition Time
  getStageTransitionTime(dateRange: DateRange): StageTransition[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const transitionsMap: Record<string, { totalDays: number; count: number }> = {};

    applications.forEach(app => {
      const sortedLogs = app.logs
        .map(log => ({ ...log, date: new Date(log.date) }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      for (let i = 1; i < sortedLogs.length; i++) {
        const fromStage = sortedLogs[i - 1].toStage;
        const toStage = sortedLogs[i].toStage;
        const transition = `${fromStage} → ${toStage}`;
        const days = (sortedLogs[i].date.getTime() - sortedLogs[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);

        if (!transitionsMap[transition]) {
          transitionsMap[transition] = { totalDays: 0, count: 0 };
        }
        transitionsMap[transition].totalDays += days;
        transitionsMap[transition].count += 1;
      }
    });

    const stageTransitions: StageTransition[] = Object.entries(transitionsMap).map(([stage, data]) => ({
      stage,
      avgDays: Math.round(data.totalDays / data.count)
    }));

    return stageTransitions;
  }

  // New Method: Stage Outcomes
  getStageOutcomes(dateRange: DateRange): StageOutcome[] {
    const applications = this.filterApplicationsByDateRange(this.applicationRepository.getApplications(), dateRange);
    const stages = ['Phone Screen', 'Technical Interview', 'Onsite']; // Define stages where outcomes are recorded

    const outcomesMap: Record<string, StageOutcome> = {};

    applications.forEach(app => {
      stages.forEach(stage => {
        // Find the log where the application was in this stage
        const log = app.logs.find(log => log.toStage === stage);
        if (log) {
          // Determine the outcome based on the next stage
          const currentLogIndex = app.logs.findIndex(l => l.id === log.id);
          const nextLog = app.logs[currentLogIndex + 1];
          let outcome = 'withdrawn'; // Default outcome

          if (nextLog) {
            if (nextLog.toStage === 'Offer') {
              outcome = 'passed';
            } else if (nextLog.toStage === 'Rejected') {
              outcome = 'failed';
            }
          } else {
            // If there's no next log, determine based on the current stage
            if (app.stage === 'Offer') {
              outcome = 'passed';
            } else if (app.stage === 'Rejected') {
              outcome = 'failed';
            }
          }

          if (!outcomesMap[stage]) {
            outcomesMap[stage] = { stage, passed: 0, failed: 0, withdrawn: 0 };
          }

          // Initialize the outcome count if it is not a number
          if (typeof outcomesMap[stage][outcome] !== 'number') {
            outcomesMap[stage][outcome] = 0;
          }

          outcomesMap[stage][outcome] = (outcomesMap[stage][outcome] as number) + 1;
        }
      });
    });

    return Object.values(outcomesMap);
  }
}