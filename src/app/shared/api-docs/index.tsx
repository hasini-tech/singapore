'use client';

import { useState, useCallback, useEffect } from 'react';
import cn from '@/utils/class-names';
import { getApiBaseUrl } from '@/utils/api-base-url';
import { Text, Title, Badge, Button, Input, Tab } from 'rizzui';
import {
  PiCaretRight,
  PiCaretDown,
  PiCopy,
  PiPlay,
  PiCheck,
  PiWarning,
  PiInfo,
  PiLock,
  PiGlobe,
  PiArrowRight,
} from 'react-icons/pi';
import { apiFetch } from '@/services/api-client';

const API_BASE_URL = getApiBaseUrl();

// ─── Endpoint definitions ────────────────────
interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  auth: 'api-key' | 'bearer';
  params: EndpointParam[];
  sampleResponse: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'get-vessel-data',
    method: 'GET',
    path: '/data',
    title: 'Get Vessel Data',
    description:
      'Retrieve autonomous navigation and engine data for a specific vessel by IMO number. Returns time-series data including position, speed, engine metrics, and environmental conditions.',
    auth: 'api-key',
    params: [
      {
        name: 'imo',
        type: 'string',
        required: true,
        description: 'IMO number of the vessel (e.g., "999999")',
      },
      {
        name: 'start_time',
        type: 'datetime',
        required: false,
        description: 'Filter from this time (ISO 8601 format)',
      },
      {
        name: 'end_time',
        type: 'datetime',
        required: false,
        description: 'Filter to this time (ISO 8601 format)',
      },
      {
        name: 'sort_order',
        type: 'string',
        required: false,
        description: 'Sort order: "asc" or "desc"',
        defaultValue: 'desc',
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum records to return (max: 1000)',
        defaultValue: '100',
      },
      {
        name: 'offset',
        type: 'integer',
        required: false,
        description: 'Number of records to skip for pagination',
        defaultValue: '0',
      },
    ],
    sampleResponse: `{
  "items": [
    {
      "id": 1,
      "vessel_id": "vessel-uuid",
      "local_time": "2026-11-01T10:12:00Z",
      "longitude": 103.1301,
      "latitude": 5.3368,
      "average_speed_gps": 8.5,
      "course": 245.3,
      "me1_run_hours": 971.05,
      "me1_consumption": 12.5,
      "me1_fuel_type": 1,
      "me2_run_hours": 1901.8,
      "me2_consumption": 0.0,
      "speed_through_water": "8.2",
      "wind_direction": 180,
      "created_at": "2026-02-16T10:00:00Z"
    }
  ],
  "total": 59,
  "limit": 100,
  "offset": 0,
  "vessel_info": {
    "id": "vessel-uuid",
    "name": "Perfomax Test Vessel",
    "imo": "999999"
  }
}`,
  },
  {
    id: 'get-data-stats',
    method: 'GET',
    path: '/data/stats',
    title: 'Get Data Statistics',
    description:
      'Get aggregated statistics for a vessel including total records, date ranges, latest position, average speed, and total fuel consumption.',
    auth: 'api-key',
    params: [
      {
        name: 'imo',
        type: 'string',
        required: true,
        description: 'IMO number of the vessel',
      },
      {
        name: 'start_time',
        type: 'datetime',
        required: false,
        description: 'Start time for statistics period (ISO 8601)',
      },
      {
        name: 'end_time',
        type: 'datetime',
        required: false,
        description: 'End time for statistics period (ISO 8601)',
      },
    ],
    sampleResponse: `{
  "vessel_imo": "999999",
  "vessel_name": "Perfomax Test Vessel",
  "total_records": 59,
  "date_range": {
    "start": "2026-11-01T10:12:00Z",
    "end": "2026-11-01T11:10:00Z"
  },
  "latest_position": {
    "latitude": 5.2755,
    "longitude": 103.2630,
    "timestamp": "2026-11-01T11:10:00Z"
  },
  "avg_speed": 8.45,
  "total_fuel_consumption": 125.8
}`,
  },
  {
    id: 'get-single-record',
    method: 'GET',
    path: '/data/{record_id}',
    title: 'Get Single Record',
    description:
      'Retrieve a specific data record by its ID. Returns all fields for the record including navigation, engine, and environmental data.',
    auth: 'api-key',
    params: [
      {
        name: 'record_id',
        type: 'integer',
        required: true,
        description: 'The numeric ID of the data record',
      },
    ],
    sampleResponse: `{
  "id": 1,
  "vessel_id": "vessel-uuid",
  "local_time": "2026-11-01T10:12:00Z",
  "longitude": 103.1301,
  "latitude": 5.3368,
  "average_speed_gps": 8.5,
  "course": 245.3,
  "me1_run_hours": 971.05,
  "me1_consumption": 12.5,
  "me1_fuel_type": 1,
  "me2_run_hours": 1901.8,
  "speed_through_water": "8.2",
  "wind_direction": 180,
  "ballast_water": null,
  "destination_port": null,
  "created_at": "2026-02-16T10:00:00Z"
}`,
  },
  {
    id: 'list-vessels',
    method: 'GET',
    path: '/vessels',
    title: 'List Vessels',
    description:
      'Get all vessels available to you with their data record counts and latest data timestamps. Supports searching by vessel name or IMO number.',
    auth: 'api-key',
    params: [
      {
        name: 'search',
        type: 'string',
        required: false,
        description: 'Search vessels by name or IMO',
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Maximum vessels to return',
        defaultValue: '100',
      },
    ],
    sampleResponse: `{
  "vessels": [
    {
      "id": "vessel-uuid",
      "imo": "999999",
      "name": "Perfomax Test Vessel",
      "company_id": "default-company",
      "record_count": 59,
      "latest_data": "2026-11-01T11:10:00Z",
      "created_at": "2026-02-16T10:00:00Z"
    }
  ],
  "total": 1,
  "search": null,
  "limit": 100
}`,
  },
];

