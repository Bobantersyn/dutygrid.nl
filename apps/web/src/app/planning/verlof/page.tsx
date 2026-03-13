"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { ArrowLeft, CheckCircle2, XCircle, Clock, CalendarRange, User } from 'lucide-react';

export default function PlannerLeaveRequestsPage() {
    const { user } = useAuthContext();
    // Use an explicit type so TypeScript knows what's inside the array
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/leave-requests');
            const data = await res.json();
            if (res.ok) {
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: number, status: 'approved' | 'rejected') => {
        if (!confirm(`Weet je zeker dat je dit verzoek wilt ${status === 'approved' ? 'goedkeuren' : 'afwijzen'}?`)) return;

        try {
            const res = await fetch(`/api/leave-requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Refresh list
                fetchRequests();
                // Optionally show a success toast here
            } else {
                const data = await res.json();
                alert('Fout bij verwerken: ' + (data.error || 'Onbekend'));
            }
        } catch (error) {
            alert('Netwerk fout bij het verwerken van het verzoek');
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'approved': return <span className="flex w-fit items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"><CheckCircle2 size={14} /> Goedgekeurd</span>;
            case 'rejected': return <span className="flex w-fit items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200"><XCircle size={14} /> Afgewezen</span>;
            default: return <span className="flex w-fit items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"><Clock size={14} /> In afwachting</span>;
        }
    };

    const TypeBadge = ({ type }: { type: string }) => {
        const bg = type === 'vakantie' ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : type === 'ziek' ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200';
        return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${bg}`}>{type}</span>;
    };

    // Split requests by status for better UI grouping
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const historyRequests = requests.filter(r => r.status !== 'pending');

    return (
        <div className="max-w-5xl mx-auto min-h-screen bg-slate-50/50 p-4 md:p-8">

            <div className="flex items-center gap-4 mb-8">
                <a href="/planning" className="p-2 -ml-2 text-slate-500 hover:bg-slate-200 rounded-full transition bg-white border border-slate-200 shadow-sm">
                    <ArrowLeft size={20} />
                </a>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verlofaanvragen</h1>
                    <p className="text-sm text-slate-500 mt-1">Beoordeel en beheer verlof en ziekmeldingen van medewerkers.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Pending Section */}
                <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock className="text-orange-500" size={20} />
                        Te Beoordelen ({pendingRequests.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-xl border border-slate-200 shadow-sm">Data ophalen...</div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="bg-white border text-center border-dashed border-slate-300 rounded-xl p-12 shadow-sm">
                            <CheckCircle2 size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">Alle aanvragen zijn weggewerkt!</p>
                            <p className="text-slate-400 text-sm mt-1">Klaar voor nu.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <User size={18} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{req.employee_name}</h3>
                                                    <TypeBadge type={req.type} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                <CalendarRange size={16} className="text-slate-400 flex-shrink-0" />
                                                <span className="font-medium">
                                                    {new Date(req.start_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                    {' '} - {' '}
                                                    {new Date(req.end_date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>

                                            {req.reason && (
                                                <div className="text-sm text-slate-600 italic border-l-2 border-orange-200 pl-3 py-1 break-words">
                                                    "{req.reason}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-slate-50/80 border-t border-slate-100 p-3 flex gap-3 mt-auto">
                                        <button
                                            onClick={() => handleReview(req.id, 'rejected')}
                                            className="flex-1 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                                        >
                                            Afwijzen
                                        </button>
                                        <button
                                            onClick={() => handleReview(req.id, 'approved')}
                                            className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-sm rounded-lg transition"
                                        >
                                            Goedkeuren
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* History Section */}
                {historyRequests.length > 0 && (
                    <section className="pt-8 border-t border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Recente Geschiedenis</h2>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                            {historyRequests.map(req => (
                                <div key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                                            <User size={18} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{req.employee_name} <span className="font-normal text-slate-500 text-sm ml-2">({req.type})</span></h3>
                                            <p className="text-sm text-slate-600 mt-0.5">
                                                {new Date(req.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} t/m {new Date(req.end_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                                        <StatusBadge status={req.status} />
                                        <span className="text-xs text-slate-400">
                                            Aangevraagd op {new Date(req.created_at).toLocaleDateString('nl-NL')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
