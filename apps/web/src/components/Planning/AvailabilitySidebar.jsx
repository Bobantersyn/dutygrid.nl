import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";

function formatDayDate(dateStr) {
  const date = new Date(dateStr);
  const dayNames = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const dayName = dayNames[date.getDay()];
  const dayNum = date.getDate();
  const monthNum = date.getMonth() + 1;
  return `${dayName} ${dayNum}/${monthNum}`;
}

export function AvailabilitySidebar({
  weekStart,
  selectedDate = null,
  shifts = [],
  onEmployeeClick,
  onEmployeeDragStart,
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["availability-week-overview", weekStart],
    queryFn: async () => {
      const response = await fetch(
        `/api/availability/week-overview?week_start=${weekStart}`,
      );
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
    enabled: !!weekStart,
  });

  // State for toggling "Exception First" view
  const [showExceptionsOnly, setShowExceptionsOnly] = useState(false);

  const handleDragStart = (e, employee) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: employee.id,
        name: employee.name,
      }),
    );
    onEmployeeDragStart?.(employee);
  };

  const handleHeaderDoubleClick = (e) => {
    e.preventDefault();
    setShowExceptionsOnly(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-blue-600" />
          <h3 className="font-bold text-gray-900">Beschikbaarheid</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
        <h3 className="font-bold text-red-700 mb-2">Fout bij laden</h3>
        <p className="text-sm text-red-500">Kon beschikbaarheid niet ophalen.</p>
        <p className="text-xs text-red-400 mt-1">{error.message}</p>
      </div>
    );
  }

  if (!data?.employees) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-gray-900 mb-2">Geen gegevens</h3>
        <p className="text-sm text-gray-500">Er zijn geen medewerkers gevonden.</p>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-4 flex flex-col items-center text-center">
        <div className="bg-blue-50 p-3 rounded-full mb-3">
          <Calendar size={24} className="text-blue-600" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Wie is beschikbaar?</h3>
        <p className="text-sm text-gray-600">
          Klik op een dag in de agenda om te zien wie er beschikbaar is.
        </p>
      </div>
    );
  }

  // Filter voor specifieke dag FIRST, to determine status
  const dayAvailability = data.availability_by_day[selectedDate] || [];

  // Base employees list with today's status attached
  const employeesWithStatus = data.employees.map(emp => {
    const dayInfo = dayAvailability.find(d => d.employee_id === emp.id);
    return {
      ...emp,
      is_available_today: dayInfo?.is_available || false,
      today_hours: dayInfo?.hours || null,
      today_reason: dayInfo?.reason || null,
      // Calculate if this is an "exception" for TODAY
      // An exception today is simply: NOT Available Today
      // Unless we want to account for "Partial Availability" (not implemented yet).
      is_exception_today: !(dayInfo?.is_available)
    };
  });

  // Filter logic based on showExceptionsOnly (Rule F)
  let filteredEmployees = employeesWithStatus;

  if (showExceptionsOnly) {
    // Rule F: Show ONLY "Niet Inzetbaar".
    // This means is_available_today === false
    filteredEmployees = employeesWithStatus.filter(e => !e.is_available_today);

    // Sort: Reasons? Alphabetic?
    // Maybe sort by reason to group "Ziek" together?
    filteredEmployees.sort((a, b) => {
      const reasonA = a.today_reason || "";
      const reasonB = b.today_reason || "";
      if (reasonA && !reasonB) return -1;
      if (!reasonA && reasonB) return 1;
      return a.name.localeCompare(b.name);
    });
  } else {
    // Default: Show Everyone (Sorted by Availability % as before, OR by today's availability?)
    // Original logic was sorted by availability_percentage. Let's keep that for general view.
    filteredEmployees.sort((a, b) => b.availability_percentage - a.availability_percentage);
  }

  // Vind alle employee IDs die al een shift hebben op deze dag
  const shiftsOnThisDay = shifts.filter(
    (shift) => shift.shift_date === selectedDate,
  );
  const employeesWithShift = new Set(
    shiftsOnThisDay.map((shift) => parseInt(shift.employee_id)),
  );

  // Final display list (exclude those already scheduled, unless we want to see them in exception view?)
  // User said: "Show only employees that are NOT deployable". 
  // If someone is scheduled, they are effectively deployed.
  // But standard logic filters out scheduled people. Let's keep that.
  const displayEmployees = filteredEmployees.filter((emp) => {
    const hasShift = employeesWithShift.has(parseInt(emp.id));
    return emp.is_available_today && !hasShift;
    // Problem: If showExceptionsOnly is true, we want to show UNAVAILABLE people.
    // The line `return emp.is_available_today` HIDES unavailable people!
    // I need to change this logic.
  });

  // REVISED LOGIC FOR DISPLAY
  const finalDisplayList = filteredEmployees.filter(emp => {
    const hasShift = employeesWithShift.has(parseInt(emp.id));

    if (showExceptionsOnly) {
      // Exception View: Show people who are UNAVAILABLE or Partial
      // So we DON'T filter by `is_available_today`.
      // We essentially want to see the list of "Cannot Work".
      // But `filteredEmployees` already filters by `< 100%`.
      return !hasShift;
    } else {
      // Standard View: Show people who ARE available
      return emp.is_available_today && !hasShift;
    }
  });


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">
              {showExceptionsOnly ? "Niet Beschikbaar" : `Beschikbaar op ${formatDayDate(selectedDate)}`}
            </h3>
          </div>
        </div>
        <div className="text-sm text-gray-600 flex-shrink-0 ml-2">
          {finalDisplayList.length}
        </div>
      </div>

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
        {/* SECTION 1: Fixed Employees */}
        <div>
          <h4
            className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1 cursor-pointer hover:text-blue-600 select-none flex items-center justify-between group"
            onDoubleClick={handleHeaderDoubleClick}
            title="Dubbelklik om te wisselen tussen 'Beschikbaar' en 'Afwezig'"
          >
            Vaste Krachten
            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 lowercase font-normal transition-opacity">
              (dubbelklik ⇅)
            </span>
          </h4>
          <div className="bg-gray-50 rounded-lg p-1 space-y-1">
            {finalDisplayList
              .filter(e => !e.can_manage_own_availability)
              // Sort by name within the group, respecting the overall sort order? 
              // If showExceptionsOnly, we already sorted by availability. 
              // Let's add name sort as secondary.
              .map((employee) => {
                // Determine style
                let colorClass = "hover:bg-white hover:shadow-sm text-gray-700";
                let dotColor = "bg-blue-400";

                if (employee.availability_percentage === 0) {
                  // Keep red if 0% availability (or should this also check is_available_today?)
                  // For fixed employees, 0% usually means inactive or fully absent.
                  // But let's align with the new strict 'Exception View' logic.
                  // If we are in 'Exception Mode', only absentees show up.
                  // If we are in 'Normal Mode', everyone shows up.
                  // Let's stick to the requested fix: Remove Orange.
                  colorClass = "hover:bg-red-50 text-red-700 opacity-75";
                  dotColor = "bg-red-500";
                }
                // Removed else if percentage < 100 (Orange)

                return (
                  <button
                    key={employee.id}
                    draggable={!showExceptionsOnly && employee.is_available_today} // Only draggable if available?
                    onDragStart={(e) => handleDragStart(e, employee)}
                    onClick={() => onEmployeeClick(employee.id)}
                    onDoubleClick={() => onEmployeeClick(employee.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all border border-transparent hover:border-gray-200 group cursor-pointer ${colorClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        <span className="font-semibold truncate text-sm">
                          {employee.name}
                        </span>
                      </div>
                      {showExceptionsOnly ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-red-600">
                            {employee.today_reason || "Niet beschikbaar"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs opacity-70 hidden">
                          {employee.availability_percentage}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            {finalDisplayList.filter(e => !e.can_manage_own_availability).length === 0 && (
              <div className="text-center text-xs text-gray-400 py-2">
                {showExceptionsOnly ? "Geen afwezigen" : "Geen vaste medewerkers beschikbaar"}
              </div>
            )}
          </div>
        </div>


        {/* SECTION 2: Flex (Own Availability) */}
        <div>
          <h4
            className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1 cursor-pointer hover:text-blue-600 select-none flex items-center justify-between group"
            onDoubleClick={handleHeaderDoubleClick}
            title="Dubbelklik om te wisselen tussen 'Beschikbaar' en 'Afwezig'"
          >
            Oproepkrachten (Flex)
            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 lowercase font-normal transition-opacity">
              (dubbelklik ⇅)
            </span>
          </h4>
          <div className="space-y-1">
            {finalDisplayList
              .filter(e => e.can_manage_own_availability)
              .map((employee) => {
                // Determine color/icon based on status
                let colorClass = "hover:bg-green-50 hover:border-green-200";
                let Icon = CheckCircle;
                let iconColor = "text-green-600";
                let textColor = "text-green-700";

                if (!employee.is_available_today) {
                  colorClass = "hover:bg-red-50 hover:border-red-200 opacity-60 hover:opacity-100";
                  Icon = XCircle;
                  iconColor = "text-red-600";
                  textColor = "text-red-700";
                }
                // Removed Rule for < 100% (Orange/Yellow). 
                // If they are available TODAY, they are Green.


                return (
                  <button
                    key={employee.id}
                    draggable={!showExceptionsOnly && employee.is_available_today}
                    onDragStart={(e) => handleDragStart(e, employee)}
                    onClick={() => onEmployeeClick(employee.id)}
                    onDoubleClick={() => onEmployeeClick(employee.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border border-transparent group cursor-grab active:cursor-grabbing ${colorClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Icon size={16} className={`${iconColor} flex-shrink-0`} />
                        <span className="font-semibold text-gray-900 truncate text-sm">
                          {employee.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {showExceptionsOnly ? (
                          <span className="text-xs font-bold text-red-600">
                            {employee.today_reason || "Niet beschikbaar"}
                          </span>
                        ) : (
                          <span className={`text-xs font-bold ${textColor}`}>
                            {selectedDate
                              ? employee.today_hours || (employee.is_available_today ? "✓" : "✗")
                              : `${employee.available_days}/${employee.total_days}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

            {finalDisplayList.filter(e => e.can_manage_own_availability).length === 0 && (
              <div className="text-center text-xs text-gray-400 py-2">
                {showExceptionsOnly ? "Geen afwezigen" : "Geen flexmedewerkers beschikbaar"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
