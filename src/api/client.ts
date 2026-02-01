import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store";


// Get base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// REQUEST DEDUPLICATION CACHE
// Prevents duplicate requests caused by React Strict Mode
// ============================================
interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
}

const requestCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 2000; // 2 seconds - matches typical Strict Mode double-invoke window

// Generate cache key from request config
const getCacheKey = (method: string, url: string): string => {
  return `${method}:${url}`;
};

// Cleanup expired cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
};

// Clear all request cache - call on login/logout
export const clearRequestCache = () => {
  requestCache.clear();
};

// Deduplicated GET request helper
export const deduplicatedGet = async <T>(url: string): Promise<T> => {
  cleanupCache();
  
  const cacheKey = getCacheKey("GET", url);
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.promise as Promise<T>;
  }
  
  const promise = apiClient.get<T>(url).then(res => res.data);
  requestCache.set(cacheKey, { promise, timestamp: Date.now() });
  
  // Remove from cache after resolution (success or failure)
  promise.finally(() => {
    setTimeout(() => requestCache.delete(cacheKey), CACHE_TTL);
  });
  
  return promise;
};

// ============================================
// AXIOS CLIENT SETUP
// ============================================

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only add token from store if Authorization header is NOT already set
    // This allows explicit token passing to take precedence (e.g., during fresh login)
    if (config.headers && !config.headers.Authorization) {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401) {
      const authStore = useAuthStore.getState();
      authStore.logout();
      
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login") && 
          !window.location.pathname.includes("/signup") &&
          !window.location.pathname.includes("/verify-email")) {
        window.location.href = "/";
      }
    }
    
    // Extract error message from response
    const errorMessage = 
      (error.response?.data as { message?: string })?.message || 
      error.message || 
      "An unexpected error occurred";
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;

// Helper for multipart form data requests (file uploads)
export const createFormDataClient = () => {
  const formDataClient = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    // DO NOT set Content-Type header for FormData!
    // Axios will automatically set it with the correct boundary
    timeout: 60000, // 60 seconds for file uploads
  });

  // Add same interceptors
  formDataClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().token;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  formDataClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      
      if (status === 401) {
        useAuthStore.getState().logout();
        window.location.href = "/";
      }
      
      const errorMessage = 
        (error.response?.data as { message?: string })?.message || 
        error.message || 
        "An unexpected error occurred";
      
      return Promise.reject(new Error(errorMessage));
    }
  );

  return formDataClient;
};
