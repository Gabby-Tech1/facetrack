import apiClient from "./client";
import type {
  Session,
  CreateSessionDto,
  UpdateSessionDto,
  ApiResponse,
} from "../types";

/**
 * Sessions API endpoints
 * Matches backend: src/sessions/sessions.controller.ts
 */
export const sessionsApi = {
  /**
   * Create a new session
   * POST /sessions/create
   * Roles: ADMIN, LECTURER, REP
   */
  createSession: async (data: CreateSessionDto): Promise<ApiResponse & { session?: Session }> => {
    const response = await apiClient.post<ApiResponse & { session?: Session }>("/sessions/create", data);
    return response.data;
  },

  /**
   * Close a session
   * GET /sessions/close?sessionId=xxx
   * Roles: ADMIN, LECTURER, REP
   */
  closeSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/sessions/close", {
      params: { sessionId },
    });
    return response.data;
  },

  /**
   * Get all sessions (admin only)
   * GET /sessions/admin/all-sessions
   * Roles: ADMIN, SYSTEM_ADMIN
   * Returns: { success: boolean, data: Session[] }
   */
  getAllSessionsAdmin: async (): Promise<{ success: boolean; data: Session[] }> => {
    // Add timestamp to bust any browser/proxy cache
    const response = await apiClient.get<{ success: boolean; data: Session[] }>("/sessions/admin/all-sessions", {
      params: { _t: Date.now() }
    });
    return response.data;
  },

  /**
   * Get sessions created by current user
   * GET /sessions/creator-sessions
   * Roles: LECTURER, REP (NOT ADMIN - service denies it)
   * Returns: { sessions: Session[] }
   */
  getCreatorSessions: async (): Promise<{ sessions: Session[] }> => {
    // Add timestamp to bust any browser/proxy cache
    const response = await apiClient.get<{ sessions: Session[] }>("/sessions/creator-sessions", {
      params: { _t: Date.now() }
    });
    return response.data;
  },

  /**
   * Get available open sessions for attendance
   * GET /sessions/available-sessions
   * Roles: All authenticated
   * Returns: { sessions: Session[] }
   */
  getAvailableSessions: async (): Promise<{ sessions: Session[] }> => {
    const response = await apiClient.get<{ sessions: Session[] }>("/sessions/available-sessions", {
      params: { _t: Date.now() }
    });
    return response.data;
  },

  /**
   * Toggle session mode (CHECK_IN <-> CHECK_OUT)
   * GET /sessions/toggle-mode?sessionId=xxx
   * Roles: All authenticated
   */
  toggleSessionMode: async (sessionId: string): Promise<ApiResponse & { session?: Session }> => {
    const response = await apiClient.get<ApiResponse & { session?: Session }>("/sessions/toggle-mode", {
      params: { sessionId },
    });
    return response.data;
  },

  /**
   * Delete a session
   * DELETE /sessions/delete?sessionId=xxx
   * Roles: All authenticated (creator only)
   */
  deleteSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>("/sessions/delete", {
      params: { sessionId },
    });
    return response.data;
  },

  /**
   * Update a session
   * PATCH /sessions/update?sessionId=xxx
   * Roles: All authenticated (creator only)
   */
  updateSession: async (sessionId: string, data: UpdateSessionDto): Promise<ApiResponse & { session?: Session }> => {
    const response = await apiClient.patch<ApiResponse & { session?: Session }>(
      "/sessions/update",
      data,
      { params: { sessionId } }
    );
    return response.data;
  },

  /**
   * Approve a session (admin only)
   * GET /sessions/approve?sessionId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN
   */
  approveSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/sessions/approve", {
      params: { sessionId },
    });
    return response.data;
  },

  /**
   * Disprove/reject a session (admin only)
   * GET /sessions/disprove?sessionId=xxx
   * Roles: ADMIN, SYSTEM_ADMIN
   */
  disproveSession: async (sessionId: string): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>("/sessions/disprove", {
      params: { sessionId },
    });
    return response.data;
  },
};
