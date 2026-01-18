import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import StudentDashboard from "./StudentDashboard";
import LecturerDashboard from "./LecturerDashboard";
import AdminDashboard from "./AdminDashboard";

const Dashboard: React.FC = () => {
  const { userRole, user } = useAuth();

  if (!user) {
    return null;
  }

  // Route to role-specific dashboard
  switch (userRole) {
    case "student":
      return <StudentDashboard />;
    case "lecturer":
      return <LecturerDashboard />;
    case "system_admin":
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
