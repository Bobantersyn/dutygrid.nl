import { X } from "lucide-react";
import { PlanningControls } from "./PlanningControls";

export function MobileFilterSheet({
    isOpen,
    onClose,
    searchQuery,
    onSearchChange,
    filteredShiftsCount,
    gridView,
    onGridViewChange,
    currentWeek,
    currentDate,
    onPreviousWeek,
    onNextWeek,
    onPreviousDay,
    onNextDay,
    isPlannerOrAdmin,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={onClose}
            ></div>

            {/* Bottom Sheet Slider */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Weergave & Filters</h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Re-use the existing Planning Controls but forced into a single column on mobile */}
                <div className="space-y-6">
                    <PlanningControls
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                        filteredShiftsCount={filteredShiftsCount}
                        gridView={gridView}
                        onGridViewChange={onGridViewChange}
                        currentWeek={currentWeek}
                        currentDate={currentDate}
                        onPreviousWeek={onPreviousWeek}
                        onNextWeek={onNextWeek}
                        onPreviousDay={onPreviousDay}
                        onNextDay={onNextDay}
                        isPlannerOrAdmin={isPlannerOrAdmin}
                    />
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 py-3 bg-blue-600 text-white font-bold rounded-xl active:bg-blue-700 transition-colors"
                >
                    Toepassen
                </button>
            </div>
        </div>
    );
}
