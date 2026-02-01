import apiClient, { createFormDataClient, deduplicatedGet, clearRequestCache } from "./client";
import type {
  UserResponse,
  UsersResponse,
  StudentsResponse,
  UpdateUserDto,
  EnrollUserDto,
  UpdateThresholdsDto,
  CreateAdminDto,
  JobStatusResponse,
  ApiResponse,
  Thresholds,
} from "../types";

/**
 * Users API endpoints
 * Matches backend: src/users/users.controller.ts
 */
export const usersApi = {
  /**
   * Get current user by ID (from JWT)
   * GET /users/by-id
   * Roles: All authenticated
   * @param token - Optional token to use instead of store token (for fresh login)
   */
  getCurrentUser: async (token?: string): Promise<UserResponse> => {
    // IMPORTANT: Clear cache before fetching to avoid stale user data
    clearRequestCache();
    
    const config: { 
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {
      // Add cache-busting parameter to prevent browser caching
      params: { _t: Date.now().toString() }
    };
    
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    
    console.log("[API] getCurrentUser - making request with token:", token ? token.substring(0, 20) + "..." : "from store");
    
    // Use by-id endpoint - more reliable than by-email
    const response = await apiClient.get<UserResponse>("/users/by-id", config);
    
    console.log("[API] getCurrentUser - response:", response.data.user?.email, response.data.user?.role);
    
    return response.data;
  },

  /**
   * Get current user by ID (from JWT)
   * GET /users/by-id
   * Roles: All authenticated
   */
  getUserById: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>("/users/by-id");
    return response.data;
  },

  /**
   * Get all users
   * GET /users/all
   * Roles: All authenticated
   */
  getAllUsers: async (): Promise<UsersResponse> => {
    return deduplicatedGet<UsersResponse>("/users/all");
  },

  /**
   * Fetch all students
   * GET /users/fetch-students
   * Roles: ADMIN, SYSTEM_ADMIN, STAFF, LECTURER
   */
  fetchStudents: async (): Promise<StudentsResponse> => {
    const response = await apiClient.get<StudentsResponse>("/users/fetch-students");
    return response.data;
  },

  /**
   * Update user details (name, phone)
   * PATCH /users/update
   * Roles: All authenticated
   */
  updateUserDetails: async (data: UpdateUserDto): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>("/users/update", data);
    return response.data;
  },

  /**
   * Update role-specific records
   * PATCH /users/update-records
   * Roles: ADMIN, SYSTEM_ADMIN, STUDENT
   */
  updateRecords: async (data: Partial<EnrollUserDto>): Promise<ApiResponse> => {
    const response = await apiClient.patch<ApiResponse>("/users/update-records", data);
    return response.data;
  },

  /**
   * Enroll user with face image
   * POST /users/enroll
   * Roles: ADMIN, SYSTEM_ADMIN, STUDENT
   * Note: Multipart form data with 'face' file
   */
  enrollUser: async (data: EnrollUserDto, faceImage: File): Promise<ApiResponse & { jobId?: string }> => {
    const formDataClient = createFormDataClient();
    const formData = new FormData();
    
    // Append all data fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // For arrays, append each item individually
          // Using key name without brackets for NestJS compatibility
          value.forEach((item) => formData.append(key, String(item)));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append face image with proper file properties
    formData.append("face", faceImage, faceImage.name);
    
    const response = await formDataClient.post<ApiResponse & { jobId?: string }>("/users/enroll", formData);
    return response.data;
  },

  /**
   * Get job status for image processing
   * GET /users/job-status?jobId=xxx
   * Roles: All authenticated
   */
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await apiClient.get<JobStatusResponse>("/users/job-status", {
      params: { jobId },
    });
    return response.data;
  },

  /**
   * Remove a user
   * DELETE /users/remove?email=xxx
   * Roles: ADMIN, SYSTEM_ADMIN
   */
  removeUser: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>("/users/remove", {
      params: { email },
    });
    return response.data;
  },

  /**
   * Assign course representative
   * GET /users/assign-rep?courseId=xxx&studentId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN, LECTURER
   */
  assignRep: async (courseId: string, studentId: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/users/assign-rep", {
      params: { courseId, studentId },
    });
    return response.data;
  },

  /**
   * Remove course representative
   * DELETE /users/remove/rep?courseId=xxx&studentId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN, LECTURER
   */
  removeRep: async (courseId: string, studentId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>("/users/remove/rep", {
      params: { courseId, studentId },
    });
    return response.data;
  },

  /**
   * Create admin user (requires secret code)
   * POST /users/create-admin?secretCode=xxx
   * Roles: Public (but requires secret code)
   */
  createAdmin: async (data: CreateAdminDto, secretCode: string): Promise<ApiResponse & { tempPassword?: string }> => {
    const response = await apiClient.post<ApiResponse & { tempPassword?: string }>(
      "/users/create-admin",
      data,
      { params: { secretCode } }
    );
    return response.data;
  },

  /**
   * Update thresholds for lecturer/rep
   * POST /users/update-thresholds
   * Roles: LECTURER, REP
   */
  updateThresholds: async (data: UpdateThresholdsDto): Promise<{ message: string; thresholds: Thresholds }> => {
    const response = await apiClient.post<{ message: string; thresholds: Thresholds }>(
      "/users/update-thresholds",
      data
    );
    return response.data;
  },
};
