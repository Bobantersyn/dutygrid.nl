'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus } from 'lucide-react';

export default function ExceptionsList({ employeeId }) {
    const queryClient = useQueryClient();
    const [newDate, setNewDate] = useState('');
    const [reason, setReason] = useState('');

    const { data: exceptions, isLoading } = useQuery({
        queryKey: ['availability-exceptions', employeeId],
        queryFn: async () => {
            const res = await fetch(`/api/availability/exceptions?employee_id=${employeeId}`);
            if (!res.ok) throw new Error('Failed');
            return res.json();
        }
    });

    const addMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/availability/exceptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId,
                    exception_date: newDate,
                    is_available: false, // Default to 'not available' aka Holiday
                    reason: reason || 'Vrij'
                })
            });
            if (!res.ok) throw new Error('Failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['availability-exceptions', employeeId]);
            setNewDate('');
            setReason('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await fetch(`/api/availability/exceptions?id=${id}`, { method: 'DELETE' });
        },
        onSuccess: () => queryClient.invalidateQueries(['availability-exceptions', employeeId])
    });

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Nieuwe Uitzondering Toevoegen</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="date"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        className="border rounded px-3 py-2 bg-white"
                    />
                    <input
                        type="text"
                        placeholder="Reden (bijv. Vakantie)"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="border rounded px-3 py-2 bg-white"
                    />
                    <button
                        onClick={() => addMutation.mutate()}
                        disabled={!newDate}
                        className="bg-black text-white hover:bg-gray-800 rounded px-4 py-2 flex items-center justify-center disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Toevoegen
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? <p>Laden...</p> : exceptions?.length === 0 ? <p className="text-gray-500 italic">Geen uitzonderingen gepland.</p> : (
                    exceptions.map(exc => (
                        <div key={exc.id} className="flex justify-between items-center p-4 bg-white border rounded-lg border-l-4 border-l-red-500">
                            <div>
                                <p className="font-bold">{new Date(exc.exception_date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">{exc.reason}</p>
                            </div>
                            <button
                                onClick={() => deleteMutation.mutate(exc.id)}
                                className="text-red-600 hover:bg-red-50 p-2 rounded"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
