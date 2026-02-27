import { ChevronLeft, ChevronRight } from "lucide-react";

export function PlanningControls({
  searchQuery,
  onSearchChange,
  filteredShiftsCount,
  gridView,
  onGridViewChange,
  currentWeek,
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onPreviousDay,
  onNextDay,
  isPlannerOrAdmin = true,
}) {
  return (
    <div
      className={`grid grid-cols-1 ${isPlannerOrAdmin ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"} gap-4`}
    >
      {/* Search Field - Only for planners/admins */}
      {isPlannerOrAdmin && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🔍 Zoek Medewerker
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Type een naam..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <p className="text-xs text-gray-600 mt-1">
              {filteredShiftsCount} dienst
              {filteredShiftsCount !== 1 ? "en" : ""} gevonden
            </p>
          )}
        </div>
      )}

      {/* Grid View Toggle */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Weergave
        </label>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => onGridViewChange("day")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${gridView === "day"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Vandaag
          </button>
          <button
            onClick={() => onGridViewChange("week")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${gridView === "week"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Week
          </button>
          <button
            onClick={() => onGridViewChange("month")}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${gridView === "month"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Maand
          </button>
        </div>
      </div>

      {/* Current Period Info - Now with Navigation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Huidige Periode
        </label>
        <div className="flex gap-2">
          <button
            onClick={gridView === "day" ? onPreviousDay : onPreviousWeek}
            className="p-4 md:px-3 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-center">
            <p className="font-semibold text-purple-900 text-sm">
              {gridView === "day" ? (
                currentDate.toLocaleDateString("nl-NL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              ) : (
                <>
                  {new Date(currentWeek.start).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  -{" "}
                  {new Date(currentWeek.end).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                  })}
                  <span className="ml-2 text-purple-700 hidden sm:inline">
                    (Week {currentWeek.weekNumber})
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={gridView === "day" ? onNextDay : onNextWeek}
            className="p-4 md:px-3 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
