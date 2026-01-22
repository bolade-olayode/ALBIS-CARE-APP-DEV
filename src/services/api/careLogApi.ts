// src/services/api/careLogApi.ts

import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api';

export interface CareLog {
  log_id?: number;
  client_id: number;
  staff_id: number;
  visit_date: string;
  visit_time: string;
  duration_minutes?: number;
  visit_type?: string;
  personal_care?: boolean;
  medication?: boolean;
  meal_preparation?: boolean;
  housekeeping?: boolean;
  companionship?: boolean;
  temperature?: string;
  blood_pressure?: string;
  heart_rate?: string;
  activities_performed?: string;
  client_mood?: string;
  notes?: string;
  concerns?: string;
  follow_up_required?: boolean;
  follow_up_notes?: string;
  status?: string;
  client_name?: string;
  staff_name?: string;
  care_level?: string;
  role_name?: string;
}

export interface CareLogFilters {
  client_id?: number;
  staff_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const careLogApi = {
  // Get all logs with optional filters
  getLogs: async (filters?: CareLogFilters) => {
    try {
      const params = new URLSearchParams();

      if (filters?.client_id) params.append('client_id', filters.client_id.toString());
      if (filters?.staff_id) params.append('staff_id', filters.staff_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `${API_CONFIG.ENDPOINTS.LOGS}/index.php${queryString ? '?' + queryString : ''}`;

      // Use apiClient to automatically include Authorization header
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch logs'
      };
    }
  },

  // Get single log
  getLog: async (logId: number) => {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.LOGS}/get.php?id=${logId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch log'
      };
    }
  },

  // Create new log
  createLog: async (logData: CareLog) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.LOGS}/create.php`, logData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create log'
      };
    }
  },

  // Alias for createLog (for compatibility)
  createCareLog: async (logData: CareLog) => {
    try {
      const response = await apiClient.post(`${API_CONFIG.ENDPOINTS.LOGS}/create.php`, logData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create log'
      };
    }
  },

  // Update log
  updateLog: async (logId: number, logData: CareLog) => {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.ENDPOINTS.LOGS}/update.php?id=${logId}`,
        logData
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update log'
      };
    }
  },

  // Delete log
  deleteLog: async (logId: number) => {
    try {
      const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.LOGS}/delete.php?id=${logId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete log'
      };
    }
  },
};