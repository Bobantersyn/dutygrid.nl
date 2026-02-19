import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";

export function useUserRole() {
  const { data: user, loading: userLoading } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

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

  const isPlannerOrAdmin = userRole && ["planner", "admin"].includes(userRole);
  const isSecurityGuard =
    userRole && ["beveiliger", "beveiliger_extended", "security_guard"].includes(userRole);

  return {
    user,
    userLoading,
    userRole,
    employeeId,
    roleLoading,
    isPlannerOrAdmin,
    isSecurityGuard,
  };
}
