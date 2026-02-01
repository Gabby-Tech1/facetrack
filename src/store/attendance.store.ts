import { create } from "zustand";
import type { Attendance } from "../types";
import { attendanceApi } from "../api/attendance.api";

// ============================================
// ATTENDANCE STORE TYPES
// ============================================

interface AttendanceState {
  // State
  attendances: Attendance[];
  myAttendances: Attendance[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllAttendances: () => Promise<void>;
  fetchMyAttendances: () => Promise<void>;
  markAttendance: (sessionId: string, faceImage: File, source?: "kiosk" | "mobile") => Promise<{ success: boolean; error?: string; attendance?: Attendance }>;
  clearError: () => void;
}

// ============================================
// ATTENDANCE STORE
// ============================================

export const useAttendanceStore = create<AttendanceState>()((set) => ({
  // Initial State
  attendances: [],
  myAttendances: [],
  isLoading: false,
  error: null,

  // Fetch all attendances (admin)
  fetchAllAttendances: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await attendanceApi.getAllAttendances();
      set({ attendances: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch attendances";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Fetch my attendances
  fetchMyAttendances: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await attendanceApi.getUserAttendance();
      set({ myAttendances: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch attendances";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Mark attendance with face recognition
  markAttendance: async (sessionId: string, faceImage: File, source: "kiosk" | "mobile" = "mobile") => {
    set({ isLoading: true, error: null });

    try {
      const response = await attendanceApi.markAttendance(sessionId, faceImage, source);
      set({ isLoading: false });
      return { success: true, attendance: response.attendance };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark attendance";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
