import { AnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';
import { ReactNode } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';


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

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => (
  <div className={`
    relative overflow-hidden
    bg-gradient-to-br from-slate-800/95 to-slate-800/75
    backdrop-blur-xl
    border border-slate-700/20
    rounded-2xl
    shadow-xl shadow-slate-900/20
    p-6
    ${className}
  `}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
    <div className="relative">{children}</div>
  </div>
);

// Enhanced Tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="
      bg-slate-800/90 
      backdrop-blur-md 
      border border-slate-700/30 
      p-4 
      rounded-lg 
      shadow-lg
    ">
      <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-200 font-medium">
            {entry.value.toLocaleString()}
            {entry.payload.rate && ` (${entry.payload.rate})`}
          </span>
        </div>
      ))}
    </div>
  );
};

// Application Funnel Analysis
interface StageFunnelMetricsProps {
  data: { stage: string; count: number }[];
}

const StageFunnelMetrics = ({ data }: StageFunnelMetricsProps) => (
  <ChartContainer minWidth={400}>
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Application Funnel Analysis</h3>
        <p className="text-sm text-slate-400 mt-1">Conversion rates by stage</p>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <defs>
              <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            
            <XAxis
              type="number"
              tickFormatter={(val) => `${val.toLocaleString()}`}
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              dataKey="stage"
              type="category"
              width={140}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="url(#funnelGradient)"
              radius={[0, 4, 4, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </ChartContainer>
);

// Stage Transition Times
interface StageTransitionTimeProps {
  data: { stage: string; avgDays: number }[];
}

const StageTransitionTime = ({ data }: StageTransitionTimeProps) => (
  <ChartContainer minWidth={400}>
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Stage Transition Times</h3>
        <p className="text-sm text-slate-400 mt-1">Average days per stage</p>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 20 }}>
            <defs>
              <linearGradient id="transitionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <XAxis
              dataKey="stage"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              label={{
                value: 'Average Days',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#64748B', fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="avgDays"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: '#10B981',
                fill: '#1E293B'
              }}
              fill="url(#transitionGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </ChartContainer>
);

// Stage Outcomes Analysis
interface StageOutcomesProps {
  data: { stage: string; passed: number; failed: number }[];
}

const StageOutcomes = ({ data }: StageOutcomesProps) => (
  <ChartContainer minWidth={400}>
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Stage Outcomes Analysis</h3>
        <p className="text-sm text-slate-400 mt-1">Results by stage</p>
      </div>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 20 }}>
            <defs>
              <linearGradient id="passedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            
            <XAxis
              dataKey="stage"
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Bar
              dataKey="passed"
              stackId="a"
              fill="url(#passedGradient)"
              name="Passed"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="url(#failedGradient)"
              name="Failed"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </ChartContainer>
);


const StageAnalysisDashboard = ({ viewModel }: { viewModel: AnalyticsViewModel }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <StageFunnelMetrics data={viewModel.stageFunnelMetrics} />
      <StageTransitionTime data={viewModel.stageTransitionTime} />
      <StageOutcomes data={viewModel.stageOutcomes} />
    </div>
  );
};

export default StageAnalysisDashboard;