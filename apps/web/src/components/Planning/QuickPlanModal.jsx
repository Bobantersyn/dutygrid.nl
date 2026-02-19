"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Calendar, Clock, MapPin, Loader2, User, Trash2 } from "lucide-react";

export function QuickPlanModal({
  employee, // Optional: Pre-selected employee (for Drag & Drop)
  prefilledDate, // Optional: Pre-selected date (for Drag & Drop or New on Day)
  shift, // Optional: Existing shift to edit
  onClose,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const isEditing = !!shift;

  const [formData, setFormData] = useState({
    employee_id: employee?.id || shift?.employee_id || "",
    shift_date: shift?.shift_date || prefilledDate || "",
    start_time: shift?.start_time?.slice(0, 5) || "09:00",
    end_time: shift?.end_time?.slice(0, 5) || "17:00",
    assignment_id: shift?.assignment_id || "",
    break_minutes: shift?.break_minutes || 30,
    notes: shift?.notes || "",
  });

  // Fetch employees if not provided or for editing
  const { data: employeesData } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const response = await fetch("/api/employees?active=true");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    // Only fetch if we need to select an employee
    enabled: !employee,
  });

  // Fetch assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const response = await fetch("/api/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return response.json();
    },
  });

  // Create/Update shift mutation
  const saveShiftMutation = useMutation({
    mutationFn: async (data) => {
      const url = isEditing ? `/api/shifts/${shift.id}` : "/api/shifts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save shift");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["shifts"]);
      queryClient.invalidateQueries(["planning-availability"]);
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const shiftPayload = {
      employee_id: formData.employee_id ? parseInt(formData.employee_id) : null,
      shift_date: formData.shift_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      assignment_id: formData.assignment_id || null,
      break_minutes: parseInt(formData.break_minutes) || 0,
      notes: formData.notes.trim() || null,
    };

    saveShiftMutation.mutate(shiftPayload);
  };

  const assignments = assignmentsData?.assignments || [];
  const employeesList = employeesData?.employees || [];

  // Title logic
  const modalTitle = isEditing ? "Dienst Bewerken" : "Dienst Inplannen";
  const displayEmployeeName = employee?.name || (isEditing && shift?.employee_name) || "Selecteer Medewerker";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{modalTitle}</h2>
              <p className="text-blue-100 mt-1 flex items-center gap-2">
                {!employee && !isEditing ? "Nieuwe dienst" : displayEmployeeName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Employee Selection (if not fixed) */}
          {!employee && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <User size={16} className="text-blue-600" />
                Medewerker
              </label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Open Dienst (Geen medewerker) --</option>
                {employeesList.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Assignment */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <MapPin size={16} className="text-purple-600" />
              Opdracht
            </label>
            <select
              value={formData.assignment_id}
              onChange={(e) =>
                setFormData({ ...formData, assignment_id: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Geen specifieke opdracht</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.location_name} - {assignment.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Times Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Calendar size={16} className="text-blue-600" />
                Datum
              </label>
              <input
                type="date"
                required
                value={formData.shift_date}
                onChange={(e) =>
                  setFormData({ ...formData, shift_date: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Clock size={16} className="text-green-600" />
                Start Tijd
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Clock size={16} className="text-red-600" />
                Eind Tijd
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Shift Details: Break & Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pauze (minuten)
            </label>
            <input
              type="number"
              min="0"
              value={formData.break_minutes}
              onChange={(e) =>
                setFormData({ ...formData, break_minutes: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notities
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Extra informatie over deze dienst..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error */}
          {saveShiftMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-semibold">
                ❌ {saveShiftMutation.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={saveShiftMutation.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveShiftMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Bezig...
                </>
              ) : (
                isEditing ? "Opslaan" : "Dienst Inplannen"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
