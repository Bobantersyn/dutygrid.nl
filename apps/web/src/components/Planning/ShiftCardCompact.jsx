
import {
  Clock,
  MapPin,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export function ShiftCardCompact({
  shift,
  hasWarning,
  onDelete,
  onEdit,
  isPlannerOrAdmin,
  outsideAvailability,
  onApproveOverride,
  useEmployeeAvailability,
  onEmployeeClick, // Correct prop
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isOpenShift = !shift.employee_id;

  const needsOverrideApproval =
    useEmployeeAvailability &&
    outsideAvailability &&
    !shift.availability_override_approved &&
    !isOpenShift;

  const hasOverrideApproved =
    useEmployeeAvailability &&
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

  // HANDLE LEAVE / GHOST SHIFTS
  if (shift.is_ghost) {
    if (shift.type === 'leave_pending') {
      return (
        <div className="block p-2 rounded-lg text-xs border bg-yellow-50 border-yellow-200 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-yellow-800 truncate">{shift.employee_name}</span>
            <AlertTriangle size={12} className="text-yellow-600" />
          </div>
          <div className="text-yellow-700 italic truncate" title={shift.note || "Verlofaanvraag"}>
            {shift.note || "Verlof aangevraagd"}
          </div>
        </div>
      );
    }
    if (shift.type === 'leave_approved') {
      return (
        <div className="block p-2 rounded-lg text-xs border bg-red-50 border-red-200 mb-2 opacity-80">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-red-800 truncate">{shift.employee_name}</span>
            <Trash2 size={0} className="w-0" /> {/* Spacer */}
          </div>
          <div className="text-red-700 font-medium truncate" title={shift.note || "Verlof"}>
            VERLOF
          </div>
        </div>
      );
    }
  }

  // Bepaal styling
  let bgClass = "bg-purple-100 border-purple-200 hover:border-purple-400";
  if (hasWarning) {
    bgClass = "bg-red-100 border-red-300 hover:border-red-400";
  } else if (isPlannerOrAdmin && needsOverrideApproval) {
    bgClass = "bg-orange-100 border-orange-300 hover:border-orange-400";
  } else if (isPlannerOrAdmin && hasOverrideApproved) {
    // Rule D: Neutral
    bgClass = "bg-gray-100 border-gray-300 hover:border-gray-400";
  } else if (isOpenShift) {
    // Open shifts: Red border, reddish bg
    bgClass = "bg-red-50 border-2 border-dashed border-red-300 hover:border-red-400";
  }

  const CardContent = (
    <>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 flex-1">
          {hasWarning && (
            <div className="flex items-center gap-1 text-red-700">
              <AlertTriangle size={12} />
              <span className="font-bold text-[10px]">&lt;12u rust</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isPlannerOrAdmin && needsOverrideApproval && (
            <button
              onClick={handleOverrideClick}
              className="text-orange-600 hover:bg-orange-100 p-0.5 rounded"
              title="Buiten beschikbaarheid"
            >
              <AlertTriangle size={14} />
            </button>
          )}

          {isPlannerOrAdmin && hasOverrideApproved && (
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="text-green-600 p-0.5">
                <CheckCircle2 size={14} />
              </div>
              {showTooltip && shift.availability_override_note && (
                <div className="absolute top-full right-0 mt-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                  {shift.availability_override_note}
                </div>
              )}
            </div>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-600 hover:bg-red-100 p-1 rounded transition-all z-10 opacity-0 group-hover:opacity-100"
              title="Verwijderen"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        role="button"
        onClick={handleEmployeeClick}
        className={`block font-bold uppercase mb-1 truncate hover:underline ${isOpenShift ? "text-red-600" : "text-blue-600 hover:text-blue-800"}`}
        title={!isOpenShift ? "Klik voor details" : ""}
      >
        {isOpenShift ? "⚠️ OPEN" : shift.employee_name}
      </div>

      <div className="flex items-center gap-1 text-gray-900">
        <Clock size={12} />
        <span className="font-semibold">
          {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
          {shift.end_time < shift.start_time && <span className="text-[10px] ml-1 text-gray-500">(+1d)</span>}
        </span>
      </div>

      {shift.location_name && (
        <div className="flex items-center gap-1 text-gray-700 mt-1">
          <MapPin size={10} />
          <span className="truncate">{shift.location_name}</span>
        </div>
      )}
    </>
  );

  return (
    <div
      onClick={handleEdit}
      className={`block p-2 rounded-lg text-xs group relative hover:shadow-md transition-all cursor-pointer border ${bgClass}`}
    >
      {CardContent}
    </div>
  );
}
