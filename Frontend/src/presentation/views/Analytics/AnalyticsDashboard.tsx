// src/presentation/views/Analytics/AnalyticsDashboard.tsx

import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { ChevronDown, TrendingUp, Timer, Target } from 'lucide-react';
import { AnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';

interface AnalyticsDashboardProps {
  viewModel: AnalyticsViewModel;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = observer(({ viewModel }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as any;
    viewModel.setSelectedDateRangeOption(value);
  };

  const handleCustomFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    viewModel.setCustomFromDate(date);
  };

  const handleCustomToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    viewModel.setCustomToDate(date);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <select
            value={viewModel.selectedDateRangeOption}
            onChange={handleDateRangeChange}
            className="px-4 py-2 bg-gray-800 rounded-lg text-gray-200"
          >
            <option value="1d">Last 1 Day</option>
            <option value="7d">Last 7 Days</option>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="all">All Time</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {viewModel.canUseCustomRange && (
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">From</label>
            <input
              type="date"
              value={viewModel.customFromDate.toISOString().split('T')[0]}
              onChange={handleCustomFromDateChange}
              className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">To</label>
            <input
              type="date"
              value={viewModel.customToDate.toISOString().split('T')[0]}
              onChange={handleCustomToDateChange}
              className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200"
            />
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Response Rate Card */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Response Rate</h3>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(viewModel.responseRates[0]?.value || 0)}%
          </div>
          <p className="text-xs text-gray-400 mt-1">
            of applications received responses
          </p>
        </div>

        {/* Interview Rate Card */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Interview Rate</h3>
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.round(viewModel.responseRates[1]?.value || 0)}%
          </div>
          <p className="text-xs text-gray-400 mt-1">
            of applications reached interviews
          </p>
        </div>

        {/* Avg. Time to Offer Card */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Avg. Time to Offer</h3>
            <Timer className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {viewModel.timeToOffer} days
          </div>
          <p className="text-xs text-gray-400 mt-1">
            from application to offer
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Timeline */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Application Timeline</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewModel.timeMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#0088FE"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="interviews"
                  stroke="#00C49F"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="offers"
                  stroke="#FFBB28"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Distribution */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Applications by Stage</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewModel.stageMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="value" fill="#0088FE">
                  {viewModel.stageMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Application Types</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={viewModel.typeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {viewModel.typeDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Rates */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Success Metrics</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewModel.responseRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="value" fill="#0088FE">
                  {viewModel.responseRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AnalyticsDashboard;
