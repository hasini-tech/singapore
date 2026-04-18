'use client';

import { useAuth } from '@/context/auth-context';
import { apiRequest, apiFetch } from '@/services/api-client';

export interface ApiKeyData {
  name: string;
  id: string;
  key: string;
  user_id: string;
  is_active: boolean;
  last_used: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyResponse extends ApiKeyData {
  // key is inherited from ApiKeyData (always present in list responses,
  // and always present in creation responses)
}

export interface ApiKeyListResponse {
  items: ApiKeyData[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  is_active?: boolean;
}

export interface ApiKeyUsageResponse {
  key_id: string;
  key_name: string;
  is_active: boolean;
  last_used: string;
  created_at: string;
}

export interface ApiError {
  detail: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}

class ApiKeyService {
  // Create a new API key
  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    return apiRequest<ApiKeyResponse>('/api-keys/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // List API keys with pagination
  async listApiKeys(
    params: {
      page?: number;
      size?: number;
      include_inactive?: boolean;
    } = {}
  ): Promise<ApiKeyListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.include_inactive !== undefined) {
      searchParams.append(
        'include_inactive',
        params.include_inactive.toString()
      );
    }

    const qs = searchParams.toString();
    return apiRequest<ApiKeyListResponse>(`/api-keys/${qs ? `?${qs}` : ''}`);
  }

  // Get API key details by ID
  async getApiKey(keyId: string): Promise<ApiKeyData> {
    return apiRequest<ApiKeyData>(`/api-keys/${keyId}`);
  }

  // Update API key
  async updateApiKey(
    keyId: string,
    data: UpdateApiKeyRequest
  ): Promise<ApiKeyData> {
    return apiRequest<ApiKeyData>(`/api-keys/${keyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete/deactivate API key
  async deleteApiKey(keyId: string): Promise<void> {
    const response = await apiFetch(`/api-keys/${keyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      const message =
        typeof errorData.detail === 'string'
          ? errorData.detail
          : errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }
  }

  // Get API key usage statistics
  async getApiKeyUsage(keyId: string): Promise<ApiKeyUsageResponse> {
    return apiRequest<ApiKeyUsageResponse>(`/api-keys/${keyId}/usage`);
  }
}

// Export singleton instance
export const apiKeyService = new ApiKeyService();

// React hook for API key operations
export const useApiKeyService = () => {
  const { accessToken } = useAuth();

  return {
    ...apiKeyService,
    isAuthenticated: !!accessToken,
  };
};
