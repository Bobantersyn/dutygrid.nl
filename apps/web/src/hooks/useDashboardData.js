import { useQuery } from "@tanstack/react-query";
import { formatDateLocal } from "@/utils/dateUtils";

export function useDashboardData({
  userRole,
  roleLoading,
  isPlannerOrAdmin,
  employeeId,
}) {
  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
    enabled: !!userRole && !roleLoading && isPlannerOrAdmin,
  });

  const { data: shiftsData } = useQuery({
    queryKey: ["shifts", employeeId],
    queryFn: async () => {
      const today = formatDateLocal(new Date());
      let url = `/api/shifts?start_date=${today}`;

      if (!isPlannerOrAdmin && employeeId) {
        url += `&employee_id=${employeeId}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch shifts");
      return response.json();
    },
    enabled: !!userRole && !roleLoading,
  });

  const { data: weekShiftsData } = useQuery({
    queryKey: ["week-shifts"],
    queryFn: async () => {
      // Calculate today and today + 7 days
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const todayStr = formatDateLocal(today);
      const nextWeekStr = formatDateLocal(nextWeek);

      // Fetch all shifts for the next 7 days
      const response = await fetch(`/api/shifts?start_date=${todayStr}&end_date=${nextWeekStr}`);
      if (!response.ok) throw new Error("Failed to fetch week shifts");
      return response.json();
    },
    enabled: !!userRole && !roleLoading && isPlannerOrAdmin,
  });

  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
    enabled: !!userRole && !roleLoading && isPlannerOrAdmin,
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const response = await fetch("/api/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return response.json();
    },
    enabled: !!userRole && !roleLoading && isPlannerOrAdmin,
  });

  const { data: leaveRequestsData } = useQuery({
    queryKey: ["leave-requests"],
    queryFn: async () => {
      const response = await fetch("/api/leave?status=pending");
      if (!response.ok) throw new Error("Failed to fetch leave requests");
      return response.json();
    },
    enabled: !!userRole && !roleLoading && isPlannerOrAdmin,
  });

  const employees = employeesData?.employees || [];
  const todayShifts = shiftsData?.shifts || [];
  const weekShifts = weekShiftsData?.shifts || [];

  // Filter for ONLY open shifts for the coming week
  const openShiftsWeek = weekShifts.filter(s => !s.employee_id);

  const clients = clientsData?.clients || [];
  const assignments = assignmentsData?.assignments || [];
  const activeAssignments = assignments.filter((a) => a.active);
  const pendingLeaveRequests = leaveRequestsData?.requests || [];

  return {
    employees,
    todayShifts,
    openShiftsWeek,
    clients,
    assignments,
    activeAssignments,
    pendingLeaveRequests,
  };
}
