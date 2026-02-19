import { useQuery } from "@tanstack/react-query";

export function useEmployeeShifts(employeeId) {
  const { data: shiftsData } = useQuery({
    queryKey: ["employee-shifts", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/shifts?employee_id=${employeeId}`);
      if (!response.ok) throw new Error("Failed to fetch shifts");
      return response.json();
    },
  });

  return {
    shifts: shiftsData?.shifts || [],
  };
}
