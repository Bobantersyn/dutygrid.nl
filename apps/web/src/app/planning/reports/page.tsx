"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    FileText,
    Download,
    ChevronLeft,
    ChevronRight,
    Calendar,
    AlertCircle,
    TrendingUp,
    Clock,
    User,
    ArrowLeft
} from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { LoadingState } from "@/components/Dashboard/LoadingState";

export default function ReportsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Format YYYY-MM
    const monthStr = currentDate.toISOString().slice(0, 7);

    const { data: reportData, isLoading, error } = useQuery({
        queryKey: ['hours-report', monthStr],
        queryFn: async () => {
            const res = await fetch(`/api/reports/hours?month=${monthStr}`);
            if (!res.ok) throw new Error('Failed to fetch report');
            return res.json();
        }
    });

    const navigateMonth = (delta: number) => {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + delta);
        setCurrentDate(next);
    };

    const handleExport = () => {
        window.open(`/api/reports/hours/export?month=${monthStr}`, '_blank');
    };

    const monthLabel = currentDate.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });

    if (isLoading) return <LoadingState />;

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader isPlannerOrAdmin={true} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <a href="/" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="text-blue-600" size={24} />
                                Urenregistratie & Rapportage
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5">Overzicht van gewerkte uren per medewerker</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-4 font-semibold text-slate-900 flex items-center gap-2 min-w-[150px] justify-center">
                            <Calendar size={18} className="text-blue-500" />
                            {monthLabel}
                        </div>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                    >
                        <Download size={18} />
                        <span>Exporteer CSV</span>
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-center gap-4 text-red-700">
                        <AlertCircle />
                        <p>Er is een fout opgetreden bij het laden van de rapportage.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <SummaryCard
                                icon={<User className="text-blue-600" />}
                                label="Totaal Medewerkers"
                                value={reportData?.length || 0}
                                color="blue"
                            />
                            <SummaryCard
                                icon={<Clock className="text-green-600" />}
                                label="Totaal Gewerkte Uren"
                                value={Math.round(reportData?.reduce((acc: number, r: any) => acc + Number(r.total_actual_hours), 0) || 0)}
                                unit="uur"
                                color="green"
                            />
                            <SummaryCard
                                icon={<TrendingUp className="text-orange-600" />}
                                label="Geschatte Overuren"
                                value={Math.max(0, Math.round(reportData?.reduce((acc: number, r: any) => acc + Number(r.overtime_hours), 0) || 0))}
                                unit="uur"
                                color="orange"
                            />
                        </div>

                        {/* Reports Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Medewerker</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Contract (Mnd)</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Gepland</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Gerealiseerd</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Overuren</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reportData?.map((row: any) => (
                                            <tr key={row.employee_id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                                            {row.name.substring(0, 2)}
                                                        </div>
                                                        <span className="font-semibold text-slate-900">{row.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-slate-600">
                                                    {Math.round(row.expected_monthly_hours)}u
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                        {Number(row.total_planned_hours).toFixed(1)}u
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {Number(row.total_actual_hours).toFixed(1)}u
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-bold ${row.overtime_hours > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                                                        {row.overtime_hours > 0 ? `+${Number(row.overtime_hours).toFixed(1)}` : '0.0'}u
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {reportData?.length === 0 && (
                                <div className="p-12 text-center">
                                    <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                                    <p className="text-slate-500">Geen data beschikbaar voor deze periode.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function SummaryCard({ icon, label, value, unit = "", color }: any) {
    const colorClasses: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600"
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {value}
                    {unit && <span className="text-sm text-slate-400 font-normal ml-1">{unit}</span>}
                </p>
            </div>
        </div>
    );
}
