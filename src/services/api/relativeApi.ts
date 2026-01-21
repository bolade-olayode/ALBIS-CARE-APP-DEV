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

export const relativeApi = {
  createRelative: async (relativeData: CreateRelativeData) => {
    try {
      const url = `${API_CONFIG.BASE_URL}/v1/relative/create.php`; // ✅ FIXED: Removed duplicate /api
      
      console.log('=== RELATIVE API DEBUG ===');
      console.log('Full URL:', url);
      console.log('========================');

      const response = await apiClient.post(
        url,
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
      console.error('=== RELATIVE API ERROR ===');
      console.error('Error:', error.response?.data || error.message);
      console.error('========================');
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create family member account'
      };
    }
  },
};