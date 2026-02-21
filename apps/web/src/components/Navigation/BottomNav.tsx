import {
    LayoutDashboard,
    Calendar,
    Users,
    MoreHorizontal,
    Building2,
    FileText,
    Settings,
    Clock,
    ArrowLeftRight,
    CalendarOff,
    LogOut
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";

export function BottomNav() {
    const { isPlannerOrAdmin, userRole, user, userLoading } = useUserRole();
    const isAdmin = userRole === "admin";
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [currentPath, setCurrentPath] = useState<string>("");

    // Handle hydration-safe pathname and close menu when clicking outside
    useEffect(() => {
        setCurrentPath(window.location.pathname);

        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (userLoading || !user) return null;

    const NavItem = ({ href, icon: Icon, label, active = false, onClick }: { href?: string, icon: any, label: string, active?: boolean, onClick?: () => void }) => {
        const content = (
            <div className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${active ? "text-blue-600" : "text-gray-500"
                }`}>
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
            </div>
        );

        if (onClick) {
            return (
                <button onClick={onClick} className="flex-1 h-full flex items-center justify-center">
                    {content}
                </button>
            );
        }

        return (
            <a href={href} className="flex-1 h-full flex items-center justify-center">
                {content}
            </a>
        );
    };

    const MoreMenuItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
        <a
            href={href}
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0"
        >
            <Icon size={18} className="text-gray-400" />
            <span>{label}</span>
        </a>
    );

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            {/* More Menu Backdrop */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMenuOpen(false)}></div>
            )}

            {/* More Menu Content */}
            {isMenuOpen && (
                <div
                    ref={menuRef}
                    className="absolute bottom-full left-4 right-4 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                >
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meer Opties</p>
                    </div>
                    <div className="flex flex-col">
                        <MoreMenuItem href="/clients" icon={Building2} label="Klanten" />
                        <MoreMenuItem href="/administratie" icon={FileText} label="Administratie" />
                        {isAdmin && (
                            <MoreMenuItem href="/admin/settings" icon={Settings} label="Instellingen" />
                        )}
                        <MoreMenuItem href="/account/logout" icon={LogOut} label="Uitloggen" />
                    </div>
                </div>
            )}

            {/* Main Bar */}
            <nav className="bg-white/80 backdrop-blur-lg border-t border-gray-100 h-16 px-2 pb-safe flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                <NavItem href="/" icon={LayoutDashboard} label="Home" active={currentPath === "/"} />

                {isPlannerOrAdmin ? (
                    <>
                        <NavItem href="/planning" icon={Calendar} label="Planning" active={currentPath === "/planning"} />
                        <NavItem href="/employees" icon={Users} label="Medewerkers" active={currentPath === "/employees"} />
                    </>
                ) : (
                    <>
                        <NavItem href="/beschikbaarheid" icon={Clock} label="Uren" active={currentPath === "/beschikbaarheid"} />
                        <NavItem href="/diensten-ruilen" icon={ArrowLeftRight} label="Ruilen" active={currentPath === "/diensten-ruilen"} />
                    </>
                )}

                <NavItem icon={MoreHorizontal} label="Meer" active={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
            </nav>
        </div>
    );
}
