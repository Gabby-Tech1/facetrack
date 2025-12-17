import React from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LockIcon,
  LogOutIcon,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Card } from "@radix-ui/themes";
import { logo } from "../../imports/images/images";
import "../../App.css";

const Sidebar: React.FC = () => {
  const role = "admin";
  const user = "Dickson Peprah";
  const [collapsed, setCollapsed] = React.useState(false);

  const sidebarItems = [
    { name: "Dashboard", link: "/dashboard", icon: LayoutDashboard },
    { name: "Members", link: "/members", icon: Users },
    { name: "Sessions", link: "/sessions", icon: CalendarDays },
    { name: "Analytics", link: "/analytics", icon: BarChart3 },
    { name: "Notifications", link: "/notifications", icon: Bell },
    { name: "Staff Management", link: "/staff-management", icon: UserCog },
    { name: "Class Reps", link: "/class-reps", icon: GraduationCap },
    { name: "Settings", link: "/settings", icon: Settings },
  ];

  const displayName = user.split(" ");

  return (
    <aside
      className={`h-screen flex flex-col bg-gray-900 border-r border-gray-800
        transition-all duration-500 overflow-hidden
        ${collapsed ? "w-20" : "w-full"}`}
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 px-4 py-5">
        <img src={logo} alt="logo" className="small-logo shrink-0" />
        {!collapsed && (
          <div>
            <h1 className="text-white font-bold">FaceCheck</h1>
            <p className="text-xs text-gray-400 overflow-clip text-start align-middle">
              Attendance System
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-800" />

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-1 px-2 py-4">
        {sidebarItems.map(({ name, link, icon: Icon }) => (
          <NavLink
            key={name}
            to={link}
            className={({ isActive }) =>
              `
              flex items-center h-11 rounded-xl text-sm font-medium
              transition-all duration-300
              ${collapsed ? "justify-center px-0" : "gap-3 px-3"}
              ${
                isActive
                  ? "bg-accent/15 text-accent border-l-2 border-l-accent"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }
            `
            }
          >
            <Icon size={20} className="shrink-0" />
            {!collapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* PUSH BOTTOM */}
      <div className="flex-1" />

      <hr className="border-gray-800" />

      {/* USER CARD */}
      {!collapsed && (
        <div className="px-4 py-3">
          <Card
            variant="surface"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: 10,
            }}
          >
            <p className="text-white text-sm overflow-clip">
              {displayName[0]} {displayName[1]}
            </p>
            <p className="text-xs text-gray-400 capitalize">{role}</p>
          </Card>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-1 px-2 pb-4">
        {/* CHANGE PASSWORD */}
        <SidebarButton
          collapsed={collapsed}
          icon={<LockIcon size={20} />}
          label="Change Password"
        />

        {/* LOGOUT */}
        <SidebarButton
          collapsed={collapsed}
          icon={<LogOutIcon size={20} />}
          label="Logout"
          danger
        />

        {/* COLLAPSE */}
        <SidebarButton
          collapsed={collapsed}
          icon={
            collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
          }
          label="Collapse"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>
    </aside>
  );
};

export default Sidebar;

/* -------------------------------- */
/* REUSABLE BUTTON COMPONENT        */
/* -------------------------------- */

type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  danger?: boolean;
  onClick?: () => void;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  collapsed,
  danger,
  onClick,
}) => {
  return (
    <button onClick={onClick}>
      <div
        className={`
          h-11 flex items-center rounded-xl text-sm font-medium
          transition-all duration-300
          ${collapsed ? "justify-center px-0" : "gap-2 px-4"}
          ${
            danger
              ? "text-red-500 hover:bg-red-950/40"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          }
        `}
      >
        <span className="shrink-0">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </div>
    </button>
  );
};
