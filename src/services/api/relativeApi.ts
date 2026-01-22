// src/services/api/relativeApi.ts

import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api';

export interface CreateRelativeData {
  client_id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  title?: string;
  relationship: string;
  phone?: string;
  mobile?: string;
  relative_email?: string;
  is_primary_contact?: boolean;
  is_emergency_contact?: boolean;
  can_receive_updates?: boolean;
  can_view_reports?: boolean;
  can_view_visit_logs?: boolean;
}

export interface UpdateRelativeData {
  first_name?: string;
  last_name?: string;
  title?: string;
  relationship?: string;
  phone?: string;
  mobile?: string;
  is_primary_contact?: boolean;
  is_emergency_contact?: boolean;
  can_receive_updates?: boolean;
  can_view_reports?: boolean;
  can_view_visit_logs?: boolean;
  new_password?: string; // For password reset
}

export interface Relative {
  rNo: number;
  user_id: string;
  cNo: number;
  rFName: string;
  rLName: string;
  rTitle: string;
  relationship: string;
  rEmail: string;
  rTel: string;
  rMobile: string;
  is_primary_contact: number;
  is_emergency_contact: number;
  can_receive_updates: number;
  can_view_reports: number;
  can_view_visit_logs: number;
  created_at: string;
  updated_at: string;
  login_email: string;
  account_status: string;
  last_login?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_title?: string;
}

export const relativeApi = {
  // Create a new relative account linked to a client
  createRelative: async (relativeData: CreateRelativeData) => {
    try {
      const response = await apiClient.post(
        `${API_CONFIG.BASE_URL}/v1/relative/create.php`,
        {
          ...relativeData,
          is_primary_contact: relativeData.is_primary_contact ? 1 : 0,
          is_emergency_contact: relativeData.is_emergency_contact ? 1 : 0,
          can_receive_updates: relativeData.can_receive_updates !== false ? 1 : 0,
          can_view_reports: relativeData.can_view_reports !== false ? 1 : 0,
          can_view_visit_logs: relativeData.can_view_visit_logs !== false ? 1 : 0,
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create family member account'
      };
    }
  },

  // Get list of relatives for a specific client
  getRelativesByClient: async (clientId: number) => {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.BASE_URL}/v1/relative/list.php?client_id=${clientId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch relatives'
      };
    }
  },

  // Get single relative details
  getRelative: async (relativeId: number) => {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.BASE_URL}/v1/relative/get.php?id=${relativeId}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch relative details'
      };
    }
  },

  // Update relative information and permissions
  updateRelative: async (relativeId: number, updateData: UpdateRelativeData) => {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.BASE_URL}/v1/relative/update.php?id=${relativeId}`,
        {
          ...updateData,
          is_primary_contact: updateData.is_primary_contact !== undefined ? (updateData.is_primary_contact ? 1 : 0) : undefined,
          is_emergency_contact: updateData.is_emergency_contact !== undefined ? (updateData.is_emergency_contact ? 1 : 0) : undefined,
          can_receive_updates: updateData.can_receive_updates !== undefined ? (updateData.can_receive_updates ? 1 : 0) : undefined,
          can_view_reports: updateData.can_view_reports !== undefined ? (updateData.can_view_reports ? 1 : 0) : undefined,
          can_view_visit_logs: updateData.can_view_visit_logs !== undefined ? (updateData.can_view_visit_logs ? 1 : 0) : undefined,
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update relative'
      };
    }
  },

  // Deactivate relative account (soft delete)
  deactivateRelative: async (relativeId: number) => {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.BASE_URL}/v1/relative/toggle-status.php?id=${relativeId}`,
        { action: 'deactivate' }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to deactivate relative'
      };
    }
  },

  // Reactivate relative account
  reactivateRelative: async (relativeId: number) => {
    try {
      const response = await apiClient.put(
        `${API_CONFIG.BASE_URL}/v1/relative/toggle-status.php?id=${relativeId}`,
        { action: 'reactivate' }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to reactivate relative'
      };
    }
  },
};