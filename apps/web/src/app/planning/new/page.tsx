"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

export default function NewShiftPage() {
  const [formData, setFormData] = useState({
    employee_id: "",
    assignment_id: "",
    shift_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "17:00",
    break_minutes: 30,
    notes: "",
    shift_type: "dag",
  });
  const [error, setError] = useState(null);
  const [availabilityWarning, setAvailabilityWarning] = useState(null);

  // Pre-fill date from URL if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get("date");
    if (dateParam) {
      setFormData((prev) => ({ ...prev, shift_date: dateParam }));
    }
  }, []);

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const response = await fetch("/api/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return response.json();
    },
  });

  // Check availability when employee and date change
  useEffect(() => {
    if (
      formData.employee_id &&
      formData.shift_date &&
      formData.start_time &&
      formData.end_time
    ) {
      checkAvailability();
    } else {
      setAvailabilityWarning(null);
    }
  }, [
    formData.employee_id,
    formData.shift_date,
    formData.start_time,
    formData.end_time,
  ]);

  const checkAvailability = async () => {
    if (
      !formData.employee_id ||
      !formData.shift_date ||
      !formData.start_time ||
      !formData.end_time
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/availability/check?employee_id=${formData.employee_id}&date=${formData.shift_date}&start_time=${formData.start_time}&end_time=${formData.end_time}`,
      );
      const data = await response.json();

      if (!data.is_available) {
        setAvailabilityWarning(data.reason || "Medewerker is niet beschikbaar");
      } else {
        setAvailabilityWarning(null);
      }
    } catch (error) {
      console.error("Failed to check availability:", error);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create shift");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/planning";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const employees = employeesData?.employees || [];
  const assignments = assignmentsData?.assignments || [];
  const activeAssignments = assignments.filter((a) => a.active);
  const selectedEmployee = employees.find(
    (e) => e.id === parseInt(formData.employee_id),
  );
  const selectedAssignment = assignments.find(
    (a) => a.id === parseInt(formData.assignment_id),
  );

  const calculateHours = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    const [startH, startM] = formData.start_time.split(":").map(Number);
    const [endH, endM] = formData.end_time.split(":").map(Number);
    const totalMinutes =
      endH * 60 + endM - (startH * 60 + startM) - (formData.break_minutes || 0);
    return (totalMinutes / 60).toFixed(1);
  };

  // Show message about travel costs
  const showTravelInfo =
    selectedEmployee?.home_address && selectedAssignment?.location_address;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate({
      ...formData,
      employee_id: parseInt(formData.employee_id),
      assignment_id: formData.assignment_id
        ? parseInt(formData.assignment_id)
        : null,
      break_minutes: parseInt(formData.break_minutes) || 0,
      shift_type: formData.shift_type, // Include shift_type
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <a
            href="/planning"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Terug naar Planning
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Nieuwe Dienst</h1>
          <p className="text-gray-600 mt-1">
            Plan een nieuwe beveiligingsdienst in
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Availability Warning */}
          {availabilityWarning && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-orange-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-1">
                    ⚠️ Beschikbaarheids Waarschuwing
                  </h3>
                  <p className="text-orange-800 text-sm">
                    {availabilityWarning}
                  </p>
                  <p className="text-orange-700 text-xs mt-2 font-semibold">
                    Je kunt deze dienst nog steeds aanmaken, maar controleer
                    eerst met de medewerker.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Medewerker *
              </label>
              <select
                required
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Selecteer medewerker</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.cao_type}
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="text-blue-900">
                    <strong>CAO Limieten:</strong> Max{" "}
                    {selectedEmployee.max_hours_per_day}u per dag,{" "}
                    {selectedEmployee.max_hours_per_week}u per week
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Opdracht / Locatie
              </label>
              <select
                value={formData.assignment_id}
                onChange={(e) =>
                  setFormData({ ...formData, assignment_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Geen specifieke opdracht</option>
                {activeAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.client_name} - {assignment.location_name}
                  </option>
                ))}
              </select>
              {selectedAssignment && (
                <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                  <p className="text-orange-900 font-medium">
                    {selectedAssignment.location_name}
                  </p>
                  <p className="text-orange-800 text-xs mt-1">
                    {selectedAssignment.location_address}
                  </p>
                  {selectedAssignment.hourly_rate && (
                    <p className="text-green-700 text-xs mt-1">
                      €{parseFloat(selectedAssignment.hourly_rate).toFixed(2)}{" "}
                      per uur
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type Dienst *
              </label>
              <select
                required
                value={formData.shift_type}
                onChange={(e) =>
                  setFormData({ ...formData, shift_type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="dag">🌞 Dagdienst (06:00-18:00)</option>
                <option value="nacht">🌙 Nachtdienst (18:00-06:00)</option>
                <option value="evenement">🎉 Evenement</option>
                <option value="object">🏢 Object</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Datum *
              </label>
              <input
                type="date"
                required
                value={formData.shift_date}
                onChange={(e) =>
                  setFormData({ ...formData, shift_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Start Tijd *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Eind Tijd *
                </label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-semibold text-purple-900">
                Totaal werkuren: {calculateHours()} uur
              </p>
            </div>

            {showTravelInfo && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Reiskosten
                </p>
                <p className="text-xs text-blue-700">
                  Reisafstand en kosten worden automatisch berekend bij opslaan
                  op basis van het woonadres van de medewerker en de locatie van
                  de opdracht (€0,23 per km retour).
                </p>
              </div>
            )}

            {!selectedEmployee?.home_address && formData.employee_id && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Deze medewerker heeft geen woonadres ingevuld. Reiskosten
                  kunnen niet automatisch berekend worden.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Notities
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Optionele notities..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <a
              href="/planning"
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Annuleren
            </a>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {createMutation.isPending ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
