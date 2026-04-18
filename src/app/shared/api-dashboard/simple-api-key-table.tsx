'use client';

import cn from '@/utils/class-names';
import { Badge, Text, Button } from 'rizzui';
import {
  PiKey,
  PiToggleLeft,
  PiToggleRight,
  PiTrash,
  PiCopy,
} from 'react-icons/pi';
import { apiKeyService, type ApiKeyData } from '@/services/api-key.service';
import { toast } from 'react-hot-toast';

interface ApiKeyTableProps {
  className?: string;
  apiKeys: ApiKeyData[];
  loading: boolean;
  onDataChanged?: () => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function maskKey(key: string) {
  if (!key) return '—';
  if (key.length <= 12) return key;
  return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
}

function copyToClipboard(key: string) {
  if (!key) {
    toast.error('No API key to copy');
    return;
  }

  // Try modern clipboard API first (requires HTTPS)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(key)
      .then(() => {
        toast.success('API Key copied to clipboard!');
      })
      .catch(() => {
        fallbackCopy(key);
      });
  } else {
    fallbackCopy(key);
  }
}

function fallbackCopy(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    toast.success('API Key copied to clipboard!');
  } catch {
    toast.error('Failed to copy. Please copy manually.');
  }
  document.body.removeChild(textArea);
}

export default function ApiKeyTable({
  className,
  apiKeys,
  loading,
  onDataChanged,
}: ApiKeyTableProps) {
  const toggleKeyStatus = async (id: string) => {
    const key = apiKeys.find((k) => k.id === id);
    if (!key) return;

    try {
      await apiKeyService.updateApiKey(id, {
        is_active: !key.is_active,
      });
      toast.success(
        `API key ${!key.is_active ? 'activated' : 'deactivated'} successfully`
      );
      onDataChanged?.();
    } catch (error: any) {
      console.error('Error updating API key:', error);
      toast.error(error.message || 'Failed to update API key');
    }
  };

  const deleteKey = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to delete this API key? This action cannot be undone.'
      )
    ) {
      try {
        await apiKeyService.deleteApiKey(id);
        toast.success('API key deleted successfully');
        onDataChanged?.();
      } catch (error: any) {
        console.error('Error deleting API key:', error);
        toast.error(error.message || 'Failed to delete API key');
      }
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border border-muted bg-gray-0 dark:bg-gray-50',
          className
        )}
      >
        <div className="border-b border-muted p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            API Keys Management
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage your API keys, monitor usage, and control access
          </p>
        </div>
        <div className="p-6">
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-muted bg-gray-0 dark:bg-gray-50',
        className
      )}
    >
      <div className="border-b border-muted p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          API Keys Management
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage your API keys, monitor usage, and control access
        </p>
      </div>

      <div className="divide-y divide-muted">
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <PiKey className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No API keys
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first API key.
            </p>
          </div>
        ) : (
          apiKeys.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-6 transition-colors hover:bg-gray-100/40"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <PiKey className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <Text className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </Text>
                      <Badge
                        color={item.is_active ? 'success' : 'warning'}
                        rounded="md"
                        size="sm"
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span
                        className="cursor-pointer font-mono hover:text-gray-700"
                        onClick={() =>
                          item.key ? copyToClipboard(item.key) : null
                        }
                        title={item.key ? 'Click to copy full key' : undefined}
                      >
                        {/* Key: {maskKey(item.key)} */}
                        Key: {item?.key}
                      </span>
                      <span>Created: {formatDate(item.created_at)}</span>
                      <span>Last used: {formatDate(item.last_used)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (item.key ? copyToClipboard(item.key) : null)}
                  className="p-2"
                  title="Copy API Key"
                >
                  <PiCopy className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleKeyStatus(item.id)}
                  className="p-2"
                  title={item.is_active ? 'Deactivate' : 'Activate'}
                >
                  {item.is_active ? (
                    <PiToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <PiToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteKey(item.id)}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <PiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {apiKeys.length > 0 && (
        <div className="border-t border-muted px-6 py-3">
          <div className="text-xs text-gray-500">
            Showing {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
