"use client";

import { CalendarClock, Users, Building, Briefcase, BarChart3, ChevronRight } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function MobileLaunchpad() {
    const { isPlannerOrAdmin, isSecurityGuard, user } = useUserRole();

    if (!user) return null;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 px-4 pt-6 pb-24">
            {/* Header showing greeting */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Actueel Overzicht
                </h1>
                <p className="text-gray-500 text-sm">Welkom terug, {user.user_metadata?.first_name || "Collega"}</p>
            </div>

            {isPlannerOrAdmin ? (
                <>
                    {/* Hero Action - Primary call to action */}
                    <a
                        href="/planning?view=today"
                        className="flex items-center justify-between p-5 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 transform active:scale-95 transition-all w-full"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <CalendarClock size={28} className="text-white" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-white font-bold text-lg">Actuele Planning</h2>
                                <p className="text-blue-100 text-sm font-medium">Bekijk vandaag & voeg diensten toe</p>
                            </div>
                        </div>
                        <ChevronRight className="text-white/80" />
                    </a>

                    {/* 2x2 Grid of Modules */}
                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href="/employees"
                            className="flex flex-col justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square group active:scale-95 transition-all"
                        >
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                <Users size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Medewerkers</h3>
                                <p className="text-xs text-gray-500 mt-1">Beheer personeel & uren</p>
                            </div>
                        </a>

                        <a
                            href="/clients"
                            className="flex flex-col justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square group active:scale-95 transition-all"
                        >
                            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                <Building size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Klanten</h3>
                                <p className="text-xs text-gray-500 mt-1">Cliënten & locaties</p>
                            </div>
                        </a>

                        <a
                            href="/assignments"
                            className="flex flex-col justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square group active:scale-95 transition-all"
                        >
                            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                                <Briefcase size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Opdrachten</h3>
                                <p className="text-xs text-gray-500 mt-1">Lopende projecten</p>
                            </div>
                        </a>

                        <a
                            href="/?view=stats"
                            className="flex flex-col justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square group active:scale-95 transition-all"
                        >
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                <BarChart3 size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Statistieken</h3>
                                <p className="text-xs text-gray-500 mt-1">Omzet & dashboard</p>
                            </div>
                        </a>
                    </div>
                </>
            ) : isSecurityGuard ? (
                <>
                    {/* Hero Action for Guards */}
                    <a
                        href="/planning"
                        className="flex items-center justify-between p-5 mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all w-full"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <CalendarClock size={28} className="text-white" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-white font-bold text-lg">Mijn Rooster</h2>
                                <p className="text-emerald-100 text-sm font-medium">Bekijk je aankomende diensten</p>
                            </div>
                        </div>
                        <ChevronRight className="text-white/80" />
                    </a>

                    {/* Grid for Guards */}
                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href="/beschikbaarheid"
                            className="flex flex-col justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 aspect-square group active:scale-95 transition-all"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <BarChart3 size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Gewerkt</h3>
                                <p className="text-xs text-gray-500 mt-1">Uren & declaraties</p>
                            </div>
                        </a>
                    </div>
                </>
            ) : null}
        </div>
    );
}
