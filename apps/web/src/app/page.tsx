"use client";

import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardData } from "@/hooks/useDashboardData";
import { LoadingState } from "@/components/Dashboard/LoadingState";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { TodayShifts } from "@/components/Dashboard/TodayShifts";
import { ClientsModal } from "@/components/Dashboard/Modals/ClientsModal";
import { AssignmentsModal } from "@/components/Dashboard/Modals/AssignmentsModal";
import { EmployeesModal } from "@/components/Dashboard/Modals/EmployeesModal";
import { ShiftsModal } from "@/components/Dashboard/Modals/ShiftsModal";
import { LeaveRequestsModal } from "@/components/Dashboard/Modals/LeaveRequestsModal";
import { QuickPlanModal } from "@/components/Planning/QuickPlanModal";
import { SecurityGuardWeekView } from "@/components/SecurityGuard/SecurityGuardWeekView";

export default function HomePage() {
  const {
    userLoading,
    roleLoading,
    userRole,
    employeeId,
    isPlannerOrAdmin,
    isSecurityGuard,
  } = useUserRole();
  const [activeModal, setActiveModal] = useState(null);
  const [editingShift, setEditingShift] = useState(null);

  const { employees, todayShifts, openShiftsWeek, clients, activeAssignments, pendingLeaveRequests } =
    useDashboardData({ userRole, roleLoading, isPlannerOrAdmin, employeeId });

  if (userLoading || roleLoading) {
    return <LoadingState />;
  }

  // Security guards see week view
  if (isSecurityGuard) {
    return <SecurityGuardWeekView employeeId={employeeId} />;
  }

  // Planners and admins see dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader isPlannerOrAdmin={isPlannerOrAdmin} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards
          isPlannerOrAdmin={isPlannerOrAdmin}
          clients={clients}
          activeAssignments={activeAssignments}
          employees={employees}
          todayShifts={todayShifts}
          openShiftsWeek={openShiftsWeek}
          pendingLeaveRequests={pendingLeaveRequests}
          onCardClick={setActiveModal}
        />

        <QuickActions isPlannerOrAdmin={isPlannerOrAdmin} />

        <TodayShifts
          isPlannerOrAdmin={isPlannerOrAdmin}
          todayShifts={todayShifts}
          onEdit={setEditingShift}
        />
      </div>

      {activeModal === "clients" && (
        <ClientsModal clients={clients} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "assignments" && (
        <AssignmentsModal
          activeAssignments={activeAssignments}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "employees" && (
        <EmployeesModal
          employees={employees}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "open-shifts" && (
        <ShiftsModal
          todayShifts={openShiftsWeek}
          title="Openstaande Diensten (7 dagen)"
          groupedByDate={true}
          onClose={() => setActiveModal(null)}
          onEdit={(shift: any) => {
            setActiveModal(null);
            setEditingShift(shift);
          }}
        />
      )}

      {activeModal === "shifts" && (
        <ShiftsModal
          todayShifts={todayShifts}
          onClose={() => setActiveModal(null)}
          onEdit={(shift: any) => {
            setActiveModal(null);
            setEditingShift(shift);
          }}
        />
      )}

      {activeModal === "leave-requests" && (
        <LeaveRequestsModal
          requests={pendingLeaveRequests}
          onClose={() => setActiveModal(null)}
        />
      )}

      {editingShift && (
        <QuickPlanModal
          shift={editingShift}
          onClose={() => setEditingShift(null)}
          onSuccess={() => { }}
          employee={undefined}
          prefilledDate={undefined}
        />
      )}
    </div>
  );
}
