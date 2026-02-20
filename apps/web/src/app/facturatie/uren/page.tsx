"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    FileDown, CheckCircle, AlertCircle, Clock, Save, Edit2
} from "lucide-react";

export default function HoursPage() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const queryClient = useQueryClient();

    const { data: reportData, isLoading } = useQuery({
        queryKey: ["hours-report", month],
        queryFn: async () => {
            const res = await fetch(`/api/reports/hours?month=${month}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/hours", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hours-report"] });
            setEditingId(null);
        },
        onError: (err: Error) => {
            alert(`Fout bij opslaan: ${err.message}`);
        }
    });

    const handleSave = (record: any) => {
        // Construct timestamps
        const date = new Date(record.start_time).toISOString().split("T")[0];
        const actualStart = (editValues as any).actual_start ? `${date}T${(editValues as any).actual_start}:00` : null;
        const actualEnd = (editValues as any).actual_end ? `${date}T${(editValues as any).actual_end}:00` : null;
        // Handle overnight for end time if needed (simplified here)

        updateMutation.mutate({
            id: record.id,
            actual_start_time: actualStart,
            actual_end_time: actualEnd,
            actual_break_minutes: parseInt((editValues as any).actual_break || 0),
            status: 'verified' // Auto verify on save
        } as any);
    };

    const startEdit = (record: any) => {
        setEditingId(record.id);
        setEditValues({
            actual_start: record.actual_start_time ? new Date(record.actual_start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : new Date(record.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            actual_end: record.actual_end_time ? new Date(record.actual_end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : new Date(record.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            actual_break: record.actual_break_minutes ?? record.break_minutes
        });
    };

    const handleExport = () => {
        window.location.href = `/api/reports/hours/export?month=${month}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Urenverantwoording & Rapportage</h1>
                        <p className="text-gray-600">Overzicht van ingeplande en gewerkte uren t.o.v. CAO</p>
                    </div>
                    <div className="flex gap-4">
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="border rounded-lg px-3 py-2 bg-white shadow-sm"
                        />
                        <button
                            onClick={handleExport}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <FileDown size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Gegevens laden...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-3">Medewerker</th>
                                    <th className="px-4 py-3">Geplande Uren</th>
                                    <th className="px-4 py-3">Gewerkte Uren</th>
                                    <th className="px-4 py-3">Contract/Maand</th>
                                    <th className="px-4 py-3">Overuren / Tekort</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportData?.map((record: any) => {
                                    const isOvertime = parseFloat(record.overtime_hours) > 0;

                                    return (
                                        <tr key={record.employee_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{record.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{parseFloat(record.total_planned_hours).toFixed(2)}u</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">{parseFloat(record.total_actual_hours).toFixed(2)}u</td>
                                            <td className="px-4 py-3 text-gray-500">{parseFloat(record.expected_monthly_hours).toFixed(2)}u</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOvertime ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                    {isOvertime ? '+' : ''}{parseFloat(record.overtime_hours).toFixed(2)}u
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'verified') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Geverifieerd</span>;
    if (status === 'completed') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"><Clock size={12} className="mr-1" />Gewerkt</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Gepland</span>;
}
