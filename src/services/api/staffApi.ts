// src/services/api/staffApi.ts

import apiClient from './apiClient';

export interface Staff {
  id: number;
  user_id?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  role_id: number;
  role_name?: string;
  address_line1?: string;
  address_line2?: string;
  town?: string;
  postcode?: string;
  employment_type?: string;
  joined_date?: string;
  status: string;
  pvg_number?: string;
  sssc_number?: string;
  qualifications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at?: string;
}

interface StaffResponse {
  success: boolean;
  message?: string;
  data?: {
    staff: Staff[];
    total: number;
  };
}

export const staffApi = {
  // Get all staff
  getStaff: async (): Promise<StaffResponse> => {
    try {
      const response = await apiClient.get('/v1/staff/');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to fetch staff');
    }
  },

  // Get single staff member
  getStaffMember: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.get(`/v1/staff/get.php?id=${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to fetch staff member');
    }
  },

  // Search staff
  searchStaff: async (query: string): Promise<StaffResponse> => {
    try {
      const response = await apiClient.get(`/v1/staff/?search=${query}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to search staff');
    }
  },

  // Create new staff
  createStaff: async (staffData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/staff/create.php', staffData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to create staff');
    }
  },

  // Update staff
  updateStaff: async (id: number, staffData: any): Promise<any> => {
    try {
      const response = await apiClient.put(`/v1/staff/update.php?id=${id}`, staffData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to update staff');
    }
  },

  // Delete staff
  deleteStaff: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.delete(`/v1/staff/delete.php?id=${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to delete staff');
    }
  },
};