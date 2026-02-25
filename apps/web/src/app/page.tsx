"use client";

import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardData } from "@/hooks/useDashboardData";

// Marketing components
import "@/components/Marketing/marketing.css";
import { MarketingNavbar } from "@/components/Marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/Marketing/MarketingFooter";
import { HeroSection } from "@/components/Marketing/HeroSection";
import { FeaturesGrid } from "@/components/Marketing/FeaturesGrid";
import { CTABanner } from "@/components/Marketing/CTABanner";

// Dashboard components
import { LoadingState } from "@/components/Dashboard/LoadingState";
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

function MarketingHome() {
  return (
    <div className="marketing-page">
      <MarketingNavbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <CTABanner />
      </main>
      <MarketingFooter />
    </div>
  );
}

function Dashboard() {
  const {
    userRole,
    roleLoading,
    employeeId,
    isPlannerOrAdmin,
    isSecurityGuard,
  } = useUserRole();
  const [activeModal, setActiveModal] = useState(null);
  const [editingShift, setEditingShift] = useState(null);

  const { employees, todayShifts, openShiftsWeek, clients, activeAssignments, pendingLeaveRequests } =
    useDashboardData({ userRole, roleLoading, isPlannerOrAdmin, employeeId });

  if (isSecurityGuard) {
    return <SecurityGuardWeekView employeeId={employeeId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

export default function HomePage() {
  const { user, userLoading } = useAuthContext();

  // Show loading state while checking auth
  if (userLoading) {
    return <LoadingState />;
  }

  // Not logged in → show marketing website
  if (!user) {
    return <MarketingHome />;
  }

  // Logged in → show dashboard
  return <Dashboard />;
}
