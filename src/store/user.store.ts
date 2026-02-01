import { create } from "zustand";
import type { User, Student, UpdateUserDto, EnrollUserDto } from "../types";
import { usersApi } from "../api/users.api";

// ============================================
// USER STORE TYPES
// ============================================

interface UserState {
  // State
  users: User[];
  students: Student[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllUsers: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  updateUserDetails: (data: UpdateUserDto) => Promise<{ success: boolean; error?: string }>;
  updateRecords: (data: Partial<EnrollUserDto>) => Promise<{ success: boolean; error?: string }>;
  enrollUser: (data: EnrollUserDto, faceImage: File) => Promise<{ success: boolean; error?: string; jobId?: string }>;
  removeUser: (email: string) => Promise<{ success: boolean; error?: string }>;
  assignRep: (courseId: string, studentId: string) => Promise<{ success: boolean; error?: string }>;
  removeRep: (courseId: string, studentId: string) => Promise<{ success: boolean; error?: string }>;
  setSelectedUser: (user: User | null) => void;
  clearError: () => void;
}

// ============================================
// USER STORE
// ============================================

export const useUserStore = create<UserState>()((set, get) => ({
  // Initial State
  users: [],
  students: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  // Fetch all users
  fetchAllUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.getAllUsers();
      set({ users: response.users, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Fetch all students
  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.fetchStudents();
      set({ students: response.students, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch students";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Update user details
  updateUserDetails: async (data: UpdateUserDto) => {
    set({ isLoading: true, error: null });
    
    try {
      await usersApi.updateUserDetails(data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update role-specific records
  updateRecords: async (data: Partial<EnrollUserDto>) => {
    set({ isLoading: true, error: null });
    
    try {
      await usersApi.updateRecords(data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update records";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Enroll user with face image
  enrollUser: async (data: EnrollUserDto, faceImage: File) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.enrollUser(data, faceImage);
      set({ isLoading: false });
      return { success: true, jobId: response.jobId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to enroll user";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Remove user
  removeUser: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await usersApi.removeUser(email);
      // Refresh users list
      await get().fetchAllUsers();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove user";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Assign course rep
  assignRep: async (courseId: string, studentId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await usersApi.assignRep(courseId, studentId);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign rep";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Remove course rep
  removeRep: async (courseId: string, studentId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await usersApi.removeRep(courseId, studentId);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove rep";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Set selected user
  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
