// src/types/index.ts

export type UserType = 'staff' | 'relative';

export type UserRole = 'Admin' | 'Coordinator' | 'Carer' | 'Driver';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  userId: string;
  email: string;
  userType: UserType;
  status: UserStatus;
  createdAt: Date;
  lastLogin?: Date;
  fcmToken?: string;
}

export interface Staff {
  staffId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mobile: string;
  roleId: number;
  roleName: UserRole;
  address: Address;
  employmentType: 'full_time' | 'part_time' | 'contract';
  joinedDate: Date;
  status: UserStatus;
}

export interface Address {
  line1: string;
  line2?: string;
  town: string;
  postCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Client {
  clientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  careLevel: 'low' | 'medium' | 'high' | 'complex';
  address: Address;
  phone?: string;
  mobile?: string;
  medicalConditions: string[];
  medications: string[];
  status: 'active' | 'on_hold' | 'discharged';
  assignedCoordinator: string;
  createdAt: Date;
}

export interface CareVisit {
  visitId: string;
  clientId: string;
  clientName: string;
  visitType: 'personal_care' | 'medication' | 'meal_prep' | 'companionship' | 'domestic';
  scheduledDate: Date;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  assignedCarerId?: string;
  carerName?: string;
  assignedDriverId?: string;
  requiresTransport: boolean;
  tasksRequired: Task[];
  actualStartTime?: Date;
  actualEndTime?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface Task {
  taskId: string;
  name: string;
  description?: string;
  completed: boolean;
}

export interface Relative {
  relativeId: string;
  userId: string;
  clientId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone?: string;
  mobile: string;
  isPrimaryContact: boolean;
}