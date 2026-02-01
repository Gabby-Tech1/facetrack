import { create } from "zustand";
import type { Session, CreateSessionDto, UpdateSessionDto } from "../types";
import { sessionsApi } from "../api/sessions.api";

// ============================================
// SESSION STORE TYPES
// ============================================

interface SessionState {
  // State
  sessions: Session[];
  mySessions: Session[];
  availableSessions: Session[];
  selectedSession: Session | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllSessions: () => Promise<void>;
  fetchMySessions: () => Promise<void>;
  fetchAvailableSessions: () => Promise<void>;
  createSession: (data: CreateSessionDto) => Promise<{ success: boolean; error?: string; session?: Session }>;
  updateSession: (sessionId: string, data: UpdateSessionDto) => Promise<{ success: boolean; error?: string }>;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  closeSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  toggleSessionMode: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  approveSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  disproveSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  setSelectedSession: (session: Session | null) => void;
  clearError: () => void;
}

// ============================================
// SESSION STORE
// ============================================

export const useSessionStore = create<SessionState>()((set, get) => ({
  // Initial State
  sessions: [],
  mySessions: [],
  availableSessions: [],
  selectedSession: null,
  isLoading: false,
  error: null,

  // Fetch all sessions (admin) - API returns { success, data: Session[] }
  fetchAllSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await sessionsApi.getAllSessionsAdmin();
      const data = response.data || [];
      set({ sessions: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch sessions";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Fetch my sessions (creator) - API returns { sessions: Session[] }
  fetchMySessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await sessionsApi.getCreatorSessions();
      const data = response.sessions || [];
      set({ mySessions: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch sessions";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Fetch available sessions for attendance - API returns { sessions: Session[] }
  fetchAvailableSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await sessionsApi.getAvailableSessions();
      const data = response.sessions || [];
      set({ availableSessions: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch available sessions";
      set({ isLoading: false, error: errorMessage });
    }
  },

  // Create session
  createSession: async (data: CreateSessionDto) => {
    set({ isLoading: true, error: null });

    try {
      const response = await sessionsApi.createSession(data);
      // Refresh sessions list
      await get().fetchMySessions();
      set({ isLoading: false });
      return { success: true, session: response.session };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update session
  updateSession: async (sessionId: string, data: UpdateSessionDto) => {
    set({ isLoading: true, error: null });

    try {
      await sessionsApi.updateSession(sessionId, data);
      // Refresh sessions list
      await get().fetchMySessions();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update session";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Delete session
  deleteSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      await sessionsApi.deleteSession(sessionId);
      // Refresh sessions list
      await get().fetchMySessions();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete session";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Close session
  closeSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      await sessionsApi.closeSession(sessionId);
      // Refresh sessions list
      await get().fetchMySessions();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to close session";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Toggle session mode
  toggleSessionMode: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      await sessionsApi.toggleSessionMode(sessionId);
      // Refresh sessions list
      await get().fetchMySessions();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to toggle mode";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Approve session
  approveSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      await sessionsApi.approveSession(sessionId);
      // Refresh sessions list
      await get().fetchAllSessions();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve session";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Disprove session
  disproveSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      await sessionsApi.disproveSession(sessionId);
      // Refresh sessions list
      await get().fetchAllSessions();
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject session";
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Set selected session
  setSelectedSession: (session: Session | null) => {
    set({ selectedSession: session });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
