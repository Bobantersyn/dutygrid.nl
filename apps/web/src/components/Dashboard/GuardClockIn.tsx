"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Square, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export function GuardClockIn({ employeeId }: { employeeId: number }) {
    const queryClient = useQueryClient();
    const [locationError, setLocationError] = useState("");
    const [isLocating, setIsLocating] = useState(false);

    // Fetch today's shifts
    const today = new Date().toISOString().split("T")[0];
    const { data: shifts, isLoading } = useQuery({
        queryKey: ["today-shifts", employeeId],
        queryFn: async () => {
            const res = await fetch(`/api/planning?start_date=${today}&end_date=${today}`);
            if (!res.ok) throw new Error("Fout bij ophalen diensten");
            const data = await res.json();
            return data.filter((s: any) => s.employee_id === employeeId);
        }
    });

    const clockMutation = useMutation({
        mutationFn: async ({ shiftId, type, lat, lng }: { shiftId: number, type: 'in' | 'out', lat: number, lng: number }) => {
            const now = new Date().toISOString();
            const payload: any = { id: shiftId };

            if (type === 'in') {
                payload.actual_start_time = now;
                payload.clock_in_lat = lat;
                payload.clock_in_lng = lng;
                payload.status = 'in_progress';
            } else {
                payload.actual_end_time = now;
                payload.clock_out_lat = lat;
                payload.clock_out_lng = lng;
                payload.status = 'completed';
            }

            const res = await fetch('/api/hours', {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Fout bij inklokken");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["today-shifts"] });
        },
        onError: (err: any) => {
            setLocationError(err.message);
        }
    });

    const handleClockAction = (shift: any, type: 'in' | 'out') => {
        setLocationError("");
        setIsLocating(true);

        if (!navigator.geolocation) {
            setLocationError("Geolocatie wordt niet ondersteund door je browser.");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                clockMutation.mutate({
                    shiftId: shift.id,
                    type,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                setIsLocating(false);
                console.error("Geolocation error:", error);
                setLocationError("Kan locatie niet ophalen. Controleer je toestemmingen.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    if (isLoading) return null;

    // Find the relevant shift for today. Prefer started shifts.
    const activeShift = shifts?.find((s: any) => s.actual_start_time && !s.actual_end_time)
        || shifts?.find((s: any) => !s.actual_start_time)
        || shifts?.[0];

    if (!activeShift) return null;

    const hasStarted = !!activeShift.actual_start_time;
    const hasFinished = !!activeShift.actual_end_time;
    const startTimeFormatted = format(new Date(activeShift.start_time), "HH:mm");
    const endTimeFormatted = format(new Date(activeShift.end_time), "HH:mm");

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <MapPin size={100} />
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">Dienst Vandaag</h2>
            <div className="text-slate-500 text-sm mb-4">
                {startTimeFormatted} - {endTimeFormatted}
                {activeShift.assignment_name && ` • ${activeShift.assignment_name}`}
            </div>

            {hasFinished ? (
                <div className="p-4 bg-green-50 rounded-xl text-green-700 font-medium text-center border border-green-100">
                    Dienst afgerond! Goed gewerkt.
                </div>
            ) : (
                <button
                    onClick={() => handleClockAction(activeShift, hasStarted ? 'out' : 'in')}
                    disabled={isLocating || clockMutation.isPending}
                    className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${hasStarted
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                        } disabled:opacity-75 disabled:active:scale-100`}
                >
                    {isLocating || clockMutation.isPending ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : hasStarted ? (
                        <>
                            <Square fill="currentColor" size={20} />
                            Uitklokken
                        </>
                    ) : (
                        <>
                            <Play fill="currentColor" size={20} />
                            Inklokken
                        </>
                    )}
                </button>
            )}

            {locationError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{locationError}</p>
                </div>
            )}

            {activeShift.is_geofence_violation && (
                <div className="mt-4 p-3 bg-orange-50 text-orange-700 text-sm rounded-lg flex items-start gap-2 border border-orange-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{activeShift.geofence_violation_details}</p>
                </div>
            )}
        </div>
    );
}
