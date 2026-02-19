import { Calendar } from "lucide-react";
import { ShiftCard } from "./ShiftCard";
import { OverrideApprovalModal } from "./OverrideApprovalModal";
import { formatLocalDate } from "@/hooks/usePlanningWeek";
import {
  hasRestTimeWarning,
  hasNightToDayWarning,
} from "@/utils/shiftValidation";
import { useState, useEffect } from "react";

export function DayView({
  currentDate,
  shifts,
  searchQuery,
  onDeleteShift,
  isPlannerOrAdmin = true,
  onEditShift,
  onNewShift,
  onEmployeeClick, // New prop
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [outsideAvailability, setOutsideAvailability] = useState({});
  const [overrideShift, setOverrideShift] = useState(null);

  const dateStr = formatLocalDate(currentDate);
  const dayShifts = shifts.filter((s) => s.shift_date === dateStr);

  // Check availability for all shifts
  useEffect(() => {
    const checkAvailability = async () => {
      if (!dayShifts || dayShifts.length === 0 || !isPlannerOrAdmin) return;

      const checks = {};
      for (const shift of dayShifts) {
        if (!shift.employee_id) continue; // Skip open shifts

        // Skip check if employee is fixed (cannot manage own availability)
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

    checkAvailability();
  }, [dayShifts, isPlannerOrAdmin]);

  const handleApproveOverride = () => {
    setOverrideShift(null);
    window.location.reload();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data && data.id) {
        onEmployeeDrop?.(data, dateStr);
      }
    } catch (error) {
      console.error("Failed to parse drop data:", error);
    }
  };

  // Allow clicking on background to create new shift
  const handleBackgroundClick = (e) => {
    // Only if not prevented by child (ShiftCard already stops propagation)
    if (isPlannerOrAdmin && onNewShift) {
      onNewShift(dateStr);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        onClick={handleBackgroundClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all relative cursor-pointer ${isDragOver
          ? "border-green-400 bg-green-50 ring-2 ring-green-400"
          : "border-gray-200 hover:border-blue-200"
          }`}
      >
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p className="text-sm text-gray-500 mt-2 italic">
            Klik in dit vlak om een nieuwe dienst toe te voegen
          </p>
        </div>

        <div className="space-y-3">
          {dayShifts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">
                {searchQuery
                  ? `Geen diensten gevonden voor "${searchQuery}"`
                  : "Geen diensten gepland voor deze dag"}
              </p>
            </div>
          ) : (
            dayShifts.map((shift) => {
              const hasWarning = hasRestTimeWarning(shift, shifts);
              const hasNightDay = hasNightToDayWarning(shift, shifts);
              return (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  hasWarning={hasWarning}
                  hasNightDay={hasNightDay}
                  onDelete={isPlannerOrAdmin ? onDeleteShift : undefined}
                  onEdit={isPlannerOrAdmin ? onEditShift : undefined}
                  isPlannerOrAdmin={isPlannerOrAdmin}
                  outsideAvailability={outsideAvailability[shift.id]}
                  onApproveOverride={(shift) => setOverrideShift(shift)}
                  onEmployeeClick={onEmployeeClick}
                />
              );
            })
          )}
        </div>

        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-green-50 bg-opacity-90 rounded-xl">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg text-lg">
              Loslaten om in te plannen
            </div>
          </div>
        )}
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