// ─── Method badge colors ─────────────────────
function MethodBadge({ method }: { method: string }) {
  const colorMap: Record<string, string> = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-bold',
        colorMap[method] || 'bg-gray-100 text-gray-700'
      )}
    >
      {method}
    </span>
  );
}

// ─── Copy button ─────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:text-gray-900"
      title="Copy to clipboard"
    >
      {copied ? (
        <PiCheck className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <PiCopy className="h-3.5 w-3.5" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Code block ──────────────────────────────
function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-muted bg-gray-100 p-4',
        className
      )}
    >
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto text-sm text-gray-800">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── API Tester ──────────────────────────────
function ApiTester({ endpoint }: { endpoint: EndpointDef }) {
  const [apiKey, setApiKey] = useState('');
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseCollapsed, setResponseCollapsed] = useState(false);

  const updateParam = useCallback((name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const buildUrl = () => {
    let path = endpoint.path;
    const queryParams: string[] = [];

    endpoint.params.forEach((param) => {
      const value = paramValues[param.name] || '';
      if (!value) return;

      // Path params like {record_id}
      if (path.includes(`{${param.name}}`)) {
        path = path.replace(`{${param.name}}`, encodeURIComponent(value));
      } else {
        queryParams.push(
          `${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`
        );
      }
    });

    const qs = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return `${API_BASE_URL}${path}${qs}`;
  };

  const handleSend = async () => {
    if (!apiKey.trim()) {
      setResponse(
        JSON.stringify({ error: 'Please enter your API key' }, null, 2)
      );
      setStatusCode(400);
      return;
    }

    // Validate required params
    for (const param of endpoint.params) {
      if (param.required && !paramValues[param.name]) {
        setResponse(
          JSON.stringify(
            { error: `Missing required parameter: ${param.name}` },
            null,
            2
          )
        );
        setStatusCode(400);
        return;
      }
    }

    setLoading(true);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);

    const url = buildUrl();
    const startTime = performance.now();

    try {
      const res = await fetch(url, {
        method: endpoint.method,
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      const elapsed = Math.round(performance.now() - startTime);
      setResponseTime(elapsed);
      setStatusCode(res.status);

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setResponseTime(elapsed);
      setStatusCode(0);
      setResponse(
        JSON.stringify(
          { error: 'Network error', message: err.message },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-muted bg-gray-0 p-5 dark:bg-gray-50">
      <div className="flex items-center gap-2">
        <PiPlay className="h-4 w-4 text-gray-600" />
        <Text className="font-semibold text-gray-900">Try it out</Text>
      </div>

      {/* API Key input */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          <PiLock className="mr-1 inline h-3.5 w-3.5" />
          API Key <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="pk_your_api_key_here"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="font-mono"
        />
        <Text className="mt-1 text-xs text-gray-500">
          Get your API key from the API Keys page
        </Text>
      </div>

      {/* Parameters */}
      {endpoint.params.length > 0 && (
        <div className="space-y-3">
          <Text className="text-sm font-medium text-gray-700">Parameters</Text>
          {endpoint.params.map((param) => (
            <div key={param.name}>
              <label className="mb-1 block text-sm text-gray-600">
                <code className="mr-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-900">
                  {param.name}
                </code>
                <span className="text-xs text-gray-500">({param.type})</span>
                {param.required && (
                  <span className="ml-1 text-xs text-red-500">required</span>
                )}
              </label>
              <Input
                type="text"
                placeholder={
                  param.defaultValue
                    ? `Default: ${param.defaultValue}`
                    : param.description
                }
                value={paramValues[param.name] || ''}
                onChange={(e) => updateParam(param.name, e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Request URL preview */}
      <div>
        <Text className="mb-1 text-xs font-medium text-gray-500">
          Request URL
        </Text>
        <div className="flex items-center gap-2 rounded-md border border-muted bg-gray-100 px-3 py-2">
          <MethodBadge method={endpoint.method} />
          <code className="flex-1 overflow-x-auto text-xs text-gray-800">
            {buildUrl()}
          </code>
        </div>
      </div>

      {/* Send button */}
      <Button onClick={handleSend} isLoading={loading} className="w-full">
        <PiPlay className="mr-2 h-4 w-4" />
        Send Request
      </Button>

      {/* Response */}
      {(response || loading) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setResponseCollapsed((prev) => !prev)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            >
              {responseCollapsed ? (
                <PiCaretRight className="h-3.5 w-3.5" />
              ) : (
                <PiCaretDown className="h-3.5 w-3.5" />
              )}
              Response
              {responseCollapsed && response && (
                <span className="text-xs font-normal text-gray-500">
                  ({(response.length / 1024).toFixed(1)} KB)
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              {responseTime !== null && (
                <Text className="text-xs text-gray-500">{responseTime}ms</Text>
              )}
              {statusCode !== null && (
                <Badge
                  color={
                    statusCode >= 200 && statusCode < 300
                      ? 'success'
                      : statusCode >= 400
                        ? 'danger'
                        : 'warning'
                  }
                  variant="flat"
                  size="sm"
                >
                  {statusCode === 0 ? 'Network Error' : statusCode}
                </Badge>
              )}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center rounded-lg border border-muted bg-gray-100 py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
            </div>
          ) : (
            response &&
            !responseCollapsed && (
              <div className="relative">
                <CodeBlock
                  code={response}
                  className="max-h-[500px] overflow-y-auto"
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Endpoint Card ───────────────────────────
function EndpointCard({ endpoint }: { endpoint: EndpointDef }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const curlExample = (() => {
    const params = endpoint.params
      .filter((p) => p.required)
      .map((p) => {
        if (endpoint.path.includes(`{${p.name}}`)) return '';
        return `${p.name}=${p.name === 'imo' ? '999999' : 'value'}`;
      })
      .filter(Boolean)
      .join('&');
    const path = endpoint.path.replace(/\{(\w+)\}/g, (_, name) =>
      name === 'record_id' ? '1' : 'value'
    );
    const qs = params ? `?${params}` : '';
    return `curl -X ${endpoint.method} "${API_BASE_URL}${path}${qs}" \\
     -H "X-API-Key: pk_your_api_key_here"`;
  })();

  return (
    <div className="overflow-hidden rounded-lg border border-muted bg-gray-0 dark:bg-gray-50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-100/40"
      >
        <div className="flex items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <div>
            <Text className="font-semibold text-gray-900">
              {endpoint.title}
            </Text>
            <code className="text-sm text-gray-500">{endpoint.path}</code>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="flat" color="info" size="sm">
            <PiLock className="mr-1 h-3 w-3" />
            API Key
          </Badge>
          <PiCaretRight
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-muted">
          <Tab>
            <Tab.List>
              <Tab.ListItem>Documentation</Tab.ListItem>
              <Tab.ListItem>Try It</Tab.ListItem>
            </Tab.List>
            <Tab.Panels>
              {/* Documentation panel */}
              <Tab.Panel>
                <div className="space-y-6 p-5">
                  {/* Description */}
                  <div>
                    <Text className="leading-relaxed text-gray-700">
                      {endpoint.description}
                    </Text>
                  </div>

                  {/* Authentication */}
                  <div>
                    <Title
                      as="h4"
                      className="mb-2 text-sm font-semibold text-gray-900"
                    >
                      Authentication
                    </Title>
                    <div className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2">
                      <PiLock className="h-4 w-4 text-gray-600" />
                      <Text className="text-sm text-gray-700">
                        Requires{' '}
                        <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-900">
                          X-API-Key
                        </code>{' '}
                        header
                      </Text>
                    </div>
                  </div>

                  {/* Parameters table */}
                  {endpoint.params.length > 0 && (
                    <div>
                      <Title
                        as="h4"
                        className="mb-3 text-sm font-semibold text-gray-900"
                      >
                        Parameters
                      </Title>
                      <div className="overflow-hidden rounded-lg border border-muted">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-muted bg-gray-100">
                              <th className="px-4 py-2.5 font-medium text-gray-700">
                                Name
                              </th>
                              <th className="px-4 py-2.5 font-medium text-gray-700">
                                Type
                              </th>
                              <th className="px-4 py-2.5 font-medium text-gray-700">
                                Required
                              </th>
                              <th className="px-4 py-2.5 font-medium text-gray-700">
                                Description
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-muted">
                            {endpoint.params.map((param) => (
                              <tr key={param.name}>
                                <td className="px-4 py-2.5">
                                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-900">
                                    {param.name}
                                  </code>
                                </td>
                                <td className="px-4 py-2.5 text-gray-600">
                                  {param.type}
                                </td>
                                <td className="px-4 py-2.5">
                                  {param.required ? (
                                    <Badge
                                      color="danger"
                                      variant="flat"
                                      size="sm"
                                    >
                                      Required
                                    </Badge>
                                  ) : (
                                    <Badge
                                      color="secondary"
                                      variant="flat"
                                      size="sm"
                                    >
                                      Optional
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-gray-600">
                                  {param.description}
                                  {param.defaultValue && (
                                    <span className="ml-1 text-xs text-gray-500">
                                      (default: {param.defaultValue})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* cURL example */}
                  <div>
                    <Title
                      as="h4"
                      className="mb-2 text-sm font-semibold text-gray-900"
                    >
                      Example Request
                    </Title>
                    <CodeBlock code={curlExample} />
                  </div>

                  {/* Sample response */}
                  <div>
                    <Title
                      as="h4"
                      className="mb-2 text-sm font-semibold text-gray-900"
                    >
                      Sample Response
                    </Title>
                    <CodeBlock code={endpoint.sampleResponse} />
                  </div>
                </div>
              </Tab.Panel>

              {/* Try It panel */}
              <Tab.Panel>
                <div className="p-5">
                  <ApiTester endpoint={endpoint} />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab>
        </div>
      )}
    </div>
  );
}

// ─── Main page component ─────────────────────
export default function ApiDocsPage() {
  // ── Validate token on mount (triggers logout on 401) ──
  useEffect(() => {
    apiFetch('/auth/me').catch(() => {
      // apiFetch handles 401 → refresh → logout automatically
    });
  }, []);

  return (
    <div className="@container">
      {/* Introduction */}
      <div className="mb-8 rounded-lg border border-muted bg-gray-0 p-6 dark:bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-lighter/30">
            <PiGlobe className="h-6 w-6 text-green-dark" />
          </div>
          <div>
            <Title as="h3" className="mb-2 text-lg font-semibold text-gray-900">
              Perfomax Maritime Data API
            </Title>
            <Text className="mb-4 leading-relaxed text-gray-600">
              Access vessel autonomous data including real-time navigation,
              engine performance metrics, fuel consumption, and environmental
              conditions. Use your API key from the API Keys page to
              authenticate all requests.
            </Text>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <PiGlobe className="h-4 w-4 text-gray-500" />
                <Text className="text-sm text-gray-600">
                  Base URL:{' '}
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-900">
                    {API_BASE_URL}
                  </code>
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <PiLock className="h-4 w-4 text-gray-500" />
                <Text className="text-sm text-gray-600">
                  Auth: API Key via{' '}
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-900">
                    X-API-Key
                  </code>{' '}
                  header
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mb-8 rounded-lg border border-muted bg-gray-0 p-6 dark:bg-gray-50">
        <Title as="h3" className="mb-4 text-base font-semibold text-gray-900">
          Quick Start Guide
        </Title>
        <div className="grid gap-4 @xl:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg bg-gray-100 p-4">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-lighter/50 text-sm font-bold text-green-dark">
              1
            </div>
            <div>
              <Text className="font-medium text-gray-900">Get an API Key</Text>
              <Text className="mt-1 text-sm text-gray-600">
                Go to the API Keys page and create a new key
              </Text>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-100 p-4">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-lighter/50 text-sm font-bold text-green-dark">
              2
            </div>
            <div>
              <Text className="font-medium text-gray-900">
                Add X-API-Key Header
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                Include your key in the X-API-Key request header
              </Text>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-gray-100 p-4">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-lighter/50 text-sm font-bold text-green-dark">
              3
            </div>
            <div>
              <Text className="font-medium text-gray-900">Make Requests</Text>
              <Text className="mt-1 text-sm text-gray-600">
                Query vessel data using IMO numbers
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limiting & Error Handling info */}
      <div className="mb-8 grid gap-6 @xl:grid-cols-2">
        <div className="rounded-lg border border-muted bg-gray-0 p-5 dark:bg-gray-50">
          <div className="mb-3 flex items-center gap-2">
            <PiInfo className="h-4 w-4 text-blue-600" />
            <Title as="h4" className="text-sm font-semibold text-gray-900">
              Rate Limiting
            </Title>
          </div>
          <Text className="mb-2 text-sm leading-relaxed text-gray-600">
            API keys are limited to <strong>100 requests per minute</strong>.
            Rate limit info is included in response headers:
          </Text>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              <code className="rounded bg-gray-100 px-1 text-xs text-gray-800">
                X-RateLimit-Limit
              </code>{' '}
              — Max requests per minute
            </li>
            <li>
              <code className="rounded bg-gray-100 px-1 text-xs text-gray-800">
                X-RateLimit-Remaining
              </code>{' '}
              — Remaining requests
            </li>
            <li>
              <code className="rounded bg-gray-100 px-1 text-xs text-gray-800">
                X-RateLimit-Reset
              </code>{' '}
              — Reset timestamp
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-muted bg-gray-0 p-5 dark:bg-gray-50">
          <div className="mb-3 flex items-center gap-2">
            <PiWarning className="h-4 w-4 text-amber-600" />
            <Title as="h4" className="text-sm font-semibold text-gray-900">
              Error Codes
            </Title>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-1.5 text-xs text-gray-800">
                400
              </code>
              <Text className="text-gray-600">Invalid request parameters</Text>
            </div>
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-1.5 text-xs text-gray-800">
                401
              </code>
              <Text className="text-gray-600">Invalid or missing API key</Text>
            </div>
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-1.5 text-xs text-gray-800">
                404
              </code>
              <Text className="text-gray-600">Resource not found</Text>
            </div>
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-1.5 text-xs text-gray-800">
                429
              </code>
              <Text className="text-gray-600">Rate limit exceeded</Text>
            </div>
            <div className="flex items-center justify-between">
              <code className="rounded bg-gray-100 px-1.5 text-xs text-gray-800">
                500
              </code>
              <Text className="text-gray-600">Server error</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="mb-4">
        <Title as="h3" className="text-lg font-semibold text-gray-900">
          API Endpoints
        </Title>
        <Text className="mt-1 text-sm text-gray-600">
          Click on an endpoint to view documentation and test it live
        </Text>
      </div>

      <div className="space-y-4">
        {ENDPOINTS.map((endpoint) => (
          <EndpointCard key={endpoint.id} endpoint={endpoint} />
        ))}
      </div>

      {/* Data Model Reference */}
      <div className="mt-8 rounded-lg border border-muted bg-gray-0 p-6 dark:bg-gray-50">
        <Title as="h3" className="mb-4 text-base font-semibold text-gray-900">
          Data Fields Reference
        </Title>
        <Text className="mb-4 text-sm text-gray-600">
          The vessel data records contain the following field categories:
        </Text>
        <div className="grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
          {[
            {
              title: 'Navigation',
              fields:
                'latitude, longitude, average_speed_gps, course, speed_through_water',
            },
            {
              title: 'Main Engines (ME1-3)',
              fields: 'run_hours, consumption, fuel_type, power_at_shaft',
            },
            {
              title: 'Auxiliary Engines (AE1-4)',
              fields: 'run_hours, consumption, fuel_type, energy_produced',
            },
            {
              title: 'Environmental',
              fields:
                'wind_direction, wind_strength, sea_state, current_direction',
            },
            {
              title: 'Vessel',
              fields:
                'ballast_water, cargo_tonns, draft_forward, draft_aft, draft_middle',
            },
            {
              title: 'Voyage',
              fields:
                'destination_port, departure_port, eta_next_port, charter_speed_order',
            },
          ].map((category) => (
            <div key={category.title} className="rounded-lg bg-gray-100 p-4">
              <Text className="mb-1 text-sm font-semibold text-gray-900">
                {category.title}
              </Text>
              <Text className="text-xs leading-relaxed text-gray-600">
                {category.fields}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
