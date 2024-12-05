// src/presentation/views/Analytics/AnalyticsDashboard.tsx

import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  Clock,
  Target,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { AnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';
import StageAnalysisDashboard from './StageAnalysisDashboard';

interface ChartContainerProps {
  children: React.ReactNode;
  minWidth?: number; // Optional minimum width in pixels
}

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
}) => (
  <div className="w-full overflow-x-auto">
    <div 
      className="h-52 md:h-full min-w-[500px]" // Fixed height and minimum width
    >
      {children}
    </div>
  </div>
);

// --------------------- Enhanced Card Components ---------------------

// Base Card with Glassmorphism Effect
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`
      relative overflow-hidden
      bg-gradient-to-br from-slate-800/95 to-slate-800/75
      backdrop-blur-xl
      border border-slate-700/30
      rounded-2xl
      shadow-xl shadow-slate-900/20
      ${className}
    `}
  >
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
    {/* Content */}
    <div className="relative p-6">{children}</div>
  </div>
);

// MetricCard Component for Displaying Key Metrics
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = ({ title, value, subtitle, icon: Icon }) => (
  <Card className="transform transition-all duration-200 hover:translate-y-[-2px]">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
    </div>
    <div className="space-y-2">
      <div className="text-3xl font-semibold text-white tracking-tight">
        {value}
      </div>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  </Card>
);

// ChartCard Component for Premium Chart Displays
const ChartCard: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}> = ({ children, title, subtitle }) => (
  <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-800/50 rounded-2xl overflow-hidden backdrop-blur-lg border border-slate-700/20">
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

    <div className="relative p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

// --------------------- Chart Components ---------------------

// Utility function to generate colors and gradients
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#F87171', '#A78BFA'];
const getColor = (index: number) => colors[index % colors.length];

// TimelineChart Component with Dynamic Data Series
const TimelineChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Extract unique data keys excluding 'month'
  const dataKeys = Object.keys(data[0] || {}).filter((key) => key !== 'month');

  // Generate gradients dynamically
  const gradients = dataKeys.map((key, index) => (
    <linearGradient
      key={`gradient-${key}`}
      id={`gradient-${key}`}
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop offset="0%" stopColor={getColor(index)} stopOpacity={0.3} />
      <stop offset="100%" stopColor={getColor(index)} stopOpacity={0} />
    </linearGradient>
  ));

  return (
    <ChartContainer minWidth={600}>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {/* Dynamic Gradient Definitions */}
          <defs>{gradients}</defs>

          {/* Refined grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.1)"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />

          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(value) => `${value}`}
          />

          {/* Enhanced tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)',
            }}
            itemStyle={{ color: '#E2E8F0' }}
            labelStyle={{ color: '#94A3B8' }}
          />

          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{
              paddingBottom: '20px',
            }}
          />

          {/* Dynamic Areas and Lines */}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={key.charAt(0).toUpperCase() + key.slice(1)}
              stroke={getColor(index)}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${key})`}
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: getColor(index),
                fill: '#1E293B',
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// StagesChart Component with Dynamic Data
const StagesChart: React.FC<{ data: any[] }> = ({ data }) => {

  return (
    <ChartContainer minWidth={400}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          {/* Dynamic Gradient Definitions */}
          <defs>
            {data.map((_entry, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`barGradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={getColor(index)} stopOpacity={0.8} />
                <stop offset="100%" stopColor={getColor(index)} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(148, 163, 184, 0.1)"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />

          <YAxis
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)',
            }}
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
          />

          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// ApplicationTypesChart Component with Dynamic Data
const ApplicationTypesChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Premium color palette with proper opacity gradients
  const COLORS = [
    'rgba(96, 165, 250, 0.9)',   // blue
    'rgba(52, 211, 153, 0.9)',   // green
    'rgba(251, 191, 36, 0.9)',   // yellow
    'rgba(248, 113, 113, 0.9)',  // red
    'rgba(167, 139, 250, 0.9)',  // purple
    'rgba(45, 212, 191, 0.9)',   // teal
    'rgba(251, 146, 60, 0.9)',   // orange
    'rgba(147, 197, 253, 0.9)'   // light blue
  ];

  return (
    <ChartContainer minWidth={400}>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient
                key={`pieGradient-${index}`}
                id={`pieGradient-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={color.replace('0.9', '1')}
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor={color.replace('0.9', '0.7')}
                  stopOpacity={0.7}
                />
              </linearGradient>
            ))}
          </defs>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}  // Added inner radius for donut effect
            outerRadius={150}
            paddingAngle={2}  // Added padding between segments
            cornerRadius={4}  // Rounded corners on segments
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#pieGradient-${index})`}
                stroke="rgba(30, 41, 59, 0.5)"  // Dark border for depth
                strokeWidth={1}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(51, 65, 85, 0.2)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)',
              padding: '8px 12px',
            }}
            itemStyle={{ color: '#E2E8F0' }}
            labelStyle={{ color: '#94A3B8' }}
          />

          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              paddingTop: '20px',
            }}
            formatter={(value) => (
              <span style={{ color: '#94A3B8' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};


// SuccessMetricsChart Component with Dynamic Data
const SuccessMetricsChart: React.FC<{ data: any[] }> = ({ data }) => (
  <ChartContainer minWidth={400}>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {/* Dynamic Gradient Definitions */}
        <defs>
          {data.map((_entry, index) => (
            <linearGradient
              key={`gradient-success-${index}`}
              id={`successBarGradient-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={getColor(index)} stopOpacity={0.8} />
              <stop offset="100%" stopColor={getColor(index)} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(148, 163, 184, 0.1)"
          vertical={false}
        />

        <XAxis
          dataKey="name"
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />

        <YAxis
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#334155' }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
          }}
          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
        />

        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#successBarGradient-${index})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// Dashboard Component Integrating All Enhanced Charts
const Dashboard: React.FC<{ viewModel: AnalyticsViewModel }> = ({
  viewModel,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Application Timeline */}
      <ChartCard
        title="Application Timeline"
        subtitle="Track your application progress over time"
      >
        <TimelineChart data={viewModel.timeMetrics} />
      </ChartCard>

      {/* Applications by Stage */}
      <ChartCard
        title="Applications by Stage"
        subtitle="Current distribution of your applications"
      >
        <StagesChart data={viewModel.stageMetrics} />
      </ChartCard>

      {/* Application Types */}
      <ChartCard
        title="Application Types"
        subtitle="Distribution of different application types"
      >
        <ApplicationTypesChart data={viewModel.typeDistribution} />
      </ChartCard>

      {/* Success Metrics */}
      <ChartCard
        title="Success Metrics"
        subtitle="Overall success rates of your applications"
      >
        <SuccessMetricsChart data={viewModel.responseRates} />
      </ChartCard>
    </div>
  );
};

// --------------------- Main AnalyticsDashboard Component ---------------------

interface AnalyticsDashboardProps {
  viewModel: AnalyticsViewModel;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = observer(
  ({ viewModel }) => {
    // Handlers for date range selection and custom dates
    const handleDateRangeChange = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const value = e.target.value as any;
      viewModel.setSelectedDateRangeOption(value);
    };

    const handleCustomFromDateChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const date = new Date(e.target.value);
      viewModel.setCustomFromDate(date);
    };

    const handleCustomToDateChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const date = new Date(e.target.value);
      viewModel.setCustomToDate(date);
    };

    return (
      <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen space-y-8">
        {/* Header with improved styling */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            <a href='/dashboard'>Job Application Tracker</a>
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={viewModel.selectedDateRangeOption}
                onChange={handleDateRangeChange}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/30 rounded-xl text-slate-300 cursor-pointer hover:bg-slate-800/70 transition-colors appearance-none"
              >
                <option value="1d">Last 1 Day</option>
                <option value="7d">Last 7 Days</option>
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="all">All Time</option>
                <option value="custom">Custom</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Date Range */}
        {viewModel.canUseCustomRange && (
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                From
              </label>
              <input
                type="date"
                value={viewModel.customFromDate.toISOString().split('T')[0]}
                onChange={handleCustomFromDateChange}
                className="px-4 py-2 bg-slate-700 rounded-xl text-slate-200 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                To
              </label>
              <input
                type="date"
                value={viewModel.customToDate.toISOString().split('T')[0]}
                onChange={handleCustomToDateChange}
                className="px-4 py-2 bg-slate-700 rounded-xl text-slate-200 w-full"
              />
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Response Rate"
            value={`${Math.round(viewModel.responseRates.find(rate => rate.name === 'Response Rate')?.value || 0)}%`}
            subtitle="of applications received responses"
            icon={TrendingUp}
          />
          <MetricCard
            title="Interview Rate"
            value={`${Math.round(viewModel.responseRates.find(rate => rate.name === 'Interview Rate')?.value || 0)}%`}
            subtitle="of applications reached interviews"
            icon={Target}
          />
          <MetricCard
            title="Avg. Time to Offer"
            value={`${viewModel.timeToOffer} days`}
            subtitle="from application to offer"
            icon={Clock}
          />
        </div>

        {/* Enhanced Charts Grid */}
        <Dashboard viewModel={viewModel} />

        {/* Additional Visualizations */}
        <StageAnalysisDashboard viewModel={viewModel} />
      </div>
    );
  }
);

export default AnalyticsDashboard;
