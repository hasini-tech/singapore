'use client';

import { useMemo } from 'react';
import { Text, Badge } from 'rizzui';
import { type ApiKeyData } from '@/services/api-key.service';
import ApiKeysProgress from './api-keys-progress';

interface ActiveKeysSessionsProps {
  className?: string;
  apiKeys: ApiKeyData[];
  loading: boolean;
}

export default function ActiveKeysSessions({
  className,
  apiKeys,
  loading,
}: ActiveKeysSessionsProps) {
  const { totalKeys, activeCount, inactiveCount, activePercentage } =
    useMemo(() => {
      const active = apiKeys.filter((k) => k.is_active).length;
      const inactive = apiKeys.length - active;
      const total = apiKeys.length;
      const pct = total > 0 ? Math.round((active / total) * 100) : 0;

      return {
        totalKeys: total,
        activeCount: active,
        inactiveCount: inactive,
        activePercentage: pct,
      };
    }, [apiKeys]);

  return (
    <>
      <ApiKeysProgress
        className={className}
        apiKeys={apiKeys}
        loading={loading}
      />
    </>
  );
}
