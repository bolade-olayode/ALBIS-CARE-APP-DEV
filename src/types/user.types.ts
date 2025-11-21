// src/types/user.types.ts

export interface User {
  userId: string;
  email: string;
  userType: 'staff' | 'relative';
}

export interface Staff {
  staffId: string;
  firstName: string;
  lastName: string;
  roleId: number;
  roleName: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
    staff?: Staff;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  staff: Staff | null;
  token: string | null;
}