import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { AvailabilityPopup } from "./AvailabilityPopup";

export function AvailabilityOverview() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability-overview"],
    queryFn: async () => {
      const response = await fetch("/api/employees/availability-overview");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Always render - even if error
  if (error) {
    console.error("Availability overview error:", error);
    return (
      <div className="bg-red-50 rounded-xl shadow-sm border-2 border-red-300 p-6">
        <h2 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
          <Calendar size={24} className="text-red-600" />
          ⚠️ Beschikbaarheid Status
        </h2>
        <p className="text-red-700 text-sm">
          Er is een fout opgetreden bij het laden. Ververs de pagina.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={24} className="text-purple-600" />
          Beschikbaarheid Status
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2 text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  const overview = (data?.overview || []).filter(e => e.can_manage_own_availability !== false);
  const withPattern = overview.filter((e) => e.has_pattern);
  const withoutPattern = overview.filter((e) => !e.has_pattern);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Clickable Header with Collapse Toggle */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/beschikbaarheid-overzicht"
            className="flex items-center gap-2 hover:text-purple-700 transition-colors group"
          >
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar
                size={24}
                className="text-purple-600 group-hover:scale-110 transition-transform"
              />
              Beschikbaarheid Status
            </h2>
          </a>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-bold text-green-600">
                {withPattern.length}
              </span>{" "}
              / {overview.length} compleet
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isCollapsed ? "Uitklappen" : "Inklappen"}
            >
              {isCollapsed ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronUp size={20} />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{
                    width: `${overview.length > 0 ? (withPattern.length / overview.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Complete */}
            {withPattern.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Beschikbaarheid Ingesteld ({withPattern.length})
                </h3>
                <div className="space-y-2">
                  {withPattern.slice(0, 5).map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-gray-900 block">
                            {emp.name}
                          </span>
                          {!emp.can_manage_own_availability && (
                            <span className="text-xs text-gray-600 italic">
                              (Beheerd door planner)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
                        {emp.pattern_count > 0 && (
                          <span className="bg-green-100 px-2 py-1 rounded">
                            {emp.pattern_count}{" "}
                            {emp.pattern_count === 1 ? "dag" : "dagen"}
                          </span>
                        )}
                        {emp.exception_count > 0 && (
                          <span className="bg-orange-100 px-2 py-1 rounded">
                            {emp.exception_count}{" "}
                            {emp.exception_count === 1
                              ? "uitzondering"
                              : "uitzonderingen"}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {withPattern.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      + {withPattern.length - 5} meer...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Incomplete - Only Type A without patterns */}
            {withoutPattern.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <XCircle size={16} className="text-orange-600" />
                  Nog Geen Beschikbaarheid ({withoutPattern.length})
                </h3>
                <div className="space-y-2">
                  {withoutPattern.slice(0, 5).map((emp) => (
                    <a
                      key={emp.id}
                      href={`/employees/${emp.id}`}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900">
                          {emp.name}
                        </span>
                      </div>
                      <Clock size={16} className="text-orange-600" />
                    </a>
                  ))}
                  {withoutPattern.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      + {withoutPattern.length - 5} meer...
                    </p>
                  )}
                </div>
              </div>
            )}

            {overview.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Geen medewerkers gevonden</p>
                <p className="text-sm text-gray-400 mt-1">
                  Voeg eerst medewerkers toe om hun beschikbaarheid te beheren
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popup */}
      {selectedEmployee && (
        <AvailabilityPopup
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </>
  );
}
