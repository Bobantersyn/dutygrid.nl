"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, ArrowLeft, Calendar, Clock } from "lucide-react";
import { AvailabilityPopup } from "@/components/Dashboard/AvailabilityPopup";

export default function BeschikbaarheidOverzichtPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability-overview-detailed"],
    queryFn: async () => {
      const response = await fetch("/api/employees/availability-overview");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Er is een fout opgetreden</p>
          <a
            href="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Terug naar Dashboard
          </a>
        </div>
      </div>
    );
  }

  const overview = data?.overview || [];
  const withPattern = overview.filter((e) => e.has_pattern);
  const withoutPattern = overview.filter((e) => !e.has_pattern);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Terug</span>
              </a>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Beschikbaarheid Overzicht
                </h1>
                <p className="text-gray-600 mt-1">
                  Volledig overzicht van alle medewerkers en hun beschikbaarheid
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-3xl font-bold text-gray-900">
                {overview.length}
              </div>
              <div className="text-gray-600 mt-1">Totaal Medewerkers</div>
            </div>
            <div className="bg-green-50 rounded-xl shadow-sm border-2 border-green-300 p-6">
              <div className="text-3xl font-bold text-green-600">
                {withPattern.length}
              </div>
              <div className="text-gray-600 mt-1">
                Beschikbaarheid Ingesteld
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl shadow-sm border-2 border-orange-300 p-6">
              <div className="text-3xl font-bold text-orange-600">
                {withoutPattern.length}
              </div>
              <div className="text-gray-600 mt-1">Nog Geen Beschikbaarheid</div>
            </div>
          </div>

          {/* Complete List */}
          {withPattern.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={28} className="text-green-600" />
                Beschikbaarheid Ingesteld ({withPattern.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {withPattern.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6 hover:shadow-md hover:border-green-400 transition-all text-left w-full cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {emp.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          {emp.pattern_count > 0 && (
                            <span className="bg-green-100 px-2 py-1 rounded font-semibold">
                              <Clock size={14} className="inline mr-1" />
                              {emp.pattern_count}{" "}
                              {emp.pattern_count === 1 ? "dag" : "dagen"}
                            </span>
                          )}
                          {emp.exception_count > 0 && (
                            <span className="bg-orange-100 px-2 py-1 rounded font-semibold">
                              <Calendar size={14} className="inline mr-1" />
                              {emp.exception_count}{" "}
                              {emp.exception_count === 1
                                ? "uitzondering"
                                : "uitzonderingen"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-3">
                      Klik voor details →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Incomplete List */}
          {withoutPattern.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <XCircle size={28} className="text-orange-600" />
                Nog Geen Beschikbaarheid ({withoutPattern.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {withoutPattern.map((emp) => (
                  <a
                    key={emp.id}
                    href={`/employees/${emp.id}`}
                    className="bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6 hover:shadow-md hover:border-orange-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {emp.name}
                        </h3>
                        <div className="text-sm text-orange-600 font-semibold mt-2">
                          ⏳ Wacht op invoer
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-3">
                      Klik om te bekijken →
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {overview.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen medewerkers gevonden</p>
            </div>
          )}
        </div>
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
