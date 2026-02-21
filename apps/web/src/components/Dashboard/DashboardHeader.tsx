import { useState, useRef, useEffect } from "react";
import {
  Calendar, Users, Building2, MapPin,
  Clock, ArrowLeftRight, FileText,
  CalendarOff, LogOut, RefreshCcw, Settings,
  User as UserIcon, LayoutDashboard,
  ChevronDown,
  Bell
} from "lucide-react";
import NotificationBell from "../NotificationBell";
import { useUserRole } from "@/hooks/useUserRole";

export function DashboardHeader({ isPlannerOrAdmin: initialIsPlannerOrAdmin }: { isPlannerOrAdmin?: boolean }) {
  const { hasMultipleRoles, viewAsEmployee, toggleViewAsEmployee, isPlannerOrAdmin: hookIsPlannerOrAdmin, userRole, user } = useUserRole();
  const isPlannerOrAdmin = initialIsPlannerOrAdmin !== undefined ? (initialIsPlannerOrAdmin && !viewAsEmployee) : hookIsPlannerOrAdmin;
  const isAdmin = userRole === "admin";

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentPath, setCurrentPath] = useState<string>("");

  // Close dropdown when clicking outside
  useEffect(() => {
    setCurrentPath(window.location.pathname);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavItem = ({ href, icon: Icon, label, active = false }: { href: string, icon: any, label: string, active?: boolean }) => (
    <a
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 group ${active
        ? "text-blue-600 bg-blue-50 font-semibold"
        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
        }`}
    >
      <Icon size={18} className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} />
      <span className="text-sm">{label}</span>
    </a>
  );

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center">

        {/* Left: Logo */}
        <div className="flex-shrink-0 mr-8">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="DutyGrid" className="h-16 w-auto drop-shadow-sm" />
          </a>
        </div>

        {/* Middle: Core Nav (Desktop) - Centered */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-2 px-8">
          <NavItem href="/" icon={LayoutDashboard} label="Dashboard" active={currentPath === "/"} />
          {isPlannerOrAdmin ? (
            <>
              <a
                href="/planning"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group ${currentPath === "/planning"
                  ? "text-white bg-blue-600 font-bold shadow-md shadow-blue-200"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
              >
                <Calendar size={18} className={currentPath === "/planning" ? "text-white" : "text-gray-400 group-hover:text-blue-600"} />
                <span className="text-sm">Planning</span>
              </a>
              <NavItem href="/employees" icon={Users} label="Medewerkers" active={currentPath === "/employees"} />
              <NavItem href="/clients" icon={Building2} label="Klanten" active={currentPath.startsWith("/clients") || currentPath.startsWith("/assignments")} />
            </>
          ) : (
            <>
              <NavItem href="/beschikbaarheid" icon={Clock} label="Beschikbaarheid" active={currentPath === "/beschikbaarheid"} />
              <NavItem href="/diensten-ruilen" icon={ArrowLeftRight} label="Ruilen" active={currentPath === "/diensten-ruilen"} />
              <NavItem href="/my-leave" icon={CalendarOff} label="Verlof" active={currentPath === "/my-leave"} />
            </>
          )}
        </nav>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative group p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <NotificationBell />
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name || "Gebruiker"}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{userRole?.replace("_", " ")}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                <UserIcon size={18} />
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 lg:hidden">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole?.replace("_", " ")}</p>
                </div>

                <div className="py-1">
                  {hasMultipleRoles && (
                    <button
                      onClick={() => {
                        toggleViewAsEmployee();
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                    >
                      <RefreshCcw size={16} />
                      <span>{viewAsEmployee ? "Terug naar Planner" : "Wissel naar Medewerker"}</span>
                    </button>
                  )}

                  {isPlannerOrAdmin && (
                    <>
                      <a
                        href="/administratie"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FileText size={16} className="text-gray-400" />
                        <span>Administratie</span>
                      </a>
                    </>
                  )}

                  {isAdmin && (
                    <a
                      href="/admin/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={16} className="text-gray-400" />
                      <span>Systeeminstellingen</span>
                    </a>
                  )}

                  <a
                    href="/account/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon size={16} className="text-gray-400" />
                    <span>Mijn Profiel</span>
                  </a>
                </div>

                <div className="border-t border-gray-50 mt-1 pt-1">
                  <a
                    href="/account/logout"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Uitloggen</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
