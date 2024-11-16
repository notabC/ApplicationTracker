// src/core/interfaces/services/IAnalyticsService.ts

export interface DateRange {
  from: Date;
  to: Date;
}

export interface IAnalyticsService {
  getStageMetrics(dateRange: DateRange): StageMetric[];
  getTimeMetrics(dateRange: DateRange): TimeMetric[];
  getResponseRates(dateRange: DateRange): ResponseRate[];
  getTypeDistribution(dateRange: DateRange): TypeDistribution[];
  getTimeToOffer(dateRange: DateRange): number;

  // New Methods
  getStageFunnelMetrics(dateRange: DateRange): StageFunnelMetric[];
  getStageTransitionTime(dateRange: DateRange): StageTransition[];
  getStageOutcomes(dateRange: DateRange): StageOutcome[];
}

export interface StageMetric {
  name: string;
  value: number;
}

export interface TimeMetric {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
}

export interface ResponseRate {
  name: string;
  value: number;
}

export interface TypeDistribution {
  name: string;
  value: number;
}

// New Interfaces
export interface StageFunnelMetric {
  stage: string;
  count: number;
  rate: string;
}

export interface StageTransition {
  stage: string;
  avgDays: number;
}

export interface StageOutcome {
  stage: string;
  passed: number;
  failed: number;
  withdrawn: number;
  [key: string]: number | string;
}
