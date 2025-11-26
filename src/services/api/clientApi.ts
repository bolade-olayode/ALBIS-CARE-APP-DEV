// src/services/api/clientApi.ts

import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api';

export interface Client {
  eNo: number;
  cFName: string;
  cLName: string;
  cAddr1: string;
  cAddr2?: string;
  cTown?: string;
  cPostCode: string;
  cTel: string;
  cMobile?: string;
  cEmail?: string;
  cGender: string;
  care_level?: string;
  date_of_birth?: string;
  status?: string;
  created_at?: string;
}

export interface ClientsResponse {
  success: boolean;
  message?: string;
  data?: {
    clients: Client[];
    total: number;
  };
}

export const clientApi = {
  // Get all clients
  getClients: async (): Promise<ClientsResponse> => {
    try {
      const response = await apiClient.get<ClientsResponse>('/v1/clients');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to fetch clients');
    }
  },

  // Get single client
  getClient: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.get(`/v1/clients/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to fetch client');
    }
  },

  // Search clients
  searchClients: async (query: string): Promise<ClientsResponse> => {
    try {
      const response = await apiClient.get<ClientsResponse>(`/v1/clients/search?q=${query}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to search clients');
    }
  },
};