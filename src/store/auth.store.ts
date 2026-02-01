import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Role, LoginDto, RegisterDto } from "../types";
import { authApi } from "../api/auth.api";
import { usersApi } from "../api/users.api";
import { clearRequestCache } from "../api/client";

// ============================================
// AUTH STORE TYPES
// ============================================

// Module-level deduplication to survive React Strict Mode
let fetchUserPromise: Promise<void> | null = null;
let lastFetchTime = 0;
let isInitializing = false;
const FETCH_DEBOUNCE_MS = 3000; // 3 seconds between fetches

interface AuthState {
  // State
  token: string | null;
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (data: LoginDto) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterDto) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  fetchCurrentUser: (freshToken?: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

// ============================================
// AUTH STORE
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Login action
      login: async (data: LoginDto) => {
        // CRITICAL: Clear localStorage FIRST to remove any persisted state from previous user
        localStorage.removeItem("facecheck-auth");
        
        // Clear request cache to avoid stale API responses
        clearRequestCache();
        
        // Reset fetch tracking for fresh login
        fetchUserPromise = null;
        lastFetchTime = 0;
        isInitializing = true; // Prevent initialize() from running
        
        // Clear ALL auth state before login attempt
        set({ 
          isLoading: true, 
          error: null,
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          isInitialized: true, // Mark as initialized to prevent App.tsx from calling initialize()
        });
        
        try {
          console.log("[Auth] Calling login API for:", data.email);
          const response = await authApi.login(data);
          console.log("[Auth] Login response - token received, role:", response.role);
          
          // Set token first
          set({
            token: response.token,
            isAuthenticated: true,
          });

          // Fetch full user data after login - pass token DIRECTLY to avoid stale token
          console.log("[Auth] Fetching user data with fresh token...");
          await get().fetchCurrentUser(response.token);
          
          const currentUser = get().user;
          console.log("[Auth] After fetch - user email:", currentUser?.email, "role:", currentUser?.role);
          
          set({ isLoading: false });

          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Login failed";
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            token: null,
            role: null,
            user: null,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Register action (students only)
      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          
          set({ isLoading: false, error: null });
          
          return { 
            success: true, 
            message: response.message || "Registration successful. Please verify your email." 
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: () => {
        // Clear localStorage completely
        localStorage.removeItem("facecheck-auth");
        
        // Clear request cache to avoid stale data on next login
        clearRequestCache();
        
        // Reset module-level flags
        fetchUserPromise = null;
        lastFetchTime = 0;
        isInitializing = false;
        
        set({
          token: null,
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isInitialized: false,
        });
      },

      // Fetch current user profile
      // Pass token directly for fresh login to avoid stale token issues
      // Uses debouncing and deduplication to prevent 429 errors
      fetchCurrentUser: async (freshToken?: string) => {
        const tokenToUse = freshToken || get().token;
        
        if (!tokenToUse) {
          return;
        }

        // For fresh token (new login), clear cache and bypass deduplication
        if (freshToken) {
          clearRequestCache();
          fetchUserPromise = null;
          lastFetchTime = 0;
        }

        // If there's already a fetch in progress, wait for it (deduplication)
        if (fetchUserPromise) {
          return fetchUserPromise;
        }

        // Debounce: skip if we fetched recently
        // Fresh token bypasses debounce but still respects deduplication above
        const now = Date.now();
        if (!freshToken && now - lastFetchTime < FETCH_DEBOUNCE_MS) {
          console.log("[Auth] Skipping fetch - debounced");
          return;
        }

        // Update last fetch time immediately to prevent concurrent calls
        lastFetchTime = now;
        set({ isLoading: true });
        
        fetchUserPromise = (async () => {
          try {
            console.log("[Auth] Making API call to get current user...");
            // Pass token directly to avoid interceptor using stale token
            const response = await usersApi.getCurrentUser(tokenToUse);
            
            console.log("[Auth] API response user:", response.user?.email, response.user?.role);
            
            set({
              user: response.user,
              role: response.user.role,
              isLoading: false,
            });
            
            console.log("[Auth] Store updated with user:", response.user?.email);
          } catch (error) {
            console.error("Failed to fetch user:", error);
            // Only logout if it's not a rate limit error - user can retry
            const errorMessage = error instanceof Error ? error.message : "";
            if (!errorMessage.includes("Too Many Requests") && !errorMessage.includes("429")) {
              get().logout();
            } else {
              set({ isLoading: false });
            }
          } finally {
            // Keep promise reference for a short time to catch rapid calls
            setTimeout(() => {
              fetchUserPromise = null;
            }, 100);
          }
        })();

        return fetchUserPromise;
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Initialize auth state (called on app load)
      initialize: async () => {
        // Module-level guard to prevent React Strict Mode double-initialization
        if (isInitializing || get().isInitialized) {
          return;
        }
        isInitializing = true;
        
        const { token, isAuthenticated } = get();
        
        if (token && isAuthenticated) {
          await get().fetchCurrentUser();
        }
        
        set({ isInitialized: true });
        // Keep isInitializing true to prevent any further calls
      },
    }),
    {
      name: "facecheck-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectRole = (state: AuthState) => state.role;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectToken = (state: AuthState) => state.token;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
