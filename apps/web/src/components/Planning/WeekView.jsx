import { ShiftCardCompact } from "./ShiftCardCompact";
import { OverrideApprovalModal } from "./OverrideApprovalModal";
import { formatLocalDate } from "@/hooks/usePlanningWeek";
import { hasRestTimeWarning } from "@/utils/shiftValidation";
import { Plus, Users, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const dayNames = [
  "Maandag",
  "Dinsdag",
  "Woensdag",
  "Donderdag",
  "Vrijdag",
  "Zaterdag",
  "Zondag",
];

export function WeekView({
  currentWeek,
  shifts,
  onDeleteShift,
  onDayClick,
  selectedDate = null,
  isPlannerOrAdmin = true,
  onEmployeeDrop,
  onEditShift,
  onNewShift,
  useEmployeeAvailability = false,
  onEmployeeClick,
}) {
  const [dragOverDate, setDragOverDate] = useState(null);
  const [outsideAvailability, setOutsideAvailability] = useState({});
  const [overrideShift, setOverrideShift] = useState(null);

  // Fetch availability data for the current week
  const { data: availabilityData } = useQuery({
    queryKey: ["planning-availability", currentWeek.start, currentWeek.end],
    queryFn: async () => {
      const response = await fetch(
        `/api/planning/availability-check?start_date=${currentWeek.start}&end_date=${currentWeek.end}`,
      );
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
    enabled: isPlannerOrAdmin && useEmployeeAvailability,
  });

  // Check availability for individual shifts
  useEffect(() => {
    const checkAvailability = async () => {
      if (!shifts || shifts.length === 0 || !isPlannerOrAdmin || !useEmployeeAvailability) return;

      const checks = {};
      for (const shift of shifts) {
        if (!shift.employee_id) continue; // Skip open shifts
        // Skip check if employee is fixed
        if (shift.can_manage_own_availability === false) continue;

        try {
          const response = await fetch(
            `/api/availability/check?employee_id=${shift.employee_id}&date=${shift.shift_date}&start_time=${shift.start_time}&end_time=${shift.end_time}`,
          );

          if (response.ok) {
            const data = await response.json();
            checks[shift.id] = !data.is_available;
          }
        } catch (error) {
          console.error("Error checking availability:", error);
        }
      }
      setOutsideAvailability(checks);
    };

    if (!useEmployeeAvailability) {
      setOutsideAvailability({});
    } else {
      checkAvailability();
    }
  }, [shifts, isPlannerOrAdmin, useEmployeeAvailability]);

  const getAvailabilityForDate = (date) => {
    if (!availabilityData?.availability) return null;
    return availabilityData.availability.find((a) => a.check_date === date);
  };

  const handleDragOver = (e, date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(date);
  };

  const handleDragLeave = (e) => {
    setDragOverDate(null);
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    setDragOverDate(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data && data.id) {
        onEmployeeDrop?.(data, date);
      }
    } catch (error) {
      console.error("Failed to parse drop data:", error);
    }
  };

  const handleApproveOverride = () => {
    setOverrideShift(null);
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      {/* Week Header - Now Clickable */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 min-w-[700px]">
        {currentWeek.dates.map((date, idx) => {
          const isToday = date === formatLocalDate(new Date());
          const availability = getAvailabilityForDate(date);
          const isSelected = selectedDate === date;

          return (
            <button
              key={idx}
              onClick={() => onDayClick(date)}
              className={`p-4 text-center border-r border-gray-200 hover:bg-blue-100 transition-all cursor-pointer relative ${isToday ? "bg-blue-50" : ""
                } ${isSelected
                  ? "ring-2 ring-inset ring-blue-500 bg-blue-100 z-10"
                  : ""
                }`}
            >
              <div
                className={`font-bold ${isToday ? "text-blue-600" : isSelected ? "text-blue-700" : "text-gray-900"}`}
              >
                {dayNames[idx]}
              </div>
              <div
                className={`text-sm ${isToday ? "text-blue-600" : isSelected ? "text-blue-700" : "text-gray-600"}`}
              >
                {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
              </div>

              {/* Availability Info */}
              {isPlannerOrAdmin && availability && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Users size={12} className="text-green-600" />
                    <span className="font-semibold text-green-600">
                      {availability.available_count || 0}
                    </span>
                    <span className="text-gray-500">beschikbaar</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <CheckCircle size={12} className="text-blue-600" />
                    <span className="font-semibold text-blue-600">
                      {availability.shifts_scheduled || 0}
                    </span>
                    <span className="text-gray-500">ingepland</span>
                  </div>
                </div>
              )}

              {isSelected && (
                <div className="mt-2 text-xs font-bold text-blue-600">
                  Geselecteerd
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Week Content */}
      <div className="grid grid-cols-7 min-w-[700px]">
        {currentWeek.dates.map((date, idx) => {
          const dayShifts = shifts.filter((s) => s.shift_date === date);
          const availability = getAvailabilityForDate(date);
          const hasLowCoverage =
            availability &&
            availability.available_count > 0 &&
            availability.shifts_scheduled < availability.available_count * 0.5;
          const isDragOver = dragOverDate === date;

          return (
            <div
              key={idx}
              onDragOver={(e) => handleDragOver(e, date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
              className={`p-3 border-r border-gray-200 min-h-[200px] transition-all ${hasLowCoverage ? "bg-yellow-50" : ""
                } ${isDragOver ? "ring-2 ring-green-400 bg-green-50" : ""}`}
            >
              {dayShifts.length > 0 ? (
                <div className="space-y-2">
                  {dayShifts.map((shift) => {
                    const hasWarning = shift.can_manage_own_availability !== false && hasRestTimeWarning(shift, shifts);
                    return (
                      <ShiftCardCompact
                        key={shift.id}
                        shift={shift}
                        hasWarning={hasWarning}
                        onDelete={isPlannerOrAdmin ? onDeleteShift : undefined}
                        onEdit={isPlannerOrAdmin ? onEditShift : undefined}
                        isPlannerOrAdmin={isPlannerOrAdmin}
                        outsideAvailability={outsideAvailability[shift.id]}
                        onApproveOverride={(shift) => setOverrideShift(shift)}
                        useEmployeeAvailability={useEmployeeAvailability}
                        onEmployeeClick={onEmployeeClick}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {isPlannerOrAdmin ? (
                    <button
                      onClick={() => onNewShift?.(date)}
                      className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 p-4 rounded-lg transition-all group w-full h-full flex items-center justify-center"
                      title="Nieuwe dienst toevoegen"
                    >
                      <Plus
                        size={24}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              )}

              {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                    Loslaten om in te plannen
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {overrideShift && (
        <OverrideApprovalModal
          shift={overrideShift}
          onClose={() => setOverrideShift(null)}
          onApprove={handleApproveOverride}
        />
      )}
    </div>
  );
}
