// src/services/api/visitApi.ts

import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api';

export interface ScheduledVisit {
  visit_id?: number;
  client_id: number;
  staff_id: number;
  visit_date: string;
  visit_time: string;
  estimated_duration?: number;
  visit_type?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_end_date?: string;
  service_type?: string;
  special_instructions?: string;
  priority?: string;
  status?: string;
  care_log_id?: number;
  notes?: string;
  cancellation_reason?: string;
  client_name?: string;
  staff_name?: string;
  care_level?: string;
  role_name?: string;
}

export interface VisitFilters {
  client_id?: number;
  staff_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export const visitApi = {
  // Get all visits with optional filters
  getVisits: async (filters?: VisitFilters) => {
    try {
      const params = new URLSearchParams();

      if (filters?.client_id) params.append('client_id', filters.client_id.toString());
      if (filters?.staff_id) params.append('staff_id', filters.staff_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.status) params.append('status', filters.status);

      const queryString = params.toString();
      const url = `${API_CONFIG.ENDPOINTS.VISITS}/index.php${queryString ? '?' + queryString : ''}`;

      // Use apiClient to automatically include Authorization header
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch visits'
      };
    }
  },

  // Get single visit
  getVisit: async (visitId: number) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.VISITS}/get.php?id=${visitId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch visit'
      };
    }
  },

  // Create new visit
  createVisit: async (visitData: ScheduledVisit) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.VISITS}/create.php`, visitData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create visit'
      };
    }
  },

  // Update visit
  updateVisit: async (visitId: number, visitData: ScheduledVisit) => {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.VISITS}/update.php?id=${visitId}`,
        visitData
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update visit'
      };
    }
  },

  // Delete visit
  deleteVisit: async (visitId: number) => {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.VISITS}/delete.php?id=${visitId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete visit'
      };
    }
  },
  
  // Get visits for specific staff member
  getStaffVisits: async (staffId: number, startDate: string, endDate: string) => {
    return visitApi.getVisits({
      staff_id: staffId,
      start_date: startDate,
      end_date: endDate,
     }
   );
  },
};