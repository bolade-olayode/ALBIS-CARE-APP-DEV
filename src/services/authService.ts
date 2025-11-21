// src/services/authService.ts
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Staff, Relative } from '../types';

export interface AuthResponse {
  success: boolean;
  user?: User;
  staff?: Staff;
  relative?: Relative;
  error?: string;
}

// Login function
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return {
        success: false,
        error: 'User profile not found'
      };
    }

    const userData = userDoc.data() as User;

    // Update last login
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastLogin: new Date()
    });

    // Get staff or relative info based on userType
    if (userData.userType === 'staff') {
      const staffDoc = await getDoc(doc(db, 'staff', firebaseUser.uid));
      const staffData = staffDoc.data() as Staff;

      return {
        success: true,
        user: userData,
        staff: staffData
      };
    } else {
      const relativeDoc = await getDoc(doc(db, 'relatives', firebaseUser.uid));
      const relativeData = relativeDoc.data() as Relative;

      return {
        success: true,
        user: userData,
        relative: relativeData
      };
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

// Logout function
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

// Change password
export async function changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: getAuthErrorMessage(error.code)
    };
  }
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// Helper function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}