import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  ClipboardList,
  Users,
  BarChart3,
  DollarSign,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useSidebar } from "../../contexts/SidebarContext";
import { Role } from "../../types";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
    close();
  };

  const handleNavClick = () => {
    close();
  };

  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ];

    if (!user) return commonItems;

    switch (user.role) {
      case Role.STUDENT:
      case Role.REP:
        return [
          ...commonItems,
          { icon: BookOpen, label: "My Courses", path: "/my-courses" },
          { icon: Calendar, label: "Sessions", path: "/sessions" },
          { icon: Camera, label: "Mark Attendance", path: "/mark-attendance" },
          { icon: ClipboardList, label: "Attendance History", path: "/attendance" },
          { icon: User, label: "Profile", path: "/profile" },
        ];

      case Role.LECTURER:
        return [
          ...commonItems,
          { icon: Calendar, label: "Sessions", path: "/sessions" },
          { icon: BookOpen, label: "Courses", path: "/courses" },
          { icon: Camera, label: "Mark Attendance", path: "/mark-attendance" },
          { icon: ClipboardList, label: "Attendance History", path: "/attendance" },
          { icon: DollarSign, label: "Earnings", path: "/earnings" },
          { icon: User, label: "Profile", path: "/profile" },
        ];

      case Role.STAFF:
      case Role.ADMIN:
      case Role.SYSTEM_ADMIN:
        return [
          ...commonItems,
          { icon: Calendar, label: "Sessions", path: "/sessions" },
          { icon: BookOpen, label: "Courses", path: "/courses" },
          { icon: Users, label: "Users", path: "/users" },
          { icon: ClipboardList, label: "Attendance", path: "/attendance" },
          { icon: BarChart3, label: "Analytics", path: "/analytics" },
          { icon: Settings, label: "Settings", path: "/settings" },
          { icon: User, label: "Profile", path: "/profile" },
        ];

      default:
        return [...commonItems, { icon: User, label: "Profile", path: "/profile" }];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    if (!user) return { label: "User", color: "bg-slate-600" };

    switch (user.role) {
      case Role.STUDENT: return { label: "Student", color: "bg-green-600" };
      case Role.REP: return { label: "Class Rep", color: "bg-emerald-600" };
      case Role.LECTURER: return { label: "Lecturer", color: "bg-purple-600" };
      case Role.STAFF: return { label: "Staff", color: "bg-orange-600" };
      case Role.ADMIN: return { label: "Admin", color: "bg-blue-600" };
      case Role.SYSTEM_ADMIN: return { label: "System Admin", color: "bg-white/20 dark:bg-blue-600" };
      default: return { label: "User", color: "bg-slate-600" };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={close} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          h-screen flex flex-col transition-all duration-300 ease-in-out
          bg-blue-600 dark:bg-slate-800 border-r border-blue-500 dark:border-slate-700
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-blue-500 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 dark:bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <User size={20} className="text-white" />
              </div>
              {(!isCollapsed || isOpen) && (
                <span className="text-lg font-bold text-white">FaceCheck</span>
              )}
            </div>
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  close();
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isOpen && window.innerWidth < 1024 ? (
                <X size={18} />
              ) : isCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                  ? "bg-white/20 dark:bg-blue-600 text-white"
                  : "text-white/80 dark:text-slate-300 hover:bg-white/10 dark:hover:bg-slate-700 hover:text-white"
                  }`}
              >
                <item.icon size={20} className="shrink-0" />
                {(!isCollapsed || isOpen) && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-blue-500 dark:border-slate-700">
          <div className={`mb-3 ${isCollapsed && !isOpen ? "text-center" : ""}`}>
            <div className="flex items-center gap-3">
              <img
                src={user?.profilePicture}
                alt={user?.name}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border-2 border-white/30"
              />
              {(!isCollapsed || isOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium text-white rounded ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-white/80 hover:bg-red-600 hover:text-white rounded-lg transition-colors ${isCollapsed && !isOpen ? "justify-center" : ""
              }`}
          >
            <LogOut size={20} className="shrink-0" />
            {(!isCollapsed || isOpen) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
