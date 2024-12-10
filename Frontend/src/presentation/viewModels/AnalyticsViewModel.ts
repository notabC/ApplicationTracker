import { useMemo } from 'react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import { injectable, inject } from 'inversify';
import { makeAutoObservable, action, computed, runInAction } from 'mobx';
import type {
  IAnalyticsService,
  StageMetric,
  TimeMetric,
  ResponseRate,
  TypeDistribution,
  DateRange,
  StageFunnelMetric,
  StageTransition,
  StageOutcome
} from '@/domain/interfaces/IAnalyticsService';

// The type for date range options
type DateRangeOption = '1d' | '7d' | '1m' | '3m' | 'all' | 'custom';

@injectable()
export class AnalyticsViewModel {
  selectedDateRangeOption: DateRangeOption = 'all';
  customFromDate: Date = new Date('2024-01-01'); // Set a default from date
  customToDate: Date = new Date(); // Default to today

  stageMetrics: StageMetric[] = [];
  timeMetrics: TimeMetric[] = [];
  responseRates: ResponseRate[] = [];
  typeDistribution: TypeDistribution[] = [];
  timeToOffer: number = 0;

  // New Metrics
  stageFunnelMetrics: StageFunnelMetric[] = [];
  stageTransitionTime: StageTransition[] = [];
  stageOutcomes: StageOutcome[] = [];

  constructor(
    @inject(SERVICE_IDENTIFIERS.AnalyticsService)
    private analyticsService: IAnalyticsService
  ) {
    makeAutoObservable(this);
    this.loadMetrics();
  }

  @action
  setSelectedDateRangeOption(option: DateRangeOption) {
    this.selectedDateRangeOption = option;
    this.loadMetrics();
  }

  @action
  setCustomFromDate(date: Date) {
    this.customFromDate = date;
    if (this.selectedDateRangeOption === 'custom') {
      this.loadMetrics();
    }
  }

  @action
  setCustomToDate(date: Date) {
    this.customToDate = date;
    if (this.selectedDateRangeOption === 'custom') {
      this.loadMetrics();
    }
  }

  private getDateRange(): DateRange {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (this.selectedDateRangeOption) {
      case '1d':
        from = new Date(now);
        from.setDate(now.getDate() - 1);
        break;
      case '7d':
        from = new Date(now);
        from.setDate(now.getDate() - 7);
        break;
      case '1m':
        from = new Date(now);
        from.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        from = new Date(now);
        from.setMonth(now.getMonth() - 3);
        break;
      case 'all':
        from = new Date(0); // Earliest possible date
        to = new Date(9999, 11, 31); // Latest possible date
        break;
      case 'custom':
        from = new Date(this.customFromDate);
        to = new Date(this.customToDate);
        break;
      default:
        from = new Date(now);
        from.setMonth(now.getMonth() - 3);
    }

    return { from, to };
  }

  @action
  loadMetrics() {
    const dateRange = this.getDateRange();

    const stageMetrics = this.analyticsService.getStageMetrics(dateRange);
    const timeMetrics = this.analyticsService.getTimeMetrics(dateRange);
    const responseRates = this.analyticsService.getResponseRates(dateRange);
    const typeDistribution = this.analyticsService.getTypeDistribution(dateRange);
    const timeToOffer = this.analyticsService.getTimeToOffer(dateRange);

    // Fetch new metrics
    const stageFunnelMetrics = this.analyticsService.getStageFunnelMetrics(dateRange);
    const stageTransitionTime = this.analyticsService.getStageTransitionTime(dateRange);
    const stageOutcomes = this.analyticsService.getStageOutcomes(dateRange);

    runInAction(() => {
      this.stageMetrics = stageMetrics;
      this.timeMetrics = timeMetrics;
      this.responseRates = responseRates;
      this.typeDistribution = typeDistribution;
      this.timeToOffer = timeToOffer;

      this.stageFunnelMetrics = stageFunnelMetrics;
      this.stageTransitionTime = stageTransitionTime;
      this.stageOutcomes = stageOutcomes;
    });
  }

  @computed
  get canUseCustomRange(): boolean {
    return this.selectedDateRangeOption === 'custom';
  }
}

export const useAnalyticsViewModel = (): AnalyticsViewModel => {
  return useMemo(
    () => container.get<AnalyticsViewModel>(SERVICE_IDENTIFIERS.AnalyticsViewModel),
    []
  );
};
