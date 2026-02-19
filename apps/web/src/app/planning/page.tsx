"use client";

import { useState, useEffect } from "react";
import { Users, X } from "lucide-react";
import useUser from "@/utils/useUser";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanningWeek } from "@/hooks/usePlanningWeek";
import { usePlanningData } from "@/hooks/usePlanningData";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { PlanningHeader } from "@/components/Planning/PlanningHeader";
import { PlanningControls } from "@/components/Planning/PlanningControls";
import { GapsWarning } from "@/components/Planning/GapsWarning";
import { SwapRequestsPanel } from "@/components/Planning/SwapRequestsPanel";
import { DayView } from "@/components/Planning/DayView";
import { WeekView } from "@/components/Planning/WeekView";
import { DeleteModal } from "@/components/Planning/DeleteModal";
import { SwapApprovalModal } from "@/components/Planning/SwapApprovalModal";
import { AvailabilitySidebar } from "@/components/Planning/AvailabilitySidebar";
// import { AvailabilityDetailPopup } from "@/components/Planning/AvailabilityDetailPopup"; // DEPRECATED
import { EmployeeDetailDrawer } from "@/components/Planning/EmployeeDetailDrawer";
import { QuickPlanModal } from "@/components/Planning/QuickPlanModal";
import { AvailabilityStatusModal } from "@/components/Planning/AvailabilityStatusModal";

