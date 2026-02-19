import { Plus } from "lucide-react";
import NotificationBell from "../NotificationBell";


export function PlanningHeader({ isCollapsed, onToggleCollapse, onOpenAvailabilityStatus }) {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">

            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm inline-block flex items-center gap-2"
            >
              ← Terug naar Dashboard
            </a>
            <div className="md:hidden">
              <NotificationBell />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
          <p className="text-gray-600 mt-1">
            Beheer je weekplanning met geavanceerde features
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onToggleCollapse}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
          >
            {isCollapsed ? "Toon Opties ▼" : "Verberg Opties ▲"}
          </button>
          <a
            href="/planning/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nieuwe Dienst
          </a>
          <button
            onClick={onOpenAvailabilityStatus}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <span className="hidden sm:inline">Invulstatus</span>
            <span className="sm:hidden">Status</span>
          </button>
          <div className="hidden md:block">
            <NotificationBell />
          </div>
        </div>
      </div>
    </>
  );
}
