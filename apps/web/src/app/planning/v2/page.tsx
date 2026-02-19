"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  Clock,
  MapPin,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function PlanningV2Page() {
  const { data: user, loading: userLoading } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [gapsExpanded, setGapsExpanded] = useState(false); // Gaps collapse state

  // Fetch user role
  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch("/api/user-role");
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRole();
  }, [user]);

  // Calculate date range based on view mode
  const getDateRange = () => {
    if (viewMode === "day") {
      const dateStr = currentDate.toISOString().split("T")[0];
      return { start: dateStr, end: dateStr };
    } else {
      // Week view: Monday to Sunday
      const monday = new Date(currentDate);
      const day = monday.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      monday.setDate(monday.getDate() + diff);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        start: monday.toISOString().split("T")[0],
        end: sunday.toISOString().split("T")[0],
      };
    }
  };

  const dateRange = getDateRange();

  // Fetch shifts
  const { data: shiftsData } = useQuery({
    queryKey: ["shifts", dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(
        `/api/shifts?start_date=${dateRange.start}&end_date=${dateRange.end}`,
      );
      if (!response.ok) throw new Error("Failed to fetch shifts");
      return response.json();
    },
    enabled: !!userRole,
  });

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    enabled: !!userRole,
  });

  // Fetch gaps (only for planners/admins)
  const { data: gapsData } = useQuery({
    queryKey: ["planning-gaps", dateRange.start, dateRange.end],
    queryFn: async () => {
      const response = await fetch(
        `/api/planning-gaps?start_date=${dateRange.start}&end_date=${dateRange.end}`,
      );
      if (!response.ok) {
        if (response.status === 403) return { gaps: [] };
        throw new Error("Failed to fetch gaps");
      }
      return response.json();
    },
    enabled: !!userRole && ["planner", "admin"].includes(userRole),
  });

  const shifts = shiftsData?.shifts || [];
  const employees = employeesData?.employees || [];
  const gaps = gapsData?.gaps || [];

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate week days
  const getWeekDays = () => {
    const monday = new Date(currentDate);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = viewMode === "week" ? getWeekDays() : [currentDate];

  // Check if shift has rest time violation
  const hasRestTimeWarning = (shift) => {
    const shiftDate = new Date(shift.shift_date);
    const nextDay = new Date(shiftDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const prevDay = new Date(shiftDate);
    prevDay.setDate(prevDay.getDate() - 1);

    // Check if there's a shift the day before with less than 12h rest
    const prevShift = shifts.find((s) => {
      if (s.employee_id !== shift.employee_id) return false;
      const sDate = new Date(s.shift_date);
      return sDate.toDateString() === prevDay.toDateString();
    });

    if (prevShift) {
      const prevEnd = new Date(`${prevShift.shift_date}T${prevShift.end_time}`);
      const currentStart = new Date(`${shift.shift_date}T${shift.start_time}`);
      const restHours = (currentStart - prevEnd) / (1000 * 60 * 60);
      if (restHours < 12) return true;
    }

    return false;
  };

  if (userLoading || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laden...</p>
        </div>
      </div>
    );
  }

  if (!["planner", "admin"].includes(userRole)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-orange-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Geen Toegang
          </h2>
          <p className="text-gray-600 mb-4">
            Je hebt geen rechten om de planning te bekijken
          </p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Terug naar Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Bar */}
          <div
            className={`flex flex-col gap-4 transition-all ${isCollapsed ? "mb-0" : "mb-4"}`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Planning Overzicht (V2)
                </h1>
                <p className="text-gray-600 mt-1">
                  {viewMode === "week" ? "Weekplanning" : "Dagplanning"} met gap
                  detection & rusttijden
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                >
                  {isCollapsed ? "Toon Filters ▼" : "Verberg Filters ▲"}
                </button>
                <a
                  href="/planning/new"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nieuwe Dienst
                </a>
                <a
                  href="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </a>
              </div>
            </div>

            {/* Filters & Controls - Collapsible */}
            {!isCollapsed && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* View Mode Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weergave
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("day")}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        viewMode === "day"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Dag
                    </button>
                    <button
                      onClick={() => setViewMode("week")}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                        viewMode === "week"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Week
                    </button>
                  </div>
                </div>

                {/* Date Navigation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Datum Navigatie
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPrevious}
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={goToToday}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                    >
                      Vandaag
                    </button>
                    <button
                      onClick={goToNext}
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                {/* Current Period Info */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Huidige Periode
                  </label>
                  <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-semibold text-purple-900">
                      {viewMode === "day"
                        ? currentDate.toLocaleDateString("nl-NL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : `Week ${Math.ceil((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))}, ${currentDate.getFullYear()}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gaps Warning - Collapsible */}
          {gaps.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setGapsExpanded(!gapsExpanded)}
                className="w-full p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className="text-orange-600 flex-shrink-0"
                      size={24}
                    />
                    <div className="text-left">
                      <h3 className="font-bold text-orange-900">
                        {gaps.length} Openstaande Dienst
                        {gaps.length > 1 ? "en" : ""}
                      </h3>
                      <p className="text-sm text-orange-700">
                        Klik om details te bekijken
                      </p>
                    </div>
                  </div>
                  {gapsExpanded ? (
                    <ChevronUp className="text-orange-600" size={24} />
                  ) : (
                    <ChevronDown className="text-orange-600" size={24} />
                  )}
                </div>
              </button>

              {gapsExpanded && (
                <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="space-y-4">
                    {gaps.slice(0, 5).map((gap, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-orange-400 pl-3"
                      >
                        <div className="text-sm text-orange-900 font-semibold mb-1">
                          {gap.location_name}
                          {gap.client_name && ` (${gap.client_name})`} op{" "}
                          {new Date(gap.date).toLocaleDateString("nl-NL", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        {gap.suggested_employees.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-orange-800 font-semibold">
                              Beschikbare medewerkers (gesorteerd op afstand):
                            </p>
                            {gap.suggested_employees
                              .slice(0, 3)
                              .map((emp, empIdx) => (
                                <div
                                  key={empIdx}
                                  className="text-xs text-orange-800 flex items-center gap-2"
                                >
                                  <span className="font-medium">
                                    {emp.name}
                                  </span>
                                  <span className="text-orange-600">
                                    ({emp.cao_type})
                                  </span>
                                  {emp.distance_km !== null && (
                                    <span className="text-green-700 font-semibold">
                                      {emp.distance_km} km • €
                                      {emp.travel_costs?.toFixed(2)} reiskosten
                                    </span>
                                  )}
                                  {emp.distance_km === null && (
                                    <span className="text-gray-600 italic text-[10px]">
                                      (geen adres)
                                    </span>
                                  )}
                                </div>
                              ))}
                            {gap.suggested_employees.length > 3 && (
                              <p className="text-xs text-orange-700 italic">
                                +{gap.suggested_employees.length - 3} meer...
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-orange-700 italic mt-1">
                            Geen beschikbare medewerkers
                          </p>
                        )}
                      </div>
                    ))}
                    {gaps.length > 5 && (
                      <p className="text-sm text-orange-700 font-semibold border-t border-orange-200 pt-2">
                        + {gaps.length - 5} meer openstaande diensten...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Planning Grid */}
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 min-w-[900px]">
            <div className="p-4 font-bold text-gray-700 border-r border-gray-200">
              Medewerker
            </div>
            {weekDays.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`p-4 text-center border-r border-gray-200 ${
                    isToday ? "bg-blue-50" : ""
                  }`}
                >
                  <div
                    className={`font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}
                  >
                    {day.toLocaleDateString("nl-NL", { weekday: "short" })}
                  </div>
                  <div
                    className={`text-sm ${isToday ? "text-blue-600" : "text-gray-600"}`}
                  >
                    {day.getDate()}/{day.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Employee Rows */}
          <div className="min-w-[900px]">
            {employees.map((employee) => {
              const employeeShifts = shifts.filter(
                (s) => s.employee_id === employee.id,
              );

              return (
                <div
                  key={employee.id}
                  className="grid grid-cols-8 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="p-4 border-r border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {employee.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {employee.cao_type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {weekDays.map((day, idx) => {
                    const dayStr = day.toISOString().split("T")[0];
                    const dayShifts = employeeShifts.filter(
                      (s) => s.shift_date === dayStr,
                    );

                    return (
                      <div
                        key={idx}
                        className="p-2 border-r border-gray-200 min-h-[80px]"
                      >
                        {dayShifts.length > 0 ? (
                          <div className="space-y-1">
                            {dayShifts.map((shift) => {
                              const hasWarning = hasRestTimeWarning(shift);
                              return (
                                <div
                                  key={shift.id}
                                  className={`p-2 rounded-lg text-xs ${
                                    hasWarning
                                      ? "bg-red-100 border border-red-300"
                                      : "bg-purple-100 border border-purple-200"
                                  }`}
                                >
                                  {hasWarning && (
                                    <div className="flex items-center gap-1 text-red-700 mb-1">
                                      <AlertTriangle size={12} />
                                      <span className="font-bold text-[10px]">
                                        &lt;12u rust
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1 text-gray-900">
                                    <Clock size={12} />
                                    <span className="font-semibold">
                                      {shift.start_time.slice(0, 5)} -{" "}
                                      {shift.end_time.slice(0, 5)}
                                    </span>
                                  </div>
                                  {shift.location_name && (
                                    <div className="flex items-center gap-1 text-gray-700 mt-1">
                                      <MapPin size={10} />
                                      <span className="truncate">
                                        {shift.location_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            <span className="text-xs">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {employees.length === 0 && (
              <div className="p-12 text-center col-span-8">
                <Users className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-600">Geen medewerkers gevonden</p>
                <a
                  href="/employees/new"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Voeg medewerker toe
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
