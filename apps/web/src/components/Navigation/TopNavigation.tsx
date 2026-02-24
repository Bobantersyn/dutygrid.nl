"use client";

import { useState, useRef, useEffect } from "react";
import {
    Calendar,
    Users,
    Building2,
    Clock,
    ArrowLeftRight,
    LogOut,
    RefreshCcw,
    Settings,
    User as UserIcon,
    ChevronDown,
    FileText
} from "lucide-react";
import NotificationBell from "../NotificationBell";
import { useUserRole } from "@/hooks/useUserRole";

export function TopNavigation() {
    const { hasMultipleRoles, viewAsEmployee, toggleViewAsEmployee, isPlannerOrAdmin, userRole, user, userLoading } = useUserRole();
    const isAdmin = userRole === "admin";

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [currentPath, setCurrentPath] = useState<string>("");

    // Handle hydration-safe pathname and close dropdown
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

    if (userLoading || !user) return null;

    // Render navigation items with strict rules (blue for active primary tabs)
    const NavItem = ({ href, icon: Icon, label, active = false }: { href: string, icon: any, label: string, active?: boolean }) => {
        return (
            <a
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group ${active
                    ? "text-blue-600 bg-blue-50 font-semibold shadow-sm"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
            >
                <Icon size={18} className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"} />
                <span className="text-sm">{label}</span>
            </a>
        );
    };

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-[160px] flex items-center justify-between">

                {/* Left: Enlarge Logo (clickable -> Dashboard) */}
                <div className="flex-shrink-0 mr-8 py-2">
                    <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <img
                            src="/logo.svg"
                            alt="DutyGrid Dashboard"
                            className="h-[140px] w-auto drop-shadow-sm min-w-[350px] object-contain transform origin-left"
                        />
                    </a>
                </div>

                {/* Middle: Core Nav (Desktop) */}
                <nav className="hidden lg:flex flex-1 items-center gap-2">
                    {isPlannerOrAdmin ? (
                        <>
                            <NavItem href="/planning" icon={Calendar} label="Planning" active={currentPath.startsWith("/planning")} />
                            <NavItem href="/employees" icon={Users} label="Medewerkers" active={currentPath.startsWith("/employees")} />
                            {/* Clients & Assignments united into 1 logical block visually */}
                            <NavItem href="/clients" icon={Building2} label="Klanten & Opdrachten" active={currentPath.startsWith("/clients") || currentPath.startsWith("/assignments")} />
                        </>
                    ) : (
                        <>
                            <NavItem href="/beschikbaarheid" icon={Clock} label="Uren" active={currentPath.startsWith("/beschikbaarheid")} />
                            <NavItem href="/diensten-ruilen" icon={ArrowLeftRight} label="Ruilen" active={currentPath.startsWith("/diensten-ruilen")} />
                        </>
                    )}
                </nav>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Notifications */}
                    <div className="relative group p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <NotificationBell />
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || "Gebruiker"}</p>
                                <p className="text-xs text-gray-500 mt-1 capitalize">{userRole?.replace("_", " ")}</p>
                            </div>
                            <div className="w-9 h-9 ml-2 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                <UserIcon size={18} />
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 ml-1 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu - Move non-core pages here */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
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
                                            className="w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                        >
                                            <RefreshCcw size={16} />
                                            <span className="font-medium">{viewAsEmployee ? "Terug naar Planner" : "Wissel naar Medewerker"}</span>
                                        </button>
                                    )}

                                    <a href="/account/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <UserIcon size={16} className="text-gray-400" />
                                        <span>Mijn Profiel</span>
                                    </a>

                                    {isPlannerOrAdmin && (
                                        <a href="/administratie" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-1">
                                            <FileText size={16} className="text-gray-400" />
                                            <span>Administratie</span>
                                        </a>
                                    )}

                                    {isAdmin && (
                                        <a href="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <Settings size={16} className="text-gray-400" />
                                            <span>Systeeminstellingen</span>
                                        </a>
                                    )}
                                </div>

                                <div className="border-t border-gray-50 mt-2 pt-2">
                                    <a href="/account/logout" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                        <LogOut size={16} />
                                        <span className="font-medium">Uitloggen</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile nav fallback injected into the dom here instead of absolute absolute bottom so it respects standard dom flow if needed, but for now we leave BottomNav out intentionally to use TopNav */}
        </header>
    );
}
