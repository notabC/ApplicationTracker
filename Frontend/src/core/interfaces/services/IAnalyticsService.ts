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
  