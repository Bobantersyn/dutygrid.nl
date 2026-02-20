import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDateLocal } from "@/utils/dateUtils";

export function usePlanningData(currentWeek, userRole) {
  const queryClient = useQueryClient();

  const isPlannerOrAdmin = userRole && ["planner", "admin"].includes(userRole);

  const { data, isLoading } = useQuery({
    queryKey: ["shifts", currentWeek.start, currentWeek.end],
    queryFn: async () => {
      const response = await fetch(
        `/api/shifts?start_date=${currentWeek.start}&end_date=${currentWeek.end}`,
      );
      if (!response.ok) throw new Error("Failed to fetch shifts");
      return response.json();
    },
    enabled: !!userRole,
  });

  // Only fetch gaps for planners/admins
  const { data: gapsData } = useQuery({
    queryKey: ["planning-gaps", currentWeek.start, currentWeek.end],
    queryFn: async () => {
      const response = await fetch(
        `/api/planning-gaps?start_date=${currentWeek.start}&end_date=${currentWeek.end}`,
      );
      if (!response.ok) {
        if (response.status === 403) return { gaps: [] };
        throw new Error("Failed to fetch gaps");
      }
      return response.json();
    },
    enabled: !!userRole && isPlannerOrAdmin,
  });

  // Only fetch swap requests for planners/admins
  const { data: swapData } = useQuery({
    queryKey: ["swap-requests"],
    queryFn: async () => {
      const response = await fetch("/api/shift-swaps");
      if (!response.ok) {
        if (response.status === 403) return [];
        throw new Error("Failed to fetch swap requests");
      }
      return response.json();
    },
    enabled: !!userRole && isPlannerOrAdmin,
  });

  // Fetch Pending Leave Requests
  const { data: leaveRequestsData } = useQuery({
    queryKey: ["planning-leave-pending"],
    queryFn: async () => {
      const response = await fetch("/api/leave?status=pending");
      if (!response.ok) return { requests: [] };
      return response.json();
    },
    enabled: !!userRole && isPlannerOrAdmin,
  });

  // Fetch Approved Leave (Exceptions) for the week
  const { data: exceptionsData } = useQuery({
    queryKey: ["planning-exceptions", currentWeek.start, currentWeek.end],
    queryFn: async () => {
      const response = await fetch(`/api/availability/exceptions?start_date=${currentWeek.start}&end_date=${currentWeek.end}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!userRole && isPlannerOrAdmin,
  });

  const swapActionMutation = useMutation({
    mutationFn: async ({ swapId, action, message, newEmployeeId }) => {
      // Logic converts 'approve'/'reject' to status
      const status = action === 'approve' ? 'approved' : 'rejected';

      const response = await fetch(`/api/shift-swaps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: swapId,
          status,
          response_message: message,
          new_employee_id: newEmployeeId
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process swap request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["swap-requests"] });
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId) => {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete shift");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      // Also invalidate gaps/availability if needed
      queryClient.invalidateQueries({ queryKey: ["planning-gaps"] });
      queryClient.invalidateQueries({ queryKey: ["planning-availability"] });
    },
  });

  const shifts = data?.shifts || [];

  // MERGE LEAVE INTO SHIFTS
  const pendingLeaves = leaveRequestsData?.requests || [];
  const approvedLeaves = exceptionsData || [];

  // 1. Transform Pending Leave Requests -> Ghost Shifts
  const pendingLeaveShifts = pendingLeaves.map(req => {
    const days = [];
    let loop = new Date(req.start_date);
    const end = new Date(req.end_date);

    while (loop <= end) {
      days.push(formatDateLocal(loop));
      loop.setDate(loop.getDate() + 1);
    }

    return days.map((dateStr, idx) => ({
      id: `leave-pending-${req.id}-${idx}`,
      original_id: req.id,
      employee_id: req.employee_id,
      employee_name: req.employee_name,
      shift_date: dateStr,
      start_time: '00:00:00',
      end_time: '23:59:00',
      type: 'leave_pending',
      status: 'pending',
      note: req.note,
      is_ghost: true,
      can_manage_own_availability: true,
    }));
  }).flat().filter(s => s.shift_date >= currentWeek.start && s.shift_date <= currentWeek.end);

  // 2. Transform Approved Exceptions (is_available = false) -> Ghost Shifts
  const exceptionShifts = approvedLeaves
    .filter(ex => ex.is_available === false)
    .map(ex => ({
      id: `exception-${ex.id}`,
      employee_id: ex.employee_id,
      employee_name: ex.employee_name,
      shift_date: ex.exception_date.split('T')[0],
      start_time: ex.start_time || '00:00:00',
      end_time: ex.end_time || '23:59:00',
      type: 'leave_approved',
      note: ex.reason,
      is_ghost: true
    }));

  const allShifts = [...shifts, ...pendingLeaveShifts, ...exceptionShifts];

  const gaps = gapsData?.gaps || [];
  const swapRequests = Array.isArray(swapData) ? swapData : (swapData?.swapRequests || []);
  const pendingSwaps = swapRequests.filter((s) => s.status === "pending");

  return {
    shifts: allShifts,
    gaps,
    swapRequests,
    pendingSwaps,
    isLoading,
    swapActionMutation,
    deleteShiftMutation,
  };
}
