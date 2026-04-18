'use client';

import { apiRequest } from '@/services/api-client';

export interface VesselData {
  id: number;
  vessel_id: string;
  local_time: string;
  longitude: number;
  latitude: number;
  average_speed_gps: number | null;
  course: number | null;
  me1_run_hours: number | null;
  me1_consumption: number | null;
  me1_fuel_type: number | null;
  me1_power_at_shaft: number | null;
  me2_run_hours: number | null;
  me2_consumption: number | null;
  me2_fuel_type: number | null;
  speed_through_water: string | null;
  wind_direction: number | null;
  ballast_water: number | null;
  destination_port: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface VesselInfo {
  id: string;
  name: string;
  imo: string;
  company_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface VesselDataResponse {
  items: VesselData[];
  total: number;
  limit: number;
  offset: number;
  vessel_info: VesselInfo;
}

export interface VesselDataStats {
  vessel_imo: string;
  vessel_name: string;
  total_records: number;
  date_range: {
    start: string;
    end: string;
  };
  latest_position: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  avg_speed: number;
  total_fuel_consumption: number;
}

export interface Vessel {
  id: string;
  imo: string;
  name: string;
  company_id: string;
  record_count: number;
  latest_data: string | null;
  created_at: string;
}

export interface VesselListResponse {
  vessels: Vessel[];
  total: number;
  search: string | null;
  limit: number;
}

export interface VesselDataQueryParams {
  imo: string;
  start_time?: string;
  end_time?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class VesselDataService {
  private buildApiKeyHeaders(): { useApiKey: true; apiKey: string } | {} {
    const apiKey =
      localStorage.getItem('api_key') || sessionStorage.getItem('api_key');
    return apiKey ? { useApiKey: true as const, apiKey } : {};
  }

  // Get vessel data by IMO
  async getVesselData(
    params: VesselDataQueryParams
  ): Promise<VesselDataResponse> {
    const sp = new URLSearchParams();
    sp.append('imo', params.imo);
    if (params.start_time) sp.append('start_time', params.start_time);
    if (params.end_time) sp.append('end_time', params.end_time);
    if (params.sort_order) sp.append('sort_order', params.sort_order);
    if (params.limit) sp.append('limit', params.limit.toString());
    if (params.offset) sp.append('offset', params.offset.toString());

    return apiRequest<VesselDataResponse>(`/data?${sp}`, {
      ...this.buildApiKeyHeaders(),
    });
  }

  // Get vessel data statistics
  async getVesselDataStats(params: {
    imo: string;
    start_time?: string;
    end_time?: string;
  }): Promise<VesselDataStats> {
    const sp = new URLSearchParams();
    sp.append('imo', params.imo);
    if (params.start_time) sp.append('start_time', params.start_time);
    if (params.end_time) sp.append('end_time', params.end_time);

    return apiRequest<VesselDataStats>(`/data/stats?${sp}`, {
      ...this.buildApiKeyHeaders(),
    });
  }

  // Get single data record by ID
  async getDataRecord(recordId: number): Promise<VesselData> {
    return apiRequest<VesselData>(`/data/${recordId}`, {
      ...this.buildApiKeyHeaders(),
    });
  }

  // List all vessels
  async getVessels(
    params: { search?: string; limit?: number } = {}
  ): Promise<VesselListResponse> {
    const sp = new URLSearchParams();
    if (params.search) sp.append('search', params.search);
    if (params.limit) sp.append('limit', params.limit.toString());

    const qs = sp.toString();
    return apiRequest<VesselListResponse>(`/vessels${qs ? `?${qs}` : ''}`, {
      ...this.buildApiKeyHeaders(),
    });
  }
}

// Export singleton instance
export const vesselDataService = new VesselDataService();
