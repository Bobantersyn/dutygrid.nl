import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEmployeeDetail(id) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  const {
    data,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${id}`);
      if (!response.ok) throw new Error("Failed to fetch employee");
      const result = await response.json();
      setFormData(result.employee);
      return result;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update employee");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employee", id]);
      queryClient.invalidateQueries(["employees"]);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete employee");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/employees";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  return {
    data,
    isLoading,
    fetchError,
    formData,
    setFormData,
    error,
    setError,
    updateMutation,
    deleteMutation,
  };
}
