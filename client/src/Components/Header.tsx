import React, { useEffect, useState } from "react";
import { Bell, User, Menu, X } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, isSidebarOpen }) => {
  const [initials, setInitials] = useState<string>("");

  useEffect(() => {
    // Read user from localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        // Try to parse JSON first
        const parsed = JSON.parse(storedUser);
        if (parsed.fullName) {
          setInitials(getInitials(parsed.fullName));
        } else if (typeof parsed === "string") {
          // fallback if stored as plain string
          setInitials(getInitials(parsed));
        }
      } catch {
        // fallback if it's just a plain string
        setInitials(getInitials(storedUser));
      }
    }
  }, []);

  // Helper function to get initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-[10%] py-4">
        {/* Left section - Hamburger & Title */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu - Only visible on mobile */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div>
            <span className="block md:hidden font-bold text-red-500">KAMAKFUND</span>
            <h1 className="text-xs md:text-xl font-semibold text-gray-800">
              {title}
            </h1>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Circle with Initials */}
          <div className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-800 text-white font-semibold text-sm">
            {initials || <User className="w-4 h-4 md:w-5 md:h-5" />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;