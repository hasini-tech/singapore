'use client';

import { useState } from 'react';
import TableRowActionGroup from '@/components/table-utils/table-row-action-group';
import DateCell from '@/ui/date-cell';
import {
  createColumnHelper,
  type Row,
  type Table,
} from '@tanstack/react-table';
import { Badge, Button, Input, Switch } from 'rizzui';
import { ApiKeyDataType } from './api-key-table';
import { PiPencil, PiTrash, PiCheck, PiX, PiKey, PiCopy } from 'react-icons/pi';

const columnHelper = createColumnHelper<ApiKeyDataType>();

function EditableNameCell({ row }: { row: Row<ApiKeyDataType> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(row.original.name);

  const handleSave = () => {
    if (newName.trim()) {
      const meta = (row as any).table?.options?.meta;
      meta?.handleUpdateName?.(row.original, newName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewName(row.original.name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-[200px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          className="p-1.5"
        >
          <PiCheck className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="p-1.5"
        >
          <PiX className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <PiKey className="h-4 w-4 text-gray-400" />
        <span className="font-medium">{row.original.name}</span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsEditing(true)}
        className="p-1.5 opacity-0 group-hover:opacity-100"
      >
        <PiPencil className="h-3 w-3" />
      </Button>
    </div>
  );
}

function StatusCell({ row }: { row: Row<ApiKeyDataType> }) {
  const handleToggle = () => {
    const meta = (row as any).table?.options?.meta;
    meta?.handleToggleActive?.(row.original);
  };

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={row.original.is_active}
        onChange={handleToggle}
        size="sm"
      />
      <Badge
        variant="flat"
        color={row.original.is_active ? 'success' : 'secondary'}
        className="font-medium"
      >
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}

function KeyIdCell({ row }: { row: any }) {
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = () => {
    const key = row.original.id;
    // Try modern clipboard API first (requires HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(key)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopy(key);
        });
    } else {
      fallbackCopy(key);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs">
        {row.original.id.slice(0, 12)}...
      </code>
      <Button
        size="sm"
        variant="outline"
        onClick={copyToClipboard}
        className="p-1.5"
        title="Copy API Key ID"
      >
        <PiCopy className="h-3 w-3" />
      </Button>
      {copied && <span className="text-xs text-green-600">Copied!</span>}
    </div>
  );
}

export const apiKeysColumns = [
  columnHelper.accessor('name', {
    id: 'name',
    size: 300,
    header: 'Name',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="group">
        <EditableNameCell row={row} />
      </div>
    ),
  }),
  columnHelper.accessor('id', {
    id: 'id',
    size: 200,
    header: 'Key ID',
    enableSorting: false,
    cell: ({ row }) => <KeyIdCell row={row} />,
  }),
  columnHelper.accessor('is_active', {
    id: 'status',
    size: 150,
    header: 'Status',
    cell: ({ row }) => <StatusCell row={row} />,
  }),
  columnHelper.accessor('last_used', {
    id: 'lastUsed',
    size: 180,
    header: 'Last Used',
    cell: ({ row }) => (
      <DateCell date={new Date(row.original.last_used)} className="text-sm" />
    ),
  }),
  columnHelper.accessor('created_at', {
    id: 'createdAt',
    size: 180,
    header: 'Created',
    cell: ({ row }) => (
      <DateCell date={new Date(row.original.created_at)} className="text-sm" />
    ),
  }),
  columnHelper.display({
    id: 'actions',
    size: 120,
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-3 pe-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            console.log('Regenerate key:', row.original.id);
          }}
          className="h-7 px-2.5"
        >
          <PiKey className="mr-1 h-3 w-3" />
          Regenerate
        </Button>
        <TableRowActionGroup
          onDelete={() => {
            if (
              confirm(
                'Are you sure you want to delete this API key? This action cannot be undone.'
              )
            ) {
              // We need to pass the delete handler from the table options
              const meta = (row as any).table?.options?.meta;
              meta?.handleDeleteRow?.(row.original);
            }
          }}
          deletePopoverTitle="Delete API Key"
          deletePopoverDescription="Are you sure you want to delete this API key? This action cannot be undone."
          editUrl="#"
          viewUrl="#"
        />
      </div>
    ),
  }),
];
