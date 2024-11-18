// src/presentation/views/Analytics/StageAnalysisDashboard.tsx

import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { AnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';

// Custom Card Components
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`bg-slate-800 rounded-xl p-4 ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xl font-semibold text-white">{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full">{children}</div>
);

// Reusable ChartContainer Component with Fixed Height and Mobile Overflow
interface ChartContainerProps {
  children: React.ReactNode;
  minWidth?: number; // Optional minimum width in pixels
}

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
}) => (
  <div className="w-full overflow-x-auto">
    <div 
      className="h-96 min-w-[500px]" // Fixed height and minimum width
    >
      {children}
    </div>
  </div>
);

// Custom Tooltip Component with TypeScript Types
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-lg">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm text-slate-300">
          {entry.name}: {entry.value.toLocaleString()}
          {entry.payload.rate && ` (${entry.payload.rate})`}
        </p>
      ))}
    </div>
  );
};

// Stage Funnel Metrics Component
const StageFunnelMetrics: React.FC<{ viewModel: AnalyticsViewModel }> = observer(
  ({ viewModel }) => {
    // Debugging: Ensure data is present
    console.log('Stage Funnel Metrics:', viewModel.stageFunnelMetrics);

    return (
      <Card className="col-span-full xl:col-span-2">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span>Application Funnel Analysis</span>
              <span className="text-sm text-slate-400 font-normal">
                (Conversion rates by stage)
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer minWidth={600}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewModel.stageFunnelMetrics} layout="vertical">
                <XAxis
                  type="number"
                  tickFormatter={(val) => `${val.toLocaleString()}`}
                  stroke="#94a3b8"
                />
                <YAxis
                  dataKey="stage"
                  type="category"
                  width={120}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);

// Stage Transition Time Component
const StageTransitionTime: React.FC<{ viewModel: AnalyticsViewModel }> = observer(
  ({ viewModel }) => {
    // Debugging: Ensure data is present
    console.log('Stage Transition Time:', viewModel.stageTransitionTime);

    return (
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span>Stage Transition Times</span>
              <span className="text-sm text-slate-400 font-normal">
                (Average days per stage)
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer minWidth={500}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewModel.stageTransitionTime}>
                <XAxis
                  dataKey="stage"
                  tick={{ fill: '#94a3b8' }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fill: '#94a3b8' }}
                  stroke="#94a3b8"
                  label={{
                    value: 'Average Days',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: '#94a3b8' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="avgDays"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);

// Stage Outcomes Component
const StageOutcomes: React.FC<{ viewModel: AnalyticsViewModel }> = observer(
  ({ viewModel }) => {
    // Debugging: Ensure data is present
    console.log('Stage Outcomes:', viewModel.stageOutcomes);

    return (
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span>Stage Outcomes Analysis</span>
              <span className="text-sm text-slate-400 font-normal">
                (Results by stage)
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer minWidth={500}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewModel.stageOutcomes}>
                <XAxis
                  dataKey="stage"
                  tick={{ fill: '#94a3b8' }}
                  stroke="#94a3b8"
                />
                <YAxis
                  tick={{ fill: '#94a3b8' }}
                  stroke="#94a3b8"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="passed"
                  stackId="a"
                  fill="#10b981"
                  name="Passed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="failed"
                  stackId="a"
                  fill="#ef4444"
                  name="Failed"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);

// Main Dashboard Component
const StageAnalysisDashboard: React.FC = observer(() => {
  const viewModel = container.get<AnalyticsViewModel>(
    SERVICE_IDENTIFIERS.AnalyticsViewModel
  );

  // Debugging: Log the viewModel to ensure data is loaded
  console.log('ViewModel:', viewModel);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
      <StageFunnelMetrics viewModel={viewModel} />
      <StageTransitionTime viewModel={viewModel} />
      <StageOutcomes viewModel={viewModel} />
    </div>
  );
});

export default StageAnalysisDashboard;
