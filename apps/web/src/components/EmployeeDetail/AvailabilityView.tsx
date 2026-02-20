import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";

const DAYS = [
  { value: 1, label: "Maandag" },
  { value: 2, label: "Dinsdag" },
  { value: 3, label: "Woensdag" },
  { value: 4, label: "Donderdag" },
  { value: 5, label: "Vrijdag" },
  { value: 6, label: "Zaterdag" },
  { value: 0, label: "Zondag" },
];

export function AvailabilityView({ employeeId }) {
  const { data: patternsData, isLoading: patternsLoading } = useQuery({
    queryKey: ["availability-patterns", employeeId],
    queryFn: async () => {
      const response = await fetch(
        `/api/availability/patterns?employee_id=${employeeId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch patterns");
      return response.json();
    },
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
  });

  if (patternsLoading || exceptionsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={24} className="text-purple-600" />
          Beschikbaarheid
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2 text-sm">Laden...</p>
        </div>
      </div>
    );
  }

  const patterns = patternsData?.patterns || [];
  const exceptions = exceptionsData?.exceptions || [];

  // Organize patterns by day
  const patternsByDay = {};
  patterns.forEach((p) => {
    patternsByDay[p.day_of_week] = p;
  });

  const hasPatterns = patterns.length > 0;
  const hasExceptions = exceptions.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={24} className="text-purple-600" />
          Beschikbaarheid
        </h2>
        {hasPatterns ? (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
            <CheckCircle size={16} />
            Ingesteld
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-semibold">
            <AlertCircle size={16} />
            Niet Ingesteld
          </div>
        )}
      </div>

      {/* Weekly Pattern */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          Weekpatroon
        </h3>

        {!hasPatterns ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 font-semibold">
              Geen weekpatroon ingesteld
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Deze medewerker heeft nog geen vaste beschikbaarheid opgegeven
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {DAYS.map((day) => {
              const pattern = patternsByDay[day.value];
              const isAvailable = pattern && pattern.is_available;

              return (
                <div
                  key={day.value}
                  className={`p-3 rounded-lg border-2 ${
                    isAvailable
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isAvailable ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <span className="font-semibold text-gray-900 w-24">
                        {day.label}
                      </span>
                    </div>

                    {isAvailable ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-700">
                          {pattern.start_time.slice(0, 5)}
                        </span>
                        <span className="text-gray-400">tot</span>
                        <span className="font-semibold text-gray-700">
                          {pattern.end_time.slice(0, 5)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 italic">
                        Niet beschikbaar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exceptions */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-orange-600" />
          Uitzonderingen
        </h3>

        {!hasExceptions ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-sm">Geen uitzonderingen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exception) => {
              const date = new Date(exception.exception_date);
              const isPast = date < new Date();

              return (
                <div
                  key={exception.id}
                  className={`p-3 rounded-lg border ${
                    exception.is_available
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  } ${isPast ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {date.toLocaleDateString("nl-NL", {
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
                      <div
                        className={`text-xs font-semibold mt-1 ${
                          exception.is_available
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {exception.is_available
                          ? "✅ Extra beschikbaar"
                          : "❌ Niet beschikbaar"}
                      </div>
                      {isPast && (
                        <div className="text-xs text-gray-500 mt-1">
                          (Verstreken)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