export default function PlanningPage() {
  const { data: user, loading: userLoading } = useUser();
  const { userRole, isPlannerOrAdmin, roleLoading } = useUserRole();
  const { useEmployeeAvailability } = useSystemSettings();
  const [showAvailabilityStatus, setShowAvailabilityStatus] = useState(false);
  const {
    currentWeek,
    currentDate,
    previousWeek,
    nextWeek,
    previousDay,
    nextDay,
    setDate,
  } = usePlanningWeek();

  const { shifts, gaps, pendingSwaps, isLoading, swapActionMutation, deleteShiftMutation } =
    usePlanningData(currentWeek, userRole);

  const [deleteId, setDeleteId] = useState(null);
  const [gridView, setGridView] = useState("week");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gapsExpanded, setGapsExpanded] = useState(false);
  const [swapsExpanded, setSwapsExpanded] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Force Day View on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setGridView("day");
    }
  }, []);

  // Quick Plan Modal State
  const [quickPlanEmployee, setQuickPlanEmployee] = useState(null);
  const [quickPlanDate, setQuickPlanDate] = useState(null);
  const [editShift, setEditShift] = useState(null);

  const filteredShifts = searchQuery.trim()
    ? shifts.filter((shift) =>
      shift.employee_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : shifts;

  const handleDaySelect = (dateStr) => {
    // Als je op dezelfde dag klikt = deselect
    if (selectedDate === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
    }
  };

  // Handler for New Shift (Empty Slot Click)
  const handleNewShift = (date) => {
    setQuickPlanDate(date);
    setQuickPlanEmployee(null);
    setEditShift(null);
  };

  // Handler for Edit Shift (Shift Click)
  const handleEditShift = (shift) => {
    setEditShift(shift);
    setQuickPlanDate(null); // Not needed for edit
    setQuickPlanEmployee(null);
  };

  // Drag & Drop Handlers
  const handleEmployeeDrop = (employeeData, date) => {
    setQuickPlanEmployee(employeeData);
    setQuickPlanDate(date);
    setEditShift(null);
  };

  const handleEmployeeDoubleClick = (employeeId) => {
    // Voor dubbel-klik openen we de availability detail popup
    setSelectedEmployeeId(employeeId);
  };

  const handleQuickPlanClose = () => {
    setQuickPlanEmployee(null);
    setQuickPlanDate(null);
    setEditShift(null);
  };

  const handleReviewSwap = (swap) => {
    setSelectedSwap(swap);
    setShowSwapModal(true);
  };

  const handleCloseSwapModal = () => {
    setShowSwapModal(false);
    setSelectedSwap(null);
    setResponseMessage("");
  };

  const handleSwapAction = (action) => {
    swapActionMutation.mutate(
      {
        swapId: selectedSwap.id,
        action,
        message: responseMessage.trim() || null,
        newEmployeeId: selectedSwap.target_employee_id, // Pass target if exists
      },
      {
        onSuccess: handleCloseSwapModal,
      },
    );
  };

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  if (userLoading || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
          <div
            className={`flex flex-col gap-4 transition-all ${isCollapsed ? "mb-0" : "mb-4"}`}
          >
            <PlanningHeader
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
              onOpenAvailabilityStatus={() => setShowAvailabilityStatus(true)}
            />

            {!isCollapsed && (
              <PlanningControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filteredShiftsCount={filteredShifts.length}
                gridView={gridView}
                onGridViewChange={setGridView}
                currentWeek={currentWeek}
                currentDate={currentDate}
                onPreviousWeek={previousWeek}
                onNextWeek={nextWeek}
                onPreviousDay={previousDay}
                onNextDay={nextDay}
                isPlannerOrAdmin={isPlannerOrAdmin}
              />
            )}
          </div>

          {isPlannerOrAdmin && (
            <>
              {/* Show ACTUAL open shifts (created but empty), not theoretical gaps */}
              <GapsWarning
                gaps={shifts.filter(s => !s.employee_id)}
                isExpanded={gapsExpanded}
                onToggle={() => setGapsExpanded(!gapsExpanded)}
              />
              <SwapRequestsPanel
                pendingSwaps={pendingSwaps}
                isExpanded={swapsExpanded}
                onToggle={() => setSwapsExpanded(!swapsExpanded)}
                onReviewSwap={handleReviewSwap}
              />
            </>
          )}
        </div>
      </div>

      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {gridView === "day" ? (
                <DayView
                  currentDate={currentDate}
                  shifts={filteredShifts}
                  searchQuery={searchQuery}
                  onDeleteShift={setDeleteId}
                  isPlannerOrAdmin={isPlannerOrAdmin}
                  onEmployeeDrop={handleEmployeeDrop}
                  onEditShift={handleEditShift}
                  onNewShift={handleNewShift}
                  useEmployeeAvailability={useEmployeeAvailability}
                  onEmployeeClick={setSelectedEmployeeId}
                />
              ) : (
                <WeekView
                  currentWeek={currentWeek}
                  shifts={filteredShifts}
                  onDeleteShift={setDeleteId}
                  onDayClick={handleDaySelect}
                  selectedDate={selectedDate}
                  isPlannerOrAdmin={isPlannerOrAdmin}
                  onEmployeeDrop={handleEmployeeDrop}
                  onEditShift={handleEditShift}
                  onNewShift={handleNewShift}
                  useEmployeeAvailability={useEmployeeAvailability}
                  onEmployeeClick={setSelectedEmployeeId}
                />
              )}
            </div>

            {isPlannerOrAdmin && (
              <>
                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                  <AvailabilitySidebar
                    weekStart={getMonday(currentDate)}
                    selectedDate={selectedDate}
                    shifts={filteredShifts}
                    onEmployeeClick={setSelectedEmployeeId}
                    onEmployeeDragStart={(employee) => {
                      console.log("Dragging:", employee.name);
                    }}
                  />
                </div>

                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center gap-2"
                >
                  <Users size={24} />
                  <span className="font-bold">Medewerkers</span>
                </button>

                {/* Mobile Sidebar Drawer */}
                {isMobileSidebarOpen && (
                  <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                      className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                      <div className="p-4 flex justify-between items-center border-b">
                        <h3 className="font-bold text-lg">Beschikbaarheid</h3>
                        <button onClick={() => setIsMobileSidebarOpen(false)}>
                          <X size={24} />
                        </button>
                      </div>
                      <div className="p-4 overflow-y-auto h-full pb-20">
                        <AvailabilitySidebar
                          weekStart={getMonday(currentDate)}
                          selectedDate={selectedDate}
                          shifts={filteredShifts}
                          onEmployeeClick={(id) => {
                            setSelectedEmployeeId(id);
                            setIsMobileSidebarOpen(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {(quickPlanDate || editShift || quickPlanEmployee) && (
        <QuickPlanModal
          employee={quickPlanEmployee}
          prefilledDate={quickPlanDate}
          shift={editShift}
          onClose={handleQuickPlanClose}
          onSuccess={handleQuickPlanClose}
        />
      )}

      {deleteId && (
        <DeleteModal
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            deleteShiftMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }}
          isPending={deleteShiftMutation?.isPending}
        />
      )}

      {showSwapModal && selectedSwap && (
        <SwapApprovalModal
          swap={selectedSwap}
          responseMessage={responseMessage}
          onResponseMessageChange={setResponseMessage}
          onApprove={() => handleSwapAction("approve")}
          onReject={() => handleSwapAction("reject")}
          onClose={handleCloseSwapModal}
          isPending={swapActionMutation.isPending}
          error={swapActionMutation.error}
        />
      )}

      {selectedEmployeeId && (
        <EmployeeDetailDrawer
          employeeId={selectedEmployeeId}
          weekStart={getMonday(currentDate)}
          onClose={() => setSelectedEmployeeId(null)}
          isPlannerOrAdmin={isPlannerOrAdmin}
        />
      )}

      {showAvailabilityStatus && (
        <AvailabilityStatusModal onClose={() => setShowAvailabilityStatus(false)} />
      )}
    </div>
  );
}
