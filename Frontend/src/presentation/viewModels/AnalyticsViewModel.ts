// src/presentation/viewModels/AnalyticsViewModel.ts
import { injectable, inject } from 'inversify';
import { makeAutoObservable, action, computed } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { IAnalyticsService, StageMetric, TimeMetric, ResponseRate, TypeDistribution } from '@/core/interfaces/services/IAnalyticsService';

@injectable()
export class AnalyticsViewModel {
  selectedTimeRange: string = '3m';

  constructor(
    @inject(SERVICE_IDENTIFIERS.AnalyticsService)
    private analyticsService: IAnalyticsService
  ) {
    makeAutoObservable(this);
  }

  @action
  setSelectedTimeRange(range: string) {
    this.selectedTimeRange = range;
    // Implement logic to handle different time ranges if needed
  }

  @computed
  get stageMetrics(): StageMetric[] {
    return this.analyticsService.getStageMetrics();
  }

  @computed
  get timeMetrics(): TimeMetric[] {
    return this.analyticsService.getTimeMetrics();
  }

  @computed
  get responseRates(): ResponseRate[] {
    return this.analyticsService.getResponseRates();
  }

  @computed
  get typeDistribution(): TypeDistribution[] {
    return this.analyticsService.getTypeDistribution();
  }

  @computed
  get timeToOffer(): number {
    return this.analyticsService.getTimeToOffer();
  }
}
