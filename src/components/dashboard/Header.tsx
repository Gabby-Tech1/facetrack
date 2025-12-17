import React, { useState } from "react";
import { TextField } from "@radix-ui/themes";
import { BellIcon, MoonIcon, Search, SunIcon, Menu, X } from "lucide-react";
import { logo } from "../../imports/images/images";
import { AppConstants } from "../../constants/app.constants";
import { useTheme } from "next-themes";
import "../../App.css";

const Header: React.FC = () => {
  const userProfileImage = logo;
  const numberOfNotifications = 3;
  const userName = "John Doe";

  const getInitials = (name: string) => {
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
    return initials;
  };

  const { theme, setTheme } = useTheme();
  const changeTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return (
    <>
      {/* Desktop Header (visible from lg and above) */}
      <div className="hidden lg:flex content-center justify-between items-center h-12 bg-slate-950/5 px-5 rounded-md mb-4 transition-all duration-300">
        {/*input field*/}
        <div className="w-full max-w-md">
          <TextField.Root
            placeholder="Search members, sessions or reports..."
            className="caret-accent !important"
            style={{
              borderRadius: 10,
              height: 43,
              width: 350,
              backgroundColor: "rgba(30, 41, 59, 0.2)",
              border: "none",
            }}
          >
            <TextField.Slot>
              <Search size={16} className="text-gray-500" />
            </TextField.Slot>
          </TextField.Root>
        </div>

        {/*right section headers*/}
        <div className="flex justify-center items-center gap-5">
          <button
            onClick={changeTheme}
            className="relative w-6 h-6 transition-all duration-300 cursor-pointer"
            aria-label="Toggle theme"
          >
            <SunIcon
              className={`absolute inset-0 transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 rotate-90 scale-75"
              }`}
            />
            <MoonIcon
              className={`absolute inset-0 transition-all duration-300 ${
                theme === "light"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-75"
              }`}
            />
          </button>

          {/*notification icon*/}
          <button className="cursor-pointer" aria-label="Notifications">
            <div className="relative h-full">
              <div className="absolute top-0 right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                {numberOfNotifications}
              </div>
              <BellIcon
                size={25}
                className="text-gray-500 mr-4 cursor-pointer"
              />
            </div>
          </button>

          {/*separator*/}
          <div className="h-10 w-px bg-gray-600/35"></div>

          {userProfileImage ? (
            <img
              src={userProfileImage}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={` w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ${
                theme == "light" ? "text-white" : "text-white"
              }`}
            >
              {getInitials(userName)}
            </div>
          )}
          <div className="flex flex-col mr-4 items-center justify-center gap-2">
            <span
              className={`font-semibold text-sm lg:text-base leading-none overflow-clip transition duration-150 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              {userName}
            </span>
            <span className="text-gray-400 text-[11px] lg:text-xs leading-none">
              {AppConstants.USER_ROLE == "admin"
                ? "Administrator"
                : AppConstants.USER_ROLE == "staff"
                ? "Staff Member"
                : "Member Rep"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Header (shown below lg) */}
      <MobileHeader
        theme={theme}
        changeTheme={changeTheme}
        numberOfNotifications={numberOfNotifications}
        userProfileImage={userProfileImage}
        userName={userName}
        getInitials={getInitials}
      />
    </>
  );
};

type MobileHeaderProps = {
  theme: string | undefined;
  changeTheme: () => void;
  numberOfNotifications: number;
  userProfileImage: string;
  userName: string;
  getInitials: (name: string) => string;
};

const MobileHeader: React.FC<MobileHeaderProps> = ({
  theme,
  changeTheme,
  numberOfNotifications,
  userProfileImage,
  userName,
  getInitials,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Top bar with hamburger */}
      <div className="flex items-center justify-between bg-slate-950/5 px-4 h-12 rounded-md mb-2">
        <button
          className="p-2 rounded-md hover:bg-slate-950/10 transition"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={20} className="text-gray-600" />
          ) : (
            <Menu size={20} className="text-gray-600" />
          )}
        </button>
        <div className="flex-1 text-center font-semibold text-sm lg:text-base">
          {/* Optional: app/title area; keep minimal to meet requirement */}
        </div>
        <div className="w-8" />
      </div>

      {/* Collapsible content */}
      <div
        className={`${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden transition-all duration-300`}
        aria-hidden={!open}
      >
        <div className="bg-slate-950/5 px-4 py-3 rounded-md mb-4 space-y-4">
          {/* Search */}
          <div className="w-full">
            <TextField.Root
              placeholder="Search members, sessions or reports..."
              className="w-full caret-accent !important"
              style={{
                borderRadius: 10,
                height: 43,
                width: "100%",
                backgroundColor: "rgba(30, 41, 59, 0.2)",
                border: "none",
              }}
            >
              <TextField.Slot>
                <Search size={16} className="text-gray-500" />
              </TextField.Slot>
            </TextField.Root>
          </div>

          {/* Right-side items compacted */}
          <div className="flex items-center justify-between">
            <button
              onClick={changeTheme}
              className="relative w-6 h-6 transition-all duration-300"
              aria-label="Toggle theme"
            >
              <SunIcon
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === "dark"
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 rotate-90 scale-75"
                }`}
              />
              <MoonIcon
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === "light"
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-75"
                }`}
              />
            </button>

            <button
              className="relative cursor-pointer"
              aria-label="Notifications"
            >
              <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                {numberOfNotifications}
              </div>
              <BellIcon size={24} className="text-gray-500" />
            </button>

            <div className="h-6 w-px bg-gray-600/35" />

            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ${
                  theme == "light" ? "text-white" : "text-white"
                }`}
              >
                {getInitials(userName)}
              </div>
            )}

            <div className="flex flex-col items-end justify-center gap-1 ml-2">
              <span
                className={`font-semibold text-sm leading-none ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                {userName}
              </span>
              <span className="text-gray-400 text-[11px] leading-none">
                {AppConstants.USER_ROLE == "admin"
                  ? "Administrator"
                  : AppConstants.USER_ROLE == "staff"
                  ? "Staff Member"
                  : "Member Rep"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
