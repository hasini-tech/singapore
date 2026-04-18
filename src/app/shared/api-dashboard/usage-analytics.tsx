'use client';

import WidgetCard from '@/components/cards/widget-card';
import ButtonGroupAction from '@/components/charts/button-group-action';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { CustomYAxisTick } from '@/components/charts/custom-yaxis-tick';
import { useMedia } from '@/hooks/use-media';
import cn from '@/utils/class-names';
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from 'rizzui';

const apiUsageData = [
  {
    month: 'Jan',
    totalRequests: 45000,
    successfulRequests: 43200,
    failedRequests: 1800,
  },
  {
    month: 'Feb',
    totalRequests: 52000,
    successfulRequests: 50960,
    failedRequests: 1040,
  },
  {
    month: 'Mar',
    totalRequests: 48000,
    successfulRequests: 47040,
    failedRequests: 960,
  },
  {
    month: 'Apr',
    totalRequests: 61000,
    successfulRequests: 59380,
    failedRequests: 1620,
  },
  {
    month: 'May',
    totalRequests: 58000,
    successfulRequests: 56840,
    failedRequests: 1160,
  },
  {
    month: 'Jun',
    totalRequests: 67000,
    successfulRequests: 65330,
    failedRequests: 1670,
  },
  {
    month: 'Jul',
    totalRequests: 72000,
    successfulRequests: 70560,
    failedRequests: 1440,
  },
  {
    month: 'Aug',
    totalRequests: 69000,
    successfulRequests: 67620,
    failedRequests: 1380,
  },
  {
    month: 'Sep',
    totalRequests: 75000,
    successfulRequests: 73500,
    failedRequests: 1500,
  },
  {
    month: 'Oct',
    totalRequests: 78000,
    successfulRequests: 76440,
    failedRequests: 1560,
  },
  {
    month: 'Nov',
    totalRequests: 82000,
    successfulRequests: 80360,
    failedRequests: 1640,
  },
  {
    month: 'Dec',
    totalRequests: 85000,
    successfulRequests: 83300,
    failedRequests: 1700,
  },
];

const filterOptions = ['This Week', 'This Month', 'This Year'];

interface UsageAnalyticsProps {
  className?: string;
}

export default function UsageAnalytics({ className }: UsageAnalyticsProps) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const isMediumScreen = useMedia('(max-width: 1200px)', false);

  function handleFilterBy(data: string) {
    console.log('API Usage Filter:', data);
  }

  return (
    <WidgetCard
      title={'API Usage Analytics'}
      description={
        <>
          <Badge
            renderAsDot
            className="me-0.5 bg-[#d4f4dd] dark:bg-[#048848]"
          />{' '}
          Successful
          <Badge renderAsDot className="me-0.5 ms-4 bg-[#f8d7da]" /> Failed
          <Badge renderAsDot className="me-0.5 ms-4 bg-[#015DE1]" /> Total
          Requests
        </>
      }
      descriptionClassName="text-gray-500 mt-1.5 mb-3 @lg:mb-0"
      action={
        <ButtonGroupAction
          options={filterOptions}
          onChange={(data) => handleFilterBy(data)}
          className="-ms-2 mb-3 @lg:mb-0 @lg:ms-0"
        />
      }
      headerClassName="flex-col @lg:flex-row"
      rounded="lg"
      className={className}
    >
      <div className="custom-scrollbar overflow-x-auto scroll-smooth">
        <div
          className={cn('h-[350px] w-full pt-9 @4xl:h-[400px] @7xl:h-[420px]')}
        >
          <ResponsiveContainer
            width="100%"
            {...(isTablet && { minWidth: '700px' })}
            height="100%"
          >
            <ComposedChart
              data={apiUsageData}
              barSize={isMediumScreen ? 20 : 28}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12"
            >
              <defs>
                <linearGradient id="apiUsageArea" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#E3F2FD"
                    className="[stop-opacity:0.3]"
                  />
                  <stop offset="95%" stopColor="#015DE1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalRequests"
                stroke="#015DE1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#apiUsageArea)"
              />
              <Bar
                dataKey="successfulRequests"
                fill="#048848"
                {...(isTablet
                  ? { stackId: 'apiMetrics' }
                  : { radius: [4, 4, 0, 0] })}
              />
              <Bar
                dataKey="failedRequests"
                fill="#dc3545"
                radius={[4, 4, 0, 0]}
                {...(isTablet && { stackId: 'apiMetrics' })}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
