// src/core/services/AnalyticsService.ts
import { injectable, inject } from 'inversify';
import { IAnalyticsService, StageMetric, TimeMetric, ResponseRate, TypeDistribution } from '../interfaces/services/IAnalyticsService';
import { SERVICE_IDENTIFIERS } from '../constants/identifiers';
import type { IApplicationRepository } from '@/domain/repositories/ApplicationRepository';

@injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationRepository)
    private applicationRepository: IApplicationRepository
  ) {}

  getStageMetrics(): StageMetric[] {
    const applications = this.applicationRepository.getApplications();
    const metrics: Record<string, number> = {};

    applications.forEach(app => {
      metrics[app.stage] = (metrics[app.stage] || 0) + 1;
    });

    return Object.entries(metrics).map(([name, value]) => ({ name, value }));
  }

  getTimeMetrics(): TimeMetric[] {
    const applications = this.applicationRepository.getApplications();
    const monthlyData: Record<string, TimeMetric> = {};

    applications.forEach(app => {
      const month = new Date(app.dateApplied).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, applications: 0, interviews: 0, offers: 0 };
      }

      monthlyData[month].applications++;
      if (app.stage === 'Interview Process') monthlyData[month].interviews++;
      if (app.stage === 'Offer') monthlyData[month].offers++;
    });

    return Object.values(monthlyData);
  }

  getResponseRates(): ResponseRate[] {
    const applications = this.applicationRepository.getApplications();
    const total = applications.length;

    const responded = applications.filter(app => app.stage !== 'Resume Submitted').length;
    const interviewed = applications.filter(app => app.stage === 'Interview Process').length;
    const offered = applications.filter(app => app.stage === 'Offer').length;

    return [
      { name: 'Response Rate', value: (responded / total) * 100 },
      { name: 'Interview Rate', value: (interviewed / total) * 100 },
      { name: 'Offer Rate', value: (offered / total) * 100 }
    ];
  }

  getTypeDistribution(): TypeDistribution[] {
    const applications = this.applicationRepository.getApplications();
    const distribution: Record<string, number> = {};

    applications.forEach(app => {
      distribution[app.type] = (distribution[app.type] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }

  getTimeToOffer(): number {
    const applications = this.applicationRepository.getApplications();
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
