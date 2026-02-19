import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export function AvailabilityDetailPopup({ employeeId, weekStart, onClose, isPlannerOrAdmin }) {
  const queryClient = useQueryClient();
  const [showAddException, setShowAddException] = useState(false);
  const [newException, setNewException] = useState({
    date: "",
    reason: "",
    is_available: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["availability-detail", employeeId, weekStart],
    queryFn: async () => {
      const response = await fetch(
        `/api/availability/week-overview?employee_id=${employeeId}&week_start=${weekStart}`,
      );
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
    enabled: !!employeeId && !!weekStart,
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: async (date) => {
      // Find exception ID
      const exceptionsResponse = await fetch(
        `/api/availability/exceptions?employee_id=${employeeId}`,
      );
      const exceptionsData = await exceptionsResponse.json();
      const exception = exceptionsData.exceptions.find(
        (ex) => ex.exception_date.split("T")[0] === date,
      );

      if (!exception) throw new Error("Exception not found");

      const response = await fetch(
        `/api/availability/exceptions?id=${exception.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete exception");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        "availability-detail",
        employeeId,
        weekStart,
      ]);
      queryClient.invalidateQueries(["availability-week-overview", weekStart]);
    },
  });

  const addExceptionMutation = useMutation({
    mutationFn: async (exception) => {
      const response = await fetch("/api/availability/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          exception_date: exception.date,
          is_available: exception.is_available,
          reason: exception.reason,
        }),
      });
      if (!response.ok) throw new Error("Failed to add exception");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([
        "availability-detail",
        employeeId,
        weekStart,
      ]);
      queryClient.invalidateQueries(["availability-week-overview", weekStart]);
      setNewException({ date: "", reason: "", is_available: false });
      setShowAddException(false);
    },
  });

  const handleAddException = () => {
    if (!newException.date) return;
    addExceptionMutation.mutate(newException);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { employee, week } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {employee.can_manage_own_availability
                  ? "Vult zelf beschikbaarheid in"
                  : "Beheerd door planner"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {week.map((day) => {
              const isException = day.source === "exception";
              const canDelete = isException && !isPlannerOrAdmin;

              return (
                <div
                  key={day.date}
                  className={`p-4 rounded-lg border-2 ${day.available
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {day.available ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span className="font-bold text-gray-900">
                          {day.day} {new Date(day.date).getDate()}/
                          {new Date(day.date).getMonth() + 1}
                        </span>
                        {isException && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-semibold">
                            Uitzondering
                          </span>
                        )}
                      </div>

                      {day.available && day.start_time && day.end_time && (
                        <div className="text-sm text-gray-700 ml-7">
                          {day.start_time} - {day.end_time}
                        </div>
                      )}

                      {!day.available && day.reason && (
                        <div className="text-sm text-gray-700 ml-7 flex items-center gap-1">
                          💬 {day.reason}
                        </div>
                      )}

                      {day.source === "not_set" && (
                        <div className="text-sm text-gray-500 ml-7 italic">
                          Niet opgegeven door medewerker
                        </div>
                      )}

                      {day.source === "default" && !isException && (
                        <div className="text-sm text-gray-600 ml-7">
                          Standaard beschikbaar (geen patroon ingesteld)
                        </div>
                      )}

                      {day.source === "pattern" && (
                        <div className="text-sm text-gray-500 ml-7 italic">
                          Weekpatroon
                        </div>
                      )}
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => deleteExceptionMutation.mutate(day.date)}
                        disabled={deleteExceptionMutation.isPending}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                        title="Uitzondering verwijderen"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Exception Section */}
          {!isPlannerOrAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {!showAddException ? (
                <button
                  onClick={() => setShowAddException(true)}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={20} />
                  Uitzondering Toevoegen
                </button>
              ) : (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Nieuwe Uitzondering
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        Datum
                      </label>
                      <select
                        value={newException.date}
                        onChange={(e) =>
                          setNewException({
                            ...newException,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Selecteer datum...</option>
                        {week.map((day) => (
                          <option key={day.date} value={day.date}>
                            {day.day} {new Date(day.date).getDate()}/
                            {new Date(day.date).getMonth() + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        Type
                      </label>
                      <select
                        value={
                          newException.is_available ? "available" : "unavailable"
                        }
                        onChange={(e) =>
                          setNewException({
                            ...newException,
                            is_available: e.target.value === "available",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="unavailable">Niet Beschikbaar</option>
                        <option value="available">Extra Beschikbaar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">
                        Reden (optioneel)
                      </label>
                      <input
                        type="text"
                        value={newException.reason}
                        onChange={(e) =>
                          setNewException({
                            ...newException,
                            reason: e.target.value,
                          })
                        }
                        placeholder="Vakantie, ziek, override..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddException}
                        disabled={
                          !newException.date || addExceptionMutation.isPending
                        }
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-semibold"
                      >
                        {addExceptionMutation.isPending
                          ? "Toevoegen..."
                          : "Toevoegen"}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddException(false);
                          setNewException({
                            date: "",
                            reason: "",
                            is_available: false,
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Annuleer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
