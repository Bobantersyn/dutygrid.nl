import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";

export function useUserRole() {
  const { data: user, loading: userLoading } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [roleLoading, setRoleLoading] = useState<boolean>(true);
  const [viewAsEmployee, setViewAsEmployee] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("dutygrid_view_as_employee");
      if (savedView === "true") {
        setViewAsEmployee(true);
      }
    }
  }, []);

  useEffect(() => {
    const checkRole = async () => {
      if (userLoading) return;

      if (!user) {
        window.location.href = "/account/signin";
        return;
      }

      try {
        const response = await fetch("/api/user-role");
        if (response.ok) {
          const data = await response.json();
          if (!data.role) {
            window.location.href = "/setup-role";
            return;
          }
          setUserRole(data.role);
          setEmployeeId(data.employee_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRoleLoading(false);
      }
    };
    checkRole();
  }, [user, userLoading]);

  const isPlannerOrAdmin =
    userRole &&
    ["planner", "admin"].includes(userRole) &&
    !viewAsEmployee;

  const isSecurityGuard =
    (userRole &&
      ["beveiliger", "beveiliger_extended", "security_guard"].includes(
        userRole,
      )) ||
    viewAsEmployee;

  const hasMultipleRoles =
    userRole && ["planner", "admin"].includes(userRole) && employeeId !== null;

  const toggleViewAsEmployee = () => {
    const newVal = !viewAsEmployee;
    setViewAsEmployee(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("dutygrid_view_as_employee", newVal ? "true" : "false");
      window.location.reload(); // Reload to apply the new view immediately
    }
  };

  return {
    user,
    userLoading,
    userRole,
    employeeId,
    roleLoading,
    isPlannerOrAdmin,
    isSecurityGuard,
    viewAsEmployee,
    hasMultipleRoles,
    toggleViewAsEmployee,
  };
}
