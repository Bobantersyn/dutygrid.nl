"use client";

import { useUserRole } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { FileText, Building2, Users } from "lucide-react";

export default function AdministratiePage() {
    const { userLoading, roleLoading, isPlannerOrAdmin } = useUserRole();

    if (userLoading || roleLoading) {
        return <LoadingState />;
    }

    if (!isPlannerOrAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Geen toegang</h2>
                    <p className="text-gray-600 mb-6">Je hebt geen rechten om deze pagina te bekijken.</p>
                    <a href="/" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block font-medium">
                        Terug naar home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader isPlannerOrAdmin={isPlannerOrAdmin} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Administratie & Financiën</h1>
                    <p className="text-gray-600 mt-2">
                        Beheer klantfacturatie en personeelsrapportages vanuit één overzicht.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Klant Facturatie Card */}
                    <a
                        href="/facturatie/uren"
                        className="group flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all text-left"
                    >
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Building2 size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Klant Facturatie</h2>
                        <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                            Overzicht van gewerkte uren per klant/opdrachtgever. Exporteer deze data voor je externe boekhouding of facturatiesysteem.
                        </p>
                        <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                            Open Facturatie
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </a>

                    {/* Personeel Rapportage Card */}
                    <a
                        href="/planning/reports"
                        className="group flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:purple-300 transition-all text-left"
                    >
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Personeel Uren (CAO)</h2>
                        <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                            Maandelijkse urenregistratie per beveiliger. Inclusief automatische CAO overwerk-schattingen op basis van ingeplande contracturen.
                        </p>
                        <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                            Open Rapportages
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
