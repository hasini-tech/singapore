'use client';

import WidgetCard from '@/components/cards/widget-card';
import { Text, Badge } from 'rizzui';
import cn from '@/utils/class-names';
import {
  PiClock,
  PiCheckCircle,
  PiXCircle,
  PiWarningCircle,
} from 'react-icons/pi';

const usageStats = [
  {
    title: 'Total API Calls Today',
    value: '156.2K',
    change: '+12.5%',
    trend: 'up',
    description: 'Compared to yesterday',
  },
  {
    title: 'Average Response Time',
    value: '142ms',
    change: '-8.2%',
    trend: 'down',
    description: 'Performance improvement',
  },
  {
    title: 'Success Rate',
    value: '98.7%',
    change: '+0.3%',
    trend: 'up',
    description: 'Higher than target (98%)',
  },
  {
    title: 'Error Rate',
    value: '1.3%',
    change: '-0.5%',
    trend: 'down',
    description: 'Below threshold (2%)',
  },
];

const systemHealth = [
  {
    label: 'API Gateway',
    status: 'healthy',
    uptime: '99.99%',
    icon: PiCheckCircle,
    color: 'text-green-600',
  },
  {
    label: 'Rate Limiter',
    status: 'healthy',
    uptime: '99.95%',
    icon: PiCheckCircle,
    color: 'text-green-600',
  },
  {
    label: 'Authentication',
    status: 'warning',
    uptime: '99.85%',
    icon: PiWarningCircle,
    color: 'text-yellow-600',
  },
  {
    label: 'Monitoring',
    status: 'healthy',
    uptime: '100.0%',
    icon: PiCheckCircle,
    color: 'text-green-600',
  },
];

const quotaUsage = [
  {
    plan: 'Free Tier',
    used: 47500,
    limit: 50000,
    percentage: 95,
  },
  {
    plan: 'Pro Tier',
    used: 125000,
    limit: 500000,
    percentage: 25,
  },
];

interface UsageOverviewProps {
  className?: string;
}

export default function UsageOverview({ className }: UsageOverviewProps) {
  return (
    <WidgetCard
      title={'Usage Overview'}
      rounded="lg"
      className={cn('h-fit', className)}
      titleClassName="font-semibold text-gray-900"
      headerClassName="pb-4"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div>
          <Text className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Today&apos;s Statistics
          </Text>
          <div className="space-y-3">
            {usageStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex-1">
                  <Text className="text-sm text-gray-600">{stat.title}</Text>
                  <Text className="font-semibold text-gray-900">
                    {stat.value}
                  </Text>
                </div>
                <div className="text-right">
                  <Badge
                    variant="flat"
                    color={stat.trend === 'up' ? 'success' : 'info'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <Text className="mt-1 text-xs text-gray-500">
                    {stat.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div>
          <Text className="mb-3 text-sm font-medium text-gray-700">
            System Health
          </Text>
          <div className="space-y-2">
            {systemHealth.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-2"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-4 w-4 ${service.color}`} />
                    <Text className="text-sm font-medium text-gray-700">
                      {service.label}
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Text className="text-xs text-gray-600">
                      {service.uptime}
                    </Text>
                    <Badge
                      variant="flat"
                      color={
                        service.status === 'healthy' ? 'success' : 'warning'
                      }
                      className="text-xs capitalize"
                    >
                      {service.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quota Usage */}
        <div>
          <Text className="mb-3 text-sm font-medium text-gray-700">
            Quota Usage
          </Text>
          <div className="space-y-3">
            {quotaUsage.map((quota, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700">
                    {quota.plan}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    {quota.used.toLocaleString()} /{' '}
                    {quota.limit.toLocaleString()}
                  </Text>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      quota.percentage > 90
                        ? 'bg-red-500'
                        : quota.percentage > 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${quota.percentage}%` }}
                  ></div>
                </div>
                <Text className="mt-1 text-xs text-gray-500">
                  {quota.percentage}% used
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 gap-2">
            <button className="w-full rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100">
              View Detailed Analytics
            </button>
            <button className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
              Export Usage Report
            </button>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
