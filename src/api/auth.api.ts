import apiClient from "./client";
import type { 
  LoginDto, 
  LoginResponse, 
  RegisterDto, 
  RegisterResponse,
  ResetPasswordDto,
  ApiResponse 
} from "../types";

/**
 * Auth API endpoints
 * Matches backend: src/auth/auth.controller.ts
 */
export const authApi = {
  /**
   * Register a new student user
   * POST /auth/register
   * Note: Only STUDENT role can self-register
   */
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  /**
   * Login user and get JWT token
   * POST /auth/login
   * Returns: { token: string, role: Role }
   */
  login: async (data: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * Verify email with code
   * GET /auth/verify-email?code=xxx&email=xxx
   */
  verifyEmail: async (email: string, code: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/auth/verify-email", {
      params: { email, code },
    });
    return response.data;
  },

  /**
   * Request password reset code (sent via SMS)
   * GET /auth/request-reset-code
   * Requires: JWT token
   */
  requestResetCode: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/auth/request-reset-code");
    return response.data;
  },

  /**
   * Reset password with code
   * POST /auth/reset-password?resetCode=xxx
   * Requires: JWT token
   */
  resetPassword: async (data: ResetPasswordDto, resetCode?: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(
      "/auth/reset-password",
      data,
      { params: resetCode ? { resetCode } : undefined }
    );
    return response.data;
  },
};
