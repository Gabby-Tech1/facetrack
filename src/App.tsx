import "./App.css";
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@radix-ui/themes/styles.css";
import { Toaster } from "sonner";

// Auth
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import Sessions from "./pages/sessions/Sessions";
import Courses from "./pages/courses/Courses";
import Attendance from "./pages/attendance/Attendance";
import Users from "./pages/users/Users";
import Analytics from "./pages/analytics/Analytics";
import Earnings from "./pages/earnings/Earnings";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/settings/Settings";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <SidebarProvider>
          <ThemeProvider defaultTheme="dark" attribute="class">
            <Toaster richColors position="top-right" />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/earnings" element={<ProtectedRoute allowedRoles={["lecturer"]}><Earnings /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute allowedRoles={["system_admin"]}><Users /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={["system_admin"]}><Analytics /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={["system_admin"]}><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ThemeProvider>
        </SidebarProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
