import { useQuery } from "@tanstack/react-query";

export function useCaoTypes() {
  const { data: caoData } = useQuery({
    queryKey: ["cao-types"],
    queryFn: async () => {
      const response = await fetch("/api/cao-types");
      if (!response.ok) throw new Error("Failed to fetch CAO types");
      return response.json();
    },
  });

  return {
    caoTypes: caoData?.caoTypes || [],
  };
}
