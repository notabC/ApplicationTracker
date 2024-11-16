// src/core/interfaces/services/IAnalyticsService.ts
export interface IAnalyticsService {
    getStageMetrics(): StageMetric[];
    getTimeMetrics(): TimeMetric[];
    getResponseRates(): ResponseRate[];
    getTypeDistribution(): TypeDistribution[];
    getTimeToOffer(): number;
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
  