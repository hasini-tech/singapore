'use client';

import { useMemo } from 'react';
import MetricCard from '@/components/cards/metric-card';
import { Text } from 'rizzui';
import cn from '@/utils/class-names';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { type ApiKeyData } from '@/services/api-key.service';

function ApiKeyStats({
  className,
  apiKeys,
  loading,
}: {
  className?: string;
  apiKeys: ApiKeyData[];
  loading: boolean;
}) {
  const stats = useMemo(() => {
    const totalKeys = apiKeys.length;
    const activeKeys = apiKeys.filter((k) => k.is_active).length;
    const inactiveKeys = totalKeys - activeKeys;
    return { totalKeys, activeKeys, inactiveKeys };
  }, [apiKeys]);

  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const created = apiKeys.filter((k) => {
        const d = new Date(k.created_at);
        return d >= dayStart && d <= dayEnd;
      }).length;

      const activeUsed = apiKeys.filter((k) => {
        if (!k.last_used || !k.is_active) return false;
        const d = new Date(k.last_used);
        return d >= dayStart && d <= dayEnd;
      }).length;

      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        keys: Math.max(created, 1),
        activeUsage: Math.max(activeUsed, 1),
        usage: Math.max(created + activeUsed, 1),
        activity: Math.max(created + activeUsed, 2),
      };
    });
  }, [apiKeys]);

  const usageRate = Math.round(
    (stats.activeKeys / Math.max(stats.totalKeys, 1)) * 100
  );

  const apiKeyStatData = [
    {
      id: '1',
      title: 'Total API Keys',
      metric: loading ? '...' : stats.totalKeys.toString(),
      info: 'Total number of API keys created',
      fill: '#015DE1',
      dataKey: 'keys',
    },
    {
      id: '2',
      title: 'Active Keys',
      metric: loading ? '...' : stats.activeKeys.toString(),
      info: 'Number of currently active API keys',
      fill: '#048848',
      dataKey: 'activeUsage',
    },
    {
      id: '3',
      title: 'Inactive Keys',
      metric: loading ? '...' : stats.inactiveKeys.toString(),
      info: 'Number of inactive API keys',
      fill: '#B92E5D',
      dataKey: 'usage',
    },
    {
      id: '4',
      title: 'Usage Rate',
      metric: loading ? '...' : `${usageRate}%`,
      info: 'Percentage of active keys',
      fill: '#7928CA',
      dataKey: 'activity',
    },
  ];

  return (
    <div
      className={cn('grid grid-cols-1 gap-5 3xl:gap-8 4xl:gap-9', className)}
    >
      {apiKeyStatData.map((stat) => (
        <MetricCard
          key={stat.title + stat.id}
          title={stat.title}
          metric={stat.metric}
          rounded="lg"
          metricClassName="text-2xl mt-1"
          info={
            <Text className="mt-4 max-w-[150px] text-sm text-gray-500">
              {stat.info}
            </Text>
          }
          chart={
            <>
              <div className="h-12 w-20 @[16.25rem]:h-16 @[16.25rem]:w-24 @xs:h-20 @xs:w-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart barSize={6} barGap={5} data={chartData}>
                    <Bar
                      dataKey={stat.dataKey}
                      fill={stat.fill}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          }
          chartClassName="flex flex-col w-auto h-auto text-center"
          className="@container @7xl:text-[15px] [&>div]:items-end"
        />
      ))}
    </div>
  );
}

export default ApiKeyStats;
