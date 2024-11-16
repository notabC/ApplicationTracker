// src/presentation/views/Analytics/StageAnalysisDashboard.tsx

import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { AnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-gray-800 rounded-xl p-4 ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-2">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-semibold text-white">{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

const StageFunnelMetrics: React.FC<{ viewModel: AnalyticsViewModel }> = observer(({ viewModel }) => {
  return (
    <Card className="w-full h-96">
      <CardHeader>
        <CardTitle>Application Funnel Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewModel.stageFunnelMetrics} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" />
            <Tooltip
              content={({ payload, label }) =>
                payload?.length ? (
                  <div className="bg-slate-800 p-2 rounded">
                    <p>{`${label}: ${payload[0].value} applications`}</p>
                    <p>{`Conversion: ${payload[0].payload.rate}`}</p>
                  </div>
                ) : null
              }
            />
            <Bar dataKey="count" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

const StageTransitionTime: React.FC<{ viewModel: AnalyticsViewModel }> = observer(({ viewModel }) => {
  return (
    <Card className="w-full h-96">
      <CardHeader>
        <CardTitle>Stage Transition Times</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewModel.stageTransitionTime}>
            <XAxis dataKey="stage" />
            <YAxis label={{ value: 'Average Days', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="avgDays"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

const StageOutcomes: React.FC<{ viewModel: AnalyticsViewModel }> = observer(({ viewModel }) => {
  return (
    <Card className="w-full h-96">
      <CardHeader>
        <CardTitle>Stage Outcomes Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={viewModel.stageOutcomes}>
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="passed" stackId="a" fill="#10B981" name="Passed" />
            <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
            <Bar dataKey="withdrawn" stackId="a" fill="#F59E0B" name="Withdrawn" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

const StageAnalysisDashboard: React.FC = observer(() => {
  const viewModel = container.get<AnalyticsViewModel>(SERVICE_IDENTIFIERS.AnalyticsViewModel)

  return (
    <div className="grid grid-cols-1 gap-6">
      <StageFunnelMetrics viewModel={viewModel} />
      <StageTransitionTime viewModel={viewModel} />
      <StageOutcomes viewModel={viewModel} />
    </div>
  );
});

export default StageAnalysisDashboard;
