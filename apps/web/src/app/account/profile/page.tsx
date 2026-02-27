"use client";

import { useUserRole } from "../../../hooks/useUserRole";
import { User, Mail, Shield, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
    const { user, userRole, userLoading } = useUserRole();

    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <a
                        href="/"
                        className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-flex items-center gap-1"
                    >
                        <ArrowLeft size={16} />
                        Terug naar Dashboard
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900">Mijn Profiel</h1>
                    <p className="text-gray-600 mt-1">Beheer je persoonlijke accountgegevens</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
                            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                                {user.user_metadata?.first_name?.charAt(0) || user.email?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                                </h2>
                                <div className="flex items-center gap-2 mt-2 text-gray-500">
                                    <Shield size={16} className="text-blue-500" />
                                    <span className="capitalize font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-sm">
                                        {userRole?.replace("_", " ") || "Gebruiker"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-gray-400" />
                                    Persoonlijke Gegevens
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Voornaam</p>
                                        <p className="font-medium text-gray-900">{user.user_metadata?.first_name || "-"}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Achternaam</p>
                                        <p className="font-medium text-gray-900">{user.user_metadata?.last_name || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Mail size={20} className="text-gray-400" />
                                    Contact & Login
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">E-mailadres</p>
                                    <p className="font-medium text-gray-900">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
