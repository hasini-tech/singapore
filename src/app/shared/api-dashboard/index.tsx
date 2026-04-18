'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ApiDashboardHeader from './api-dashboard-header';
import CreateApiKey from './create-api-key';
import ApiKeyStats from './api-key-stats';
import ApiKeyTable from './simple-api-key-table';
import ActiveKeysSessions from './active-keys-sessions';
import {
  apiKeyService,
  type ApiKeyData,
  type ApiKeyListResponse,
} from '@/services/api-key.service';
import { toast } from 'react-hot-toast';

const APIDASHBOARD = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchApiKeys = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const result: ApiKeyListResponse = await apiKeyService.listApiKeys({
        include_inactive: true,
        size: 100,
      });
      setApiKeys(result.items);
      setTotal(result.total);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error(error.message || 'Failed to fetch API keys');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys(true);
  }, [fetchApiKeys]);

  const handleApiKeyCreated = () => {
    fetchApiKeys(false);
  };

  const handleDataChanged = () => {
    fetchApiKeys(false);
  };

  return (
    <div className="@container">
      <ApiDashboardHeader />
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <ApiKeyStats
          className="grid-cols-1 @xl:grid-cols-2 @4xl:col-span-2 @6xl:grid-cols-4 @7xl:col-span-12"
          apiKeys={apiKeys}
          loading={loading}
        />

        <CreateApiKey
          className="@4xl:col-span-1 @7xl:col-span-4"
          onApiKeyCreated={handleApiKeyCreated}
        />

        <ActiveKeysSessions
          className="@7xl:col-span-4"
          apiKeys={apiKeys}
          loading={loading}
        />

        <ApiKeyTable
          className="@4xl:col-span-2 @7xl:col-span-12"
          apiKeys={apiKeys}
          loading={loading}
          onDataChanged={handleDataChanged}
        />
      </div>
    </div>
  );
};

export default APIDASHBOARD;
