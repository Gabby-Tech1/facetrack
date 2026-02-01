import { createFormDataClient } from "./client";
import apiClient from "./client";
import type { Attendance, ApiResponse } from "../types";

/**
 * Attendance API endpoints
 * Matches backend: src/attendance/attendance.controller.ts
 */
export const attendanceApi = {
  /**
   * Mark attendance with face recognition
   * POST /attendance/mark?source=xxx&sessionId=xxx
   * Note: Uses multipart form data with 'face' file
   * Roles: Public (face recognition identifies the user)
   */
  markAttendance: async (
    sessionId: string,
    faceImage: File,
    source: "kiosk" | "mobile" = "mobile"
  ): Promise<ApiResponse & { attendance?: Attendance; score?: number }> => {
    const formDataClient = createFormDataClient();
    const formData = new FormData();
    formData.append("face", faceImage);

    const response = await formDataClient.post<ApiResponse & { attendance?: Attendance; score?: number }>(
      `/attendance/mark?sessionId=${sessionId}&source=${source}`,
      formData
    );
    return response.data;
  },

  /**
   * Get current user's attendance records
   * GET /attendance/user-attendance
   * Roles: All authenticated
   * Returns: Attendance[] (array directly)
   */
  getUserAttendance: async (): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>("/attendance/user-attendance", {
      params: { _t: Date.now() }
    });
    return response.data;
  },

  /**
   * Get all attendance records (admin only)
   * GET /attendance/all-attendances
   * Roles: ADMIN, SYSTEM_ADMIN
   * Returns: Attendance[] (array directly)
   */
  getAllAttendances: async (): Promise<Attendance[]> => {
    const response = await apiClient.get<Attendance[]>("/attendance/all-attendances");
    return response.data;
  },
};
