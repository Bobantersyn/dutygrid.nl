import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  MapPin,
  Calendar,
  CalendarClock,
} from "lucide-react";
import { useSecurityGuardWeek } from "@/hooks/useSecurityGuardWeek";
import { ShiftDetailModal } from "./ShiftDetailModal";

export function SecurityGuardWeekView({ employeeId }) {
  const [selectedShift, setSelectedShift] = useState(null);

  const { formatWeekRange, navigateWeek, shiftsByDate, isLoading } =
    useSecurityGuardWeek(employeeId);

  // Fetch employee data to check can_manage_own_availability
  const { data: employeeData } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) throw new Error("Failed to fetch employee");
      return response.json();
    },
    enabled: !!employeeId,
  });

  const canManageAvailability =
    employeeData?.employee?.can_manage_own_availability !== false;

  const openShiftDetail = (shift) => {
    setSelectedShift(shift);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mijn Planning
              </h1>
              <p className="text-gray-600 mt-1">
                Bekijk je diensten en ruil indien nodig
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {canManageAvailability && (
                <a
                  href="/beschikbaarheid"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <CalendarClock size={20} />
                  Mijn Beschikbaarheid
                </a>
              )}
              <a
                href="/diensten-ruilen"
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeftRight size={20} />
                Diensten Ruilen
              </a>
              <a
                href="/account/logout"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Uitloggen
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security Guard Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {canManageAvailability && (
            <a
              href="/beschikbaarheid"
              className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow flex items-center gap-6"
            >
              <div className="p-4 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                <CalendarClock size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Mijn Beschikbaarheid
                </h3>
                <p className="text-gray-600">
                  Geef je vaste weekpatroon en vakanties door
                </p>
              </div>
            </a>
          )}

          <a
            href="/diensten-ruilen"
            className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow flex items-center gap-6"
          >
            <div className="p-4 bg-cyan-100 text-cyan-600 rounded-full group-hover:scale-110 transition-transform">
              <ArrowLeftRight size={32} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Diensten Ruilen
              </h3>
              <p className="text-gray-600">
                Bekijk ruilverzoeken of bied een dienst aan
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {formatWeekRange()}
            </h2>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Planning laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {shiftsByDate.map(({ date, dateStr, shifts }) => {
              const isToday =
                dateStr === new Date().toISOString().split("T")[0];
              const dayName = date.toLocaleDateString("nl-NL", {
                weekday: "short",
              });
              const dayNum = date.getDate();

              return (
                <div
                  key={dateStr}
                  className={`bg-white rounded-lg border-2 ${isToday ? "border-purple-500 shadow-lg" : "border-gray-200"
                    } overflow-hidden`}
                >
                  <div
                    className={`p-3 ${isToday ? "bg-purple-100" : "bg-gray-50"} border-b border-gray-200`}
                  >
                    <div className="text-center">
                      <div
                        className={`text-sm font-semibold ${isToday ? "text-purple-700" : "text-gray-600"} uppercase`}
                      >
                        {dayName}
                      </div>
                      <div
                        className={`text-2xl font-bold ${isToday ? "text-purple-900" : "text-gray-900"}`}
                      >
                        {dayNum}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-2 min-h-[100px]">
                    {shifts.length === 0 ? (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        Vrij
                      </div>
                    ) : (
                      shifts.map((shift) => (
                        <button
                          key={shift.id}
                          onClick={() => openShiftDetail(shift)}
                          className="w-full text-left p-3 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg border border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-purple-700 mb-1">
                            {shift.start_time.slice(0, 5)} -{" "}
                            {shift.end_time.slice(0, 5)}
                          </div>
                          {shift.location_name && (
                            <div className="text-xs text-gray-700 font-medium flex items-center gap-1">
                              <MapPin size={12} className="text-orange-600" />
                              <span className="truncate">
                                {shift.location_name}
                              </span>
                            </div>
                          )}
                          {shift.shift_type && shift.shift_type !== "dag" && (
                            <div className="text-xs text-purple-600 font-semibold mt-1">
                              {shift.shift_type === "nacht"
                                ? "🌙 Nacht"
                                : shift.shift_type === "evenement"
                                  ? "🎉 Event"
                                  : shift.shift_type === "object"
                                    ? "🏢 Object"
                                    : ""}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shift Detail Modal */}
      {selectedShift && (
        <ShiftDetailModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </div>
  );
}
