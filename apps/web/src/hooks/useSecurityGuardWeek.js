import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function useSecurityGuardWeek(employeeId) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatWeekRange = () => {
    const start = currentWeekStart;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()} ${start.toLocaleDateString("nl-NL", { month: "short" })} - ${end.getDate()} ${end.toLocaleDateString("nl-NL", { month: "short", year: "numeric" })}`;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newWeek);
  };

  const { data: shiftsData, isLoading } = useQuery({
    queryKey: [
      "security-guard-shifts",
      employeeId,
      currentWeekStart.toISOString(),
    ],
    queryFn: async () => {
      const startDate = currentWeekStart.toISOString().split("T")[0];
      const endDate = new Date(currentWeekStart);
      endDate.setDate(currentWeekStart.getDate() + 6);
      const endDateStr = endDate.toISOString().split("T")[0];

      const url = `/api/shifts?employee_id=${employeeId}&start_date=${startDate}&end_date=${endDateStr}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch shifts");
      return response.json();
    },
    enabled: !!employeeId,
  });

  const weekDates = getWeekDates();
  const shifts = shiftsData?.shifts || [];

  const shiftsByDate = weekDates.map((date) => {
    const dateStr = date.toISOString().split("T")[0];
    return {
      date,
      dateStr,
      shifts: shifts.filter((s) => s.shift_date === dateStr),
    };
  });

  return {
    currentWeekStart,
    weekDates,
    shiftsByDate,
    formatWeekRange,
    navigateWeek,
    isLoading,
  };
}
