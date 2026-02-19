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

    const { data: shifts, isLoading } = useQuery({
        queryKey: ["hours", month],
        queryFn: async () => {
            const res = await fetch(`/api/hours?month=${month}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch("/api/hours", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["hours"]);
            setEditingId(null);
        },
        onError: (err) => {
            alert(`Fout bij opslaan: ${err.message}`);
        }
    });

    const handleSave = (shift) => {
        // Construct timestamps
        const date = new Date(shift.start_time).toISOString().split("T")[0];
        const actualStart = editValues.actual_start ? `${date}T${editValues.actual_start}:00` : null;
        const actualEnd = editValues.actual_end ? `${date}T${editValues.actual_end}:00` : null;
        // Handle overnight for end time if needed (simplified here)

        updateMutation.mutate({
            id: shift.id,
            actual_start_time: actualStart,
            actual_end_time: actualEnd,
            actual_break_minutes: parseInt(editValues.actual_break || 0),
            status: 'verified' // Auto verify on save
        });
    };

    const startEdit = (shift) => {
        setEditingId(shift.id);
        setEditValues({
            actual_start: shift.actual_start_time ? new Date(shift.actual_start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : new Date(shift.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            actual_end: shift.actual_end_time ? new Date(shift.actual_end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : new Date(shift.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            actual_break: shift.actual_break_minutes ?? shift.break_minutes
        });
    };

    const handleExport = () => {
        window.location.href = `/api/hours/export?month=${month}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Urenverantwoording</h1>
                        <p className="text-gray-600">Controleer en fiatteer gewerkte uren</p>
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
                        <div className="p-8 text-center">Laden...</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-3">Datum</th>
                                    <th className="px-4 py-3">Medewerker</th>
                                    <th className="px-4 py-3">Gepland</th>
                                    <th className="px-4 py-3">Werkelijk (Tijden)</th>
                                    <th className="px-4 py-3">Pauze</th>
                                    <th className="px-4 py-3">Totaal</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {shifts?.map(shift => {
                                    const isEditing = editingId === shift.id;
                                    const plannedStr = `${new Date(shift.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} - ${new Date(shift.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;

                                    return (
                                        <tr key={shift.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {new Date(shift.start_time).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900">{shift.employee_name}</td>
                                            <td className="px-4 py-3 text-gray-500">{plannedStr}</td>

                                            {/* Actuals Input/Display */}
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <div className="flex gap-1 items-center">
                                                        <input
                                                            type="time"
                                                            value={editValues.actual_start}
                                                            onChange={e => setEditValues({ ...editValues, actual_start: e.target.value })}
                                                            className="w-20 border rounded px-1 py-0.5"
                                                        />
                                                        <span>-</span>
                                                        <input
                                                            type="time"
                                                            value={editValues.actual_end}
                                                            onChange={e => setEditValues({ ...editValues, actual_end: e.target.value })}
                                                            className="w-20 border rounded px-1 py-0.5"
                                                        />
                                                    </div>
                                                ) : (
                                                    shift.actual_start_time ? (
                                                        <span className={shift.actual_duration !== shift.planned_duration ? 'text-orange-600 font-medium' : 'text-green-600'}>
                                                            {new Date(shift.actual_start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} -
                                                            {new Date(shift.actual_end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    ) : <span className="text-gray-400 italic">--:--</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <input
                                                        type="number" className="w-12 border rounded px-1"
                                                        value={editValues.actual_break}
                                                        onChange={e => setEditValues({ ...editValues, actual_break: e.target.value })}
                                                    />
                                                ) : (shift.actual_break_minutes ?? shift.break_minutes)}m
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {shift.actual_duration > 0 ? shift.actual_duration.toFixed(2) : shift.planned_duration.toFixed(2)}u
                                            </td>

                                            <td className="px-4 py-3">
                                                <StatusBadge status={shift.status} />
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                {isEditing ? (
                                                    <button onClick={() => handleSave(shift)} className="text-green-600 hover:bg-green-50 p-1.5 rounded mr-1">
                                                        <Save size={16} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => startEdit(shift)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded mr-1">
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
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

function StatusBadge({ status }) {
    if (status === 'verified') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" />Geverifieerd</span>;
    if (status === 'completed') return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"><Clock size={12} className="mr-1" />Gewerkt</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Gepland</span>;
}
