"use client";

import { CalendarCheck, Users, Building, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";

export function MobileBottomNav() {
    const { userRole, isPlannerOrAdmin, userLoading } = useUserRole();
    const [currentPath, setCurrentPath] = useState<string>("");

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    if (userLoading || !userRole) return null;

    // Don't show bottom nav on public pages or auth pages
    const publicRoutes = ["/", "/functies", "/prijzen", "/contact"];
    const isPublicRoute = currentPath.startsWith("/account/") || publicRoutes.includes(currentPath);

    // Actually, wait, / is dashboard for logged in users. 
    // We need to know if the user is authenticated from AuthProvider context to not hide it on /.
    // Let's use userRole presence as authentication indicator. 
    // However, marketing pages won't have userRole either, so it will naturally hide.

    // But we want to hide it explicitly on login/signup pages even if userRole was magically set
    if (currentPath.startsWith("/account/")) return null;

    const NavItem = ({ href, icon: Icon, label, active = false }: { href: string, icon: any, label: string, active?: boolean }) => {
        return (
            <a
                href={href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
                    }`}
            >
                <Icon size={20} className={active ? "text-blue-600" : "text-gray-500"} />
                <span className="text-[10px] font-medium">{label}</span>
            </a>
        );
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-gray-200 bg-white/90 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md pb-safe lg:hidden">
            {isPlannerOrAdmin ? (
                <>
                    <NavItem href="/planning?view=today" icon={CalendarCheck} label="Planning" active={currentPath.startsWith("/planning")} />
                    <NavItem href="/employees" icon={Users} label="Medewerkers" active={currentPath.startsWith("/employees")} />
                    <NavItem href="/clients" icon={Building} label="Klanten" active={currentPath.startsWith("/clients") || currentPath.startsWith("/assignments")} />
                    <NavItem href="/" icon={BarChart3} label="Dashboard" active={currentPath === "/"} />
                </>
            ) : (
                <>
                    <NavItem href="/planning" icon={CalendarCheck} label="Rooster" active={currentPath.startsWith("/planning")} />
                    <NavItem href="/beschikbaarheid" icon={BarChart3} label="Uren" active={currentPath.startsWith("/beschikbaarheid")} />
                </>
            )}
        </nav>
    );
}
