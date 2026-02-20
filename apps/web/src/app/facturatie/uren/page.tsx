"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    FileDown, CheckCircle, Clock, Building2, MapPin, ChevronDown, ChevronRight, ArrowLeft
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { LoadingState } from "@/components/Dashboard/LoadingState";

export default function BillingPage() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({});

    const { data: billingData, isLoading } = useQuery({
        queryKey: ["billing-report", month],
        queryFn: async () => {
            const res = await fetch(`/api/reports/billing?month=${month}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const toggleClient = (clientId: string) => {
        setExpandedClients(prev => ({
            ...prev,
            [clientId]: !prev[clientId]
        }));
    };

    const handleExport = () => {
        // We will create the export endpoint next
        window.location.href = `/api/reports/billing/export?month=${month}`;
    };

    if (isLoading) return <LoadingState />;

    const totalBilledHours = billingData?.reduce((sum: number, client: any) => sum + Number(client.total_client_hours), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader isPlannerOrAdmin={true} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/administratie" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="text-blue-600" size={24} />
                                Klant Facturatie
                            </h1>
                            <p className="text-gray-600 text-sm mt-0.5">Overzicht van te factureren uren per opdrachtgever</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex items-center">
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="border-none bg-transparent rounded-lg px-4 py-2 font-medium text-slate-800 focus:ring-0 outline-none"
                            />
                        </div>

                        <button
                            onClick={handleExport}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
                        >
                            <FileDown size={18} />
                            Exporteer CSV
                        </button>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-8 flex items-center gap-6 max-w-sm">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Totaal Te Factureren Uren</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">
                            {totalBilledHours.toFixed(2)}
                            <span className="text-lg text-slate-400 font-normal ml-1">uur</span>
                        </p>
                    </div>
                </div>

                {/* Billing List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {billingData?.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 text-lg">Geen gefactureerde uren gevonden voor deze maand.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {billingData?.map((client: any) => (
                                <div key={client.client_id} className="group">
                                    {/* Client Row (Clickable) */}
                                    <div
                                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => toggleClient(client.client_id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                                                {expandedClients[client.client_id] ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{client.client_name}</h3>
                                                <p className="text-sm text-slate-500">{client.assignments.length} actieve klussen deze maand</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-blue-600">{Number(client.total_client_hours).toFixed(2)} uur</p>
                                            <p className="text-sm text-slate-500">Totaal voor klant</p>
                                        </div>
                                    </div>

                                    {/* Expanded Assignments Area */}
                                    {expandedClients[client.client_id] && (
                                        <div className="bg-slate-50/50 p-6 pt-2 pb-6 border-t border-slate-100">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 ml-12">Onderliggende Opdrachten</h4>

                                            <div className="space-y-3 ml-12">
                                                {client.assignments.map((assignment: any) => (
                                                    <div key={assignment.assignment_id} className="bg-white border text-center flex items-center justify-between border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <MapPin size={18} className="text-slate-400" />
                                                            <span className="font-semibold text-slate-800">{assignment.assignment_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <p className="text-sm font-medium text-slate-600">{assignment.total_shifts} diensten</p>
                                                            </div>
                                                            <div className="text-right w-24">
                                                                <p className="font-bold text-slate-900">{Number(assignment.total_hours).toFixed(2)} uur</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
