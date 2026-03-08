"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { AlertTriangle, MapPin, Calendar, CheckCircle2, User, ArrowLeft } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { FeatureGate } from "@/components/ui/FeatureGate";

export default function GeofenceAfwijkingenPage() {
    const { userLoading, isPlannerOrAdmin } = useUserRole();

    const { data: shifts, isLoading, error } = useQuery({
        queryKey: ['geofence-violations'],
        queryFn: async () => {
            const res = await fetch("/api/hours?month=all"); // We could create a dedicated endpoint, but this gets the data for now.
            if (!res.ok) throw new Error("Er ging iets mis met het ophalen van de uren.");
            const data = await res.json();
            return data.filter((s: any) => s.is_geofence_violation);
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

    const violations = shifts || [];

    return (
        <div className="min-h-screen bg-slate-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/administratie" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="text-orange-500" size={28} />
                                Afwijkende Locaties
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Overzicht van inklok-momenten buiten het vastgestelde geofence gebied.
                            </p>
                        </div>
                    </div>
                </div>

                <FeatureGate
                    feature="gps_tracking_geofencing"
                    title="GPS Tracking is uitgeschakeld"
                    description="Upgrade naar het Professional schema om geofencing waarschuwingen en locatie-validatie in te schakelen voor je medewerkers."
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
                                            <th className="px-6 py-4 font-semibold">Medewerker</th>
                                            <th className="px-6 py-4 font-semibold">Locatie/Klant</th>
                                            <th className="px-6 py-4 font-semibold w-1/3">Constatering</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {violations.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                    <CheckCircle2 className="mx-auto text-emerald-400 mb-3" size={48} />
                                                    <p className="font-medium text-slate-700">Geen afwijkingen gevonden.</p>
                                                    <p className="text-sm">Alle medewerkers zijn netjes op locatie ingeklokt!</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            violations.map((shift: any) => (
                                                <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-slate-900 font-medium whitespace-nowrap">
                                                            <Calendar size={16} className="text-slate-400" />
                                                            {format(new Date(shift.actual_start_time || shift.start_time), "dd MMM yyyy, HH:mm", { locale: nl })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <User size={16} className="text-blue-500" />
                                                            {shift.employee_name || "Onbekend"}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <span className="font-medium">{shift.location_name || 'Geen vaste locatie toegewezen'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="p-3 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 flex items-start gap-2">
                                                            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-orange-500" />
                                                            <p>{shift.geofence_violation_details || 'Buiten geofence radius ingeklokt.'}</p>
                                                        </div>
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
