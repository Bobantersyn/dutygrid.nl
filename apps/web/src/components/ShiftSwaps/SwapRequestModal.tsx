'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';

export default function SwapRequestModal({ open, onOpenChange, shift }) {
    const queryClient = useQueryClient();
    const [reason, setReason] = useState('');
    const [selectedTarget, setSelectedTarget] = useState(null); // null = open for all

    // Fetch suggestions
    const { data: suggestions } = useQuery({
        queryKey: ['swap-suggestions', shift?.id],
        queryFn: async () => {
            if (!shift) return [];
            const res = await fetch(`/api/shift-swaps/suggestions/${shift.id}`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!shift && open
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/shift-swaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shift_id: shift.id,
                    swap_type: 'takeover',
                    target_employee_id: selectedTarget,
                    reason: reason
                })
            });
            if (!res.ok) throw new Error('Failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['my-shifts']);
            queryClient.invalidateQueries(['swap-requests']);
            onOpenChange(false);
            alert('Aanvraag ingediend!');
        }
    });

    if (!shift || !open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Dienst Aanbieden voor Overname</h2>
                    <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="p-3 bg-gray-50 rounded text-sm">
                        <p><strong>Datum:</strong> {new Date(shift.shift_date).toLocaleDateString()}</p>
                        <p><strong>Tijd:</strong> {shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}</p>
                        <p><strong>Locatie:</strong> {shift.location_name}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Reden (optioneel):</label>
                        <textarea
                            className="w-full border rounded p-2 text-sm"
                            placeholder="Wegens omstandigheden..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Vervangingssuggesties:</label>
                        {!suggestions ? <p className="text-sm text-gray-400">Laden...</p> : (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {suggestions.map(emp => (
                                    <div
                                        key={emp.employee_id}
                                        onClick={() => setSelectedTarget(emp.employee_id === selectedTarget ? null : emp.employee_id)}
                                        className={`p-2 border rounded flex justify-between items-center cursor-pointer ${selectedTarget === emp.employee_id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{emp.employee_name}</p>
                                            <p className="text-xs text-gray-500">Score: {emp.score}</p>
                                        </div>
                                        {selectedTarget === emp.employee_id && <Check className="w-4 h-4 text-blue-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {selectedTarget ? "Specifieke collega geselecteerd" : "Standaard: Open voor iedereen"}
                        </p>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded hover:bg-gray-50"
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Bezig...' : 'Aanvraag Indienen'}
                    </button>
                </div>
            </div>
        </div>
    );
}
