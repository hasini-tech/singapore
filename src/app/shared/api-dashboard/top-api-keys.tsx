'use client';

import { Title, Text } from 'rizzui';
import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PiKey } from 'react-icons/pi';

const topApiKeysData = [
  { name: 'Main Website API', value: 45600, percentage: 35 },
  { name: 'Mobile App API', value: 32400, percentage: 25 },
  { name: 'Third Party Integration', value: 25920, percentage: 20 },
  { name: 'Analytics Dashboard', value: 25920, percentage: 20 },
];

const COLORS = ['#015DE1', '#048848', '#F97316', '#8B5CF6'];

interface TopApiKeysProps {
  className?: string;
}

export default function TopApiKeys({ className }: TopApiKeysProps) {
  const totalRequests = topApiKeysData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <WidgetCard
      title={'Most Used API Keys'}
      rounded="lg"
      className={className}
      titleClassName="font-semibold text-gray-900"
      headerClassName="pb-4"
    >
      <div className="h-80 w-full @sm:py-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart className="[&_.recharts-sector:focus]:outline-none">
            <Pie
              data={topApiKeysData}
              innerRadius={50}
              outerRadius={100}
              fill="#015DE1"
              stroke="rgba(0,0,0,0)"
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {topApiKeysData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">
            API Key Usage Breakdown
          </Text>
          <Text className="text-sm text-gray-500">
            Total: {totalRequests.toLocaleString()}
          </Text>
        </div>

        <div className="space-y-3">
          {topApiKeysData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <div className="flex items-center gap-2">
                  <PiKey className="h-4 w-4 text-gray-400" />
                  <Text className="line-clamp-1 text-sm font-medium text-gray-700">
                    {item.name}
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Text className="text-sm text-gray-600">
                  {item.value.toLocaleString()}
                </Text>
                <Text className="min-w-[40px] text-xs font-medium text-gray-500">
                  {item.percentage}%
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
