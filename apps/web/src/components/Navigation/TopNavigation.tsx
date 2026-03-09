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
    FileText,
    LayoutGrid
} from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "../NotificationBell";
import { useUserRole } from "../../hooks/useUserRole";

export function TopNavigation() {
    const { hasMultipleRoles, viewAsEmployee, toggleViewAsEmployee, isPlannerOrAdmin, userRole, user, userLoading } = useUserRole();
    const isAdmin = userRole === "admin";
    const isImpersonating = user?.is_impersonating;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [currentPath, setCurrentPath] = useState<string>("");

    // Trial logic
    const isTrial = user?.subscription_status === 'trialing';
    let daysRemaining = 0;
    if (isTrial && user?.trial_ends_at) {
        const endDate = new Date(user.trial_ends_at);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

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
        <div className="flex flex-col w-full">
            {/* Impersonation Banner */}
            {isImpersonating && (
                <div className="w-full py-2 px-4 text-center text-sm font-semibold bg-red-600 text-white flex items-center justify-center gap-3 z-50 shadow-md">
                    <span>⚠️ Je bent momenteel ingelogd als {user?.company_name || "Klant"}. Alle acties worden geregistreerd in de audit log.</span>
                    <button
                        onClick={() => {
                            // Clear consumer session cookie and go back to admin portal
                            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            const isDev = window.location.hostname === 'localhost';
                            window.location.href = isDev ? "http://localhost:4002/companies" : "/superadmin/companies";
                        }}
                        className="bg-white text-red-600 px-3 py-1 rounded shadow text-xs hover:bg-gray-100 transition"
                    >
                        Stop Impersonation
                    </button>
                </div>
            )}
            {/* Trial Banner */}
            {isTrial && isAdmin && !viewAsEmployee && (
                <div className={`w-full py-2 px-4 text-center text-sm font-medium ${daysRemaining <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-600 text-white'} flex items-center justify-center gap-2`}>
                    {daysRemaining > 0 ? (
                        <>
                            <span>Je proefperiode verloopt over <strong>{daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagen'}</strong>.</span>
                            <a href="/settings/billing" className="underline ml-2 hover:text-blue-200 opacity-90 transition-opacity">Nu upgraden</a>
                        </>
                    ) : (
                        <>
                            <span>Je proefperiode is verlopen!</span>
                            <a href="/settings/billing" className="underline ml-2 hover:text-orange-900 font-bold">Account activeren</a>
                        </>
                    )}
                </div>
            )}

            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-[80px] flex items-center justify-between">

                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <a href="/" className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80">
                            <img
                                src="/logo.png"
                                alt="DutyGrid Dashboard"
                                className="h-[48px] md:h-[60px] w-auto object-contain"
                            />
                        </a>
                    </div>

                    {/* Right: Core Nav & Actions */}
                    <div className="flex items-center gap-6 lg:gap-8 ml-auto">
                        {/* Core Nav (Desktop) */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {isPlannerOrAdmin ? (
                                <>
                                    <NavItem href="/" icon={LayoutGrid} label="Dashboard" active={currentPath === "/"} />
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

                        {/* Actions & Profile */}
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

                                            <Link to="/account/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <UserIcon size={16} className="text-gray-400" />
                                                <span>Mijn Profiel</span>
                                            </Link>

                                            <Link to="/account/subscription" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-1">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M6 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" /><path d="M14 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z" /></svg>
                                                <span>Abonnement</span>
                                            </Link>

                                            {isPlannerOrAdmin && (
                                                <Link to="/administratie" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors mt-1">
                                                    <FileText size={16} className="text-gray-400" />
                                                    <span>Administratie</span>
                                                </Link>
                                            )}

                                            {isAdmin && (
                                                <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <Settings size={16} className="text-gray-400" />
                                                    <span>Systeeminstellingen</span>
                                                </Link>
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
                </div>
            </header>
        </div>
    );
}
