'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTanStackTable } from '@/components/table/custom/use-TanStack-Table';
import Table from '@/components/table';
import TablePagination from '@/components/table/pagination';
import cn from '@/utils/class-names';
import { apiKeysColumns } from './api-key-table-columns';
import { apiKeyService, type ApiKeyData } from '@/services/api-key.service';
import { toast } from 'react-hot-toast';

export type ApiKeyDataType = ApiKeyData;

interface ApiKeyTableProps {
  className?: string;
  refreshTrigger?: number;
}

export default function ApiKeyTable({
  className,
  refreshTrigger,
}: ApiKeyTableProps) {
  const [data, setData] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiKeyService.listApiKeys({
        page: pagination.pageIndex + 1, // API uses 1-based pagination
        size: pagination.pageSize,
        include_inactive: true,
      });

      setData(result.items);
      setTotalCount(result.total);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error(error.message || 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchApiKeys();
  }, [pagination, refreshTrigger, fetchApiKeys]);

  const handleDeleteRow = async (row: ApiKeyData) => {
    try {
      await apiKeyService.deleteApiKey(row.id);
      toast.success('API key deleted successfully');
      fetchApiKeys(); // Refresh the table
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error(error.message || 'Failed to delete API key');
    }
  };

  const handleToggleActive = async (row: ApiKeyData) => {
    try {
      await apiKeyService.updateApiKey(row.id, {
        is_active: !row.is_active,
      });
      toast.success(
        `API key ${!row.is_active ? 'activated' : 'deactivated'} successfully`
      );
      fetchApiKeys(); // Refresh the table
    } catch (error: any) {
      console.error('Error updating API key:', error);
      toast.error(error.message || 'Failed to update API key');
    }
  };

  const handleUpdateName = async (row: ApiKeyData, newName: string) => {
    try {
      await apiKeyService.updateApiKey(row.id, {
        name: newName,
      });
      toast.success('API key name updated successfully');
      fetchApiKeys(); // Refresh the table
    } catch (error: any) {
      console.error('Error updating API key name:', error);
      toast.error(error.message || 'Failed to update API key name');
    }
  };

  const { table } = useTanStackTable<ApiKeyData>({
    tableData: data,
    columnConfig: apiKeysColumns,
    options: {
      initialState: {
        pagination,
      },
      onPaginationChange: setPagination,
      manualPagination: true,
      pageCount: Math.ceil(totalCount / pagination.pageSize),
      meta: {
        handleDeleteRow,
        handleToggleActive,
        handleUpdateName,
      } as any,
    },
  });

  if (loading && data.length === 0) {
    return (
      <div
        className={cn('rounded-lg border border-gray-300 bg-white', className)}
      >
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            API Keys Management
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage your API keys, monitor usage, and control access
          </p>
        </div>
        <div className="p-6">
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-lg border border-gray-300 bg-white', className)}
    >
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          API Keys Management
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage your API keys, monitor usage, and control access
        </p>
      </div>

      <div className="p-6">
        <Table
          table={table}
          variant="modern"
          classNames={{
            rowClassName: 'last:border-0',
          }}
        />
        <TablePagination table={table} className="mt-4" />
      </div>
    </div>
  );
}
