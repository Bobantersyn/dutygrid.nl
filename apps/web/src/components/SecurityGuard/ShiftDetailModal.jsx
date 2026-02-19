import { useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  X,
  ArrowLeftRight,
} from "lucide-react";

export function ShiftDetailModal({ shift, onClose }) {
  const { data: colleaguesData } = useQuery({
    queryKey: ["shift-colleagues", shift?.id],
    queryFn: async () => {
      if (!shift || !shift.assignment_id) return [];

      const response = await fetch(
        `/api/shifts?start_date=${shift.shift_date}&end_date=${shift.shift_date}&assignment_id=${shift.assignment_id}`,
      );
      if (!response.ok) return [];
      const data = await response.json();

      return data.shifts.filter(
        (s) =>
          s.id !== shift.id &&
          s.start_time === shift.start_time &&
          s.end_time === shift.end_time,
      );
    },
    enabled: !!shift && !!shift.assignment_id,
  });

  const colleagues = colleaguesData || [];

  const { isPlannerOrAdmin } = useUserRole();

  if (!shift) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-purple-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Dienst Details
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(shift.shift_date).toLocaleDateString("nl-NL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Time */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Clock className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600 font-medium">Tijd</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                </p>
                {shift.shift_type && (
                  <p className="text-sm text-purple-600 font-semibold mt-1">
                    {shift.shift_type === "nacht"
                      ? "🌙 Nachtdienst"
                      : shift.shift_type === "evenement"
                        ? "🎉 Evenement"
                        : shift.shift_type === "object"
                          ? "🏢 Objectbeveiliging"
                          : "☀️ Dagdienst"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          {shift.location_name && (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <MapPin className="text-orange-600 mt-1" size={24} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Locatie</p>
                  <p className="text-xl font-bold text-gray-900">
                    {shift.location_name}
                  </p>
                  {shift.client_name && (
                    <p className="text-sm text-gray-700 mt-1">
                      <Building2 size={14} className="inline mr-1" />
                      {shift.client_name}
                    </p>
                  )}
                  {shift.location_address && (
                    <p className="text-sm text-gray-600 mt-2">
                      📍 {shift.location_address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Colleagues */}
          {colleagues.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Users className="text-green-600 mt-1" size={24} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Collega's op deze dienst
                  </p>
                  <div className="space-y-2">
                    {colleagues.map((colleague) => (
                      <div
                        key={colleague.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900">
                          {colleague.employee_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {shift.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-1">Notities</p>
              <p className="text-gray-900">{shift.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
            {!isPlannerOrAdmin && (
              <a
                href="/diensten-ruilen"
                className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-center font-semibold flex items-center justify-center gap-2"
              >
                <ArrowLeftRight size={20} />
                Dienst Ruilen
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
