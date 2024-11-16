// src/core/services/AnalyticsService.ts

import { injectable, inject } from 'inversify';
import {
  IAnalyticsService,
  StageMetric,
  TimeMetric,
  ResponseRate,
  TypeDistribution,
  DateRange
} from '../interfaces/services/IAnalyticsService';
import { SERVICE_IDENTIFIERS } from '../constants/identifiers';
import type { IApplicationRepository, Application } from '@/domain/repositories/ApplicationRepository';

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
}
