"use client";

import { useQuery } from "@tanstack/react-query";
import { X, Calendar, Clock, CheckCircle, XCircle, User } from "lucide-react";

const DAYS = [
  { value: 1, label: "Maandag", short: "Ma" },
  { value: 2, label: "Dinsdag", short: "Di" },
  { value: 3, label: "Woensdag", short: "Wo" },
  { value: 4, label: "Donderdag", short: "Do" },
  { value: 5, label: "Vrijdag", short: "Vr" },
  { value: 6, label: "Zaterdag", short: "Za" },
  { value: 0, label: "Zondag", short: "Zo" },
];

export function AvailabilityPopup({ employeeId, employeeName, onClose }) {
  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) throw new Error("Failed to fetch employee");
      return response.json();
    },
    enabled: !!employeeId,
  });

  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ["availability-patterns", employeeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/availability/patterns?employee_id=${employeeId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch patterns");
      return response.json();
    },
    enabled: !!employeeId,
  });

  const { data: exceptionsData, isLoading: exceptionsLoading } = useQuery({
    queryKey: ["availability-exceptions", employeeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/availability/exceptions?employee_id=${employeeId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch exceptions");
      return response.json();
    },
    enabled: !!employeeId,
  });

  const employee = employeeData?.employee;
  const canManageOwn = employee?.can_manage_own_availability !== false;

  // Build pattern map
  const patternMap = {};
  if (patternsData?.patterns) {
    patternsData.patterns.forEach((p) => {
      patternMap[p.day_of_week] = p;
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{employeeName}</h2>
                <p className="text-blue-100 text-sm">
                  {canManageOwn
                    ? "Vult zelf beschikbaarheid in"
                    : "Beheerd door planner"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {employeeLoading || patternsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Laden...</p>
            </div>
          ) : (
            <>
              {/* Week Pattern - Only for Type A */}
              {canManageOwn && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-purple-600" />
                    Weekpatroon
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DAYS.map((day) => {
                      const pattern = patternMap[day.value];
                      return (
                        <div
                          key={day.value}
                          className={`p-4 rounded-lg border-2 ${
                            pattern
                              ? "border-green-300 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {pattern ? (
                                <CheckCircle
                                  size={16}
                                  className="text-green-600"
                                />
                              ) : (
                                <XCircle size={16} className="text-gray-400" />
                              )}
                              <span className="font-semibold text-gray-900">
                                {day.label}
                              </span>
                            </div>
                            {pattern && (
                              <span className="text-sm text-gray-600">
                                {pattern.start_time.slice(0, 5)} -{" "}
                                {pattern.end_time.slice(0, 5)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Type B - Default Available */}
              {!canManageOwn && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Standaard Beschikbaarheid
                  </h3>
                  <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                    <CheckCircle
                      size={48}
                      className="text-green-600 mx-auto mb-3"
                    />
                    <p className="font-semibold text-gray-900 text-lg mb-2">
                      Altijd Beschikbaar
                    </p>
                    <p className="text-sm text-gray-600">
                      Deze medewerker is standaard beschikbaar op alle dagen,
                      tenzij er een uitzondering is ingesteld.
                    </p>
                  </div>
                </div>
              )}

              {/* Exceptions */}
              {exceptionsLoading ? (
                <p className="text-gray-500 text-sm">Uitzonderingen laden...</p>
              ) : exceptionsData?.exceptions?.length > 0 ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-orange-600" />
                    Uitzonderingen
                  </h3>
                  <div className="space-y-2">
                    {exceptionsData.exceptions.map((exception) => (
                      <div
                        key={exception.id}
                        className={`p-4 rounded-lg border ${
                          exception.is_available
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {new Date(
                                exception.exception_date,
                              ).toLocaleDateString("nl-NL", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                            {exception.reason && (
                              <div className="text-sm text-gray-600 mt-1">
                                {exception.reason}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${
                              exception.is_available
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {exception.is_available
                              ? "Extra Beschikbaar"
                              : "Niet Beschikbaar"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">
                    Geen uitzonderingen ingepland
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl flex gap-3">
          <a
            href={`/employees/${employeeId}`}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center font-semibold"
          >
            Bekijk Volledig Profiel
          </a>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
