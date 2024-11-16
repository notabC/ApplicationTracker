// src/presentation/viewModels/AnalyticsViewModel.ts
import { injectable, inject } from 'inversify';
import { makeAutoObservable, action, computed, runInAction } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type {
  IAnalyticsService,
  StageMetric,
  TimeMetric,
  ResponseRate,
  TypeDistribution,
  DateRange
} from '@/core/interfaces/services/IAnalyticsService';

type DateRangeOption = '1d' | '7d' | '1m' | '3m' | 'custom';

@injectable()
export class AnalyticsViewModel {
  selectedDateRangeOption: DateRangeOption = '3m';
  customFromDate: Date = new Date();
  customToDate: Date = new Date();

  stageMetrics: StageMetric[] = [];
  timeMetrics: TimeMetric[] = [];
  responseRates: ResponseRate[] = [];
  typeDistribution: TypeDistribution[] = [];
  timeToOffer: number = 0;

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

    runInAction(() => {
      this.stageMetrics = stageMetrics;
      this.timeMetrics = timeMetrics;
      this.responseRates = responseRates;
      this.typeDistribution = typeDistribution;
      this.timeToOffer = timeToOffer;
    });
  }

  @computed
  get canUseCustomRange(): boolean {
    return this.selectedDateRangeOption === 'custom';
  }
}
