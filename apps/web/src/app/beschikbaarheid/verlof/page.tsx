"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { ArrowLeft, CalendarRange, Clock, AlertCircle, CheckCircle2, XCircle, Send } from 'lucide-react';

export default function LeaveRequestsPage() {
    const { user } = useAuthContext();
    // Use an explicit type so TypeScript knows what's inside the array
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [type, setType] = useState('vakantie');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

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

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/leave-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, startDate, endDate, reason })
            });

            if (res.ok) {
                // Reset form
                setStartDate('');
                setEndDate('');
                setReason('');
                setType('vakantie');
                // Refresh list
                fetchRequests();
                alert('Aanvraag succesvol verzonden!');
            } else {
                const data = await res.json();
                alert('Fout bij verzenden: ' + (data.error || 'Onbekend'));
            }
        } catch (error) {
            alert('Netwerk fout');
        } finally {
            setSubmitting(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'approved': return <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200"><CheckCircle2 size={12} /> Goedgekeurd</span>;
            case 'rejected': return <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200"><XCircle size={12} /> Afgewezen</span>;
            default: return <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200"><Clock size={12} /> In afwachting</span>;
        }
    };

    const TypeBadge = ({ type }: { type: string }) => {
        const bg = type === 'vakantie' ? 'bg-blue-100 text-blue-800' : type === 'ziek' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
        return <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize \${bg}`}>{type}</span>;
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-20">
            {/* Contextual Header */}
            <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-slate-200 flex items-center gap-3">
                <a href="/" className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full transition">
                    <ArrowLeft size={20} />
                </a>
                <h1 className="text-lg font-bold text-slate-900">Mijn Aanvragen</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Submit New Request Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-blue-50/50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <CalendarRange size={16} className="text-blue-600" />
                            Nieuwe Aanvraag
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Type Aanvraag</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {['vakantie', 'ziek', 'anders'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`flex-1 text-sm font-medium py-2 rounded-md capitalize transition \${type === t ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Van</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Tot en met</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Opmerking (Optioneel)</label>
                            <textarea
                                rows={2}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder={type === 'vakantie' ? "Bijv: Zomervakantie buitenland" : "Bijv: Griep / Niet inzetbaar"}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Verzenden...' : <><Send size={16} /> Verzoek Indienen</>}
                        </button>
                    </form>
                </div>

                {/* History List */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 px-1 uppercase tracking-wide">Geschiedenis</h3>

                    {loading ? (
                        <div className="text-center py-8 text-slate-500 text-sm">Aanvragen laden...</div>
                    ) : requests.length === 0 ? (
                        <div className="bg-white border text-center border-dashed border-slate-300 rounded-xl p-8">
                            <AlertCircle size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500 text-sm">Je hebt nog geen aanvragen in het systeem staan.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <TypeBadge type={req.type} />
                                            <span className="font-semibold text-slate-900 mt-1">
                                                {new Date(req.start_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                                                {' '} - {' '}
                                                {new Date(req.end_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>
                                    {req.reason && (
                                        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                            "{req.reason}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
