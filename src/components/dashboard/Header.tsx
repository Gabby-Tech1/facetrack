import React from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebar } from "../../contexts/SidebarContext";

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, userRole } = useAuth();
  const { toggle } = useSidebar();

  const getRoleLabel = () => {
    switch (userRole) {
      case "student": return "Student";
      case "lecturer": return "Lecturer";
      case "system_admin": return "Admin";
      default: return "User";
    }
  };

  return (
    <header className="flex items-center justify-between h-14 bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl px-4 shadow-sm dark:shadow-none">
      {/* Left Section - Menu Toggle (mobile) + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 text-blue-600 dark:text-slate-400 hover:text-blue-800 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Search - Hidden on small screens */}
        <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Info - Hidden on small screens */}
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleLabel()}</p>
          </div>
          <img
            src={user?.profilePicture}
            alt={user?.name}
            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
