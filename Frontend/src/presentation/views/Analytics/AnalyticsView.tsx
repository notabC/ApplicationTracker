// src/presentation/views/Analytics/AnalyticsView.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useAnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';

export const AnalyticsView: React.FC = observer(() => {
  const viewModel = useAnalyticsViewModel();

  return (
    <AnalyticsDashboard viewModel={viewModel} />
  );
});
