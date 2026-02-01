import "./App.css";
import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";
import { Toaster } from "sonner";

// Auth
import { DataProvider } from "./contexts/DataContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { FaceDetectionProvider } from "./contexts/FaceDetectionContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/auth.store";
import { Role } from "./types";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Sessions from "./pages/sessions/Sessions";
import Courses from "./pages/courses/Courses";
import StudentCourses from "./pages/courses/StudentCourses";
import Attendance from "./pages/attendance/Attendance";
import MarkAttendance from "./pages/attendance/MarkAttendance";
import Analytics from "./pages/analytics/Analytics";
import Earnings from "./pages/earnings/Earnings";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";
import Users from "./pages/users/Users";

const App: React.FC = () => {
  const { token, initialize, isInitialized, user, isLoading } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Show loading state while initializing or fetching user
  if (!isInitialized || (token && isLoading && !user)) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <FaceDetectionProvider autoLoad={false}>
      <DataProvider>
        <SidebarProvider>
          <ThemeProvider defaultTheme="light" attribute="class">
            <Toaster richColors position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes - All Roles */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Protected Routes - Specific Roles */}
              <Route path="/sessions" element={<ProtectedRoute allowedRoles={[Role.LECTURER, Role.STUDENT, Role.REP, Role.ADMIN, Role.SYSTEM_ADMIN]}><Sessions /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute allowedRoles={[Role.LECTURER, Role.SYSTEM_ADMIN, Role.ADMIN]}><Courses /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute allowedRoles={[Role.STUDENT, Role.REP]}><StudentCourses /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute allowedRoles={[Role.LECTURER, Role.STUDENT, Role.REP, Role.ADMIN, Role.SYSTEM_ADMIN]}><Attendance /></ProtectedRoute>} />
              <Route path="/mark-attendance" element={<ProtectedRoute allowedRoles={[Role.LECTURER, Role.STUDENT, Role.REP, Role.STAFF]}><MarkAttendance /></ProtectedRoute>} />
              <Route path="/earnings" element={<ProtectedRoute allowedRoles={[Role.LECTURER]}><Earnings /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/users" element={<ProtectedRoute allowedRoles={[Role.SYSTEM_ADMIN, Role.ADMIN]}><Users /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={[Role.SYSTEM_ADMIN, Role.ADMIN]}><Analytics /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={[Role.SYSTEM_ADMIN, Role.ADMIN]}><Settings /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ThemeProvider>
        </SidebarProvider>
      </DataProvider>
    </FaceDetectionProvider>
  );
};

export default App;
