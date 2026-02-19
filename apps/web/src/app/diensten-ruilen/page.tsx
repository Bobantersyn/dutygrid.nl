'use client';
import { useUserRole } from '@/hooks/useUserRole';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SwapRequestModal from '@/components/ShiftSwaps/SwapRequestModal';

export default function DienstenRuilenPage() {
  const { user, userRole, employeeId, loading } = useUserRole();
  const [selectedShift, setSelectedShift] = useState(null);

  // Queries
  const { data: myShifts, isLoading: loadingShifts } = useQuery({
    queryKey: ['my-shifts', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const res = await fetch(`/api/shifts?employee_id=${employeeId}&future_only=true`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!employeeId
  });

  const { data: myRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['swap-requests', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const res = await fetch(`/api/shift-swaps?employee_id=${employeeId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!employeeId
  });

  if (loading) return <div className="p-8">Laden...</div>;
  if (!employeeId) return <div className="p-8">Geen toegang (geen medewerker profiel).</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Diensten Ruilen</h1>
      </div>

      {/* Sectie 1: Eigen Diensten */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Mijn Komende Diensten</h2>
        {loadingShifts ? <p>Laden...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myShifts?.map(shift => (
              <div key={shift.id} className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold">{new Date(shift.shift_date).toLocaleDateString()}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded uppercase">{shift.shift_type}</span>
                </div>
                <p className="text-gray-600 mb-4">{shift.start_time?.slice(0, 5)} - {shift.end_time?.slice(0, 5)}</p>
                <p className="text-sm text-gray-500 mb-4">{shift.location_name}</p>

                <button
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  onClick={() => setSelectedShift(shift)}
                >
                  Aanbieden
                </button>
              </div>
            ))}
            {myShifts?.length === 0 && <p className="text-gray-500 italic">Geen komende diensten.</p>}
          </div>
        )}
      </section>

      {/* Sectie 2: Mijn Aanvragen */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Status Aanvragen</h2>
        {loadingRequests ? <p>Laden...</p> : (
          <div className="space-y-3">
            {myRequests?.map(req => (
              <div key={req.id} className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg">
                <div>
                  <p className="font-medium">{new Date(req.shift_date).toLocaleDateString()} - {req.location_name}</p>
                  <p className="text-sm text-gray-600">Type: {req.swap_type}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                    req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
            {myRequests?.length === 0 && <p className="text-gray-500 italic">Nog geen aanvragen ingediend.</p>}
          </div>
        )}
      </section>

      {/* Modal */}
      <SwapRequestModal
        open={!!selectedShift}
        onOpenChange={() => setSelectedShift(null)}
        shift={selectedShift}
      />
    </div>
  );
}
