import { Plus, BarChart2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlanningHeader({ isCollapsed, onToggleCollapse, onOpenAvailabilityStatus, onOpenMobileFilters, isPlannerOrAdmin }: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenAvailabilityStatus?: () => void;
  onOpenMobileFilters?: () => void;
  isPlannerOrAdmin?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weekplanning</h1>
          <p className="text-sm text-gray-500 mt-1">
            Beheer je roosters, beschikbaarheid en ruildiensten.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {/* Status chip (green, small, clickable) next to title block */}
          <button
            onClick={onOpenAvailabilityStatus}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-full text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Invulstatus
          </button>

          {/* NEW: Leave Requests Button */}
          <button
            onClick={() => window.location.href = isPlannerOrAdmin ? '/planning/verlof' : '/beschikbaarheid/verlof'}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-full text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            Verlofaanvragen
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* Desktop Filter Toggle */}
        <Button
          variant="secondary"
          onClick={onToggleCollapse}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hidden lg:flex flex-1 md:flex-none justify-center"
        >
          <Filter size={16} className="mr-2 text-gray-500" />
          {isCollapsed ? "Filters Tonen" : "Filters Verbergen"}
        </Button>

        {/* Mobile Filter Sheet Toggle */}
        <Button
          variant="secondary"
          onClick={onOpenMobileFilters}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 lg:hidden flex-1 justify-center"
        >
          <Filter size={16} className="mr-2 text-gray-500" />
          Weergave / Filters
        </Button>

        {/* The single primary CTA for this page */}
        <Button
          variant="primary"
          onClick={() => window.location.href = "/planning/new"}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-1 md:flex-none justify-center"
        >
          <Plus size={16} className="mr-2" />
          Nieuwe Dienst
        </Button>
      </div>
    </div>
  );
}
