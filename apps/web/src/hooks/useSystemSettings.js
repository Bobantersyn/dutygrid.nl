
import { useQuery } from "@tanstack/react-query";

export function useSystemSettings() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["system-settings"],
        queryFn: async () => {
            const response = await fetch("/api/system-settings");
            if (!response.ok) throw new Error("Failed to fetch settings");
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        settings: data || {},
        isLoading,
        error,
        // Helpers
        useEmployeeAvailability: data?.use_employee_availability === true, // Default to false if missing
    };
}
