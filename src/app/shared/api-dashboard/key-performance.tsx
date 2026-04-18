'use client';

import WidgetCard from '@/components/cards/widget-card';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Text, Badge } from 'rizzui';
import { PiTrendUp, PiTrendDown, PiMinus } from 'react-icons/pi';

const keyPerformanceData = [
  {
    keyName: 'Main Website API',
    requests: 45600,
    successRate: 98.5,
    avgResponseTime: 145,
    errorCount: 684,
    trend: 'up',
    trendValue: 12.5,
  },
  {
    keyName: 'Mobile App API',
    requests: 32400,
    successRate: 99.1,
    avgResponseTime: 123,
    errorCount: 291,
    trend: 'up',
    trendValue: 8.3,
  },
  {
    keyName: 'Third Party Integration',
    requests: 25920,
    successRate: 97.8,
    avgResponseTime: 189,
    errorCount: 570,
    trend: 'down',
    trendValue: -3.2,
  },
  {
    keyName: 'Analytics Dashboard',
    requests: 25920,
    successRate: 96.9,
    avgResponseTime: 201,
    errorCount: 803,
    trend: 'stable',
    trendValue: 0.1,
  },
];

const chartData = keyPerformanceData.map((key) => ({
  name: key.keyName.replace(' API', '').replace(' Integration', ''),
  requests: key.requests,
  successRate: key.successRate,
  responseTime: key.avgResponseTime,
}));

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <PiTrendUp className="h-4 w-4 text-green-600" />;
    case 'down':
      return <PiTrendDown className="h-4 w-4 text-red-600" />;
    default:
      return <PiMinus className="h-4 w-4 text-gray-600" />;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

interface KeyPerformanceProps {
  className?: string;
}

export default function KeyPerformance({ className }: KeyPerformanceProps) {
  return (
    <WidgetCard
      title={'API Key Performance'}
      rounded="lg"
      className={className}
      titleClassName="font-semibold text-gray-900"
      headerClassName="pb-4"
    >
      {/* Performance Chart */}
      <div className="mb-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Bar
                dataKey="requests"
                fill="#015DE1"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <ReferenceLine y={30000} stroke="#e5e7eb" strokeDasharray="5 5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-4">
        <Text className="font-medium text-gray-700">
          Key Performance Metrics
        </Text>

        {keyPerformanceData.map((key, index) => (
          <div
            key={key.keyName}
            className="space-y-3 rounded-lg border border-gray-200 p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <Text className="text-sm font-medium text-gray-900">
                {key.keyName}
              </Text>
              <div className="flex items-center gap-1">
                {getTrendIcon(key.trend)}
                <Text
                  className={`text-sm font-medium ${getTrendColor(key.trend)}`}
                >
                  {key.trendValue > 0 ? '+' : ''}
                  {key.trendValue}%
                </Text>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="mb-1 text-xs text-gray-500">
                  Total Requests
                </Text>
                <Text className="font-semibold text-gray-900">
                  {key.requests.toLocaleString()}
                </Text>
              </div>

              <div>
                <Text className="mb-1 text-xs text-gray-500">
                  Avg Response Time
                </Text>
                <Text className="font-semibold text-gray-900">
                  {key.avgResponseTime}ms
                </Text>
              </div>
            </div>

            {/* Success Rate Progress */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Text className="text-xs text-gray-500">Success Rate</Text>
                <Text className="text-xs font-medium text-gray-700">
                  {key.successRate}%
                </Text>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${
                    key.successRate >= 98
                      ? 'bg-green-500'
                      : key.successRate >= 95
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${key.successRate}%` }}
                ></div>
              </div>
            </div>

            {/* Error Count */}
            <div className="flex items-center justify-between">
              <Text className="text-xs text-gray-500">Error Count</Text>
              <Badge
                variant="flat"
                color={
                  key.errorCount < 500
                    ? 'success'
                    : key.errorCount < 1000
                      ? 'warning'
                      : 'danger'
                }
                className="text-xs"
              >
                {key.errorCount}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
