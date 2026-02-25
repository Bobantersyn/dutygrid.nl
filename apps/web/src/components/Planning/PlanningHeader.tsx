import { Plus, BarChart2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlanningHeader({ isCollapsed, onToggleCollapse, onOpenAvailabilityStatus }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weekplanning</h1>
          <p className="text-sm text-gray-500 mt-1">
            Beheer je roosters, beschikbaarheid en ruildiensten.
          </p>
        </div>

        {/* Status chip (green, small, clickable) next to title block */}
        <button
          onClick={onOpenAvailabilityStatus}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-full text-xs font-medium transition-colors cursor-pointer mt-1 sm:mt-0"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          Invulstatus
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          onClick={onToggleCollapse}
          className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Filter size={16} className="mr-2 text-gray-500" />
          {isCollapsed ? "Filters Tonen" : "Filters Verbergen"}
        </Button>

        {/* The single primary CTA for this page */}
        <Button
          variant="primary"
          onClick={() => window.location.href = "/planning/new"}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Nieuwe Dienst
        </Button>
      </div>
    </div>
  );
}
