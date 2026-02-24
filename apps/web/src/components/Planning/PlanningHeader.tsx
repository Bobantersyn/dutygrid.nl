import { Plus, BarChart2, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PlanningHeader({ isCollapsed, onToggleCollapse, onOpenAvailabilityStatus }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weekplanning</h1>
        <p className="text-sm text-gray-500 mt-1">
          Beheer je roosters, beschikbaarheid en ruildiensten.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          onClick={onToggleCollapse}
        >
          <Filter size={16} className="mr-2 text-gray-400" />
          {isCollapsed ? "Toon Filters" : "Verberg Filters"}
        </Button>

        <Button
          variant="secondary"
          onClick={onOpenAvailabilityStatus}
        >
          <BarChart2 size={16} className="mr-2 text-gray-400" />
          Status
        </Button>

        {/* The single primary CTA for this page */}
        <Button
          variant="primary"
          onClick={() => window.location.href = "/planning/new"}
        >
          <Plus size={16} className="mr-2" />
          Nieuwe Dienst
        </Button>
      </div>
    </div>
  );
}
