import React from "react";
import { useAuthStore } from "../../store/auth.store";
import { Role } from "../../types";
import StudentDashboard from "./StudentDashboard";
import LecturerDashboard from "./LecturerDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  // Route to role-specific dashboard
  switch (user.role) {
    case Role.STUDENT:
    case Role.REP:
      return <StudentDashboard />;
    case Role.LECTURER:
      return <LecturerDashboard />;
    case Role.SYSTEM_ADMIN:
    case Role.ADMIN:
    case Role.STAFF:
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
