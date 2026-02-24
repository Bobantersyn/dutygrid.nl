import { useAuthContext } from "@/providers/AuthProvider";

export function useUserRole() {
  const context = useAuthContext();

  return {
    user: context.user,
    userLoading: context.userLoading,
    userRole: context.userRole,
    employeeId: context.employeeId,
    roleLoading: context.roleLoading,
    isPlannerOrAdmin: context.isPlannerOrAdmin,
    isSecurityGuard: context.isSecurityGuard,
    viewAsEmployee: context.viewAsEmployee,
    hasMultipleRoles: context.hasMultipleRoles,
    toggleViewAsEmployee: context.toggleViewAsEmployee,
  };
}
