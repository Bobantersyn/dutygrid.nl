import {
  Clock,
  MapPin,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
// getShiftTypeIcon import removed
import { useState } from "react";

export function ShiftCard({
  shift,
  hasWarning,
  hasNightDay,
  onDelete,
  onEdit,
  isPlannerOrAdmin,
  outsideAvailability,
  onApproveOverride,
  onEmployeeClick, // New prop
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isOpenShift = !shift.employee_id;

  // Bepaal de state: A (orange warning), B (green check), C (normal)
  const needsOverrideApproval =
    outsideAvailability &&
    !shift.availability_override_approved &&
    !isOpenShift;
  const hasOverrideApproved =
    outsideAvailability && shift.availability_override_approved;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(shift.id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(shift);
    }
  };

  const handleOverrideClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onApproveOverride) {
      onApproveOverride(shift);
    }
  };

  const handleEmployeeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEmployeeClick && !isOpenShift) {
      onEmployeeClick(shift.employee_id);
    }
  };

  const CardContent = (
    <>
      {/* Rest time warnings (existing red warnings) */}
      {(hasWarning || hasNightDay) && shift.can_manage_own_availability !== false && (
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertTriangle size={18} />
          <span className="font-bold text-sm">
            {hasNightDay
              ? "⚠️ NACHTDIENST → DAGDIENST"
              : "Minder dan 12 uur rust"}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <div
            role="button"
            onClick={handleEmployeeClick}
            className={`text-lg font-bold uppercase truncate hover:underline ${isOpenShift ? "text-red-600" : "text-blue-600 hover:text-blue-800"}`}
            title={!isOpenShift ? "Klik voor details" : ""}
          >
            {isOpenShift ? "⚠️ OPENSTAANDE DIENST" : shift.employee_name}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* State A: Orange warning icon - alleen voor planners/admins */}
          {isPlannerOrAdmin && needsOverrideApproval && (
            <button
              onClick={handleOverrideClick}
              className="text-orange-600 hover:bg-orange-100 p-1.5 rounded transition-all"
              title="Shift valt buiten beschikbaarheid - klik om goed te keuren"
            >
              <AlertTriangle size={20} />
            </button>
          )}

          {/* State B: Approved Override - Neutral Style (Rule D) */}
          {isPlannerOrAdmin && hasOverrideApproved && (
            <div
              className="relative flex items-center gap-1"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {/* Small badge instead of checkmark */}
              <div className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-gray-300">
                Override
              </div>

              {showTooltip && (
                <div className="absolute top-full right-0 mt-1 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-50 shadow-lg">
                  Ingepland ondanks afwezigheid
                  {shift.availability_override_note && (
                    <span className="block opacity-75 italic mt-1 border-t border-gray-700 pt-1">
                      Note: {shift.availability_override_note}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-100 p-2 rounded transition-all"
              title="Verwijderen"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <Clock size={16} />
        <span className="font-semibold">
          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
          {shift.end_time < shift.start_time && <span className="text-xs ml-1 text-gray-500">(+1d)</span>}
        </span>
      </div>

      {shift.location_name && (
        <div className="flex items-center gap-2 text-orange-700 mb-2">
          <MapPin size={16} />
          <span className="font-medium">{shift.location_name}</span>
        </div>
      )}

      {shift.notes && (
        <p className="text-sm text-gray-600 italic mt-2">{shift.notes}</p>
      )}
    </>
  );

  // HANDLE LEAVE / GHOST SHIFTS
  if (shift.is_ghost) {
    if (shift.type === 'leave_pending') {
      return (
        <div className="block border rounded-lg p-4 mb-3 border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-yellow-800 text-lg uppercase">{shift.employee_name}</span>
            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              <AlertTriangle size={16} />
              <span className="font-bold text-xs uppercase">Aanvraag</span>
            </div>
          </div>
          <div className="text-yellow-700 italic">
            {shift.note || "Verlofaanvraag in behandeling"}
          </div>
        </div>
      );
    }
    if (shift.type === 'leave_approved') {
      return (
        <div className="block border rounded-lg p-4 mb-3 border-red-200 bg-red-50 opacity-90">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-red-800 text-lg uppercase">{shift.employee_name}</span>
            <div className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded">
              <Trash2 size={0} className="w-0" /> {/* Spacer */}
              <span className="font-bold text-xs uppercase">AFWEZIG</span>
            </div>
          </div>
          <div className="text-red-700 font-medium">
            VERLOF: {shift.note || "Goedgekeurd"}
          </div>
        </div>
      );
    }
  }

  // Bepaal de border en background styling
  let borderClass = "border-purple-200 hover:border-purple-400";
  let bgClass = "bg-purple-50";

  if (hasWarning || hasNightDay) {
    borderClass = "border-red-300 hover:border-red-400";
    bgClass = "bg-red-100";
  } else if (isPlannerOrAdmin && needsOverrideApproval) {
    borderClass = "border-orange-300 hover:border-orange-400";
    bgClass = "bg-orange-50";
  } else if (isPlannerOrAdmin && hasOverrideApproved) {
    // Rule D: Neutral color for overrides
    borderClass = "border-gray-300 hover:border-gray-400";
    bgClass = "bg-gray-100";
  } else if (isOpenShift) {
    // Open shifts style updated: Red border, reddish bg
    borderClass = "border-2 border-dashed border-red-300 hover:border-red-400";
    bgClass = "bg-red-50";
  }

  return (
    <div
      onClick={handleEdit}
      className={`block border rounded-lg p-4 group hover:bg-opacity-80 hover:shadow-md transition-all cursor-pointer ${borderClass} ${bgClass}`}
    >
      {CardContent}
    </div>
  );
}
