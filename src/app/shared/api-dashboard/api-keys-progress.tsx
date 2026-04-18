'use client';

import { useMemo } from 'react';
import { Box, Text } from 'rizzui';
import cn from '@/utils/class-names';
import WidgetCard from '@/components/cards/widget-card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { type ApiKeyData } from '@/services/api-key.service';

interface ApiKeysProgressProps {
  className?: string;
  apiKeys: ApiKeyData[];
  loading: boolean;
}

export default function ApiKeysProgress({
  className,
  apiKeys,
  loading,
}: ApiKeysProgressProps) {
  const { chartData, totalKeys, activeCount, inactiveCount, activePercentage } =
    useMemo(() => {
      const active = apiKeys.filter((k) => k.is_active).length;
      const inactive = apiKeys.length - active;
      const total = apiKeys.length;
      const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
      const inactivePct = total > 0 ? Math.round((inactive / total) * 100) : 0;

      return {
        chartData: [
          {
            name: 'Active Keys',
            count: active,
            percentage: activePct,
            color: '#10B981',
          },
          {
            name: 'Inactive Keys',
            count: inactive,
            percentage: inactivePct,
            color: '#6B7280',
          },
        ],
        totalKeys: total,
        activeCount: active,
        inactiveCount: inactive,
        activePercentage: activePct,
      };
    }, [apiKeys]);

  if (loading) {
    return (
      <WidgetCard
        title="API Keys Status"
        className={cn('@container dark:bg-gray-100/50', className)}
      >
        <div className="flex h-60 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="API Keys Progress"
      className={cn('@container dark:bg-gray-100/50', className)}
    >
      <Box className="relative h-60 w-full translate-y-6 @sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart
            margin={{
              top: 40,
              right: 10,
            }}
            className="relative focus:[&_.recharts-sector]:outline-none"
          >
            <Pie
              label
              data={chartData}
              endAngle={-10}
              stroke="none"
              startAngle={190}
              paddingAngle={1}
              cornerRadius={12}
              dataKey="percentage"
              innerRadius={'85%'}
              outerRadius={'100%'}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <Box className="absolute bottom-20 start-1/2 -translate-x-1/2 text-center @sm:bottom-28">
          <Text className="text-2xl font-bold text-gray-800 @lg:text-4xl">
            {activePercentage}%
          </Text>
          <Text className="font-medium">Active</Text>
        </Box>
      </Box>

      <Box className="grid grid-cols-2 gap-8 text-center @sm:flex @sm:flex-wrap @sm:justify-center @sm:text-start">
        {chartData.map((item) => (
          <Box key={item.name}>
            <Text
              className="block text-xl font-bold @xl:text-2xl"
              style={{ color: item.color }}
            >
              {item.count}
            </Text>
            <Text className="whitespace-nowrap">{item.name}</Text>
          </Box>
        ))}
      </Box>
    </WidgetCard>
  );
}
