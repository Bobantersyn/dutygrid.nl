"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import {
    AlertTriangle,
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    Image as ImageIcon,
    User,
    MapPin,
    ArrowLeft
} from "lucide-react";

import { useUserRole } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { FeatureGate } from "@/components/ui/FeatureGate";

export default function IncidentenBeheerPage() {
    const { userLoading, isPlannerOrAdmin } = useUserRole();

    const { data: incidentsData, isLoading, error } = useQuery({
        queryKey: ['admin-incidents'],
        queryFn: async () => {
            const res = await fetch("/api/incidents");
            if (!res.ok) throw new Error("Er ging iets mis met het ophalen van de incidenten.");
            return res.json();
        }
    });

    if (userLoading || isLoading) return <LoadingState />;

    if (!isPlannerOrAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-sm">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Geen Toegang</h2>
                    <p className="text-slate-500 mb-6">Je hebt beheerdersrechten nodig om deze pagina te bekijken.</p>
                    <a href="/" className="px-6 py-2 bg-slate-900 text-white rounded-xl inline-block">Terug naar Dashboard</a>
                </div>
            </div>
        );
    }

    const incidents = incidentsData?.incidents || [];

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="text-red-600" size={28} />
                                Incidentenbeheer
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Bekijk en beheer alle gemelde incidenten door beveiligers.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Zoeken..."
                                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-slate-600">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <FeatureGate
                    feature="incident_reporting"
                    title="Incidentrapportage is uitgeschakeld"
                    description="Upgrade naar het Growth schema (of hoger) om alle realtime incidenten te ontvangen en af te handelen."
                >
                    {error ? (
                        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
                            <AlertTriangle size={24} />
                            <p>{(error as Error).message}</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                            <th className="px-6 py-4 font-semibold">Tijdstip</th>
                                            <th className="px-6 py-4 font-semibold">Locatie/Klant</th>
                                            <th className="px-6 py-4 font-semibold">Medewerker</th>
                                            <th className="px-6 py-4 font-semibold w-1/3">Omschrijving</th>
                                            <th className="px-6 py-4 font-semibold text-center">Bijlage</th>
                                            <th className="px-6 py-4 font-semibold text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {incidents.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                                    <CheckCircle2 className="mx-auto text-slate-300 mb-3" size={48} />
                                                    <p className="font-medium text-slate-700">Geen incidenten gemeld.</p>
                                                    <p className="text-sm">Alles ziet er rustig uit!</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            incidents.map((inc: any) => (
                                                <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-slate-900 font-medium whitespace-nowrap">
                                                            <Calendar size={16} className="text-slate-400" />
                                                            {format(new Date(inc.date), "dd MMM yyyy, HH:mm", { locale: nl })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {inc.client_name ? (
                                                            <div className="flex items-center gap-2 text-slate-700">
                                                                <MapPin size={16} className="text-red-500" />
                                                                <span className="font-medium">{inc.client_name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Onbekend</span>
                                                        )}
                                                        {inc.assignment_name && (
                                                            <div className="text-sm text-slate-500 mt-0.5 ml-6">
                                                                {inc.assignment_name}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <User size={16} className="text-blue-500" />
                                                            {inc.employee_name || "Onbekend"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-700 text-sm line-clamp-2" title={inc.description}>
                                                            {inc.description}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {inc.photo_url ? (
                                                            <button
                                                                className="inline-flex items-center justify-center p-2 bg-slate-100 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                                                                title="Bekijk foto"
                                                            >
                                                                <ImageIcon size={18} />
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${inc.status === 'open'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {inc.status === 'open' ? 'Nieuw' : 'Afgehandeld'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </FeatureGate>
            </main>
        </div>
    );
}
