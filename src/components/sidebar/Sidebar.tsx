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
import { logo } from "../../imports/images/images";
import { NavLink } from "react-router-dom";
import { Card } from "@radix-ui/themes";
import "../../App.css";

const Sidebar: React.FC = () => {
  const role: string = "admin";

  const user = "Dickson Peprah";
  const sidebarItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Members",
      link: "/members",
      icon: Users,
    },
    {
      name: "Sessions",
      link: "/sessions",
      icon: CalendarDays,
    },
    {
      name: "Analytics",
      link: "/analytics",
      icon: BarChart3,
    },
    {
      name: "Notifications",
      link: "/notifications",
      icon: Bell,
    },
    {
      name: "Staff Management",
      link: "/staff-management",
      icon: UserCog, // 👈 better than Settings
    },
    {
      name: "Class Reps",
      link: "/class-reps",
      icon: GraduationCap,
    },
    {
      name: "Settings",
      link: "/settings",
      icon: Settings,
    },
  ];

  const repHiddenItems = ["Members", "Staff Management", "Class Reps"];
  const staffHiddenItems = ["Staff Management", "Class Reps"];
  const displayName = user.split(" ");

  const [collapsed, setCollapse] = React.useState(false);

  const items = sidebarItems.filter((item) => {
    if (role === "rep") {
      return !repHiddenItems.includes(item.name);
    } else if (role === "staff") {
      return !staffHiddenItems.includes(item.name);
    } else {
      return true;
    }
  });

  const updateCollapse = () => {
    setCollapse(!collapsed);
  };
  return (
    <div className="flex flex-col h-screen px-5 overflow-hidden transition-all duration-300">
      {/* Top section: logo + title */}
      <div className="flex flex-row gap-2 items-center mb-5">
        <img className="small-logo mt-5" src={logo} alt="App Logo" />
        {!collapsed && (
          <div className="flex flex-col mt-5 items-center">
            <span className="font-bold antialiased text-xl text-white">
              FaceCheck
            </span>
            <span className="text-xs text-gray-400">Attendance System</span>
          </div>
        )}
      </div>
      <hr className="text-gray-500 mb-5" />

      {/* Middle section: navigation */}
      <div className="flex flex-col gap-2">
        {items.map(({ name, icon: Icon, link }) => (
          <NavLink
            to={link}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-sans ${
                isActive
                  ? "border-l-2 border-l-accent bg-accent/15 text-accent"
                  : "text-gray-400 hover:bg-gray-800 transform duration-300 hover:text-white"
              }`
            }
          >
            <Icon />
            {!collapsed && <span>{name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      <hr className="text-gray-500 mb-5" />
      {/* Bottom section */}
      <div className="flex flex-col gap-3 mb-5">
        {!collapsed && (
          <Card
            style={{
              borderRadius: 12,
              backgroundColor: "rgba(55, 65, 81, 0.1)",
              padding: "10px",
            }}
            variant="surface"
          >
            <div className="flex flex-col items-start">
              <span className="text-white antialised text-sm">
                {displayName[0] + " " + displayName[1]}
              </span>
              <span className="text-xs text-gray-400">
                {role === "admin"
                  ? "Admin"
                  : role === "staff"
                  ? "Staff"
                  : "Class Rep"}
              </span>
            </div>
          </Card>
        )}

        <button className="justify-start cursor-pointer ">
          <div className="h-11 px-5 text-sm flex items-center gap-2 text-gray-400 hover:text-white font-medium hover:bg-gray-800 hover:rounded-xl hover:transform hover:duration-300">
            <LockIcon size={19} />
            {!collapsed && <span>Change Password</span>}
          </div>
        </button>

        <button className="justify-start cursor-pointer text-sm">
          <div className="h-11 text-red-600 px-5 flex items-center gap-2 font-medium hover:bg-red-950 hover:bg-opacity-4 hover:rounded-xl hover:transform hover:duration-300">
            <LogOutIcon size={19} />
            {!collapsed && <span>Logout</span>}
          </div>
        </button>

        <button
          className="justify-start cursor-pointer"
          onClick={updateCollapse}
        >
          <div className="h-11 px-5 text-sm flex items-center gap-2 text-gray-400 hover:text-white font-medium hover:bg-gray-800 hover:rounded-xl hover:transform hover:duration-300">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
            {!collapsed && <span className="text-white">Collapse</span>}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
