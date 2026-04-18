'use client';

import { Avatar, Text, Badge } from 'rizzui';
import WidgetCard from '@/components/cards/widget-card';
import cn from '@/utils/class-names';
import {
  PiKey,
  PiCheckCircle,
  PiXCircle,
  PiArrowsClockwise,
} from 'react-icons/pi';

const recentActivities = [
  {
    id: 1,
    type: 'created',
    apiKey: 'Third Party Integration',
    message: 'API key created successfully',
    timestamp: '2 minutes ago',
    icon: PiKey,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    type: 'used',
    apiKey: 'Main Website API',
    message: 'API key accessed from new location',
    timestamp: '5 minutes ago',
    icon: PiCheckCircle,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 3,
    type: 'failed',
    apiKey: 'Mobile App API',
    message: 'Failed request - Rate limit exceeded',
    timestamp: '12 minutes ago',
    icon: PiXCircle,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 4,
    type: 'regenerated',
    apiKey: 'Analytics Dashboard',
    message: 'API key regenerated for security',
    timestamp: '1 hour ago',
    icon: PiArrowsClockwise,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 5,
    type: 'deactivated',
    apiKey: 'Test Environment',
    message: 'API key deactivated',
    timestamp: '2 hours ago',
    icon: PiXCircle,
    color: 'bg-gray-100 text-gray-600',
  },
  {
    id: 6,
    type: 'used',
    apiKey: 'Third Party Integration',
    message: 'High volume of requests detected',
    timestamp: '3 hours ago',
    icon: PiCheckCircle,
    color: 'bg-green-100 text-green-600',
  },
];

const getActivityBadge = (type: string) => {
  const badgeMap = {
    created: { label: 'Created', color: 'info' as const },
    used: { label: 'Active', color: 'success' as const },
    failed: { label: 'Error', color: 'danger' as const },
    regenerated: { label: 'Updated', color: 'warning' as const },
    deactivated: { label: 'Inactive', color: 'secondary' as const },
  };

  return (
    badgeMap[type as keyof typeof badgeMap] || {
      label: 'Unknown',
      color: 'secondary' as const,
    }
  );
};

interface KeyActivityProps {
  className?: string;
}

export default function KeyActivity({ className }: KeyActivityProps) {
  return (
    <WidgetCard
      title={'Recent Activity'}
      rounded="lg"
      className={cn('h-fit', className)}
      titleClassName="font-semibold text-gray-900"
      headerClassName="pb-4"
    >
      <div className="max-h-96 space-y-4 overflow-y-auto">
        {recentActivities.map((activity) => {
          const IconComponent = activity.icon;
          const badge = getActivityBadge(activity.type);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50"
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${activity.color}`}
              >
                <IconComponent className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Text className="text-sm font-medium text-gray-900">
                        {activity.apiKey}
                      </Text>
                      <Badge
                        variant="flat"
                        color={badge.color}
                        className="text-xs"
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <Text className="line-clamp-2 text-sm text-gray-600">
                      {activity.message}
                    </Text>
                  </div>
                </div>

                <Text className="mt-2 text-xs text-gray-500">
                  {activity.timestamp}
                </Text>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
          View All Activity
        </button>
      </div>
    </WidgetCard>
  );
}
