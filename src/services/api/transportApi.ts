// src/services/api/transportApi.ts

// Use the shared apiClient with auth interceptor
import apiClient from './apiClient';

export interface TransportLog {
  transport_id: number;
  client_id: number;
  driver_id: number;
  transport_date: string;
  pickup_time: string;
  dropoff_time?: string;
  pickup_location: string;
  dropoff_location: string;
  distance_miles?: number;
  duration_minutes?: number;
  transport_type: string;
  purpose?: string;
  vehicle_reg?: string;
  start_mileage?: number;
  end_mileage?: number;
  status: string;
  client_condition?: string;
  special_requirements?: string;
  notes?: string;
  actual_pickup_time?: string;
  actual_dropoff_time?: string;
  client_name?: string;
  driver_name?: string;
  cAddr1?: string;
  cTown?: string;
  cPostCode?: string;
  cTel?: string;
  driver_mobile?: string;
  created_at?: string;
  updated_at?: string;
}

export const transportApi = {
  // Get all transports with optional filters
  getTransports: async (filters?: {
    driver_id?: number;
    client_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.driver_id) params.append('driver_id', filters.driver_id.toString());
      if (filters?.client_id) params.append('client_id', filters.client_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.status) params.append('status', filters.status);

      const queryString = params.toString();
      // Use full path with /v1/ prefix for shared apiClient
      const url = queryString
        ? `/v1/transport/index.php?${queryString}`
        : '/v1/transport/index.php';

      console.log('=== TRANSPORT API DEBUG ===');
      console.log('Fetching transports with URL:', url);
      console.log('Filters:', filters);

      const response = await apiClient.get(url);
      console.log('Transport response:', response.data);
      console.log('===========================');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch transports',
      };
    }
  },

  // Create new transport
  createTransport: async (transportData: Partial<TransportLog>) => {
    try {
      const response = await apiClient.post('/v1/transport/create.php', transportData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create transport',
      };
    }
  },

  // Update transport
  updateTransport: async (transportId: number, transportData: Partial<TransportLog>) => {
    try {
      const response = await apiClient.put(
        `/v1/transport/update.php?id=${transportId}`,
        transportData
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update transport',
      };
    }
  },

  // Get transports for specific driver on specific date
  getDriverSchedule: async (driverId: number, date: string) => {
    return transportApi.getTransports({
      driver_id: driverId,
      start_date: date,
      end_date: date,
    });
  },

  // Get today's transports for driver
  getDriverTodaySchedule: async (driverId: number) => {
    const today = new Date().toISOString().split('T')[0];
    return transportApi.getDriverSchedule(driverId, today);
  },
};