'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock } from 'lucide-react';

const DAYS = [
    'Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'
];

export default function WeekPattern({ employeeId }) {
    const queryClient = useQueryClient();
    const [localPatterns, setLocalPatterns] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    // Fetch logic
    const { data: patterns, isLoading } = useQuery({
        queryKey: ['availability-patterns', employeeId],
        queryFn: async () => {
            const res = await fetch(`/api/availability/patterns?employee_id=${employeeId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        }
    });

    // Init local state
    useEffect(() => {
        if (patterns) {
            const initial = {};
            DAYS.forEach((_, index) => {
                const found = patterns.find(p => p.day_of_week === index);
                initial[index] = found || {
                    day_of_week: index,
                    is_available: false,
                    start_time: '09:00',
                    end_time: '17:00'
                };
            });
            setLocalPatterns(initial);
            setIsDirty(false);
        }
    }, [patterns]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (newPatterns) => {
            const payload = {
                employee_id: employeeId,
                patterns: Object.values(newPatterns)
            };
            const res = await fetch('/api/availability/patterns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Save failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['availability-patterns', employeeId]);
            setIsDirty(false);
            alert('Beschikbaarheid opgeslagen!');
        }
    });

    const handleChange = (dayIndex, field, value) => {
        setLocalPatterns(prev => ({
            ...prev,
            [dayIndex]: { ...prev[dayIndex], [field]: value }
        }));
        setIsDirty(true);
    };

    if (isLoading) return <div>Laden...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {/* The original comment block for re-ordering indices is removed as it's handled by the map below */}

                {/* Render ordered: Mon(1) -> Sun(0) */}
                {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
                    const dayData = localPatterns[dayIndex] || {};
                    const isAvailable = dayData.is_available;

                    return (
                        <div key={dayIndex} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                            <div className="flex items-center space-x-4">
                                {/* Custom Switch Replacement */}
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAvailable || false}
                                        onChange={(e) => handleChange(dayIndex, 'is_available', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>

                                <span className="font-medium w-24">{DAYS[dayIndex]}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                {isAvailable ? (
                                    <>
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <input
                                            type="time"
                                            value={dayData.start_time?.slice(0, 5)}
                                            onChange={(e) => handleChange(dayIndex, 'start_time', e.target.value)}
                                            className="border rounded px-2 py-1 text-sm bg-white"
                                        />
                                        <span>-</span>
                                        <input
                                            type="time"
                                            value={dayData.end_time?.slice(0, 5)}
                                            onChange={(e) => handleChange(dayIndex, 'end_time', e.target.value)}
                                            className="border rounded px-2 py-1 text-sm bg-white"
                                        />
                                    </>
                                ) : (
                                    <span className="text-gray-400 text-sm">Niet beschikbaar</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => saveMutation.mutate(localPatterns)}
                disabled={!isDirty || saveMutation.isPending}
                className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${!isDirty || saveMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {saveMutation.isPending ? 'Opslaan...' : 'Wijzigingen Opslaan'}
            </button>
        </div>
    );
}
