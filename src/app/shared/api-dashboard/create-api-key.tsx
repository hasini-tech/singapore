'use client';

import { useState } from 'react';
import { Button } from 'rizzui/button';
import { Input } from 'rizzui/input';
import { Title, Text } from 'rizzui';
import cn from '@/utils/class-names';
import { PiPlusBold, PiKey, PiCopyBold } from 'react-icons/pi';
import { apiKeyService } from '@/services/api-key.service';
import { toast } from 'react-hot-toast';

interface CreateApiKeyProps {
  className?: string;
  onApiKeyCreated?: () => void;
}

export default function CreateApiKey({
  className,
  onApiKeyCreated,
}: CreateApiKeyProps) {
  const [keyName, setKeyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await apiKeyService.createApiKey({ name: keyName.trim() });

      if (result.key) {
        setNewApiKey(result.key);
        toast.success('API key created successfully!');
      }

      setKeyName('');
      onApiKeyCreated?.();
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!newApiKey) return;

    // Try modern clipboard API first (requires HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(newApiKey)
        .then(() => {
          toast.success('API key copied to clipboard!');
        })
        .catch(() => {
          fallbackCopy(newApiKey);
        });
    } else {
      fallbackCopy(newApiKey);
    }
  };

  const fallbackCopy = (text: string) => {
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
      toast.success('API key copied to clipboard!');
    } catch {
      toast.error('Failed to copy. Please copy manually.');
    }
    document.body.removeChild(textArea);
  };

  if (newApiKey) {
    return (
      <div
        className={cn(
          'rounded-lg border border-muted bg-gray-0 p-6 dark:bg-gray-50',
          className
        )}
      >
        <div className="mb-6">
          <Title
            as="h3"
            className="flex items-center text-lg font-semibold text-green-700 dark:text-green-400"
          >
            <PiKey className="mr-2 h-5 w-5" />
            API Key Created Successfully
          </Title>
          <Text className="mt-1 text-sm text-gray-600">
            Your new API key has been generated successfully. Copy it now for
            easy access, and remember to store it securely.
          </Text>
        </div>

        <div className="rounded-md bg-gray-100 p-4">
          <div className="flex items-center justify-between">
            <Text className="font-mono text-sm text-gray-900">{newApiKey}</Text>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="ml-2"
            >
              <PiCopyBold className="mr-1 h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => setNewApiKey(null)} variant="outline">
            Create Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-muted bg-gray-0 p-6 dark:bg-gray-50',
        className
      )}
    >
      <div className="mb-6">
        <Title
          as="h3"
          className="flex items-center text-lg font-semibold text-gray-900"
        >
          <PiKey className="mr-2 h-5 w-5 text-gray-600" />
          Create New API Key
        </Title>
        <Text className="mt-1 text-sm text-gray-600">
          Generate a new API key for your applications
        </Text>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="keyName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            API Key Name *
          </label>
          <Input
            id="keyName"
            type="text"
            placeholder="Enter a descriptive name for your API key"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="w-full"
            disabled={isSubmitting}
          />
          <Text className="mt-1 text-xs text-gray-500">
            Choose a name that helps you identify where this key will be used
          </Text>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!keyName.trim() || isSubmitting}
            isLoading={isSubmitting}
            className="flex items-center"
          >
            <PiPlusBold className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Creating...' : 'Create API Key'}
          </Button>
        </div>
      </form>

      <div className="mt-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400 dark:text-blue-300"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <Text className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Security Notice:</strong> Store your API key securely and
              avoid sharing it in client-side code or public repositories. You
              can manage and regenerate your keys anytime from the dashboard.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
