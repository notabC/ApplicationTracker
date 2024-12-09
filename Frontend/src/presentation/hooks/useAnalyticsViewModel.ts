// src/presentation/hooks/useAnalyticsViewModel.ts
import { useMemo } from 'react';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import { AnalyticsViewModel } from '../viewModels/AnalyticsViewModel';

export const useAnalyticsViewModel = (): AnalyticsViewModel => {
  return useMemo(() => container.get<AnalyticsViewModel>(SERVICE_IDENTIFIERS.AnalyticsViewModel), []);
};
