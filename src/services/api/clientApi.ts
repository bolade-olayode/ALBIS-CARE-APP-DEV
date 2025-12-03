// src/services/api/clientApi.ts

import apiClient from './apiClient';
import { API_CONFIG } from '../../config/api';

export interface Client {
  cNo: number;
  cFName: string;
  cLName: string;
  cAddr1: string;
  cAddr2?: string;
  cTown?: string;
  cPostCode: string;
  cTel: string;
  cMobile?: string;
  cTitle?: string;
  cEmail?: string;
  cGender: string;
  cCarePlan?: string;
  cRemarks?: string;
  rNo?: number;
  gNo?: number;
  NHSNo?: string;
  cSDate?: string;
  cEDate?: string;
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
    const response = await apiClient.get(`/v1/clients/get.php?id=${id}`);
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
   createClient: async (clientData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/clients/create.php', clientData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error('Failed to create client');
    }
  },
  // Update existing client
updateClient: async (id: number, clientData: any): Promise<any> => {
  try {
    const response = await apiClient.put(`/v1/clients/update.php?id=${id}`, clientData);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('Failed to update client');
  }
},

// Delete client
deleteClient: async (id: number): Promise<any> => {
  try {
    const response = await apiClient.delete(`/v1/clients/delete.php?id=${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw new Error('Failed to delete client');
  }
},
};