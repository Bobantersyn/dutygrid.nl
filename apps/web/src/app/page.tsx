"use client";

console.log("[page.tsx] MODULE EVALUATED!");

import { useState, useEffect, Suspense } from "react";
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
import MobileLaunchpad from "@/components/Dashboard/MobileLaunchpad";

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
  console.log("[page.tsx] Dashboard rendered");
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

function HomeContent() {
  const { user, userLoading } = useAuthContext();
  console.log("[page.tsx] HomeContent rendered. userLoading:", userLoading, "user:", user?.email);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setShowStats(searchParams.get("view") === "stats");
    }
  }, []);

  // Show loading state while checking auth
  if (userLoading) {
    return <LoadingState />;
  }

  // Not logged in → show marketing website
  if (!user) {
    return <MarketingHome />;
  }

  // Logged in → show dashboard on desktop, launchpad on mobile (unless viewing stats)
  return (
    <>
      <div className={`${showStats ? "block" : "hidden lg:block"} w-full`}>
        <Dashboard />
      </div>
      {!showStats && (
        <div className="block lg:hidden w-full max-w-full overflow-hidden">
          <MobileLaunchpad />
        </div>
      )}
    </>
  );
}

import React, { Component } from 'react';

class LocalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Dashboard Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#990000', color: 'white', zIndex: 99999, position: 'fixed', inset: 0, overflow: 'auto' }}>
          <h1>Dashboard Crashed!</h1>
          <p>{this.state.error?.toString()}</p>
          <pre style={{ color: 'white', whiteSpace: 'pre-wrap', marginTop: 20 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HomePage() {
  console.log("[page.tsx] HomePage rendered");
  return (
    <LocalErrorBoundary>
      <HomeContent />
    </LocalErrorBoundary>
  );
}
